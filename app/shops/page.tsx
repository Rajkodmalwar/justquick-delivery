"use client"

import useSWR from "swr"
import Link from "next/link"
import { Store, MapPin, Clock, Star, ChevronRight } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const categories = [
  { name: "All", active: true },
  { name: "Grocery", active: false },
  { name: "Snacks", active: false },
  { name: "Dairy", active: false },
  { name: "Beverages", active: false },
  { name: "Pharmacy", active: false },
]

export default function ShopsPage() {
  const { data, isLoading, error } = useSWR("/api/shops", fetcher)

  return (
    <main className="min-h-dvh bg-white">
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button 
                key={cat.name} 
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  cat.active
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nearby Shops</h1>
            <p className="text-slate-600 mt-1">Fresh products from local stores</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            <Clock className="h-4 w-4" />
            <span>9 min delivery</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 font-medium">Failed to load shops. Please try again.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {data?.shops?.map((shop: any) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {shop.photo ? (
                    <img
                      src={shop.photo || "/placeholder.svg"}
                      alt={shop.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Store className="h-12 w-12 text-slate-300" />
                  )}
                  {/* Freshness badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full bg-white shadow-md text-slate-900 text-xs font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-500" />9 min
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition">{shop.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-1 mt-0.5">{shop.shop_type || "General Store"}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-xs font-medium text-amber-900">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      4.5
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="line-clamp-1">{shop.address || "Nearby location"}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                    <span className="text-sm font-medium text-emerald-600">View Products</span>
                    <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {(!data?.shops || data.shops.length === 0) && !isLoading && (
          <div className="text-center py-20">
            <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <Store className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">No shops yet</h3>
            <p className="text-slate-600 text-sm">Check back soon for local shops in your area</p>
          </div>
        )}
      </div>
    </main>
  )
}
