import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/**
 * CALLBACK ROUTE - Preserves code in redirect
 * 
 * With flowType: 'pkce' and detectSessionInUrl: true, the client-side
 * Supabase client will automatically detect code/token_hash in the URL
 * and exchange it using the PKCE code verifier from browser storage.
 * 
 * We redirect to /shops but KEEP the code/token_hash in the URL so the
 * client can detect and exchange them.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  console.log("🔐 Callback route - preserving code in URL")
  
  // Extract code and token_hash from URL
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  
  if (!code || !tokenHash) {
    console.error("❌ Missing code or token_hash")
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
  }
  
  // Redirect to /shops but KEEP the code/token_hash in URL
  // This allows the client-side Supabase client (with detectSessionInUrl: true)
  // to detect and exchange the code using the PKCE verifier
  const shopsUrl = new URL("/shops", requestUrl.origin)
  shopsUrl.searchParams.set("code", code)
  shopsUrl.searchParams.set("token_hash", tokenHash)
  
  console.log("✅ Redirecting to /shops with code preserved")
  return NextResponse.redirect(shopsUrl.toString())
}