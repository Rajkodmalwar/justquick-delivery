import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface TimelineEntry {
  status: string
  action: string
  description: string
  timestamp: string
  actor: "buyer" | "admin" | "delivery" | "system" | "shop"
  actor_id?: string
  actor_name: string
  metadata?: Record<string, any>
}

export async function addTimelineEntry(
  orderId: string,
  entry: TimelineEntry
) {
  try {
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

    // Get current timeline
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("timeline")
      .eq("id", orderId)
      .single()

    if (fetchError) {
      console.error("Error fetching order:", fetchError)
      return { error: fetchError }
    }

    // Update timeline
    const currentTimeline = order.timeline || []
    const updatedTimeline = [...currentTimeline, entry]

    const { data, error } = await supabase
      .from("orders")
      .update({ 
        timeline: updatedTimeline,
        status: entry.status // Update order status
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("Error updating timeline:", error)
      return { error }
    }

    console.log(`✅ Timeline updated for order ${orderId}:`, entry.action)
    
    // Send realtime update
    await supabase.channel(`order-${orderId}`).send({
      type: 'broadcast',
      event: 'timeline_update',
      payload: { entry, newStatus: entry.status }
    })

    return { data }
    
  } catch (error: any) {
    console.error("Timeline error:", error)
    return { error }
  }
}

// Helper functions for common timeline entries
export const timelineHelpers = {
  async orderPlaced(orderId: string, buyerId: string, buyerName: string) {
    return await addTimelineEntry(orderId, {
      status: "pending",
      action: "Order Placed",
      description: "Order has been placed and waiting for shop confirmation",
      timestamp: new Date().toISOString(),
      actor: "buyer",
      actor_id: buyerId,
      actor_name: buyerName
    })
  },

  async adminAccepted(orderId: string, adminId: string, adminName: string) {
    return await addTimelineEntry(orderId, {
      status: "accepted",
      action: "Order Accepted",
      description: "Shop has accepted the order and started preparing",
      timestamp: new Date().toISOString(),
      actor: "admin",
      actor_id: adminId,
      actor_name: adminName,
      metadata: { role: "admin" }
    })
  },

  async orderReady(orderId: string, adminId: string, adminName: string) {
    return await addTimelineEntry(orderId, {
      status: "ready",
      action: "Order Ready",
      description: "Order is ready for pickup",
      timestamp: new Date().toISOString(),
      actor: "admin",
      actor_id: adminId,
      actor_name: adminName,
      metadata: { role: "admin" }
    })
  },

  async deliveryAssigned(orderId: string, deliveryBoyId: string, deliveryName: string, adminName: string) {
    return await addTimelineEntry(orderId, {
      status: "ready",
      action: "Delivery Assigned",
      description: `Order assigned to delivery partner ${deliveryName}`,
      timestamp: new Date().toISOString(),
      actor: "admin",
      actor_name: adminName,
      metadata: { 
        delivery_boy_id: deliveryBoyId,
        delivery_name: deliveryName 
      }
    })
  },

  async pickedUp(orderId: string, deliveryBoyId: string, deliveryName: string, otpVerified: boolean = false) {
    return await addTimelineEntry(orderId, {
      status: "picked_up",
      action: "Order Picked Up",
      description: `Delivery partner ${deliveryName} has picked up the order${otpVerified ? ' (OTP verified)' : ''}`,
      timestamp: new Date().toISOString(),
      actor: "delivery",
      actor_id: deliveryBoyId,
      actor_name: deliveryName,
      metadata: { otp_verified: otpVerified }
    })
  },

  async onTheWay(orderId: string, deliveryBoyId: string, deliveryName: string) {
    return await addTimelineEntry(orderId, {
      status: "picked_up", // Same status but different action
      action: "On the Way",
      description: `Delivery partner ${deliveryName} is on the way to deliver`,
      timestamp: new Date().toISOString(),
      actor: "delivery",
      actor_id: deliveryBoyId,
      actor_name: deliveryName
    })
  },

  async delivered(orderId: string, deliveryBoyId: string, deliveryName: string, otpVerified: boolean = true) {
    return await addTimelineEntry(orderId, {
      status: "delivered",
      action: "Order Delivered",
      description: `Order has been successfully delivered${otpVerified ? ' (OTP verified)' : ''}`,
      timestamp: new Date().toISOString(),
      actor: "delivery",
      actor_id: deliveryBoyId,
      actor_name: deliveryName,
      metadata: { otp_verified: otpVerified }
    })
  },

  async orderRejected(orderId: string, adminId: string, adminName: string, reason?: string) {
    return await addTimelineEntry(orderId, {
      status: "rejected",
      action: "Order Rejected",
      description: reason || "Order has been rejected by the shop",
      timestamp: new Date().toISOString(),
      actor: "admin",
      actor_id: adminId,
      actor_name: adminName,
      metadata: { reason }
    })
  }
}