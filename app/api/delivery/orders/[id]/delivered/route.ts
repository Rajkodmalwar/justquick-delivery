import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { timelineHelpers } from "@/lib/order-timeline"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const body = await request.json()
    const { otp } = body

    if (!otp) {
      return NextResponse.json(
        { error: "OTP is required for delivery confirmation" },
        { status: 400 }
      )
    }

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
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

    // Verify OTP
    if (otp !== order.otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // Add to timeline
    await timelineHelpers.delivered(
      id,
      session.user.id,
      session.user.user_metadata?.name || "Delivery Partner",
      true
    )

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "delivered",
        delivered_at: new Date().toISOString(),
        otp_verified_at: new Date().toISOString(),
        payment_status: order.payment_type === "COD" ? "paid" : order.payment_status
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

    // Send notifications
    await Promise.all([
      // Notify buyer
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: "user",
          target_id: order.buyer_id,
          title: "Order Delivered",
          message: `Your order #${id.slice(0, 8)} has been delivered successfully`,
          metadata: { order_id: id, status: "delivered" }
        }),
      }),
      // Notify admin
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: "admin",
          title: "Order Delivered",
          message: `Order #${id.slice(0, 8)} has been delivered by ${session.user.user_metadata?.name || "Delivery Partner"}`,
          metadata: { order_id: id, status: "delivered", delivery_boy_id: session.user.id }
        }),
      })
    ])

    return NextResponse.json(
      { 
        success: true, 
        order: updatedOrder,
        message: "Order delivered successfully" 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Delivery error:", error)
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    )
  }
}