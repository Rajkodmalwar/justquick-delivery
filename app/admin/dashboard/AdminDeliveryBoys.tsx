"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Truck, Plus, Trash2, User, Phone, X } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

interface AdminDeliveryBoysProps {
  initialDeliveryBoys?: any[]
}

export default function AdminDeliveryBoys({ initialDeliveryBoys }: AdminDeliveryBoysProps) {
  const { data: deliveryData, mutate: mutateDB } = useSWR("/api/delivery-boys", fetcher, {
    fallbackData: initialDeliveryBoys ? { delivery_boys: initialDeliveryBoys } : undefined
  })
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [newDriver, setNewDriver] = useState<any>(null)

  async function addDeliveryBoy(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/delivery-boys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact }),
      })
      
      if (!res.ok) {
        const err = await res.json()
        alert("Failed to add delivery boy: " + (err.error || "Unknown error"))
        return
      }
      
      const result = await res.json()
      setNewDriver(result.delivery_boy)
      setName("")
      setContact("")
      mutateDB() // Refresh the list
      
    } catch (err: any) {
      alert("Failed to add delivery boy: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteDeliveryBoy(id: string) {
    if (!confirm("Delete this delivery boy?")) return
    const res = await fetch(`/api/delivery-boys/${id}`, { method: "DELETE" })
    if (!res.ok) alert("Failed to delete")
    mutateDB()
  }

  const deliveryBoys = deliveryData?.delivery_boys || initialDeliveryBoys || []
  const availableCount = deliveryBoys.filter((d: any) => d.is_available).length

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Manage Delivery Boys
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
              {availableCount} Available
            </Badge>
            <Badge variant="outline">{deliveryBoys.length - availableCount} Offline</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={addDeliveryBoy} className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register New Delivery Boy
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Contact *
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number"
                required
                className="bg-secondary"
              />
            </div>
          </div>
          <Button type="submit" className="btn-primary-glow mt-4" disabled={submitting}>
            {submitting ? (
              "Adding..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Register
              </>
            )}
          </Button>
        </form>

        <div className="space-y-6">
          {newDriver && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-400">Delivery Boy Registered Successfully!</h4>
                  <p className="text-sm text-muted-foreground">{newDriver.name}</p>
                </div>
                <button onClick={() => setNewDriver(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-background">
                <p className="text-xs text-muted-foreground mb-1">Driver Login Code (share with delivery boy)</p>
                <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">{newDriver.login_code}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deliveryBoys.map((db: any) => (
              <Card key={db.id} className={`bg-card border-border ${db.is_available ? "ring-2 ring-accent/50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${db.is_available ? "bg-accent/20" : "bg-secondary"}`}
                      >
                        <Truck className={`h-5 w-5 ${db.is_available ? "text-accent" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h4 className="font-bold">{db.name}</h4>
                        <p className="text-sm text-muted-foreground">{db.contact}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDeliveryBoy(db.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`h-2 w-2 rounded-full ${db.is_available ? "bg-accent animate-pulse" : "bg-muted-foreground"}`}
                    />
                    <span
                      className={`text-sm font-medium ${db.is_available ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {db.is_available ? "Available for Delivery" : "Offline"}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-500/10 mb-3">
                    <p className="text-xs text-muted-foreground">Login Code</p>
                    <p className="font-mono font-bold text-lg text-emerald-400 tracking-widest">
                      {db.login_code || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Commission</span>
                    <span className="font-bold text-emerald-400">₹{db.total_commission || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}