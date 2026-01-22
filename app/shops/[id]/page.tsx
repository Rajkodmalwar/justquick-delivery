"use client"

import useSWR from "swr"
import { useMemo, Suspense } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CartProvider } from "@/components/buyer/cart-context"
import { ProductList } from "@/components/buyer/product-list"
import { CartCheckout } from "@/components/buyer/cart-drawer"
import { ArrowLeft, Store, Clock, MapPin, Phone, Star } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ShopDetailPage() {
  const params = useParams()
  const shopId = params?.id as string
  const { data, isLoading } = useSWR(`/api/shops?id=${shopId}`, fetcher)
  const shop = useMemo(() => data?.shop, [data])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="h-40 rounded-2xl bg-card animate-pulse mb-6" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!shop) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-4">
          <Store className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold mb-2">Shop not found</h2>
        <Link href="/shops" className="text-primary font-medium">
          Back to Shops
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-white">
      {/* Shop header with background */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="h-16 flex items-center">
            <Link
              href="/shops"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          {/* Shop name and quick info */}
          <div className="pb-8">
            <h1 className="text-4xl font-extrabold mb-3">{shop.name}</h1>
            <p className="text-slate-300 text-lg mb-4">{shop.shop_type || "General Store"}</p>

            {/* Quick info badges */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>Delivers in 9 min</span>
              </div>
              <div className="flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-2 rounded-lg">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>4.5 Rating</span>
              </div>
              {shop.address && (
                <div className="flex items-center gap-1 bg-white/15 backdrop-blur px-3 py-2 rounded-lg">
                  <MapPin className="h-4 w-4" />
                  <span>{shop.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products section */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Shop Products</h2>
          </div>

          {/* Products grid */}
          <CartProvider>
            <ProductList shopId={shopId} />
            <Suspense fallback={<div className="text-center py-8 text-slate-600">Loading checkout...</div>}>
              <CartCheckout shopId={shopId} shopLat={shop.lat || 0} shopLng={shop.lng || 0} />
            </Suspense>
          </CartProvider>
        </div>
      </div>
    </main>
  )
}
