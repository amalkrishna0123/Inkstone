"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type RouteTransitionContextValue = {
  navigate: (href: string) => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(
  null,
);

const TRANSITION_DURATION = 620;
const TRANSITION_EASING = "cubic-bezier(0.76, 0, 0.24, 1)";

/**
 * Covers the viewport during App Router navigations so the current page stays
 * completely still while the next route loads behind the overlay.
 */
export default function RouteTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const activePathRef = useRef(pathname);
  const pendingPathRef = useRef<string | null>(null);
  const hasMountedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const navigationTimeoutRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  const clearTransitionTimeout = useCallback(
    (timeoutRef: typeof navigationTimeoutRef) => {
      if (timeoutRef.current === null) return;

      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    },
    [],
  );

  const resetOverlay = useCallback(() => {
    const overlay = overlayRef.current;

    if (!overlay) return;

    overlay.style.transition = "none";
    overlay.style.transform = "translate3d(0, 100%, 0)";
    overlay.style.visibility = "hidden";
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const overlay = overlayRef.current;

      if (
        !overlay ||
        isAnimatingRef.current ||
        href === activePathRef.current
      ) {
        return;
      }

      // Respect accessibility preferences: navigation remains instant when
      // the user has asked the operating system to reduce motion.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      isAnimatingRef.current = true;
      pendingPathRef.current = href;

      clearTransitionTimeout(navigationTimeoutRef);
      clearTransitionTimeout(resetTimeoutRef);

      overlay.style.transition = "none";
      overlay.style.transform = "translate3d(0, 100%, 0)";
      overlay.style.visibility = "visible";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = `transform ${TRANSITION_DURATION}ms ${TRANSITION_EASING}`;
          overlay.style.transform = "translate3d(0, 0%, 0)";

          navigationTimeoutRef.current = window.setTimeout(() => {
            navigationTimeoutRef.current = null;
            router.push(href);
          }, TRANSITION_DURATION);
        });
      });
    },
    [clearTransitionTimeout, router],
  );

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      activePathRef.current = pathname;
      resetOverlay();
      return;
    }

    if (pathname === activePathRef.current) return;

    const wasNavbarNavigation = pendingPathRef.current === pathname;
    activePathRef.current = pathname;
    pendingPathRef.current = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      resetOverlay();
      isAnimatingRef.current = false;
      return;
    }

    if (!wasNavbarNavigation) {
      resetOverlay();
      isAnimatingRef.current = false;
      return;
    }

    clearTransitionTimeout(resetTimeoutRef);

    requestAnimationFrame(() => {
      overlay.style.transition = `transform ${TRANSITION_DURATION}ms ${TRANSITION_EASING}`;
      overlay.style.transform = "translate3d(0, -100%, 0)";

      resetTimeoutRef.current = window.setTimeout(() => {
        resetTimeoutRef.current = null;
        resetOverlay();
        isAnimatingRef.current = false;
      }, TRANSITION_DURATION);
    });
  }, [clearTransitionTimeout, pathname, resetOverlay]);

  useEffect(() => {
    return () => {
      clearTransitionTimeout(navigationTimeoutRef);
      clearTransitionTimeout(resetTimeoutRef);
    };
  }, [clearTransitionTimeout]);

  return (
    <RouteTransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998] bg-[#090b08] will-change-transform"
        style={{
          transform: "translate3d(0, 100%, 0)",
          transition: "none",
          visibility: "hidden",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(207,235,0,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[#cfeb00]/75" />
      </div>
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);

  if (!context) {
    throw new Error(
      "useRouteTransition must be used within RouteTransitionProvider.",
    );
  }

  return context;
}
