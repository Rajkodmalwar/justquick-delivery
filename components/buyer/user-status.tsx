"use client"

import { useCart } from "@/components/buyer/cart-context"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { useState } from "react"

export function UserStatus() {
  const { buyer, isAuthenticated, logout } = useCart()
  const [showDetails, setShowDetails] = useState(false)

  if (!isAuthenticated || !buyer) {
    return (
      <div className="fixed top-20 left-4 z-50 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-yellow-700 font-medium">Not logged in</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-20 left-4 z-50">
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm min-w-64">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-medium">Logged in</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-emerald-600 hover:text-emerald-800"
          >
            {showDetails ? 'Hide' : 'Show'} details
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-2 space-y-1 text-xs">
            <div><strong>Name:</strong> {buyer.name}</div>
            <div><strong>Email:</strong> {buyer.email}</div>
            <div><strong>Phone:</strong> {buyer.phone || 'Not set'}</div>
            <div><strong>ID:</strong> {buyer.id.substring(0, 8)}...</div>
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-emerald-500/20">
          <Button
            size="sm"
            variant="outline"
            onClick={logout}
            className="w-full text-xs h-7"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}