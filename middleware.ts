import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for route protection.
 * Runs on every incoming request before pages or APIs are rendered.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("inkstone_access")?.value;
  const isStaff = request.cookies.get("inkstone_is_staff")?.value === "true";

  // 1. Admin routes protection (/admin and /admin/*)
  if (pathname.startsWith("/admin")) {
    // If not authenticated or not staff, redirect to login
    if (!token || !isStaff) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "Admin privileges required.");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. User Protected routes: Checkout, Dashboard, Cart, Orders, Wishlist, Attachment upload
  const isUserProtectedRoute =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/thank-you") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/wishlist") ||
    pathname.includes("/attachment");

  if (isUserProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "Please sign in to access this page.");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/payment/:path*",
    "/thank-you/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/product/:id/attachment/:path*",
  ],
};

