"use client"

import { useState } from "react"
import useSWR from "swr"
import { useCart } from "./cart-context" // MAKE SURE THIS PATH IS CORRECT
import { AuthModal } from "../auth/auth-modal"
import { ProductCard } from "./product-card"
import { Package, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Product {
  id: string
  name: string
  price: number
  image?: string
  description?: string
  is_available?: boolean
  rating?: number
  review_count?: number
  original_price?: number
  photo?: string
}

export function ProductList({ shopId }: { shopId: string }) {
  const { data, isLoading } = useSWR(`/api/products?shop_id=${shopId}`, fetcher)
  const { add, getItemQuantity } = useCart() // FIXED: Use proper methods
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddToCart = (product: Product) => {
    if (product.is_available === false) {
      return
    }

    // Check if user is authenticated (you need to implement this)
    // For now, let's assume user is authenticated
    add({ 
      product_id: product.id, 
      name: product.name, 
      price: Number(product.price) 
    })
  }

  const handleAuthSuccess = () => {
    // Handle auth success
    setShowAuthModal(false)
    if (pendingProduct) {
      add({ 
        product_id: pendingProduct.id, 
        name: pendingProduct.name, 
        price: Number(pendingProduct.price) 
      })
      setPendingProduct(null)
    }
  }

  // Filter products
  const filteredProducts = data?.products?.filter((p: Product) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const availableProducts = filteredProducts.filter((p: Product) => p.is_available !== false)
  const unavailableProducts = filteredProducts.filter((p: Product) => p.is_available === false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-card animate-pulse" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl bg-card border border-border">
        <div className="h-20 w-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
          <Package className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="font-bold text-lg mb-1">No products available</h3>
        <p className="text-sm text-muted-foreground">Check back later for new items</p>
      </div>
    )
  }

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card border-border"
          />
        </div>
        <button className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Products Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {availableProducts.length} product{availableProducts.length !== 1 ? "s" : ""} available
          {unavailableProducts.length > 0 && (
            <span className="text-destructive ml-2">({unavailableProducts.length} out of stock)</span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-card border border-border">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold mb-1">No products found</h3>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-8">
          {availableProducts.length > 0 && (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableProducts.map((p: Product) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    image: p.image || p.photo,
                    description: p.description,
                  }}
                  shopId={shopId}
                />
              ))}
            </div>
          )}

          {unavailableProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                Currently Unavailable
                <span className="h-px flex-1 bg-border" />
              </h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {unavailableProducts.map((p: Product) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      price: Number(p.price),
                      image: p.image || p.photo,
                      description: p.description,
                    }}
                    shopId={shopId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowAuthModal(false)
            setPendingProduct(null)
          }
        }}
        onSuccess={handleAuthSuccess}
        title="Login to Add to Cart"
      />
    </>
  )
}