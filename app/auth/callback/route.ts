import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
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
              // Ignore cookie errors in middleware
            }
          },
        },
      }
    )
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Callback error:", error)
        // Redirect to login with error
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }
      
      // Get the user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log("User authenticated via callback:", session.user.email)
        
        // Check if user is new (no phone number in metadata)
        const isNewUser = !session.user.user_metadata?.phone
        
        if (isNewUser) {
          // New user - redirect to profile to complete registration
          return NextResponse.redirect(
            new URL("/profile?newUser=true", requestUrl.origin)
          )
        } else {
          // Returning user - redirect to shops
          return NextResponse.redirect(
            new URL("/shops", requestUrl.origin)
          )
        }
      }
      
    } catch (error: any) {
      console.error("Unexpected error in callback:", error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin)
      )
    }
  }

  // Default redirect if no code
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}