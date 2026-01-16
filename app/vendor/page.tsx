"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { supabase } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  ChefHat,
  Loader2,
  MapPin,
  Phone,
  User,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const fetcher = (u: string) => fetch(u).then((r) => r.json())
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

export default function VendorDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shopIdFromUrl = searchParams.get("shop") || ""
  const [shopId, setShopId] = useState(shopIdFromUrl)
  const [shopName, setShopName] = useState("")
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("jq_vendor")
    if (stored) {
      try {
        const { shopId: storedShopId, shopName: storedShopName } = JSON.parse(stored)
        if (storedShopId && !shopIdFromUrl) {
          setShopId(storedShopId)
        }
        if (storedShopName) {
          setShopName(storedShopName)
        }
      } catch {
        // Invalid data
      }
    }

    if (shopIdFromUrl) {
      setShopId(shopIdFromUrl)
    }
  }, [shopIdFromUrl])

  const trimmed = shopId.trim()
  const isValidUuid = UUID_RE.test(trimmed)

  useEffect(() => {
    if (!isValidUuid) return
    const channel = supabase
      .channel("orders-vendor")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        mutate(`/api/orders?shop_id=${trimmed}`)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [isValidUuid, trimmed])

  const { data, isLoading } = useSWR(isValidUuid ? `/api/orders?shop_id=${trimmed}` : null, fetcher)
  const {
    data: productsData,
    isLoading: productsLoading,
    mutate: mutateProducts,
  } = useSWR(isValidUuid ? `/api/products?shop_id=${trimmed}` : null, fetcher)

  const orders = data?.orders || []
  const products = productsData?.products || []

  const pendingOrders = orders.filter((o: any) => o.status === "pending")
  const acceptedOrders = orders.filter((o: any) => o.status === "accepted")
  const readyOrders = orders.filter((o: any) => o.status === "ready")
  const completedOrders = orders.filter((o: any) => ["picked_up", "delivered", "rejected"].includes(o.status))

  const handleLogout = () => {
    localStorage.removeItem("jq_vendor")
    router.push("/partner/vendor")
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, shop_id: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to update order")
        return
      }
      toast.success(
        `Order ${status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "marked as ready"}!`,
      )
      mutate(`/api/orders?shop_id=${trimmed}`)
    } catch (error) {
      toast.error("Failed to update order")
    } finally {
      setUpdatingOrder(null)
    }
  }

  const toggleProductAvailability = async (productId: string, currentStatus: boolean) => {
    setUpdatingProduct(productId)
    try {
      const res = await fetch(`/api/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          is_available: !currentStatus,
          shop_id: trimmed,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to update product")
        return
      }
      toast.success(`Product marked as ${!currentStatus ? "available" : "unavailable"}`)
      mutateProducts()
    } catch (error) {
      toast.error("Failed to update product")
    } finally {
      setUpdatingProduct(null)
    }
  }

  if (!isValidUuid) {
    router.push("/partner/vendor")
    return null
  }

  const OrderCard = ({ order, showActions = false }: { order: any; showActions?: boolean }) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: "bg-amber-500/20 text-amber-600 border-amber-500/30", icon: Clock, label: "Pending" },
      accepted: {
        color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
        icon: CheckCircle,
        label: "Accepted",
      },
      ready: { color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: Package, label: "Ready for Pickup" },
      rejected: { color: "bg-red-500/20 text-red-600 border-red-500/30", icon: XCircle, label: "Rejected" },
      picked_up: { color: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30", icon: Package, label: "Picked Up" },
      delivered: { color: "bg-gray-500/20 text-gray-600 border-gray-500/30", icon: CheckCircle, label: "Delivered" },
    }
    const config = statusConfig[order.status] || statusConfig.pending
    const StatusIcon = config.icon

    return (
      <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">#{order.id.slice(0, 8)}</span>
              <Badge className={config.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {order.buyer_name}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {order.buyer_contact}
              </p>
              {order.buyer_address && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {order.buyer_address}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">₹{order.total_price}</p>
            <p className="text-sm text-muted-foreground">
              {order.payment_type} •{" "}
              <span className={order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}>
                {order.payment_status}
              </span>
            </p>
          </div>
        </div>

        {Array.isArray(order.products) && order.products.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="text-sm font-medium mb-2">Order Items ({order.products.length})</p>
            <div className="space-y-1">
              {order.products.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {p.name} <span className="text-muted-foreground">× {p.quantity}</span>
                  </span>
                  <span className="font-medium">₹{p.price * p.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showActions && order.status === "pending" && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              className="flex-1"
              onClick={() => updateOrderStatus(order.id, "accepted")}
              disabled={updatingOrder === order.id}
            >
              {updatingOrder === order.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Accept Order
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => updateOrderStatus(order.id, "rejected")}
              disabled={updatingOrder === order.id}
            >
              {updatingOrder === order.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
          </div>
        )}

        {showActions && order.status === "accepted" && (
          <div className="pt-2 border-t border-border">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => updateOrderStatus(order.id, "ready")}
              disabled={updatingOrder === order.id}
            >
              {updatingOrder === order.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChefHat className="h-4 w-4 mr-2" />
              )}
              Mark as Ready for Pickup
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">{new Date(order.created_at).toLocaleString()}</p>
      </div>
    )
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          {shopName && <p className="text-muted-foreground">{shopName}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-primary border-primary">
            <Package className="h-4 w-4 mr-2" />
            {pendingOrders.length} Pending
          </Badge>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedOrders.length})</TabsTrigger>
            <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            <TabsTrigger value="products">
              <Store className="h-4 w-4 mr-1" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <EmptyState message="No pending orders" />
            ) : (
              pendingOrders.map((order: any) => <OrderCard key={order.id} order={order} showActions />)
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedOrders.length === 0 ? (
              <EmptyState message="No accepted orders being prepared" />
            ) : (
              acceptedOrders.map((order: any) => <OrderCard key={order.id} order={order} showActions />)
            )}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            {readyOrders.length === 0 ? (
              <EmptyState message="No orders ready for pickup" />
            ) : (
              readyOrders.map((order: any) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <EmptyState message="No completed orders yet" />
            ) : (
              completedOrders.map((order: any) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Manage Product Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <EmptyState message="No products in your shop yet" />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product: any) => (
                      <div
                        key={product.id}
                        className={`p-4 rounded-xl border transition-all ${
                          product.is_available !== false
                            ? "bg-card border-border"
                            : "bg-muted/50 border-destructive/30 opacity-75"
                        }`}
                      >
                        <div className="flex gap-4">
                          {(product.photo || product.image) && (
                            <div
                              className={`h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0 ${
                                product.is_available === false ? "grayscale" : ""
                              }`}
                            >
                              <img
                                src={product.photo || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{product.name}</h4>
                            <p className="text-primary font-bold text-lg">₹{product.price}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Switch
                                checked={product.is_available !== false}
                                onCheckedChange={() =>
                                  toggleProductAvailability(product.id, product.is_available !== false)
                                }
                                disabled={updatingProduct === product.id}
                              />
                              <span
                                className={`text-sm ${
                                  product.is_available !== false ? "text-emerald-600" : "text-destructive"
                                }`}
                              >
                                {updatingProduct === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : product.is_available !== false ? (
                                  "Available"
                                ) : (
                                  "Unavailable"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}
