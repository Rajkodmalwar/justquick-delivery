import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"
import { createServerClient } from "@supabase/ssr"

/**
 * MIDDLEWARE: Admin Route Protection via authentication + Security Headers
 * 
 * Next.js 15 middleware using @supabase/ssr
 * Protects /admin routes from unauthenticated users
 * Adds security headers to all responses
 * 
 * Flow:
 * 1. Refresh auth session via updateSession
 * 2. Add security headers
 * 3. Check if accessing protected /admin route
 * 4. Allow /admin/login without authentication
 * 5. For other /admin routes, require authenticated user
 */
export async function middleware(request: NextRequest) {
  // Step 1: Refresh session and update cookies
  const response = await updateSession(request)

  // Step 2: Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // Step 3: Check if this is an /admin route
  const { pathname } = request.nextUrl
  if (!pathname.startsWith("/admin")) {
    return response
  }

  // Step 4: Allow /admin/login without authentication
  if (pathname === "/admin/login") {
    return response
  }

  // Step 5: For other /admin routes, verify user is authenticated
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // No user - redirect to admin login
    if (userError || !user) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // User is authenticated - allow access
    // AuthProvider will verify role and update UI accordingly
  } catch (error) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
