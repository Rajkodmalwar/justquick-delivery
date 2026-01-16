"use client";

import { useState, useEffect } from "react";
import { useCart } from "./cart-context";
import { AuthModal } from "../auth/auth-modal";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  CreditCard,
  Banknote,
  Minus,
  Plus,
  ChevronUp,
  ChevronDown,
  Loader2,
  Truck,
  AlertCircle,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export function CartCheckout({
  shopId,
  shopLat,
  shopLng,
}: {
  shopId: string;
  shopLat: number;
  shopLng: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    total,
    clear,
    remove,
    add,
    buyer,
    isAuthenticated,
    isLoading,
    refreshUser,
  } = useCart();
  const [paymentType, setPaymentType] = useState<"COD" | "ONLINE">("COD");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkoutAttempted, setCheckoutAttempted] = useState(false);

  const { data: settingsData } = useSWR(
    "/api/settings?key=delivery_cost",
    fetcher
  );
  const deliveryCost = settingsData?.setting?.value
    ? Number(settingsData.setting.value)
    : 30;
  const grandTotal = total + deliveryCost;

  // Refresh user data when component mounts
  useEffect(() => {
    if (!isLoading && isAuthenticated && !buyer) {
      refreshUser();
    }
  }, [isLoading, isAuthenticated, buyer, refreshUser]);

  useEffect(() => {
    // Check if user was redirected here for auth
    const authRequired = searchParams.get("auth_required");
    const redirectPath = searchParams.get("redirect");
    if (authRequired === "true" && !isAuthenticated && !isLoading) {
      setShowAuthModal(true);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("auth_required");
      newUrl.searchParams.delete("redirect");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, isAuthenticated, isLoading, router]);

  const handlePlaceOrder = async () => {
    setCheckoutAttempted(true); // ADD THIS LINE
    setCheckoutLoading(true);
    try {
      console.log("📦 Preparing order data...");

      // Ensure all required data is present
      if (!buyer?.phone) {
        throw new Error("Phone number is required");
      }

      const cleanPhone = buyer.phone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error("Invalid phone number format");
      }

      const orderData = {
        shop_id: shopId,
        buyer_phone: cleanPhone,
        buyer_address: buyer.address || "",
        products: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total_price: total,
        delivery_cost: deliveryCost,
        payment_type: paymentType,
        shop_lat: shopLat,
        shop_lng: shopLng,
      };

      console.log("🚀 Sending order request:", orderData);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const responseText = await res.text();
      console.log("📥 Raw API response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("📊 API response:", data);

      if (!res.ok) {
        console.error("❌ Order API failed:", {
          status: res.status,
          statusText: res.statusText,
          data: data,
        });

        // Show detailed error message
        let errorMessage = "Order failed";
        if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            errorMessage += `: ${
              Array.isArray(data.details)
                ? data.details.join(", ")
                : data.details
            }`;
          }
          if (data.supabase_error?.message) {
            errorMessage += ` (Database: ${data.supabase_error.message})`;
          }
        }

        throw new Error(errorMessage);
      }

      console.log("✅ Order successful:", data.order?.id);
      clear();
      setExpanded(false);
      setCheckoutAttempted(false); // Reset after success

      if (data.order?.id) {
        router.push(`/orders/${data.order.id}`);
      } else {
        router.push("/myorders");
      }
    } catch (error: any) {
      console.error("💥 Order placement error:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    // Wait a moment for auth state to propagate
    await new Promise((resolve) => setTimeout(resolve, 500));
    await refreshUser();

    // Retry checkout if it was attempted
    if (checkoutAttempted) {
      handlePlaceOrder();
    }
  };

  const handleOpenProfile = () => {
    const redirectUrl = encodeURIComponent(window.location.pathname);
    router.push(`/profile?redirect=${redirectUrl}`);
  };

  if (isLoading || items.length === 0) {
    return null;
  }

  const isProfileComplete =
    buyer?.phone && /^[6-9]\d{9}$/.test(buyer.phone.replace(/\D/g, ""));

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 rounded-2xl btn-primary-glow text-white"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">
                  {items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-bold">₹{grandTotal}</p>
                <p className="text-xs text-white/80">
                  {items.length} items + delivery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">View Cart</span>
              {expanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </div>
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setExpanded(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-background rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background p-4 border-b border-border">
              <div className="w-12 h-1.5 rounded-full bg-border mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Your Cart</h3>
                <button
                  onClick={() => clear()}
                  className="text-sm text-destructive font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {items.map((i) => (
                <div
                  key={i.product_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-sm text-primary font-bold">
                      ₹{i.price * i.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => remove(i.product_id)}
                      className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 transition"
                    >
                      {i.quantity === 1 ? (
                        <Trash2 className="h-3 w-3" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </button>
                    <span className="w-8 text-center font-bold text-sm">
                      {i.quantity}
                    </span>
                    <button
                      onClick={() =>
                        add({
                          product_id: i.product_id,
                          name: i.name,
                          price: i.price,
                        })
                      }
                      className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="space-y-2 mb-4 p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-4 w-4" /> Delivery Fee
                  </span>
                  <span>₹{deliveryCost}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-xl font-extrabold text-primary">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 text-primary font-medium hover:bg-primary/5 transition"
                  >
                    Login to continue
                  </button>
                </div>
              ) : !isProfileComplete ? (
                <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-700">
                      Complete your profile
                    </span>
                  </div>
                  <p className="text-sm text-yellow-600 mb-3">
                    {buyer?.phone
                      ? "Update your phone number"
                      : "Add your phone number"}{" "}
                    to place orders
                  </p>
                  <Button
                    onClick={handleOpenProfile}
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  >
                    {buyer?.phone ? "Update Profile" : "Add Phone Number"}
                  </Button>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-secondary/50">
                  <p className="text-sm font-medium">{buyer?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {buyer?.phone}
                  </p>
                  {buyer?.address && (
                    <p className="text-xs text-muted-foreground">
                      {buyer.address}
                    </p>
                  )}
                  <button
                    onClick={handleOpenProfile}
                    className="text-xs text-primary font-medium mt-1"
                  >
                    Change details
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentType("COD")}
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                      paymentType === "COD"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Banknote
                      className={`h-6 w-6 ${
                        paymentType === "COD"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        paymentType === "COD" ? "text-primary" : ""
                      }`}
                    >
                      Cash on Delivery
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentType("ONLINE")} // Changed from "UPI" to "ONLINE"
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                      paymentType === "ONLINE"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <CreditCard
                      className={`h-6 w-6 ${
                        paymentType === "ONLINE"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        paymentType === "ONLINE" ? "text-primary" : ""
                      }`}
                    >
                      Online Payment
                    </span>
                  </button>
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold rounded-xl btn-primary-glow"
                  disabled={
                    checkoutLoading ||
                    !isAuthenticated ||
                    (isAuthenticated && !isProfileComplete) ||
                    items.length === 0
                  }
                  onClick={handlePlaceOrder}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : !isAuthenticated ? (
                    "Login to Place Order"
                  ) : !isProfileComplete ? (
                    "Complete Profile to Place Order"
                  ) : (
                    `Place Order • ₹${grandTotal}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-24" />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Complete Your Profile"
        requirePhone={true}
      />
    </>
  );
}
