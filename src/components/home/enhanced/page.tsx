"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const enhancedImages = [
  {
    src: "https://i5.walmartimages.com/seo/Personalized-3D-Crystal-Photo-Custom-Photo-Light-Base-Laser-Etched-Inside-Crystal-Glass-Picture-Cube-Gift-Idea-Engraved-Gifts-Box-Size-Large_583d292f-f944-4a7e-9dbb-3c63fd7dc37a.7186881b040fe10af0eb537344ca26c9.jpeg",
    alt: "Personalized 3D crystal photo cube on a light base",
    rotation: 6,
  },
  {
    src: "https://m.media-amazon.com/images/I/71FpTy9kMgL._AC_SL1500_.jpg",
    alt: "Laser etched crystal portrait keepsake",
    rotation: -6,
  },
  {
    src: "https://www.crystify.com.au/cdn/shop/files/3d_crystal_iceberg_photo-gift.webp?v=1742984027&width=3200",
    alt: "Iceberg shaped 3D crystal photo gift",
    rotation: 3,
  },
  {
    src: "https://www.crystify.com.au/cdn/shop/files/Crystal_Picture_Frame_Diamond_Cut-Plastic_LED_Base.webp?v=1752105330&width=1445",
    alt: "Diamond cut crystal picture frame on LED base",
    rotation: -3,
  },
  {
    src: "https://i.pinimg.com/originals/25/b1/8c/25b18ca824063d2ab499ca0d04131e13.jpg",
    alt: "Crystal photo display with engraved portrait",
    rotation: 0,
  },
];

const Enhanced = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const images = imageRefs.current.filter(Boolean);

    if (!section || images.length === 0) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(images, {
        force3D: true,
        transformOrigin: "50% 55%",
        willChange: "transform, clip-path, filter",
      });

      images.forEach((image, index) => {
        const rotation = enhancedImages[index]?.rotation ?? 0;

        gsap.set(image, {
          zIndex: index + 1,
          rotate: rotation,
          scale: index === 0 ? 1 : 0.94,
          yPercent: index === 0 ? 0 : 9,
          autoAlpha: index === 0 ? 1 : 0,
          clipPath:
            index === 0
              ? "inset(0% 0% 0% 0% round 0px)"
              : "inset(100% 0% 0% 0% round 18px)",
          webkitClipPath:
            index === 0
              ? "inset(0% 0% 0% 0% round 0px)"
              : "inset(100% 0% 0% 0% round 18px)",
          filter: index === 0 ? "brightness(1)" : "brightness(1.08) blur(8px)",
        });
      });

      if (reduceMotion || images.length === 1) {
        gsap.set(images, {
          autoAlpha: 1,
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          webkitClipPath: "inset(0% 0% 0% 0% round 18px)",
          filter: "brightness(1) blur(0px)",
          scale: 1,
          yPercent: 0,
        });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
          scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${(images.length - 1) * window.innerHeight}`,
              pin: true,
              pinSpacing: true, // <- important
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
          }
      });

      images.slice(1).forEach((image, revealIndex) => {
        const previousImages = images.slice(0, revealIndex + 1);

        timeline
          .to(
            previousImages,
            {
              scale: 0.965,
              yPercent: -1.5,
              filter: "brightness(0.72) blur(1px)",
              duration: 0.35,
              stagger: 0.025,
            },
            revealIndex,
          )
          .to(
            image,
            {
              autoAlpha: 1,
              clipPath: "inset(0% 0% 0% 0% round 0px)",
              webkitClipPath: "inset(0% 0% 0% 0% round 18px)",
              scale: 1,
              yPercent: 0,
              filter: "brightness(1) blur(0px)",
              duration: 0.78,
            },
            revealIndex + 0.08,
          )
          .to(
            image,
            {
              boxShadow: "0 28px 90px rgba(0, 0, 0, 0.28)",
              duration: 0.35,
            },
            revealIndex + 0.2,
          );
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <div className="w-full overflow-x-hidden flex flex-col items-center justify-center">
      <section className="w-full h-screen flex items-center justify-center text-center px-6">
        <h2 className="text-[40px] leading-tight md:text-6xl tracking-[-3px]">
          Turn your memories into 
          <span className="text-[#ffea00] text-shadow-[#60606009] text-shadow-2xs">
            {" "}
            timeless treasures
          </span>
        </h2>
      </section>

      <section ref={sectionRef} className="h-[100svh] w-full">
        <div className="relative h-full flex flex-col items-center justify-center">
          {enhancedImages.map((image, index) => (
            <div
              key={image.src}
              ref={(node) => {
                if (node) imageRefs.current[index] = node;
              }}
              className="absolute h-[46svh] min-h-[300px] max-h-[620px] w-[85vw] max-w-[760px] overflow-hidden bg-neutral-100 shadow-2xl md:h-[56svh] md:w-[42vw]"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Enhanced;
