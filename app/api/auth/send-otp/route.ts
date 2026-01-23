import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { getEmailService } from "@/lib/email/email-service"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/send-otp
 * Send OTP to email for authentication
 * 
 * FLOW:
 * 1. Client sends email
 * 2. Generate OTP 
 * 3. Store OTP temporarily (optional - for verification)
 * 4. Send via SMTP/email service (bypasses Supabase rate limits)
 * 
 * REQUEST:
 * {
 *   "email": "user@example.com",
 *   "type": "login" | "signup"  (optional, default: "login")
 * }
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

    // Generate 6-digit OTP
    const otp = generateOTP()
    logger.log(`🔑 OTP: Generated code for ${normalizedEmail}`)

    // Store OTP in database (optional - for verification later)
    const supabase = await getSupabaseServer()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Try to store OTP in database for verification
    const { error: insertError } = await supabase
      .from("otp_codes")
      .upsert(
        {
          email: normalizedEmail,
          code: otp,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          type,
          used: false
        },
        {
          onConflict: "email"
        }
      )

    if (insertError && insertError.code !== "PGRST116") {
      logger.warn(
        "⚠️ OTP: Could not store OTP in database",
        insertError.message
      )
      // Continue - we'll send email anyway
    }

    // Send OTP via email service (bypasses Supabase rate limits)
    const emailService = getEmailService()
    const emailResult = await emailService.sendOTP(normalizedEmail, otp, type)

    if (!emailResult.success) {
      logger.error("❌ OTP: Failed to send email", emailResult.error)
      return NextResponse.json(
        { 
          error: "Failed to send OTP email", 
          details: emailResult.error 
        },
        { status: 500 }
      )
    }

    logger.log(`✅ OTP: Successfully sent to ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${normalizedEmail}`,
      // Only expose partial email for security
      maskedEmail: maskEmail(normalizedEmail),
      expiresIn: 600 // 10 minutes in seconds
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
 * Generate a 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

