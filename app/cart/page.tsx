"use client"

import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, AlertCircle } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { items, total, clear, remove, add, buyer, isAuthenticated, isLoading } = useCart()

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-secondary rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-secondary rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-16">
            <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
            <Link href="/shops">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Check if profile is complete - requires phone (valid format) and address
  const isProfileComplete = buyer && 
    buyer.phone && 
    /^[6-9]\d{9}$/.test(buyer.phone.replace(/\D/g, '')) &&
    buyer.address &&
    buyer.address.trim().length > 0

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <Button variant="outline" onClick={() => clear()} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-primary font-bold">₹{item.price} each</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => remove(item.product_id)}
                    className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 transition"
                  >
                    {item.quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-4 w-4" />}
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => add({ product_id: item.product_id, name: item.name, price: item.price })}
                    className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-xl font-bold mb-6">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          
          {!isAuthenticated ? (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-700 font-medium">Login to checkout</p>
              <p className="text-sm text-yellow-600 mt-1">You need to login to place an order</p>
              <Button
                onClick={() => router.push("/auth/login?redirect=/cart")}
                className="mt-3 w-full"
              >
                Login Now
              </Button>
            </div>
          ) : !isProfileComplete ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-700 font-medium">Complete your profile</p>
              </div>
              <p className="text-sm text-red-600 mt-1">Add your phone number to place an order</p>
              <Button
                onClick={() => router.push("/profile?redirect=/cart")}
                className="mt-3 w-full"
              >
                Add Phone Number
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/shops")}
              className="w-full py-6 text-lg"
              size="lg"
            >
              Continue to Checkout
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}