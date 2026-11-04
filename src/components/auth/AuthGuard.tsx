"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, isStaffUser } from "@/src/lib/inkstone-api";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

/**
 * Client-side route protection guard.
 * Wraps protected page contents to ensure unauthorized users are immediately redirected.
 */
export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const logged = isLoggedIn();

    if (!logged) {
      setIsAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireAdmin) {
      const staff = isStaffUser();
      if (!staff) {
        setIsAuthorized(false);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}&error=Admin+privileges+required`);
        return;
      }
    }

    setIsAuthorized(true);
  }, [pathname, requireAdmin, router]);

  // While checking auth status, show clean minimal loading screen
  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-[#ffea00]" />
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

