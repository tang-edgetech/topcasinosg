"use client";

import { Children, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";

// Breakpoints match Tailwind's md/lg (sections.css has the matching
// .swipe-row--grid-* rules).
const GRID_BREAKPOINTS = { md: 768, lg: 1024 } as const;

// A Swiper row of cards. Each child becomes one slide; slideClassName sizes
// the slides (Swiper runs with slidesPerView "auto", so a slide's own width
// decides how many show). With gridFrom set, the row stops being a slider at
// that breakpoint and lays its slides out as a grid of gridColumns columns
// (the mobile swipe / desktop grid rows: Most Popular, Event Highlights, Real
// Reviews, Track Record).
export default function SwipeRow({
  children,
  label,
  className = "",
  slideClassName = "",
  gap = 16,
  gridFrom,
  gridColumns = 3,
  gridGap,
  centered = false,
  wrapperTag,
  slideTag,
  onSwiper,
  onPositionChange,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  // One class string for every slide, or one per slide (an array, since
  // server-component callers can't pass functions).
  slideClassName?: string | string[];
  gap?: number;
  gridFrom?: keyof typeof GRID_BREAKPOINTS;
  gridColumns?: number;
  gridGap?: number;
  centered?: boolean;
  wrapperTag?: string;
  slideTag?: string;
  onSwiper?: (swiper: SwiperInstance) => void;
  onPositionChange?: (atStart: boolean, atEnd: boolean) => void;
}) {
  const slides = Children.toArray(children);
  const reportPosition = (s: SwiperInstance) => onPositionChange?.(s.isBeginning, s.isEnd);
  const gridStyle = gridFrom
    ? ({ "--swipe-row-cols": `repeat(${gridColumns}, minmax(0, 1fr))`, "--swipe-row-gap": `${gridGap ?? gap}px` } as React.CSSProperties)
    : undefined;

  return (
    <Swiper
      modules={[A11y, Keyboard]}
      // min-w-0: inside a flex parent the row would otherwise grow to fit its slides.
      className={`swipe-row w-full min-w-0 ${gridFrom ? `swipe-row--grid-${gridFrom}` : ""} ${className}`}
      style={gridStyle}
      wrapperTag={wrapperTag}
      slidesPerView="auto"
      spaceBetween={gap}
      centeredSlides={centered}
      grabCursor
      keyboard={{ enabled: true, onlyInViewport: true }}
      a11y={{ containerMessage: label, prevSlideMessage: "Previous", nextSlideMessage: "Next" }}
      breakpoints={gridFrom ? { [GRID_BREAKPOINTS[gridFrom]]: { enabled: false, centeredSlides: false } } : undefined}
      onSwiper={(s) => {
        onSwiper?.(s);
        reportPosition(s);
      }}
      onSlideChange={reportPosition}
      onReachBeginning={reportPosition}
      onReachEnd={reportPosition}
      onResize={reportPosition}
    >
      {slides.map((child, i) => (
        <SwiperSlide
          key={(child as { key?: string | null }).key ?? i}
          tag={slideTag}
          className={`swipe-row__slide ${Array.isArray(slideClassName) ? (slideClassName[i] ?? "") : slideClassName}`}
        >
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
