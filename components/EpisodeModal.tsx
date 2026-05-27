"use client";

import { useEffect } from "react";
import { Episode, Season } from "@/data/episodes";

interface EpisodeModalProps {
  episode: Episode;
  season: Season;
  onClose: () => void;
}

export default function EpisodeModal({
  episode,
  season,
  onClose,
}: EpisodeModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-ash w-full max-w-4xl animate-fade-in"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Player */}
        <div
          className="placeholder-player w-full flex flex-col items-center justify-center"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
            }}
          />

          {/* Play button */}
          <button
            className="relative z-20 flex items-center justify-center group"
            onClick={() => {}}
          >
            <div
              className="border border-ghost w-20 h-20 flex items-center justify-center group-hover:bg-pure group-hover:border-pure transition-all duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 ml-1 group-hover:text-void transition-colors duration-300"
                style={{ color: "var(--ghost)" }}
              >
                <polygon
                  points="5,3 19,12 5,21"
                  fill="currentColor"
                  className="group-hover:fill-void"
                />
              </svg>
            </div>
          </button>

          {/* Episode label in player */}
          <div className="absolute bottom-4 left-4 z-20">
            <p
              className="font-mono text-fog tracking-widest uppercase"
              style={{ fontSize: "9px" }}
            >
              S{String(season.number).padStart(2, "0")} ·{" "}
              E{String(episode.number).padStart(2, "0")}
            </p>
            <p className="font-display text-ghost tracking-widest text-lg">
              {episode.title}
            </p>
          </div>

          {/* Duration */}
          <div className="absolute top-4 right-4 z-20">
            <span
              className="font-mono text-fog tracking-widest"
              style={{ fontSize: "10px" }}
            >
              {episode.duration}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="font-mono text-fog tracking-widest uppercase"
                  style={{ fontSize: "9px" }}
                >
                  Season {season.number} · Episode {episode.number}
                </span>
                <div className="h-px w-8 bg-iron" />
                <span
                  className="font-mono text-fog tracking-widest"
                  style={{ fontSize: "9px" }}
                >
                  {episode.airDate}
                </span>
              </div>
              <h3
                className="font-display text-pure tracking-widest"
                style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
              >
                {episode.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-fog hover:text-ghost transition-colors duration-200 ml-4 flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          <div className="divider-glow mb-6" />

          <p className="font-body text-mist leading-relaxed text-sm max-w-2xl">
            {episode.description}
          </p>

          {/* Nav hint */}
          <div className="mt-8 flex items-center gap-2">
            <div className="h-px flex-1 bg-iron" />
            <span
              className="font-mono text-fog tracking-widest uppercase"
              style={{ fontSize: "9px" }}
            >
              Press ESC to close
            </span>
            <div className="h-px flex-1 bg-iron" />
          </div>
        </div>
      </div>
    </div>
  );
}
