"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, User, Phone, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [step, setStep] = useState<"details" | "confirm">("details")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!name.trim()) {
      setError("Please enter your name")
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email")
      setLoading(false)
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit Indian phone number")
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Send magic link - this creates the user if they don't exist
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,  // Auto-create user on first sign up
        }
      })

      if (otpError) {
        throw otpError
      }

      // Success - move to confirmation step
      setStep("confirm")

    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Confirmation step - shown after magic link is sent
  if (step === "confirm") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
        <div className="w-full max-w-md">
          <Card className="border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-slate-100">Check Your Email</CardTitle>
              <p className="text-slate-400 mt-2">We've sent a magic link to:</p>
              <p className="font-semibold text-cyan-400 mt-1">{email}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-slate-300">
                  Click the link in your email to create your account and sign in instantly.
                </p>
                <p className="text-xs text-slate-400">
                  The link will expire in 24 hours.
                </p>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-slate-400">
                  <strong>Account Details:</strong>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Name: <span className="text-slate-300">{name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Phone: <span className="text-slate-300">{phone}</span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center">
                  Didn't receive the email?
                </p>
                <Button
                  onClick={() => {
                    setStep("details")
                    setError("")
                  }}
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Check your spam folder if you don't see it
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Details entry step
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
      <div className="w-full max-w-md">
        <Card className="border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <p className="text-slate-400">No passwords needed. We'll send a magic link.</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSendMagicLink} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError("")
                    }}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setError("")
                    }}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  10-digit Indian number (for delivery updates)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium"
                disabled={loading || !name || !email || !phone}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/30 text-slate-400">Or</span>
                </div>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-center text-sm text-slate-400">
                Already have an account?
              </p>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="w-full border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
                >
                  Sign In Instead
                </Button>
              </Link>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              By creating an account, you agree to our Terms of Service & Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
