"use client"

import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Plus, Minus } from "lucide-react"
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
  
  const quantity = getItemQuantity(product.id)

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      console.log("➕ Adding product:", {
        id: product.id,
        name: product.name,
        price: product.price,
        shopId: shopId
      })
      
      add({
        product_id: product.id,
        name: product.name,
        price: product.price
      })
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300))
      
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveFromCart = () => {
    console.log("➖ Removing product:", product.id)
    remove(product.id)
  }

  const handleIncrease = () => {
    handleAddToCart()
  }

  const handleDecrease = () => {
    handleRemoveFromCart()
  }

  return (
    <Card className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow">
      {product.image && (
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-primary">
              ₹{product.price}
            </p>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecrease}
                  className="h-8 w-8 p-0"
                  disabled={adding}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="w-8 text-center font-bold">{quantity}</span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleIncrease}
                  className="h-8 w-8 p-0"
                  disabled={adding}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={adding}
                className="gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                {adding ? "Adding..." : "Add"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}