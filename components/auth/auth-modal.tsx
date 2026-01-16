"use client"

import { useState } from "react"
import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Phone, MapPin, Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  requirePhone?: boolean
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Complete Your Profile",
  requirePhone = true 
}: AuthModalProps) {
  const { buyer, setBuyer } = useCart()
  const [name, setName] = useState(buyer?.name || "")
  const [phone, setPhone] = useState(buyer?.phone || "")
  const [address, setAddress] = useState(buyer?.address || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (requirePhone && !phone.trim()) {
      setError("Phone number is required")
      return
    }

    if (requirePhone && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit Indian phone number")
      return
    }

    setLoading(true)
    setError("")

    try {
      await setBuyer({
        id: buyer?.id || "",
        name: name.trim() || buyer?.name || "User",
        email: buyer?.email || "",
        phone: phone.trim(),
        address: address.trim()
      })

      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            We need a few details to process your order
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number {requirePhone && "*"}
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="bg-secondary"
              required={requirePhone}
            />
            {requirePhone && (
              <p className="text-xs text-muted-foreground">
                Required for delivery updates and OTP verification
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House no, Street, City, Pincode"
              className="bg-secondary"
            />
            <p className="text-xs text-muted-foreground">
              Save your address for faster checkout
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (requirePhone && !phone.trim())}
              className="flex-1 btn-primary-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}