"use client";

import { useEffect, useState } from "react";
import { showInfo } from "@/data/episodes";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-void">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      

      {/* Center: massive FROM title */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none">
        <h1
          className="font-display text-center leading-none tracking-widest text-pure"
          style={{
            fontSize: "clamp(120px, 25vw, 340px)",
            opacity: loaded ? 0.07 : 0,
            transition: "opacity 2s ease",
            letterSpacing: "0.15em",
          }}
        >
          FROM
        </h1>
      </div>

      {/* Diagonal decorative lines */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: "1px",
            height: "300px",
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)",
            top: "20%",
            left: "15%",
            transform: "rotate(15deg)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "1px",
            height: "200px",
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)",
            top: "40%",
            right: "20%",
            transform: "rotate(-8deg)",
          }}
        />
      </div>

      {/* Bottom content */}
      <div className="relative z-20 px-8 md:px-16 pb-20 pt-40">
        {/* Genre pills */}
        <div
          className={`flex gap-2 mb-6 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          {showInfo.genre.map((g) => (
            <span
              key={g}
              className="font-mono text-fog border border-iron px-3 py-1"
              style={{ fontSize: "10px", letterSpacing: "0.2em" }}
            >
              {g.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Title */}
        <div
          className={`transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "350ms" }}
        >
          <h2
            className="font-display text-pure mb-2 tracking-widest"
            style={{ fontSize: "clamp(64px, 12vw, 140px)", lineHeight: 0.9 }}
          >
            FROM
          </h2>
          <p
            className="font-heading italic text-mist mb-8"
            style={{ fontSize: "clamp(14px, 2vw, 20px)" }}
          >
            "{showInfo.tagline}"
          </p>
        </div>

        {/* Divider */}
        <div
          className={`divider-glow mb-8 transition-all duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "500ms" }}
        />

        {/* Info row */}
        <div
          className={`flex flex-wrap gap-8 mb-10 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div>
            <p
              className="font-mono text-fog uppercase tracking-widest mb-1"
              style={{ fontSize: "9px" }}
            >
              Created By
            </p>
            <p className="font-body text-ghost text-sm">{showInfo.creator}</p>
          </div>
          <div>
            <p
              className="font-mono text-fog uppercase tracking-widest mb-1"
              style={{ fontSize: "9px" }}
            >
              Stars
            </p>
            <p className="font-body text-ghost text-sm">{showInfo.lead}</p>
          </div>
          <div>
            <p
              className="font-mono text-fog uppercase tracking-widest mb-1"
              style={{ fontSize: "9px" }}
            >
              Premiered
            </p>
            <p className="font-body text-ghost text-sm">{showInfo.premiered}</p>
          </div>
          <div>
            <p
              className="font-mono text-fog uppercase tracking-widest mb-1"
              style={{ fontSize: "9px" }}
            >
              Network
            </p>
            <p className="font-body text-ghost text-sm">{showInfo.network}</p>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`flex gap-4 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "750ms" }}
        >
          <a
            href="#episodes"
            className="font-mono text-void bg-pure px-8 py-3 hover:bg-bone transition-colors duration-200 tracking-widest uppercase"
            style={{ fontSize: "11px" }}
          >
            Watch Now
          </a>
          <a
            href="#overview"
            className="font-mono text-ghost border border-iron px-8 py-3 hover:border-fog transition-colors duration-200 tracking-widest uppercase"
            style={{ fontSize: "11px" }}
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-void to-transparent z-10 pointer-events-none" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-2">
        <div
          className="w-px h-12 bg-gradient-to-b from-transparent to-fog"
          style={{
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <span
          className="font-mono text-fog tracking-widest uppercase vertical-text"
          style={{ fontSize: "8px" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
