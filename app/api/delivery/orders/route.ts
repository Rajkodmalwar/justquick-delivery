import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const deliveryBoyId = searchParams.get("delivery_boy_id")
    
    // Also check header for backward compatibility
    const headerId = req.headers.get("x-delivery-id")
    const finalId = deliveryBoyId || headerId

    if (!finalId) {
      return NextResponse.json({ 
        orders: [], 
        error: "Delivery boy ID required" 
      }, { status: 400 })
    }

    // ✅ NO AUTH CHECK - fetch directly by delivery_boy_id
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("delivery_boy_id", finalId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("DELIVERY FETCH ERROR:", error)
      return NextResponse.json({ orders: [] }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
    
  } catch (error: any) {
    console.error("Delivery orders error:", error)
    return NextResponse.json({ orders: [] }, { status: 500 })
  }
}