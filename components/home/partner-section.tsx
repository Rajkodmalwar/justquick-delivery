"use client"

import Link from "next/link"
import { Store, Truck, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PartnerSection() {
  const stats = [
    { icon: Store, label: "Partner Shops", value: "500+", color: "from-cyan-500/20 to-cyan-600/10" },
    { icon: Truck, label: "Active Drivers", value: "1000+", color: "from-emerald-500/20 to-emerald-600/10" },
    { icon: Users, label: "Happy Customers", value: "50K+", color: "from-amber-500/20 to-amber-600/10" },
    { icon: Zap, label: "Orders/Month", value: "200K+", color: "from-blue-500/20 to-blue-600/10" },
  ]

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_1px,transparent_calc(100%-1px)),linear-gradient(transparent_1px,transparent_calc(100%-1px))] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-950/50 border-slate-700/50 backdrop-blur p-8 sm:p-12 lg:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full -ml-20 -mb-20" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Grow with JustQuick</h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Join thousands of shop owners and delivery partners earning with JustQuick. Scale your business with our platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/partner/vendor">
                  <Button 
                    size="lg"
                    className="gap-2"
                  >
                    <Store className="h-5 w-5" />
                    Register Your Shop
                  </Button>
                </Link>
                <Link href="/partner/driver">
                  <Button 
                    size="lg"
                    variant="outline"
                  >
                    <Truck className="h-5 w-5" />
                    Become a Driver
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div 
                    key={idx}
                    className={`p-6 rounded-xl bg-gradient-to-br ${stat.color} border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 text-center group`}
                  >
                    <div className="p-3 rounded-lg bg-slate-700/50 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
