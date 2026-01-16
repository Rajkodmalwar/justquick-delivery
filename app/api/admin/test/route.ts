// app/api/admin/test/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabaseUser = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    const adminClient = getSupabaseAdmin();
    
    // Test fetching all orders
    const { data: orders, error: ordersError } = await adminClient
      .from("orders")
      .select("*")
      .limit(5);
    
    // Test fetching all shops
    const { data: shops, error: shopsError } = await adminClient
      .from("shops")
      .select("*")
      .limit(5);
    
    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        role: user?.user_metadata?.role,
        isAdmin: user?.user_metadata?.role === "admin"
      },
      authError: authError?.message,
      orders: {
        count: orders?.length || 0,
        error: ordersError?.message,
        sample: orders?.[0]
      },
      shops: {
        count: shops?.length || 0,
        error: shopsError?.message,
        sample: shops?.[0]
      },
      message: "Admin test completed"
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}