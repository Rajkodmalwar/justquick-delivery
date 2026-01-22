"use client"

import { Home, ShoppingCart, Bell, User, Menu } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BottomNavProps {
  cartItemCount?: number
  notificationCount?: number
  isAuthenticated?: boolean
}

export function BottomNav({
  cartItemCount = 0,
  notificationCount = 0,
  isAuthenticated = false,
}: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const navItems = [
    { href: "/", label: "Home", icon: Home, mobile: true },
    { href: "/shops", label: "Shop", icon: ShoppingCart, mobile: true },
    { href: "/notifications", label: "Alerts", icon: Bell, mobile: true, badge: notificationCount },
    { href: isAuthenticated ? "/profile" : "/auth/login", label: "Profile", icon: User, mobile: true },
  ]

  return (
    <>
      {/* Bottom Navigation Bar - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-4 flex-1 relative transition-colors ${
                isActive(item.href)
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Top-right menu for desktop */}
      <div className="hidden md:block fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMenu(!showMenu)}
          className="relative"
        >
          <Menu className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>

        {showMenu && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600 bg-slate-50"
                    : "text-slate-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
