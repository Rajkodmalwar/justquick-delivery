"use client"

import { Clock, Package, Heart } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  shopName: string
  totalPrice: number
  status: string
  createdAt: string
  itemCount: number
}

interface RecentOrdersProps {
  orders: Order[]
  isAuthenticated: boolean
}

export function RecentOrders({ orders, isAuthenticated }: RecentOrdersProps) {
  if (!isAuthenticated || orders.length === 0) {
    return (
      <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Quick Reorder
          </h2>
          <Card className="border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No recent orders yet. Start shopping!
              </p>
              <Link href="/shops">
                <Button className="gap-2">
                  <Package className="h-4 w-4" />
                  Browse Shops
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Quick Reorder
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.slice(0, 3).map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="h-full hover:shadow-lg dark:hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {order.shopName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <Badge
                      className={`${
                        order.status === "completed"
                          ? "bg-green-500"
                          : order.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-slate-400"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${order.totalPrice}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/my-orders">
            <Button variant="outline" size="lg">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
