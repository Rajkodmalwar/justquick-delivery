import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

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

    // This will handle the OTP code from the URL
    const { data, error } = await supabase.auth.exchangeCodeForSession(requestUrl.toString())
    
    if (error || !data.session) {
      console.error("Auth error:", error)
      return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
    }

    // Redirect to home after successful auth
    return NextResponse.redirect(new URL("/shops", requestUrl.origin))
    
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
  }
}