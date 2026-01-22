"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

export interface Buyer {
  id: string
  email: string
  user_metadata?: {
    name?: string
    phone?: string
  }
}

export function useBuyer() {
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setBuyer({
          id: user.id,
          email: user.email!,
          user_metadata: user.user_metadata
        })
      }
      
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes - THIS IS WHAT SessionChecker WAS DOING
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.log("Auth state changed:", event)
        
        if (session?.user) {
          setBuyer({
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata
          })
        } else {
          setBuyer(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return {
    buyer,
    loading,
    isAuthenticated: !!buyer,
    logout
  }
}