"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LuPackage, 
  LuTruck, 
  LuCircleCheck, 
  LuCircleX, 
  LuArrowRight, 
  LuSearch, 
  LuFileText, 
  LuRotateCcw,
  LuX,
  LuClock
} from "react-icons/lu";
import { TbCurrencyRupee, TbShieldCheck } from "react-icons/tb";
import { FaStar, FaRegStar } from "react-icons/fa";
import { api, addToLocalCart, Product } from "@/src/lib/inkstone-api";

// Initial Demo Orders Data as fallback
const INITIAL_ORDERS = [
  {
    id: "CR-94821",
    date: "Aug 18, 2026",
    status: "Delivered",
    statusColor: "emerald",
    deliveredDate: "Aug 21, 2026",
    paymentMethod: "Credit Card (ending 4092)",
    shippingAddress: "Flat 4B, Emerald Heights, Marine Drive, Mumbai - 400020",
    total: 18499,
    items: [
      {
        id: "p1",
        name: "Amethyst Celestial Prism Cluster",
        category: "Raw Crystals",
        price: 12499,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
      },
      {
        id: "p2",
        name: "Rose Quartz Serenity Candle Holder",
        category: "Home & Living",
        price: 6000,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      { title: "Order Confirmed", date: "Aug 18, 10:30 AM", done: true },
      { title: "Processing & Quality Check", date: "Aug 19, 02:15 PM", done: true },
      { title: "Shipped with BlueDart", date: "Aug 20, 09:00 AM", done: true },
      { title: "Delivered", date: "Aug 21, 04:45 PM", done: true },
    ],
  },
  {
    id: "CR-91204",
    date: "Aug 21, 2026",
    status: "In Transit",
    statusColor: "blue",
    estimatedDate: "Aug 24, 2026",
    paymentMethod: "UPI / Google Pay",
    shippingAddress: "Flat 4B, Emerald Heights, Marine Drive, Mumbai - 400020",
    total: 8999,
    items: [
      {
        id: "p3",
        name: "Lapis Lazuli Gold Orbit Ring",
        category: "Fine Jewelry",
        price: 8999,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      { title: "Order Confirmed", date: "Aug 21, 01:20 PM", done: true },
      { title: "Handcrafted & Polished", date: "Aug 21, 06:00 PM", done: true },
      { title: "In Transit with Express Air", date: "Aug 22, 11:30 AM", done: true },
      { title: "Out for Delivery", date: "Expected Aug 24", done: false },
    ],
  },
  {
    id: "CR-87310",
    date: "Jul 12, 2026",
    status: "Cancelled",
    statusColor: "rose",
    cancelledDate: "Jul 13, 2026",
    paymentMethod: "UPI Refunded",
    shippingAddress: "Flat 4B, Emerald Heights, Marine Drive, Mumbai - 400020",
    total: 4500,
    items: [
      {
        id: "p4",
        name: "Clear Quartz Healing Obelisk",
        category: "Energy Stones",
        price: 4500,
        quantity: 1,
        image_url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      { title: "Order Placed", date: "Jul 12, 09:00 AM", done: true },
      { title: "Cancelled by User", date: "Jul 13, 11:00 AM", done: true },
      { title: "Refund Issued", date: "Jul 14, 03:00 PM", done: true },
    ],
  },
];

type FormattedOrderItem = {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  image_url?: string;
};

type FormattedOrder = {
  id: string;
  date: string;
  status: string;
  statusColor?: string;
  deliveredDate?: string;
  estimatedDate?: string;
  cancelledDate?: string;
  paymentMethod: string;
  shippingAddress: string;
  total: number;
  items: FormattedOrderItem[];
  timeline: { title: string; date: string; done: boolean }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<FormattedOrder[]>(INITIAL_ORDERS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FormattedOrder | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<FormattedOrder | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Review Modal State
  const [reviewModalData, setReviewModalData] = useState<{
    order: FormattedOrder;
    item: FormattedOrderItem;
  } | null>(null);
  const [reviewedKeys, setReviewedKeys] = useState<string[]>([]);
  const [modalRating, setModalRating] = useState(5);
  const [modalHoverRating, setModalHoverRating] = useState(0);
  const [modalQualityRating, setModalQualityRating] = useState(5);
  const [modalHoverQuality, setModalHoverQuality] = useState(0);
  const [modalTitle, setModalTitle] = useState("");
  const [modalComment, setModalComment] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  function handleOpenReview(order: FormattedOrder, targetItem?: FormattedOrderItem) {
    const item = targetItem || order.items[0];
    if (!item) return;
    setReviewModalData({ order, item });
    setModalRating(5);
    setModalHoverRating(0);
    setModalQualityRating(5);
    setModalHoverQuality(0);
    setModalTitle("");
    setModalComment("");
    setModalError("");
    setModalSuccess(false);
  }

  async function handleModalSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewModalData) return;
    if (!modalComment.trim()) {
      setModalError("Please write a few words about your experience with this crystal.");
      return;
    }

    setModalSubmitting(true);
    setModalError("");

    try {
      await api.createReview({
        order_id: reviewModalData.order.id,
        product_id: reviewModalData.item.id,
        rating: modalRating,
        quality_rating: modalQualityRating,
        title: modalTitle.trim(),
        comment: modalComment.trim(),
      });

      const key = `${reviewModalData.order.id}_${reviewModalData.item.id}`;
      setReviewedKeys((prev) => [...prev, key]);
      setModalSuccess(true);
      setToastMessage(`Your verified review for "${reviewModalData.item.name}" has been published!`);

      setTimeout(() => {
        setModalSuccess(false);
        setReviewModalData(null);
      }, 1500);

      setTimeout(() => {
        setToastMessage("");
      }, 4000);
    } catch (err: any) {
      setModalError(err?.message || "Failed to submit review. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  }

  useEffect(() => {
    async function loadUserOrders() {
      try {
        const myOrders = await api.getMyOrders();
        if (myOrders && myOrders.length > 0) {
          const formatted: FormattedOrder[] = myOrders.map((o) => {
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }) : "Recent";

            const status = o.status || "Processing";
            const isDelivered = status.toLowerCase() === "delivered";
            const isCancelled = status.toLowerCase() === "cancelled";
            const isInTransit = status.toLowerCase().includes("transit") || status.toLowerCase().includes("shipped");

            // Calculate expected delivery date: 10 days from order placement
            const orderDateObj = o.created_at ? new Date(o.created_at) : new Date();
            const calcDeliveryDate = new Date(orderDateObj.getTime() + 10 * 24 * 60 * 60 * 1000);
            const expectedDeliveryFormatted = (o.expected_delivery_date
              ? new Date(o.expected_delivery_date)
              : calcDeliveryDate
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return {
              id: o.order_id || o.id,
              date: dateStr,
              status: status,
              paymentMethod: o.payment_method || "Razorpay Online",
              shippingAddress: o.shipping_address || "Default Address",
              total: Number(o.total || 0),
              deliveredDate: isDelivered ? dateStr : undefined,
              estimatedDate: !isDelivered && !isCancelled ? expectedDeliveryFormatted : undefined,
              cancelledDate: isCancelled ? dateStr : undefined,
              items: (o.items || []).map((it, idx) => ({
                id: it.product_id || `it-${idx}`,
                name: it.name || "Custom Crystal Item",
                category: "Crystal Collection",
                price: Number(it.price || 0),
                quantity: Number(it.quantity || 1),
                image_url: o.attachment_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
              })),
              timeline: [
                { title: "Order Confirmed", date: dateStr, done: true },
                { title: "Processing & Quality Check", date: dateStr, done: status !== "Pending" },
                { title: "Shipped with Express Courier", date: isInTransit || isDelivered ? "In Transit" : "Pending dispatch", done: isInTransit || isDelivered },
                { title: `Delivered (Expected by ${expectedDeliveryFormatted})`, date: isDelivered ? dateStr : `By ${expectedDeliveryFormatted}`, done: isDelivered },
              ],
            };
          });
          setOrders(formatted);
        } else {
          setOrders(INITIAL_ORDERS);
        }
      } catch {
        setOrders(INITIAL_ORDERS);
      } finally {
        setLoading(false);
      }
    }

    loadUserOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesTab = 
      activeTab === "all" || 
      order.status.toLowerCase() === activeTab.toLowerCase() ||
      (activeTab === "In Transit" && (order.status.toLowerCase().includes("transit") || order.status.toLowerCase().includes("shipped")));
    
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  function handleBuyAgain(order: FormattedOrder) {
    try {
      order.items.forEach((item) => {
        addToLocalCart({
          id: item.id,
          name: item.name,
          price: item.price,
          stock: 99,
          product_type: "ready_stock",
          image_url: item.image_url || "",
          category: { id: "crystal", name: item.category || "Crystal", is_active: true },
        } as unknown as Product, item.quantity);
      });
      showToast(`Items from #${order.id} re-added to your cart!`);
    } catch {
      showToast("Items added to your cart!");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-neutral-900 px-5 py-3 text-xs sm:text-sm font-semibold text-[#ffea00] shadow-2xl transition-all border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-neutral-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <LuPackage className="text-lg" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-[-1px] text-neutral-900 text-center sm:text-left">
              Order History
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 text-center sm:text-left">
            Track and manage your past and current orders
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or item..."
            className="w-full rounded-xl border border-neutral-200 bg-[#f9f8f5] py-2 pl-9 pr-3 text-xs font-medium text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "In Transit", "Delivered", "Cancelled"] as const).map((tab) => {
          const count = tab === "all" 
            ? orders.length 
            : orders.filter((o) => {
                if (tab === "In Transit") {
                  return o.status.toLowerCase().includes("transit") || o.status.toLowerCase().includes("shipped");
                }
                return o.status.toLowerCase() === tab.toLowerCase();
              }).length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg sm:rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <span>{tab === "all" ? "All Orders" : tab}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <LuPackage className="text-3xl stroke-[1.5]" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-neutral-900">No orders found</h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-500">
            {searchQuery 
              ? "We couldn't find any orders matching your search." 
              : "You haven't placed any orders in this category yet."}
          </p>
          <Link
            href="/product"
            className="mt-6 flex items-center gap-1.5 rounded-full bg-[#ffea00] px-6 py-2.5 text-xs font-bold text-black shadow-sm transition hover:bg-neutral-900 hover:text-[#ffea00]"
          >
            Start Shopping <LuArrowRight className="text-sm" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.status.toLowerCase() === "delivered";
            const isInTransit = order.status.toLowerCase().includes("transit") || order.status.toLowerCase().includes("shipped");
            const isCancelled = order.status.toLowerCase() === "cancelled";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition hover:border-neutral-300"
              >
                {/* Responsive Order Header Bar */}
                <div className="flex flex-col gap-2 border-b border-neutral-100 bg-[#f9f8f5] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3">
                  <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-6">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Order</span>
                        <span className="font-extrabold text-neutral-900">{order.id}</span>
                      </div>
                      <div className="h-6 w-px bg-neutral-200" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Date</span>
                        <span className="font-medium text-neutral-700">{order.date}</span>
                      </div>
                      <div className="h-6 w-px bg-neutral-200" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total</span>
                        <div className="flex items-center font-bold text-neutral-900">
                          <TbCurrencyRupee className="text-[#4a5c3a]" />
                          <span>{order.total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge on Mobile right corner */}
                    <div className="sm:hidden">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isDelivered
                            ? "bg-emerald-100 text-emerald-800"
                            : isInTransit
                            ? "bg-blue-100 text-blue-800"
                            : isCancelled
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isDelivered && <LuCircleCheck className="text-xs" />}
                        {isInTransit && <LuTruck className="text-xs" />}
                        {isCancelled && <LuCircleX className="text-xs" />}
                        {!isDelivered && !isInTransit && !isCancelled && <LuClock className="text-xs" />}
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge on Desktop */}
                  <div className="hidden sm:flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isInTransit
                          ? "bg-blue-100 text-blue-800"
                          : isCancelled
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isDelivered && <LuCircleCheck className="text-sm" />}
                      {isInTransit && <LuTruck className="text-sm" />}
                      {isCancelled && <LuCircleX className="text-sm" />}
                      {!isDelivered && !isInTransit && !isCancelled && <LuClock className="text-sm" />}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3.5 sm:p-5">
                  <div className="divide-y divide-neutral-100 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 pt-3 first:pt-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                            <img
                              src={item.image_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            {item.category && (
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">{item.category}</p>
                            )}
                            <h4 className="font-bold text-neutral-900 text-xs sm:text-sm truncate">{item.name}</h4>
                            <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                            {isDelivered && (
                              <div className="mt-1 flex items-center gap-2">
                                {reviewedKeys.includes(`${order.id}_${item.id}`) ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <LuCircleCheck className="text-xs" /> Reviewed
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReview(order, item)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4a5c3a] hover:text-black underline cursor-pointer"
                                  >
                                    <FaStar className="text-amber-400 text-[10px]" /> Review Item
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="flex items-center justify-end font-bold text-neutral-900 text-xs sm:text-sm">
                            <TbCurrencyRupee className="text-[#4a5c3a]" />
                            <span>{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3.5 flex flex-col gap-2.5 border-t border-neutral-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-[11px] text-neutral-500">
                      {isDelivered && order.deliveredDate && `Delivered on ${order.deliveredDate}`}
                      {!isDelivered && !isCancelled && order.estimatedDate && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <LuClock className="text-xs shrink-0 text-emerald-600" />
                          <span>Expected Delivery: <strong>{order.estimatedDate}</strong></span>
                        </span>
                      )}
                      {isCancelled && (order.cancelledDate ? `Cancelled on ${order.cancelledDate}` : "Order cancelled")}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {isDelivered && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(order)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#ffea00] hover:text-black shadow-xs cursor-pointer"
                        >
                          <FaStar className="text-amber-400 text-xs shrink-0" />
                          <span>Review Product</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setTrackingModalOrder(order)}
                        className="flex items-center justify-center gap-1 rounded-xl border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                      >
                        <LuTruck className="text-xs shrink-0" />
                        <span>Track</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-1 rounded-xl border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                      >
                        <LuFileText className="text-xs shrink-0" />
                        <span>Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBuyAgain(order)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-[#ffea00] px-2.5 py-1.5 text-xs font-bold text-black transition hover:bg-neutral-900 hover:text-[#ffea00]"
                      >
                        <LuRotateCcw className="text-xs shrink-0" />
                        <span>Buy Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Tracking Modal ─────────────────────────────────────────────────── */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">Track Order</h3>
                <p className="text-[11px] text-neutral-400 font-medium">{trackingModalOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <LuX className="text-sm" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {trackingModalOrder.timeline.map((step, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  {i < trackingModalOrder.timeline.length - 1 && (
                    <div
                      className={`absolute left-3 top-5 h-full w-0.5 ${
                        step.done ? "bg-[#4a5c3a]" : "bg-neutral-200"
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      step.done ? "bg-[#4a5c3a] text-white" : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {step.done ? "✓" : i + 1}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-neutral-900">{step.title}</h5>
                    <p className="text-[11px] text-neutral-400">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="w-full rounded-xl bg-neutral-900 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Details & Invoice Modal ────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">Order Invoice</h3>
                <p className="text-[11px] text-neutral-400 font-medium">#{selectedOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <LuX className="text-sm" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl bg-[#f9f8f5] p-3">
                <div>
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Shipping Address</span>
                  <p className="mt-0.5 font-medium text-neutral-800 leading-tight">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Payment Method</span>
                  <p className="mt-0.5 font-medium text-neutral-800 leading-tight">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 mb-1.5 text-xs">Purchased Items</h5>
                <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 p-2.5 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                        <p className="text-neutral-400 text-[11px]">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="font-bold text-neutral-900 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 text-sm pt-1.5 border-t border-neutral-100">
                  <span>Total Paid</span>
                  <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-xl border border-neutral-900 py-2.5 text-xs font-bold text-neutral-900 transition hover:bg-neutral-100"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delivered Product Review Modal ─── */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-neutral-100">
            <button
              type="button"
              onClick={() => {
                if (!modalSubmitting) setReviewModalData(null);
              }}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition cursor-pointer"
            >
              <LuX className="text-sm" />
            </button>

            {modalSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold">
                  ✓
                </div>
                <h4 className="mt-3 text-xl font-bold text-neutral-900">Review Submitted!</h4>
                <p className="mt-1 text-xs text-neutral-500">
                  Thank you! Your verified review is published and live on the product page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmitReview} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 mb-2">
                    <TbShieldCheck className="text-xs" /> Verified Delivered Order #{reviewModalData.order.id}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                    Review {reviewModalData.item.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Your feedback helps other crystal enthusiasts make informed choices.
                  </p>
                </div>

                {/* If order has multiple items, let customer switch item */}
                {reviewModalData.order.items.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Choose Item
                    </label>
                    <select
                      value={reviewModalData.item.id}
                      onChange={(e) => {
                        const target = reviewModalData.order.items.find((it) => it.id === e.target.value);
                        if (target) setReviewModalData({ ...reviewModalData, item: target });
                      }}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-800 outline-none focus:border-neutral-900"
                    >
                      {reviewModalData.order.items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modalError && (
                  <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-200">
                    {modalError}
                  </div>
                )}

                {/* Star rating */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Overall Experience (Stars)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-2xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setModalHoverRating(star)}
                          onMouseLeave={() => setModalHoverRating(0)}
                          onClick={() => setModalRating(star)}
                          className="transition hover:scale-110 cursor-pointer"
                        >
                          <FaStar
                            className={
                              (modalHoverRating || modalRating) >= star
                                ? "text-amber-400"
                                : "text-neutral-200"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-700">
                      {["", "Poor", "Fair", "Average", "Good", "Outstanding"][modalHoverRating || modalRating]}
                    </span>
                  </div>
                </div>

                {/* Quality rating */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Craftsmanship & Quality
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setModalHoverQuality(star)}
                          onMouseLeave={() => setModalHoverQuality(0)}
                          onClick={() => setModalQualityRating(star)}
                          className="transition hover:scale-110 cursor-pointer"
                        >
                          <FaStar
                            className={
                              (modalHoverQuality || modalQualityRating) >= star
                                ? "text-emerald-500"
                                : "text-neutral-200"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-neutral-600">
                      {modalHoverQuality || modalQualityRating} / 5 Quality
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g., Exquisite cut and natural sparkle"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-900"
                  />
                </div>

                {/* Feedback comment */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Review Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    placeholder="Share how the crystal feels, looks in ambient light, and whether packaging was secure..."
                    className="w-full rounded-xl border border-neutral-200 p-3 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-900 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setReviewModalData(null)}
                    disabled={modalSubmitting}
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white hover:bg-[#ffea00] hover:text-black transition disabled:opacity-50"
                  >
                    {modalSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
