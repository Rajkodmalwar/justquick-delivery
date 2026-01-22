"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { logger } from "@/lib/logger"
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email")
      return
    }

    setLoading(true)
    setError("")

    try {
      logger.log("📝 Creating account...")
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim() || email.split('@')[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      logger.log("✅ Account created:", data.user.email)
      setStep('success')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)

    } catch (err: any) {
      logger.error("❌ Signup error:", err)
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
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
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-slate-900">Welcome to JustQuick!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-5">
              <div>
                <p className="text-slate-700 mb-2">
                  Your account is ready.
                </p>
                <p className="text-sm text-slate-600">
                  Fast, fresh groceries & essentials at your doorstep in minutes.
                </p>
              </div>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold transition-all duration-200 rounded-lg"
              >
                Continue to Login
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-xs text-slate-500">
                Redirecting automatically in a moment...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

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
            <CardTitle className="text-3xl text-slate-900">Join JustQuick</CardTitle>
            <p className="text-slate-600 mt-2">Fresh & fast grocery delivery</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-11 rounded-lg"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 h-11 rounded-lg"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 h-11 rounded-lg"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold disabled:opacity-50 transition-all duration-200 rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-slate-600">Already have an account? </span>
                <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Sign In
                </Link>
              </div>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              By creating an account, you agree to our Terms & Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

