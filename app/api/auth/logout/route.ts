import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/logout
 * Sign out the current user and clear all session cookies
 * Works in both localhost and deployed versions
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
    cookieStore.delete('sb-idp-nonce')

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Set Max-Age=0 and clear all auth cookies from response
    // This ensures cookies are deleted in production (deployed version)
    response.cookies.set('sb-access-token', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    response.cookies.set('sb-refresh-token', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    response.cookies.set('sb_jwt_token', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    response.cookies.set('sb_provider_token', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    response.cookies.set('sb-idp-nonce', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    console.log('✅ User logged out and all cookies cleared')

    return response

  } catch (error: any) {
    console.error('❌ Logout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
