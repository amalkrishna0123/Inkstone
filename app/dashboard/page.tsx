"use client";

import { useEffect, useState } from "react";
import { LuPackage, LuHeart, LuShoppingCart } from "react-icons/lu";

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("inkstone_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-1px] text-neutral-900">Dashboard Overview</h1>
      <p className="text-neutral-500 mt-2">
        Welcome back, <span className="font-semibold text-neutral-900">{user?.name || "User"}</span>!
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {/* Stat Cards */}
        <div className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-[#f9f8f5] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4a5c3a] shadow-sm">
              <LuPackage className="text-lg" />
            </div>
            <span className="font-semibold text-neutral-700">Orders</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">0</p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-[#f9f8f5] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
              <LuHeart className="text-lg" />
            </div>
            <span className="font-semibold text-neutral-700">Wishlist</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">0</p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-[#f9f8f5] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
              <LuShoppingCart className="text-lg" />
            </div>
            <span className="font-semibold text-neutral-700">In Cart</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">0</p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-neutral-100 p-6">
        <h2 className="text-lg font-bold text-neutral-900">Recent Activity</h2>
        <div className="mt-4 flex flex-col items-center justify-center py-10 text-center">
          <p className="text-neutral-500">No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
}
