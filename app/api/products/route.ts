import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

// =============================
// PUBLIC PRODUCT FETCH
// =============================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop_id = searchParams.get("shop_id");

    console.log("🔄 GET /api/products called, shop_id:", shop_id);

    const supabase = await getSupabaseServer();
    let query = supabase.from("products").select("*");

    if (shop_id) {
      query = query.eq("shop_id", shop_id);
    }

    const { data, error } = await query.order("name");

    if (error) {
      console.error("❌ Error fetching products:", error);
      return NextResponse.json({ 
        error: error.message,
        products: [] 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      products: data || [] 
    });
    
  } catch (error: any) {
    console.error("💥 UNEXPECTED ERROR in products GET:", error);
    return NextResponse.json({ 
      error: error.message,
      products: [] 
    }, { status: 500 });
  }
}

// =============================
// ADMIN ONLY: ADD PRODUCT
// =============================
export async function POST(req: Request) {
  try {
    // Step 1: Check if user is admin
    const supabaseUser = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ 
        error: "Access denied: Admin only", 
        details: "You must be logged in as admin to add products"
      }, { status: 403 });
    }

    console.log("✅ Admin authenticated:", user.email);

    // Step 2: Parse request
    const body = await req.json();
    
    console.log("📦 Request body:", JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.shop_id || !body.name || body.price === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: "shop_id, name, and price are required" 
      }, { status: 400 });
    }

    // Step 3: Use admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Build product object - only include photo if it's not empty
    const productData: any = {
      shop_id: body.shop_id,
      name: body.name,
      price: body.price,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Only add photo if it has a value
    if (body.photo && body.photo.trim()) {
      productData.photo = body.photo;
    }
    
    console.log("🔧 Inserting product:", JSON.stringify(productData, null, 2));
    
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single();
    
    if (error) {
      console.error("❌ Product creation error:", error);
      console.error("📊 Error code:", error.code);
      console.error("📊 Error details:", error.details);
      console.error("📊 Error hint:", error.hint);
      return NextResponse.json({ 
        error: "Failed to create product", 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    console.log("✅ Product created:", product.id);
    return NextResponse.json({ product });
    
  } catch (error: any) {
    console.error("💥 Product API error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}

// =============================
// ADMIN ONLY: UPDATE PRODUCT STATUS
// =============================
export async function PATCH(req: Request) {
  try {
    // Step 1: Check if user is admin
    const supabaseUser = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ 
        error: "Access denied: Admin only",
        details: "You must be logged in as admin to update products"
      }, { status: 403 });
    }

    console.log("✅ Admin authenticated:", user.email);

    // Step 2: Parse request
    const body = await req.json();
    const { id, is_available } = body;

    if (!id || is_available === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: "id and is_available are required" 
      }, { status: 400 });
    }

    // Step 3: Use admin client
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ 
        is_available,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Product update error:", error);
      return NextResponse.json({ 
        error: "Failed to update product", 
        details: error.message 
      }, { status: 500 });
    }

    console.log("✅ Product updated:", id);
    return NextResponse.json({ product: data });

  } catch (error: any) {
    console.error("💥 Product PATCH error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}

// =============================
// DELETE PRODUCT
// =============================
export async function DELETE(req: Request) {
  try {
    // Step 1: Check if user is admin
    const supabaseUser = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ 
        error: "Access denied: Admin only",
        details: "You must be logged in as admin to delete products"
      }, { status: 403 });
    }

    console.log("✅ Admin authenticated:", user.email);

    // Step 2: Get product ID from query params
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ 
        error: "Product ID is required",
        details: "Please provide a product ID to delete" 
      }, { status: 400 });
    }

    // Step 3: Use admin client
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Product deletion error:", error);
      return NextResponse.json({ 
        error: "Failed to delete product", 
        details: error.message 
      }, { status: 500 });
    }

    console.log("✅ Product deleted:", id);
    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully" 
    });

  } catch (error: any) {
    console.error("💥 Product DELETE error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}