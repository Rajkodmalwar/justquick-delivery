"use client"

import { useState } from "react"
import { VendorLoginModal } from "@/components/auth/vendor-login-modal"
import { Store, CheckCircle, Clock, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function VendorPartnerPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Become a Vendor Partner</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Reach more customers and grow your business with JustQuick&apos;s hyperlocal delivery network
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: TrendingUp, title: "Increase Sales", desc: "Reach thousands of customers in your area" },
            { icon: Clock, title: "Quick Setup", desc: "Get started in minutes with easy onboarding" },
            { icon: CheckCircle, title: "Reliable Delivery", desc: "Our riders ensure fast & safe delivery" },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-card border border-border text-center">
              <item.icon className="h-10 w-10 mx-auto mb-4 text-amber-500" />
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowLogin(true)}
            className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            Login to Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="px-8 py-4 rounded-xl font-bold border border-border hover:bg-secondary transition text-center"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          New vendor? Contact admin to register your shop and get your Shop UUID
        </p>
      </div>

      <VendorLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </main>
  )
}
