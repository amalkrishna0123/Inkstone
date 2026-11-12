"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiLock, 
  FiMinus, 
  FiPlus, 
  FiTag, 
  FiCheck, 
  FiX, 
  FiMapPin, 
  FiPlusCircle,
  FiImage
} from "react-icons/fi";
import { 
  Product, 
  Address, 
  api, 
  getProductPrice,
  ScratchCard
} from "@/src/lib/inkstone-api";
import { TbSparkles } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";


const shippingCost = 99;

export type CheckoutItem = {
  product: Product;
  quantity: number;
  attachment_url?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");

  // Customer addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Address form fields
  const [addressForm, setAddressForm] = useState({
    name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percent: number;
    discount_amount: number;
  } | null>(null);
  const [availableRewards, setAvailableRewards] = useState<ScratchCard[]>([]);
  const [couponError, setCouponError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // 1. Load checkout items (from cart or multi-item checkout)
    const storedItems =
      sessionStorage.getItem("crystal_checkout_items") ||
      sessionStorage.getItem("crystal_cart_items");
    let loadedItems: CheckoutItem[] = [];

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

    // 2. Fallback to single product if no items array
    if (loadedItems.length === 0) {
      const storedProduct = sessionStorage.getItem("crystal_checkout_product");
      if (storedProduct) {
        try {
          const prod = JSON.parse(storedProduct) as Product;
          const storedQty = Number(sessionStorage.getItem("crystal_checkout_quantity")) || 1;
          const storedAttachment = sessionStorage.getItem("crystal_checkout_attachment") || "";
          loadedItems = [{
            product: prod,
            quantity: storedQty,
            attachment_url: storedAttachment,
          }];
        } catch {
          sessionStorage.removeItem("crystal_checkout_product");
        }
      }
    }

    if (loadedItems.length > 0) {
      setCheckoutItems(loadedItems);
      setProduct(loadedItems[0].product);
      setQuantity(loadedItems[0].quantity);
      if (loadedItems[0].attachment_url) {
        setAttachmentUrl(loadedItems[0].attachment_url);
      }
    }

    // Load attachment if uploaded for custom product
    const storedAttachment = sessionStorage.getItem("crystal_checkout_attachment");
    if (storedAttachment) {
      setAttachmentUrl(storedAttachment);
    }

    // 3. Security check: User MUST be logged in to access checkout
    const logged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    setIsLoggedIn(logged);

    if (!logged) {
      router.replace("/login?redirect=/checkout");
      return;
    }

    const userStr = localStorage.getItem("inkstone_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setAddressForm((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
        }));
      } catch { /* ignore */ }
    }

    api.getAddresses()
      .then((items) => {
        setAddresses(items);
        const defaultAddr = items.find((a) => a.is_default) || items[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setAddressForm({
            name: defaultAddr.name,
            email: localStorage.getItem("inkstone_user") ? JSON.parse(localStorage.getItem("inkstone_user")!).email : "",
            phone: defaultAddr.phone,
            address_line1: defaultAddr.address_line1,
            address_line2: defaultAddr.address_line2 || "",
            city: defaultAddr.city,
            state: defaultAddr.state || "",
            postal_code: defaultAddr.postal_code,
            country: defaultAddr.country,
          });
        }
      })
      .catch(() => {});

    // 4. Load unlocked scratch card rewards
    api.getMyScratchCards()
      .then((cards) => setAvailableRewards(cards.filter((c) => c.is_scratched && c.coupon_code)))
      .catch(() => {});

    // 5. Restore existing coupon if previously applied
    const storedCoupon = sessionStorage.getItem("crystal_checkout_coupon");
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch { /* ignore */ }
    }
  }, [router]);

  function handleSelectSavedAddress(addr: Address) {
    setSelectedAddressId(addr.id);
    setAddressForm((prev) => ({
      ...prev,
      name: addr.name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state || "",
      postal_code: addr.postal_code,
      country: addr.country,
    }));
  }

  function handleSelectNewAddress() {
    setSelectedAddressId("new");
    setAddressForm((prev) => ({
      ...prev,
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
    }));
  }

  // Calculate prices across all checkout items
  const subtotal = checkoutItems.length > 0
    ? checkoutItems.reduce((sum, item) => sum + getProductPrice(item.product) * item.quantity, 0)
    : product ? getProductPrice(product) * quantity : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const total = discountedSubtotal + shippingCost;
  const totalItemCount = checkoutItems.reduce((acc, i) => acc + i.quantity, 0) || quantity;

  async function handleApplyCoupon() {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;
    setCouponValidating(true);
    setCouponError("");
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        const couponObj = {
          code: res.code,
          discount_percent: res.discount_percent,
          discount_amount: res.discount_amount,
        };
        setAppliedCoupon(couponObj);
        sessionStorage.setItem("crystal_checkout_coupon", JSON.stringify(couponObj));
        setCouponCodeInput("");
      } else {
        setCouponError("Invalid or expired coupon code.");
      }
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Coupon code is invalid.");
    } finally {
      setCouponValidating(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    sessionStorage.removeItem("crystal_checkout_coupon");
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!addressForm.name || !addressForm.email || !addressForm.phone || !addressForm.address_line1 || !addressForm.city || !addressForm.postal_code) {
      setFormError("Please fill in all required delivery address fields.");
      return;
    }

    try {
      // If user selected "new" and requested saving, persist address to customer account
      if (isLoggedIn && selectedAddressId === "new" && saveAddressToAccount) {
        try {
          await api.createAddress({
            name: addressForm.name,
            phone: addressForm.phone,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2,
            city: addressForm.city,
            state: addressForm.state,
            postal_code: addressForm.postal_code,
            country: addressForm.country,
            is_default: addresses.length === 0,
          });
        } catch { /* address saving non-blocking */ }
      }

      const formattedAddress = `${addressForm.address_line1}${addressForm.address_line2 ? `, ${addressForm.address_line2}` : ""}, ${addressForm.city}, ${addressForm.state || ""} PIN: ${addressForm.postal_code}, ${addressForm.country}`;

      const deliveryData = {
        name: addressForm.name,
        email: addressForm.email,
        phone: addressForm.phone,
        address: formattedAddress,
        quantity: totalItemCount,
        total: total,
      };

      sessionStorage.setItem("crystal_checkout_delivery", JSON.stringify(deliveryData));
      sessionStorage.setItem("crystal_checkout_items", JSON.stringify(checkoutItems));
      if (checkoutItems[0]?.product) {
        sessionStorage.setItem("crystal_checkout_product", JSON.stringify(checkoutItems[0].product));
      }
      router.push("/payment");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to proceed to payment.");
    }
  }

  if (checkoutItems.length === 0 && !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-20">
        <div className="w-full max-w-md border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Checkout</p>
          <h1 className="mt-3 text-3xl font-black">No product selected</h1>
          <p className="mt-3 text-sm text-neutral-500">Choose a product from our catalog or cart before opening checkout.</p>
          <Link href="/product" className="mt-7 inline-flex bg-[#ffea00] px-6 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white">
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const inputClass = "mt-1.5 w-full border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm outline-none focus:border-black transition";

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <div className="mx-auto max-w-6xl px-2 py-8 sm:px-6 sm:py-12">
        <Link href="/product" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black pt-14">
          <FiArrowLeft /> Back to products
        </Link>

        <div className="mb-8">
          <p className="text- font-medium text-center tracking-[] text-[#000] flex gap-2 justify-center items-center"><IoBagCheckOutline className="bg-[#ffea00] p-0.5"/> Crystal checkout</p>
          <h1 className="mt-1 text-3xl sm:text-5xl font-medium tracking-[-1px] text-center">Complete your order.</h1>
        </div>

        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_390px]">
          {/* ── Left Column: Delivery Address & Customer Details ── */}
          <section className="border border-black/10 bg-white p-6 sm:p-8 shadow-sm rounded-3xl">
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffea00] text-lg">
                  <FiMapPin />
                </div>
                <div>
                  <h2 className="text-lg font-medium tracking-[-1px]">Delivery Address</h2>
                  {/* <p className="text-xs text-neutral-500">Where should we deliver your crystal order?</p> */}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <FiLock /> Secure
              </div>
            </div>

            {formError && (
              <p className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>
            )}

            {/* Saved Addresses for logged-in customers */}
            {isLoggedIn && addresses.length > 0 && (
              <div className="mb-6 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Select a Saved Address
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`cursor-pointer rounded-xl border p-4 text-xs transition ${
                        selectedAddressId === addr.id
                          ? "border-black bg-[#fffef0] shadow-[2px_2px_0_#ffea00]"
                          : "border-neutral-200 bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-neutral-900">{addr.name}</p>
                        {addr.is_default && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">Default</span>
                        )}
                      </div>
                      <p className="mt-1 text-neutral-600 truncate">{addr.address_line1}</p>
                      <p className="text-neutral-500">{addr.city}, {addr.postal_code}</p>
                      <p className="mt-1 font-semibold text-neutral-700">Phone: {addr.phone}</p>
                    </div>
                  ))}

                  <div
                    onClick={handleSelectNewAddress}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-xs transition ${
                      selectedAddressId === "new"
                        ? "border-black bg-[#fffef0]"
                        : "border-neutral-300 bg-neutral-50 hover:border-black"
                    }`}
                  >
                    <FiPlusCircle className="text-xl mb-1 text-neutral-600" />
                    <span className="font-bold text-neutral-800">Use a new address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Input Form */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 sm:col-span-2">
                  Full Name *
                  <input
                    className={inputClass}
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    placeholder="Recipient's full name"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Email Address *
                  <input
                    className={inputClass}
                    required
                    type="email"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Phone Number *
                  <input
                    className={inputClass}
                    required
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 sm:col-span-2">
                  Street Address (House No, Building, Street) *
                  <input
                    className={inputClass}
                    required
                    value={addressForm.address_line1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                    placeholder="e.g. Flat 4B, Hill View Residency"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 sm:col-span-2">
                  Apartment, Suite, Landmark (Optional)
                  <input
                    className={inputClass}
                    value={addressForm.address_line2}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                    placeholder="e.g. Near City Center Mall"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  City *
                  <input
                    className={inputClass}
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="City"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  State / Province
                  <input
                    className={inputClass}
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="State"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  PIN Code *
                  <input
                    className={inputClass}
                    required
                    inputMode="numeric"
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                    placeholder="6-digit PIN code"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Country
                  <input
                    className={inputClass}
                    readOnly
                    value={addressForm.country}
                  />
                </label>
              </div>

              {isLoggedIn && selectedAddressId === "new" && (
                <label className="mt-4 flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={saveAddressToAccount}
                    onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                    className="h-4 w-4 accent-neutral-900"
                  />
                  Save this address to my account for future orders
                </label>
              )}
            </div>

            <button
              type="submit"
              className="mt-8 w-full bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-[#ffea00] hover:text-black"
            >
              Proceed to Payment · Rs. {total.toFixed(2)}
            </button>
          </section>

          {/* ── Right Column: Order Summary, Coupon & Attachments ── */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-8 rounded-3xl">
            <div className="border border-black/10 bg-white p-6 shadow-sm rounded-3xl">
              <h2 className="mb-4 text-lg font-bold">Order Summary</h2>

              {/* Product items (Multi-item from cart) */}
              {checkoutItems.length > 1 ? (
                <div className="max-h-[260px] overflow-y-auto divide-y divide-black/10 border-b border-black/10 pb-4 space-y-3 pr-1">
                  {checkoutItems.map((item, idx) => {
                    const itemUnitPrice = getProductPrice(item.product);
                    return (
                      <div key={item.product.id || idx} className="flex gap-3 pt-3 first:pt-0">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f2f2f2]">
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl font-bold text-neutral-300">C</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs font-bold text-neutral-900">{item.product.name}</h3>
                          <p className="text-[11px] text-neutral-500">Qty: {item.quantity} × Rs. {itemUnitPrice.toFixed(2)}</p>
                          <p className="mt-0.5 text-xs font-semibold text-neutral-800">Rs. {(itemUnitPrice * item.quantity).toFixed(2)}</p>
                          {item.attachment_url && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-700">
                              <FiImage /> Photo Attached
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Single Product View */
                product && (
                  <>
                    <div className="flex gap-4 border-b border-black/10 pb-5">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2f2f2]">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl font-bold text-neutral-300">C</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          product.product_type === "ready_stock" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {product.product_type === "ready_stock" ? "Ready Stock" : "Custom Product"}
                        </span>
                        <h3 className="truncate text-sm font-bold mt-1">{product.name}</h3>
                        <p className="text-xs text-neutral-500">{product.category?.name ?? "Ready Stock"}</p>
                        <p className="mt-2 text-sm font-semibold">Rs. {getProductPrice(product).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Customer Attachment preview (if Custom product) */}
                    {attachmentUrl && (
                      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-2">
                          <span className="flex items-center gap-1.5"><FiImage className="text-purple-600" /> Customer Photo Attached</span>
                          <a href={attachmentUrl} target="_blank" rel="noreferrer" className="text-[11px] underline text-blue-600">View</a>
                        </div>
                        <img src={attachmentUrl} alt="Attached customization" className="h-20 w-full object-cover rounded-lg" />
                      </div>
                    )}

                    {/* Quantity selector */}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Quantity</span>
                      <div className="flex items-center border border-black/10 rounded">
                        <button
                          type="button"
                          className="p-2 hover:bg-[#ffea00]"
                          aria-label="Decrease quantity"
                          onClick={() => {
                            const newQ = Math.max(1, quantity - 1);
                            setQuantity(newQ);
                            setCheckoutItems(prev => prev.map(i => ({ ...i, quantity: newQ })));
                          }}
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
                        <button
                          type="button"
                          className="p-2 hover:bg-[#ffea00]"
                          aria-label="Increase quantity"
                          onClick={() => {
                            const newQ = Math.min(product.stock || 99, quantity + 1);
                            setQuantity(newQ);
                            setCheckoutItems(prev => prev.map(i => ({ ...i, quantity: newQ })));
                          }}
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </>
                )
              )}

              {/* ── Coupon Code Box ── */}
              <div className="mt-6 border-t border-black/10 pt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Have a Coupon?
                </label>

                {/* Available Scratch Card Rewards */}
                {availableRewards.length > 0 && !appliedCoupon && (
                  <div className="mb-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-3 border border-amber-200">
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <TbSparkles className="text-amber-600" /> Your Scratch Card Rewards
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableRewards.map((rew) => (
                        <button
                          key={rew.id}
                          type="button"
                          onClick={() => {
                            setCouponCodeInput(rew.coupon_code);
                            api.validateCoupon(rew.coupon_code, subtotal)
                              .then((res) => {
                                setAppliedCoupon({
                                  code: res.code,
                                  discount_percent: res.discount_percent,
                                  discount_amount: res.discount_amount,
                                });
                                sessionStorage.setItem("crystal_checkout_coupon", JSON.stringify(res));
                              })
                              .catch((err) => setCouponError(err instanceof Error ? err.message : "Invalid coupon."));
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-neutral-900 border border-amber-300 shadow-2xs hover:bg-[#ffea00] hover:text-black transition cursor-pointer"
                        >
                          <span className="font-mono">{rew.coupon_code}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">{rew.discount_percent}% OFF</span>
                          <span className="text-[10px] text-neutral-500 underline ml-0.5">Apply</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <FiTag className="text-emerald-700" />
                      <div>
                        <p className="font-bold text-emerald-900">{appliedCoupon.code} applied!</p>
                        <p className="text-[11px] text-emerald-700">{appliedCoupon.discount_percent}% discount saved Rs. {appliedCoupon.discount_amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-emerald-800 hover:text-red-700"
                      title="Remove coupon"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full border border-neutral-300 bg-[#f7f7f5] px-3 py-2 text-xs font-mono uppercase outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        disabled={couponValidating || !couponCodeInput.trim()}
                        onClick={handleApplyCoupon}
                        className="bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#ffea00] hover:text-black disabled:opacity-50"
                      >
                        {couponValidating ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="mt-1.5 text-xs text-red-600">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-2.5 border-t border-black/10 pt-4 text-xs font-medium">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>Rs. {shippingCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-black/10 pt-3 text-base font-black text-neutral-900">
                  <span>Order Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
