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

    // Send OTP - this works for both existing and new users
    // Supabase will generate a 6-digit code and send it via email
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: true, // Allow both new and existing users
        // For OTP, email will NOT create a magic link
        // Instead, Supabase sends a 6-digit code
      },
    })

    if (error) {
      console.error('❌ Send OTP error:', error)
      // Log full error for debugging
      console.error('Error details:', error.message, error.status)
      
      return NextResponse.json(
        { error: `Failed to send OTP: ${error.message}` },
        { status: 400 }
      )
    }

    console.log(`✅ OTP sent to: ${email}`)
    console.log('Response data:', data)

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
