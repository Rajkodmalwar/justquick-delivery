// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import { HeroBannerSimple } from "@/components/home/hero-banner-simple"
import { CategoryGridSimple } from "@/components/home/category-grid-simple"
import { NearbyShops } from "@/components/home/nearby-shops"
import { NotificationToast } from "@/components/home/notification-toast"
import { useCart } from "@/components/buyer/cart-context"

interface Shop {
  id: string
  name: string
  category: string
  rating: number
  delivery_time: number
  delivery_fee: number
  location: string
  latitude?: number
  longitude?: number
  image_url?: string
}

interface Order {
  id: string
  shop_id: string
  total_price: number
  status: string
  created_at: string
  items: any[]
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const { items: cartItems } = useCart()
  const [shops, setShops] = useState<Shop[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [lastNotification, setLastNotification] = useState<any>(null)

  // Fetch shops on mount
  useEffect(() => {
    fetchShops()
  }, [])

  // Fetch user data only for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentNotifications()
      const unsubscribe = setupRealtimeNotifications()
      return () => unsubscribe?.()
    }
  }, [isAuthenticated, user])

  const fetchShops = async () => {
    try {
      const response = await fetch("/api/shops")
      if (response.ok) {
        const data = await response.json()
        const shopsData = data.shops || []
        setShops(shopsData)
      }
    } catch (error) {
      logger.error("Error fetching shops:", error)
    }
  }

  const fetchRecentNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?limit=5`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      logger.error("Error fetching notifications:", error)
    }
  }

  const setupRealtimeNotifications = () => {
    if (!user) return

    const userChannel = supabase.channel(`notifications-user-${user.id}`)

    userChannel
      .on("broadcast", { event: "new-notification" }, (payload) => {
        handleNewNotification(payload.payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(userChannel)
    }
  }

  const handleNewNotification = (notification: any) => {
    setLastNotification(notification)
    setShowNotificationToast(true)
    setNotifications((prev) => [notification, ...prev])
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read).length
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="min-h-screen bg-white pb-20 md:pb-0">
      <NotificationToast
        notification={lastNotification}
        show={showNotificationToast}
        onDismiss={() => setShowNotificationToast(false)}
      />

      <HeroBannerSimple />

      {/* Category Grid */}
      <CategoryGridSimple />

      {/* Nearby Shops */}
      <NearbyShops
        shops={shops.map((shop) => ({
          id: shop.id,
          name: shop.name,
          category: shop.category,
          rating: shop.rating || 4.5,
          deliveryTime: shop.delivery_time || 9,
          deliveryFee: shop.delivery_fee || 2.99,
          distance: shop.location ? 0.5 : 1,
          image: shop.image_url,
        }))}
      />
    </main>
  )
}