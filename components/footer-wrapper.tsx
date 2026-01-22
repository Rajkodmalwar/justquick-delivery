"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

export function FooterWrapper() {
  const pathname = usePathname()
  
  // Hide footer on shop product browsing pages
  if (pathname.match(/^\/shops\/[\w-]+\/?$/)) {
    return null
  }
  
  return <Footer />
}
