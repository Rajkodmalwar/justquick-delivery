"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, Clock, CheckCircle, Truck, Store, ArrowLeft, Copy, 
  MapPin, Phone, User, IndianRupee, Calendar 
} from "lucide-react"
import Link from "next/link"

const statusConfig: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
  pending: { color: "text-yellow-600", bgColor: "bg-yellow-100 border-yellow-200", icon: Clock, label: "Pending" },
  accepted: { color: "text-blue-600", bgColor: "bg-blue-100 border-blue-200", icon: CheckCircle, label: "Accepted" },
  ready: { color: "text-purple-600", bgColor: "bg-purple-100 border-purple-200", icon: Store, label: "Ready" },
  picked_up: { color: "text-orange-600", bgColor: "bg-orange-100 border-orange-200", icon: Truck, label: "On the Way" },
  delivered: { color: "text-emerald-600", bgColor: "bg-emerald-100 border-emerald-200", icon: Package, label: "Delivered" },
  rejected: { color: "text-red-600", bgColor: "bg-red-100 border-red-200", icon: Package, label: "Rejected" },
}

export default function OrderTrackingPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      // Fetch using query parameter
      const res = await fetch(`/api/orders?id=${id}`)
      const data = await res.json()
      
      if (!res.ok) {
        if (res.status === 404) {
          notFound()  // Show 404 page instead of throwing
        } else {
          throw new Error(data.error || "Failed to load order")
        }
      }
      
      setOrder(data.order)
    } catch (err) {
      logger.error("Failed to load order:", err)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return

    load()

    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "orders", 
        filter: `id=eq.${id}` 
      }, (payload) => {
        logger.log("Order updated:", payload.new)
        setOrder(payload.new as any)
        setLoading(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  function copyOTP(otp: string) {
    navigator.clipboard.writeText(otp)
    alert("OTP copied!")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white animate-pulse shadow-sm border border-slate-200" />
          ))}
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h2>
          <p className="text-slate-500 mb-4">The order you're looking for doesn't exist</p>
          <Button asChild>
            <Link href="/myorders">View My Orders</Link>
          </Button>
        </div>
      </main>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <Button asChild variant="ghost" className="mb-6 gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50">
          <Link href="/myorders">
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </Link>
        </Button>

        {/* Order Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <p className="text-sm">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Badge className={`${status.bgColor} ${status.color} border text-base px-4 py-2`}>
              <StatusIcon className="h-5 w-5 mr-2" />
              {status.label}
            </Badge>
          </div>
          
          {/* Status progress indicator */}
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                order.status === "delivered" ? "bg-emerald-500" :
                order.status === "picked_up" ? "bg-orange-500 w-3/4" :
                order.status === "ready" ? "bg-purple-500 w-1/2" :
                order.status === "accepted" ? "bg-blue-500 w-1/4" :
                "bg-yellow-500 w-0"
              }`}
              style={{
                width: order.status === "delivered" ? "100%" :
                       order.status === "picked_up" ? "75%" :
                       order.status === "ready" ? "50%" :
                       order.status === "accepted" ? "25%" :
                       "0%"
              }}
            />
          </div>
        </div>

        {/* Order Items Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-emerald-600" />
            Order Items
          </h3>
          <div className="space-y-3">
            {(order.products || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">₹{p.price} × {p.quantity}</p>
                </div>
                <p className="font-bold text-slate-900">₹{Number(p.price) * Number(p.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-4">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Bill Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Items Total</span>
              <span className="font-medium text-slate-900">₹{order.total_price - (order.delivery_cost || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-2">
                <Truck className="h-4 w-4" /> Delivery Fee
              </span>
              <span className="font-medium text-slate-900">₹{order.delivery_cost || 0}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <span className="font-bold text-slate-900">Grand Total</span>
              <span className="text-2xl font-bold text-emerald-600 flex items-center">
                <IndianRupee className="h-5 w-5" />{order.total_price}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-emerald-600" />
            Customer Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <User className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">Name</p>
                <p className="font-medium text-slate-900 truncate">{order.buyer_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium">Contact</p>
                <p className="font-medium text-slate-900">{order.buyer_contact || order.buyer_phone}</p>
              </div>
            </div>
            {order.buyer_address && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Address</p>
                  <p className="font-medium text-slate-900 break-words">{order.buyer_address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery OTP Card */}
        <div className={`border-2 rounded-2xl shadow-sm p-6 mb-4 ${
          order.status === "delivered" 
            ? "bg-emerald-50 border-emerald-200" 
            : "bg-emerald-50 border-emerald-200"
        }`}>
          <p className="text-sm text-slate-600 text-center mb-3">
            {order.status === "delivered"
              ? "✅ Delivery Completed - OTP Verified"
              : "🔐 Delivery OTP"}
          </p>
          <div className="flex items-center justify-between gap-4">
            <p className="text-5xl font-mono font-bold text-emerald-600 flex-1 text-center">{order.otp}</p>
            {order.status !== "delivered" && (
              <Button 
                size="icon"
                variant="outline"
                onClick={() => copyOTP(order.otp)}
                className="h-12 w-12 border-emerald-300 hover:bg-white"
              >
                <Copy className="h-5 w-5 text-emerald-600" />
              </Button>
            )}
          </div>
          {order.status !== "delivered" && (
            <p className="text-xs text-slate-600 text-center mt-3">Share with delivery partner</p>
          )}
        </div>

        {/* Payment Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Payment Method</p>
              <p className="font-bold text-slate-900">{order.payment_type}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Payment Status</p>
              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="text-sm px-3 py-1">
                {order.payment_status === "paid" ? "✓ Paid" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Real-time Update Info */}
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <p className="text-sm text-blue-700 font-medium">
            ⚡ This page updates in real-time. No need to refresh!
          </p>
        </div>
      </div>
    </main>
  )
}