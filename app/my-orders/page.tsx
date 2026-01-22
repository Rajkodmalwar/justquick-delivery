"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/buyer/cart-context"
import { logger } from "@/lib/logger"
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
  pending: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100 border-amber-200", label: "Pending" },
  accepted: { icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-100 border-blue-200", label: "Accepted" },
  ready: { icon: Store, color: "text-purple-600", bgColor: "bg-purple-100 border-purple-200", label: "Ready" },
  picked_up: { icon: Truck, color: "text-orange-600", bgColor: "bg-orange-100 border-orange-200", label: "On the Way" },
  delivered: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-100 border-emerald-200", label: "Delivered" },
  rejected: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100 border-red-200", label: "Rejected" },
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
      logger.log("Orders API response:", data) // Debug log
      
      setOrders(data.orders || [])
    } catch (error: any) {
      logger.error("Error fetching orders:", error)
      setError(error.message || "Failed to load orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Orders</h1>
          <p className="text-slate-600">Track your recent purchases and delivery status</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Failed to load orders</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !error ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-600 mb-6">Start shopping to see your orders here</p>
            <Link href="/shops">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">Browse Shops</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
              const StatusIcon = statusInfo.icon
              
              // Handle missing products field safely
              let itemCount = 0
              if (order.products && Array.isArray(order.products)) {
                itemCount = order.products.length
              } else if (order.products && typeof order.products === 'object') {
                itemCount = Object.keys(order.products).length
              }
              
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4">
                        {/* Top row: Status, ID, Date */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Status Badge */}
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border text-sm px-3 py-1 flex-shrink-0`}>
                              <StatusIcon className="h-4 w-4 mr-1 inline" />
                              {statusInfo.label}
                            </Badge>
                            
                            {/* Order ID and Date */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          {/* View Details Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 flex-shrink-0"
                          >
                            View
                          </Button>
                        </div>

                        {/* Bottom row: Items count and Total */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium">Items</p>
                            <p className="text-sm font-semibold text-slate-900 mt-0.5">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium">Total</p>
                            <p className="text-lg font-bold text-emerald-600 mt-0.5">
                              ₹{order.total_price + (order.delivery_cost || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}