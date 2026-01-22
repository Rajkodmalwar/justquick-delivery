"use client"


import { logger } from '@/lib/logger'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
}

interface Buyer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  role?: string
}

interface CartContextType {
  items: CartItem[]
  total: number
  buyer: Buyer | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isBuyer: boolean
  add: (item: { product_id: string; name: string; price: number }) => void
  remove: (productId: string) => void
  dec: (productId: string) => void
  clear: () => void
  setBuyer: (buyer: Buyer) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
  getItemCount: () => number
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, profile, loading: authLoading, isAdmin: authIsAdmin, isBuyer: authIsBuyer, logout } = useAuth()
  
  const [items, setItems] = useState<CartItem[]>([])
  const [buyer, setBuyer] = useState<Buyer | null>(null)

  // Sync auth state to buyer state
  useEffect(() => {
    if (!authLoading) {
      if (user && profile) {
        // User is authenticated and profile loaded
        const buyerData: Buyer = {
          id: user.id,
          name: profile.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: profile.phone || user.user_metadata?.phone || '',
          address: profile.address || user.user_metadata?.address || '',
          role: profile.role
        }
        logger.log("✅ Buyer data synced from auth context:", buyerData)
        setBuyer(buyerData)
        localStorage.setItem("jq_buyer", JSON.stringify(buyerData))
        
        // Clear cart if admin
        if (authIsAdmin) {
          logger.log("⚠️ Admin detected - clearing cart")
          setItems([])
          localStorage.removeItem("jq_cart")
        } else {
          // Load cart from localStorage for buyers
          const savedCart = localStorage.getItem("jq_cart")
          if (savedCart) {
            try {
              const parsed = JSON.parse(savedCart)
              setItems(Array.isArray(parsed) ? parsed : [])
            } catch (error) {
              logger.error("Error parsing cart:", error)
              setItems([])
            }
          }
        }
      } else if (!user) {
        // User not authenticated
        logger.log("❌ No user authenticated")
        setBuyer(null)
        localStorage.removeItem("jq_buyer")
        
        // Load cart from localStorage for anonymous users
        const savedCart = localStorage.getItem("jq_cart")
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart)
            setItems(Array.isArray(parsed) ? parsed : [])
          } catch (error) {
            logger.error("Error parsing cart:", error)
            setItems([])
          }
        }
      }
    }
  }, [user, profile, authLoading, authIsAdmin])

  // Save cart to localStorage (not for admins)
  useEffect(() => {
    if (!authLoading && !authIsAdmin) {
      localStorage.setItem("jq_cart", JSON.stringify(items))
    }
  }, [items, authLoading, authIsAdmin])

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Add item to cart - ONLY if buyer
  const add = (newItem: { product_id: string; name: string; price: number }) => {
    if (authIsAdmin) {
      logger.log("⚠️ Admin cannot add items to cart")
      return
    }
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === newItem.product_id)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product_id === newItem.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })
  }

  // Remove item completely - ONLY if buyer
  const remove = (productId: string) => {
    if (authIsAdmin) return
    setItems(prevItems => prevItems.filter(item => item.product_id !== productId))
  }

  // Decrease quantity - ONLY if buyer
  const dec = (productId: string) => {
    if (authIsAdmin) return
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === productId)
      
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        return prevItems.filter(item => item.product_id !== productId)
      }
    })
  }

  // Clear cart
  const clear = () => {
    setItems([])
    localStorage.removeItem("jq_cart")
  }

  // Update buyer info in profiles table
  const handleSetBuyer = async (buyerData: Buyer) => {
    try {
      // Only allow authenticated users to set buyer profile
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return // Guest users cannot set profile
      }
      const user = session.user

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: buyerData.name,
          phone: buyerData.phone,
          address: buyerData.address
        }
      })

      if (metadataError) {
        logger.error("Metadata update error:", metadataError)
        throw metadataError
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: buyerData.id,
          name: buyerData.name,
          phone: buyerData.phone,
          address: buyerData.address,
          email: buyerData.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        logger.warn("Could not update profiles table:", profileError.message)
      }

      // Update local state
      setBuyer(buyerData)
      
      // Store in localStorage
      localStorage.setItem("jq_buyer", JSON.stringify(buyerData))
      
      logger.log("✅ Buyer info updated and synced")
    } catch (error) {
      logger.error("Error updating buyer:", error)
      throw error
    }
  }

  // Refresh user data from auth context
  const refreshUser = useCallback(async () => {
    try {
      logger.log("📝 Refreshing user profile from auth...")
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        logger.log("❌ No session found")
        return
      }

      // Refetch profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        logger.error("Error refetching profile:", error)
        return
      }

      if (profile) {
        const refreshedBuyer: Buyer = {
          id: session.user.id,
          name: profile.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: profile.phone || session.user.user_metadata?.phone || '',
          address: profile.address || session.user.user_metadata?.address || '',
          role: profile.role
        }
        logger.log("✅ User profile refreshed:", refreshedBuyer)
        setBuyer(refreshedBuyer)
        localStorage.setItem("jq_buyer", JSON.stringify(refreshedBuyer))
      }
    } catch (error) {
      logger.error("Error in refreshUser:", error)
    }
  }, [])

  // Get total item count
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  // Get quantity for specific product
  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.product_id === productId)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider value={{
      items,
      total,
      buyer,
      isAuthenticated: !!user,
      isLoading: authLoading,
      isAdmin: authIsAdmin,
      isBuyer: authIsBuyer,
      add,
      remove,
      dec,
      clear,
      setBuyer: handleSetBuyer,
      refreshUser,
      logout,
      getItemCount,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

