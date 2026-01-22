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

  // Fallback: Load buyer from localStorage if cart context buyer is stale
  const [displayBuyer, setDisplayBuyer] = useState(buyer);
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // If buyer doesn't have phone but localStorage does, use localStorage
      if (!buyer?.phone) {
        const savedBuyer = localStorage.getItem("jq_buyer");
        if (savedBuyer) {
          try {
            const parsed = JSON.parse(savedBuyer);
            if (parsed?.phone) {
              logger.log("📦 Using buyer from localStorage as fallback:", parsed);
              setDisplayBuyer(parsed);
              return;
            }
          } catch (e) {
            logger.error("Error parsing localStorage buyer:", e);
          }
        }
      }
      setDisplayBuyer(buyer);
    }
  }, [buyer, isAuthenticated, isLoading]);

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
    setCheckoutAttempted(true);
    setCheckoutLoading(true);
    try {
      // Ensure all required data is present
      if (!displayBuyer?.phone) {
        throw new Error("Phone number is required");
      }

      const cleanPhone = displayBuyer.phone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error("Invalid phone number format");
      }

      const orderData = {
        shop_id: shopId,
        buyer_phone: cleanPhone,
        buyer_address: displayBuyer.address || "",
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

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const responseText = await res.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        logger.error("Failed to parse API response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        logger.error("Order API failed:", res.status);

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

      clear();
      setExpanded(false);
      setCheckoutAttempted(false);

      if (data.order?.id) {
        router.push(`/orders/${data.order.id}`);
      } else {
        router.push("/myorders");
      }
    } catch (error: any) {
      logger.error("Order placement error:", error.message);
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
    displayBuyer?.phone && /^[6-9]\d{9}$/.test(displayBuyer.phone.replace(/\D/g, ""));

  // Debug logging
  logger.log("🛒 Cart drawer rendering:", {
    hasPhone: !!displayBuyer?.phone,
    phone: displayBuyer?.phone,
    isComplete: isProfileComplete,
    buyer: buyer?.phone,
    displayBuyer: displayBuyer?.phone
  })

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white text-emerald-600 text-xs font-bold flex items-center justify-center">
                  {items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">₹{grandTotal}</p>
                <p className="text-xs text-white/80">
                  {items.length} items • delivery included
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
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl md:rounded-lg md:max-h-[90vh] md:w-11/12 md:max-w-6xl md:mx-auto md:inset-auto md:bottom-1/2 md:right-1/2 md:translate-x-1/2 md:translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-slate-200 md:rounded-t-lg">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-4 md:hidden" />
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">Your Cart</h3>
                <button
                  onClick={() => clear()}
                  className="text-sm text-red-600 font-medium hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 md:grid md:grid-cols-3 md:gap-6">
              {/* Cart Items Column - Takes 2 columns on desktop */}
              <div className="md:col-span-2 space-y-3">
                {items.map((i) => (
                  <div
                    key={i.product_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{i.name}</p>
                      <p className="text-sm text-emerald-600 font-bold">
                        ₹{i.price * i.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => remove(i.product_id)}
                        className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-red-200 text-slate-600 hover:text-red-600 transition"
                      >
                        {i.quantity === 1 ? (
                          <Trash2 className="h-3 w-3" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-900">
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
                        className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary and Payment Column - Sticky on mobile, normal on desktop */}
              <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">

                {/* Price Summary */}
                <div className="space-y-3 mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Items Subtotal</span>
                    <span className="text-slate-900 font-medium">₹{total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emerald-500" /> Delivery Fee
                    </span>
                    <span className="text-slate-900 font-medium">₹{deliveryCost}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-3xl font-extrabold text-emerald-600">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {/* User/Profile Section */}
                {!isAuthenticated ? (
                  <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">Login Required</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Sign in to complete your order and track your delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !isProfileComplete ? (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900">Complete Your Profile</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          {displayBuyer?.phone
                            ? "Please verify your phone number to continue"
                            : "Add your phone number to complete checkout"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleOpenProfile}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                      {displayBuyer?.phone ? "Verify Phone" : "Add Phone Number"}
                    </Button>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-sm font-semibold text-slate-900">{displayBuyer?.name}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {displayBuyer?.phone}
                    </p>
                    {displayBuyer?.address && (
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {displayBuyer.address}
                      </p>
                    )}
                    <button
                      onClick={handleOpenProfile}
                      className="text-xs text-emerald-600 font-semibold mt-2 hover:text-emerald-700"
                    >
                      Edit details
                    </button>
                  </div>
                )}

                {/* Payment Section */}
                <div className="space-y-4 mb-6">
                  <p className="text-sm font-semibold text-slate-900">Payment Method</p>
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                    <button
                      onClick={() => setPaymentType("COD")}
                      className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                        paymentType === "COD"
                          ? "border-emerald-500 bg-emerald-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "COD"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300"
                      }`}>
                        {paymentType === "COD" && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <Banknote
                        className={`h-5 w-5 ${
                          paymentType === "COD"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          paymentType === "COD" ? "text-emerald-600" : "text-slate-700"
                        }`}
                      >
                        Cash on Delivery
                      </span>
                    </button>
                    <button
                      onClick={() => setPaymentType("ONLINE")}
                      className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                        paymentType === "ONLINE"
                          ? "border-emerald-500 bg-emerald-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "ONLINE"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300"
                      }`}>
                        {paymentType === "ONLINE" && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <CreditCard
                        className={`h-5 w-5 ${
                          paymentType === "ONLINE"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          paymentType === "ONLINE" ? "text-emerald-600" : "text-slate-700"
                        }`}
                      >
                        Online Payment
                      </span>
                    </button>
                  </div>

                  {/* CTA Button - Sticky on mobile, normal on desktop */}
                  <Button
                    className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 sticky bottom-4 md:static"
                    disabled={
                      checkoutLoading ||
                      !isAuthenticated ||
                      (isAuthenticated && !isProfileComplete) ||
                      items.length === 0
                    }
                    onClick={!isAuthenticated ? () => setShowAuthModal(true) : handlePlaceOrder}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : !isAuthenticated ? (
                      "Login to Continue"
                    ) : !isProfileComplete ? (
                      "Complete Profile"
                    ) : (
                      `Place Order • ₹${grandTotal}`
                    )}
                  </Button>
                </div>
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

