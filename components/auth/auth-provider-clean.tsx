"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {}
})

/**
 * Clean Auth Provider
 * 
 * Handles:
 * - Loading session from cookies via getUser()
 * - Listening for auth state changes
 * - Logout
 * 
 * Does NOT try to:
 * - Format/transform user data (keep it simple)
 * - Fetch additional profile data (done in components)
 * - Manage complex role logic (done in components)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSession = async () => {
    try {
      console.log("🔄 Loading auth session...")
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.warn("⚠️ Auth error:", error.message)
        setUser(null)
      } else if (user) {
        console.log("✅ Session found:", user.email)
        setUser(user)
      } else {
        console.log("ℹ️ No session")
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Session load error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load session on mount
    loadSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth event:", event)
        
        if (session?.user) {
          console.log("✅ Signed in:", session.user.email)
          setUser(session.user)
        } else {
          console.log("🚪 Signed out")
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    console.log("🚪 Logging out...")
    await supabase.auth.signOut()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
