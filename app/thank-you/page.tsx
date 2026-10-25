"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCheck, FiShoppingBag, FiArrowRight } from "react-icons/fi";

export default function ThankYouPage() {
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    // Generate a mock order number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(`ORD-${randomNum}`);
    
    // Clean up the checkout session
    sessionStorage.removeItem("crystal_checkout_product");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffea00]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative w-full max-w-lg border border-black/10 bg-white p-8 text-center shadow-[8px_8px_0_#ffea00] sm:p-12 z-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffea00] text-4xl shadow-sm mb-8 animate-[bounce_1s_ease-in-out_1]">
          <FiCheck className="text-black" />
        </div>
        
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300] mb-2">Payment Successful</p>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-neutral-900">Thank you for your order!</h1>
        
        <div className="my-8 rounded-xl bg-[#f7f7f5] p-5 border border-black/5">
          <p className="text-sm text-neutral-500 mb-1">Order Number</p>
          <p className="text-lg font-bold tracking-widest">{orderNumber}</p>
        </div>

        <p className="text-sm leading-6 text-neutral-600 mb-10">
          Your order has been confirmed and is now being processed. We&apos;ve sent a confirmation email with your order details and tracking information.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link 
            href="/product" 
            className="inline-flex items-center justify-center gap-2 bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-[#ffea00] hover:text-black"
          >
            <FiShoppingBag /> Continue Shopping
          </Link>
          <Link 
            href="/dashboard/orders" 
            className="inline-flex items-center justify-center gap-2 bg-white px-6 py-4 text-sm font-bold text-black border border-black/20 transition hover:bg-neutral-50"
          >
            View Orders <FiArrowRight />
          </Link>
        </div>
      </div>
    </main>
  );
}
