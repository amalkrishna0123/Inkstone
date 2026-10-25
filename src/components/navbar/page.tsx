"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuCircleArrowOutUpRight, LuUser, LuHeart, LuShoppingCart, LuWallet, LuTicket, LuPackage, LuLogOut, LuMenu, LuX } from "react-icons/lu";
import { useEffect, useState, useRef } from "react";
import { useRouteTransition } from "@/src/components/route-transition/RouteTransitionProvider";
import { logout } from "@/src/lib/inkstone-api";
import Image from "next/image";
import inkstone from "../../../public/is.png";
import gsap from "gsap";
import { HiInformationCircle } from "react-icons/hi2";
import { GiCrystalShine } from "react-icons/gi";
import { TbCrystalBall } from "react-icons/tb";
import { GrServicePlay } from "react-icons/gr";
import { PiContactlessPaymentBold } from "react-icons/pi";


const navigation = [
  { href: "/about", label: "About", icon: <HiInformationCircle /> },
  { href: "/product", label: "Products", icon: <TbCrystalBall/> },
  { href: "/service", label: "Services", icon: <GrServicePlay/> },
  { href: "/contact", label: "Contact", icon: <PiContactlessPaymentBold/> },
];

const Navbar = () => {
  const pathname = usePathname();
  const { navigate } = useRouteTransition();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLSpanElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileBackdropRef = useRef<HTMLDivElement>(null);
  const mobileMenuItemsRef = useRef<HTMLElement[]>([]);

  const mobileControlClass = `flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none ${
    isScrolled
      ? "bg-neutral-100 text-black hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-black"
      : "bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#cfeb00]"
  }`;

  function setMobileMenuItemRef(element: HTMLElement | null) {
    if (element && !mobileMenuItemsRef.current.includes(element)) {
      mobileMenuItemsRef.current.push(element);
    }
  }

  useEffect(() => {
    const updateAuthState = () => setIsLoggedIn(Boolean(localStorage.getItem("inkstone_access")));
    updateAuthState();
    window.addEventListener("inkstone-auth-change", updateAuthState);
    return () => window.removeEventListener("inkstone-auth-change", updateAuthState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    // Trigger once to set initial state if page is loaded scrolled
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    const logoText = logoTextRef.current;
    if (!header) return;

    if (isScrolled) {
      // Scrolled state
      gsap.to(header, {
        backgroundColor: "#ffffff",
        duration: 0,
        overwrite: "auto",
      });

      gsap.to(header, {
        maxWidth: "800px",
        top: "16px",
        borderRadius: "9999px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "10px",
        paddingBottom: "10px",
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
        borderbottom: "3px solid #ffea00",
      });

      if (logoText) {
        gsap.to(logoText, {
          width: 0,
          opacity: 0,
          marginLeft: 0,
          marginRight: 0,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    } else {
      // Top state
      gsap.to(header, {
        backgroundColor: "transparent",
        duration: 0,
        overwrite: "auto",
      });

      gsap.to(header, {
        maxWidth: "100%",
        top: "0px",
        borderRadius: "0px",
        boxShadow: "none",
        paddingLeft: window.innerWidth >= 768 ? "40px" : "8px",
        paddingRight: window.innerWidth >= 768 ? "40px" : "8px",
        paddingTop: window.innerWidth >= 768 ? "20px" : "8px",
        paddingBottom: window.innerWidth >= 768 ? "20px" : "8px",
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
        borderbottom: "3px solid #ffea00",
      });

      if (logoText) {
        gsap.to(logoText, {
          width: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    }
  }, [isScrolled]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const context = gsap.context(() => {
      gsap.set(mobileBackdropRef.current, { autoAlpha: 0 });
      gsap.set(mobileMenuRef.current, { autoAlpha: 0, y: -18, scale: 0.98 });
      gsap.set(mobileMenuItemsRef.current, { autoAlpha: 0, y: 18 });

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(mobileBackdropRef.current, { autoAlpha: 1, duration: 0.22 })
        .to(mobileMenuRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38 }, "-=0.08")
        .to(mobileMenuItemsRef.current, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.065 }, "-=0.18");
    });

    document.body.style.overflow = "hidden";
    return () => {
      context.revert();
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  function closeMobileMenu(afterClose?: () => void) {
    const completeClose = () => {
      setIsMobileMenuOpen(false);
      afterClose?.();
    };

    if (!mobileMenuRef.current) {
      completeClose();
      return;
    }

    gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: completeClose })
      .to([...mobileMenuItemsRef.current].reverse(), { autoAlpha: 0, y: 14, duration: 0.22, stagger: 0.045 })
      .to(mobileMenuRef.current, { autoAlpha: 0, y: -14, scale: 0.98, duration: 0.24 }, "-=0.08")
      .to(mobileBackdropRef.current, { autoAlpha: 0, duration: 0.18 }, "-=0.12");
  }

  function navigateFromMobile(href: string) {
    closeMobileMenu(() => navigate(href));
  }

  return (
   <header 
     ref={headerRef}
     className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-[9999] flex items-center justify-between px-2 py-2 md:px-10 md:py-5   transition-colors duration-300"
     style={{ borderColor: isScrolled ? "rgba(200, 255, 0, 1) border-b border-[#ffea00]" : "border-[#ffea00] border-b" }}
   >
      <Link
        href="/"
        aria-label="InkStone home"
        onNavigate={(event) => {
          event.preventDefault();
          navigate("/");
        }}
        className="rounded-md font-bold text-2xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#cfeb00]"
      >
        <div className="flex items-center gap-2">
          <Image src={inkstone} alt="inkstone-logo" className="w-auto h-[45px] object-contain"/>
          <span 
            ref={logoTextRef} 
            className="logo-font text-white transition-colors duration-300"
            style={{ 
              overflow: "hidden", 
              display: "inline-block", 
              whiteSpace: "nowrap",
              color: isScrolled ? "#000" : "#fff"
            }}
          >
            InkStone
          </span>
        </div>
      </Link>

      <nav className="hidden md:flex items-center gap-10">
        <ul className="flex items-center gap-10">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onNavigate={(event) => {
                    event.preventDefault();
                    navigate(item.href);
                  }}
                  className={`relative rounded-sm flex items-center gap-2 pb-1 text-sm transition-all duration-300 outline-none after:absolute after:bottom-0 after:left-0 after:h-px after:transition-[width] ${
                    isScrolled
                      ? active
                        ? "text-black after:bg-black after:w-full font-medium"
                        : "text-neutral-600 after:bg-black after:w-0 hover:text-black hover:after:w-full focus-visible:text-black focus-visible:ring-2 focus-visible:ring-black"
                      : active
                        ? "text-white after:bg-[#cfeb00] after:w-full"
                        : "text-[#ffffffc4] after:bg-[#cfeb00] after:w-0 hover:text-white hover:after:w-full focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#cfeb00]"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {isLoggedIn ? (
          <div className="relative group">
            <button
              type="button"
              aria-label="User Profile"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 focus-visible:outline-none ${
                isScrolled
                  ? "bg-neutral-100 text-black hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-black"
                  : "bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#cfeb00]"
              }`}
            >
              <LuUser className="text-lg" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 before:absolute before:inset-x-0 before:-top-4 before:h-4">
              <ul className="flex flex-col gap-1 text-sm font-medium text-neutral-600">
                <li>
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-neutral-100 hover:text-black transition-colors" onClick={() => navigate("/dashboard")}>
                    <LuUser className="text-lg text-neutral-400" /> Profile
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/wishlist" className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-neutral-100 hover:text-black transition-colors" onClick={() => navigate("/dashboard/wishlist")}>
                    <LuHeart className="text-lg text-neutral-400" /> Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/cart" className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-neutral-100 hover:text-black transition-colors" onClick={() => navigate("/dashboard/cart")}>
                    <LuShoppingCart className="text-lg text-neutral-400" /> Cart
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/wallet" className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-neutral-100 hover:text-black transition-colors" onClick={() => navigate("/dashboard/wallet")}>
                    <LuWallet className="text-lg text-neutral-400" /> Wallet
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/coupon" className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-neutral-100 hover:text-black transition-colors" onClick={() => navigate("/dashboard/coupon")}>
                    <LuTicket className="text-lg text-neutral-400" /> Coupon
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-neutral-100 hover:text-black transition-colors" onClick={() => navigate("/dashboard/orders")}>
                    <LuPackage className="text-lg text-neutral-400" /> Orders
                  </Link>
                </li>
                <div className="h-px w-full bg-neutral-100 my-1" />
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <LuLogOut className="text-lg text-red-400" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            type="button"
            aria-label="InkStone login"
            onClick={() => navigate("/login")}
            className={`flex cursor-pointer items-center gap-2 rounded-3xl border px-10 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none ${
              isScrolled
                ? "border-none bg-[#ffea00] text-black hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-black"
                : "border-[#ffffffa4] bg-[#ffea00] text-black focus-visible:ring-2 focus-visible:ring-[#cfeb00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            }`}
          >
            Login <span className="text-black"><LuCircleArrowOutUpRight /></span>
          </button>
        )}
      </nav>

      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          aria-label={isLoggedIn ? "Open profile" : "Log in"}
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
          className={mobileControlClass}
        >
          <LuUser className="text-xl" />
        </button>
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(true)}
          className={mobileControlClass}
        >
          <LuMenu className="text-2xl" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileBackdropRef}
          className="fixed inset-0 z-[10000] bg-black/55 px-4 py-4 backdrop-blur-sm md:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMobileMenu();
          }}
        >
          <div
            ref={mobileMenuRef}
            className="ml-auto flex max-h-[calc(100vh-2rem)] w-full max-w-sm flex-col overflow-y-auto rounded-[28px] border border-white/15 bg-neutral-950 p-4 text-white shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mb-5 flex items-center justify-between">
              <span ref={setMobileMenuItemRef} className="logo-font text-3xl text-white">InkStone</span>
              <button
                ref={setMobileMenuItemRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={() => closeMobileMenu()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cfeb00]"
              >
                <LuX className="text-2xl" />
              </button>
            </div>

            <nav className="space-y-2" aria-label="Mobile navigation links">
              {navigation.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    ref={setMobileMenuItemRef}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateFromMobile(item.href);
                    }}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-[#ffea00] bg-[#ffea00] text-black"
                        : "border-white/10 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-3 text-base font-semibold">
                      <span className="text-xl">{item.icon}</span>
                      {item.label}
                    </span>
                    <LuCircleArrowOutUpRight />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              {(isLoggedIn
                ? [
                    { href: "/dashboard", label: "Profile", icon: <LuUser /> },
                    { href: "/dashboard/wishlist", label: "Wishlist", icon: <LuHeart /> },
                    { href: "/dashboard/cart", label: "Cart", icon: <LuShoppingCart /> },
                    { href: "/dashboard/orders", label: "Orders", icon: <LuPackage /> },
                  ]
                : [{ href: "/login", label: "Login", icon: <LuUser /> }]
              ).map((item) => (
                <Link
                  key={item.href}
                  ref={setMobileMenuItemRef}
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    navigateFromMobile(item.href);
                  }}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg text-[#ffea00]">{item.icon}</span>
                    {item.label}
                  </span>
                  <LuCircleArrowOutUpRight />
                </Link>
              ))}

              {isLoggedIn && (
                <button
                  ref={setMobileMenuItemRef}
                  type="button"
                  onClick={() => {
                    closeMobileMenu(() => {
                      logout();
                      navigate("/");
                    });
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:border-red-300/40 hover:bg-red-500/20"
                >
                  <span className="flex items-center gap-3">
                    <LuLogOut className="text-lg" />
                    Logout
                  </span>
                  <LuCircleArrowOutUpRight />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
   </header>
  );
};

export default Navbar;
