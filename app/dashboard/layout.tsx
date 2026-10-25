"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuMapPin, LuPackage, LuHeart, LuShoppingCart, LuTicket, LuSettings, LuLogOut } from "react-icons/lu";
import { useRouteTransition } from "@/src/components/route-transition/RouteTransitionProvider";
import { logout } from "@/src/lib/inkstone-api";

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
    <div className="bg-[#f9f8f5] min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-[1300px] px-5">
        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          
          {/* Sidebar */}
          <aside className="hidden lg:block h-fit rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 px-4">
              <h2 className="text-xl font-bold tracking-[-1px] text-neutral-900">My Account</h2>
              <p className="text-sm text-neutral-500 mt-1">Manage your profile</p>
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
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#ffea00] text-black"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    }`}
                  >
                    <Icon className={`text-lg ${isActive ? "text-black" : "text-neutral-400 group-hover:text-neutral-600"}`} />
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="my-3 h-px w-full bg-neutral-100" />
              
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LuLogOut className="text-lg text-red-400" /> Logout
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="rounded-3xl bg-white p-6 shadow-sm min-h-[600px] lg:p-10">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
