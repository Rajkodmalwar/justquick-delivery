import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Enable session persistence
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    }
  )
}

// Singleton instance
export const supabase = createClient()