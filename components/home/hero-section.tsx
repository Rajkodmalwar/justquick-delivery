"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  isAuthenticated: boolean
  unreadNotifications: number
}

export function HeroSection({ isAuthenticated, unreadNotifications }: HeroSectionProps) {
  const router = useRouter()

  const handleOrderNow = () => {
    if (isAuthenticated) {
      router.push("/shops")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-32 md:pt-32 md:pb-48">
      {/* Content area */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 border border-slate-200">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-700">Delivered in 9 minutes</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-blue-600">
              Fresh Groceries
            </span>
            <br />
            <span className="text-slate-900">In 9 Minutes</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600">
            Order from your neighborhood shops. Get fresh groceries, snacks, and essentials delivered to your doorstep faster than you can say "quick."
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={handleOrderNow}
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span className="relative z-10 flex items-center gap-2">
                Order Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/shops")}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Browse Shops
            </Button>
          </div>

          {/* Partner Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pb-8 border-b border-slate-200">
            <p className="w-full text-sm text-slate-600 mb-4 sm:mb-0 sm:w-auto">
              Are you a vendor or delivery partner?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/partner/vendor")}
              className="border-emerald-400 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
            >
              Become a Vendor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/partner/driver")}
              className="border-purple-400 text-purple-600 hover:bg-purple-50 hover:border-purple-600"
            >
              Join as Delivery Partner
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800/50">
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-500 uppercase tracking-widest">Trusted by local communities</p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-600 dark:text-slate-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-500">Shops</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">50K+</div>
                <div className="text-sm text-slate-600 dark:text-slate-500">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">2M+</div>
                <div className="text-sm text-slate-600 dark:text-slate-500">Orders Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
