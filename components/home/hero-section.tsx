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
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-20 pb-32 md:pt-32 md:pb-48 transition-colors duration-200">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_1px,transparent_calc(100%-1px)),linear-gradient(transparent_1px,transparent_calc(100%-1px))] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_70%)]" />
      </div>

      {/* Glow effects */}
      <div className="absolute -top-40 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-20 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-20" />

<div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/50 px-4 py-2 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Delivered in 9 minutes</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Fresh Groceries
            </span>
            <br />
            <span className="text-slate-900 dark:text-slate-100">In 9 Minutes</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Order from your neighborhood shops. Get fresh groceries, snacks, and essentials delivered to your doorstep faster than you can say "quick."
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={handleOrderNow}
              className="group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Order Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/shops")}
              className="border-slate-300 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Browse Shops
            </Button>
          </div>

          {/* Partner Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pb-8 border-b border-slate-200 dark:border-slate-800/50">
            <p className="w-full text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-0 sm:w-auto">
              Are you a vendor or delivery partner?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/partner/vendor")}
              className="border-emerald-400/50 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-400 dark:hover:border-emerald-500/50"
            >
              Become a Vendor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/partner/driver")}
              className="border-purple-400/50 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-400 dark:hover:border-purple-500/50"
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
