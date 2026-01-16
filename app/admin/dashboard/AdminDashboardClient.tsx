"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase/client"
import {
  ShoppingCart,
  Store,
  Package,
  Truck,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  LogOut,
} from "lucide-react"

// Import ALL your existing components (keep them as they are)
import AdminOrders from "./AdminOrders"
import AdminShops from "./AdminShops"
import AdminProducts from "./AdminProducts"
import AdminDeliveryBoys from "./AdminDeliveryBoys"
import AdminNotifications from "./AdminNotifications"
import AdminAnalytics from "./AdminAnalytics"
import AdminCommissions from "./AdminCommissions"
import AdminSettings from "./AdminSettings"

interface AdminDashboardClientProps {
  initialOrders: any[]
  initialShops: any[]
  initialDeliveryBoys: any[]
  user: any
}

export default function AdminDashboardClient({
  initialOrders,
  initialShops,
  initialDeliveryBoys,
  user
}: AdminDashboardClientProps) {
  const router = useRouter()
  const [autoAssign, setAutoAssign] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header - same as before */}
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

      {/* Tabs - same as before */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="shops" className="gap-2">
            <Store className="h-4 w-4" />
            Shops
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="delivery-boys" className="gap-2">
            <Truck className="h-4 w-4" />
            Delivery Boys
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-2">
            <Wallet className="h-4 w-4" />
            Commissions
          </TabsTrigger>
        </TabsList>

        {/* Content - using your existing components */}
        <TabsContent value="orders">
          <AdminOrders 
            initialOrders={initialOrders}
            initialShops={initialShops}
            initialDeliveryBoys={initialDeliveryBoys}
            autoAssign={autoAssign}
          />
        </TabsContent>
        <TabsContent value="shops">
          <AdminShops initialShops={initialShops} />
        </TabsContent>
        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>
        <TabsContent value="delivery-boys">
          <AdminDeliveryBoys initialDeliveryBoys={initialDeliveryBoys} />
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