import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  // ⚠️ IMPORTANT: Don't make external requests in middleware (Edge Runtime)
  // Supabase auth checks happen client-side instead
  
  const response = NextResponse.next()
  
  // Just pass through - let client-side auth handle session validation
  return { 
    supabaseResponse: response, 
    user: null,
    session: null 
  }
}