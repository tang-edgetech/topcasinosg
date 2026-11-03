"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ANIMATED = '.section[class*="section--anim-"]';

// Entrance animations (a component's Advanced tab, custom_class
// section--anim-*): marks the page "reveal-ready", which hides those
// components until they scroll into view (shared/theme/sections.css). Until
// this runs, and without JavaScript, everything is simply visible.
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(ANIMATED));
    if (elements.length === 0 || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    // Already on screen: shown as is, so nothing blinks out and back in.
    for (const el of elements) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      else observer.observe(el);
    }
    document.documentElement.classList.add("reveal-ready");
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
