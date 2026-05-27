"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-void border-b border-iron py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="px-8 md:px-16 flex items-center justify-between">
        <a
          href="#"
          className="font-display text-pure tracking-widest hover:text-ghost transition-colors duration-200"
          style={{ fontSize: "28px", letterSpacing: "0.2em" }}
        >
          FROM
        </a>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Overview", href: "#overview" },
            { label: "Episodes", href: "#episodes" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-fog hover:text-ghost transition-colors duration-200 tracking-widest uppercase"
              style={{ fontSize: "10px" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://www.mgmplus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-void bg-pure px-4 py-2 hover:bg-bone transition-colors duration-200 tracking-widest uppercase"
            style={{ fontSize: "10px" }}
          >
            Watch on MGM+
          </a>
        </div>
      </div>
    </nav>
  );
}
