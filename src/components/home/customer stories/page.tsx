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
    <section className="md:hidden relative w-full overflow-hidden bg-white py-8 md:py-16 text-neutral-900 select-none">
      <div className="mx-auto max-w-[540px] px-4 sm:px-6">
        <div className="flex items-center justify-between mb-7">
          <div className="leading-[1.1] text-center w-full">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-2px] text-neutral-900">
              From Moment
            </h1>
            <div className="text-3xl sm:text-4xl font-semibold tracking-[-2px] text-neutral-900">
              to <span className="text-[#ffea00]">Journal</span>
            </div>
          </div>
        </div>

        <div className="relative w-full">

          <div className="relative z-10 hidden md:flex items-center justify-between gap-4">
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
          </div>
        </div>

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