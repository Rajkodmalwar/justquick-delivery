import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/**
 * CALLBACK ROUTE - OTP Handler (Legacy Magic Link Fallback)
 * 
 * This is kept for backward compatibility but is deprecated.
 * The new flow uses:
 * 1. POST /api/auth/send-otp - send OTP code
 * 2. POST /api/auth/verify-otp - verify OTP and create session
 * 
 * If code is still in URL, redirect to OTP verification page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  
  console.log("🔐 Callback hit - code:", !!code, "token_hash:", !!tokenHash, "error:", error)
  
  // Handle error responses
  if (error) {
    console.error("❌ Auth error:", error, errorDescription)
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
  }
  
  // If code is present, redirect to login
  // (Old magic link flow - now we use OTP)
  if (code) {
    console.log("ℹ️ Magic link detected but OTP flow is now in use")
    return NextResponse.redirect(new URL("/auth/login?message=Please use the new OTP login method", requestUrl.origin))
  }
  
  // No code - redirect to login
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}
