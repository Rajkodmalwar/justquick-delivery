"use client"

import { useState } from "react"
import { DriverLoginModal } from "@/components/auth/driver-login-modal"
import { Truck, Wallet, Clock, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DriverPartnerPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
            <Truck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Become a Delivery Partner</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Earn money on your own schedule. Join JustQuick&apos;s growing fleet of delivery partners
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Wallet, title: "Earn Daily", desc: "Get paid per delivery + distance bonus" },
            { icon: Clock, title: "Flexible Hours", desc: "Work whenever you want, no fixed shifts" },
            { icon: Shield, title: "Insurance Cover", desc: "Ride with confidence and protection" },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-card border border-border text-center">
              <item.icon className="h-10 w-10 mx-auto mb-4 text-emerald-500" />
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowLogin(true)}
            className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition flex items-center justify-center gap-2"
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
          New driver? Contact admin to register and get your Driver UUID
        </p>
      </div>

      <DriverLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </main>
  )
}
