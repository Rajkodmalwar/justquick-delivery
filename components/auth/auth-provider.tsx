// components/auth/auth-provider.tsx
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import type { Session, User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  role?: string | null
  updated_at?: string
}

/**
 * AuthContext - Global authentication state
 * 
 * Provides:
 * - user: Authenticated Supabase user object
 * - profile: User profile from public.profiles table
 * - session: Active session object
 * - loading: Loading state during auth check
 * - signOut: Logout function (aliases: logout)
 * - role: User role from metadata
 * - isAuthenticated: Whether user is logged in
 * - isAdmin, isBuyer, isVendor, isDelivery: Role helpers
 * 
 * Updates instantly via onAuthStateChange listener
 */
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  logout: () => Promise<void> // Alias for backward compatibility
  role: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isBuyer: boolean
  isVendor: boolean
  isDelivery: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from public.profiles table
  // If profile doesn't exist, create it
  // This uses RLS (user can only access their own profile)
  const fetchOrCreateProfile = async (userId: string, user: User): Promise<UserProfile | null> => {
    try {
      logger.log("📋 Fetching profile for user:", userId)
      
      // Step 1: Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Profile exists - return it
      if (data) {
        logger.log("✅ Profile found:", data)
        return data
      }

      // Check if error is "no rows found" (PGRST116) or permission denied (403)
      if (error?.code === 'PGRST116' || error?.status === 406) {
        // Profile doesn't exist - we need to create it
        logger.log("📝 No profile found - creating new profile for user:", userId)
        
        // Step 2: Create profile with initial values
        const newProfile = {
          id: userId,
          role: "buyer",
          full_name: user.user_metadata?.full_name ?? "",
          phone: user.user_metadata?.phone ?? "",
          created_at: new Date().toISOString()
        }

        logger.log("🔨 Inserting profile:", newProfile)
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          logger.error("❌ Failed to create profile:", createError.message)
          logger.error("Error details:", createError)
          // Do NOT fallback or continue - this is a critical error
          throw createError
        }

        logger.log("✅ Profile created successfully:", createdProfile)

        // Step 3: Re-fetch the created profile to ensure consistency
        const { data: refetchedProfile, error: refetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (refetchError) {
          logger.error("❌ Failed to re-fetch created profile:", refetchError.message)
          throw refetchError
        }

        logger.log("✅ Profile re-fetched after creation:", refetchedProfile)
        return refetchedProfile
      } else if (error) {
        // Some other Supabase error occurred
        logger.error("❌ Error fetching profile:", error.message)
        logger.error("Error code:", error.code)
        logger.error("Error status:", error.status)
        // Do NOT continue - this is an unexpected error
        throw error
      }

      return null
    } catch (error) {
      logger.error("❌ Critical error in profile fetch/create:", error)
      // Do NOT crash app, but also do NOT silently ignore
      // The app will continue but without profile - components must handle null profile
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    const setupAuth = async () => {
      try {
        // Get initial session from server
        logger.log("🔄 Loading initial auth session...")
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (error) {
          logger.warn("⚠️ Auth error loading session:", error.message)
        } else if (initialSession) {
          logger.log("✅ Initial session found:", initialSession.user.email)
          if (isMounted) {
            setSession(initialSession)
            setUser(initialSession.user)
            
            // Fetch or create user profile from database
            const userProfile = await fetchOrCreateProfile(initialSession.user.id, initialSession.user)
            if (isMounted) {
              setProfile(userProfile)
            }
          }
        } else {
          logger.log("ℹ️ No initial session")
          if (isMounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        logger.error("❌ Error loading initial session:", error)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    setupAuth()

    // Listen for auth state changes
    logger.log("🔐 Setting up auth state listener...")
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        logger.log("🔐 Auth event:", event)

        if (isMounted) {
          setSession(newSession)
          setUser(newSession?.user ?? null)

          // Fetch or create profile when user signs in or session is established
          if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && newSession?.user) {
            logger.log("👤 Fetching or creating profile for user")
            const userProfile = await fetchOrCreateProfile(newSession.user.id, newSession.user)
            if (isMounted) {
              setProfile(userProfile)
            }
          } else if (event === "SIGNED_OUT") {
            // Clear profile on sign out
            if (isMounted) {
              setProfile(null)
            }
          } else if (event === "TOKEN_REFRESHED" && newSession?.user) {
            // Refresh profile on token refresh (in case it was updated)
            const userProfile = await fetchOrCreateProfile(newSession.user.id, newSession.user)
            if (isMounted) {
              setProfile(userProfile)
            }
          }

          setLoading(false)

          // Log state changes
          if (event === "SIGNED_IN") {
            logger.log("✅ User signed in:", newSession?.user.email)
          } else if (event === "SIGNED_OUT") {
            logger.log("🚪 User signed out")
          } else if (event === "TOKEN_REFRESHED") {
            logger.log("🔄 Token refreshed")
          } else if (event === "INITIAL_SESSION") {
            logger.log("📋 Initial session loaded")
          }
        }
      }
    )

    return () => {
      isMounted = false
      logger.log("🧹 Cleaning up auth listener")
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      logger.log("🚪 Signing out...")
      
      // First, call the server logout endpoint to clear all cookies
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!logoutResponse.ok) {
        logger.warn("⚠️ Server logout failed, clearing client state anyway")
      }

      // Then sign out from client
      const { error } = await supabase.auth.signOut()

      if (error) {
        logger.error("❌ Sign out error:", error)
        throw error
      }

      logger.log("✅ Successfully signed out from server and client")
      // State will be cleared by onAuthStateChange listener
    } catch (error) {
      logger.error("❌ Logout error:", error)
      // Force clear state even if request fails
      setUser(null)
      setSession(null)
      throw error
    }
  }

  // Get role from user metadata
  const getRole = () => {
    return user?.user_metadata?.role || "buyer"
  }

  const role = getRole()
  const isAdmin = role === "admin"
  const isBuyer = role === "buyer" || !role
  const isVendor = role === "vendor"
  const isDelivery = role === "delivery"

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signOut,
    logout: signOut, // Backward compatibility alias
    role,
    isAuthenticated: !!user,
    isAdmin,
    isBuyer,
    isVendor,
    isDelivery
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth hook - Access global auth context
 * 
 * Usage:
 * const { user, loading, signOut } = useAuth()
 * 
 * @throws Error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
