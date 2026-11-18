"use client";

import { useEffect, useRef } from "react";
import { GiClover, GiBoxingGlove } from "react-icons/gi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const backVideo = "/vid1.mp4";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const linesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const lines = linesRef.current.filter(Boolean) as HTMLSpanElement[];
    if (lines.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        delay: 0.2,
      });

      // Masked text reveal: Lines slide up from outside their overflow-hidden wrappers
      tl.fromTo(
        lines,
        {
          yPercent: 125,
          autoAlpha: 0,
        },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.15,
          ease: "power4.out",
          stagger: 0.14,
        },
      );

      // Smooth subtle entrance for the side-feature pills accompanying the text
      if (listRef.current) {
        tl.fromTo(
          listRef.current.children,
          {
            y: 12,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: "power3.out",
          },
          "-=0.6",
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="home-hero"
      data-hero-section="true"
      className="relative h-screen bg-black text-white overflow-hidden"
    >
      <div className="absolute inset-0">
        {/* ThreeJS / particles background */}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="absolute inset-0 opacity-50">
          <video
            src={backVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative flex flex-col justify-center mx-auto">
          {/* Main Heading with Masked Line Reveals */}
          <h1
            className="
              text-[clamp(40px,8vw,140px)]
              md:text-[clamp(80px,8vw,140px)]
              leading-[0.95]
              tracking-[-0.06em]
              font-light
              flex flex-col mx-auto
              w-full
            "
          >
            {/* Line 1 Mask Container */}
            <span className="overflow-hidden flex justify-end w-full py-0.5">
              <span
                ref={(el) => {
                  linesRef.current[0] = el;
                }}
                className="hero-reveal-line inline-flex items-center gap-1.5 will-change-transform"
              >
                <span className="text-[#ffea00] md:text-[70px]">
                  <GiClover />
                </span>
                <span>InkStone</span>
              </span>
            </span>

            {/* Line 2 Mask Container */}
            <span className="overflow-hidden block w-full py-0.5">
              <span
                ref={(el) => {
                  linesRef.current[1] = el;
                }}
                className="hero-reveal-line block will-change-transform"
              >
                bringing your
              </span>
            </span>

            {/* Line 3 Mask Container */}
            <span className="overflow-hidden flex justify-end w-full py-0.5">
              <span
                ref={(el) => {
                  linesRef.current[2] = el;
                }}
                className="hero-reveal-line flex gap-3 items-center justify-end w-full will-change-transform"
              >
                <span>memories</span>
                <ul
                  ref={listRef}
                  className="text-[12px] font-normal tracking-normal flex flex-col gap-2"
                >
                  <li>TIMELESS MEMORIES</li>
                  <li>CUSTOM PHOTO FRAMES</li>
                  <li>CUSTOM KEEPSAKES</li>
                  <li>PREMIUM CRYSTAL ART</li>
                </ul>
              </span>
            </span>

            {/* Line 4 Mask Container */}
            <span className="overflow-hidden flex items-end w-full py-0.5">
              <span
                ref={(el) => {
                  linesRef.current[3] = el;
                }}
                className="hero-reveal-line flex gap-2 items-end will-change-transform"
              >
                <span>to life in crystal</span>
                <span className="text-[#ffea00] text-[40px] md:text-[70px]">
                  <GiBoxingGlove />
                </span>
              </span>
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Hero;
