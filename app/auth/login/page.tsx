"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Loader2, ArrowRight, UserPlus, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Show any error from URL params (e.g., from callback failure)
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleSendMagicLink = async (e: React.FormEvent) => {
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

    const supabase = createClient()

    try {
      console.log("📧 Sending magic link to:", email)
      console.log("🔗 Redirect URL:", `${window.location.origin}/auth/callback`)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        console.error("❌ Magic link error:", error)
        throw error
      }

      console.log("✅ Magic link sent successfully")
      setSent(true)

    } catch (err: any) {
      console.error("❌ Login error:", err)
      setError(err.message || "Failed to send magic link. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-slate-100">Check Your Email</CardTitle>
              <p className="text-slate-400 mt-2">We've sent a magic link to:</p>
              <p className="font-semibold text-cyan-400 mt-1">{email}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-slate-300">
                  Click the link in your email to sign in instantly. No password needed!
                </p>
                <p className="text-xs text-slate-400">
                  The link will expire in 24 hours.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center">
                  Didn't receive the email?
                </p>
                <Button
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try Another Email
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

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
      <div className="w-full max-w-md">
        <Card className="border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-slate-400">Sign in with a magic link</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSendMagicLink} className="space-y-6">
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

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Magic Link Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium"
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
