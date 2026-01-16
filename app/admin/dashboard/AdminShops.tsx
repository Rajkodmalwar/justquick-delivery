"use client"

import React, { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Store, Plus, Trash2, User, Phone, MapPin, X } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

interface AdminShopsProps {
  initialShops: any[];  // Add this line to define the prop
}

export default function AdminShops({ initialShops }: AdminShopsProps) {  // Update the function signature to accept the prop
  const { data, mutate: mutateShops } = useSWR("/api/shops", fetcher)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [shopType, setShopType] = useState("grocery")
  const [sellerName, setSellerName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [contact, setContact] = useState("")
  const [description, setDescription] = useState("")
  const [photo, setPhoto] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [newShop, setNewShop] = useState<any>(null)

  async function addShop(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          shop_type: shopType,
          seller_name: sellerName,
          owner_name: ownerName,
          owner_phone: ownerPhone,
          contact,
          description,
          photo,
          lat: 0,
          lng: 0,
        }),
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        const err = result.error || "Unknown error"
        alert("Failed to add shop: " + err)
        return
      }
      
      setNewShop(result.shop)
      setName("")
      setAddress("")
      setShopType("grocery")
      setSellerName("")
      setOwnerName("")
      setOwnerPhone("")
      setContact("")
      setDescription("")
      setPhoto("")
      mutateShops()
      
    } catch (err: any) {
      alert("Failed to add shop: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteShop(id: string) {
    if (!confirm("Delete this shop?")) return
    const res = await fetch(`/api/shops/${id}`, { method: "DELETE" })
    if (!res.ok) alert("Failed to delete")
    mutateShops()
  }

  const shops = data?.shops || []
  const shopTypes = ["grocery", "restaurant", "pharmacy", "electronics", "clothing", "bakery", "other"]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Manage Shops
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={addShop} className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Shop
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Shop Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shop name"
                required
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Address *</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                required
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Shop Type</label>
              <Select value={shopType} onValueChange={setShopType}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shopTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Seller Name</label>
              <Input
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Seller name"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Owner Name</label>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner name"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Owner Phone</label>
              <Input
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Owner phone"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Shop Contact</label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Shop phone"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm text-muted-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="text-sm text-muted-foreground">Shop Photo</label>
              <ImageUpload value={photo} onChange={setPhoto} />
            </div>
          </div>
          <Button type="submit" className="btn-primary-glow mt-4" disabled={submitting}>
            {submitting ? (
              "Adding..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Shop
              </>
            )}
          </Button>
        </form>

        {newShop && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-400">Shop Added Successfully!</h4>
                <p className="text-sm text-muted-foreground">{newShop.name}</p>
              </div>
              <button onClick={() => setNewShop(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground mb-1">Vendor Login Code (share with shop owner)</p>
              <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">{newShop.login_code}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((s: any) => (
            <Card key={s.id} className="bg-card border-border overflow-hidden">
              {s.photo && (
                <div className="h-32 bg-secondary">
                  <img src={s.photo || "/placeholder.svg"} alt={s.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold">{s.name}</h4>
                    <Badge variant="outline" className="mt-1">
                      {s.shop_type || "general"}
                    </Badge>
                  </div>
                  <button
                    onClick={() => deleteShop(s.id)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {s.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {s.address}
                  </p>
                )}
                {s.owner_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> {s.owner_name}
                  </p>
                )}
                {s.contact && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {s.contact}
                  </p>
                )}
                <div className="mt-3 p-2 rounded-lg bg-primary/10">
                  <p className="text-xs text-muted-foreground">Login Code</p>
                  <p className="font-mono font-bold text-primary tracking-widest">{s.login_code || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}