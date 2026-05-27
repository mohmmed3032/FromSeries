"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { seasons, Season } from "@/data/episodes";
import EpisodeModal from "./EpisodeModal";

export default function EpisodeBrowser() {
  const [activeSeason, setActiveSeason] = useState<Season>(seasons[3]);
  const router = useRouter();

  const handlePlay = (seasonNum: number, episodeNum: number) => {
    router.push(`/watch/${seasonNum}/${episodeNum}`);
  };

  return (
    <section id="episodes" className="bg-ash py-16 md:py-24 px-4 sm:px-8 md:px-16">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-12 md:mb-16">
        <span
          className="font-mono text-fog tracking-[0.3em] uppercase"
          style={{ fontSize: "10px" }}
        >
          02 — Episodes
        </span>
        <div className="flex-1 divider-glow" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Season header */}
        <div className="mb-8 md:mb-12">
          <h2
            className="font-display text-pure tracking-widest mb-2"
            style={{ fontSize: "clamp(28px, 6vw, 80px)" }}
          >
            ALL SEASONS
          </h2>
          <p className="font-body text-mist text-sm">
            {seasons.reduce((acc, s) => acc + s.episodes.length, 0)} episodes
            across {seasons.length} seasons
          </p>
        </div>

        {/* Season tabs — scrollable on mobile */}
        <div className="flex gap-0 mb-1 border-b border-iron overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setActiveSeason(season)}
              className={`season-tab flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-mono tracking-widest uppercase whitespace-nowrap flex-shrink-0 ${
                activeSeason.id === season.id
                  ? "active text-pure border-b-2 border-pure"
                  : "text-fog"
              }`}
              style={{ fontSize: "11px" }}
            >
              S{String(season.number).padStart(2, "0")}
              <span className="hidden sm:inline">eason {season.number}</span>
              {season.isNew && (
                <span className="badge-new inline-block">New</span>
              )}
            </button>
          ))}
        </div>

        {/* Season meta bar — wraps gracefully on mobile */}
        <div className="bg-slate px-4 sm:px-6 py-4 mb-8 md:mb-10 grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 items-start sm:items-center">
          <div>
            <span className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              Premiered
            </span>
            <p className="font-body text-ghost text-sm mt-0.5">{activeSeason.premiere}</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-iron" />
          <div>
            <span className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              Network
            </span>
            <p className="font-body text-ghost text-sm mt-0.5">{activeSeason.network}</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-iron" />
          <div>
            <span className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              Episodes
            </span>
            <p className="font-body text-ghost text-sm mt-0.5">{activeSeason.episodes.length}</p>
          </div>
          {/* Synopsis — full width on mobile */}
          <p className="font-body text-mist text-sm col-span-2 sm:col-span-1 sm:flex-1 sm:min-w-[200px]">
            {activeSeason.synopsis}
          </p>
        </div>

        {/* Episode grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ash">
          {activeSeason.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handlePlay(activeSeason.number, episode.number)}
              className="episode-card bg-void text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-50"
                  sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />

                {/* Dark gradient always visible at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80" />

                {/* Episode number watermark */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                  <span
                    className="font-display text-pure opacity-70 leading-none"
                    style={{ fontSize: "clamp(20px, 4vw, 32px)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                  >
                    {String(episode.number).padStart(2, "0")}
                  </span>
                </div>

                {/* Duration badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                  <span
                    className="font-mono text-ghost bg-void bg-opacity-70 px-2 py-0.5"
                    style={{ fontSize: "9px", letterSpacing: "0.1em" }}
                  >
                    {episode.duration}
                  </span>
                </div>

                {/* Play button — tap/hover */}
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 border border-pure flex items-center justify-center bg-void bg-opacity-40 backdrop-blur-sm group-hover:bg-pure group-hover:bg-opacity-10 transition-all duration-300">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1">
                      <polygon points="5,3 19,12 5,21" fill="white" />
                    </svg>
                  </div>
                </div>

                {/* NEW badge */}
                {activeSeason.isNew && episode.number >= 5 && (
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10">
                    <span className="badge-new">New</span>
                  </div>
                )}
              </div>

              {/* Episode info */}
              <div className="bg-ash px-3 sm:px-4 py-2.5 sm:py-3 group-hover:bg-slate transition-colors duration-300">
                <h3 className="font-heading text-ghost group-hover:text-pure text-xs sm:text-sm font-semibold leading-tight mb-1 transition-colors duration-300 truncate">
                  {episode.title}
                </h3>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className="font-mono text-fog tracking-widest uppercase"
                    style={{ fontSize: "9px" }}
                  >
                    S{String(activeSeason.number).padStart(2, "0")} · E{String(episode.number).padStart(2, "0")}
                  </span>
                  <span className="text-iron font-mono" style={{ fontSize: "9px" }}>·</span>
                  <span
                    className="font-mono text-fog tracking-widest"
                    style={{ fontSize: "9px" }}
                  >
                    {episode.airDate}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
