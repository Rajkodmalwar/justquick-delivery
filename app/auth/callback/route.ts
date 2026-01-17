import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  console.log("🔐 Callback triggered")
  console.log("📍 Full URL:", requestUrl.toString())
  console.log("📍 Code:", requestUrl.searchParams.get("code") ? "present" : "MISSING")
  console.log("📍 Token hash:", requestUrl.searchParams.get("token_hash") ? "present" : "MISSING")

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

    console.log("🔄 Exchanging OTP code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(requestUrl.toString())
    
    if (error) {
      console.error("❌ Exchange failed:", error.message)
      const loginUrl = new URL("/auth/login", requestUrl.origin)
      loginUrl.searchParams.set("error", `Authentication failed: ${error.message}`)
      return NextResponse.redirect(loginUrl.toString())
    }

    if (!data.session) {
      console.error("❌ No session in exchange response")
      return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
    }

    console.log(`✅ Session created for user: ${data.session.user.email}`)
    console.log("📝 Redirecting to /shops")
    
    return NextResponse.redirect(new URL("/shops", requestUrl.origin))
    
  } catch (error) {
    console.error("❌ Callback error:", error)
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
  }
}