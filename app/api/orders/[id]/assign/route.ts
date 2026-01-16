import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { delivery_boy_id, delivery_name } = await request.json()

    if (!delivery_boy_id) {
      return NextResponse.json({ error: "delivery_boy_id required" }, { status: 400 })
    }

    // 1️⃣ Fetch order
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // 2️⃣ Prevent double assignment
    if (order.delivery_boy_id) {
      return NextResponse.json({ error: "Order already assigned" }, { status: 400 })
    }

    // 3️⃣ Assign delivery + timeline (ATOMIC)
    const { data, error } = await supabase
      .from("orders")
      .update({
        delivery_boy_id,
        status: "ready",
        timeline: [
          ...(order.timeline || []),
          {
            status: "ready",
            action: "Delivery Assigned",
            description: `Assigned to ${delivery_name}`,
            timestamp: new Date().toISOString(),
            actor: "admin"
          }
        ]
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("ASSIGN ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (e: any) {
    console.error("SERVER ERROR:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
