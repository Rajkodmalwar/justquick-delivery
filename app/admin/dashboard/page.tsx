"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import {
  ShoppingCart,
  Store,
  Package,
  Truck,
  BarChart3,
  Wallet,
  LogOut,
  Bell,
  Settings,
} from "lucide-react"
import AdminCommissions from "./AdminCommissions"
import AdminAnalytics from "./AdminAnalytics"
import AdminNotifications from "./AdminNotifications"
import AdminSettings from "./AdminSettings"
import AdminDeliveryBoys from "./AdminDeliveryBoys"
import AdminOrders from "./AdminOrders"
import AdminShops from "./AdminShops"
import AdminProducts from "./AdminProducts"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [autoAssign, setAutoAssign] = useState(false)

  useEffect(() => {
    const checkAdminSession = async () => {
      // Check if session exists first
      const { data: { session } } = await supabase.auth.getSession();
      
      // No session = not logged in = redirect to login
      if (!session?.user) {
        router.push("/admin/login");
        return;
      }
      
      // Session exists, allow access (middleware already verified admin role)
      setIsAdmin(true);
    };

    checkAdminSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setIsAdmin(false);
        router.push("/admin/login");
      }
    });

    return () => subscription?.unsubscribe();
  }, [router])

  useEffect(() => {
    if (!isAdmin) return
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        mutate("/api/orders?scope=admin")
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAdmin])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (!isAdmin) return null

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your hyperlocal delivery platform</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50 border border-border">
            <span className="text-sm">Auto-assign</span>
            <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">Admin Portal</Badge>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
          <TabsTrigger
            value="orders"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="shops"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Store className="h-4 w-4" />
            Shops
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger
            value="delivery-boys"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Truck className="h-4 w-4" />
            Delivery Boys
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="commissions"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wallet className="h-4 w-4" />
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <AdminOrders autoAssign={autoAssign} />
        </TabsContent>
        <TabsContent value="shops">
          <AdminShops />
        </TabsContent>
        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>
        <TabsContent value="delivery-boys">
          <AdminDeliveryBoys />
        </TabsContent>
        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
        <TabsContent value="notifications">
          <AdminNotifications />
        </TabsContent>
        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>
        <TabsContent value="commissions">
          <AdminCommissions />
        </TabsContent>
      </Tabs>
    </main>
  )
}