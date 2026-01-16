"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, Clock, CheckCircle, Truck, Store, ArrowLeft, Copy, 
  MapPin, Phone, User, IndianRupee, Calendar 
} from "lucide-react"
import Link from "next/link"

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pending" },
  accepted: { color: "bg-blue-500/20 text-blue-400", icon: CheckCircle, label: "Accepted" },
  ready: { color: "bg-purple-500/20 text-purple-400", icon: Store, label: "Ready" },
  picked_up: { color: "bg-orange-500/20 text-orange-400", icon: Truck, label: "On the Way" },
  delivered: { color: "bg-emerald-500/20 text-emerald-400", icon: Package, label: "Delivered" },
  rejected: { color: "bg-red-500/20 text-red-400", icon: Package, label: "Rejected" },
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
      console.error("Failed to load order:", err)
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
        console.log("Order updated:", payload.new)
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
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist</p>
        <Button asChild>
          <Link href="/myorders">View My Orders</Link> {/* Fixed link */}
        </Button>
      </main>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/myorders"> {/* Fixed link */}
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Orders
        </Link>
      </Button>

      <Card className="bg-card border-border overflow-hidden">
        <div className={`h-2 ${order.status === "delivered" ? "bg-emerald-500" : "bg-primary"}`} />
        
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order Tracking</h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Badge className={`${status.color} text-lg px-4 py-2`}>
              <StatusIcon className="h-5 w-5 mr-2" />
              {status.label}
            </Badge>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h3>
            {(order.products || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">₹{p.price} × {p.quantity}</p>
                </div>
                <p className="font-bold">₹{Number(p.price) * Number(p.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Items Total</span>
              <span>₹{order.total_price - (order.delivery_cost || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Truck className="h-4 w-4" /> Delivery Fee
              </span>
              <span>₹{order.delivery_cost || 0}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-semibold text-lg">Grand Total</span>
              <span className="text-2xl font-bold text-primary flex items-center">
                <IndianRupee className="h-5 w-5" />{order.total_price}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.buyer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{order.buyer_contact || order.buyer_phone}</p>
                </div>
              </div>
              {order.buyer_address && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{order.buyer_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OTP Section */}
          <div className={`p-6 rounded-xl mb-6 ${order.status === "delivered" ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-primary/10 border border-primary/30"}`}>
            <div className="flex items-center justify-between">
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {order.status === "delivered"
                    ? "✅ Delivery Completed - OTP Verified"
                    : "🔐 Delivery OTP (share with delivery partner)"}
                </p>
                <p className="text-4xl font-mono font-bold"> {order.otp}</p>
              </div>
              {order.status !== "delivered" && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => copyOTP(order.otp)}
                  className="h-12 w-12"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-center gap-3 justify-center mb-6">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Payment: {order.payment_type}
            </Badge>
            <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="text-lg px-4 py-2">
              Status: {order.payment_status}
            </Badge>
          </div>

          {/* Real-time note */}
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-500">
              ⚡ This page updates in real-time. No need to refresh!
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}