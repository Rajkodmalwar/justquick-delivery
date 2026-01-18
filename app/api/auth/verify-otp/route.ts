import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and create session
 * 
 * Request body:
 * - email: string
 * - token: string (OTP code)
 * - type: 'sms' | 'email' (default: 'email')
 * 
 * Response:
 * - success: boolean
 * - user: { id, email, name, role }
 * - session: auth session data
 */
export async function POST(request: NextRequest) {
  try {
    const { email, token, type = 'email' } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServer()

    // Verify OTP and create session
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: token.trim(),
      type: type as 'sms' | 'email',
    })

    if (error) {
      console.error('❌ OTP verification error:', error)
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    console.log(`✅ User verified with OTP: ${data.user.email}`)

    // Session is automatically set in cookies by the server client
    // Middleware will handle cookie refresh

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        role: data.user.user_metadata?.role || 'buyer',
      },
      message: 'Login successful!',
    })

  } catch (error: any) {
    console.error('❌ OTP verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
