import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  console.log("🔐 Callback triggered")
  console.log("📍 Full URL:", requestUrl.toString())
  console.log("📍 Search params:", requestUrl.search)

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
              // Ignore
            }
          },
        },
      }
    )

    console.log("🔄 Exchanging code for session...")
    // This will handle the OTP code from the URL
    const { data, error } = await supabase.auth.exchangeCodeForSession(requestUrl.toString())
    
    console.log("📦 Exchange result - data:", !!data, "error:", error?.message)
    
    if (error) {
      console.error("❌ Auth error:", error.message)
      const loginUrl = new URL("/auth/login", requestUrl.origin)
      loginUrl.searchParams.set("error", error.message)
      return NextResponse.redirect(loginUrl.toString())
    }

    if (!data.session) {
      console.error("❌ No session received")
      return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
    }

    console.log("✅ Session created, redirecting to /shops")
    // Redirect to home after successful auth
    return NextResponse.redirect(new URL("/shops", requestUrl.origin))
    
  } catch (error) {
    console.error("❌ Callback error:", error)
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
  }
}