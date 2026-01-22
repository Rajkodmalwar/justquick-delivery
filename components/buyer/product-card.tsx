"use client"


import { logger } from '@/lib/logger'
import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Plus, Minus, Heart } from "lucide-react"
import { useState } from "react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    description?: string
  }
  shopId: string
}

export function ProductCard({ product, shopId }: ProductCardProps) {
  const { add, remove, getItemQuantity } = useCart()
  const [adding, setAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  
  const quantity = getItemQuantity(product.id)

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      
      add({
        product_id: product.id,
        name: product.name,
        price: product.price
      })
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300))
      
    } catch (error) {
      logger.error("Error adding to cart:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveFromCart = () => {
    remove(product.id)
  }

  const handleIncrease = () => {
    handleAddToCart()
  }

  const handleDecrease = () => {
    handleRemoveFromCart()
  }

  return (
    <Card className="bg-white border border-slate-200 overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all duration-200 rounded-2xl group">
      {/* Image Section */}
      <div className="relative h-52 bg-slate-50 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-5xl opacity-20">📦</div>
        )}
        
        {/* Favorite Icon */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
            }`}
          />
        </button>

        {/* Popular Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
          Popular
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Product Name */}
        <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Description/Category */}
        {product.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {product.description}
          </p>
        )}
        
        {/* Price and Quantity Section */}
        <div className="flex items-center justify-between mb-4 pb-4 border-t border-slate-100">
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">
              ₹{product.price}
            </p>
          </div>
          
          {quantity > 0 ? (
            <div className="mt-4 flex items-center gap-2 bg-slate-50 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDecrease}
                className="h-8 w-8 p-0 hover:bg-slate-200"
                disabled={adding}
              >
                <Minus className="h-4 w-4 text-slate-600" />
              </Button>
              
              <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleIncrease}
                className="h-8 w-8 p-0 hover:bg-slate-200"
                disabled={adding}
              >
                <Plus className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          ) : null}
        </div>

        {/* Add to Cart Button */}
        {quantity === 0 ? (
          <Button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        ) : (
          <div className="text-sm text-slate-600 text-center font-medium">
            {quantity} in cart
          </div>
        )}
      </CardContent>
    </Card>
  )
}
