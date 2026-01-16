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
      <body className={`${plusJakarta.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-dvh flex flex-col transition-colors duration-200`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <CartProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading...</p>
                </div>
              </div>
            }>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
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
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-950">JQ</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-slate-900 dark:text-white">JustQuick</span>
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

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950 py-12 transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-cyan-400 transition">About</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-cyan-400 transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">Contact</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-cyan-400 transition">Privacy</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">Terms</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Social</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-cyan-400 transition">Twitter</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">Instagram</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition">LinkedIn</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-400">
          <p>&copy; 2026 JustQuick. All rights reserved.</p>
          <p>Made with care for your neighborhood.</p>
        </div>
      </div>
    </footer>
  )
}

// NotificationBellClient is used directly in the header