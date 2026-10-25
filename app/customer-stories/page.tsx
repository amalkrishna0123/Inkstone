import type { Metadata } from "next";
import Link from "next/link";
import CustomerStories from "@/src/components/home/customer stories/page";
import { FaArrowLeft, FaUsers, FaFire, FaRegClock, FaInstagram } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Customer Stories | Crystal - From Moment to Journal",
  description:
    "Explore authentic customer moments, daily hydration rituals, and real athletic journeys powered by Crystal natural elixirs.",
};

export default function CustomerStoriesPage() {
  return (
    <main className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Top Banner Navigation */}
      <div className="border-b border-neutral-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <FaArrowLeft className="text-xs" /> Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Live Customer Journal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-neutral-700">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-neutral-500">
              <FaInstagram className="text-sm text-[#f25822]" /> #CrystalStories
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Customer Story Reference Component */}
      <div className="py-6">
        <CustomerStories isStandalonePage={true} />
      </div>

      {/* Highlights & Community Metrics Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffea00]/30 text-neutral-900 flex items-center justify-center text-xl">
              <FaUsers />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">4,800+</p>
              <p className="text-xs text-neutral-500 font-medium">Stories Recorded</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fff1eb] text-[#f25822] flex items-center justify-center text-xl">
              <FaFire />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">5.0 Sec</p>
              <p className="text-xs text-neutral-500 font-medium">Auto Continuous Loop</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-700 flex items-center justify-center text-xl">
              <FaRegClock />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">24 / 7</p>
              <p className="text-xs text-neutral-500 font-medium">Uninterrupted Playback</p>
            </div>
          </div>
        </div>

        {/* Community Guidelines Card */}
        <div className="mt-8 p-6 rounded-3xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold">Have a story to share?</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Connect your email in the story viewer above to sync your profile picture and share your daily Crystal wellness moment with our global community.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#ffea00] text-black font-bold text-xs hover:bg-[#ffe100] transition-colors whitespace-nowrap shadow-md"
          >
            Explore Catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
