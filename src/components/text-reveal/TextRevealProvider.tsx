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
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

type RevealMode = "words" | "chars";
type RevealKind = "hero" | "heading" | "paragraph" | "button" | "nav" | "text";

type RevealInstance = {
  split: SplitType;
  trigger?: ScrollTrigger;
  animation: gsap.core.Tween;
};

type TextRevealContextValue = {
  refresh: () => void;
};

const TextRevealContext = createContext<TextRevealContextValue | null>(null);

const TEXT_NODE_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,a,button,li,span,div,[data-text-reveal]";
const SKIP_SELECTOR =
  "script,style,svg,path,video,img,picture,canvas,input,textarea,select,option,br,[aria-hidden='true'],[data-text-reveal-skip]";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasReadableTextNode(element: Element) {
  return Array.from(element.childNodes).some(
    (node) =>
      node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
}

function shouldPrepareTextNode(node: Node) {
  const parent = node.parentElement;
  const text = node.textContent;

  if (!parent || !text?.trim()) return false;
  if (parent.closest(SKIP_SELECTOR)) return false;
  if (parent.hasAttribute("data-text-reveal")) return false;
  if (parent.closest("[data-text-reveal-piece]")) return false;
  if (!parent.matches(TEXT_NODE_SELECTOR)) return false;

  return true;
}

function wrapLooseTextNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      shouldPrepareTextNode(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  const textNodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  textNodes.forEach((node) => {
    const parent = node.parentElement;

    if (!parent || !node.textContent?.trim()) return;

    const wrapper = document.createElement("span");
    wrapper.dataset.textReveal = "auto";
    wrapper.dataset.textRevealPiece = "true";
    wrapper.textContent = node.textContent;
    parent.replaceChild(wrapper, node);
  });
}

function getRevealKind(element: HTMLElement): RevealKind {
  if (element.dataset.textRevealKind) {
    return element.dataset.textRevealKind as RevealKind;
  }

  const owner = element.closest("h1,h2,h3,h4,h5,h6,p,a,button,header");

  if (owner?.closest("header")) return "nav";
  if (owner?.tagName === "H1") return "hero";
  if (owner?.matches("h2,h3,h4,h5,h6")) return "heading";
  if (owner?.tagName === "P") return "paragraph";
  if (owner?.tagName === "BUTTON" || owner?.tagName === "A") return "button";

  return "text";
}

function getRevealMode(element: HTMLElement, kind: RevealKind): RevealMode {
  const configuredMode = element.dataset.textRevealMode;

  if (configuredMode === "chars" || configuredMode === "words") {
    return configuredMode;
  }

  return kind === "hero" ? "chars" : "words";
}

function getRevealTargets(split: SplitType, mode: RevealMode) {
  return mode === "chars" ? split.chars ?? [] : split.words ?? [];
}

function animateElement(element: HTMLElement, index: number) {
  const kind = getRevealKind(element);
  const mode = getRevealMode(element, kind);
  const split = new SplitType(element, {
    types: mode === "chars" ? "words,chars" : "words",
    tagName: "span",
    wordClass: "text-reveal-word",
    charClass: "text-reveal-char",
    splitClass: "text-reveal-split",
  });
  const targets = getRevealTargets(split, mode);

  if (targets.length === 0) {
    split.revert();
    return null;
  }

  gsap.set(targets, {
    autoAlpha: 0,
    yPercent: kind === "button" ? 55 : 100,
    filter: "blur(8px)",
    force3D: true,
    willChange: "transform, opacity, filter",
  });

  const tweenVars: gsap.TweenVars = {
    autoAlpha: 1,
    yPercent: 0,
    filter: "blur(0px)",
    duration: kind === "paragraph" ? 0.82 : 0.9,
    ease: kind === "paragraph" ? "power4.out" : "expo.out",
    stagger: mode === "chars" ? 0.018 : kind === "paragraph" ? 0.026 : 0.04,
    delay: kind === "button" ? 0.12 : kind === "nav" ? index * 0.035 : 0,
    clearProps: "willChange",
    paused: kind !== "nav",
  };

  if (kind === "nav") {
    const animation = gsap.to(targets, tweenVars);
    return { split, animation };
  }

  const animation = gsap.to(targets, tweenVars);
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: "top 80%",
    end: "bottom 20%",
    once: true,
    animation,
  });

  return { split, trigger, animation };
}

export default function TextRevealProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const instancesRef = useRef<RevealInstance[]>([]);
  const contextRef = useRef<gsap.Context | null>(null);
  const hasAnimatedNavRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    contextRef.current?.revert();
    contextRef.current = null;

    instancesRef.current.forEach(({ animation, trigger, split }) => {
      trigger?.kill();
      animation.kill();
      split.revert();
    });
    instancesRef.current = [];
  }, []);

  const refresh = useCallback(() => {
    cleanup();

    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const root = document.body;

      contextRef.current = gsap.context(() => {
        wrapLooseTextNodes(root);

        const candidates = Array.from(
          root.querySelectorAll<HTMLElement>("[data-text-reveal]"),
        ).filter((element) => {
          if (!element.textContent?.trim()) return false;
          if (element.closest(SKIP_SELECTOR)) return false;
          if (!hasReadableTextNode(element)) return false;
          if (element.closest("header") && hasAnimatedNavRef.current) {
            return false;
          }

          return true;
        });

        instancesRef.current = candidates
          .map((element, index) => animateElement(element, index))
          .filter((instance): instance is RevealInstance => Boolean(instance));

        if (!hasAnimatedNavRef.current) {
          hasAnimatedNavRef.current = true;
        }

        ScrollTrigger.refresh();
      }, root);
    });
  }, [cleanup]);

  useEffect(() => {
    refresh();

    return cleanup;
  }, [cleanup, pathname, refresh]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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
