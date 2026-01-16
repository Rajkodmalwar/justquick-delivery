"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Truck, Key, Loader2, AlertCircle } from "lucide-react"

type DriverLoginModalProps = {
  isOpen: boolean
  onClose: () => void
}

const CODE_RE = /^\d{6}$/

export function DriverLoginModal({ isOpen, onClose }: DriverLoginModalProps) {
  const [loginCode, setLoginCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmed = loginCode.trim()
    if (!CODE_RE.test(trimmed)) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/delivery-boys?login_code=${trimmed}`)
      if (!res.ok) {
        setError("Invalid code. Please check and try again.")
        setLoading(false)
        return
      }

      const data = await res.json()
      const driverId = data.delivery_boy?.id

      // Store driver session with both login_code and driver_id
      localStorage.setItem(
        "jq_driver",
        JSON.stringify({
          loginCode: trimmed,
          driverId,
          driverName: data.delivery_boy?.name,
          timestamp: Date.now(),
        }),
      )

      router.push(`/delivery?driver=${driverId}`)
      onClose()
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 bg-gradient-to-r from-emerald-500 to-teal-500">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Driver Login</h2>
              <p className="text-white/80 text-sm">Access your delivery dashboard</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Driver Login Code</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="pl-10 h-12 rounded-xl font-mono text-2xl text-center tracking-[0.5em]"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Contact admin to register and get your 6-digit code</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600"
            disabled={loading || loginCode.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Access Dashboard"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
