import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define route groups
const PUBLIC_ROUTES = [
  "/", 
  "/shops", 
  "/shops/[id]", 
  "/products",
  "/api/auth/callback",
  "/auth",
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/privacy",
  "/terms"
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Allow API routes through - auth checked in API route handlers
  if (path.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Skip middleware for static assets or public files
  if (
    path.startsWith("/_next/") ||
    path.includes(".") || // Files with extensions
    path.startsWith("/public/")
  ) {
    return NextResponse.next()
  }

  // For now, just pass through and let client-side auth handle it
  // This avoids making external Supabase calls in the Edge Runtime
  return NextResponse.next()
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