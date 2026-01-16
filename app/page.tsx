// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesGrid } from "@/components/home/features-grid"
import { CategoriesSection } from "@/components/home/categories-section"
import { DashboardSection } from "@/components/home/dashboard-section"
import { TrendingSection } from "@/components/home/trending-section"
import { PartnerSection } from "@/components/home/partner-section"
import { NotificationToast } from "@/components/home/notification-toast"

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [lastNotification, setLastNotification] = useState<any>(null)

  // Fetch data only for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentOrders()
      fetchRecentNotifications()
      const unsubscribe = setupRealtimeNotifications()
      return () => unsubscribe?.()
    }
  }, [isAuthenticated, user])

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
      .on('broadcast', { event: 'new-notification' }, (payload) => {
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
    setNotifications(prev => [notification, ...prev])
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length

  return (
    <main className="min-h-screen bg-slate-950">
      <NotificationToast
        notification={lastNotification}
        show={showNotificationToast}
        onDismiss={() => setShowNotificationToast(false)}
      />

      <HeroSection
        isAuthenticated={isAuthenticated}
        unreadNotifications={unreadNotifications}
      />

      <FeaturesGrid />

      <CategoriesSection />

      {isAuthenticated && user && (
        <DashboardSection
          recentOrders={recentOrders}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
        />
      )}

      <TrendingSection />

      <PartnerSection />
    </main>
  )
}