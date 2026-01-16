"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Package, Wallet, TrendingUp } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function AdminAnalytics() {
  const { data: ordersData } = useSWR("/api/orders?scope=admin", fetcher)
  const orders = ordersData?.orders || []

  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length
  const pendingOrders = orders.filter((o: any) => o.status === "pending").length
  const inProgressOrders = orders.filter((o: any) => 
    ["accepted", "ready", "picked_up"].includes(o.status)
  ).length
  
  const totalRevenue = orders
    .filter((o: any) => o.status === "delivered")
    .reduce((sum: number, o: any) => sum + (o.total_price || 0), 0)
  
  const averageOrderValue = deliveredOrders > 0 
    ? Math.round(totalRevenue / deliveredOrders)
    : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-3xl font-bold text-emerald-500">{deliveredOrders}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-amber-500">{pendingOrders}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-3xl font-bold text-primary">₹{totalRevenue}</p>
              <p className="text-xs text-muted-foreground">Avg: ₹{averageOrderValue}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Order Status Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-secondary/50">
                <p className="text-2xl font-bold text-blue-500">{inProgressOrders}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-500/10">
                <p className="text-2xl font-bold text-emerald-500">{deliveredOrders}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-500/10">
                <p className="text-2xl font-bold text-amber-500">{pendingOrders}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/50">
                <p className="text-2xl font-bold text-primary">
                  {deliveredOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}