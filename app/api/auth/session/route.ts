import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/session
 * Get current user session from server
 * This endpoint reads the session cookies set by middleware
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    // Get user from server (reads cookies set by middleware)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    // Get profile if exists
    let profile = null
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    } catch (e) {
      // Profile not found - that's okay
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email || '',
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        phone: profile?.phone || user.user_metadata?.phone || '',
        address: profile?.address || user.user_metadata?.address || '',
        role: user.user_metadata?.role || 'buyer',
      }
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('❌ Session error:', error)
    return NextResponse.json(
      { user: null },
      { status: 200 }
    )
  }
}
