"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Swiper as SwiperInstance } from "swiper";
import SwipeRow from "./SwipeRow";

// Swiper-driven horizontal row (see SwipeRow) with optional prev/next
// buttons. Used by every Figma "slider" pattern with a header: Avoid These
// Casinos, the guide/news carousels, RTP game sliders and Container
// carousels. slideClassName sizes each slide. seeAllUrl adds Figma's "See
// All" button (Comp / CTA 3: 120x39, 0.5px border, 5px radius) 10px before
// the joined 39x39 arrow pair. Controls line up with the bottom of the
// header (a title with text under it), or its top (controlsAlign "start",
// a title on its own).
export default function HorizontalSlider({
  children,
  header,
  showArrows = false,
  arrowTheme = "light",
  trackClassName = "",
  slideClassName = "",
  label,
  seeAllUrl,
  seeAllLabel = "See All",
  controlsAlign = "end",
}: {
  children: ReactNode;
  header?: ReactNode;
  showArrows?: boolean;
  arrowTheme?: "light" | "dark";
  trackClassName?: string;
  slideClassName?: string | string[];
  label?: string;
  seeAllUrl?: string;
  seeAllLabel?: string;
  controlsAlign?: "start" | "end";
}) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const dark = arrowTheme === "dark";
  const controlClass = dark
    ? "border-danger text-white hover:bg-white/10"
    : "border-primary-100 bg-surface text-primary-400 hover:bg-primary-50 hover:text-primary-900";
  const arrowClass = dark ? controlClass : "border-primary-100 bg-surface text-primary-900 hover:bg-primary-50";
  const hasControls = showArrows || Boolean(seeAllUrl);

  return (
    <div className="horizontal-slider flex flex-col gap-5">
      {(header || hasControls) && (
        <div className={`flex flex-wrap justify-between gap-3 ${controlsAlign === "start" ? "items-start" : "items-end"}`}>
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
                    disabled={edges.atStart}
                    onClick={() => swiper?.slidePrev()}
                    className={`flex h-[38px] w-[39px] cursor-pointer items-center justify-center border-0 border-r-[0.5px] disabled:cursor-default disabled:opacity-40 ${arrowClass}`}
                  >
                    <ArrowIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    disabled={edges.atEnd}
                    onClick={() => swiper?.slideNext()}
                    className={`flex h-[38px] w-[39px] cursor-pointer items-center justify-center border-0 disabled:cursor-default disabled:opacity-40 ${arrowClass}`}
                  >
                    <ArrowIcon direction="right" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <SwipeRow
        label={label}
        className={`horizontal-slider__track w-full ${trackClassName}`}
        slideClassName={slideClassName}
        onSwiper={setSwiper}
        onPositionChange={(atStart, atEnd) => setEdges({ atStart, atEnd })}
      >
        {children}
      </SwipeRow>
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
