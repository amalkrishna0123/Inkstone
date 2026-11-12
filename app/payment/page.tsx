"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiLock, FiCreditCard, FiShield } from "react-icons/fi";
import { Product, getProductPrice } from "@/src/lib/inkstone-api";

const shippingCost = 99;
const RZP_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

/** Lazily load the Razorpay checkout script */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState<{ product: Product; quantity: number; attachment_url?: string }[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    // Security check: user must be logged in to access payment
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (!isLogged) {
      router.replace("/login?redirect=/payment");
      return;
    }

    // 1. Try loading full checkout items (from cart or multi-item checkout)
    const storedItems = sessionStorage.getItem("crystal_checkout_items");
    let loadedItems: { product: Product; quantity: number; attachment_url?: string }[] = [];

    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedItems = parsed.map((item: any) => ({
            product: item.product || item,
            quantity: item.quantity || 1,
            attachment_url: item.attachment_url || "",
          }));
        }
      } catch {
        sessionStorage.removeItem("crystal_checkout_items");
      }
    }

    // 2. Fallback to single product
    if (loadedItems.length === 0) {
      const storedProduct = sessionStorage.getItem("crystal_checkout_product");
      if (storedProduct) {
        try {
          const p = JSON.parse(storedProduct) as Product;
          loadedItems = [{ product: p, quantity: 1, attachment_url: sessionStorage.getItem("crystal_checkout_attachment") ?? "" }];
        } catch {
          sessionStorage.removeItem("crystal_checkout_product");
        }
      }
    }

    if (loadedItems.length > 0) {
      setCheckoutItems(loadedItems);
      setProduct(loadedItems[0].product);
      setQuantity(loadedItems[0].quantity);
    }

    // Pre-load the Razorpay SDK while the user reads the page
    loadRazorpayScript();
  }, [router]);

  // Restore quantity from delivery session data if available
  useEffect(() => {
    const deliveryStr = sessionStorage.getItem("crystal_checkout_delivery");
    if (deliveryStr) {
      try {
        const delivery = JSON.parse(deliveryStr);
        if (delivery.quantity && checkoutItems.length <= 1) {
          setQuantity(Number(delivery.quantity));
        }
      } catch { /* ignore */ }
    }
  }, [checkoutItems.length]);

  const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    setStatusMsg("");

    try {
      // 1. Ensure Razorpay SDK is loaded
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load Razorpay. Please check your connection.");

      const storedDeliveryStr = sessionStorage.getItem("crystal_checkout_delivery");
      if (!storedDeliveryStr || (checkoutItems.length === 0 && !product)) {
        throw new Error("Missing checkout data. Please go back to checkout and try again.");
      }

      const delivery = JSON.parse(storedDeliveryStr);
      const attachmentUrl = sessionStorage.getItem("crystal_checkout_attachment") ?? "";
      
      const orderItems = checkoutItems.length > 0
        ? checkoutItems.map((item) => ({
            product_id: item.product.id,
            name: item.product.name,
            price: getProductPrice(item.product),
            quantity: item.quantity,
          }))
        : product ? [
            {
              product_id: product.id,
              name: product.name,
              price: getProductPrice(product),
              quantity: delivery.quantity ?? quantity,
            },
          ] : [];

      const calculatedSubtotal = checkoutItems.length > 0
        ? checkoutItems.reduce((acc, item) => acc + getProductPrice(item.product) * item.quantity, 0)
        : product ? getProductPrice(product) * (delivery.quantity ?? quantity) : 0;
      
      // Check for stored coupon discount
      const storedCouponStr = sessionStorage.getItem("crystal_checkout_coupon");
      let discountAmount = 0;
      let couponCode = "";
      if (storedCouponStr) {
        try {
          const couponObj = JSON.parse(storedCouponStr);
          discountAmount = couponObj.discount_amount || 0;
          couponCode = couponObj.code || "";
        } catch { /* ignore */ }
      }

      const total = Math.max(0, calculatedSubtotal - discountAmount) + shippingCost;

      // 2. Create order in backend → also creates Razorpay order
      const { api } = await import("@/src/lib/inkstone-api");
      const orderResp = await api.createOrder({
        name: delivery.name,
        email: delivery.email,
        total,
        payment_method: "Razorpay",
        shipping_address: delivery.address,
        attachment_url: attachmentUrl,
        coupon_code: couponCode,
        discount_amount: discountAmount,
        items: orderItems,
      });

      // 3. Open Razorpay modal
      await new Promise<void>((resolve, reject) => {
        const keyId = RZP_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TT5aIG5SUGgmA2";
        const options: Record<string, unknown> = {
          key: keyId,
          amount: orderResp.amount, // paise from backend
          currency: orderResp.currency || "INR",
          name: "InkStone Crystals",
          description: orderItems.length === 1 ? orderItems[0].name : `${orderItems.length} items from InkStone`,
          prefill: {
            name: delivery.name,
            email: delivery.email,
            contact: delivery.phone ?? "",
          },
          theme: { color: "#ffea00" },

          // 4. On success: verify signature with our backend
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id?: string;
            razorpay_signature?: string;
          }) => {
            try {
              if (response.razorpay_payment_id) {
                await api.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id || orderResp.razorpay_order_id || orderResp.order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || "",
                });
              }

              // Clear checkout state & cart
              sessionStorage.removeItem("crystal_checkout_product");
              sessionStorage.removeItem("crystal_checkout_items");
              sessionStorage.removeItem("crystal_cart_items");
              sessionStorage.removeItem("crystal_checkout_delivery");
              sessionStorage.removeItem("crystal_checkout_attachment");
              sessionStorage.removeItem("crystal_checkout_coupon");

              try {
                localStorage.removeItem("inkstone_local_cart");
                window.dispatchEvent(new Event("inkstone-cart-change"));
              } catch { /* ignore */ }

              resolve();
            } catch (err) {
              reject(err);
            }
          },

          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancelled. You can try again."));
            },
          },
        };

        // Pass order_id ONLY when it's a real order from Razorpay API
        if (orderResp.razorpay_order_id && orderResp.razorpay_order_id.length >= 18) {
          options.order_id = orderResp.razorpay_order_id;
        }

        const rzp = new (window as any).Razorpay(options);

        rzp.on("payment.failed", (response: { error: { description: string } }) => {
          reject(new Error(response.error?.description ?? "Payment failed. Please try again."));
        });

        rzp.open();
      });

      router.push("/thank-you");
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Payment could not be completed.");
      setProcessing(false);
    }
  };

  if (checkoutItems.length === 0 && !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-20">
        <div className="w-full max-w-md border border-black/10 bg-white p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Payment</p>
          <h1 className="mt-3 text-3xl font-black">No order found</h1>
          <p className="mt-3 text-sm text-neutral-500">Please complete the checkout process first.</p>
          <Link href="/product" className="mt-7 inline-flex bg-[#ffea00] px-5 py-3 text-sm font-bold text-black hover:bg-neutral-900 hover:text-[#ffea00]">
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = checkoutItems.length > 0
    ? checkoutItems.reduce((acc, item) => acc + getProductPrice(item.product) * item.quantity, 0)
    : product ? getProductPrice(product) * quantity : 0;
  const total = subtotal + shippingCost;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12 pt-24">
        <Link href="/checkout" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black">
          <FiArrowLeft /> Back to checkout
        </Link>

        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300]">Secure Payment</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Complete your payment.</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          {/* Payment form */}
          <section className="border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            {/* Trust badge */}
            <div className="mb-8 flex items-center gap-3 border-b border-black/10 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FiLock className="text-xl" />
              </div>
              <div>
                <h2 className="font-bold">Secure Checkout via Razorpay</h2>
                <p className="mt-1 text-xs text-neutral-500">Your payment is encrypted and PCI-DSS compliant.</p>
              </div>
            </div>

            {statusMsg && (
              <div className="mb-6 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span className="mt-0.5 shrink-0">⚠</span>
                <p>{statusMsg}</p>
              </div>
            )}

            <form onSubmit={handlePayment} className="flex flex-col gap-6">
              {/* Method pills */}
              <div className="grid grid-cols-3 gap-3">
                {["Credit Card", "Debit Card", "UPI"].map((m) => (
                  <div
                    key={m}
                    className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-[#ffea00] bg-[#fffef0] p-3"
                  >
                    <FiCreditCard className="text-xl text-[#8d8300]" />
                    <span className="text-xs font-semibold">{m}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-black/10 bg-neutral-50 p-5 text-center">
                <FiShield className="mx-auto mb-3 text-3xl text-emerald-500" />
                <p className="text-sm font-semibold">Razorpay Secure Payment</p>
                <p className="mt-1 text-xs text-neutral-500 leading-5">
                  You&apos;ll be prompted with the Razorpay modal to complete your payment using any UPI, card, net banking, or wallet.
                </p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="mt-2 flex w-full items-center justify-center gap-2 bg-black px-5 py-4 text-sm font-bold text-white transition-all hover:bg-[#ffea00] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Opening payment...
                  </>
                ) : (
                  <>
                    <FiLock className="text-base" />
                    Pay Rs.&nbsp;{total.toFixed(2)} securely
                  </>
                )}
              </button>

              <p className="text-center text-xs text-neutral-400">
                By clicking Pay, you agree to our Terms of Service. Payments are processed securely by Razorpay.
              </p>
            </form>
          </section>

          {/* Order summary */}
          <aside className="h-fit border border-black/10 bg-white p-6 sm:p-8 lg:sticky lg:top-24 shadow-sm">
            <h2 className="mb-4 text-xl font-black">Order summary</h2>
            
            {checkoutItems.length > 1 ? (
              <div className="max-h-[260px] overflow-y-auto divide-y divide-black/10 border-b border-black/10 pb-4 space-y-3 pr-1">
                {checkoutItems.map((item, idx) => (
                  <div key={item.product.id || idx} className="flex gap-3 pt-3 first:pt-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden bg-[#f2f2f2] rounded-xl">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl font-bold text-neutral-300">C</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-xs">{item.product.name}</h3>
                      <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                      <p className="mt-1 text-xs font-semibold">Rs. {(getProductPrice(item.product) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              product && (
                <div className="flex gap-4 border-b border-black/10 pb-6">
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#f2f2f2] rounded-xl">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl font-bold text-neutral-300">C</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-sm">{product.name}</h3>
                    <p className="mt-0.5 text-xs text-neutral-500">{product.category?.name || "Ready Stock"}</p>
                    <p className="mt-2 font-semibold text-sm">Rs. {getProductPrice(product)}</p>
                    <p className="text-xs text-neutral-500">Qty: {checkoutItems[0]?.quantity ?? quantity}</p>
                  </div>
                </div>
              )
            )}

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>Rs. {shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-4 text-lg font-black">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Razorpay badge */}
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-black/10 pt-5">
              <FiShield className="text-emerald-500" />
              <span className="text-xs text-neutral-500">Protected by <strong>Razorpay</strong></span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
