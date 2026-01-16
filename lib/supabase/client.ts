import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Enable session persistence via cookies
        autoRefreshToken: true, // Auto-refresh tokens
        detectSessionInUrl: true, // CRITICAL: Detect session from URL (for magic links)
        // Note: Don't use PKCE with OTP flow - they have conflicting requirements
      },
      global: {
        headers: {
          'x-client-info': 'justquick-app'
        }
      },
      db: {
        schema: 'public'
      }
    }
  )
}

// Singleton instance - lazy loaded to prevent build-time initialization
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}

// For backwards compatibility - creates new client each time
export const supabase = createClient()