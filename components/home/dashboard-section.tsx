"use client"

import Link from "next/link"
import { ShoppingCart, Bell, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardSectionProps {
  recentOrders: any[]
  notifications: any[]
  unreadNotifications: number
}

export function DashboardSection({
  recentOrders,
  notifications,
  unreadNotifications,
}: DashboardSectionProps) {
  return (
    <section className="py-20 md:py-32 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Your Dashboard</h2>
            <p className="text-slate-600">Track orders and stay updated</p>
          </div>
          <Link href="/notifications" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-emerald-600 hover:text-emerald-700 hover:border-slate-300 font-medium transition-all">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <Badge className="bg-red-500 text-white border-0 h-5 min-w-5 flex items-center justify-center text-xs font-bold">
                {unreadNotifications}
              </Badge>
            )}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                  Recent Orders
                </h3>
                {recentOrders.length > 0 && (
                  <Link href="/orders" className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors">
                    View all
                  </Link>
                )}
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link 
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            'outline'
                          } className="mb-2">
                            {order.status}
                          </Badge>
                          <p className="font-bold text-emerald-600">₹{order.total_price}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex p-3 rounded-lg bg-slate-100 mb-4">
                    <ShoppingCart className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium mb-2">No orders yet</p>
                  <p className="text-sm text-slate-600 mb-6">Start shopping to see your orders here</p>
                  <Link href="/shops">
                    <Button variant="outline" className="border-slate-300 hover:bg-slate-100">
                      Browse Shops
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-white border-slate-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Bell className="h-5 w-5 text-emerald-600" />
                  </div>
                  Alerts
                </h3>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.metadata?.action || "/notifications"}
                      className="block p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {!notification.is_read ? (
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(notification.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex p-3 rounded-lg bg-slate-100 mb-4">
                    <Bell className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium mb-2">No alerts yet</p>
                  <p className="text-sm text-slate-600">Order updates will appear here</p>
                </div>
              )}

              {notifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Link href="/notifications" className="w-full">
                    <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-100">
                      View All Alerts
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
