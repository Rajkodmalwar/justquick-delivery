import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { createServerClient } from "@supabase/ssr";

/**
 * MIDDLEWARE: Supabase Session Proxy + Route Protection
 * 
 * Every request is intercepted to:
 * 1. Refresh expired auth tokens
 * 2. Set session cookies for Server Components
 * 3. Ensure auth state persists across requests
 * 4. Protect admin routes
 * 
 * This is CRITICAL for:
 * - Magic link authentication to work after redirect
 * - Server components to read user session
 * - Session to survive page reloads
 * - Production (Vercel) to work correctly
 * - Admin routes to be protected
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Protect admin routes - only allow authenticated admin users
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Create server client to check auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // We don't set cookies here since we already did in updateSession
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Check if user is authenticated and has admin role
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      // Not authenticated - redirect to login
      if (error || !user) {
        console.log("🚫 Unauthorized admin access attempt - no user");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Check admin role from user metadata or database
      const role = user.user_metadata?.role;
      if (role !== "admin") {
        console.log("🚫 Unauthorized admin access - user role:", role);
        return NextResponse.redirect(new URL("/shops", request.url));
      }

      console.log("✅ Admin user allowed:", user.email);
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}