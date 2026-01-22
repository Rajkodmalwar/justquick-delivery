"use client"

import Link from "next/link"
import { Store, Truck, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PartnerSection() {
  const stats = [
    { icon: Store, label: "Partner Shops", value: "500+" },
    { icon: Truck, label: "Active Drivers", value: "1000+" },
    { icon: Users, label: "Happy Customers", value: "50K+" },
    { icon: Zap, label: "Orders/Month", value: "200K+" },
  ]

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white p-8 sm:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Grow with JustQuick</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Join thousands of shop owners and delivery partners earning with JustQuick. Scale your business with our platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/partner/vendor">
                  <Button 
                    size="lg"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Store className="h-5 w-5" />
                    Register Your Shop
                  </Button>
                </Link>
                <Link href="/partner/driver">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
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
                    className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-colors text-center group"
                  >
                    <div className="p-3 rounded-lg bg-emerald-100 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">{stat.label}</p>
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
