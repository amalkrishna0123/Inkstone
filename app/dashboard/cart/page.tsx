"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuShoppingCart,
  LuTrash2,
  LuArrowRight,
  LuMinus,
  LuPlus,
  LuTag,
  LuTruck,
  LuShieldCheck,
  LuX,
} from "react-icons/lu";
import { TbCurrencyRupee } from "react-icons/tb";
import {
  api,
  Product,
  CartItem,
  getLocalCart,
  addToLocalCart,
  LocalCartItem,
} from "@/src/lib/inkstone-api";

// Unified cart item shape for UI
type UICartItem = {
  id: string; // item_id (API) or product.id (local)
  product: Product;
  quantity: number;
  isLocal: boolean;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<UICartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isLogged =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("inkstone_access"));

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    if (isLogged) {
      try {
        const data: CartItem[] = await api.getCart();
        setItems(
          data.map((item) => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            isLocal: false,
          }))
        );
        setLoading(false);
        return;
      } catch {
        // Fall through to local cart
      }
    }

    // Guest local cart
    const local: LocalCartItem[] = getLocalCart();
    setItems(
      local.map((item) => ({
        id: item.product.id,
        product: item.product,
        quantity: item.quantity,
        isLocal: true,
      }))
    );
    setLoading(false);
  }

  async function handleUpdateQty(item: UICartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      handleRemove(item);
      return;
    }
    if (newQty > item.product.stock) return;

    setUpdatingId(item.id);

    if (!item.isLocal) {
      try {
        await api.updateCartItem(item.id, newQty);
      } catch {
        // Silently ignore
      }
    } else {
      // Update local storage
      const local = getLocalCart();
      const idx = local.findIndex((i) => i.product.id === item.product.id);
      if (idx >= 0) {
        local[idx].quantity = newQty;
        localStorage.setItem("inkstone_local_cart", JSON.stringify(local));
        window.dispatchEvent(new Event("inkstone-cart-change"));
      }
    }

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
    );
    setUpdatingId(null);
  }

  async function handleRemove(item: UICartItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (!item.isLocal) {
      try {
        await api.removeFromCart(item.id);
      } catch {
        // Silently ignore
      }
    } else {
      const local = getLocalCart().filter(
        (i) => i.product.id !== item.product.id
      );
      localStorage.setItem("inkstone_local_cart", JSON.stringify(local));
      window.dispatchEvent(new Event("inkstone-cart-change"));
    }
  }

  async function handleClearAll() {
    for (const item of items) {
      await handleRemove(item);
    }
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "CRYSTAL10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try CRYSTAL10.");
      setCouponApplied(false);
    }
  }

  function handleCheckout() {
    sessionStorage.setItem("crystal_cart_items", JSON.stringify(items));
    router.push("/checkout");
  }

  // ── Price Calculations ────────────────────────────────────────────────────
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 5000 ? 0 : 199;
  const total = subtotal - discount + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffbcc] text-[#4a5c3a]">
              <LuShoppingCart className="text-xl" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              My Cart
            </h1>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
          >
            <LuTrash2 className="text-sm" /> Clear All
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex animate-pulse items-center gap-4 rounded-2xl border border-neutral-100 bg-[#f9f8f5] p-4"
            >
              <div className="h-24 w-24 rounded-2xl bg-neutral-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-3 w-1/3 rounded bg-neutral-200" />
                <div className="h-6 w-1/4 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <LuShoppingCart className="text-4xl stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">
            Your cart is empty
          </h2>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            Looks like you haven't added anything yet. Browse our exclusive
            crystal collection and find something you love.
          </p>
          <Link
            href="/product"
            className="mt-8 flex items-center gap-2 rounded-full bg-[#ffea00] px-8 py-3 text-sm font-bold text-black shadow-md transition-all hover:bg-neutral-900 hover:text-[#ffea00]"
          >
            Start Shopping <LuArrowRight className="text-base" />
          </Link>
        </div>
      )}

      {/* Cart + Summary */}
      {!loading && items.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-neutral-200"
              >
                {/* Image */}
                <Link
                  href={`/product/${item.product.id}`}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f5f3ee]"
                >
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-bold text-neutral-200">
                      C
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {item.product.category?.name}
                  </span>
                  <Link href={`/product/${item.product.id}`}>
                    <h4 className="truncate font-bold text-neutral-900 transition hover:underline">
                      {item.product.name}
                    </h4>
                  </Link>

                  <div className="mt-1 flex items-center text-base font-extrabold text-neutral-900">
                    <TbCurrencyRupee className="text-[#4a5c3a]" />
                    <span>{item.product.price.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Qty Controls */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-[#f9f8f5]">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item, -1)}
                        disabled={updatingId === item.id}
                        className="flex h-8 w-8 items-center justify-center text-neutral-500 transition hover:bg-neutral-200 disabled:opacity-40"
                      >
                        <LuMinus className="text-xs" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item, 1)}
                        disabled={
                          updatingId === item.id ||
                          item.quantity >= item.product.stock
                        }
                        className="flex h-8 w-8 items-center justify-center text-neutral-500 transition hover:bg-neutral-200 disabled:opacity-40"
                      >
                        <LuPlus className="text-xs" />
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-neutral-400">
                      Subtotal:{" "}
                      <span className="text-neutral-700">
                        ₹
                        {(
                          item.product.price * item.quantity
                        ).toLocaleString("en-IN")}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  title="Remove item"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <LuX className="text-base" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-neutral-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>
                  Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
                </span>
                <span className="font-semibold text-neutral-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {couponApplied && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount (10%)</span>
                  <span className="font-bold">
                    − ₹{discount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-neutral-900">
                    ₹{shipping}
                  </span>
                )}
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <div className="flex justify-between text-base font-extrabold text-neutral-900">
                  <span>Total</span>
                  <div className="flex items-center">
                    <TbCurrencyRupee className="text-[#4a5c3a]" />
                    <span>{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                {subtotal < 5000 && (
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Add ₹{(5000 - subtotal).toLocaleString("en-IN")} more for
                    free shipping
                  </p>
                )}
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-5">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                <LuTag className="text-sm" /> Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponError("");
                  }}
                  placeholder="e.g. CRYSTAL10"
                  className="flex-1 rounded-xl border border-neutral-200 bg-[#f9f8f5] px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="mt-1 text-[11px] text-red-500">{couponError}</p>
              )}
              {couponApplied && (
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                  ✓ Coupon applied — 10% discount!
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffea00] py-3.5 text-sm font-bold text-black shadow-md transition-all hover:bg-neutral-900 hover:text-[#ffea00]"
            >
              Proceed to Checkout <LuArrowRight />
            </button>

            <Link
              href="/product"
              className="mt-3 block text-center text-xs text-neutral-400 transition hover:text-neutral-700"
            >
              ← Continue Shopping
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-5">
              {[
                {
                  icon: <LuTruck className="text-lg text-[#4a5c3a]" />,
                  label: "Free Shipping",
                  sub: "On orders over ₹5,000",
                },
                {
                  icon: <LuShieldCheck className="text-lg text-[#4a5c3a]" />,
                  label: "Secure Payment",
                  sub: "256-bit SSL encrypted",
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-[#f9f8f5] p-3 text-center"
                >
                  {badge.icon}
                  <p className="text-[11px] font-bold text-neutral-800">
                    {badge.label}
                  </p>
                  <p className="text-[10px] leading-tight text-neutral-400">
                    {badge.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
