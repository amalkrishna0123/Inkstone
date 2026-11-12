"use client";

import { useEffect, useRef, useState } from "react";
import { api, ScratchCard } from "@/src/lib/inkstone-api";
import { TbSparkles, TbCopy, TbCheck } from "react-icons/tb";
import { FiGift } from "react-icons/fi";

export default function ScratchCardComponent({
  card,
  onRevealed,
}: {
  card: ScratchCard;
  onRevealed?: (couponCode: string, discount: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(card.is_scratched);
  const [scratchPercent, setScratchPercent] = useState(card.is_scratched ? 100 : 0);
  const [copied, setCopied] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw scratch foil gradient
    const width = canvas.width;
    const height = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#d4af37");
    grad.addColorStop(0.3, "#f3e5ab");
    grad.addColorStop(0.5, "#c5a059");
    grad.addColorStop(0.7, "#f9f1d0");
    grad.addColorStop(1, "#b38728");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add metallic pattern / label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ SCRATCH TO REVEAL ✨", width / 2, height / 2 - 8);

    ctx.font = "11px -apple-system, sans-serif";
    ctx.fillStyle = "#5a430b";
    ctx.fillText("Exclusive Discount Inside", width / 2, height / 2 + 12);
  }, [isScratched]);

  const scratch = (clientX: number, clientY: number) => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    // Calculate scratched area percentage approximately
    setScratchPercent((prev) => {
      const next = prev + 5;
      if (next >= 45 && !isScratched) {
        handleReveal();
      }
      return next;
    });
  };

  const handleReveal = async () => {
    if (isScratched) return;
    setIsScratched(true);
    setScratchPercent(100);

    // Call API to claim and persist in Firestore
    try {
      await api.claimScratchCard(card.id);
      if (onRevealed) {
        onRevealed(card.coupon_code, card.discount_percent);
      }
    } catch (err) {
      console.warn("Claim scratch card warning:", err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(card.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm rounded-3xl border-2 border-[#ffea00] bg-gradient-to-b from-[#1c1f16] to-[#0c0e0a] p-5 text-white shadow-xl overflow-hidden">
      {/* Sparkles tag */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffea00]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ffea00] border border-[#ffea00]/40">
          <TbSparkles /> {card.event_name || "Special Reward"}
        </span>
        <span className="text-xs font-semibold text-neutral-400">First Order Gift</span>
      </div>

      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center border border-white/10">
        {/* Revealed Content underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1a2312] to-[#0a1208]">
          <span className="text-3xl font-black tracking-tight text-[#ffea00]">
            {card.discount_percent}% OFF
          </span>
          <p className="mt-0.5 text-xs text-neutral-300">Your Exclusive Discount Coupon</p>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/60 px-4 py-2 border border-[#ffea00]/50 backdrop-blur-sm">
            <span className="font-mono text-sm font-black tracking-widest text-white">
              {card.coupon_code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy Coupon Code"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ffea00] text-black hover:bg-white transition cursor-pointer"
            >
              {copied ? <TbCheck className="text-xs" /> : <TbCopy className="text-xs" />}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-emerald-400 font-semibold">
            {copied ? "Coupon copied! Paste it during checkout." : "Apply this code during checkout for instant discount."}
          </p>
        </div>

        {/* Scratchable Canvas Overlay */}
        {!isScratched && (
          <canvas
            ref={canvasRef}
            width={340}
            height={176}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none z-10 transition-opacity duration-300"
            onMouseDown={() => (isDrawing.current = true)}
            onMouseUp={() => (isDrawing.current = false)}
            onMouseLeave={() => (isDrawing.current = false)}
            onMouseMove={(e) => {
              if (isDrawing.current) scratch(e.clientX, e.clientY);
            }}
            onTouchStart={() => (isDrawing.current = true)}
            onTouchEnd={() => (isDrawing.current = false)}
            onTouchMove={(e) => {
              if (isDrawing.current && e.touches[0]) {
                scratch(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
          />
        )}
      </div>

      {!isScratched ? (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">Scratch the gold foil with your cursor</span>
          <button
            type="button"
            onClick={handleReveal}
            className="text-[11px] font-bold text-[#ffea00] underline hover:text-white cursor-pointer"
          >
            Auto-Reveal
          </button>
        </div>
      ) : (
        <div className="mt-3 text-center">
          <p className="text-xs font-semibold text-neutral-300">
            Saved to your account! You can use this coupon on your next crystal purchase.
          </p>
        </div>
      )}
    </div>
  );
}

