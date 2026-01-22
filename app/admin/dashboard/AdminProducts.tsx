"use client"

import React, { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { logger } from "@/lib/logger"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { Package, Plus, Trash2, Store, Loader2 } from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

function AdminProducts() {
  const { data: productsData, mutate: mutateProducts } = useSWR("/api/products", fetcher)
  const { data: shopsData } = useSWR("/api/shops", fetcher)
  const [shopId, setShopId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [photo, setPhoto] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null)

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      logger.log("🔄 Sending product data:", {
        shop_id: shopId,
        name,
        price: Number(price),
        photo,
      });

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          name,
          price: Number(price),
          photo,
        }),
      });

      logger.log("📨 API Response status:", res.status);

      let result: any = {};
      const contentType = res.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        result = await res.json();
      } else {
        const text = await res.text();
        logger.warn("⚠️ Non-JSON response:", text);
        result = { error: text || `HTTP ${res.status}` };
      }

      logger.log("📨 API Response data:", result);

      if (!res.ok) {
        const errorMsg = result?.error || result?.message || result?.details || `HTTP ${res.status}`;
        logger.error("❌ API Error:", errorMsg);
        alert("Failed to add product: " + errorMsg);
      } else {
        setName("");
        setPrice("");
        setPhoto("");
        mutateProducts();
        alert("✅ Product added successfully!");
      }
    } catch (err: any) {
      logger.error("💥 Fetch error:", err);
      alert("Failed to add product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    
    const res = await fetch(`/api/products?id=${id}`, { 
      method: "DELETE" 
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      alert("Failed to delete: " + (result.error || "Unknown error"));
    } else {
      mutateProducts();
      alert("✅ Product deleted successfully!");
    }
  }

  async function toggleAvailability(id: string, currentStatus: boolean) {
    setUpdatingProduct(id)
    try {
      const res = await fetch(`/api/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_available: !currentStatus }),
      })
      if (!res.ok) {
        alert("Failed to update availability")
      }
      mutateProducts()
    } catch (err) {
      alert("Failed to update availability")
    } finally {
      setUpdatingProduct(null)
    }
  }

  const products = productsData?.products || []
  const shops = shopsData?.shops || []

  const groupedProducts = shops.map((shop: any) => ({
    ...shop,
    products: products.filter((p: any) => p.shop_id === shop.id),
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Manage Products
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={addProduct} className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Product
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Shop *</label>
              <Select value={shopId} onValueChange={setShopId} required>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Product Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                required
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Price (₹) *</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                required
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-4">
              <label className="text-sm text-muted-foreground">Product Photo</label>
              <ImageUpload value={photo} onChange={setPhoto} />
            </div>
          </div>
          <Button type="submit" className="btn-primary-glow mt-4" disabled={submitting || !shopId}>
            {submitting ? (
              "Adding..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </>
            )}
          </Button>
        </form>

        <div className="space-y-6">
          {groupedProducts.map((shop: any) => (
            <div key={shop.id}>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Store className="h-4 w-4" />
                {shop.name}
                <Badge variant="outline">{shop.products.length} products</Badge>
              </h4>
              {shop.products.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products added yet</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {shop.products.map((p: any) => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all ${
                        p.is_available !== false
                          ? "bg-secondary/30 border-border"
                          : "bg-destructive/5 border-destructive/30"
                      }`}
                    >
                      {(p.photo || p.image) && (
                        <div
                          className={`h-24 rounded-lg overflow-hidden bg-secondary mb-2 ${
                            p.is_available === false ? "grayscale opacity-50" : ""
                          }`}
                        >
                          <img src={p.photo || p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-primary font-bold">₹{p.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => toggleAvailability(p.id, p.is_available !== false)}
                              disabled={updatingProduct === p.id}
                              className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                                p.is_available !== false
                                  ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30"
                                  : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                              }`}
                            >
                              {updatingProduct === p.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : p.is_available !== false ? (
                                "Available"
                              ) : (
                                "Unavailable"
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
export default AdminProducts