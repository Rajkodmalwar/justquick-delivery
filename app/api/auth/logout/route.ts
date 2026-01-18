import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/logout
 * Sign out the current user and clear session cookies
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()

    // Sign out user on server
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('❌ Logout error:', error)
      // Continue anyway to clear cookies
    }

    // Clear session cookies explicitly
    const cookieStore = await cookies()
    
    // Remove Supabase auth cookies
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')
    
    // Remove any other auth-related cookies
    cookieStore.delete('sb_jwt_token')
    cookieStore.delete('sb_provider_token')

    console.log('✅ User logged out and cookies cleared')

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Also set Max-Age=0 to ensure browser deletes them
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    response.cookies.delete('sb_jwt_token')
    response.cookies.delete('sb_provider_token')

    return response

  } catch (error: any) {
    console.error('❌ Logout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
