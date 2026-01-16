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
    <main className="min-h-dvh bg-background">
      <div className="sticky top-[124px] z-40 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat.name} className={`category-pill ${cat.active ? "active" : ""}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Nearby Shops</h1>
            <p className="text-sm text-muted-foreground">Fresh products from local stores</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full fresh-badge text-xs font-semibold">
            <Clock className="h-3 w-3" />
            <span>9 min</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load shops. Please try again.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.shops?.map((shop: any) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="group product-card rounded-2xl bg-card border border-border overflow-hidden"
              >
                <div className="relative h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  {shop.photo ? (
                    <img
                      src={shop.photo || "/placeholder.svg"}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-12 w-12 text-primary/30" />
                  )}
                  {/* Freshness badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full fresh-badge text-xs font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />9 min
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition">{shop.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{shop.shop_type || "General Store"}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs font-medium">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      4.5
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{shop.address || "Nearby location"}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-sm font-medium text-primary">View Products</span>
                    <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {(!data?.shops || data.shops.length === 0) && !isLoading && (
          <div className="text-center py-16">
            <div className="h-20 w-20 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-4">
              <Store className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-lg mb-2">No shops yet</h3>
            <p className="text-muted-foreground text-sm">Check back soon for local shops in your area</p>
          </div>
        )}
      </div>
    </main>
  )
}
