import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/signup
 * Create a new user account with email and password
 * 
 * Request body:
 * - email: string
 * - password: string
 * - name: string (optional)
 * 
 * Response:
 * - user: { id, email, user_metadata }
 * - session: auth session
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Create user with Supabase
    const supabase = await getSupabaseServer()
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role: 'buyer', // Default role
        },
      },
    })

    if (error) {
      console.error('❌ Signup error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    console.log(`✅ User signed up: ${data.user.email}`)

    // Return user info (not session - they need to verify email via OTP)
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0],
      },
      message: 'Account created! Please verify your email with OTP to login.',
    })

  } catch (error: any) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
