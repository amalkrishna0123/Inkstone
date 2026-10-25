"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiLock, FiMinus, FiPlus } from "react-icons/fi";
import { Product, getProductPrice } from "@/src/lib/inkstone-api";

const shippingCost = 99;

export default function CheckoutPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedProduct = sessionStorage.getItem("crystal_checkout_product");
    if (storedProduct) {
      try {
        // Browser storage is the handoff from the product page to checkout.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProduct(JSON.parse(storedProduct) as Product);
      } catch {
        sessionStorage.removeItem("crystal_checkout_product");
      }
    }
  }, []);

  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: `${formData.get("address")}, ${formData.get("city")}, PIN: ${formData.get("pin")}`,
      quantity: quantity
    };
    sessionStorage.setItem("crystal_checkout_delivery", JSON.stringify(data));
    router.push("/payment");
  }

  if (!product) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-20"><div className="w-full max-w-md border border-black/10 bg-white p-8 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Checkout</p><h1 className="mt-3 text-3xl font-black">No product selected</h1><p className="mt-3 text-sm text-neutral-500">Choose a product before opening checkout.</p><Link href="/product" className="mt-7 inline-flex bg-[#ffea00] px-5 py-3 text-sm font-bold">Back to products</Link></div></main>;
  }

  const unitPrice = getProductPrice(product);
  const subtotal = unitPrice * quantity;
  const total = subtotal + shippingCost;
  const inputClass = "mt-2 w-full border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm outline-none focus:border-black";

  return <main className="min-h-screen bg-[#f7f7f5] text-black"><div className="mx-auto max-w-6xl px-5 py-8 sm:py-12"><Link href="/product" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black"><FiArrowLeft /> Back to products</Link><div className="mb-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300]">Crystal checkout</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Complete your order.</h1></div><form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_390px]"><section className="border border-black/10 bg-white p-6 sm:p-8"><div className="mb-8 flex items-center gap-3 border-b border-black/10 pb-5"><FiLock /><div><h2 className="font-bold">Delivery details</h2><p className="mt-1 text-xs text-neutral-500">Your information is secure with us.</p></div></div>{formError && <p className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}<div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Full name<input className={inputClass} required name="name" placeholder="Your full name" /></label><label className="text-sm font-semibold">Email<input className={inputClass} required type="email" name="email" placeholder="you@example.com" /></label><label className="text-sm font-semibold">Phone<input className={inputClass} required type="tel" name="phone" placeholder="Phone number" /></label><label className="text-sm font-semibold sm:col-span-2">Address<input className={inputClass} required name="address" placeholder="Street address" /></label><label className="text-sm font-semibold">City<input className={inputClass} required name="city" placeholder="City" /></label><label className="text-sm font-semibold">PIN code<input className={inputClass} required inputMode="numeric" name="pin" placeholder="PIN code" /></label></div><button type="submit" className="mt-8 w-full bg-black px-5 py-4 text-sm font-bold text-white hover:bg-[#ffea00] hover:text-black">Place order · Rs. {total.toFixed(2)}</button></section><aside className="h-fit border border-black/10 bg-white p-6 sm:p-8 lg:sticky lg:top-8"><h2 className="mb-6 text-xl font-black">Order summary</h2><div className="flex gap-4 border-b border-black/10 pb-6"><div className="h-24 w-24 shrink-0 overflow-hidden bg-[#f2f2f2]">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl font-bold text-neutral-300">C</div>}</div><div className="min-w-0"><h3 className="truncate font-bold">{product.name}</h3><p className="mt-1 text-xs text-neutral-500">{product.category.name}</p><p className="mt-3 font-semibold">Rs. {product.price}</p></div></div><div className="mt-6 flex items-center justify-between"><span className="text-sm text-neutral-500">Quantity</span><div className="flex items-center border border-black/10"><button type="button" className="p-2 hover:bg-[#ffea00]" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button><span className="min-w-9 text-center text-sm font-bold">{quantity}</span><button type="button" className="p-2 hover:bg-[#ffea00]" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}><FiPlus /></button></div></div><div className="mt-7 space-y-3 border-t border-black/10 pt-5 text-sm"><div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>Rs. {shippingCost.toFixed(2)}</span></div><div className="flex justify-between border-t border-black/10 pt-4 text-lg font-black"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div></div></aside></form></div></main>;
}
