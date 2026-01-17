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
  
  console.log("🔐 Callback hit - code:", !!code, "token_hash:", !!tokenHash)
  
  // Missing parameters = authentication failed upstream
  if (!code || !tokenHash) {
    console.error("❌ Missing code or token_hash in callback URL")
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
  }
  
  // Preserve code/token_hash in redirect so client can detect it
  const shopsUrl = new URL("/shops", requestUrl.origin)
  shopsUrl.searchParams.set("code", code)
  shopsUrl.searchParams.set("token_hash", tokenHash)
  
  console.log("✅ Redirecting to /shops - client will exchange code")
  return NextResponse.redirect(shopsUrl.toString())
}