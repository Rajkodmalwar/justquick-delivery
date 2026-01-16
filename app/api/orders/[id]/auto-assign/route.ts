// /app/api/orders/auto-assign/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // ✅ Now correctly fetches "accepted" orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "accepted")
      .is("delivery_boy_id", null)

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ ok: true, assigned: 0 })
    }

    const { data: drivers } = await supabase
      .from("delivery_boys")
      .select("*")
      .eq("is_available", true)

    if (!drivers || drivers.length === 0) {
      return NextResponse.json({ ok: true, assigned: 0 })
    }

    let assigned = 0

    for (const order of orders) {
      const driver = drivers[assigned % drivers.length]

      if (order.delivery_boy_id || order.status !== "accepted") continue

      // ✅ Now updates to "assigned" which is valid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          delivery_boy_id: driver.id,
          status: "assigned", // ✅ Valid status
          timeline: [
            ...(order.timeline || []),
            {
              action: "delivery_assigned",
              actor: "system",
              timestamp: new Date().toISOString(),
              metadata: { driver_id: driver.id }
            }
          ]
        })
        .eq("id", order.id)
        .eq("status", "accepted")
        .is("delivery_boy_id", null)

      if (updateError) {
        console.error("Auto-assign update error:", updateError)
        continue
      }

      assigned++
    }

    return NextResponse.json({ ok: true, assigned })

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}