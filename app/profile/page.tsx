"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, MapPin, Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function ProfilePage() {
  const router = useRouter()
  const { buyer, isAuthenticated, setBuyer, isLoading } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/profile")
      return
    }

    if (buyer) {
      setName(buyer.name || "")
      setPhone(buyer.phone || "")
      setAddress(buyer.address || "")
    }
  }, [buyer, isAuthenticated, isLoading, router])

  const handleSave = async () => {
    if (!phone.trim()) {
      setError("Phone number is required")
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit Indian phone number")
      return
    }

    setSaving(true)
    setError("")

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim()
        }
      })

      if (updateError) throw updateError

      // Update cart context
      await setBuyer({
        id: buyer?.id || "",
        name: name.trim() || "User",
        email: buyer?.email || "",
        phone: phone.trim(),
        address: address.trim()
      })

      setSuccess(true)
      setTimeout(() => {
        router.back()
      }, 1500)

    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/30 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-600 mb-2">Profile Updated!</h3>
                <p className="text-muted-foreground">Redirecting you back...</p>
              </div>
            ) : (
              <>
                {/* Email (read-only) */}
                {buyer?.email && (
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="font-medium">{buyer.email}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-secondary"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="bg-secondary"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for delivery updates
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House no, Street, City, Pincode"
                      className="bg-secondary"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !phone.trim()}
                    className="flex-1 btn-primary-glow"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}