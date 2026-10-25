"use client";

import { useState } from "react";
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
  LuX
} from "react-icons/lu";
import { TbCurrencyRupee } from "react-icons/tb";

// Mock Initial Orders Data
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

type OrderType = typeof INITIAL_ORDERS[0];

export default function OrdersPage() {
  const [orders] = useState<OrderType[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<"all" | "In Transit" | "Delivered" | "Cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<OrderType | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-[#ffea00] shadow-2xl transition-all">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <LuPackage className="text-xl" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Order History</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Track and manage your past and current orders
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or product..."
            className="w-full rounded-2xl border border-neutral-200 bg-[#f9f8f5] py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 pb-2">
        {(["all", "In Transit", "Delivered", "Cancelled"] as const).map((tab) => {
          const count = tab === "all" 
            ? orders.length 
            : orders.filter((o) => o.status === tab).length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <span>{tab === "all" ? "All Orders" : tab}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <LuPackage className="text-4xl stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">No orders found</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            {searchQuery 
              ? "We couldn't find any orders matching your search." 
              : "You haven't placed any orders in this category yet."}
          </p>
          <Link
            href="/product"
            className="mt-8 flex items-center gap-2 rounded-full bg-[#ffea00] px-8 py-3 text-sm font-bold text-black shadow-md transition-all hover:bg-neutral-900 hover:text-[#ffea00]"
          >
            Start Shopping <LuArrowRight className="text-base" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-neutral-200 hover:shadow-md"
            >
              {/* Order Header bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 bg-[#f9f8f5] px-6 py-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Order ID</span>
                    <p className="font-bold text-neutral-900">{order.id}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Date Placed</span>
                    <p className="font-semibold text-neutral-700 text-xs">{order.date}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Amount</span>
                    <div className="flex items-center font-extrabold text-neutral-900">
                      <TbCurrencyRupee className="text-[#4a5c3a]" />
                      <span>{order.total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${
                      order.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "In Transit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {order.status === "Delivered" && <LuCircleCheck className="text-sm" />}
                    {order.status === "In Transit" && <LuTruck className="text-sm" />}
                    {order.status === "Cancelled" && <LuCircleX className="text-sm" />}
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{item.category}</p>
                          <h4 className="font-bold text-neutral-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="flex items-center font-bold text-neutral-900 text-sm">
                        <TbCurrencyRupee className="text-[#4a5c3a]" />
                        <span>{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-5">
                  <div className="text-xs text-neutral-500">
                    {order.status === "Delivered" && `Delivered on ${order.deliveredDate}`}
                    {order.status === "In Transit" && `Estimated delivery: ${order.estimatedDate}`}
                    {order.status === "Cancelled" && `Cancelled on ${order.cancelledDate}`}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTrackingModalOrder(order)}
                      className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-800 transition hover:bg-neutral-100"
                    >
                      <LuTruck className="text-sm" /> Track Order
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-800 transition hover:bg-neutral-100"
                    >
                      <LuFileText className="text-sm" /> Details & Invoice
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast(`Added items from ${order.id} to cart!`)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#ffea00] px-4 py-2 text-xs font-bold text-black transition hover:bg-neutral-900 hover:text-[#ffea00]"
                    >
                      <LuRotateCcw className="text-sm" /> Buy Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Tracking Modal ─────────────────────────────────────────────────── */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Track Order</h3>
                <p className="text-xs text-neutral-400 font-medium">{trackingModalOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <LuX />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {trackingModalOrder.timeline.map((step, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  {i < trackingModalOrder.timeline.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-6 h-full w-0.5 ${
                        step.done ? "bg-[#4a5c3a]" : "bg-neutral-200"
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.done ? "bg-[#4a5c3a] text-white" : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {step.done ? "✓" : i + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-neutral-900">{step.title}</h5>
                    <p className="text-xs text-neutral-400">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="w-full rounded-2xl bg-neutral-900 py-3 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Details & Invoice Modal ────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Order Invoice</h3>
                <p className="text-xs text-neutral-400 font-medium">#{selectedOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <LuX />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#f9f8f5] p-4">
                <div>
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider">Shipping Address</span>
                  <p className="mt-1 font-medium text-neutral-800">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider">Payment Method</span>
                  <p className="mt-1 font-medium text-neutral-800">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 mb-2">Purchased Items</h5>
                <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 p-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-bold text-neutral-900">{item.name}</p>
                        <p className="text-neutral-400">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="font-bold text-neutral-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 text-sm pt-2 border-t border-neutral-100">
                  <span>Total Paid</span>
                  <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 rounded-2xl border border-neutral-900 py-3 text-xs font-bold text-neutral-900 transition hover:bg-neutral-100"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-2xl bg-neutral-900 py-3 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
