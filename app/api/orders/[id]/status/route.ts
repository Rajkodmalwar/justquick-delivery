import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const body = await request.json()
    const { 
      status, 
      actor, 
      actor_name, 
      actor_id,
      reason 
    } = body

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
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

    // MUST BE ADMIN
    const userRole = session.user.user_metadata?.role
    if (userRole !== "admin") {
      return NextResponse.json(
        { 
          error: "Forbidden", 
          details: "Only admin can update order status" 
        },
        { status: 403 }
      )
    }

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (orderError) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // 🔴 HARD BLOCK: Admin cannot update delivery statuses
    if (["picked_up", "delivered"].includes(status)) {
      return NextResponse.json(
        { 
          error: "Forbidden", 
          details: "Admin cannot update delivery status. Use separate endpoints for delivery actions." 
        },
        { status: 403 }
      )
    }

    // ✅ STRICT ADMIN STATUS FLOW
    const validAdminTransitions: Record<string, string[]> = {
      pending: ["accepted", "rejected"],
      accepted: ["ready"],
      ready: [] // Admin cannot change ready status further
    }

    // Check if transition is valid
    const currentStatus = order.status
    const allowedNextStatuses = validAdminTransitions[currentStatus] || []

    if (!allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: "Invalid status transition", 
          details: `Admin cannot change status from ${currentStatus} to ${status}. Allowed: ${allowedNextStatuses.join(", ") || "none"}`
        },
        { status: 400 }
      )
    }

    const actorName = actor_name || session.user.user_metadata?.name || "Admin"
    const actorId = actor_id || session.user.id

    // ✅ PREPARE ATOMIC UPDATE PAYLOAD (Status + Timeline Together)
    const timelineEntry = {
      status,
      action: "",
      description: "",
      timestamp: new Date().toISOString(),
      actor: "admin" as const,
      actor_id: actorId,
      actor_name: actorName
    }

    // Set appropriate timeline details
    switch (status) {
      case "accepted":
        timelineEntry.action = "Order Accepted"
        timelineEntry.description = "Shop has accepted the order and started preparing"
        break
      case "rejected":
        timelineEntry.action = "Order Rejected"
        timelineEntry.description = reason || "Order has been rejected by the shop"
        break
      case "ready":
        timelineEntry.action = "Order Ready"
        timelineEntry.description = "Order is ready for pickup"
        break
    }

    // ✅ ATOMIC UPDATE: Status + Timeline in ONE operation
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status,
        timeline: [...(order.timeline || []), timelineEntry]
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Atomic update failed:", updateError)
      return NextResponse.json(
        { error: "Failed to update order", details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Admin updated order ${id}: ${order.status} → ${status}`)
    return NextResponse.json(
      { 
        success: true, 
        order: updatedOrder,
        message: `Order status updated to ${status}` 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Status update error:", error)
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    )
  }
}