"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheck, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { TbTruckDelivery, TbMail, TbSparkles } from "react-icons/tb";
import { api, ScratchCard } from "@/src/lib/inkstone-api";
import ScratchCardComponent from "@/src/components/rewards/ScratchCardComponent";

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (!isLogged) {
      router.replace("/login");
      return;
    }

    // 1. Get real order number from query or stored order
    const urlOrderId = searchParams.get("order_id");
    let detectedOrder: any = null;
    try {
      const stored = sessionStorage.getItem("crystal_latest_order");
      if (stored) detectedOrder = JSON.parse(stored);
    } catch { /* ignore */ }

    const realId = urlOrderId || detectedOrder?.order_id || detectedOrder?.id || `CR-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
    setOrderNumber(realId);

    // 2. Automatically calculate Expected Delivery Date: 10 days from current date
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const formattedDelivery = deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setExpectedDeliveryDate(formattedDelivery);

    // 3. Clean up checkout session
    sessionStorage.removeItem("crystal_checkout_product");
    sessionStorage.removeItem("crystal_checkout_items");
    sessionStorage.removeItem("crystal_cart_items");
    sessionStorage.removeItem("crystal_checkout_delivery");
    sessionStorage.removeItem("crystal_checkout_attachment");
    sessionStorage.removeItem("crystal_checkout_coupon");

    // 4. Fetch scratch cards
    api.getMyScratchCards()
      .then((cards) => setScratchCards(cards))
      .catch(() => {})
      .finally(() => setLoadingCards(false));
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 py-16 sm:py-24 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffea00]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-xl border border-black/10 bg-white p-6 sm:p-10 text-center shadow-xl z-10 rounded-3xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffea00] text-4xl shadow-sm mb-6 animate-[bounce_1s_ease-in-out_1]">
          <FiCheck className="text-black" />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300] mb-1">Payment Successful</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-neutral-900">
          Thank you for your order!
        </h1>

        <div className="my-6 rounded-2xl bg-[#f7f7f5] p-4.5 border border-black/5">
          <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-semibold">Order Reference</p>
          <p className="text-xl font-mono font-black tracking-widest text-neutral-900">{orderNumber}</p>
        </div>

        {/* Expected Delivery Date Box */}
        <div className="my-6 rounded-2xl bg-gradient-to-br from-[#fffde6] to-[#fff7a8] p-5 text-center border-2 border-[#ffea00] shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#6b6000]">
            <TbTruckDelivery className="text-lg" />
            <span>Expected Delivery Date</span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-neutral-900">{expectedDeliveryDate}</h2>
          <p className="mt-1 text-xs text-[#736700] font-medium flex items-center justify-center gap-1">
            <TbMail className="text-sm" /> Order confirmation email sent to your registered email
          </p>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 mb-8 max-w-md mx-auto">
          Your order is confirmed and our artisans have begun preparing your handcrafted crystal pieces. Standard insured express shipping will arrive within 10 days.
        </p>

        {/* Scratch Card Section */}
        {scratchCards.length > 0 && (
          <div className="my-8 pt-6 border-t border-neutral-100">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#998a00] bg-[#fff9c2] px-3 py-1 rounded-full border border-[#ffea00]">
                <TbSparkles /> Unlocked Reward
              </span>
              <h3 className="mt-2 text-xl font-black text-neutral-900">
                You Won a Discount Scratch Card!
              </h3>
              <p className="text-xs text-neutral-500">
                Scratch the card below to reveal your exclusive discount code for your next purchase.
              </p>
            </div>

            <div className="space-y-4">
              {scratchCards.map((sc) => (
                <ScratchCardComponent
                  key={sc.id}
                  card={sc}
                  onRevealed={(code, discount) => {
                    console.log(`Revealed coupon: ${code} (${discount}% off)`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row justify-center mt-6">
          <Link
            href="/product"
            className="inline-flex items-center justify-center gap-2 bg-black px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#ffea00] hover:text-black rounded-full"
          >
            <FiShoppingBag /> Continue Shopping
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-xs font-bold text-black border border-black/20 transition hover:bg-neutral-50 rounded-full"
          >
            Track in Orders <FiArrowRight />
          </Link>
        </div>
      </div>
    </main>
  );
}
