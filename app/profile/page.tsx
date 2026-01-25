"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/buyer/cart-context"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, MapPin, Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { buyer, isAuthenticated, setBuyer, isLoading, refreshUser } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // If still loading, wait for auth check to complete
    if (isLoading) {
      return
    }
    
    // If not authenticated and loading is done, redirect to login
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/profile")
      return
    }

    // If authenticated, populate form with buyer data
    if (buyer) {
      setName(buyer.name || "")
      setPhone(buyer.phone || "")
      setAddress(buyer.address || "")
    }
  }, [buyer, isAuthenticated, isLoading, router])

  const handleSave = async () => {
    // Validation
    if (!phone.trim()) {
      setError("Phone number is required")
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit Indian phone number")
      return
    }

    // Start loading
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const startTime = Date.now()
      logger.log("📝 Profile: Starting save operation...")

      // Add timeout to prevent infinite hanging (15 seconds total)
      const timeoutMs = 15000
      const startTimeout = () => new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Profile save took too long. Please try again.")), timeoutMs)
      )

      // STEP 1: Update buyer profile in Supabase
      logger.log("📝 Profile: Calling setBuyer() to update Supabase...")
      try {
        await Promise.race([
          setBuyer({
            id: buyer?.id || "",
            name: name.trim() || "User",
            email: buyer?.email || "",
            phone: phone.trim(),
            address: address.trim()
          }),
          startTimeout()
        ])
        logger.log("✅ Profile: Profile saved to Supabase successfully")
      } catch (stepErr: any) {
        logger.error("❌ Profile: setBuyer failed", stepErr.message)
        throw stepErr
      }

      // STEP 2: Refresh buyer data (separate timeout for this step)
      logger.log("🔄 Profile: Calling refreshUser() to sync database data...")
      try {
        await Promise.race([
          refreshUser(),
          startTimeout()
        ])
        logger.log("✅ Profile: Buyer state refreshed from database")
      } catch (stepErr: any) {
        logger.error("⚠️ Profile: refreshUser had timeout/error (non-critical)", stepErr.message)
        // Don't fail the whole operation if refresh times out
      }

      // STEP 3: Show success and redirect
      logger.log("✅ Profile: Showing success message...")
      setSuccess(true)
      
      // Give user 1 second to see success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const totalTime = Date.now() - startTime
      logger.log(`🔙 Profile: Redirecting back (took ${totalTime}ms total)...`)
      
      // Use router.back() to return to previous page
      router.back()

    } catch (err: any) {
      logger.error("❌ Profile: Save operation failed", err)
      
      // Extract error message
      const errorMessage = err?.message || "Failed to save profile. Please try again."
      
      setError(errorMessage)
      setSuccess(false)
      
      logger.error("⚠️ Profile: Error shown to user:", errorMessage)
    } finally {
      setSaving(false)
      logger.log("🏁 Profile: Save operation complete (success or error)")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
      {/* Ambient background elements - subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-slate-200/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        {/* Clean Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden backdrop-blur-sm">
          {/* Header with gradient accent */}
          <div className="relative px-6 py-8 md:py-10 border-b border-slate-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent opacity-40" />
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your delivery information</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 md:py-10">
            {success ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 border border-emerald-200 backdrop-blur-sm mb-6">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Profile Updated!</h3>
                <p className="text-slate-500">Your changes have been saved. Redirecting...</p>
              </div>
            ) : (
              <>
                {/* Email (read-only) */}
                {buyer?.email && (
                  <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">Email Address</span>
                    </div>
                    <p className="font-medium text-slate-900 text-lg">{buyer.email}</p>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-6 mb-8">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-slate-50 focus:border-emerald-500 transition-all rounded-lg h-11"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        <Phone className="h-4 w-4 text-slate-600" />
                      </div>
                      Phone Number <span className="text-emerald-600">*</span>
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-slate-50 focus:border-emerald-500 transition-all rounded-lg h-11"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Required for delivery updates and order notifications
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        <MapPin className="h-4 w-4 text-slate-600" />
                      </div>
                      Delivery Address
                    </label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House no, Street, City, Pincode"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-slate-50 focus:border-emerald-500 transition-all rounded-lg h-11"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-lg h-11 font-semibold"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !phone.trim()}
                    className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-emerald-500/30"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Helpful text */}
        <p className="text-center text-slate-600 text-xs mt-8">
          Your information is encrypted and secure. You can update it anytime.
        </p>
      </div>
    </main>
  )
}
