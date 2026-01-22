"use client"

import { Store, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SimpleFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Vendor Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">For Shop Owners</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
              Grow your business with JustQuick. Reach thousands of customers in your neighborhood.
            </p>
            <Link href="/partner/vendor">
              <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                <Store className="h-4 w-4 mr-2" />
                Register Your Shop
              </Button>
            </Link>
          </div>

          {/* Delivery Partner Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">For Delivery Partners</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
              Earn money with flexible hours. Deliver groceries and earn per order.
            </p>
            <Link href="/partner/driver">
              <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                <Truck className="h-4 w-4 mr-2" />
                Become a Driver
              </Button>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-8">
          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div>
              <p className="font-semibold text-sm mb-3 text-slate-900">Company</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-emerald-600 transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-slate-900">Legal</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Support</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Social</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition">Instagram</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-slate-500">
            <p>&copy; 2026 JustQuick. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
