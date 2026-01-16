"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Verify() {
  const sp = useSearchParams()
  const router = useRouter()
  const role = (sp.get("role") || "vendor") as "admin" | "vendor" | "delivery"
  const phone = sp.get("phone") || ""
  const [code, setCode] = useState("")
  const needsSms = !!phone

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async (evt) => {
      if (evt.event === "SIGNED_IN") {
        await postLoginUpsert()
      }
    })
    return () => sub.data.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const postLoginUpsert = async () => {
    const res = await fetch("/api/auth/upsert-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      return alert("Access denied or profile error")
    }
    router.replace(role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : "/delivery")
  }

  const onVerifySms = async () => {
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" })
    if (error) return alert(error.message)
    await postLoginUpsert()
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <img src="/brand/jq-logo.jpg" alt="JustQuick" className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Verify your sign-in</h1>
          </div>

          {needsSms ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter the 6-digit SMS code sent to {phone}</p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 tracking-widest text-center"
              />
              <button onClick={onVerifySms} className="w-full rounded-lg bg-primary text-white px-4 py-2 font-medium">
                Verify and continue
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If you used email, click the magic link that was sent to you. This page will redirect once you're signed
                in.
              </p>
              <div className="flex items-center gap-2">
                <a href="/auth/login" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
                  Back to sign in
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
