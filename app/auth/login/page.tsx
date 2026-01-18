"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Loader2, ArrowRight, UserPlus, CheckCircle, KeyRound } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Show any error from URL params
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("📧 Sending OTP to:", email)
      
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      console.log("✅ OTP sent successfully")
      setStep('otp')

    } catch (err: any) {
      console.error("❌ Send OTP error:", err)
      setError(err.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setError("Please enter the OTP code")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("🔐 Verifying OTP...")
      
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: otp.trim(),
          type: 'email',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP")
      }

      console.log("✅ OTP verified, logging in...")
      // Session is automatically set in cookies by the middleware
      // Redirect to shops
      router.push("/shops")

    } catch (err: any) {
      console.error("❌ Verify OTP error:", err)
      setError(err.message || "Invalid or expired OTP code")
    } finally {
      setLoading(false)
    }
  }

  // OTP verification step
  if (step === 'otp') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
        <div className="w-full max-w-md">
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader className="text-center">
              <KeyRound className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Enter OTP Code</CardTitle>
              <p className="text-slate-400 mt-2">Check your email</p>
              <p className="font-semibold text-cyan-400 text-sm mt-1">{email}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">
                    OTP Code (6 digits)
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                      setError("")
                    }}
                    maxLength="6"
                    disabled={loading}
                    className="text-center text-2xl tracking-widest bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 disabled:opacity-50"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center">
                  Didn't receive the code?
                </p>
                <Button
                  onClick={() => {
                    setStep('email')
                    setOtp("")
                    setError("")
                  }}
                  variant="outline"
                  className="w-full border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try Another Email
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500">
                OTP expires in 10 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Email entry step
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
      <div className="w-full max-w-md">
        <Card className="border-slate-700/50 bg-slate-900/50">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-slate-400">Sign in with OTP</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSendOtp} className="space-y-6">
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
                    disabled={loading}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Send OTP Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium disabled:opacity-50"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send OTP Code
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-center text-sm text-slate-400">
                Don't have an account?
              </p>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  className="w-full border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Account
                </Button>
              </Link>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              By continuing, you agree to our Terms of Service & Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
