import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { commissionFromDistanceKm, haversineKm } from "@/lib/geo"

export async function POST() {
  const supabase = await getSupabaseServer()
  const { data: orders, error } = await supabase.from("orders").select("*").eq("status", "delivered")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  for (const o of orders || []) {
    if (!o.delivery_boy_id) continue
    const km = haversineKm({ lat: o.shop_lat, lng: o.shop_lng }, { lat: o.buyer_lat, lng: o.buyer_lng })
    const amount = commissionFromDistanceKm(km)
    await supabase.from("commissions").upsert(
      {
        delivery_boy_id: o.delivery_boy_id,
        order_id: o.id,
        amount,
        paid_status: "unpaid",
      },
      { onConflict: "order_id" },
    )
  }
  return NextResponse.json({ ok: true })
}
