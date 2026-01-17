import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  console.log("🔍 Callback route called:", {
    hasCode: !!code,
    hasError: !!error,
    url: request.url
  })

  // Handle errors from Supabase
  if (error) {
    console.error("❌ Supabase error:", error, error_description)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    )
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

    // For magic links with code, exchange it
    if (code) {
      console.log("🔄 Exchanging OTP code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error("❌ Code exchange failed:", exchangeError.message)
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent("Magic link invalid or expired. Request a new one.")}`, requestUrl.origin)
        )
      }

      if (data?.session?.user?.email) {
        console.log("✅ User authenticated:", data.session.user.email)
      }
    }

    // Get the current session (either from code exchange or from URL detection)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.error("❌ No valid session:", sessionError?.message)
      return NextResponse.redirect(
        new URL("/auth/login?error=Session%20creation%20failed", requestUrl.origin)
      )
    }

    console.log("✅ Session established for:", session.user.email)
    
    // Redirect to home or profile
    return NextResponse.redirect(new URL("/shops", requestUrl.origin))
    
  } catch (error: any) {
    console.error("❌ Callback error:", error)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin)
    )
  }
}