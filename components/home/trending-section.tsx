"use client"

import { Star, TrendingUp, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const trendingProducts = [
  { name: "Fresh Apples", price: "₹89", shop: "Fresh Mart", rating: 4.5, icon: "🍎" },
  { name: "Paneer", price: "₹220", shop: "Dairy King", rating: 4.7, icon: "🧀" },
  { name: "Whole Wheat Bread", price: "₹35", shop: "Bakery House", rating: 4.3, icon: "🍞" },
  { name: "Eggs (Dozen)", price: "₹75", shop: "Poultry Shop", rating: 4.6, icon: "🥚" },
]

export function TrendingSection() {
  return (
    <section className="relative py-20 md:py-32 border-b border-slate-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Trending Products</h2>
              <p className="text-slate-400">Popular items right now</p>
            </div>
          </div>
          <Link 
            href="/shops" 
            className="hidden md:flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingProducts.map((product, idx) => (
            <Card 
              key={idx} 
              className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 backdrop-blur overflow-hidden hover:border-cyan-500/30 transition-all duration-300 group flex flex-col"
            >
              {/* Product image placeholder */}
              <div className="h-40 bg-gradient-to-br from-slate-700/50 to-slate-800/50 relative overflow-hidden flex items-center justify-center">
                <div className="text-5xl">{product.icon}</div>
                <Badge className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 border-0 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-cyan-400" />
                  {product.rating}
                </Badge>
              </div>

              {/* Product info */}
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="mb-auto">
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-2">{product.shop}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                  <p className="font-bold text-lg text-cyan-400">{product.price}</p>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
