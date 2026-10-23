"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1200;

// Server-renders the final number (so crawlers and no-JS visitors see the
// real value, never "0"), then counts up from 0 the first time it scrolls
// into view. Numbers already on screen when the page loads stay put. No new
// dependency — plain IntersectionObserver + requestAnimationFrame.
export default function CountUpNumber({ value, prefix, suffix }: { value: string; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
  const decimals = value.includes(".") ? (value.split(".")[1]?.length ?? 0) : 0;
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let armed: boolean | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (armed === null) {
          armed = !visible;
          if (armed) setDisplay(0);
          else observer.disconnect();
          return;
        }
        if (!armed || !visible) return;
        armed = false;
        observer.disconnect();
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          setDisplay(target * progress);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
