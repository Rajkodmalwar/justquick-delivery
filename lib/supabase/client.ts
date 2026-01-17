import { createBrowserClient } from '@supabase/ssr'

/**
 * Client-side Supabase instance for browser
 * 
 * CRITICAL SETTINGS:
 * - flowType: 'pkce' = Required for OTP magic links
 * - detectSessionInUrl: true = Auto-detects code in URL
 * - persistSession: true = Saves session to localStorage
 * - autoRefreshToken: true = Auto-refreshes expired tokens
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
}

// Singleton instance
export const supabase = createClient()