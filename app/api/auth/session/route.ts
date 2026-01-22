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
    
    // First check if session exists (no session = guest user, not an error)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }
    
    const user = session.user

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
    // Unexpected errors only - return null user silently
    return NextResponse.json(
      { user: null },
      { status: 200 }
    )
  }
}
