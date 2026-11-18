"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

type SplitInstance = {
  element: HTMLElement;
  split: SplitText;
};

type TextRevealContextValue = {
  refresh: () => void;
};

const TextRevealContext = createContext<TextRevealContextValue | null>(null);

// Skip containers: Home hero has its dedicated masked text reveal; navigation, interactive controls, and media are skipped
const SKIP_CONTAINER_SELECTOR = [
  "#home-hero",
  "[data-hero-section]",
  "nav",
  "header",
  "footer",
  "form",
  "button",
  "svg",
  "canvas",
  "video",
  "iframe",
  "code",
  "pre",
  "[aria-hidden='true']",
  "[data-text-split-skip]",
  "[data-text-reveal-skip]",
  "[data-text-split='false']",
].join(",");

const DISALLOWED_CHILDREN_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "table",
  "form",
  "video",
  "canvas",
  "svg",
  "iframe",
].join(",");

// Target selectors: ALL text elements across all pages
const CANDIDATE_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "[data-text-split]",
  "[data-text-reveal]",
  ".split-text",
  ".text-reveal",
].join(",");

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isElementVisible(el: HTMLElement): boolean {
  if (el.offsetParent === null && window.getComputedStyle(el).position !== "fixed") {
    return false;
  }
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

function canSplitElement(element: HTMLElement): boolean {
  if (element.hasAttribute("data-split-initialized")) return false;
  if (element.closest(SKIP_CONTAINER_SELECTOR)) return false;
  if (element.querySelector(DISALLOWED_CHILDREN_SELECTOR)) return false;

  const text = element.textContent?.trim() || "";
  if (text.length < 2) return false;

  if (!isElementVisible(element)) return false;

  return true;
}

/**
 * Creates a responsive masked text reveal animation on scroll using GSAP SplitText.
 * Each line is wrapped in an overflow-hidden mask container; lines slide up smoothly
 * from outside the mask into view on scroll.
 */
function createMaskedLineSplit(element: HTMLElement): SplitText | null {
  element.setAttribute("data-split-initialized", "true");

  try {
    const isHeading = /H[1-6]/.test(element.tagName);

    const split = SplitText.create(element, {
      type: "lines",
      linesClass: "split-line",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) => {
        if (!self.lines || self.lines.length === 0) return;

        return gsap.from(self.lines, {
          yPercent: 120,
          autoAlpha: 0,
          duration: isHeading ? 1.05 : 0.85,
          stagger: isHeading ? 0.08 : 0.05,
          ease: "power4.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      },
    });

    return split;
  } catch {
    element.removeAttribute("data-split-initialized");
    return null;
  }
}

export default function TextRevealProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const instancesRef = useRef<SplitInstance[]>([]);
  const frameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    instancesRef.current.forEach(({ split, element }) => {
      try {
        element.removeAttribute("data-split-initialized");
        split.revert();
        split.kill();
      } catch {}
    });
    instancesRef.current = [];
  }, []);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;

    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    if (pathname?.startsWith("/admin")) {
      return;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      // Filter out instances whose elements were removed from the DOM
      instancesRef.current = instancesRef.current.filter(({ element, split }) => {
        if (!document.body.contains(element)) {
          try {
            split.revert();
            split.kill();
          } catch {}
          return false;
        }
        return true;
      });

      const root = document.body;

      // Find all eligible text elements (headings, paragraphs, etc.)
      const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(CANDIDATE_SELECTOR),
      ).filter(canSplitElement);

      candidates.forEach((element) => {
        const split = createMaskedLineSplit(element);
        if (split) {
          instancesRef.current.push({ element, split });
        }
      });

      ScrollTrigger.refresh();
    });
  }, [pathname]);

  // Route change lifecycle
  useEffect(() => {
    cleanup();
    refresh();

    // After route transition completes (~650ms), re-scan and refresh ScrollTriggers
    const timer = window.setTimeout(() => {
      refresh();
      ScrollTrigger.refresh();
    }, 700);

    return () => {
      window.clearTimeout(timer);
      cleanup();
    };
  }, [pathname, cleanup, refresh]);

  // Handle custom fonts loading
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }, []);

  // Observe DOM changes to handle dynamically loaded content (e.g., catalog products in /product)
  useEffect(() => {
    if (typeof window === "undefined" || pathname?.startsWith("/admin")) return;

    let debounceTimer: number | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        refresh();
      }, 250);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [pathname, refresh]);

  return (
    <TextRevealContext.Provider value={{ refresh }}>
      {children}
    </TextRevealContext.Provider>
  );
}

export function useTextReveal() {
  const context = useContext(TextRevealContext);

  if (!context) {
    throw new Error("useTextReveal must be used within TextRevealProvider.");
  }

  return context;
}
