"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Store, 
  ArrowLeft,
  ShoppingBag 
} from "lucide-react"

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-500/10", label: "Pending" },
  accepted: { icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10", label: "Accepted" },
  ready: { icon: Store, color: "text-purple-600", bg: "bg-purple-500/10", label: "Ready" },
  picked_up: { icon: Truck, color: "text-orange-600", bg: "bg-orange-500/10", label: "On the Way" },
  delivered: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Delivered" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10", label: "Rejected" },
}

export default function MyOrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, buyer } = useCart()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // FIXED: Redirect to /my-orders, not /orders
      router.push("/auth/login?redirect=/my-orders")
      return
    }

    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch("/api/orders")
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch orders")
      }
      
      const data = await res.json()
      console.log("Orders API response:", data) // Debug log
      
      setOrders(data.orders || [])
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      setError(error.message || "Failed to load orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-secondary rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-secondary rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-secondary rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-secondary rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/30 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track your recent purchases</p>
          </div>
          <div className="flex gap-3">
            <Link href="/shops">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Shopping
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Failed to load orders</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {orders.length === 0 && !error ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Link href="/shops">
                <Button>Browse Shops</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
              const StatusIcon = statusInfo.icon
              
              // FIXED: Handle missing products field safely
              // Some orders might have products array, others might not
              // If it's missing, check if products exists as a property or use 0
              let itemCount = 0
              if (order.products && Array.isArray(order.products)) {
                itemCount = order.products.length
              } else if (order.products && typeof order.products === 'object') {
                // Handle case where products might be stored differently
                itemCount = Object.keys(order.products).length
              }
              
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="border-border hover:border-primary/50 transition cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`h-10 w-10 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
                                  {statusInfo.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  #{order.id.slice(-8)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Items</p>
                              <p className="font-medium">{itemCount} items</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="text-xl font-bold text-primary">
                                {/* FIXED: Handle missing delivery_cost safely */}
                                ₹{order.total_price + (order.delivery_cost || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Button variant="outline">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}