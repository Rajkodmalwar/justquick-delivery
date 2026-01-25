"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DebugBuyerPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth()
  const { buyer, isLoading: cartLoading } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const testStatus = {
    "Auth User Exists": user ? "✅" : "❌",
    "Auth User ID": user?.id || "MISSING",
    "Auth User Email": user?.email || "MISSING",
    "Profile Exists": profile ? "✅" : "❌",
    "Profile ID": profile?.id || "MISSING",
    "Profile Name": profile?.name || "MISSING",
    "Profile Phone": profile?.phone || "MISSING",
    "Is Authenticated": isAuthenticated ? "✅" : "❌",
    "Auth Loading": authLoading ? "🔄" : "✅",
    "Buyer Context Exists": buyer ? "✅" : "❌",
    "Buyer ID": buyer?.id || "MISSING",
    "Buyer Email": buyer?.email || "MISSING",
    "Buyer Phone": buyer?.phone || "MISSING",
    "Cart Loading": cartLoading ? "🔄" : "✅",
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication & Buyer Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Context Status */}
            <div>
              <h3 className="font-bold text-lg mb-4">Auth Context</h3>
              <div className="space-y-2 bg-slate-50 p-4 rounded-lg font-mono text-sm">
                <div><span className="font-bold">User:</span> {user ? JSON.stringify({ id: user.id, email: user.email }, null, 2) : "null"}</div>
                <div><span className="font-bold">Profile:</span> {profile ? JSON.stringify(profile, null, 2) : "null"}</div>
                <div><span className="font-bold">Is Authenticated:</span> {String(isAuthenticated)}</div>
                <div><span className="font-bold">Auth Loading:</span> {String(authLoading)}</div>
              </div>
            </div>

            {/* Cart Context Status */}
            <div>
              <h3 className="font-bold text-lg mb-4">Cart Context</h3>
              <div className="space-y-2 bg-slate-50 p-4 rounded-lg font-mono text-sm">
                <div><span className="font-bold">Buyer:</span> {buyer ? JSON.stringify(buyer, null, 2) : "null"}</div>
                <div><span className="font-bold">Cart Loading:</span> {String(cartLoading)}</div>
              </div>
            </div>

            {/* Quick Status */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Status</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(testStatus).map(([key, value]) => (
                  <div key={key} className="bg-slate-100 p-3 rounded">
                    <div className="text-xs font-semibold text-slate-600">{key}</div>
                    <div className="text-sm font-bold text-slate-900 break-all">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Diagnosis</h3>
              <div className="text-sm text-blue-800 space-y-2">
                {!user && (
                  <div>❌ <strong>Not Logged In:</strong> Auth user is null. Log in first.</div>
                )}
                {user && !profile && (
                  <div>❌ <strong>Profile Missing:</strong> Auth user exists but profile is null. Check auth-provider profile fetch.</div>
                )}
                {user && profile && !buyer && (
                  <div>⚠️ <strong>Buyer Not Synced:</strong> User and profile exist but buyer context is null. Check cart-context useEffect.</div>
                )}
                {user && profile && buyer && buyer.id === user.id && (
                  <div>✅ <strong>Everything OK!</strong> User, profile, and buyer are all synced correctly.</div>
                )}
                {user && profile && buyer && buyer.id !== user.id && (
                  <div>❌ <strong>ID Mismatch:</strong> buyer.id ({buyer.id}) doesn't match user.id ({user.id})</div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h3 className="font-bold text-amber-900 mb-2">Next Steps</h3>
              <div className="text-sm text-amber-800 space-y-2">
                {!user && (
                  <div>1. Click "Back" and go to login page</div>
                )}
                {user && !profile && (
                  <div>1. Check browser console for error logs from auth-provider</div>
                )}
                {user && profile && !buyer && (
                  <div>1. Check browser console for error logs from cart-context</div>
                )}
                {user && profile && buyer && (
                  <div>1. Try saving your profile again at /profile</div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>📍 Open browser console (F12) to see detailed logs</p>
              <p>🔄 This page will show live updates as auth state changes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
