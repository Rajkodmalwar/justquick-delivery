"use client"

import { Star, Clock, MapPin, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface Shop {
  id: string
  name: string
  category: string
  rating: number
  deliveryTime: number
  deliveryFee: number
  distance: number
  image?: string
  isOpen?: boolean
  discount?: number
}

interface NearbyShopsProps {
  shops: Shop[]
}

export function NearbyShops({ shops }: NearbyShopsProps) {
  return (
    <section className="bg-white py-12 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Nearby Shops</h2>
          <Link href="/shops" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
            See all →
          </Link>
        </div>

        {/* Horizontal Scroll */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 pb-2">
            {shops.slice(0, 8).map((shop) => {
              const isOpen = shop.isOpen !== false
              const isFeatured = shop.rating >= 4.7
              
              return (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="shrink-0 w-56 group"
                >
                  <Card className="h-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    {/* Image Section */}
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      {/* Image with overlay effect */}
                      <div className="relative h-full w-full bg-slate-50 group-hover:scale-105 transition-transform duration-300">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                          🏪
                        </div>
                      </div>

                      {/* Closed overlay */}
                      {!isOpen && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-white rounded-full px-4 py-2">
                            <p className="text-sm font-semibold text-slate-900">Currently Closed</p>
                          </div>
                        </div>
                      )}

                      {/* Featured Badge - Gold */}
                      {isFeatured && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Award className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">Featured</span>
                        </div>
                      )}

                      {/* Discount Badge - Red */}
                      {shop.discount && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                          <span className="text-xs font-bold">{shop.discount}% OFF</span>
                        </div>
                      )}

                      {/* Quick Info Badges - Glassmorphism */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-3 flex gap-2 justify-between">
                        <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs font-semibold text-slate-900">{shop.deliveryTime}m</span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md">
                          <MapPin className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-xs font-semibold text-slate-900">{shop.distance.toFixed(1)}km</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-6">
                      {/* Shop Name */}
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {shop.name}
                      </h3>

                      {/* Category */}
                      <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                        {shop.category}
                      </p>

                      {/* Rating Section */}
                      <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.floor(shop.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-sm text-slate-900">{shop.rating}</span>
                        </div>
                        {isFeatured && (
                          <TrendingUp className="h-4 w-4 text-emerald-600 ml-auto" />
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200 py-3 mb-4 flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          {shop.deliveryFee === 0 ? (
                            <span className="font-semibold text-emerald-600">Free delivery</span>
                          ) : (
                            <>
                              <span className="text-slate-600">₹</span>
                              <span className="font-semibold text-slate-900">{shop.deliveryFee.toFixed(0)}</span>
                              <span className="text-slate-600"> delivery</span>
                            </>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-xs font-semibold text-emerald-600">Open</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {isOpen ? (
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-95 shadow-md">
                          Order Now
                        </button>
                      ) : (
                        <button disabled className="w-full bg-slate-200 text-slate-400 font-semibold py-2.5 rounded-lg cursor-not-allowed">
                          Closed
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
