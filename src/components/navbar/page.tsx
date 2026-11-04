"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import {
  LuSparkles,
  LuGem,
  LuCompass,
  LuWand,
  LuShoppingBag,
  LuHeart,
  LuSmile,
  LuPackage,
  LuLogOut,
  LuMenu,
  LuX,
  LuChevronDown,
  LuArrowUpRight,
  LuShieldCheck,
} from "react-icons/lu";
import { RiChatSmile2Line, RiMailSendLine } from "react-icons/ri";
import { useRouteTransition } from "@/src/components/route-transition/RouteTransitionProvider";
import { logout, getLocalCart, getLocalWishlist } from "@/src/lib/inkstone-api";
import inkstone from "../../../public/is.png";
import { BsFlower2 } from "react-icons/bs";
import { PiFlowerFill } from "react-icons/pi";


type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/about", label: "About", icon: LuCompass, accentColor: "hover:text-sky-500" },
  { href: "/product", label: "Crystals", icon: LuGem, accentColor: "hover:text-amber-500" },
  { href: "/service", label: "Services", icon: LuWand, accentColor: "hover:text-purple-500" },
  { href: "/customer-stories", label: "Stories", icon: RiChatSmile2Line, accentColor: "hover:text-emerald-500" },
  { href: "/contact", label: "Contact", icon: RiMailSendLine, accentColor: "hover:text-rose-500" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { navigate } = useRouteTransition();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{
    user_id?: string;
    email?: string;
    name?: string;
    is_staff?: boolean;
  } | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuRendered, setIsMobileMenuRendered] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isClosingRef = useRef(false);

  // Sync auth state
  const syncAuthState = useCallback(() => {
    const hasToken = Boolean(localStorage.getItem("inkstone_access"));
    setIsLoggedIn(hasToken);
    if (hasToken) {
      try {
        const stored = localStorage.getItem("inkstone_user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // Sync live cart & wishlist counts
  const syncCounts = useCallback(() => {
    try {
      const cart = getLocalCart();
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }

    try {
      const wishlist = getLocalWishlist();
      setWishlistCount(wishlist.length);
    } catch {
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    syncAuthState();
    syncCounts();

    const handleAuthChange = () => syncAuthState();
    const handleCartChange = () => syncCounts();
    const handleWishlistChange = () => syncCounts();

    window.addEventListener("inkstone-auth-change", handleAuthChange);
    window.addEventListener("inkstone-cart-change", handleCartChange);
    window.addEventListener("inkstone-cart-added", handleCartChange);
    window.addEventListener("inkstone-wishlist-change", handleWishlistChange);

    return () => {
      window.removeEventListener("inkstone-auth-change", handleAuthChange);
      window.removeEventListener("inkstone-cart-change", handleCartChange);
      window.removeEventListener("inkstone-cart-added", handleCartChange);
      window.removeEventListener("inkstone-wishlist-change", handleWishlistChange);
    };
  }, [syncAuthState, syncCounts]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  // ── GSAP Ultra-Smooth Mobile Drawer Animations ──────────────────────────────
  const openMobileMenu = useCallback(() => {
    if (isClosingRef.current) return;
    setIsMobileMenuRendered(true);
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback((afterClose?: () => void) => {
    if (isClosingRef.current || !drawerPanelRef.current) {
      setIsMobileMenuOpen(false);
      setIsMobileMenuRendered(false);
      afterClose?.();
      return;
    }

    isClosingRef.current = true;
    tlRef.current?.kill();

    const items = drawerPanelRef.current.querySelectorAll(".mobile-nav-stagger");
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        isClosingRef.current = false;
        setIsMobileMenuOpen(false);
        setIsMobileMenuRendered(false);
        document.body.style.overflow = "";
        afterClose?.();
      },
    });
    tlRef.current = tl;

    // Fast reverse stagger out
    if (items.length > 0) {
      tl.to(Array.from(items).reverse(), {
        autoAlpha: 0,
        x: 14,
        duration: 0.16,
        stagger: 0.015,
        ease: "power2.in",
      });
    }

    // Panel slide out to right
    tl.to(
      drawerPanelRef.current,
      {
        xPercent: 100,
        duration: 0.26,
        ease: "power3.in",
      },
      items.length > 0 ? "-=0.08" : 0
    );

    // Backdrop fade out
    if (backdropRef.current) {
      tl.to(
        backdropRef.current,
        {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        "-=0.18"
      );
    }
  }, []);

  // Trigger GSAP entrance animation when drawer is mounted
  useEffect(() => {
    if (!isMobileMenuRendered || !drawerPanelRef.current) return;

    isClosingRef.current = false;
    document.body.style.overflow = "hidden";
    tlRef.current?.kill();

    const items = drawerPanelRef.current.querySelectorAll(".mobile-nav-stagger");

    // Immediate initial positions
    gsap.set(backdropRef.current, { autoAlpha: 0 });
    gsap.set(drawerPanelRef.current, { xPercent: 100 });
    if (items.length > 0) {
      gsap.set(items, { autoAlpha: 0, x: 20 });
    }

    // Smooth snappy entrance timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    tl.to(backdropRef.current, {
      autoAlpha: 1,
      duration: 0.24,
      ease: "power2.out",
    })
      .to(
        drawerPanelRef.current,
        {
          xPercent: 0,
          duration: 0.32,
          ease: "power3.out",
        },
        "-=0.16"
      );

    if (items.length > 0) {
      tl.to(
        items,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.26,
          stagger: 0.024,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        },
        "-=0.18"
      );
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuRendered, closeMobileMenu]);

  const isDarkHero = pathname === "/" && !isScrolled;

  function handleDesktopNavigate(href: string) {
    setIsProfileOpen(false);
    if (!user && (href.startsWith("/dashboard") || href.startsWith("/admin") || href.startsWith("/checkout"))) {
      navigate(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    navigate(href);
  }

  function handleMobileNavigate(href: string) {
    closeMobileMenu(() => {
      if (!user && (href.startsWith("/dashboard") || href.startsWith("/admin") || href.startsWith("/checkout"))) {
        navigate(`/login?redirect=${encodeURIComponent(href)}`);
        return;
      }
      navigate(href);
    });
  }

  function handleDesktopLogout() {
    setIsProfileOpen(false);
    logout();
    navigate("/");
  }

  function handleMobileLogout() {
    closeMobileMenu(() => {
      logout();
      navigate("/");
    });
  }

  return (
    <>
      {/* ── Fixed Desktop & Mobile Header Bar ───────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-4 transition-all duration-300">
        <div
          className={`mx-auto max-w-6xl transition-all duration-300 rounded-full ${
            isDarkHero
              ? "bg-transparent border border-white/10 text-white shadow-[0_10px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              : "bg-white/90 border border-neutral-200/80 text-neutral-900 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl"
          }`}
        >
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
            {/* ── Brand Logo ── */}
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleDesktopNavigate("/");
              }}
              className="flex items-center gap-2 group outline-none"
              aria-label="InkStone Home"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 overflow-hidden rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Image
                  src={inkstone}
                  alt="InkStone"
                  className="w-full h-full object-contain p-1"
                  priority
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-lg sm:text-xl font-bold tracking-tight logo-font transition-colors duration-200 ${
                    isDarkHero ? "text-white" : "text-neutral-950"
                  }`}
                >
                  InkStone
                </span>
                
              </div>
            </Link>

            {/* ── Center Desktop Links with Cute React-Icons ── */}
            <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDesktopNavigate(item.href);
                    }}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 outline-none hover:scale-105 active:scale-95 ${
                      isDarkHero
                        ? isActive
                          ? "bg-white text-neutral-950 shadow-sm"
                          : "text-neutral-300 hover:text-white hover:bg-white/10"
                        : isActive
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-white/80"
                    }`}
                  >
                    <Icon className={`text-sm ${isActive ? "scale-110" : "opacity-80"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Actions (Wishlist, Cart, Profile) ── */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Cute Wishlist Button */}
              <Link
                href="/dashboard/wishlist"
                onClick={(e) => {
                  e.preventDefault();
                  handleDesktopNavigate("/dashboard/wishlist");
                }}
                className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isDarkHero
                    ? "text-neutral-200 hover:text-rose-300 hover:bg-rose-500/20"
                    : "text-neutral-700 hover:text-rose-500 hover:bg-rose-50"
                }`}
                aria-label={`Wishlist with ${wishlistCount} saved crystals`}
              >
                <LuHeart className="text-lg" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black shadow-xs animate-in zoom-in-50">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cute Cart Button */}
              <Link
                href="/dashboard/cart"
                onClick={(e) => {
                  e.preventDefault();
                  handleDesktopNavigate("/dashboard/cart");
                }}
                className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isDarkHero
                    ? "text-neutral-200 hover:text-amber-300 hover:bg-amber-400/20"
                    : "text-neutral-700 hover:text-amber-700 hover:bg-amber-50"
                }`}
                aria-label={`Cart with ${cartCount} items`}
              >
                <LuShoppingBag className="text-lg" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#ffea00] text-neutral-950 text-[9px] font-black shadow-xs animate-in zoom-in-50">
                    {cartCount}
                  </span>
                )}
              </Link>

              <span
                className={`hidden md:block h-4 w-px mx-1 ${
                  isDarkHero ? "bg-white/15" : "bg-neutral-200"
                }`}
              />

              {/* ── User Authentication (Desktop) ── */}
              {isLoggedIn ? (
                <div className="relative hidden md:block" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 outline-none hover:scale-105 active:scale-95 ${
                      isDarkHero
                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                        : "bg-amber-50 hover:bg-amber-100/70 text-neutral-900 border border-amber-200/60 shadow-xs"
                    }`}
                    aria-expanded={isProfileOpen}
                    aria-label="User Account Menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ffea00] text-neutral-950 font-black flex items-center justify-center text-[10px] shadow-xs">
                      {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <span className="max-w-[85px] truncate font-medium">
                      {user?.name?.split(" ")[0] || "Account"}
                    </span>
                    <LuChevronDown
                      className={`text-xs transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Cute Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white border border-neutral-200/80 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2.5 text-neutral-900 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                      {/* User Header */}
                      <div className="px-3 py-2.5 bg-neutral-50 rounded-2xl mb-1.5 border border-neutral-100 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#ffea00] text-neutral-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-neutral-950 truncate">
                              {user?.name || "Customer"}
                            </p>
                            {user?.is_staff && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <div className="space-y-0.5 text-xs font-semibold text-neutral-700">
                        {user?.is_staff && (
                          <Link
                            href="/admin"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDesktopNavigate("/admin");
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-amber-950 bg-amber-50 hover:bg-amber-100/90 transition-colors"
                          >
                            <LuShieldCheck className="text-amber-600 text-base" />
                            <span>Control Room</span>
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDesktopNavigate("/dashboard");
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        >
                          <LuSmile className="text-neutral-400 text-base" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/dashboard/orders"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDesktopNavigate("/dashboard/orders");
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        >
                          <LuPackage className="text-neutral-400 text-base" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/dashboard/wishlist"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDesktopNavigate("/dashboard/wishlist");
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <LuHeart className="text-rose-400 text-base" />
                            <span>Saved Crystals</span>
                          </span>
                          {wishlistCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/dashboard/cart"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDesktopNavigate("/dashboard/cart");
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <LuShoppingBag className="text-amber-500 text-base" />
                            <span>My Cart</span>
                          </span>
                          {cartCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="h-px bg-neutral-100 my-1" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleDesktopLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <PiFlowerFill className="text-base" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDesktopNavigate("/login")}
                  className={`hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 outline-none hover:scale-105 active:scale-95 ${
                    isDarkHero
                      ? "bg-white text-neutral-950 hover:bg-neutral-100 shadow-sm"
                      : "bg-neutral-950 text-white hover:bg-neutral-800 shadow-sm"
                  }`}
                >
                  <PiFlowerFill className="text-amber-400 text-xs" />
                  <span>Sign In</span>
                </button>
              )}

              {/* ── Mobile Menu Toggle ── */}
              <button
                type="button"
                onClick={() => {
                  if (isMobileMenuOpen) {
                    closeMobileMenu();
                  } else {
                    openMobileMenu();
                  }
                }}
                className={`md:hidden flex items-center justify-center w-9 h-9 rounded-full transition-transform active:scale-90 ${
                  isDarkHero
                    ? "text-white bg-white/10 hover:bg-white/20"
                    : "text-neutral-900 bg-neutral-100 hover:bg-neutral-200"
                }`}
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <LuX className="text-lg" /> : <LuMenu className="text-lg" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Cute Mobile Slide-in Drawer with Ultra-Smooth GSAP Stagger ──────── */}
      {isMobileMenuRendered && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop with GSAP Fade */}
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs cursor-pointer"
            onClick={() => closeMobileMenu()}
            aria-hidden="true"
          />

          {/* Drawer Content with GSAP Slide and Staggered Children */}
          <div
            ref={drawerPanelRef}
            className="fixed inset-y-0 right-0 z-[101] w-[86vw] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto rounded-l-3xl"
          >
            {/* Drawer Header (Stagger Item 0) */}
            <div className="mobile-nav-stagger px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-amber-50/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-amber-200 flex items-center justify-center overflow-hidden">
                  <Image src={inkstone} alt="InkStone" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold logo-font text-neutral-950">
                    InkStone
                  </span>
                  <LuSparkles className="text-amber-400 text-xs" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => closeMobileMenu()}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors shadow-xs"
                aria-label="Close menu"
              >
                <LuX className="text-lg" />
              </button>
            </div>

            {/* Drawer Body with Staggered Navigation Items */}
            <div className="flex-1 px-5 py-5 space-y-6 overflow-y-auto">
              {/* Primary Links */}
              <div>
                <p className="mobile-nav-stagger text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <LuGem className="text-amber-500 text-xs" />
                  <span>Explore Crystals</span>
                </p>
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileNavigate(item.href);
                        }}
                        className={`mobile-nav-stagger flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`text-base ${isActive ? "text-amber-400" : "text-neutral-400"}`} />
                          <span>{item.label}</span>
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#ffea00] shadow-xs" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Account Section */}
              <div className="pt-2 border-t border-neutral-100">
                <p className="mobile-nav-stagger text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <LuHeart className="text-rose-500 text-xs" />
                  <span>Your Account</span>
                </p>

                {isLoggedIn ? (
                  <div className="space-y-3">
                    {/* User Card */}
                    <div className="mobile-nav-stagger flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                      <div className="w-9 h-9 rounded-full bg-[#ffea00] text-black font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                        {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-neutral-950 truncate">
                            {user?.name || "Customer"}
                          </p>
                          {user?.is_staff && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                      {user?.is_staff && (
                        <Link
                          href="/admin"
                          onClick={(e) => {
                            e.preventDefault();
                            handleMobileNavigate("/admin");
                          }}
                          className="mobile-nav-stagger flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold bg-amber-100/70 text-amber-950 border border-amber-200/80"
                        >
                          <span className="flex items-center gap-3">
                            <LuShieldCheck className="text-base text-amber-800" />
                            <span>Admin Control Room</span>
                          </span>
                          <LuArrowUpRight className="text-xs text-amber-800" />
                        </Link>
                      )}

                      <Link
                        href="/dashboard"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileNavigate("/dashboard");
                        }}
                        className="mobile-nav-stagger flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      >
                        <span className="flex items-center gap-3">
                          <LuSmile className="text-base text-neutral-400" />
                          <span>My Profile</span>
                        </span>
                      </Link>

                      <Link
                        href="/dashboard/orders"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileNavigate("/dashboard/orders");
                        }}
                        className="mobile-nav-stagger flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      >
                        <span className="flex items-center gap-3">
                          <LuPackage className="text-base text-neutral-400" />
                          <span>My Orders</span>
                        </span>
                      </Link>

                      <Link
                        href="/dashboard/wishlist"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileNavigate("/dashboard/wishlist");
                        }}
                        className="mobile-nav-stagger flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      >
                        <span className="flex items-center gap-3">
                          <LuHeart className="text-base text-rose-400" />
                          <span>Saved Wishlist</span>
                        </span>
                        {wishlistCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/dashboard/cart"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileNavigate("/dashboard/cart");
                        }}
                        className="mobile-nav-stagger flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                      >
                        <span className="flex items-center gap-3">
                          <LuShoppingBag className="text-base text-amber-500" />
                          <span>Shopping Cart</span>
                        </span>
                        {cartCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffea00] text-black">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Sign out */}
                    <button
                      type="button"
                      onClick={handleMobileLogout}
                      className="mobile-nav-stagger w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-2"
                    >
                      <span className="flex items-center gap-3">
                        <LuLogOut className="text-base" />
                        <span>Sign Out</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="mobile-nav-stagger text-xs text-neutral-500 leading-relaxed mb-3">
                      Sign in to view your orders, save bespoke crystal keepsakes, and checkout securely. ✨
                    </p>
                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("/login")}
                      className="mobile-nav-stagger w-full py-3 px-4 rounded-2xl bg-neutral-950 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm hover:bg-neutral-800 transition-colors"
                    >
                      <PiFlowerFill className="text-amber-400 text-xs" />
                      <span>Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("/register")}
                      className="mobile-nav-stagger w-full py-3 px-4 rounded-2xl border border-neutral-200 text-neutral-800 text-xs font-bold hover:bg-neutral-50 transition-colors"
                    >
                      Create Account 🌸
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer (Stagger Item Last) */}
            <div className="mobile-nav-stagger px-5 py-3 border-t border-neutral-100 text-center bg-neutral-50/50 shrink-0">
              <p className="text-[11px] text-neutral-400 font-medium">
                InkStone Studio • Handcrafted with love & optical crystals 💎✨
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
