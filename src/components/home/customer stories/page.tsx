"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaHeart, 
  FaPlay, 
  FaPause, 
  FaBell, 
  FaCheck,
  FaPlus,
  FaXmark
} from "react-icons/fa6";
import { FiExternalLink, FiUser } from "react-icons/fi";
import { 
  CustomerProfile, 
  INITIAL_CUSTOMERS, 
  INITIAL_WEEKS, 
  getAvatarFromEmail 
} from "./types";

interface CustomerStoriesProps {
  isStandalonePage?: boolean;
}

export default function CustomerStories({ isStandalonePage = false }: CustomerStoriesProps) {
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [activeWeek, setActiveWeek] = useState("week-48");
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  
  // Set of viewed story IDs to compute seen / unseen customer state
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());

  // Email connection modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [savedUserEmail, setSavedUserEmail] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");

  // Touch / Swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const isHoldPausedRef = useRef(false);

  // 5000ms duration per story
  const STORY_DURATION = 5000;
  const TICK_INTERVAL = 50; // update progress every 50ms

  // Current customer and story
  const currentCustomer = customers[currentCustomerIndex] || customers[0];
  const currentStory = currentCustomer?.stories?.[currentStoryIndex] || currentCustomer?.stories?.[0];

  // Initialize from localStorage (logged in user & viewed stories)
  useEffect(() => {
    try {
      // Check for logged-in auth user
      const storedAuth = localStorage.getItem("inkstone_user");
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed?.email) {
          setSavedUserEmail(parsed.email);
          setUserEmail(parsed.email);
          setUserName(parsed.name || "My Profile");
          setUserAvatarUrl(getAvatarFromEmail(parsed.email, parsed.name));
        }
      } else {
        const customEmail = localStorage.getItem("crystal_connected_email");
        if (customEmail) {
          setSavedUserEmail(customEmail);
          setUserEmail(customEmail);
          const customName = localStorage.getItem("crystal_connected_name") || "Member";
          setUserName(customName);
          setUserAvatarUrl(getAvatarFromEmail(customEmail, customName));
        }
      }

      // Check viewed stories
      const storedViewed = localStorage.getItem("crystal_viewed_stories");
      if (storedViewed) {
        setViewedStoryIds(new Set(JSON.parse(storedViewed)));
      }
    } catch {
      // ignore SSR or storage parse errors
    }
  }, []);

  // Mark current story as viewed
  useEffect(() => {
    if (!currentStory?.id) return;
    setViewedStoryIds((prev) => {
      if (prev.has(currentStory.id)) return prev;
      const next = new Set(prev);
      next.add(currentStory.id);
      try {
        localStorage.setItem("crystal_viewed_stories", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, [currentStory?.id]);

  // Check if a customer has any unseen story
  const hasCustomerUnseenStories = useCallback(
    (customer: CustomerProfile) => {
      if (!customer?.stories?.length) return false;
      return customer.stories.some((s) => !viewedStoryIds.has(s.id));
    },
    [viewedStoryIds]
  );

  // Navigate to Next Story with Infinite Continuous Looping
  const goToNextStory = useCallback(() => {
    setProgress(0);
    const totalStoriesForCustomer = currentCustomer.stories.length;

    if (currentStoryIndex < totalStoriesForCustomer - 1) {
      // Move to next story of same customer
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      // Last story of this customer reached -> move to next customer
      const nextCustIndex = (currentCustomerIndex + 1) % customers.length;
      setCurrentCustomerIndex(nextCustIndex);
      setCurrentStoryIndex(0);
    }
  }, [currentCustomer, currentStoryIndex, currentCustomerIndex, customers.length]);

  // Navigate to Previous Story
  const goToPrevStory = useCallback(() => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else {
      // Jump to previous customer's last story
      const prevCustIndex = (currentCustomerIndex - 1 + customers.length) % customers.length;
      setCurrentCustomerIndex(prevCustIndex);
      const prevCustomer = customers[prevCustIndex];
      setCurrentStoryIndex(Math.max(0, (prevCustomer?.stories?.length || 1) - 1));
    }
  }, [currentStoryIndex, currentCustomerIndex, customers]);

  // Jump directly to customer
  const selectCustomer = (index: number) => {
    setCurrentCustomerIndex(index);
    setCurrentStoryIndex(0);
    setProgress(0);
  };

  // Timer loop for 5-second automatic progression
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = (TICK_INTERVAL / STORY_DURATION) * 100;
        if (prev + step >= 100) {
          goToNextStory();
          return 0;
        }
        return prev + step;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, goToNextStory, STORY_DURATION]);

  // Like toggle
  const toggleLike = (storyId: string) => {
    setLikedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
    setLikeCounts((prev) => {
      const isLiked = !likedStories[storyId];
      const baseLikes = currentStory?.likes ?? 1000;
      const current = prev[storyId] ?? baseLikes;
      return { ...prev, [storyId]: isLiked ? current + 1 : Math.max(0, current - 1) };
    });
  };

  // Press-and-hold pause gesture
  const handleHoldStart = () => {
    if (isPlaying) {
      isHoldPausedRef.current = true;
      setIsPlaying(false);
    }
  };

  const handleHoldEnd = () => {
    if (isHoldPausedRef.current) {
      isHoldPausedRef.current = false;
      setIsPlaying(true);
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    handleHoldStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleHoldEnd();
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current ? touchStartYRef.current - touchEndY : 0;

    // Only swipe if horizontal move is significant and greater than vertical
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        goToNextStory(); // Swipe Left -> Next
      } else {
        goToPrevStory(); // Swipe Right -> Previous
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    handleHoldStart();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleHoldEnd();
    if (!isDraggingRef.current) return;
    const diffX = dragStartXRef.current - e.clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        goToNextStory();
      } else {
        goToPrevStory();
      }
    }
    isDraggingRef.current = false;
  };

  // Save connected email and avatar
  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;
    
    const email = userEmail.trim().toLowerCase();
    const name = userName.trim() || "Crystal Member";
    const avatar = getAvatarFromEmail(email, name);

    setSavedUserEmail(email);
    setUserAvatarUrl(avatar);
    localStorage.setItem("crystal_connected_email", email);
    localStorage.setItem("crystal_connected_name", name);

    // Optionally add user as customer if not already present
    setCustomers((prev) => {
      const exists = prev.find((c) => c.email.toLowerCase() === email);
      if (exists) {
        return prev.map((c) => (c.email.toLowerCase() === email ? { ...c, avatarUrl: avatar, name } : c));
      }
      const newCustomer: CustomerProfile = {
        id: `user-${Date.now()}`,
        name,
        subtitle: `${name} • Crystal Community`,
        email,
        avatarUrl: avatar,
        stories: [
          {
            id: `story-custom-${Date.now()}`,
            title: "Crystal Experience",
            category: "COMMUNITY",
            watermarkText: "CRYSTAL TRIBE",
            mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
            caption: "Just connected my Crystal account! Ready for fresh natural hydration.",
            likes: 1,
            postedAt: "Just now",
          },
        ],
      };
      return [newCustomer, ...prev];
    });

    setIsEmailModalOpen(false);
  };

  const isCurrentLiked = currentStory ? !!likedStories[currentStory.id] : false;
  const currentLikes = currentStory ? (likeCounts[currentStory.id] ?? currentStory.likes) : 0;

  return (
    <section className="relative w-full overflow-hidden bg-white py-8 md:py-16 text-neutral-900 select-none">
      <div className="mx-auto max-w-[540px] px-4 sm:px-6">
        
        {/* ============================================================ */}
        {/* 1. TOP HEADER                                               */}
        {/* Title: "From Moment to Journal" with orange highlight        */}
        {/* Top Right: Notification Bell Badge ("12") + Customer DP     */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between mb-7">
          <div className="leading-[1.1] text-center w-full">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              From Moment
            </h1>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              to <span className="text-[#ffea00]">Journal</span>
            </div>
          </div>

         
        </div>

        {/* ============================================================ */}
        {/* 2. SUBHEADER                                                */}
        {/* Left: "Explore Week »"                                      */}
        {/* Right: "3 New" Badge & Week Tabs ("Week 48", "Week 47"...)  */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 text-neutral-900 font-bold text-lg sm:text-xl tracking-tight">
            <span>Explore Week</span>
            <span className="text-neutral-500 font-normal">»</span>
          </div>

          <div className="flex items-center gap-3">
            {/* "3 New" Badge Pill */}
            <span className="px-2.5 py-0.5 rounded-full bg-[#fff1eb] text-[#f25822] text-xs font-semibold">
              3 New
            </span>

            {/* Stacked / Horizontal Week Selector */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              {INITIAL_WEEKS.map((w, idx) => {
                const isActive = activeWeek === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWeek(w.id)}
                    className={`transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#f25822] font-bold"
                        : idx === 1
                        ? "text-[#f25822]/60 hover:text-[#f25822]"
                        : "text-[#f25822]/30 hover:text-[#f25822]/60"
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. HORIZONTAL CUSTOMER PROFILE / STORIES SECTION (INSTA-STYLE) */}
        {/* Display profile pictures:                                   */}
        {/* - Yellow outline stroke when customer has unseen stories     */}
        {/* - Grey outline stroke once all stories from customer viewed  */}
        {/* - Email ID automatically connected to DP                     */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
          {customers.map((cust, idx) => {
            const isSelected = idx === currentCustomerIndex;
            const hasUnseen = hasCustomerUnseenStories(cust);
            const avatarSrc = cust.avatarUrl || getAvatarFromEmail(cust.email, cust.name);

            return (
              <button
                key={cust.id}
                onClick={() => selectCustomer(idx)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group focus:outline-hidden"
              >
                {/* Story Circle Ring */}
                <div
                  className={`relative p-0.5 rounded-full transition-all duration-300 ${
                    hasUnseen
                      ? "ring-3 ring-[#ffea00] ring-offset-2 ring-offset-white shadow-xs"
                      : "ring-2 ring-neutral-300 ring-offset-2 ring-offset-white opacity-85"
                  } ${isSelected ? "scale-105" : "group-hover:scale-102"}`}
                >
                  <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                    <img
                      src={avatarSrc}
                      alt={cust.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to dicebear if direct image fails
                        (e.target as HTMLImageElement).src = getAvatarFromEmail(cust.email, cust.name);
                      }}
                    />
                  </div>

                  {/* Tiny unseen story indicator pip */}
                  {hasUnseen && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#ffea00] border-2 border-white rounded-full shadow-xs" />
                  )}
                </div>
              </button>
            );
          })}

          {/* 4th Special Date Circle ("Dec 10 Wed") matching reference image */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-neutral-100/90 text-neutral-600 flex flex-col items-center justify-center font-sans shadow-2xs border border-neutral-200/60">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-tight leading-none">
                Dec
              </span>
              <span className="text-xl sm:text-2xl font-black text-neutral-700 leading-none my-0.5">
                10
              </span>
              <span className="text-[11px] font-medium text-neutral-400 capitalize leading-none">
                Wed
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MAIN FEATURED STORY HERO CARD                            */}
        {/* Matches reference design: rounded card, watermark text,     */}
        {/* bottom-left DP, bottom-right "4 New", left title, heart, nav */}
        {/* ============================================================ */}
        <div className="relative w-full">

          {/* Large Watermark Background Text (e.g. "ROCKET #15") */}
          <div className="pointer-events-none hidden md:block absolute -top-4 right-0 z-0 text-right opacity-15 select-none font-black tracking-tighter text-neutral-400 text-6xl sm:text-7xl">
            {currentStory?.watermarkText || "CRYSTAL #15"}
          </div>

          <div className="pointer-events-none  md:hidden absolute -top-4 right-0 z-0 text-center opacity-15 select-none font-black tracking-tighter text-neutral-400 text-6xl sm:text-7xl">
            {currentStory?.watermarkText || "CRYSTAL #15"}
          </div>

          <div className="relative z-10 hidden md:flex items-center justify-between gap-4">

            {/* Left Column: Category and Author Title */}
            <div className="w-[120px] sm:w-[140px] flex-shrink-0 flex flex-col justify-center text-left py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#f25822]">
                {currentStory?.category || "FEATURE"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 leading-tight mt-0.5">
                {currentStory?.category || "NBA"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1 leading-snug">
                {currentCustomer?.subtitle || currentCustomer?.name}
              </p>
            </div>

            {/* Center: Main Story Card with touch gesture & swiping */}
            <div
              className="relative flex-1 max-w-[280px] sm:max-w-[310px] aspect-[4/5.4] rounded-[32px] overflow-hidden bg-neutral-900 shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleHoldEnd}
            >
              {/* Story Image */}
              <img
                key={currentStory?.id}
                src={currentStory?.mediaUrl}
                alt={currentStory?.title}
                className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-103"
              />

              {/* Gradient overlays for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

              {/* Segmented Progress Bars at Top (5s each) */}
              <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5 items-center">
                {currentCustomer?.stories?.map((story, sIdx) => {
                  let fillPercent = 0;
                  if (sIdx < currentStoryIndex) fillPercent = 100;
                  else if (sIdx === currentStoryIndex) fillPercent = progress;

                  return (
                    <div
                      key={story.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentStoryIndex(sIdx);
                        setProgress(0);
                      }}
                      className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                    >
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Left / Right tap zones for quick prev/next navigation */}
              <div
                className="absolute inset-y-12 left-0 w-1/3 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevStory();
                }}
              />
              <div
                className="absolute inset-y-12 right-0 w-1/3 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextStory();
                }}
              />

              {/* Card Bottom Elements matching reference */}
              <div className="absolute bottom-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
                {/* Bottom-left: Author Circular DP */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-black/20">
                    <img
                      src={currentCustomer?.avatarUrl || getAvatarFromEmail(currentCustomer?.email, currentCustomer?.name)}
                      alt={currentCustomer?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Bottom-right: Pill badge "4 New" */}
                <div className="pointer-events-auto px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-md border border-white/15">
                  <span>{currentCustomer?.stories?.length} New</span>
                </div>
              </div>
            </div>

            {/* Right Column: Like Button, Play/Pause toggle, and Arrows */}
            <div className="flex flex-col items-center gap-5 sm:gap-6 flex-shrink-0 py-4">
              {/* Heart / Like Button */}
              <button
                onClick={() => currentStory && toggleLike(currentStory.id)}
                className="group relative p-2 rounded-full focus:outline-hidden cursor-pointer transition-transform active:scale-125"
                title="Like story"
              >
                <FaHeart
                  className={`text-2xl transition-all duration-300 ${
                    isCurrentLiked
                      ? "text-[#f25822] scale-110 drop-shadow-md"
                      : "text-[#f25822] hover:scale-110"
                  }`}
                />
                <span className="sr-only">Like story</span>
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs focus:outline-hidden"
                title={isPlaying ? "Pause (5s loop)" : "Play (5s loop)"}
              >
                {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
              </button>

              {/* Previous Arrow Button */}
              <button
                onClick={goToPrevStory}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs focus:outline-hidden active:scale-95"
                title="Previous story"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              {/* Next Arrow Button */}
              <button
                onClick={goToNextStory}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs focus:outline-hidden active:scale-95"
                title="Next story"
              >
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </div>

          <div className="relative z-10 md:hidden flex flex-col items-center justify-between gap-4">

            {/* Left Column: Category and Author Title */}
            <div className="w-[120px] sm:w-[140px] flex-shrink-0 flex flex-col justify-center text-left py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#f25822]">
                {currentStory?.category || "FEATURE"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 leading-tight mt-0.5">
                {currentStory?.category || "NBA"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1 leading-snug">
                {currentCustomer?.subtitle || currentCustomer?.name}
              </p>
            </div>

            {/* Center: Main Story Card with touch gesture & swiping */}
            <div
              className="relative flex-1 max-w-[450px] sm:max-w-[310px] aspect-[9/16] rounded-[32px] overflow-hidden bg-neutral-900 shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleHoldEnd}
            >
              {/* Story Image */}
              <img
                key={currentStory?.id}
                src={currentStory?.mediaUrl}
                alt={currentStory?.title}
                className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-103"
              />

              {/* Gradient overlays for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

              {/* Segmented Progress Bars at Top (5s each) */}
              <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5 items-center">
                {currentCustomer?.stories?.map((story, sIdx) => {
                  let fillPercent = 0;
                  if (sIdx < currentStoryIndex) fillPercent = 100;
                  else if (sIdx === currentStoryIndex) fillPercent = progress;

                  return (
                    <div
                      key={story.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentStoryIndex(sIdx);
                        setProgress(0);
                      }}
                      className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                    >
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Left / Right tap zones for quick prev/next navigation */}
              <div
                className="absolute inset-y-12 left-0 w-1/3 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevStory();
                }}
              />
              <div
                className="absolute inset-y-12 right-0 w-1/3 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextStory();
                }}
              />

              {/* Card Bottom Elements matching reference */}
              <div className="absolute bottom-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
                {/* Bottom-left: Author Circular DP */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-black/20">
                    <img
                      src={currentCustomer?.avatarUrl || getAvatarFromEmail(currentCustomer?.email, currentCustomer?.name)}
                      alt={currentCustomer?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Bottom-right: Pill badge "4 New" */}
                <div className="pointer-events-auto px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-md border border-white/15">
                  <span>{currentCustomer?.stories?.length} New</span>
                </div>
              </div>

              <div className="absolute z-[50] right-2 bottom-[50px] flex flex-col items-center gap-5 sm:gap-6 flex-shrink-0 py-4">
              {/* Heart / Like Button */}
              <button
                onClick={() => currentStory && toggleLike(currentStory.id)}
                className="group relative p-2 rounded-full focus:outline-hidden cursor-pointer transition-transform active:scale-125"
                title="Like story"
              >
                <FaHeart
                  className={`text-2xl transition-all duration-300 ${
                    isCurrentLiked
                      ? "text-[#f25822] scale-110 drop-shadow-md"
                      : "text-[#f25822] hover:scale-110"
                  }`}
                />
                <span className="sr-only">Like story</span>
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs focus:outline-hidden"
                title={isPlaying ? "Pause (5s loop)" : "Play (5s loop)"}
              >
                {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
              </button>

              {/* Previous Arrow Button */}
              <button
                onClick={goToPrevStory}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs focus:outline-hidden active:scale-95"
                title="Previous story"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              {/* Next Arrow Button */}
              <button
                onClick={goToNextStory}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs focus:outline-hidden active:scale-95"
                title="Next story"
              >
                <FaArrowRight className="text-sm" />
              </button>
            </div>
            </div>

            {/* Right Column: Like Button, Play/Pause toggle, and Arrows */}
            
          </div>

          {/* Story Caption & Loop Status */}
          {/* <div className="mt-5 flex items-center justify-between text-xs text-neutral-500 px-2">
            <p className="line-clamp-1 italic max-w-[340px]">
              "{currentStory?.caption || "Pure vitality and customer experiences."}"
            </p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                {isPlaying ? "Continuous 5s Loop" : "Paused"}
              </span>

              {!isStandalonePage && (
                <Link
                  href="/customer-stories"
                  className="text-[#f25822] font-semibold hover:underline flex items-center gap-1 ml-2"
                >
                  Full View <FiExternalLink className="text-xs" />
                </Link>
              )}
            </div>
          </div> */}
        </div>

        {/* ============================================================ */}
        {/* EMAIL DP SYNC MODAL                                         */}
        {/* Allows customer to connect their email ID so their profile   */}
        {/* image is automatically fetched and associated with account  */}
        {/* ============================================================ */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ffea00] flex items-center justify-center font-black text-neutral-900 text-sm">
                    C
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Connect Email for DP</h3>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                >
                  <FaXmark />
                </button>
              </div>

              <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
                Enter your email to automatically fetch and connect your profile picture (DP) via Gravatar & Unavatar. Your profile picture will be displayed on the customer story bar!
              </p>

              {/* Dynamic live avatar preview */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl mb-4 border border-neutral-100">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#ffea00] ring-offset-2 bg-white flex-shrink-0">
                  <img
                    src={getAvatarFromEmail(userEmail, userName || "Customer")}
                    alt="Preview DP"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate">
                    {userName || "Your Name"}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {userEmail || "Auto-fetching DP from email..."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveEmail} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-bold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <FaCheck className="text-xs text-[#ffea00]" />
                    Connect & Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}