"use client"

import { MapPin, ShoppingCart, LogIn } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TopNavBarProps {
  cartItemCount?: number
  isAuthenticated?: boolean
  userName?: string | null
}

export function TopNavBar({
  cartItemCount = 0,
  isAuthenticated = false,
  userName,
}: TopNavBarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              JQ
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">JustQuick</span>
          </Link>

          {/* Location & Search (Middle) */}
          <div className="hidden md:flex items-center gap-2 flex-1 mx-8">
            <MapPin className="h-4 w-4 text-slate-500" />
            <div className="text-sm">
              <p className="text-slate-600">Delivery in</p>
              <p className="font-semibold text-slate-900">9 minutes</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-600 hover:text-slate-900"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-slate-300 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
                  {userName ? userName.split(" ")[0] : "Profile"}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
