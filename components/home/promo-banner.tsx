"use client"

import { Zap, Flame, Clock } from "lucide-react"
import Link from "next/link"

interface PromobannerProps {
  isAuthenticated: boolean
}

export function PromoBanner({ isAuthenticated }: PromobannerProps) {
  if (!isAuthenticated) return null

  return (
    <section className="bg-white border-b border-slate-200 py-3">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-slate-700">
              <strong>First order?</strong> Get <span className="text-emerald-600 font-semibold">50% OFF</span> + Free Delivery
            </span>
          </div>
          <Link href="/shops" className="text-emerald-600 hover:underline font-semibold">
            Shop Now →
          </Link>
        </div>
      </div>
    </section>
  )
}
