import type React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600 transition">About</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600 transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">Contact</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600 transition">Privacy</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">Terms</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Social</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600 transition">Twitter</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">Instagram</Link></li>
              <li><Link href="#" className="hover:text-emerald-600 transition">LinkedIn</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-600">
          <p>&copy; 2026 JustQuick. All rights reserved.</p>
          <p>Made with care for your neighborhood.</p>
        </div>
      </div>
    </footer>
  )
}
