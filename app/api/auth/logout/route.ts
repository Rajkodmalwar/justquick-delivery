import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/logout
 * Sign out the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()

    // Sign out user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('❌ Logout error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to logout' },
        { status: 400 }
      )
    }

    console.log('✅ User logged out')

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

  } catch (error: any) {
    console.error('❌ Logout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
