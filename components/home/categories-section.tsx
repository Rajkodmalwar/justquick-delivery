"use client"

import Link from "next/link"
import { Package, Pizza, Coffee, IceCream, Beer, ShoppingCart, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"

const categories = [
  { name: "Groceries", icon: Package, color: "text-emerald-400" },
  { name: "Fast Food", icon: Pizza, color: "text-orange-400" },
  { name: "Beverages", icon: Coffee, color: "text-amber-400" },
  { name: "Desserts", icon: IceCream, color: "text-pink-400" },
  { name: "Alcohol", icon: Beer, color: "text-purple-400" },
  { name: "Essentials", icon: ShoppingCart, color: "text-blue-400" },
]

export function CategoriesSection() {
  return (
    <section className="relative py-20 md:py-32 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Shop by Category</h2>
            <p className="text-slate-600">Everything you need, one tap away</p>
          </div>
          <Link 
            href="/shops" 
            className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <Link
                key={idx}
                href={`/shops?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-3 p-6">
                  <div className={`p-3 rounded-lg bg-slate-100 ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900">{category.name}</h3>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Mobile view all link */}
        <div className="md:hidden mt-8 flex justify-center">
          <Link 
            href="/shops" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
