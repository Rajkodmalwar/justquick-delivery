import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { generateLoginCode } from "@/lib/utils/generate-code";

// =============================
// PUBLIC SHOP FETCH
// =============================
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const loginCode = searchParams.get("login_code");

  const supabase = await getSupabaseServer();

  if (loginCode) {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("login_code", loginCode)
      .single();

    if (error) return NextResponse.json({ error: "Invalid login code" }, { status: 404 });
    return NextResponse.json({ shop: data });
  }

  if (id) {
    const { data, error } = await supabase.from("shops").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ shop: data });
  }

  // Check if user is admin - return all shops
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  
  let query = supabase.from("shops").select("*");
  
  // If not admin, return all shops (or filter if needed)
  const { data, error } = await query.order("name");
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shops: data });
}

// =============================
// ADMIN ONLY: CREATE SHOP
// =============================
export async function POST(req: Request) {
  try {
    // Step 1: Check if user is admin
    const supabaseUser = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ 
        error: "Access denied: Admin only", 
        details: "You must be logged in as admin to perform this action"
      }, { status: 403 });
    }

    console.log("✅ Admin authenticated:", user.email);

    // Step 2: Parse request
    const payload = await req.json();

    // Step 3: Use admin client for database operations
    const supabaseAdmin = getSupabaseAdmin();

    // Generate unique login code
    let loginCode = generateLoginCode();
    for (let i = 0; i < 6; i++) {
      const { data: exist } = await supabaseAdmin
        .from("shops")
        .select("id")
        .eq("login_code", loginCode)
        .single();
      if (!exist) break;
      loginCode = generateLoginCode();
    }

    // Step 4: Insert shop
    const { data, error } = await supabaseAdmin
      .from("shops")
      .insert({
        name: payload.name,
        contact: payload.contact || null,
        address: payload.address || null,
        shop_type: payload.shop_type || "grocery",
        seller_name: payload.seller_name || null,
        owner_name: payload.owner_name || null,
        owner_phone: payload.owner_phone || null,
        description: payload.description || null,
        photo: payload.photo || null,
        login_code: loginCode,
        lat: payload.lat || 0,
        lng: payload.lng || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Shop creation error:", error);
      return NextResponse.json({ 
        error: "Failed to create shop", 
        details: error.message 
      }, { status: 500 });
    }

    console.log("✅ Shop created:", data.id);
    return NextResponse.json({ shop: data });

  } catch (error: any) {
    console.error("💥 UNEXPECTED ERROR in shops POST:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}