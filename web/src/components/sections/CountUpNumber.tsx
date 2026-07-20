"use client";

import { useEffect, useRef, useState } from "react";

// Animates 0 -> value once scrolled into view. No new dependency — plain
// IntersectionObserver + requestAnimationFrame.
export default function CountUpNumber({ value, prefix, suffix }: { value: string; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const target = parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
  const decimals = value.includes(".") ? value.split(".")[1]?.length ?? 0 : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        const duration = 1200;
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
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
      {display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
