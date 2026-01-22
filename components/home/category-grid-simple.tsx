"use client"

import { Package, Apple, Leaf, Wheat, Milk } from "lucide-react"
import Link from "next/link"

const categories = [
  { name: "Vegetables", icon: Leaf, color: "bg-emerald-100", textColor: "text-emerald-700" },
  { name: "Fruits", icon: Apple, color: "bg-red-100", textColor: "text-red-700" },
  { name: "Rice & Grains", icon: Wheat, color: "bg-amber-100", textColor: "text-amber-700" },
  { name: "Snacks", icon: Package, color: "bg-orange-100", textColor: "text-orange-700" },
  { name: "Dairy", icon: Milk, color: "bg-sky-100", textColor: "text-sky-700" },
]

export function CategoryGridSimple() {
  return (
    <section className="bg-white py-8 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <Link
                key={idx}
                href={`/shops?category=${category.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-slate-50 hover:scale-105"
              >
                <div className={`${category.color} p-4 rounded-full group-hover:shadow-md transition-all duration-200`}>
                  <Icon className={`${category.textColor} h-7 w-7 sm:h-8 sm:w-8`} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 text-center line-clamp-2 group-hover:text-slate-950">
                  {category.name}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
