import { getSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Server-side profile creation endpoint
 * 
 * This endpoint provides a reliable fallback for profile creation when
 * client-side creation fails due to RLS, permissions, or race conditions.
 * 
 * Uses server-side Supabase client with user session.
 */
export async function POST(request: Request) {
  try {
    logger.log("📝 [Server] Profile creation endpoint called")
    
    // Get authenticated user from session
    const supabase = await getSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logger.error("❌ [Server] No authenticated user", authError?.message)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    logger.log("✅ [Server] Authenticated user:", user.id, user.email)
    
    // Parse request body for optional profile data
    const body = await request.json().catch(() => ({}))
    const { name, phone, address } = body
    
    // Prepare profile data with fallbacks
    const profileData = {
      id: user.id,
      role: "buyer",
      name: name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User",
      email: user.email || "",
      phone: phone || user.user_metadata?.phone || "",
      address: address || user.user_metadata?.address || "",
      updated_at: new Date().toISOString()
    }
    
    logger.log("🔨 [Server] Upserting profile:", profileData)
    
    // Use UPSERT to create or update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })
      .select()
      .single()
    
    if (profileError) {
      logger.error("❌ [Server] Profile upsert failed:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details
      })
      
      return NextResponse.json(
        { 
          error: "Failed to create profile",
          details: profileError.message,
          code: profileError.code
        },
        { status: 500 }
      )
    }
    
    logger.log("✅ [Server] Profile created/updated successfully:", profile)
    
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name || profile.full_name || user.email?.split('@')[0] || 'User',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        role: profile.role || 'buyer'
      }
    })
    
  } catch (error: any) {
    logger.error("❌ [Server] Profile creation error:", error.message)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
