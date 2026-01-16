// app/api/orders/admin/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    // Step 1: Check if user is admin
    const supabaseUser = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ 
        error: "Access denied: Admin only",
        details: "You must be logged in as admin to view orders" 
      }, { status: 403 });
    }

    console.log("✅ Admin authenticated:", user.email);

    // Step 2: Get query params
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const shop_id = url.searchParams.get("shop_id");
    const limit = url.searchParams.get("limit") || "50";

    // Step 3: Use admin client to fetch all orders
    const supabaseAdmin = getSupabaseAdmin();
    
    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        shops(name, contact),
        delivery_boys(name, phone)
      `);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    
    if (shop_id) {
      query = query.eq("shop_id", shop_id);
    }

    // Get orders
    const { data: orders, error } = await query
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error("❌ Error fetching orders:", error);
      return NextResponse.json({ 
        error: "Failed to fetch orders", 
        details: error.message,
        orders: []
      }, { status: 500 });
    }

    console.log(`✅ Found ${orders?.length || 0} orders for admin`);
    return NextResponse.json({ 
      success: true,
      orders: orders || [] 
    });

  } catch (error: any) {
    console.error("💥 Admin orders GET error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message,
      orders: []
    }, { status: 500 });
  }
}