"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuMapPin, LuPackage, LuHeart, LuShoppingCart, LuTicket, LuSettings, LuLogOut } from "react-icons/lu";
import { useRouteTransition } from "@/src/components/route-transition/RouteTransitionProvider";
import { logout } from "@/src/lib/inkstone-api";
import AuthGuard from "@/src/components/auth/AuthGuard";

const sidebarLinks = [
  { name: "Overview", href: "/dashboard", icon: LuLayoutDashboard },
  { name: "Address", href: "/dashboard/address", icon: LuMapPin },
  { name: "Orders", href: "/dashboard/orders", icon: LuPackage },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: LuHeart },
  { name: "Added Cart Items", href: "/dashboard/cart", icon: LuShoppingCart },
  { name: "Coupon", href: "/dashboard/coupon", icon: LuTicket },
  { name: "Settings", href: "/dashboard/settings", icon: LuSettings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { navigate } = useRouteTransition();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AuthGuard>
      <div className="bg-[#f9f8f5] min-h-screen pt-24 sm:pt-28 pb-12 sm:pb-20">
        <div className="mx-auto max-w-[1300px] px-3 sm:px-5">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[240px_1fr]">
            
            {/* Sidebar */}
            <aside className="hidden lg:block h-fit rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-5 px-3">
                <h2 className="text-lg font-bold tracking-[-1px] text-neutral-900">My Account</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Manage your profile</p>
              </div>
              
              <nav className="flex flex-col gap-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.href);
                      }}
                      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#ffea00] text-black font-bold"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                      }`}
                    >
                      <Icon className={`text-base ${isActive ? "text-black" : "text-neutral-400 group-hover:text-neutral-600"}`} />
                      {link.name}
                    </Link>
                  );
                })}
                
                <div className="my-2.5 h-px w-full bg-neutral-100" />
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LuLogOut className="text-base text-red-400" /> Logout
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm min-h-[500px]">
              {children}
            </main>
            
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
