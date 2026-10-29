"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 600;

// Figma "Comp / Scroll to top": orange rounded button pinned bottom-right,
// shown once the reader has scrolled past roughly the first screen.
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`scroll-to-top fixed right-4 bottom-4 z-40 flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-lg bg-gradient-to-b from-secondary-600 to-secondary-900 text-white shadow-lg transition-opacity duration-200 md:right-6 md:bottom-6 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M10 4 18 16H2z" />
      </svg>
    </button>
  );
}
