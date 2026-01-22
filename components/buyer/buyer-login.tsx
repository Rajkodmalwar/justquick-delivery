"use client"


import { logger } from '@/lib/logger'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { useCart } from "@/components/buyer/cart-context"
import { Mail, CheckCircle, Loader2, User as UserIcon, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface BuyerLoginProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BuyerLogin({ open, onOpenChange, onSuccess }: BuyerLoginProps) {
  const router = useRouter()
  const { refreshUser } = useCart()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState("")

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSendMagicLink = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      // First, check if user exists by trying to sign in
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: "dummy_password_123" // Will fail if user doesn't exist
        })

        if (!signInError) {
          // User exists with password, redirect to password login
          setError("Account exists. Please use password login.")
          setTimeout(() => {
            router.push(`/auth/login?email=${encodeURIComponent(email)}`)
            handleClose()
          }, 1500)
          return
        }
      } catch (signInErr) {
        // Expected - user doesn't exist
      }

      // User doesn't exist, send magic link for registration
      const redirectUrl = `${window.location.origin}/auth/callback`

      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
          data: {
            name: email.split('@')[0],
          }
        }
      })

      if (magicError) {
        logger.error("Magic link error:", magicError.message)
        
        if (magicError.message.includes("already registered") || 
            magicError.message.includes("User already registered")) {
          setError("Account already exists. Please use password login.")
          setTimeout(() => {
            router.push(`/auth/login?email=${encodeURIComponent(email)}`)
            handleClose()
          }, 1500)
          return
        }
        
        if (magicError.message.includes("rate limit")) {
          setError("Too many attempts. Please try again in a minute.")
          return
        }
        
        throw magicError
      }

      setSuccess(true)
      setEmailSent(email)

    } catch (err: any) {
      logger.error("Registration error:", err.message)
      setError(err.message || "Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setSuccess(false)
    setEmailSent("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-emerald-600">Check Your Email!</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              
              <div className="space-y-2">
                <p className="font-medium">Magic link sent to</p>
                <p className="text-lg font-semibold text-primary break-all">{emailSent}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-700">
                  Click the link in your email to complete registration. You'll be redirected to add your phone number.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Check your spam folder if you don't see the email.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <UserIcon className="h-5 w-5" />
                Register New Account
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center">
                Enter your email to create an account
              </p>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className="bg-secondary text-lg py-3"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10">
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSendMagicLink} 
                className="w-full py-6 text-lg font-semibold" 
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Register with Email"
                )}
              </Button>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>How it works:</strong> We'll send you a secure link. Click it to create your account instantly.
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      handleClose()
                      router.push(`/auth/login?email=${encodeURIComponent(email)}`)
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in with password
                  </button>
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
