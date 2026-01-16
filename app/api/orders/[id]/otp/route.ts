import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { commissionFromDistanceKm, haversineKm } from "@/lib/geo"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { otp, delivery_boy_id } = await req.json()

    if (!delivery_boy_id) {
      return NextResponse.json({ error: "Delivery boy ID required" }, { status: 400 })
    }

    // ✅ Get order without auth
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()
      
    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // ✅ Validate assignment
    if (order.delivery_boy_id !== delivery_boy_id) {
      return NextResponse.json({ error: "This order is not assigned to you" }, { status: 403 })
    }

    if (order.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    const km = haversineKm(
      { lat: order.shop_lat, lng: order.shop_lng }, 
      { lat: order.buyer_lat, lng: order.buyer_lng }
    )
    const amount = commissionFromDistanceKm(km)

    // Update order -> delivered
    const { error: upErr } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", order.id)
      
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    // Create commission row
    if (order.delivery_boy_id) {
      const { error: cErr } = await supabase
        .from("commissions")
        .insert({
          delivery_boy_id: order.delivery_boy_id,
          order_id: order.id,
          amount,
          paid_status: "unpaid",
        })
        
      if (cErr) {
        return NextResponse.json({ error: cErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, amount })
    
  } catch (error: any) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}