// components/auth/auth-provider.tsx
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  name: string
  phone: string
  address?: string
  role: "admin" | "buyer" | "vendor" | "delivery" | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isBuyer: boolean
  isVendor: boolean
  isDelivery: boolean
  role: string | null
  logout: () => Promise<void>
  setBuyerInfo: (data: Partial<AuthUser>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isBuyer: false,
  isVendor: false,
  isDelivery: false,
  role: null,
  logout: async () => {},
  setBuyerInfo: async () => {},
  refreshUser: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Convert Supabase user to our AuthUser format with role
  const formatUser = async (supabaseUser: User | null): Promise<AuthUser | null> => {
    if (!supabaseUser) return null

    try {
      // Get role from user_metadata
      const userRole = supabaseUser.user_metadata?.role || "buyer"
      
      // Try to fetch profile data with error handling
      let profile = null
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single()
        profile = data
      } catch (profileError) {
        // Profile not found or other error - that's okay
        console.log("Profile fetch optional")
      }

      const formattedUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        phone: profile?.phone || supabaseUser.user_metadata?.phone || '',
        address: profile?.address || supabaseUser.user_metadata?.address || '',
        role: userRole as any
      }
      
      // Cache in session storage (more browser-friendly than localStorage)
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('jq_user_cache', JSON.stringify(formattedUser))
        }
      } catch (e) {
        // Ignore storage errors
      }
      
      return formattedUser
    } catch (error) {
      console.error("Error formatting user:", error)
      // Fallback to basic info
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        phone: supabaseUser.user_metadata?.phone || '',
        address: supabaseUser.user_metadata?.address || '',
        role: supabaseUser.user_metadata?.role || "buyer"
      }
    }
  }

  // Load user session
  const loadSession = async () => {
    try {
      console.log("🔄 Loading session...")
      setLoading(true)
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.warn("Session error:", error)
      }
      
      if (user) {
        console.log("✅ Session found for:", user.email)
        const formattedUser = await formatUser(user)
        setUser(formattedUser)
        setRole(formattedUser?.role || null)
        
        // Cache the user data
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('jq_user_cache', JSON.stringify(formattedUser))
          }
        } catch (e) {
          console.warn("Cache error:", e)
        }
      } else {
        console.log("❌ No session found")
        setUser(null)
        setRole(null)
      }
    } catch (error) {
      console.error("Error loading session:", error)
      setUser(null)
      setRole(null)
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }

  // Update buyer info
  const setBuyerInfo = async (data: Partial<AuthUser>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          phone: data.phone,
          address: data.address
        }
      })

      if (metadataError) throw metadataError

      // Update profiles table (optional)
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: data.name,
            phone: data.phone,
            address: data.address,
            email: user.email,
            updated_at: new Date().toISOString()
          })
      } catch (profileError) {
        console.warn("Could not update profile table:", profileError)
      }

      // Refresh user data
      await refreshUser()
    } catch (error) {
      console.error("Error setting buyer info:", error)
      throw error
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    await loadSession()
  }

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  useEffect(() => {
    console.log("🔐 Setting up auth listener...")
    
    // Load initial session
    loadSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth event:", event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log("✅ User session updated:", session.user.email)
            const formattedUser = await formatUser(session.user)
            setUser(formattedUser)
            setRole(formattedUser?.role || null)
            
            // Cache the user
            try {
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('jq_user_cache', JSON.stringify(formattedUser))
              }
            } catch (e) {
              console.warn("Cache error:", e)
            }
          }
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          console.log("🚪 User signed out")
          setUser(null)
          setRole(null)
          // Clear cache
          try {
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('jq_user_cache')
            }
          } catch (e) {
            console.warn("Cache clear error:", e)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      console.log("🧹 Cleaning up auth listener")
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === "admin",
    isBuyer: role === "buyer" || !role, // Default to buyer if no role
    isVendor: role === "vendor",
    isDelivery: role === "delivery",
    role,
    logout,
    setBuyerInfo,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)