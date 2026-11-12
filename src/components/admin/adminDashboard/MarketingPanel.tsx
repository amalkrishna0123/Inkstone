"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import {
  FiMail,
  FiSend,
  FiUsers,
  FiTag,
  FiImage,
  FiSearch,
  FiCheck,
  FiX,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink,
  FiGift,
  FiChevronRight,
  FiSparkles,
} from "react-icons/fi";
import { AdminUser, api, Banner, Coupon, Order } from "@/src/lib/inkstone-api";

export type CustomerEntry = {
  email: string;
  name: string;
  is_staff: boolean;
  source: string;
  orderCount: number;
  totalSpent: number;
};

type SentEmailRecord = {
  id: string;
  recipient: string;
  recipient_name?: string;
  subject: string;
  type: string;
  coupon_code?: string;
  sent_at: string;
  status: string;
  error?: string;
};

const inputStyle = "w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ffea00] focus:ring-1 focus:ring-[#ffea00]";
const buttonStyle = "bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition";

export default function MarketingPanel({
  users,
  orders,
  banners,
  coupons,
  customers,
}: {
  users: AdminUser[];
  orders: Order[];
  banners: Banner[];
  coupons: Coupon[];
  customers: CustomerEntry[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "customers" | "staff">("all");
  const [statusNotice, setStatusNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  // Sent emails audit log
  const [sentEmails, setSentEmails] = useState<SentEmailRecord[]>([]);
  const [loadingSentEmails, setLoadingSentEmails] = useState(false);

  // Modal compose state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<CustomerEntry | null>(null); // null means broadcast
  const [sending, setSending] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<"coupon" | "banner" | "vip" | "custom">("coupon");

  // Email form
  const [form, setForm] = useState({
    subject: "",
    title: "",
    message: "",
    coupon_code: "",
    discount_percent: 0,
    banner_url: "",
    cta_url: "/product",
  });

  // Load sent emails history
  async function loadSentEmails() {
    setLoadingSentEmails(true);
    try {
      const records = await api.getSentEmails();
      setSentEmails(records as SentEmailRecord[]);
    } catch (err) {
      console.warn("Failed to load sent emails:", err);
    } finally {
      setLoadingSentEmails(false);
    }
  }

  useEffect(() => {
    void loadSentEmails();
  }, []);

  // Filter customers by search term and tab
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterType === "customers") return !c.is_staff;
      if (filterType === "staff") return c.is_staff;
      return true;
    });
  }, [customers, searchTerm, filterType]);

  // Apply templates
  function applyTemplate(type: "coupon" | "banner" | "vip" | "custom") {
    setActiveTemplate(type);
    const activeCoupon = coupons.find((c) => c.is_active) || coupons[0];
    const activeBanner = banners.find((b) => b.is_active) || banners[0];

    if (type === "coupon") {
      setForm({
        subject: activeCoupon
          ? `Special Gift: ${activeCoupon.discount_percent}% OFF Your Next Crystal Order!`
          : "Exclusive Crystal Discount Just for You!",
        title: activeCoupon
          ? `Enjoy ${activeCoupon.discount_percent}% OFF at InkStone Crystals`
          : "A Special Discount for Our Valued Customers",
        message: activeCoupon
          ? `Thank you for being part of our crystal family. We're pleased to offer you an exclusive ${activeCoupon.discount_percent}% discount on all our authentic, handcrafted crystals and jewelry.\n\nUse your coupon code at checkout:`
          : "Thank you for being part of our crystal family. Enjoy a special discount on your next crystal purchase!",
        coupon_code: activeCoupon?.code || "",
        discount_percent: activeCoupon?.discount_percent || 0,
        banner_url: "",
        cta_url: "/product",
      });
    } else if (type === "banner") {
      setForm({
        subject: activeBanner ? `Featured Collection: ${activeBanner.title}` : "Discover New Crystal Arrivals at InkStone!",
        title: activeBanner ? activeBanner.title : "New Arrivals & Featured Crystals",
        message: activeBanner?.subtitle
          ? `${activeBanner.subtitle}\n\nExplore our latest handpicked crystals, healing stones, and bespoke wire-wrapped masterpieces!`
          : "Explore our latest handpicked crystals, healing stones, and bespoke wire-wrapped masterpieces! Each piece is carefully cleansed and packed with positive energy.",
        coupon_code: "",
        discount_percent: 0,
        banner_url: activeBanner?.image_url || "",
        cta_url: activeBanner?.link_url || "/product",
      });
    } else if (type === "vip") {
      setForm({
        subject: "A Heartfelt Thank You from InkStone Crystals",
        title: "Exclusive Collector's Appreciation",
        message: "We truly cherish your trust in our crystal studio. Every raw mineral and polished gem in our inventory is ethically sourced, certified authentic, and handled with utmost reverence.\n\nVisit our online showcase anytime to explore new artisan creations tailored just for you.",
        coupon_code: "",
        discount_percent: 0,
        banner_url: "",
        cta_url: "/product",
      });
    } else {
      setForm({
        subject: "",
        title: "",
        message: "",
        coupon_code: "",
        discount_percent: 0,
        banner_url: "",
        cta_url: "/product",
      });
    }
  }

  // Open modal for individual customer
  function openSendForCustomer(customer: CustomerEntry) {
    setTargetCustomer(customer);
    setIsModalOpen(true);
    applyTemplate("coupon");
  }

  // Open modal for broadcast to all customers
  function openBroadcast() {
    setTargetCustomer(null);
    setIsModalOpen(true);
    applyTemplate("coupon");
  }

  // One-click quick broadcast of latest banner
  async function quickSendBanner() {
    const activeBanner = banners.find((b) => b.is_active) || banners[0];
    if (!activeBanner) {
      setStatusNotice({ text: "No active banners found to send.", type: "error" });
      return;
    }
    const recipients = customers.filter((c) => !c.is_staff && c.email.includes("@"));
    const targetRecipients = recipients.length > 0 ? recipients : customers;

    if (targetRecipients.length === 0) {
      setStatusNotice({ text: "No customer email addresses available to receive emails.", type: "error" });
      return;
    }

    if (!window.confirm(`One-Click Broadcast: Send promotional email for banner "${activeBanner.title}" to all ${targetRecipients.length} customer(s)?`)) {
      return;
    }

    setSending(true);
    setStatusNotice({ text: `Broadcasting banner email to ${targetRecipients.length} customers...`, type: "info" });
    try {
      await api.sendBatchPromotionalEmail({
        recipients: targetRecipients.map((c) => ({ email: c.email, name: c.name })),
        subject: `New Special Collection: ${activeBanner.title}`,
        title: activeBanner.title,
        message: activeBanner.subtitle
          ? `${activeBanner.subtitle}\n\nDiscover our newest additions today at InkStone Crystals!`
          : "Discover our newest additions and limited edition creations today at InkStone Crystals!",
        banner_url: activeBanner.image_url,
        cta_url: activeBanner.link_url || "/product",
      });
      setStatusNotice({
        text: `Promotional email for "${activeBanner.title}" successfully sent to ${targetRecipients.length} customer(s)!`,
        type: "success",
      });
      await loadSentEmails();
    } catch (err: any) {
      setStatusNotice({ text: `Failed to broadcast email: ${err.message}`, type: "error" });
    } finally {
      setSending(false);
    }
  }

  // One-click quick broadcast of active coupon
  async function quickSendCoupon() {
    const activeCoupon = coupons.find((c) => c.is_active) || coupons[0];
    if (!activeCoupon) {
      setStatusNotice({ text: "No active coupons found to send.", type: "error" });
      return;
    }
    const recipients = customers.filter((c) => !c.is_staff && c.email.includes("@"));
    const targetRecipients = recipients.length > 0 ? recipients : customers;

    if (targetRecipients.length === 0) {
      setStatusNotice({ text: "No customer email addresses available to receive emails.", type: "error" });
      return;
    }

    if (!window.confirm(`One-Click Broadcast: Send discount email for coupon "${activeCoupon.code}" (${activeCoupon.discount_percent}% OFF) to all ${targetRecipients.length} customer(s)?`)) {
      return;
    }

    setSending(true);
    setStatusNotice({ text: `Broadcasting coupon email to ${targetRecipients.length} customers...`, type: "info" });
    try {
      await api.sendBatchPromotionalEmail({
        recipients: targetRecipients.map((c) => ({ email: c.email, name: c.name })),
        subject: `Special Gift: ${activeCoupon.discount_percent}% OFF with code ${activeCoupon.code}!`,
        title: `Exclusive ${activeCoupon.discount_percent}% Discount Available Now!`,
        message: `Enjoy an exclusive ${activeCoupon.discount_percent}% discount on all our handmade crystals! Use code ${activeCoupon.code} at checkout${activeCoupon.min_purchase > 0 ? ` on orders above Rs. ${activeCoupon.min_purchase}` : ""}.`,
        coupon_code: activeCoupon.code,
        discount_percent: activeCoupon.discount_percent,
        cta_url: "/product",
      });
      setStatusNotice({
        text: `Discount email for coupon "${activeCoupon.code}" successfully sent to ${targetRecipients.length} customer(s)!`,
        type: "success",
      });
      await loadSentEmails();
    } catch (err: any) {
      setStatusNotice({ text: `Failed to broadcast email: ${err.message}`, type: "error" });
    } finally {
      setSending(false);
    }
  }

  // Handle submit from modal
  async function handleSendEmail(e: FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      alert("Subject and Message are required.");
      return;
    }

    setSending(true);
    setStatusNotice(null);

    try {
      if (targetCustomer) {
        // Individual customer send
        await api.sendPromotionalEmail({
          to: targetCustomer.email,
          customer_name: targetCustomer.name,
          subject: form.subject.trim(),
          title: form.title.trim() || form.subject.trim(),
          message: form.message.trim(),
          coupon_code: form.coupon_code || undefined,
          discount_percent: form.discount_percent || undefined,
          banner_url: form.banner_url || undefined,
          cta_url: form.cta_url || undefined,
        });
        setStatusNotice({
          text: `Promotional email successfully delivered to ${targetCustomer.name} (${targetCustomer.email})!`,
          type: "success",
        });
      } else {
        // Broadcast to all
        const recipients = customers.filter((c) => !c.is_staff && c.email.includes("@"));
        const targetRecipients = recipients.length > 0 ? recipients : customers;

        if (targetRecipients.length === 0) {
          throw new Error("No recipients available.");
        }

        await api.sendBatchPromotionalEmail({
          recipients: targetRecipients.map((c) => ({ email: c.email, name: c.name })),
          subject: form.subject.trim(),
          title: form.title.trim() || form.subject.trim(),
          message: form.message.trim(),
          coupon_code: form.coupon_code || undefined,
          discount_percent: form.discount_percent || undefined,
          banner_url: form.banner_url || undefined,
          cta_url: form.cta_url || undefined,
        });
        setStatusNotice({
          text: `Broadcast email successfully sent to all ${targetRecipients.length} customers!`,
          type: "success",
        });
      }

      setIsModalOpen(false);
      await loadSentEmails();
    } catch (err: any) {
      setStatusNotice({
        text: `Failed to send email: ${err.message}`,
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Page Title & Top Actions */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300]">Crystal Commerce</p>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Marketing & Email Campaigns</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Send customized promotional emails to individual customers or broadcast offers to all customers with one click.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openBroadcast}
            className="flex items-center gap-2 bg-black px-4 py-2.5 text-xs font-bold text-white hover:bg-[#ffea00] hover:text-black transition shadow-sm"
          >
            <FiMail className="text-sm" /> Broadcast to All Customers
          </button>
          <button
            onClick={quickSendBanner}
            disabled={banners.length === 0 || sending}
            className="flex items-center gap-2 border border-black/10 bg-white px-3.5 py-2.5 text-xs font-bold text-neutral-800 hover:border-black hover:bg-neutral-50 transition shadow-xs disabled:opacity-50"
            title="1-Click: Send the latest active banner to all customers"
          >
            <FiImage className="text-sm text-neutral-600" /> 1-Click Banner Mail
          </button>
          <button
            onClick={quickSendCoupon}
            disabled={coupons.length === 0 || sending}
            className="flex items-center gap-2 border border-black/10 bg-white px-3.5 py-2.5 text-xs font-bold text-neutral-800 hover:border-black hover:bg-neutral-50 transition shadow-xs disabled:opacity-50"
            title="1-Click: Send the active coupon code to all customers"
          >
            <FiTag className="text-sm text-neutral-600" /> 1-Click Coupon Mail
          </button>
        </div>
      </div>

      {/* Status Notice Banner */}
      {statusNotice && (
        <div
          className={`mb-6 flex items-center justify-between rounded-none border p-4 text-sm font-medium ${
            statusNotice.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : statusNotice.type === "error"
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusNotice.type === "success" && <FiCheck className="text-lg text-emerald-600 shrink-0" />}
            {statusNotice.type === "error" && <FiAlertCircle className="text-lg text-red-600 shrink-0" />}
            {statusNotice.type === "info" && <FiClock className="text-lg text-amber-600 shrink-0 animate-spin" />}
            <span>{statusNotice.text}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-neutral-500 hover:text-black">
            <FiX />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-black/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center bg-[#fff7a8] text-lg text-black">
              <FiUsers />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Reach</span>
          </div>
          <p className="text-xs font-medium text-neutral-500">Registered & Direct Customers</p>
          <p className="mt-1 text-3xl font-black text-black">{customers.length}</p>
        </div>

        <div className="border border-black/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center bg-[#fff7a8] text-lg text-black">
              <FiImage />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Store Banners</span>
          </div>
          <p className="text-xs font-medium text-neutral-500">Live Promotional Banners</p>
          <p className="mt-1 text-3xl font-black text-black">{banners.length}</p>
        </div>

        <div className="border border-black/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center bg-[#fff7a8] text-lg text-black">
              <FiTag />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Coupons</span>
          </div>
          <p className="text-xs font-medium text-neutral-500">Checkout Discount Codes</p>
          <p className="mt-1 text-3xl font-black text-black">{coupons.filter((c) => c.is_active).length}</p>
        </div>

        <div className="border border-black/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center bg-[#fff7a8] text-lg text-black">
              <FiMail />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Audit History</span>
          </div>
          <p className="text-xs font-medium text-neutral-500">Delivered Emails</p>
          <p className="mt-1 text-3xl font-black text-black">{sentEmails.length}</p>
        </div>
      </div>

      {/* Customer Directory: Send Mail for Each Customer */}
      <div className="mb-8 border border-neutral-200 bg-white shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-black text-neutral-900">Send Mail to Each Customer</h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Select any customer below to compose and send an individual promotional email, coupon code, or custom note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-black focus:bg-white"
              />
            </div>

            <div className="flex border border-neutral-200 bg-neutral-50 text-xs font-medium">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 transition ${filterType === "all" ? "bg-black text-white font-bold" : "text-neutral-600 hover:text-black"}`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setFilterType("customers")}
                className={`px-3 py-1.5 transition ${filterType === "customers" ? "bg-black text-white font-bold" : "text-neutral-600 hover:text-black"}`}
              >
                Customers ({customers.filter((c) => !c.is_staff).length})
              </button>
              <button
                onClick={() => setFilterType("staff")}
                className={`px-3 py-1.5 transition ${filterType === "staff" ? "bg-black text-white font-bold" : "text-neutral-600 hover:text-black"}`}
              >
                Staff ({customers.filter((c) => c.is_staff).length})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Type / Source</th>
                <th className="p-4">Purchases</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-neutral-500">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.email} className="border-b border-neutral-100 last:border-0 hover:bg-[#fffef0]/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-black text-[#ffea00]">
                          {(customer.name || customer.email).slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-neutral-900 leading-tight">{customer.name || "Customer"}</p>
                          <p className="text-[11px] text-neutral-400">ID: {customer.email.split("@")[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-neutral-700">{customer.email}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                          customer.is_staff
                            ? "bg-purple-100 text-purple-800"
                            : customer.orderCount > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {customer.source}
                      </span>
                    </td>
                    <td className="p-4">
                      {customer.orderCount > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{customer.orderCount} order(s)</p>
                          <p className="text-[11px] text-neutral-500">Rs. {customer.totalSpent.toLocaleString("en-IN")}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">No orders yet</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openSendForCustomer(customer)}
                        className="inline-flex items-center gap-1.5 bg-[#ffea00] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-black hover:text-white transition shadow-xs"
                      >
                        <FiSend className="text-xs" /> Send Mail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sent Emails Audit Log */}
      <div className="border border-neutral-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200 p-5">
          <div>
            <h3 className="text-lg font-black text-neutral-900">Sent Emails Audit Log</h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Live audit trail of marketing broadcasts and individual emails sent to customers.
            </p>
          </div>
          <button
            onClick={() => void loadSentEmails()}
            disabled={loadingSentEmails}
            className="flex items-center gap-1.5 border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
          >
            <FiRefreshCw className={`text-xs ${loadingSentEmails ? "animate-spin" : ""}`} /> Refresh Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="p-4">Recipient</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Campaign Type</th>
                <th className="p-4">Coupon</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4 text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {sentEmails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-neutral-500">
                    No emails logged yet. Sent emails will appear here automatically.
                  </td>
                </tr>
              ) : (
                sentEmails.slice(0, 25).map((log, idx) => (
                  <tr key={log.id || idx} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-xs text-neutral-900">{log.recipient_name || log.recipient}</p>
                      <p className="font-mono text-[11px] text-neutral-500">{log.recipient}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-neutral-800 max-w-xs truncate">{log.subject}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-800 rounded">
                        {log.type || "marketing"}
                      </span>
                    </td>
                    <td className="p-4">
                      {log.coupon_code ? (
                        <span className="font-mono text-xs font-bold text-black bg-[#ffea00] px-2 py-0.5">
                          {log.coupon_code}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-neutral-500">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        <FiCheck className="text-xs" /> {log.status || "delivered"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose & Send Email Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !sending) setIsModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-3xl border border-neutral-300 bg-white p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8d8300]">
                  {targetCustomer ? "Individual Customer Email" : "Broadcast Campaign"}
                </span>
                <h3 className="text-2xl font-black text-neutral-900">
                  {targetCustomer ? `Send Email to ${targetCustomer.name || "Customer"}` : `Broadcast to All Customers (${customers.length})`}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {targetCustomer
                    ? `Recipient: ${targetCustomer.email} • Customize the subject, announcement banner, and discount offer below.`
                    : `This announcement will be delivered to all ${customers.length} registered customers.`}
                </p>
              </div>
              <button
                type="button"
                disabled={sending}
                onClick={() => setIsModalOpen(false)}
                className="text-2xl leading-none text-neutral-400 hover:text-black"
              >
                &times;
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Quick Campaign Presets (1-Click Fill)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate("coupon")}
                  className={`flex flex-col items-center justify-center p-3 border text-xs font-bold transition text-center ${
                    activeTemplate === "coupon"
                      ? "border-black bg-[#ffea00] text-black shadow-xs"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <FiTag className="text-base mb-1" /> Coupon Special
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("banner")}
                  className={`flex flex-col items-center justify-center p-3 border text-xs font-bold transition text-center ${
                    activeTemplate === "banner"
                      ? "border-black bg-[#ffea00] text-black shadow-xs"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <FiImage className="text-base mb-1" /> Banner Announcement
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("vip")}
                  className={`flex flex-col items-center justify-center p-3 border text-xs font-bold transition text-center ${
                    activeTemplate === "vip"
                      ? "border-black bg-[#ffea00] text-black shadow-xs"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <FiGift className="text-base mb-1" /> VIP Appreciation
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("custom")}
                  className={`flex flex-col items-center justify-center p-3 border text-xs font-bold transition text-center ${
                    activeTemplate === "custom"
                      ? "border-black bg-[#ffea00] text-black shadow-xs"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <FiMail className="text-base mb-1" /> Custom Message
                </button>
              </div>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-700">Email Subject *</label>
                <input
                  className={inputStyle}
                  required
                  placeholder="e.g. Special 20% Discount for InkStone Friends!"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-700">Heading / Announcement Title</label>
                <input
                  className={inputStyle}
                  placeholder="e.g. Exclusive Weekend Offer at InkStone Crystals"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-700">Message Content *</label>
                <textarea
                  className={`${inputStyle} h-28 resize-y`}
                  required
                  placeholder="Write your email body or promotional message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-700">Attach Coupon (Optional)</label>
                  <select
                    className={inputStyle}
                    value={form.coupon_code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const c = coupons.find((cpn) => cpn.code === code);
                      setForm({
                        ...form,
                        coupon_code: code,
                        discount_percent: c ? c.discount_percent : 0,
                      });
                    }}
                  >
                    <option value="">-- No coupon attached --</option>
                    {coupons.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} ({c.discount_percent}% OFF){!c.is_active ? " [Inactive]" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-700">Attach Banner (Optional)</label>
                  <select
                    className={inputStyle}
                    value={form.banner_url}
                    onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                  >
                    <option value="">-- No banner image --</option>
                    {banners.map((b) => (
                      <option key={b.id} value={b.image_url}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-700">Button CTA Link URL</label>
                <input
                  className={inputStyle}
                  placeholder="/product or https://..."
                  value={form.cta_url}
                  onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                />
              </div>

              {/* Live Preview Card */}
              <div className="mt-5 border border-dashed border-neutral-300 bg-neutral-50 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Live Email Layout Preview
                </p>
                <div className="max-w-md mx-auto bg-white border border-neutral-200 p-5 rounded-lg shadow-xs">
                  <div className="text-center pb-3 border-b border-neutral-100">
                    <span className="inline-block bg-[#ffea00] px-2 py-0.5 text-xs font-black">CRYSTAL</span>
                    <p className="text-[10px] uppercase font-bold text-neutral-400 mt-1">INKSTONE CRYSTALS</p>
                  </div>
                  {form.banner_url && (
                    <div className="my-3 overflow-hidden rounded">
                      <img src={form.banner_url} alt="Banner" className="w-full h-24 object-cover" />
                    </div>
                  )}
                  <h4 className="mt-3 text-base font-bold text-neutral-900">{form.title || form.subject || "Email Heading"}</h4>
                  <p className="mt-2 text-xs text-neutral-600 whitespace-pre-line leading-relaxed">
                    {form.message || "Your promotional message will appear here."}
                  </p>
                  {form.coupon_code && (
                    <div className="my-4 border-2 border-dashed border-[#ffea00] bg-neutral-900 p-3 text-center text-white rounded-lg">
                      <p className="text-[10px] font-bold uppercase text-[#ffea00]">Exclusive Gift</p>
                      <p className="text-base font-black">{form.discount_percent}% OFF</p>
                      <div className="mt-1.5 inline-block bg-white text-black font-mono font-black text-xs px-3 py-1 rounded">
                        {form.coupon_code}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-neutral-950 text-white text-xs font-bold px-4 py-2 rounded-full">
                      Explore Collection
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => setIsModalOpen(false)}
                  className="border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 bg-black px-6 py-2.5 text-xs font-bold text-[#ffea00] hover:bg-[#ffea00] hover:text-black transition shadow-sm disabled:opacity-50"
                >
                  <FiSend className="text-sm" />
                  {sending
                    ? "Delivering Email..."
                    : targetCustomer
                    ? `Send to ${targetCustomer.name || "Customer"}`
                    : `Send Broadcast to All (${customers.length}) Customers`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

