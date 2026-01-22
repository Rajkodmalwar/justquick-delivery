"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { logger } from "@/lib/logger"
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
      logger.log("📧 Sending OTP to:", email)
      
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      logger.log("✅ OTP sent successfully")
      setStep('otp')

    } catch (err: any) {
      logger.error("❌ Send OTP error:", err)
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
      logger.log("🔐 Verifying OTP...")
      
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

      logger.log("✅ OTP verified, logging in...")
      // Session is automatically set in cookies by the middleware
      // Redirect to shops
      router.push("/shops")

    } catch (err: any) {
      logger.error("❌ Verify OTP error:", err)
      setError(err.message || "Invalid or expired OTP code")
    } finally {
      setLoading(false)
    }
  }

  // OTP verification step
  if (step === 'otp') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
          </div>

          <Card className="border-slate-200/50 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center pb-6">
              <KeyRound className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-slate-900">Verify Your Email</CardTitle>
              <p className="text-slate-600 mt-2 text-sm">We sent a code to</p>
              <p className="font-semibold text-emerald-600 text-sm mt-1 break-all">{email}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    6-Digit Code
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
                    className="text-center text-3xl tracking-widest bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 font-semibold"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold disabled:opacity-50 transition-all duration-200"
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

              <div className="space-y-3 pt-2">
                <p className="text-sm text-slate-600 text-center">
                  Didn't receive the code?
                </p>
                <Button
                  onClick={() => {
                    setStep('email')
                    setOtp("")
                    setError("")
                  }}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  Try Another Email
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Code expires in 10 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Email entry step
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
        </div>

        <Card className="border-slate-200/50 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl text-slate-900">Welcome Back</CardTitle>
            <p className="text-slate-600 mt-2">Fast, safe delivery at your doorstep</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    disabled={loading}
                    className="pl-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 h-11 rounded-lg"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Send OTP Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold disabled:opacity-50 transition-all duration-200 rounded-lg"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Send Login Code
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm text-slate-600">
                New to JustQuick?
              </p>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account
                </Button>
              </Link>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
