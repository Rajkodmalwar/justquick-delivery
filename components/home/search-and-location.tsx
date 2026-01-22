"use client"

import { useState } from "react"
import { MapPin, Search, Clock, TrendingUp, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchAndLocationProps {
  onSearch: (query: string) => void
}

export function SearchAndLocation({ onSearch }: SearchAndLocationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("Current Location")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <section className="sticky top-0 z-40 bg-white border-b border-slate-200 py-4">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Location selector */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <select className="bg-transparent text-slate-700 focus:outline-none cursor-pointer">
            <option>Current Location</option>
            <option>Set Address</option>
            <option>Saved Addresses</option>
          </select>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search for shops or items..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full rounded-lg border-slate-300 bg-white text-slate-900"
          />
        </div>
      </div>
    </section>
  )
}
