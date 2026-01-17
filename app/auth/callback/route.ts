import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/**
 * CALLBACK ROUTE - Magic Link Handler
 * 
 * Flow:
 * 1. User clicks magic link: /auth/callback?code=X&token_hash=Y
 * 2. Client detects code/token_hash in URL
 * 3. Client PKCE exchanges code for session (uses code verifier from browser)
 * 4. Session cookies are set automatically
 * 5. We redirect to /shops
 * 6. Auth provider picks up session from cookies
 * 
 * SERVER DOES NOT exchange code - client does it with PKCE verifier
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  
  console.log("🔐 Callback hit - code:", !!code, "token_hash:", !!tokenHash, "error:", error)
  
  // Handle error responses from Supabase
  if (error) {
    console.error("❌ Auth error:", error, errorDescription)
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
  }
  
  // Missing code = no authentication attempt
  if (!code) {
    console.error("❌ Missing code in callback URL")
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", requestUrl.origin))
  }
  
  // Redirect to /shops with code (and token_hash if present)
  // Client will detect code in URL and exchange it using PKCE
  const shopsUrl = new URL("/shops", requestUrl.origin)
  shopsUrl.searchParams.set("code", code)
  if (tokenHash) {
    shopsUrl.searchParams.set("token_hash", tokenHash)
  }
  
  console.log("✅ Redirecting to /shops - client will exchange code")
  return NextResponse.redirect(shopsUrl.toString())
}