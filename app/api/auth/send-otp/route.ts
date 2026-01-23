import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/send-otp
 * Send OTP/Magic Link to email using Supabase Auth
 * 
 * Uses Supabase's built-in authentication email service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type = "login" } = body

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    logger.log(`📧 OTP: Sending to ${normalizedEmail} (type: ${type})`)

    // Use Supabase Auth to send magic link
    const supabase = await getSupabaseServer()
    
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`,
        shouldCreateUser: type === "signup"
      }
    })

    if (error) {
      logger.error("❌ OTP: Supabase error", error.message)
      return NextResponse.json(
        { 
          error: "Failed to send OTP",
          details: error.message
        },
        { status: 500 }
      )
    }

    logger.log(`✅ OTP: Magic link sent to ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      message: `Magic link sent to ${normalizedEmail}`,
      maskedEmail: maskEmail(normalizedEmail),
      expiresIn: 3600 // 1 hour
    })
  } catch (error) {
    logger.error("❌ OTP: Request failed", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}

/**
 * Mask email for display (e.g., user@example.com → u***@example.com)
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!local || !domain) return email
  
  const masked =
    local.charAt(0) +
    "*".repeat(Math.max(0, local.length - 2)) +
    local.charAt(local.length - 1)
  return `${masked}@${domain}`
}

