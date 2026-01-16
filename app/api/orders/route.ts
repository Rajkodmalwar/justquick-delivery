import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 ORDER API: Starting order creation...")
    
    const cookieStore = await cookies()
    
    // Use simplified cookie handling for API routes
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("🔴 Auth error:", authError)
      return NextResponse.json(
        { 
          error: "Authentication failed", 
          details: authError.message,
          code: "AUTH_ERROR"
        },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.error("🔴 No user found")
      return NextResponse.json(
        { 
          error: "Authentication required. Please log in.",
          code: "NO_USER"
        },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated:", { id: user.id, email: user.email })
    
    // ============================================
    // 2. PARSE REQUEST BODY
    // ============================================
    const body = await request.json()
    
    const { 
      shop_id, 
      products, 
      total_price, 
      delivery_cost = 0,
      payment_type = "COD", // Default to COD
      shop_lat = 0,
      shop_lng = 0,
      buyer_phone,
      buyer_address = ""
    } = body

    // ============================================
    // 3. VALIDATE REQUIRED FIELDS
    // ============================================
    if (!shop_id) {
      return NextResponse.json(
        { error: "Shop ID is required" },
        { status: 400 }
      )
    }
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required" },
        { status: 400 }
      )
    }

    // ============================================
    // 4. VALIDATE PAYMENT TYPE (CRITICAL FIX)
    // ============================================
    // Based on your check constraint, payment_type must be 'COD' or 'ONLINE'
    const validPaymentTypes = ['COD', 'ONLINE']
    const normalizedPaymentType = (payment_type || "").toString().toUpperCase()
    
    if (!validPaymentTypes.includes(normalizedPaymentType)) {
      console.error("❌ Invalid payment_type:", payment_type)
      return NextResponse.json(
        { 
          error: "Invalid payment type",
          details: `Payment type must be one of: ${validPaymentTypes.join(', ')}`,
          received: payment_type
        },
        { status: 400 }
      )
    }

    // ============================================
    // 5. VERIFY SHOP EXISTS
    // ============================================
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, name')
      .eq('id', shop_id)
      .single()

    if (shopError || !shop) {
      console.error("❌ Shop verification failed:", shopError)
      return NextResponse.json(
        { 
          error: "Shop not found",
          details: `Shop with ID ${shop_id} does not exist`
        },
        { status: 404 }
      )
    }

    // ============================================
    // 6. GET USER PROFILE DATA
    // ============================================
    let buyerName = user.user_metadata?.name || user.email?.split('@')[0] || "Customer"
    let buyerPhone = buyer_phone || ""
    let buyerAddress = buyer_address || ""

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, phone, address')
        .eq('id', user.id)
        .single()

      if (!profileError && profile) {
        console.log("✅ Found user profile:", profile)
        if (profile.name) buyerName = profile.name
        if (!buyerPhone && profile.phone) buyerPhone = profile.phone
        if (!buyerAddress && profile.address) buyerAddress = profile.address
      } else if (profileError) {
        console.log("⚠️ Profile not found, using defaults:", profileError.message)
      }
    } catch (profileFetchError) {
      console.log("⚠️ Error fetching profile:", profileFetchError)
    }

    // ============================================
    // 7. GENERATE OTP
    // ============================================
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    // ============================================
    // 8. PREPARE ORDER DATA (MUST MATCH CONSTRAINTS)
    // ============================================
    const orderData = {
      shop_id: shop_id,
      buyer_id: user.id,
      buyer_name: buyerName,
      buyer_contact: user.email || buyerPhone || "unknown",
      buyer_phone: buyerPhone || null,
      buyer_address: buyerAddress || null,
      buyer_lat: 0,
      buyer_lng: 0,
      products: products,
      total_price: parseFloat(total_price.toString()),
      delivery_cost: parseFloat(delivery_cost.toString()),
      
      // CRITICAL: Must match check constraints
      payment_type: normalizedPaymentType, // 'COD' or 'ONLINE'
      payment_status: normalizedPaymentType === "COD" ? "unpaid" : "paid", // 'unpaid' or 'paid'
      status: "pending", // Must be one of the allowed statuses
      
      otp: otp,
      shop_lat: shop_lat,
      shop_lng: shop_lng,
      delivery_boy_id: null,
      timeline: [
        {
          status: "pending",
          action: "Order placed",
          description: "Order has been placed and waiting for shop confirmation",
          timestamp: new Date().toISOString(),
          actor: "buyer",
          actor_id: user.id,
          actor_name: buyerName
        }
      ],
    }

    console.log("✅ Order data validated against constraints:", {
      payment_type: orderData.payment_type,
      payment_status: orderData.payment_status,
      status: orderData.status
    })

    // ============================================
    // 9. INSERT ORDER INTO DATABASE
    // ============================================
    console.log("💾 Attempting to insert order...")
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error("❌ SUPABASE INSERT ERROR:", {
        message: orderError.message,
        code: orderError.code,
        details: orderError.details,
        hint: orderError.hint
      })
      
      let errorMessage = "Failed to save order to database"
      let statusCode = 500
      
      if (orderError.code === '42501') {
        errorMessage = "Permission denied (RLS violation)"
        statusCode = 403
      } else if (orderError.code === '42703') {
        errorMessage = "Invalid column name in insert"
        statusCode = 400
      } else if (orderError.code === '23502') {
        errorMessage = "Missing required field (NOT NULL violation)"
        statusCode = 400
      } else if (orderError.code === '23514') {
        errorMessage = "Check constraint violation"
        statusCode = 400
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: orderError.message,
          code: orderError.code
        },
        { status: statusCode }
      )
    }

    console.log("🎉 Order created successfully! ID:", order.id)
    
    // ============================================
    // 10. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      { 
        success: true, 
        order,
        message: "Order placed successfully!" 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("💥 UNEXPECTED ERROR in order API:", error)
    
    return NextResponse.json(
      { 
        error: "Server error", 
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET function remains the same...
export async function GET(request: NextRequest) {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { orders: [] },
        { status: 200 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const scope = searchParams.get("scope")
    const isAdmin = user.user_metadata?.role === "admin"

    // ===============================
    // DELIVERY BOY FETCH: their assigned orders
    // ===============================
    const deliveryBoyId = searchParams.get("delivery_boy_id")
    if (deliveryBoyId) {
      console.log("🛵 Delivery boy fetching orders:", deliveryBoyId, "for user:", user.id)
      
      // Must be the delivery boy themselves
      if (user.id !== deliveryBoyId) {
        return NextResponse.json(
          { 
            error: "Forbidden", 
            details: "You can only fetch your own orders" 
          },
          { status: 403 }
        )
      }
      
      // Must have delivery role
      if (user.user_metadata?.role !== "delivery") {
        return NextResponse.json(
          { 
            error: "Forbidden", 
            details: "Only delivery personnel can fetch their orders" 
          },
          { status: 403 }
        )
      }
      
      // Fetch orders assigned to this delivery boy
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("delivery_boy_id", deliveryBoyId)
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Delivery orders fetch error:", ordersError)
        return NextResponse.json({ 
          orders: [],
          error: ordersError.message 
        }, { status: 500 })
      }

      console.log(`✅ Delivery boy found ${orders?.length || 0} orders`)
      return NextResponse.json({ 
        orders: orders || [],
        delivery: true 
      })
    }

    // ===============================
    // ADMIN FETCH: all orders
    // ===============================
    if (scope === "admin") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      console.log("✅ Admin fetching ALL orders...")
      
      // FIX: Admin gets ALL orders, no filters
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Admin orders fetch error:", ordersError)
        return NextResponse.json({ 
          orders: [],
          error: ordersError.message 
        }, { status: 500 })
      }

      console.log(`✅ Admin found ${orders?.length || 0} orders`)
      return NextResponse.json({ 
        orders: orders || [],
        admin: true 
      })
    }

    // ===============================
    // SINGLE ORDER FETCH
    // ===============================
    if (orderId) {
      console.log("Fetching single order:", orderId, "for user:", user.id, "role:", user.user_metadata?.role)
      
      let query = supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
      
      // FIX: Admin can fetch any order, buyer only their own
      if (!isAdmin) {
        console.log("👤 Buyer: filtering by buyer_id:", user.id)
        query = query.eq("buyer_id", user.id)
      } else {
        console.log("👑 Admin: fetching order without buyer filter")
      }
      
      const { data: order, error } = await query.single()

      if (error) {
        console.error("Order fetch error:", error.message)
        
        // Check if error is because order doesn't exist vs unauthorized
        if (error.code === 'PGRST116') {
          if (isAdmin) {
            return NextResponse.json(
              { error: "Order not found" },
              { status: 404 }
            )
          } else {
            return NextResponse.json(
              { error: "Order not found or unauthorized" },
              { status: 404 }
            )
          }
        }
        
        return NextResponse.json(
          { error: "Order fetch failed", details: error.message },
          { status: 500 }
        )
      }

      // FIX: Remove buyer ownership check since we already filtered
      // Admin can see all orders, buyers only see their own due to filter above
      
      console.log("✅ Order fetched successfully:", order.id)
      return NextResponse.json(
        { order },
        { status: 200 }
      )
    }
    
    // ===============================
    // LIST ORDERS FETCH
    // ===============================
    console.log("Fetching orders list for user:", user.id, "role:", user.user_metadata?.role)
    
    let query = supabase
      .from("orders")
      .select("*")
    
    // FIX: Admin sees all orders, buyer only their own
    if (!isAdmin) {
      console.log("👤 Buyer: listing only their orders")
      query = query.eq("buyer_id", user.id)
    } else {
      console.log("👑 Admin: listing all orders")
    }
    
    const { data: orders, error } = await query
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Orders list fetch error:", error)
      return NextResponse.json({ orders: [] }, { status: 500 })
    }

    console.log(`✅ Found ${orders?.length || 0} orders`)
    return NextResponse.json(
      { orders: orders || [] },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("GET error:", error)
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    )
  }
}