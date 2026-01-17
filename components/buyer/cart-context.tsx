"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
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
  role?: string // Add role field
}

interface CartContextType {
  items: CartItem[]
  total: number
  buyer: Buyer | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean // Add this
  isBuyer: boolean // Add this
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
  const [items, setItems] = useState<CartItem[]>([])
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isBuyer, setIsBuyer] = useState(false)

  // Load user data from Supabase
  const loadUserData = useCallback(async (user: User) => {
    try {
      console.log("Loading user data for:", user.id)
      
      // Get user role from metadata
      const role = user.user_metadata?.role || "buyer"
      console.log("User role:", role)
      
      // Try to fetch user profile from database (profiles table)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn("Profile fetch error:", profileError.message)
      }

      // Use profile data if available, otherwise use user_metadata
      const buyerData: Buyer = {
        id: user.id,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: profile?.phone || user.user_metadata?.phone || user.phone || '',
        address: profile?.address || user.user_metadata?.address || '',
        role: role
      }

      console.log("✅ User loaded in cart:", { ...buyerData, role })
      setBuyer(buyerData)
      setIsAuthenticated(true)
      
      // Set role flags
      setIsAdmin(role === "admin")
      setIsBuyer(role === "buyer" || !role) // Default to buyer if no role
      
      setAuthChecked(true)
      
      // Store in localStorage for fallback
      localStorage.setItem("jq_buyer", JSON.stringify(buyerData))
    } catch (error) {
      console.error("Error loading user data:", error)
      // Fallback to user metadata
      const role = user.user_metadata?.role || "buyer"
      const buyerData: Buyer = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.user_metadata?.phone || user.phone || '',
        address: user.user_metadata?.address || '',
        role: role
      }
      setBuyer(buyerData)
      setIsAuthenticated(true)
      setIsAdmin(role === "admin")
      setIsBuyer(role === "buyer" || !role)
      setAuthChecked(true)
    }
  }, [])

  // Initialize cart and auth
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Get user
      const { data: { user }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError) {
        console.error("User error:", sessionError)
      }
      
      if (user) {
        console.log("✅ Found user:", user.email)
        await loadUserData(user)
        
        // If user is admin, don't show buyer cart - admin shouldn't shop
        const role = user.user_metadata?.role
        if (role === "admin") {
          console.log("⚠️ Admin detected - clearing cart context")
          setItems([]) // Clear cart for admin
          localStorage.removeItem("jq_cart")
        }
      } else {
        console.log("❌ No session found")
        setIsAuthenticated(false)
        setBuyer(null)
        setIsAdmin(false)
        setIsBuyer(false)
        setAuthChecked(true)
      }

      // Load cart from localStorage ONLY if not admin
      const savedCart = localStorage.getItem("jq_cart")
      if (savedCart && !isAdmin) {
        try {
          const parsed = JSON.parse(savedCart)
          setItems(Array.isArray(parsed) ? parsed : [])
        } catch (error) {
          console.error("Error parsing cart:", error)
          setItems([])
        }
      }
    } catch (error) {
      console.error("Error initializing cart:", error)
    } finally {
      setIsLoading(false)
      setAuthChecked(true)
    }
  }, [loadUserData])

  // Load user session and cart
  useEffect(() => {
    initialize()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "has session:", !!session)
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          await loadUserData(session.user)
          
          // Clear cart if admin logs in
          const role = session.user.user_metadata?.role
          if (role === "admin") {
            setItems([])
            localStorage.removeItem("jq_cart")
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setBuyer(null)
        setIsAdmin(false)
        setIsBuyer(false)
        setAuthChecked(true)
        localStorage.removeItem("jq_buyer")
      } else if (event === 'INITIAL_SESSION') {
        // Initial session loaded
        if (session?.user) {
          await loadUserData(session.user)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [initialize, loadUserData])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await loadUserData(user)
      } else {
        setIsAuthenticated(false)
        setBuyer(null)
        setIsAdmin(false)
        setIsBuyer(false)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }, [loadUserData])

  // Save cart to localStorage ONLY if buyer
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      localStorage.setItem("jq_cart", JSON.stringify(items))
    }
  }, [items, isLoading, isAdmin])

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Add item to cart - ONLY if buyer
  const add = (newItem: { product_id: string; name: string; price: number }) => {
    if (isAdmin) {
      console.log("⚠️ Admin cannot add items to cart")
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
    if (isAdmin) return
    setItems(prevItems => prevItems.filter(item => item.product_id !== productId))
  }

  // Decrease quantity - ONLY if buyer
  const dec = (productId: string) => {
    if (isAdmin) return
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

  // Update buyer info and sync to Supabase profiles table
  const handleSetBuyer = async (buyerData: Buyer) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("Not authenticated when setting buyer")
        throw new Error("Not authenticated")
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: buyerData.name,
          phone: buyerData.phone,
          address: buyerData.address
        }
      })

      if (metadataError) {
        console.error("Metadata update error:", metadataError)
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
        console.warn("Could not update profiles table:", profileError.message)
      }

      // Update local state
      setBuyer(buyerData)
      setIsAuthenticated(true)
      
      // Store in localStorage
      localStorage.setItem("jq_buyer", JSON.stringify(buyerData))
      
      console.log("✅ Buyer info updated and synced")
    } catch (error) {
      console.error("Error updating buyer:", error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    setBuyer(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    setIsBuyer(false)
    localStorage.removeItem("jq_buyer")
    clear()
    router.refresh()
  }

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
      buyer: authChecked ? buyer : null,
      isAuthenticated: authChecked ? isAuthenticated : false,
      isLoading,
      isAdmin,
      isBuyer,
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