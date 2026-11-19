"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { LuCheck, LuShoppingCart } from "react-icons/lu";
import { api, getLocalCart } from "@/src/lib/inkstone-api";

type CartAddedEvent = CustomEvent<{ productId?: string; quantity?: number }>;

function getInstantCartCount(): number {
  if (typeof window === "undefined") return 0;
  const isLogged = Boolean(localStorage.getItem("inkstone_access"));
  if (!isLogged) return 0;

  try {
    const local = JSON.parse(localStorage.getItem("inkstone_local_cart") || "[]");
    if (Array.isArray(local)) {
      return local.reduce((sum: number, item: any) => sum + (Number(item?.quantity) || 0), 0);
    }
  } catch { /* ignore */ }
  return 0;
}

export default function CartPulseButton() {
  const [visible, setVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [showFloatBanner, setShowFloatBanner] = useState(false);
  const floatTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncCart(skipAsyncServer = false) {
      if (typeof window === "undefined" || !isMounted) return;

      const isLogged = Boolean(localStorage.getItem("inkstone_access"));
      if (!isLogged) {
        setItemCount(0);
        setVisible(false);
        return;
      }

      // 1. Instant optimistic sync from localStorage (0ms latency)
      const instant = getInstantCartCount();
      if (instant <= 0) {
        setItemCount(0);
        setVisible(false);
      } else {
        setItemCount(instant);
        setVisible(true);
      }

      if (skipAsyncServer) return;

      // 2. Background server verification (Firestore)
      try {
        const items = await api.getCart();
        if (!isMounted) return;
        const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        setItemCount(total);
        if (total <= 0) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } catch {
        // Fallback to local
        if (!isMounted) return;
        const local = getLocalCart();
        const total = local.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        setItemCount(total);
        setVisible(total > 0);
      }
    }

    function handleCartAdded(event: Event) {
      const isLogged = Boolean(localStorage.getItem("inkstone_access"));
      if (!isLogged) return;

      const detail = (event as CartAddedEvent).detail;
      const addedQty = Number(detail?.quantity) || 1;

      // Calculate instant count
      const localCount = getInstantCartCount();
      const nextCount = localCount > 0 ? localCount : Math.max(1, itemCount + addedQty);

      setItemCount(nextCount);
      setVisible(true);
      setAnimationKey((prev) => prev + 1);
      setShowFloatBanner(true);

      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      floatTimerRef.current = setTimeout(() => {
        if (isMounted) setShowFloatBanner(false);
      }, 1600);
    }

    function handleCartChange() {
      // Check immediately for 0ms responsiveness when item deleted or quantity updated to 0
      const instant = getInstantCartCount();
      if (instant <= 0) {
        setItemCount(0);
        setVisible(false);
      } else {
        setItemCount(instant);
        setVisible(true);
      }
      void syncCart();
    }

    // Initial sync
    void syncCart();

    window.addEventListener("inkstone-cart-added", handleCartAdded);
    window.addEventListener("inkstone-cart-change", handleCartChange);
    window.addEventListener("inkstone-auth-change", handleCartChange);

    return () => {
      isMounted = false;
      if (floatTimerRef.current) clearTimeout(floatTimerRef.current);
      window.removeEventListener("inkstone-cart-added", handleCartAdded);
      window.removeEventListener("inkstone-cart-change", handleCartChange);
      window.removeEventListener("inkstone-auth-change", handleCartChange);
    };
  }, []);

  if (!visible || itemCount <= 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex pointer-events-none justify-center px-4 sm:bottom-7">
      <div className="relative flex items-center justify-center">
        {showFloatBanner && (
          <div
            key={`cart-added-${animationKey}`}
            className="absolute bottom-[76px] flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white shadow-2xl animate-[cart-added-float_1.6s_ease-out_forwards]"
            role="status"
            aria-live="polite"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffea00] text-black">
              <LuCheck />
            </span>
            Added to Cart
          </div>
        )}

        <Link
          href="/dashboard/cart"
          className="pointer-events-auto relative flex h-16 min-w-16 items-center justify-center gap-3 rounded-full bg-[#ffea00] px-5 text-sm font-black text-black shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-black hover:text-[#ffea00] focus:outline-none focus:ring-4 focus:ring-[#ffea00]/40 cursor-pointer"
          aria-label="Open cart"
        >
          <span className="absolute inset-0 rounded-full bg-[#ffea00] opacity-60 animate-ping" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black text-xl text-[#ffea00]">
            <LuShoppingCart />
          </span>
          <span className="relative hidden sm:block">View Cart</span>
          <span className="relative flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-1 text-xs font-black text-black">
            {itemCount}
          </span>
        </Link>
      </div>
    </div>
  );
}
