"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, IndianRupee } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function AdminCommissions() {
  const { data: commissionsData } = useSWR("/api/commissions", fetcher)
  const { data: deliveryData } = useSWR("/api/delivery-boys", fetcher)

  const commissions = commissionsData?.commissions || []
  const deliveryBoys = deliveryData?.delivery_boys || []

  // Calculate totals
  const totalPaid = commissions
    .filter((c: any) => c.paid_status === "paid")
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  
  const totalPending = commissions
    .filter((c: any) => c.paid_status !== "paid")
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  
  const totalCommission = totalPaid + totalPending

  // Calculate per driver
  const driverEarnings: Record<string, number> = {}
  deliveryBoys.forEach((driver: any) => {
    const driverCommissions = commissions.filter((c: any) => c.delivery_boy_id === driver.id)
    driverEarnings[driver.id] = driverCommissions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-500">₹{totalPaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-500">₹{totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Commission</p>
                <p className="text-2xl font-bold">₹{totalCommission}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Driver Commission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryBoys.map((driver: any) => {
              const driverCommissions = commissions.filter((c: any) => c.delivery_boy_id === driver.id)
              const paid = driverCommissions
                .filter((c: any) => c.paid_status === "paid")
                .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
              const pending = driverCommissions
                .filter((c: any) => c.paid_status !== "paid")
                .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
              
              return (
                <div key={driver.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.contact}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <p className="font-bold text-emerald-500">₹{paid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="font-bold text-amber-500">₹{pending}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold">₹{paid + pending}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No commission records yet</p>
          ) : (
            <div className="space-y-3">
              {commissions.slice(0, 10).map((c: any) => {
                const driver = deliveryBoys.find((d: any) => d.id === c.delivery_boy_id)
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <div>
                      <p className="font-medium">{driver?.name || "Unknown Driver"}</p>
                      <p className="text-xs text-muted-foreground">
                        Order #{c.order_id?.slice(0, 8) || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{c.amount || 0}</p>
                      <Badge variant={c.paid_status === "paid" ? "default" : "secondary"}>
                        {c.paid_status || "pending"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}