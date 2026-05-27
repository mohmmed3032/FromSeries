"use client";

import { showInfo } from "@/data/episodes";

export default function Overview() {
  return (
    <section id="overview" className="bg-void py-24 px-8 md:px-16">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span
          className="font-mono text-fog tracking-[0.3em] uppercase"
          style={{ fontSize: "10px" }}
        >
          01 — Overview
        </span>
        <div className="flex-1 divider-glow" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Synopsis */}
        <div>
          <h2
            className="font-display text-pure tracking-widest mb-8 leading-tight"
            style={{ fontSize: "clamp(42px, 6vw, 80px)" }}
          >
            THE TOWN
            <br />
            <span className="text-mist">YOU CAN'T</span>
            <br />
            ESCAPE
          </h2>
          <p className="font-heading italic text-ghost text-lg mb-6 leading-relaxed">
            "{showInfo.tagline}"
          </p>
          <p className="font-body text-mist leading-relaxed text-sm">
            {showInfo.synopsis}
          </p>
        </div>

        {/* Right: Stats + Cast */}
        <div className="space-y-12">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-iron">
            {[
              { label: "Seasons", value: showInfo.totalSeasons.toString() },
              { label: "Episodes", value: showInfo.totalEpisodes.toString() },
              { label: "Rotten Tomatoes", value: showInfo.rtScore },
              { label: "Rating", value: showInfo.rating },
            ].map((stat) => (
              <div key={stat.label} className="bg-void p-6">
                <p
                  className="font-display text-pure leading-none mb-1"
                  style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
                >
                  {stat.value}
                </p>
                <p
                  className="font-mono text-fog uppercase tracking-widest"
                  style={{ fontSize: "9px" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Crew */}
          <div>
            <p
              className="font-mono text-fog uppercase tracking-widest mb-4"
              style={{ fontSize: "9px" }}
            >
              — Crew
            </p>
            <div className="space-y-3">
              {[
                { role: "Created By", name: showInfo.creator },
                { role: "Showrunner", name: showInfo.showrunner },
                { role: "Director", name: showInfo.director },
              ].map((c) => (
                <div key={c.role} className="flex justify-between items-center border-b border-iron pb-3">
                  <span
                    className="font-mono text-fog uppercase tracking-widest"
                    style={{ fontSize: "9px" }}
                  >
                    {c.role}
                  </span>
                  <span className="font-body text-ghost text-sm">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cast */}
          <div>
            <p
              className="font-mono text-fog uppercase tracking-widest mb-4"
              style={{ fontSize: "9px" }}
            >
              — Main Cast
            </p>
            <div className="grid grid-cols-2 gap-3">
              {showInfo.cast.map((member) => (
                <div key={member.name} className="border-l-2 border-iron pl-3">
                  <p className="font-body text-ghost text-sm font-medium">{member.name}</p>
                  <p
                    className="font-mono text-fog"
                    style={{ fontSize: "10px" }}
                  >
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
