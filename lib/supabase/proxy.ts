import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * PROXY: Updates Supabase session cookies on every request
 * 
 * This is critical for:
 * 1. Refreshing expired auth tokens
 * 2. Setting session cookies for Server Components
 * 3. Persisting auth state across requests
 * 4. Making cookies available on the browser side
 * 
 * MUST be called by middleware on every request
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookie in request
            request.cookies.set(name, value);
            // Set cookie in response (for browser)
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes a user's session in case it has expired.
  // It MUST be called for every request!
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.warn("Session refresh error (non-fatal):", error);
    // It's okay if this fails - user just isn't authenticated
  }

  return response;
}
