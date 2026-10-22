"use client";

import { useRef, type ReactNode } from "react";

// Touch-swipeable horizontal track (native scroll-snap, so swipe/trackpad/
// keyboard scrolling all work without JS) with optional prev/next buttons
// that scroll by roughly one viewport of cards. Used by every Figma
// "slider" pattern: Avoid These Casinos, and the mobile card rows of Most
// Popular / Event Highlights / Real Reviews.
export default function HorizontalSlider({
  children,
  header,
  showArrows = false,
  arrowTheme = "light",
  trackClassName = "",
  label,
}: {
  children: ReactNode;
  header?: ReactNode;
  showArrows?: boolean;
  arrowTheme?: "light" | "dark";
  trackClassName?: string;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  const arrowClass =
    arrowTheme === "dark"
      ? "border-white/40 text-white hover:bg-white/10"
      : "border-primary-100 bg-surface text-primary-900 hover:bg-primary-50";

  return (
    <div className="horizontal-slider flex flex-col gap-4">
      {(header || showArrows) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{header}</div>
          {showArrows && (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByPage(-1)}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded border text-xs ${arrowClass}`}
              >
                ◀
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByPage(1)}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded border text-xs ${arrowClass}`}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      )}
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        className={`horizontal-slider__track flex snap-x snap-mandatory gap-4 overflow-x-auto ${trackClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
