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
    <main className="min-h-dvh bg-background pb-4">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/10">
          {shop.photo && (
            <img src={shop.photo || "/placeholder.svg"} alt={shop.name} className="h-full w-full object-cover" />
          )}
        </div>
        <Link
          href="/shops"
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full fresh-badge text-sm font-semibold flex items-center gap-1">
          <Clock className="h-4 w-4" />9 min
        </div>
      </div>

      {/* Shop info */}
      <div className="mx-auto max-w-5xl px-4 -mt-8 relative z-10">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">{shop.name}</h1>
              <p className="text-muted-foreground">{shop.shop_type || "General Store"}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm font-semibold">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              4.5
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            {shop.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{shop.address}</span>
              </div>
            )}
            {shop.shop_contact && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{shop.shop_contact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Products</h2>
          <CartProvider>
            <ProductList shopId={shopId} />
            <Suspense fallback={<div>Loading checkout...</div>}>
              <CartCheckout shopId={shopId} shopLat={shop.lat || 0} shopLng={shop.lng || 0} />
            </Suspense>
          </CartProvider>
        </div>
      </div>
    </main>
  )
}
