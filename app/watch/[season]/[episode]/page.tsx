"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { seasons, Episode, Season } from "@/data/episodes";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);

  const seasonNum = parseInt(params.season as string);
  const episodeNum = parseInt(params.episode as string);

  const season: Season | undefined = seasons.find((s) => s.number === seasonNum);
  const episode: Episode | undefined = season?.episodes.find((e) => e.number === episodeNum);

  const prevEpisode = season?.episodes.find((e) => e.number === episodeNum - 1);
  const nextEpisode = season?.episodes.find((e) => e.number === episodeNum + 1);
  const nextSeason = !nextEpisode ? seasons.find((s) => s.number === seasonNum + 1) : null;
  const nextSeasonFirstEp = nextSeason?.episodes[0];

  const videoSrc = useMemo(() => {
    if (!season || !episode) return "";
    return episode.videoUrl ?? `/videos/S${pad(season.number)}E${pad(episode.number)}.mp4`;
  }, [season, episode]);

  // Detect mobile — check on mount, resize, AND orientation change
  useEffect(() => {
    const check = () => {
      // Use user agent + width for more reliable mobile detection
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth < 768;
      setIsMobile(isTouch || isNarrow);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    // Also check after a short delay when orientation changes (iOS delay)
    const delayedCheck = () => setTimeout(check, 100);
    window.addEventListener("orientationchange", delayedCheck);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      window.removeEventListener("orientationchange", delayedCheck);
    };
  }, []);

  // Redirect if invalid
  useEffect(() => {
    if (!season || !episode) router.push("/");
  }, [season, episode, router]);

  // Controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (isPlaying) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, [isPlaying, resetControlsTimer]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      const inFs = Boolean(document.fullscreenElement);
      setIsFullscreen(inFs);
      if (!inFs) {
        setShowControls(true);
        // @ts-ignore
        if (screen.orientation && screen.orientation.unlock) {
          // @ts-ignore
          screen.orientation.unlock();
        }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || !season || !episode) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowRight") videoRef.current.currentTime = Math.min(duration, currentTime + 10);
      if (e.code === "ArrowLeft") videoRef.current.currentTime = Math.max(0, currentTime - 10);
      if (e.code === "KeyM") toggleMute();
      if (e.code === "KeyF") toggleFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentTime, duration, season, episode]);

  // Buffer tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    video.addEventListener("progress", onProgress);
    return () => video.removeEventListener("progress", onProgress);
  }, [videoSrc]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) { await video.play(); setIsPlaying(true); }
      else { video.pause(); setIsPlaying(false); }
    } catch { setIsPlaying(false); }
    resetControlsTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (video.muted) setVolume(0);
    else setVolume(video.volume || 1);
  };

  const toggleFullscreen = async () => {
    const el = shellRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      // @ts-ignore
      if (isMobile && screen.orientation && screen.orientation.lock) {
        try {
          // @ts-ignore
          await screen.orientation.lock("landscape");
        } catch { /* ignore */ }
      }
    } else {
      await document.exitFullscreen();
    }
  };

  const goToNext = () => {
    if (nextEpisode) router.push(`/watch/${seasonNum}/${episodeNum + 1}`);
    else if (nextSeasonFirstEp && nextSeason) router.push(`/watch/${nextSeason.number}/1`);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = v;
    setCurrentTime(v);
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setVolume(v);
    setIsMuted(v === 0);
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIdx = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIdx + 1) % rates.length];
    if (videoRef.current) videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  // MOBILE: tap toggles controls visibility ONLY (not play/pause)
  const handleMobileTap = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input")) return;
    setShowControls((prev) => !prev);
  };

  // DESKTOP: click toggles play/pause
  const handleDesktopClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input")) return;
    togglePlay();
  };

  if (!season || !episode) return null;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  // Determine if we should use mobile behavior
  const useMobileBehavior = isMobile || (isFullscreen && isMobile);

  return (
    <div
      className={`bg-[#080808] text-[#f5f5f5] ${isFullscreen ? "fixed inset-0 z-50" : "h-screen flex flex-col md:flex-row"} overflow-hidden`}
    >
      {/* ═══════════════════ VIDEO AREA (Always Mounted) ═══════════════════ */}
      <div
        ref={shellRef}
        className={`relative bg-black overflow-hidden ${
          isFullscreen
            ? "w-full h-full"
            : isMobile
            ? "w-full shrink-0"
            : "flex-1 h-full flex items-center justify-center"
        }`}
        style={!isFullscreen && isMobile ? { aspectRatio: "16/9" } : {}}
        onClick={useMobileBehavior ? handleMobileTap : handleDesktopClick}
        onMouseMove={!useMobileBehavior ? resetControlsTimer : undefined}
        onMouseLeave={!useMobileBehavior ? () => isPlaying && setShowControls(false) : undefined}
      >
        {/* Video */}
        <video
          ref={videoRef}
          className={`bg-black ${isFullscreen ? "w-full h-full object-contain" : isMobile ? "w-full h-full object-cover" : "w-full h-full object-contain max-w-[1600px] max-h-[calc(100vh-40px)]"}`}
          poster={episode.thumbnail}
          src={videoSrc}
          preload="metadata"
          playsInline
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onPlay={() => { setIsPlaying(true); setShowControls(true); }}
          onPause={() => { setIsPlaying(false); setShowControls(true); }}
          onEnded={goToNext}
        />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.5)]" />

        {/* Center play button — ONLY when paused AND controls hidden (mobile) or always when paused (desktop) */}
        {!isPlaying && !showControls && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#111] border border-[#333] flex items-center justify-center hover:bg-[#1a1a1a] hover:border-[#555] active:scale-95 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-8 md:h-8 ml-1">
              <polygon points="5,3 19,12 5,21" fill="#f5f5f5" />
            </svg>
          </button>
        )}

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2 rounded-md bg-[#111]/90 px-2.5 py-1.5 border border-[#222] pointer-events-none">
            <div className="flex gap-0.5 items-end h-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-0.5 bg-emerald-500 rounded-full" style={{ height: `${6 + i * 3}px`, animation: `soundBar${i} 0.9s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-mono">Playing</span>
          </div>
        )}

        {/* ═══════════ CONTROLS OVERLAY ═══════════ */}
        <div
          className="absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 pointer-events-none"
          style={{ opacity: showControls ? 1 : 0 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 pointer-events-auto bg-gradient-to-b from-black/80 to-transparent">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); router.push("/#episodes"); }}
              className="flex items-center gap-2 text-[#ccc] hover:text-[#f5f5f5] transition-colors group"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#111] border border-[#333] flex items-center justify-center group-hover:border-[#555] transition">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="hidden sm:inline text-[10px] tracking-[0.3em] uppercase font-mono">Back</span>
            </button>

            <span className="text-[10px] tracking-[0.5em] uppercase text-[#888] font-mono">FROM</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); changePlaybackRate(); }}
                className="text-[10px] font-mono tracking-wider text-[#888] hover:text-[#f5f5f5] bg-[#111] border border-[#333] px-2 py-1 rounded hover:border-[#555] transition"
              >
                {playbackRate}x
              </button>

              {/* Desktop sidebar toggle */}
              {!isMobile && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowSidebar((v) => !v); }}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition ${showSidebar ? "bg-[#f5f5f5] text-[#080808] border border-[#f5f5f5]" : "bg-[#111] text-[#ccc] border border-[#333] hover:border-[#555]"}`}
                  title="Toggle Info"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 10v6M12 7h.01" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Center area — prev / play-pause / next buttons (visible when controls shown) */}
          <div className="flex items-center justify-between px-4 md:px-12 pointer-events-auto">
            {prevEpisode && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); router.push(`/watch/${seasonNum}/${episodeNum - 1}`); }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#111]/80 border border-[#333] hover:bg-[#1a1a1a] hover:border-[#555] active:scale-95 transition flex items-center justify-center text-[#ccc]"
                title="Previous Episode"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 md:w-6 md:h-6" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {!prevEpisode && <div className="w-10 md:w-12" />}

            {/* Center play/pause button — ALWAYS visible when controls are shown */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#111]/80 border border-[#444] hover:bg-[#1a1a1a] hover:border-[#666] active:scale-95 transition flex items-center justify-center text-[#f5f5f5]"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8">
                  <rect x="7" y="5" width="3.5" height="14" rx="1" />
                  <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8 ml-1">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            {(nextEpisode || nextSeasonFirstEp) && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#111]/80 border border-[#333] hover:bg-[#1a1a1a] hover:border-[#555] active:scale-95 transition flex items-center justify-center text-[#ccc]"
                title="Next Episode"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 md:w-6 md:h-6" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {!nextEpisode && !nextSeasonFirstEp && <div className="w-10 md:w-12" />}
          </div>

          {/* Bottom controls */}
          <div className="px-3 md:px-5 pb-3 md:pb-5 pt-10 md:pt-16 pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            {/* Seek bar */}
            <div className="mb-3 md:mb-4 group">
              <div className="relative h-1 bg-[#333] rounded-full overflow-hidden cursor-pointer">
                <div className="absolute h-full bg-[#555] rounded-full" style={{ width: `${bufferedPercent}%` }} />
                <div className="absolute h-full bg-[#f5f5f5] rounded-full" style={{ width: `${progressPercent}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f5f5f5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg" style={{ left: `calc(${progressPercent}% - 6px)` }} />
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-[#666] font-mono mb-0.5">
                  S{pad(seasonNum)} · E{pad(episodeNum)}
                </div>
                <h1 className="text-xs md:text-base lg:text-lg font-medium tracking-wide truncate text-[#e8e8e8]">
                  {episode.title}
                </h1>
              </div>

              <div className="flex items-center gap-1 md:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={toggleMute}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#111] border border-[#333] hover:bg-[#1a1a1a] hover:border-[#555] active:bg-[#222] transition flex items-center justify-center text-[#ccc]"
                  title="Mute"
                >
                  {isMuted || volume === 0 ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 5L6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
                      <path d="M16 9l5 6M21 9l-5 6" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 5L6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
                      <path d="M16 9a4 4 0 0 1 0 6" strokeLinecap="round" />
                      <path d="M18 6a8 8 0 0 1 0 12" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                {/* Volume slider - desktop */}
                <div className="hidden md:flex items-center bg-[#111] border border-[#333] rounded-full px-2.5 py-1.5">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-[#f5f5f5] h-1"
                  />
                </div>

                <div className="hidden sm:flex text-[10px] tracking-wider text-[#666] min-w-[90px] justify-end tabular-nums font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#111] border border-[#333] hover:bg-[#1a1a1a] hover:border-[#555] active:bg-[#222] transition flex items-center justify-center text-[#ccc]"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                      <path d="M8 3v5H3M16 3v5h5M21 16h-5v5M3 16h5v5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                      <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ INFO AREA ═══════════════════ */}
      {!isFullscreen && (
        <>
          {/* Mobile info - always visible below player */}
          {isMobile && (
            <div className="flex-1 overflow-y-auto bg-[#080808]">
              <div className="px-4 py-4 border-b border-[#1a1a1a]">
                <h1 className="text-base font-semibold text-[#f5f5f5] leading-snug mb-1.5">
                  {episode.title}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-[#666] font-mono tracking-wide">
                  <span>S{pad(seasonNum)} · E{pad(episodeNum)}</span>
                  <span>·</span>
                  <span>{episode.duration}</span>
                  <span>·</span>
                  <span>{episode.airDate}</span>
                </div>
              </div>

              <div className="px-4 py-3 flex gap-2 border-b border-[#1a1a1a] overflow-x-auto scrollbar-hide">
                <button
                  onClick={goToNext}
                  disabled={!nextEpisode && !nextSeasonFirstEp}
                  className="flex items-center gap-2 bg-[#f5f5f5] text-[#080808] px-4 py-2 rounded-md text-sm font-medium active:scale-95 transition disabled:opacity-30"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Next Episode
                </button>
                <button
                  onClick={() => router.push("/#episodes")}
                  className="flex items-center gap-2 bg-[#111] text-[#ccc] border border-[#333] px-4 py-2 rounded-md text-sm font-medium active:bg-[#1a1a1a] transition"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                  </svg>
                  All Episodes
                </button>
              </div>

              <div className="px-4 py-4 border-b border-[#1a1a1a]">
                <p className="text-[13px] text-[#888] leading-relaxed">
                  {episode.description}
                </p>
              </div>

              {(nextEpisode || nextSeasonFirstEp) && (
                <div className="px-4 py-4 border-b border-[#1a1a1a]">
                  <h3 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-3">Up Next</h3>
                  <button onClick={goToNext} className="flex items-center gap-3 w-full text-left group">
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden border border-[#222] shrink-0">
                      <Image
                        src={(nextEpisode || nextSeasonFirstEp)!.thumbnail}
                        alt={(nextEpisode || nextSeasonFirstEp)!.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#666] font-mono uppercase tracking-wider mb-0.5">
                        {nextEpisode ? `S${pad(seasonNum)} · E${pad(episodeNum + 1)}` : `S${nextSeason?.number} · E01`}
                      </div>
                      <div className="text-sm text-[#ccc] font-medium truncate group-hover:text-[#f5f5f5] transition">
                        {(nextEpisode || nextSeasonFirstEp)!.title}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              <div className="px-4 py-4">
                <h3 className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-3">
                  Season {seasonNum}
                </h3>
                <div className="space-y-1">
                  {season.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => router.push(`/watch/${seasonNum}/${ep.number}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        ep.number === episodeNum ? "bg-[#1a1a1a] text-[#f5f5f5]" : "text-[#888] hover:bg-[#111] hover:text-[#ccc]"
                      }`}
                    >
                      <span className="text-[10px] w-6 text-right tabular-nums text-[#555] font-mono">{pad(ep.number)}</span>
                      <span className="text-sm truncate">{ep.title}</span>
                      {ep.number === episodeNum && (
                        <span className="ml-auto text-[9px] tracking-wider uppercase text-[#555] font-mono">Now</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-6" />
            </div>
          )}

          {/* Desktop sidebar - hidden until toggled */}
          {!isMobile && showSidebar && (
            <aside className="relative z-20 border-l border-[#1a1a1a] bg-[#080808] overflow-y-auto shrink-0 w-[380px] h-full animate-in slide-in-from-right duration-300">
              <div className="p-6 pt-12">
                <div className="mb-6">
                  <div className="text-[9px] tracking-[0.35em] uppercase text-[#555] font-mono mb-2">Now Watching</div>
                  <h2 className="text-2xl font-semibold tracking-wide leading-tight text-[#f5f5f5]">{episode.title}</h2>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#666] font-mono mt-2">
                    Season {seasonNum} · Episode {episodeNum} · {episode.duration}
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden mb-6 border border-[#1a1a1a]">
                  <div className="relative aspect-video">
                    <Image src={episode.thumbnail} alt={episode.title} fill className="object-cover" unoptimized />
                  </div>
                </div>

                <p className="text-sm leading-7 text-[#888] mb-6">{episode.description}</p>

                <div className="text-[9px] tracking-[0.35em] uppercase text-[#555] font-mono mb-1">Air Date</div>
                <div className="text-sm text-[#ccc] mb-6">{episode.airDate}</div>

                {(nextEpisode || nextSeasonFirstEp) && (
                  <>
                    <div className="border-t border-[#1a1a1a] pt-5 mb-5" />
                    <div className="text-[9px] tracking-[0.35em] uppercase text-[#555] font-mono mb-4">Up Next</div>
                    <button type="button" onClick={goToNext} className="w-full text-left group">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-[#1a1a1a] mb-3">
                        <Image
                          src={(nextEpisode || nextSeasonFirstEp)!.thumbnail}
                          alt={(nextEpisode || nextSeasonFirstEp)!.title}
                          fill className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                      <div className="text-[9px] tracking-[0.3em] uppercase text-[#666] font-mono mb-1">
                        {nextEpisode ? `S${pad(seasonNum)} · E${pad(episodeNum + 1)}` : `Season ${nextSeason?.number} · Episode 01`}
                      </div>
                      <div className="text-sm text-[#ccc] group-hover:text-[#f5f5f5] transition-colors">
                        {(nextEpisode || nextSeasonFirstEp)!.title}
                      </div>
                    </button>
                  </>
                )}

                <div className="border-t border-[#1a1a1a] pt-5 mt-5 mb-4" />
                <div className="text-[9px] tracking-[0.35em] uppercase text-[#555] font-mono mb-4">Season {seasonNum} Episodes</div>
                <div className="space-y-0.5">
                  {season.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => router.push(`/watch/${seasonNum}/${ep.number}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        ep.number === episodeNum ? "bg-[#1a1a1a] text-[#f5f5f5]" : "text-[#888] hover:bg-[#111] hover:text-[#ccc]"
                      }`}
                    >
                      <span className="text-[10px] w-7 text-right tabular-nums text-[#555] font-mono">{pad(ep.number)}</span>
                      <span className="text-sm truncate">{ep.title}</span>
                      {ep.number === episodeNum && (
                        <span className="ml-auto text-[9px] tracking-[0.3em] uppercase text-[#555] font-mono">Playing</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </>
      )}

      <style jsx global>{`
        @keyframes soundBar1 { 0%,100% { height:6px } 50% { height:14px } }
        @keyframes soundBar2 { 0%,100% { height:12px } 50% { height:5px } }
        @keyframes soundBar3 { 0%,100% { height:9px } 50% { height:16px } }
      `}</style>
    </div>
  );
}