"use client"

import dynamic from 'next/dynamic'
import { useAuth } from "@/components/auth/auth-provider"

// Dynamically import NotificationBell to avoid SSR issues
const NotificationBell = dynamic(
  () => import("@/components/notifications/NotificationBell"),
  { ssr: false }
)

export default function NotificationBellClient() {
  const { user } = useAuth()
  
  if (!user) return null
  
  const userRole = user.role || 'buyer'
  
  return (
    <NotificationBell 
      userId={user.id} 
      userRole={userRole} 
    />
  )
}