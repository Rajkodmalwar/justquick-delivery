"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroBannerSimple() {
  return (
    <section className="bg-white border-b border-slate-200 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Fresh Groceries in 9 Minutes
          </h1>
          <p className="text-slate-600 mb-6 text-lg">
            Shop from nearby stores and get instant delivery
          </p>
          <Link href="/shops">
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              Browse Nearby Shops
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
