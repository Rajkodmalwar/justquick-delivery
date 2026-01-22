// components/UserMenu.tsx
"use client"


import { logger } from '@/lib/logger'
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/buyer/cart-context"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  ShoppingBag, 
  Package, 
  LogOut, 
  ChevronDown, 
  Settings, 
  Store, 
  Truck,
  ShoppingCart,
  BarChart3,
  Bell,
  Wallet
} from "lucide-react"

export function UserMenu() {
  const router = useRouter()
  const { getItemCount } = useCart()
  const { 
    user, 
    loading, 
    isAuthenticated, 
    isAdmin, 
    isBuyer,
    logout 
  } = useAuth()
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Always mount to show actual content (not skeleton)
    logger.log('🔵 UserMenu mounted, auth state:', { user: user?.email, loading, isAuthenticated })
    setMounted(true)
  }, [user, loading, isAuthenticated])

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  const cartCount = getItemCount()

  // Only show loading skeleton during initial mount
  // But continue showing content if auth is still loading but user data exists
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        {/* Cart skeleton */}
        <div className="p-2">
          <div className="h-5 w-5 bg-primary/10 rounded animate-pulse" />
        </div>
        
        {/* User button skeleton */}
        <div className="h-9 w-20 bg-primary/10 rounded animate-pulse" />
      </div>
    )
  }

  // Not authenticated - show login button
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        {/* Cart (always visible for non-logged in users) */}
        <Link
          href="/cart"
          className="relative p-2 hover:bg-secondary rounded-lg transition"
          prefetch={false}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>

        {/* Simple Sign In Button */}
        <Link href="/auth/login" prefetch={false}>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  // Authenticated user
  return (
    <div className="flex items-center gap-2">
      {/* Show cart only for buyers */}
      {isBuyer && (
        <Link
          href="/cart"
          className="relative p-2 hover:bg-secondary rounded-lg transition"
          prefetch={false}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>
      )}

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              isAdmin ? "bg-purple-500/20" : "bg-primary/20"
            }`}>
              {user?.name ? (
                <span className={`text-sm font-bold ${
                  isAdmin ? "text-purple-600" : "text-primary"
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className={`h-4 w-4 ${
                  isAdmin ? "text-purple-600" : "text-primary"
                }`} />
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium truncate max-w-[180px]">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
              </div>
              {isAdmin && (
                <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-600 ring-1 ring-inset ring-purple-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Admin menu items */}
          {isAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" prefetch={false} className="cursor-pointer">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/admin/orders" prefetch={false} className="cursor-pointer">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Manage Orders
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/admin/shops" prefetch={false} className="cursor-pointer">
                  <Store className="h-4 w-4 mr-2" />
                  Manage Shops
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/admin/notifications" prefetch={false} className="cursor-pointer">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/admin/commissions" prefetch={false} className="cursor-pointer">
                  <Wallet className="h-4 w-4 mr-2" />
                  Commissions
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Buyer menu items */}
          {isBuyer && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/profile" prefetch={false} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/my-orders" prefetch={false} className="cursor-pointer">
                  <Package className="h-4 w-4 mr-2" />
                  My Orders
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
