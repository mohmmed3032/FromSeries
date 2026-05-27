import { showInfo } from "@/data/episodes";

export default function Footer() {
  return (
    <footer className="bg-void border-t border-iron py-16 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <h2
              className="font-display text-pure tracking-widest mb-2"
              style={{ fontSize: "clamp(48px, 8vw, 100px)", lineHeight: 0.9 }}
            >
              FROM
            </h2>
            <p className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              An MGM+ Original Series · Est. 2022
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              Created by {showInfo.creator}
            </p>
            <p className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              Showrunner {showInfo.showrunner}
            </p>
            <p className="font-mono text-fog tracking-widest uppercase" style={{ fontSize: "9px" }}>
              Directed by {showInfo.director}
            </p>
          </div>
        </div>

        <div className="divider-glow my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="font-mono text-iron tracking-widest uppercase" style={{ fontSize: "9px" }}>
            © {new Date().getFullYear()} MGM+ · All rights reserved · Fan site — not official
          </p>
          <div className="flex gap-6">
            {showInfo.genre.map((g) => (
              <span
                key={g}
                className="font-mono text-iron tracking-widest uppercase"
                style={{ fontSize: "9px" }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
