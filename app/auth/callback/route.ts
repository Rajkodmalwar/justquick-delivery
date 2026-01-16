import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  console.log("🔍 Callback route called with:", {
    code: code ? code.substring(0, 10) + "..." : null,
    error,
    error_description,
    url: request.url
  })

  // Handle OAuth errors from Supabase
  if (error) {
    console.error("❌ Auth error from Supabase:", error, error_description)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    )
  }

  if (!code) {
    console.error("❌ No code parameter received")
    return NextResponse.redirect(new URL("/auth/login?error=No%20code%20provided", requestUrl.origin))
  }

  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.warn("Cookie set error:", error)
            }
          },
        },
      }
    )

    // Exchange the code for a session
    console.log("🔄 Exchanging code for session...")
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error("❌ Code exchange failed:", exchangeError.message)
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(
            "Magic link invalid or expired. Please request a new one. Make sure https://hyperlocal-delivery-app.vercel.app/auth/callback is added in Supabase → Authentication → URL Configuration"
          )}`,
          requestUrl.origin
        )
      )
    }

    if (!session?.user) {
      console.error("❌ No session returned after code exchange")
      return NextResponse.redirect(
        new URL("/auth/login?error=Failed%20to%20create%20session", requestUrl.origin)
      )
    }

    console.log("✅ User authenticated via callback:", session.user.email)
    
    // Check if user is new (no phone number in metadata)
    const isNewUser = !session.user.user_metadata?.phone
    const redirectUrl = isNewUser 
      ? new URL("/profile?newUser=true", requestUrl.origin)
      : new URL("/shops", requestUrl.origin)

    console.log("📍 Redirecting to:", redirectUrl.pathname)
    return NextResponse.redirect(redirectUrl)
    
  } catch (error: any) {
    console.error("❌ Unexpected error in callback:", error.message || error)
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent("Authentication failed: " + (error.message || "Unknown error"))}`,
        requestUrl.origin
      )
    )
  }
}