"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/src/components/navbar/page";
import PreFooter from "@/src/components/footer/page";
import CartPulseButton from "@/src/components/cart/CartPulseButton";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPanel = pathname === "/admin" || pathname.startsWith("/admin/");
  const hideCartPulse = pathname === "/checkout" || pathname === "/payment";

  return (
    <>
      {!isAdminPanel && <Navbar />}
      {children}
      {!isAdminPanel && !hideCartPulse && <CartPulseButton />}
      {!isAdminPanel && <PreFooter />}
    </>
  );
}
