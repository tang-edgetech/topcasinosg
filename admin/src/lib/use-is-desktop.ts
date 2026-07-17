"use client";

import { useEffect, useState } from "react";

// Drives the sidebar's always-shown-vs-toggleable behavior at the 1200px
// breakpoint the design calls for (not one of Tailwind's default breakpoints).
export function useIsDesktop(minWidth = 1200): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    setIsDesktop(query.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, [minWidth]);

  return isDesktop;
}
