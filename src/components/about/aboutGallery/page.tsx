"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaPlayCircle, FaPause, FaPlay, FaExpand, FaCompress } from "react-icons/fa";
import { BsCameraReelsFill, BsSpeedometer2 } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { MdReplay, MdSkipNext } from "react-icons/md";
import { api, GalleryVideo } from "@/src/lib/inkstone-api";

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function AboutGallery() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryVideo | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const previewRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load videos from Firestore
  useEffect(() => {
    api.getGalleryVideos().then((vids) => {
      setVideos(vids);
      if (vids.length > 0) setSelected(vids[0]);
      setLoading(false);
    });
  }, []);

  // When selected video changes — reset player
  useEffect(() => {
    if (!selected || !videoRef.current) return;
    const v = videoRef.current;
    v.pause();
    v.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setVideoEnded(false);
    setPlayerReady(false);
    v.src = selected.video_url;
    v.load();
  }, [selected]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // Video events
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    v.volume = volume;
    v.muted = isMuted;
    v.playbackRate = speed;
    setPlayerReady(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setVideoEnded(true);
    setShowControls(true);
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Controls
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || !playerReady) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
      setVideoEnded(false);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !isMuted;
    v.muted = next;
    setIsMuted(next);
  };

  const handleVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) {
      v.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      v.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (pct: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = (pct / 100) * duration;
    setProgress(pct);
  };

  const handleSpeed = (s: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!playerWrapRef.current) return;
    if (!document.fullscreenElement) {
      playerWrapRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const watchAgain = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setIsPlaying(true);
    setVideoEnded(false);
  };

  const playNext = () => {
    if (!selected || videos.length <= 1) return;
    const idx = videos.findIndex((v) => v.id === selected.id);
    const next = videos[(idx + 1) % videos.length];
    setSelected(next);
  };

  const selectedIndex = selected ? videos.findIndex((v) => v.id === selected.id) : -1;
  const hasNext = selectedIndex >= 0 && selectedIndex < videos.length - 1;

  // Thumbnail preview hover
  const handleThumbnailEnter = (id: string) => {
    setHoveredId(id);
    const pv = previewRefs.current.get(id);
    if (pv) {
      pv.currentTime = 0;
      pv.play().catch(() => {});
    }
  };

  const handleThumbnailLeave = (id: string) => {
    setHoveredId(null);
    const pv = previewRefs.current.get(id);
    if (pv) {
      pv.pause();
      pv.currentTime = 0;
    }
  };

  return (
    <div className="w-full">
      <section className="w-full">
        <div className="bg-[#ebebeb91] py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col mb-5 sm:mb-8 justify-center items-center text-center w-full max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm tracking-tight px-6 py-2 rounded-full font-medium shadow-xs flex items-center gap-2 mb-3 bg-[#ffea00]">
              <BsCameraReelsFill />Featured Videos
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-normal tracking-tight sm:tracking-[-2px] md:tracking-[-4px] text-gray-900 leading-tight">
              <span>Moments</span> That Matter
            </h2>
          </div>

          <div className="max-w-[1220px] mx-auto">
            {loading ? (
              <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
                  <span className="text-sm">Loading videos…</span>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <BsCameraReelsFill className="text-4xl" />
                  <p className="text-sm">No videos available yet.</p>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#fff] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-sm flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[540px]">
                {/* ── Main Player ── */}
                <div
                  ref={playerWrapRef}
                  className="w-full lg:w-[62%] xl:w-[65%] min-h-[320px] sm:min-h-[380px] lg:h-full bg-[#000] rounded-2xl sm:rounded-[20px] relative overflow-hidden group"
                  onMouseMove={resetControlsTimer}
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => isPlaying && setShowControls(false)}
                  onClick={togglePlay}
                >
                  {/* Video element */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    playsInline
                    preload="metadata"
                    poster={selected?.thumbnail_url || ""}
                  />

                  {/* Video ended overlay */}
                  {videoEnded && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in duration-300">
                      <p className="text-white text-sm font-medium opacity-70">{selected?.title}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); watchAgain(); }}
                          className="flex items-center gap-2 bg-[#ffea00] text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-yellow-300 transition-colors"
                        >
                          <MdReplay className="text-lg" /> Watch Again
                        </button>
                        {hasNext && (
                          <button
                            onClick={(e) => { e.stopPropagation(); playNext(); }}
                            className="flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/25 transition-colors border border-white/20"
                          >
                            <MdSkipNext className="text-lg" /> Play Next
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Centre play icon (before playing) */}
                  {!isPlaying && !videoEnded && playerReady && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <span className="text-[#ffea00] text-6xl opacity-90 drop-shadow-lg">
                        <FaPlayCircle />
                      </span>
                    </div>
                  )}

                  {/* Info overlay (bottom) */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Title row */}
                    <div className="px-5 pb-2 pt-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                      {selected && (
                        <>
                          <h3 className="text-white text-lg sm:text-xl font-normal tracking-tight leading-tight line-clamp-1">
                            {selected.title}
                          </h3>
                          {selected.description && (
                            <p className="text-gray-400 text-xs mt-1 line-clamp-1">{selected.description}</p>
                          )}
                        </>
                      )}

                      {/* Seek bar */}
                      <div className="mt-3 mb-2 flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] font-mono w-10 shrink-0">{formatTime(currentTime)}</span>
                        <div
                          className="relative flex-1 h-1 bg-white/25 rounded-full cursor-pointer group/seek"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = ((e.clientX - rect.left) / rect.width) * 100;
                            handleSeek(Math.max(0, Math.min(100, pct)));
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 h-full bg-[#ffea00] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#ffea00] rounded-full shadow -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
                            style={{ left: `${progress}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-[10px] font-mono w-10 shrink-0 text-right">{formatTime(duration)}</span>
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center gap-3 pb-3">
                        {/* Play / Pause */}
                        <button
                          onClick={togglePlay}
                          className="text-white text-xl hover:text-[#ffea00] transition-colors"
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>

                        {/* Volume */}
                        <button
                          onClick={toggleMute}
                          className="text-white text-xl hover:text-[#ffea00] transition-colors"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolume(parseFloat(e.target.value))}
                          className="w-16 sm:w-20 h-1 accent-[#ffea00] cursor-pointer"
                          aria-label="Volume"
                        />

                        <div className="flex-1" />

                        {/* Speed */}
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowSpeedMenu((s) => !s); }}
                            className="flex items-center gap-1 text-white text-xs hover:text-[#ffea00] transition-colors"
                            aria-label="Playback speed"
                          >
                            <BsSpeedometer2 className="text-sm" />
                            <span>{speed}x</span>
                          </button>
                          {showSpeedMenu && (
                            <div className="absolute bottom-7 right-0 bg-black/90 border border-white/15 rounded-xl overflow-hidden py-1 min-w-[70px] z-30">
                              {SPEEDS.map((s) => (
                                <button
                                  key={s}
                                  onClick={(e) => { e.stopPropagation(); handleSpeed(s); }}
                                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${speed === s ? "text-[#ffea00] font-bold" : "text-white hover:bg-white/10"}`}
                                >
                                  {s}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Fullscreen */}
                        <button
                          onClick={toggleFullscreen}
                          className="text-white text-lg hover:text-[#ffea00] transition-colors"
                          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        >
                          {isFullscreen ? <FaCompress /> : <FaExpand />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Playlist ── */}
                <div className="w-full lg:w-[38%] xl:w-[35%] flex flex-col gap-2 overflow-y-auto max-h-[380px] lg:max-h-none lg:h-full pr-1">
                  {videos.map((vid, idx) => {
                    const isActive = selected?.id === vid.id;
                    return (
                      <button
                        key={vid.id}
                        onClick={() => {
                          if (!isActive) {
                            setSelected(vid);
                          } else {
                            togglePlay();
                          }
                        }}
                        onMouseEnter={() => handleThumbnailEnter(vid.id)}
                        onMouseLeave={() => handleThumbnailLeave(vid.id)}
                        className={`w-full flex items-center gap-3 sm:gap-4 p-2 rounded-2xl transition-all cursor-pointer text-left border ${
                          isActive
                            ? "bg-neutral-100 border-neutral-300/60"
                            : "hover:bg-neutral-50 border-transparent hover:border-neutral-200/60"
                        }`}
                        aria-label={`Play ${vid.title}`}
                      >
                        {/* Thumbnail */}
                        <div className="w-28 sm:w-32 h-20 sm:h-[88px] rounded-2xl bg-[#000] shrink-0 relative overflow-hidden">
                          {vid.thumbnail_url && (
                            <img
                              src={vid.thumbnail_url}
                              alt={vid.title}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hoveredId === vid.id ? "opacity-0" : "opacity-100"}`}
                              loading="lazy"
                            />
                          )}
                          <video
                            ref={(el) => {
                              if (el) previewRefs.current.set(vid.id, el);
                              else previewRefs.current.delete(vid.id);
                            }}
                            src={vid.video_url}
                            muted
                            playsInline
                            preload="none"
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hoveredId === vid.id ? "opacity-100" : "opacity-0"}`}
                          />
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <span className="text-[#ffea00] text-xl">
                                {isPlaying ? <FaPause /> : <FaPlay />}
                              </span>
                            </div>
                          )}
                          {/* Index badge */}
                          {!isActive && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                              {String(idx + 1).padStart(2, "0")}
                            </div>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-20 sm:h-[88px] py-1">
                          <div className="flex items-center gap-2">
                            {vid.category && (
                              <span className="text-[11px] font-medium bg-[#e3e3e3] px-2.5 py-0.5 rounded-3xl inline-block leading-none">
                                {vid.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-800 line-clamp-2 leading-snug font-medium">
                            {vid.title}
                          </p>
                          {vid.duration_label && (
                            <span className="text-[10px] text-gray-400 font-mono">{vid.duration_label}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
