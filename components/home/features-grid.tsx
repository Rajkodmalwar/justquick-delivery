"use client"

import { Clock, Shield, Star, Truck, Zap, ThumbsUp } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "9-minute delivery guaranteed",
    color: "from-cyan-500/20 to-cyan-600/10"
  },
  {
    icon: Shield,
    title: "100% Safe",
    description: "Verified sellers & secure payments",
    color: "from-emerald-500/20 to-emerald-600/10"
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "Fresh products from trusted stores",
    color: "from-amber-500/20 to-amber-600/10"
  },
  {
    icon: ThumbsUp,
    title: "Always Available",
    description: "24/7 service with instant notifications",
    color: "from-blue-500/20 to-blue-600/10"
  },
]

export function FeaturesGrid() {
  return (
    <section className="relative py-20 md:py-32 border-b border-slate-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card 
                key={idx} 
                className={`relative bg-gradient-to-br ${feature.color} border-slate-700/50 backdrop-blur p-6 hover:border-cyan-500/30 transition-all duration-300 group`}
              >
                <div className="flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-slate-700/50 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
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
