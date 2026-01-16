"use client"

import { useEffect } from "react"
import useSWR, { mutate } from "swr"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Package, Store, BarChart3, Wallet, ShoppingCart, TrendingUp, CheckCircle, Clock } from "lucide-react"
import { redirect } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPage() {
  redirect("/admin/login")
}

function AdminDashboard() {
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        mutate("/api/orders?scope=admin")
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your hyperlocal delivery platform</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <span className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
          Live Updates
        </Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
          <TabsTrigger
            value="analytics"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
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
            value="commissions"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wallet className="h-4 w-4" />
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>
        <TabsContent value="orders">
          <AdminOrders />
        </TabsContent>
        <TabsContent value="shops">
          <AdminShops />
        </TabsContent>
        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>
        <TabsContent value="commissions">
          <AdminCommissions />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function AdminAnalytics() {
  const { data: ordersResp } = useSWR("/api/orders?scope=admin", fetcher)
  const orders = ordersResp?.orders || []

  const grouped = useMemo(() => {
    const map = new Map<string, { date: string; count: number; revenue: number }>()
    for (const o of orders) {
      const day = new Date(o.created_at).toISOString().slice(0, 10)
      const prev = map.get(day) || { date: day, count: 0, revenue: 0 }
      prev.count += 1
      prev.revenue += Number(o.total_price) || 0
      map.set(day, prev)
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1))
  }, [orders])

  const totals = useMemo(
    () => ({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0),
      delivered: orders.filter((o: any) => o.status === "delivered").length,
      pending: orders.filter((o: any) => o.status === "pending").length,
    }),
    [orders],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Orders",
            value: totals.totalOrders,
            icon: ShoppingCart,
            color: "from-blue-500/20 to-blue-500/5",
          },
          {
            title: "Total Revenue",
            value: `₹${totals.totalRevenue.toFixed(0)}`,
            icon: TrendingUp,
            color: "from-emerald-500/20 to-emerald-500/5",
          },
          {
            title: "Delivered",
            value: totals.delivered,
            icon: CheckCircle,
            color: "from-purple-500/20 to-purple-500/5",
          },
          { title: "Pending", value: totals.pending, icon: Clock, color: "from-orange-500/20 to-orange-500/5" },
        ].map((stat) => (
          <Card key={stat.title} className="card-hover bg-card border-border overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Orders & Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Orders", color: "hsl(var(--chart-1))" },
              revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
            }}
            className="h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grouped} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" name="Orders" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminOrders() {
  const { data, isLoading } = useSWR("/api/orders?scope=admin", fetcher)
  if (isLoading) return <div className="text-center py-8">Loading orders...</div>
  const orders = data?.orders || []

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Orders</CardTitle>
        <Badge variant="outline">{orders.length} total</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((o: any) => {
          const statusColors: Record<string, string> = {
            accepted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            ready: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            picked_up: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
            delivered: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            rejected: "bg-red-500/20 text-red-400 border-red-500/30",
            pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          }
          return (
            <div key={o.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">#{o.id.slice(0, 8)}</span>
                    <Badge className={`${statusColors[o.status] || statusColors.pending}`}>{o.status}</Badge>
                  </div>
                  <p className="font-medium">{o.buyer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{o.total_price} • {o.payment_type} • {o.payment_status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AssignDelivery orderId={o.id} />
                  <UpdateStatus orderId={o.id} />
                </div>
              </div>
            </div>
          )
        })}
        {orders.length === 0 && <div className="text-center py-8 text-muted-foreground">No orders yet</div>}
      </CardContent>
    </Card>
  )
}

function AssignDelivery({ orderId }: { orderId: string }) {
  async function assign() {
    const id = prompt("DeliveryBoy UUID to assign:")
    if (!id) return
    const res = await fetch(`/api/orders/${orderId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_boy_id: id }),
    })
    if (!res.ok) alert("Failed to assign")
  }
  return (
    <Button variant="secondary" size="sm" onClick={assign}>
      Assign
    </Button>
  )
}

function UpdateStatus({ orderId }: { orderId: string }) {
  async function setStatus() {
    const status = prompt("Set status (pending, accepted, ready, picked_up, delivered, rejected):")
    if (!status) return
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) alert("Failed to update")
  }
  return (
    <Button size="sm" onClick={setStatus}>
      Update
    </Button>
  )
}

function AdminShops() {
  const { data, mutate } = useSWR("/api/shops", fetcher)
  async function addShop(formData: FormData) {
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch("/api/shops", { method: "POST", body: JSON.stringify(payload) })
    if (!res.ok) alert("Failed to add shop")
    mutate()
  }
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Manage Shops</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={addShop} className="grid gap-3 sm:grid-cols-5">
          <Input name="name" placeholder="Shop name" required className="bg-secondary border-border" />
          <Input name="lat" placeholder="Latitude" required className="bg-secondary border-border" />
          <Input name="lng" placeholder="Longitude" required className="bg-secondary border-border" />
          <Input name="contact" placeholder="Contact" className="bg-secondary border-border" />
          <Button type="submit" className="btn-glow">
            Add Shop
          </Button>
        </form>
        <div className="space-y-2">
          {data?.shops?.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.lat}, {s.lng}
                </p>
              </div>
              <Badge variant="outline">{s.id.slice(0, 8)}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AdminProducts() {
  const { data: products, mutate } = useSWR("/api/products", fetcher)
  async function addProduct(formData: FormData) {
    const payload = Object.fromEntries(formData.entries())
    const res = await fetch("/api/products", { method: "POST", body: JSON.stringify(payload) })
    if (!res.ok) alert("Failed to add product")
    mutate()
  }
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Manage Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={addProduct} className="grid gap-3 sm:grid-cols-5">
          <Input name="shop_id" placeholder="Shop UUID" required className="bg-secondary border-border" />
          <Input name="name" placeholder="Product name" required className="bg-secondary border-border" />
          <Input name="price" placeholder="Price" required className="bg-secondary border-border" />
          <Input name="image" placeholder="Image URL" className="bg-secondary border-border" />
          <Button type="submit" className="btn-glow">
            Add Product
          </Button>
        </form>
        <div className="space-y-2">
          {products?.products?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{p.price} • Shop: {p.shop_id?.slice(0, 8)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AdminCommissions() {
  const { data, mutate } = useSWR("/api/commissions", fetcher)
  const commissions = data?.commissions || []

  async function markPaid(id: string) {
    const res = await fetch(`/api/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid_status: "paid" }),
    })
    if (!res.ok) alert("Failed to update")
    mutate()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Delivery Commissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {commissions.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
            <div>
              <p className="font-medium">₹{Number(c.amount)}</p>
              <p className="text-sm text-muted-foreground">
                Order: {c.order_id?.slice(0, 8)} • Rider: {c.delivery_boy_id?.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={c.paid_status === "paid" ? "default" : "outline"}>{c.paid_status}</Badge>
              {c.paid_status !== "paid" && (
                <Button size="sm" onClick={() => markPaid(c.id)}>
                  Mark Paid
                </Button>
              )}
            </div>
          </div>
        ))}
        {commissions.length === 0 && <div className="text-center py-8 text-muted-foreground">No commissions yet</div>}
      </CardContent>
    </Card>
  )
}
