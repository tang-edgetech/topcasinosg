"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";

// Touch-swipeable horizontal track (native scroll-snap, so swipe/trackpad/
// keyboard scrolling all work without JS) with optional prev/next buttons
// that scroll by roughly one viewport of cards. Used by every Figma
// "slider" pattern: Avoid These Casinos, and the mobile card rows of Most
// Popular / Event Highlights / Real Reviews. seeAllUrl adds Figma's "See
// All" button (Comp / CTA 3: 120x39, 0.5px border, 5px radius) 10px before
// the joined 39x39 arrow pair.
export default function HorizontalSlider({
  children,
  header,
  showArrows = false,
  arrowTheme = "light",
  trackClassName = "",
  label,
  seeAllUrl,
  seeAllLabel = "See All",
}: {
  children: ReactNode;
  header?: ReactNode;
  showArrows?: boolean;
  arrowTheme?: "light" | "dark";
  trackClassName?: string;
  label?: string;
  seeAllUrl?: string;
  seeAllLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  const dark = arrowTheme === "dark";
  const controlClass = dark
    ? "border-danger text-white hover:bg-white/10"
    : "border-primary-100 bg-surface text-primary-400 hover:bg-primary-50 hover:text-primary-900";
  const arrowClass = dark ? controlClass : "border-primary-100 bg-surface text-primary-900 hover:bg-primary-50";
  const hasControls = showArrows || Boolean(seeAllUrl);

  return (
    <div className="horizontal-slider flex flex-col gap-5">
      {(header || hasControls) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">{header}</div>
          {hasControls && (
            <div className="horizontal-slider__controls flex shrink-0 items-center gap-2.5">
              {seeAllUrl && (
                <Link
                  href={seeAllUrl}
                  className={`horizontal-slider__see-all flex h-[39px] min-w-[120px] cursor-pointer items-center justify-center rounded-[5px] border-[0.5px] px-[15px] text-base ${controlClass}`}
                >
                  {seeAllLabel}
                </Link>
              )}
              {showArrows && (
                <div className={`horizontal-slider__arrows flex overflow-hidden rounded-[5px] border-[0.5px] ${dark ? "border-danger" : "border-primary-100"}`}>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => scrollByPage(-1)}
                    className={`flex h-[38px] w-[39px] cursor-pointer items-center justify-center border-0 border-r-[0.5px] ${arrowClass}`}
                  >
                    <ArrowIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => scrollByPage(1)}
                    className={`flex h-[38px] w-[39px] cursor-pointer items-center justify-center border-0 ${arrowClass}`}
                  >
                    <ArrowIcon direction="right" />
                  </button>
                </div>
              )}
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

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 8 11" className="h-[11px] w-2" fill="currentColor">
      <path d={direction === "left" ? "M8 0v11L0 5.5z" : "M0 0v11l8-5.5z"} />
    </svg>
  );
}
