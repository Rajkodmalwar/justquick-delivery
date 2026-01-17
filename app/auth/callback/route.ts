import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/**
 * CALLBACK ROUTE - No server-side code exchange needed
 * 
 * The client-side Supabase client will detect the code/token_hash in the URL
 * and automatically exchange it for a session (via detectSessionInUrl: true)
 * 
 * This route just redirects to /shops where the auth provider will pick up
 * the session that was created by the client-side exchange
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  console.log("🔐 Callback route hit")
  console.log("📍 URL has code:", requestUrl.searchParams.has("code"))
  console.log("📍 URL has token_hash:", requestUrl.searchParams.has("token_hash"))
  
  // The client-side Supabase client will automatically:
  // 1. Detect code + token_hash in URL (detectSessionInUrl: true)
  // 2. Use PKCE code verifier from browser storage
  // 3. Exchange for session
  // 4. Set auth cookies
  // This happens BEFORE the auth provider loads
  
  // Just redirect to the app - session will be ready
  return NextResponse.redirect(new URL("/shops", requestUrl.origin))
}