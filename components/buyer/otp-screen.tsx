"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { Loader2, CheckCircle } from "lucide-react"

interface OtpScreenProps {
  phone: string
  onSuccess: (user: any) => void
  onError: (error: string) => void
}

export function OtpScreen({ phone, onSuccess, onError }: OtpScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus()
    
    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if last digit entered
    if (index === 5 && value) {
      const fullOtp = newOtp.join("")
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    onError("")

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms'
        }
      })

      if (error) throw error

      setCountdown(60)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (err: any) {
      onError(err.message || "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join("")
    
    if (code.length !== 6) {
      onError("Please enter 6-digit OTP")
      return
    }

    setLoading(true)
    onError("")

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      })

      if (error) throw error

      // Get user
      const { data: { user }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError) throw sessionError

      if (user) {
        onSuccess(user)
      } else {
        throw new Error("Failed to get user")
      }

    } catch (err: any) {
      console.error("OTP verification error:", err)
      onError(err.message || "Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* OTP Inputs */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="h-14 w-12 text-center text-2xl font-bold"
            maxLength={1}
            disabled={loading}
          />
        ))}
      </div>

      <Button
        onClick={() => handleVerifyOtp()}
        className="w-full py-6 text-lg font-semibold"
        disabled={loading || otp.join("").length !== 6}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Verify & Continue
          </>
        )}
      </Button>

      {/* Resend OTP */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {countdown > 0 ? (
            <>Resend OTP in <span className="font-semibold">{countdown}s</span></>
          ) : (
            "Didn't receive code?"
          )}
        </p>
        
        {countdown === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-primary"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </Button>
        )}
      </div>
    </div>
  )
}