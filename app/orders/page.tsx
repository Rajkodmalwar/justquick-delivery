"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to your orders list page
    router.push("/myorders")
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to your orders</p>
      </div>
    </main>
  )
}