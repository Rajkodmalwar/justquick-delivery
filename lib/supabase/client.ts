import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Enable session persistence via cookies
        autoRefreshToken: true, // Auto-refresh tokens
        detectSessionInUrl: true, // Detect session from URL (for magic links)
        flowType: 'pkce', // Use PKCE for better security
        storageKey: 'justquick_auth', // Custom storage key
      },
      global: {
        headers: {
          'x-client-info': 'justquick-app'
        }
      },
      // Disable the deprecated localStorage
      db: {
        schema: 'public'
      }
    }
  )
}

// Singleton instance
export const supabase = createClient()