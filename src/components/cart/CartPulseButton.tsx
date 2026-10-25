"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuCheck, LuShoppingCart } from "react-icons/lu";
import { api, getLocalCart } from "@/src/lib/inkstone-api";

type CartAddedEvent = CustomEvent<{ quantity?: number }>;
const CART_PULSE_VISIBLE_KEY = "inkstone_cart_pulse_visible";
const CART_PULSE_COUNT_KEY = "inkstone_cart_pulse_count";

export default function CartPulseButton() {
  const [visible, setVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function refreshCartCount() {
      let nextCount = 0;
      const isLoggedIn = Boolean(localStorage.getItem("inkstone_access"));

      if (isLoggedIn) {
        try {
          const items = await api.getCart();
          nextCount = items.reduce((sum, item) => sum + item.quantity, 0);
        } catch {
          nextCount = getLocalCart().reduce((sum, item) => sum + item.quantity, 0);
        }
      } else {
        nextCount = getLocalCart().reduce((sum, item) => sum + item.quantity, 0);
      }

      if (!isMounted) return;
      setItemCount(nextCount);
      localStorage.setItem(CART_PULSE_COUNT_KEY, String(nextCount));

      if (nextCount <= 0) {
        setVisible(false);
        localStorage.removeItem(CART_PULSE_VISIBLE_KEY);
        localStorage.removeItem(CART_PULSE_COUNT_KEY);
        return;
      }

      setVisible(localStorage.getItem(CART_PULSE_VISIBLE_KEY) === "true");
    }

    function handleCartAdded(event: Event) {
      const detail = (event as CartAddedEvent).detail;
      const nextQuantity = detail?.quantity ?? 1;
      setVisible(true);
      setAnimationKey((current) => current + 1);
      localStorage.setItem(CART_PULSE_VISIBLE_KEY, "true");
      setItemCount((current) => {
        const nextCount = current + nextQuantity;
        localStorage.setItem(CART_PULSE_COUNT_KEY, String(nextCount));
        return nextCount;
      });
    }

    void refreshCartCount();
    window.addEventListener("inkstone-cart-added", handleCartAdded);
    window.addEventListener("inkstone-cart-change", refreshCartCount);
    return () => {
      isMounted = false;
      window.removeEventListener("inkstone-cart-added", handleCartAdded);
      window.removeEventListener("inkstone-cart-change", refreshCartCount);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex pointer-events-none justify-center px-4 sm:bottom-7">
      <div className="relative flex items-center justify-center">
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

        <Link
          href="/cart"
          className="pointer-events-auto relative flex h-16 min-w-16 items-center justify-center gap-3 rounded-full bg-[#ffea00] px-5 text-sm font-black text-black shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-black hover:text-[#ffea00] focus:outline-none focus:ring-4 focus:ring-[#ffea00]/40"
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
