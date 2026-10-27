"use client";

import { useEffect } from "react";

const SCROLL_KEY = "tcsg-preview-scroll";

// Each live-preview refresh loads a new /preview/{token} URL; this keeps the
// reader where they were instead of jumping back to the top every time.
export default function PreviewScrollKeeper() {
  useEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem(SCROLL_KEY));
      if (saved > 0) window.scrollTo(0, saved);
    } catch {}
    const remember = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      } catch {}
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, []);

  return null;
}
