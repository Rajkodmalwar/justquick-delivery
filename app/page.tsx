// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { HeroSection } from "@/components/home/hero-section"
import { SearchAndLocation } from "@/components/home/search-and-location"
import { PromoBanner } from "@/components/home/promo-banner"
import { ShopGrid } from "@/components/home/shop-grid"
import { RecentOrders } from "@/components/home/recent-orders"
import { FeaturesGrid } from "@/components/home/features-grid"
import { CategoriesSection } from "@/components/home/categories-section"
import { TrendingSection } from "@/components/home/trending-section"
import { PartnerSection } from "@/components/home/partner-section"
import { BottomNav } from "@/components/home/bottom-nav"
import { NotificationToast } from "@/components/home/notification-toast"

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
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [lastNotification, setLastNotification] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch shops on mount
  useEffect(() => {
    fetchShops()
  }, [])

  // Fetch user data only for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentOrders()
      fetchRecentNotifications()
      const unsubscribe = setupRealtimeNotifications()
      return () => unsubscribe?.()
    }
  }, [isAuthenticated, user])

  // Filter shops based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredShops(shops)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredShops(
        shops.filter((shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.category.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, shops])

  const fetchShops = async () => {
    try {
      const response = await fetch("/api/shops")
      if (response.ok) {
        const data = await response.json()
        const shopsData = data.shops || []
        setShops(shopsData)
        setFilteredShops(shopsData)
      }
    } catch (error) {
      console.error("Error fetching shops:", error)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`/api/orders?user_id=${user?.id}&limit=3`)
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
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
      console.error("Error fetching notifications:", error)
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

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-20 md:pb-0">
      <NotificationToast
        notification={lastNotification}
        show={showNotificationToast}
        onDismiss={() => setShowNotificationToast(false)}
      />

      {/* Hero Section */}
      <HeroSection
        isAuthenticated={isAuthenticated}
        unreadNotifications={unreadNotifications}
      />

      {/* Promo Banner */}
      <PromoBanner isAuthenticated={isAuthenticated} />

      {/* Search & Location */}
      <SearchAndLocation onSearch={setSearchQuery} />

      {/* Featured Shops */}
      <ShopGrid
        shops={filteredShops.slice(0, 6).map((shop) => ({
          id: shop.id,
          name: shop.name,
          category: shop.category,
          rating: shop.rating || 4.5,
          deliveryTime: shop.delivery_time || 9,
          deliveryFee: shop.delivery_fee || 2.99,
          distance: shop.location ? 0.5 : 1,
          image: shop.image_url,
        }))}
        title="Featured Shops"
        viewAllLink="/shops"
      />

      {/* Quick Reorder Section */}
      {isAuthenticated && (
        <RecentOrders
          orders={recentOrders.map((order) => ({
            id: order.id,
            shopName: "Your Shop",
            totalPrice: order.total_price,
            status: order.status,
            createdAt: order.created_at,
            itemCount: order.items?.length || 0,
          }))}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Trending Section */}
      <TrendingSection />

      {/* Partner Section */}
      <PartnerSection />

      {/* Bottom Navigation */}
      <BottomNav
        notificationCount={unreadNotifications}
        isAuthenticated={isAuthenticated}
      />
    </main>
  )
}