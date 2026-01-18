import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/send-otp
 * Send OTP to user's email for login
 * 
 * Request body:
 * - email: string
 * 
 * Response:
 * - success: boolean
 * - message: string
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServer()

    // Send OTP for password-based account (not magic link)
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        // For password-based accounts, we send OTP only
        // Not a magic link - user enters OTP manually
        shouldCreateUser: false, // Don't create if doesn't exist
      },
    })

    if (error) {
      console.error('❌ Send OTP error:', error)
      // Don't reveal if user exists or not (security)
      return NextResponse.json(
        { 
          success: true,
          message: 'If this email exists, we\'ve sent an OTP code. Check your email.' 
        },
        { status: 200 }
      )
    }

    console.log(`✅ OTP sent to: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'OTP code sent to your email. It expires in 10 minutes.',
    })

  } catch (error: any) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
