"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logger } from "@/lib/logger"
import { ShoppingCart, Truck, Store, User, MapPin, Package, Clock, IndianRupee, Filter, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface AdminOrdersProps {
  initialOrders?: any[]
  initialShops?: any[]
  initialDeliveryBoys?: any[]
  autoAssign?: boolean
}

export default function AdminOrders({ 
  initialOrders = [], 
  initialShops = [], 
  initialDeliveryBoys = [],
  autoAssign = false 
}: AdminOrdersProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)
  
  // Local state management
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [shops, setShops] = useState<any[]>(initialShops)
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>(initialDeliveryBoys)
  const [isLoading, setIsLoading] = useState(initialOrders.length === 0)
  const [currentlyUpdating, setCurrentlyUpdating] = useState<string | null>(null)

  // ✅ Stable fetch function
  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error) {
        setOrders(data || [])
      } else {
        logger.error("❌ Orders fetch error:", error)
      }
    } catch (err) {
      logger.error("❌ fetchOrders error:", err)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [])

  // ✅ Fetch delivery boys
  const fetchDeliveryBoys = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_boys")
        .select("*")
        .order("name", { ascending: true })

      if (!error) {
        setDeliveryBoys(data || [])
      } else {
        logger.error("❌ Delivery boys fetch error:", error)
      }
    } catch (err) {
      logger.error("❌ fetchDeliveryBoys error:", err)
    }
  }, [])

  // ✅ Initial fetch
  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (mounted && initialOrders.length === 0) {
        await fetchOrders(true)
      } else if (mounted) {
        setIsLoading(false)
      }
      
      await fetchDeliveryBoys()
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [fetchOrders, fetchDeliveryBoys, initialOrders.length])

  // ✅ Manual refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await fetchOrders(false)
      await fetchDeliveryBoys()
    } catch (err) {
      logger.error("❌ handleRefresh error:", err)
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, fetchOrders, fetchDeliveryBoys])

  const availableDrivers = deliveryBoys.filter((d: any) => d.is_available === true)
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter((order: any) => order.status === statusFilter)

  // ✅ ACCEPT ORDER - pending → accepted
  const acceptOrder = async (orderId: string) => {
    if (currentlyUpdating === orderId) return
    setCurrentlyUpdating(orderId)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "accepted" })
        .eq("id", orderId)

      if (error) throw error

      await fetchOrders(false)

    } catch (error: any) {
      logger.error("❌ acceptOrder error:", error)
      alert("Failed to accept order")
    } finally {
      setCurrentlyUpdating(null)
    }
  }

  // ✅ REJECT ORDER - pending → rejected
  const rejectOrder = async (orderId: string) => {
    if (currentlyUpdating === orderId) return
    setCurrentlyUpdating(orderId)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "rejected" })
        .eq("id", orderId)

      if (error) throw error

      await fetchOrders(false)

    } catch (error: any) {
      logger.error("❌ rejectOrder error:", error)
      alert("Failed to reject order")
    } finally {
      setCurrentlyUpdating(null)
    }
  }

  // ✅ ASSIGN DELIVERY BOY - accepted → assigned (NOW VALID!)
  const assignDeliveryBoy = async (orderId: string, deliveryBoyId: string) => {
    if (currentlyUpdating === orderId) return
    setCurrentlyUpdating(orderId)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          delivery_boy_id: deliveryBoyId,
          status: "assigned" // ✅ Now valid in database
        })
        .eq("id", orderId)
        .eq("status", "accepted")

      if (error) throw error

      await fetchOrders(false)

    } catch (error: any) {
      logger.error("❌ assignDeliveryBoy error:", error)
      alert("Failed to assign delivery boy")
    } finally {
      setCurrentlyUpdating(null)
    }
  }

  // ✅ MARK READY - assigned → ready
  const markReady = async (orderId: string) => {
    if (currentlyUpdating === orderId) return
    setCurrentlyUpdating(orderId)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "ready" })
        .eq("id", orderId)
        .eq("status", "assigned")

      if (error) throw error

      await fetchOrders(false)

    } catch (error: any) {
      logger.error("❌ markReady error:", error)
      alert("Failed to mark order as ready")
    } finally {
      setCurrentlyUpdating(null)
    }
  }

  // ✅ OUT FOR DELIVERY - ready → out_for_delivery (NOW VALID!)
  const markOutForDelivery = async (orderId: string) => {
    if (currentlyUpdating === orderId) return
    setCurrentlyUpdating(orderId)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "out_for_delivery" }) // ✅ Now valid
        .eq("id", orderId)
        .eq("status", "ready")

      if (error) throw error

      await fetchOrders(false)

    } catch (error: any) {
      logger.error("❌ markOutForDelivery error:", error)
      alert("Failed to mark order as out for delivery")
    } finally {
      setCurrentlyUpdating(null)
    }
  }

  // ✅ MARK DELIVERED - out_for_delivery → delivered
  const markDelivered = async (orderId: string) => {
    if (currentlyUpdating === orderId) return
    setCurrentlyUpdating(orderId)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId)
        .eq("status", "out_for_delivery")

      if (error) throw error

      await fetchOrders(false)

    } catch (error: any) {
      logger.error("❌ markDelivered error:", error)
      alert("Failed to mark order as delivered")
    } finally {
      setCurrentlyUpdating(null)
    }
  }

  // ✅ AUTO-ASSIGN FUNCTION
  async function handleAutoAssign() {
    if (autoAssigning) return
    setAutoAssigning(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const res = await fetch(`${baseUrl}/api/orders/auto-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor: "admin",
          actor_name: session?.user?.user_metadata?.name || "Admin",
          actor_id: session?.user?.id
        }),
      })

      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || "Auto-assign failed")
      }

      logger.log(`✅ Auto-assigned ${result.assigned || 0} orders`)
      
      await fetchOrders(false)
      
    } catch (error: any) {
      logger.error("💥 Auto-assign error:", error)
      alert("Failed to auto-assign orders")
    } finally {
      setAutoAssigning(false)
    }
  }

  // ✅ STATUS COLORS - All statuses now included
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    accepted: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    assigned: "bg-indigo-500/20 text-indigo-700 border-indigo-500/30",
    ready: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    out_for_delivery: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    picked_up: "bg-pink-500/20 text-pink-700 border-pink-500/30",
    delivered: "bg-green-500/20 text-green-700 border-green-500/30",
    rejected: "bg-red-500/20 text-red-700 border-red-500/30",
  }

  // ✅ GET STATUS ACTIONS - Complete workflow
  const getStatusActions = (order: any) => {
    const actions: Array<{label: string, action: () => void, variant: "default" | "destructive"}> = []
    
    const isUpdating = currentlyUpdating === order.id
    
    if (isUpdating) return actions
    
    const status = order.status || ""
    
    switch(status) {
      case "pending":
        actions.push(
          { label: "Accept", action: () => acceptOrder(order.id), variant: "default" },
          { label: "Reject", action: () => rejectOrder(order.id), variant: "destructive" }
        )
        break
        
      case "assigned":
        actions.push({ 
          label: "Mark Ready", 
          action: () => markReady(order.id), 
          variant: "default" 
        })
        break
        
      case "ready":
        actions.push({ 
          label: "Out for Delivery", 
          action: () => markOutForDelivery(order.id), 
          variant: "default" 
        })
        break
        
      case "out_for_delivery":
        actions.push({ 
          label: "Mark Delivered", 
          action: () => markDelivered(order.id), 
          variant: "default" 
        })
        break
    }
    
    return actions
  }

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Loading Orders...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Fetching orders...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ✅ MAIN UI
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            All Orders ({orders.length})
            <Badge variant="outline" className="ml-2">
              {filteredOrders.length} filtered
            </Badge>
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAutoAssign}
              disabled={autoAssigning || refreshing}
            >
              {autoAssigning ? (
                <>
                  <div className="h-3 w-3 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Auto-Assigning...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Auto-Assign Ready
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Delivery Boys Info */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          <p className="font-medium text-blue-800 mb-1">Delivery Boys Status:</p>
          <p className="text-blue-700">
            Total: {deliveryBoys.length} | 
            Available: {availableDrivers.length} | 
            Offline: {deliveryBoys.length - availableDrivers.length}
          </p>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No orders found</p>
            {statusFilter !== "all" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStatusFilter("all")}
                className="mt-4"
              >
                Clear Filter
              </Button>
            )}
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const shop = shops.find((s: any) => s.id === order.shop_id)
            const deliveryBoy = deliveryBoys.find((d: any) => d.id === order.delivery_boy_id)
            const statusActions = getStatusActions(order)
            const isUpdating = currentlyUpdating === order.id
            
            return (
              <div 
                key={order.id} 
                className={`p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-colors ${isUpdating ? 'opacity-80' : ''}`}
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className={`${statusColors[order.status] || ""} ${isUpdating ? 'animate-pulse' : ''}`}>
                        {order.status?.toUpperCase()}
                        {isUpdating && (
                          <span className="ml-1">
                            <div className="inline-block h-2 w-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          </span>
                        )}
                      </Badge>
                      <Badge variant="outline">{order.payment_type}</Badge>
                      <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                        {order.payment_status}
                      </Badge>
                      {order.delivery_boy_id && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                          <Truck className="h-3 w-3 mr-1" />
                          Assigned
                        </Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-bold">₹{order.total_price}</p>
                    </div>
                    {order.delivery_cost > 0 && (
                      <p className="text-xs text-muted-foreground">
                        (incl. ₹{order.delivery_cost} delivery)
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{order.buyer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.buyer_contact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Store className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{shop?.name || "Unknown Shop"}</p>
                        <p className="text-xs text-muted-foreground">{shop?.address || order.shop_id?.slice(0, 8)}</p>
                      </div>
                    </div>
                    
                    {order.buyer_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{order.buyer_address}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">{order.products?.length || 0}</span> items
                      </span>
                    </div>
                    
                    {deliveryBoy && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{deliveryBoy.name}</p>
                          <p className="text-xs text-muted-foreground">{deliveryBoy.contact}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {deliveryBoy.is_available ? "Available" : "Offline"}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">OTP: <code className="bg-secondary px-2 py-0.5 rounded font-mono">{order.otp}</code></p>
                        <p className="text-xs text-muted-foreground">For delivery verification</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                {order.products && order.products.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-background/50">
                    <p className="text-sm font-medium mb-2">Order Items:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {order.products.slice(0, 3).map((product: any, idx: number) => (
                        <div key={idx} className="text-xs p-2 rounded bg-secondary/30">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-muted-foreground">Qty: {product.quantity} × ₹{product.price}</p>
                        </div>
                      ))}
                      {order.products.length > 3 && (
                        <div className="text-xs p-2 rounded bg-secondary/30 flex items-center justify-center">
                          +{order.products.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {statusActions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.variant}
                      onClick={action.action}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <span className="flex items-center gap-1">
                          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        action.label
                      )}
                    </Button>
                  ))}
                  
                  {/* ✅ Assign Delivery Boy dropdown - FOR accepted orders */}
                  {order.status === "accepted" && !order.delivery_boy_id && (
                    <Select 
                      onValueChange={(value) => {
                        if (value !== "none") {
                          assignDeliveryBoy(order.id, value)
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-48 h-8">
                        <SelectValue placeholder={
                          availableDrivers.length === 0 
                            ? "No available drivers" 
                            : "Assign Delivery Boy"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDrivers.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No available drivers
                          </SelectItem>
                        ) : (
                          availableDrivers.map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name} ({d.contact})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* View Details */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="ml-auto"
                    disabled={isUpdating}
                  >
                    View Details
                  </Button>
                </div>

                {/* Timeline */}
                {order.timeline && Array.isArray(order.timeline) && order.timeline.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Order Timeline
                    </p>
                    <div className="space-y-1">
                      {order.timeline.slice(-3).map((entry: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              entry.action === "delivered" ? "bg-green-500" :
                              entry.action === "rejected" ? "bg-red-500" :
                              entry.action === "accepted" ? "bg-blue-500" :
                              "bg-yellow-500"
                            }`} />
                            <span className="font-medium capitalize">{entry.action}</span>
                            {entry.actor_name && (
                              <span className="text-muted-foreground">by {entry.actor_name}</span>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
