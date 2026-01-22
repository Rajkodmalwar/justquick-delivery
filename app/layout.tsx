// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Link from "next/link"
import { Search, ShoppingBag, MapPin, Store, Truck, Bell } from "lucide-react"
import { UserMenu } from "@/components/auth/user-menu"
import NotificationBellClient from "@/components/notifications/NotificationBellClient"
import { CartProvider } from "@/components/buyer/cart-context"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { FooterWrapper } from "@/components/footer-wrapper"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "JustQuick - 9 Minute Delivery",
  description: "Hyperlocal delivery in 9 minutes. Fresh groceries, snacks & more.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className={`${plusJakarta.className} bg-white text-slate-900 min-h-dvh flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CartProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading...</p>
                </div>
              </div>
            }>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <FooterWrapper />
            </Suspense>
              <Analytics />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-lg font-bold text-white">JQ</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-slate-900">JustQuick</span>
          </Link>

          {/* Right nav */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBellClient />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

// NotificationBellClient is used directly in the header