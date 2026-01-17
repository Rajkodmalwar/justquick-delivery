import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { timelineHelpers } from "@/lib/order-timeline"

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const body = await request.json()
    const { otp } = body

    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error("Cookie error:", error)
            }
          },
        },
      }
    )

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Verify delivery boy has access to this order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("delivery_boy_id", session.user.id)
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: "Order not found or you are not assigned to this order" },
        { status: 404 }
      )
    }

    // Verify OTP if provided
    const otpVerified = otp && otp === order.otp
    
    if (otp && !otpVerified) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // Add to timeline
    await timelineHelpers.pickedUp(
      id,
      session.user.id,
      session.user.user_metadata?.name || "Delivery Partner",
      otpVerified
    )

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "picked_up",
        ...(otpVerified && { otp_verified_at: new Date().toISOString() })
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order", details: updateError.message },
        { status: 500 }
      )
    }

    // Send notification to buyer
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_type: "user",
        target_id: order.buyer_id,
        title: "Order Picked Up",
        message: `Your order #${id.slice(0, 8)} has been picked up by the delivery partner`,
        metadata: { order_id: id, status: "picked_up" }
      }),
    })

    return NextResponse.json(
      { 
        success: true, 
        order: updatedOrder,
        message: otpVerified 
          ? "Order picked up with OTP verified" 
          : "Order marked as picked up"
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Picked up error:", error)
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    )
  }
}