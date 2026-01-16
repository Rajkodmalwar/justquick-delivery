"use client"

import { ShoppingCart, MapPin, Clock, Star, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface Shop {
  id: string
  name: string
  category: string
  rating: number
  deliveryTime: number
  deliveryFee: number
  distance: number
  image?: string
  discount?: number
  isFavorite?: boolean
}

interface ShopGridProps {
  shops: Shop[]
  title?: string
  viewAllLink?: string
}

export function ShopGrid({ shops, title = "Featured Shops", viewAllLink }: ShopGridProps) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          {viewAllLink && (
            <Link href={viewAllLink} className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}>
              <Card className="h-full hover:shadow-lg dark:hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Image with badges */}
                <div className="relative h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  {shop.image && (
                    <Image
                      src={shop.image}
                      alt={shop.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {shop.discount && (
                    <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                      {shop.discount}% OFF
                    </Badge>
                  )}
                  {shop.isFavorite && (
                    <Badge className="absolute top-3 left-3 bg-pink-500 hover:bg-pink-600">
                      ❤️ Favorite
                    </Badge>
                  )}
                  <Badge className="absolute bottom-3 right-3 bg-cyan-500 hover:bg-cyan-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {shop.deliveryTime} min
                  </Badge>
                </div>

                {/* Content */}
                <CardHeader className="pb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                      {shop.category}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Rating and Distance */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">{shop.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.distance} km away</span>
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 py-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${shop.deliveryFee}
                    </span>
                  </div>

                  {/* Quick Order Button */}
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    View Products
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
