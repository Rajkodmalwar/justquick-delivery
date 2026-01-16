import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { delivery_boy_id } = body

    if (!delivery_boy_id) {
      return NextResponse.json(
        { error: "Delivery boy ID required" },
        { status: 400 }
      )
    }

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // ✅ Validate delivery boy is assigned to this order
    if (order.delivery_boy_id !== delivery_boy_id) {
      return NextResponse.json(
        { 
          error: "Forbidden", 
          details: "You are not assigned to deliver this order" 
        },
        { status: 403 }
      )
    }

    // ✅ Must be in READY state
    if (order.status !== "ready") {
      return NextResponse.json(
        { 
          error: "Invalid order state", 
          details: `Order must be 'ready' to pick up (current: ${order.status})` 
        },
        { status: 400 }
      )
    }

    // ✅ Atomic update
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "picked_up",
        timeline: [
          ...(order.timeline || []),
          {
            status: "picked_up",
            action: "Order Picked Up",
            description: "Delivery partner has picked up the order",
            timestamp: new Date().toISOString(),
            actor: "delivery",
            actor_id: delivery_boy_id,
            metadata: { otp_verified: false }
          }
        ]
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

    return NextResponse.json(
      { 
        success: true, 
        order: updatedOrder,
        message: "Order marked as picked up successfully" 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Pickup error:", error)
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    )
  }
}