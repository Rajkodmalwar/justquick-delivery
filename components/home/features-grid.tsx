"use client"

import { Clock, Shield, Star, Truck, Zap, ThumbsUp } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "9-minute delivery guaranteed"
  },
  {
    icon: Shield,
    title: "100% Safe",
    description: "Verified sellers & secure payments"
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "Fresh products from trusted stores"
  },
  {
    icon: ThumbsUp,
    title: "Always Available",
    description: "24/7 service with instant notifications"
  },
]

export function FeaturesGrid() {
  return (
    <section className="relative py-20 md:py-32 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card 
                key={idx} 
                className="relative bg-white border-slate-200 hover:border-emerald-200 transition-colors group p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-emerald-50 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
