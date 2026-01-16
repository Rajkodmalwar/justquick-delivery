"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { googleDirectionsURL, haversineKm } from "@/lib/geo"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  MapPin,
  Navigation,
  Package,
  CheckCircle,
  Phone,
  User,
  LogOut,
  Bell,
  X,
  ShieldCheck,
  Wallet,
  IndianRupee,
} from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

export default function DeliveryDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const driverIdFromUrl = searchParams.get("driver") || ""
  const [deliveryBoyId, setDeliveryBoyId] = useState(driverIdFromUrl)
  const [isAvailable, setIsAvailable] = useState(false)
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null)

  const [otpModal, setOtpModal] = useState<{
    open: boolean
    orderId: string
    orderNumber: string
    buyerName: string
    total: number
  } | null>(null)
  const [otpInput, setOtpInput] = useState("")
  const [otpError, setOtpError] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("jq_driver")
    if (stored) {
      try {
        const { driverId } = JSON.parse(stored)
        if (driverId && !driverIdFromUrl) {
          setDeliveryBoyId(driverId)
        }
      } catch {
        // Invalid data
      }
    }

    if (driverIdFromUrl) {
      setDeliveryBoyId(driverIdFromUrl)
    }
  }, [driverIdFromUrl])

  const trimmed = deliveryBoyId.trim()
  const isValidUuid = UUID_RE.test(trimmed)

  const { data: driverData } = useSWR(isValidUuid ? `/api/delivery-boys/${trimmed}` : null, fetcher)

  useEffect(() => {
    if (driverData?.delivery_boy) {
      setIsAvailable(driverData.delivery_boy.is_available || false)
    }
  }, [driverData])

  useEffect(() => {
    if (!isValidUuid) return
    const channel = supabase
      .channel("orders-delivery")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload: any) => {
        mutate("/api/delivery/orders")
        if (payload.eventType === "UPDATE" && payload.new.delivery_boy_id === trimmed && !payload.old.delivery_boy_id) {
          setNewOrderAlert(`New delivery assigned! Order #${payload.new.id.slice(0, 8)}`)
          setTimeout(() => setNewOrderAlert(null), 5000)
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload: any) => {
        if (payload.new.target_type === "delivery" && (payload.new.target_id === trimmed || !payload.new.target_id)) {
          setNewOrderAlert(payload.new.message)
          setTimeout(() => setNewOrderAlert(null), 5000)
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [isValidUuid, trimmed])

  const { data } = useSWR(
    isValidUuid ? `/api/delivery/orders?delivery_boy_id=${trimmed}` : null,
    fetcher
  )
  const orders = data?.orders || []

  const today = new Date().toDateString()
  const todaysDeliveries = orders.filter(
    (o: any) => o.status === "delivered" && new Date(o.created_at).toDateString() === today,
  )
  const todaysEarnings = todaysDeliveries.length * 10 // ₹10 per delivery

  async function toggleAvailability(available: boolean) {
    setIsAvailable(available)
    await fetch(`/api/delivery-boys/${trimmed}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: available }),
    })
  }

  async function markPickedUp(id: string) {
    const res = await fetch(`/api/orders/${id}/pickup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_boy_id: trimmed }),
    })
    if (!res.ok) {
      const error = await res.json()
      alert(error.details || "Failed to mark order as picked up")
      return
    }
    mutate(`/api/delivery/orders?delivery_boy_id=${trimmed}`)
  }

  async function verifyOTP(id: string) {
    if (!otpInput) {
      setOtpError("Please enter the OTP")
      return
    }
    setVerifying(true)
    setOtpError("")

    const res = await fetch(`/api/orders/${id}/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        otp: otpInput,
        delivery_boy_id: trimmed 
      }),
    })
    const data = await res.json()
    setVerifying(false)

    if (!res.ok) {
      setOtpError(data?.error || "Invalid OTP. Please try again.")
      return
    }

    setOtpModal(null)
    setOtpInput("")
    mutate(`/api/delivery/orders?delivery_boy_id=${trimmed}`)
  }

  const openOtpModal = (order: any) => {
    setOtpModal({
      open: true,
      orderId: order.id,
      orderNumber: order.id.slice(0, 8),
      buyerName: order.buyer_name,
      total: order.total_price,
    })
    setOtpInput("")
    setOtpError("")
  }

  const handleLogout = () => {
    localStorage.removeItem("jq_driver")
    router.push("/partner/driver")
  }

  if (!isValidUuid) {
    router.push("/partner/driver")
    return null
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {otpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-card border-primary/20 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="relative pb-2">
              <button
                onClick={() => setOtpModal(null)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/20">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Verify Delivery</CardTitle>
                  <p className="text-sm text-muted-foreground">Order #{otpModal.orderNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Customer</span>
                  <span className="font-semibold">{otpModal.buyerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Total</span>
                  <span className="font-bold text-primary text-lg">₹{otpModal.total}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Customer OTP</label>
                <p className="text-xs text-muted-foreground">Ask the customer for the 4-digit OTP sent to them</p>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ""))
                    setOtpError("")
                  }}
                  placeholder="0000"
                  className="text-center text-3xl font-mono tracking-[0.5em] h-16 bg-background"
                  autoFocus
                />
                {otpError && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {otpError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setOtpModal(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => verifyOTP(otpModal.orderId)}
                  disabled={otpInput.length !== 4 || verifying}
                >
                  {verifying ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Delivery
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-accent text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="font-semibold">{newOrderAlert}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
          <p className="text-muted-foreground">View and complete your deliveries</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isAvailable ? "bg-accent/20 border-accent/30" : "bg-secondary/50"} border`}
          >
            <div
              className={`h-3 w-3 rounded-full ${isAvailable ? "bg-accent animate-pulse" : "bg-muted-foreground"}`}
            />
            <span className="text-sm font-medium">{isAvailable ? "Available" : "Offline"}</span>
            <Switch checked={isAvailable} onCheckedChange={toggleAvailability} />
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/30">
            <Truck className="h-4 w-4 mr-2" />
            Rider Portal
          </Badge>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
                <p className="text-3xl font-bold text-emerald-500">₹{todaysEarnings}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <IndianRupee className="h-7 w-7 text-emerald-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{todaysDeliveries.length} deliveries today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commission</p>
                <p className="text-3xl font-bold text-primary">₹{driverData?.delivery_boy?.total_commission || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All-time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-3xl font-bold text-blue-500">
                  {orders.filter((o: any) => o.status !== "delivered").length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Package className="h-7 w-7 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pending deliveries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assigned Orders
          </CardTitle>
          <Badge variant="outline">{orders.length} deliveries</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>{isAvailable ? "Waiting for orders..." : "Turn on availability to receive orders"}</p>
            </div>
          )}

          {orders.map((o: any) => {
            const km = haversineKm({ lat: o.shop_lat, lng: o.shop_lng }, { lat: o.buyer_lat, lng: o.buyer_lng })
            const directions = googleDirectionsURL(
              { lat: o.shop_lat, lng: o.shop_lng },
              { lat: o.buyer_lat, lng: o.buyer_lng },
            )
            const statusPct =
              o.status === "pending"
                ? 10
                : o.status === "accepted"
                  ? 25
                  : o.status === "ready"
                    ? 50
                    : o.status === "picked_up"
                      ? 75
                      : o.status === "delivered"
                        ? 100
                        : 10

            const statusSteps = ["Pending", "Accepted", "Ready", "Picked Up", "Delivered"]
            const currentStep = statusSteps.findIndex((s) => s.toLowerCase().replace(" ", "_") === o.status) + 1

            return (
              <div key={o.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="font-mono text-sm text-muted-foreground">#{o.id.slice(0, 8)}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{o.buyer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{o.buyer_contact}</span>
                    </div>
                    {o.buyer_address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{o.buyer_address}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">{km.toFixed(1)} km</span>
                    </div>
                    <p className="text-sm text-muted-foreground">₹{o.total_price}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    {statusSteps.map((step, i) => (
                      <span key={step} className={i < currentStep ? "text-primary font-medium" : ""}>
                        {step}
                      </span>
                    ))}
                  </div>
                  <Progress value={statusPct} className="h-2" />
                </div>

                {o.status === "delivered" && (
                  <div className="p-3 rounded-lg bg-accent/20 border border-accent/30 mb-4">
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Delivered Successfully</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" className="flex-1 sm:flex-none">
                    <a href={directions} target="_blank" rel="noreferrer">
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </a>
                  </Button>
                  {o.status !== "delivered" && (
                    <>
                      <Button
                        variant="secondary"
                        className="flex-1 sm:flex-none"
                        onClick={() => markPickedUp(o.id)}
                        disabled={o.status !== "ready"}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {o.status === "picked_up" ? "Picked Up" : "Mark Picked Up"}
                      </Button>
                      <Button
                        className="flex-1 sm:flex-none"
                        onClick={() => openOtpModal(o)}
                        disabled={o.status !== "picked_up"}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify & Deliver
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </main>
  )
}
