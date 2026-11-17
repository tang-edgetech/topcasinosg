"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type PageTransitionMode = "off" | "bar" | "bar_fade";

// Longest a bar may run without the page changing (a link that turned out to
// do nothing, or a failed load): then it quietly goes away.
const GIVE_UP_MS = 15000;
// The fade back in (globals.css #site-main.page-returning), plus a margin.
const RETURN_MS = 450;

// One bar per site (the root layout renders this once).
type Timer = ReturnType<typeof setTimeout> | null;
const state = { bar: null as HTMLElement | null, loading: false, minMs: 0, startedAt: 0, giveUp: null as Timer, hold: null as Timer };

function start(fade: boolean) {
  const bar = state.bar;
  if (!bar) return;
  state.loading = true;
  state.startedAt = performance.now();
  if (state.hold) clearTimeout(state.hold);
  bar.classList.remove("is-done");
  // Restart from 0 even if a previous bar was still finishing.
  void bar.offsetWidth;
  bar.classList.add("is-loading");
  if (fade) {
    const main = document.getElementById("site-main");
    main?.classList.remove("page-returning");
    main?.classList.add("page-leaving");
  }
  if (state.giveUp) clearTimeout(state.giveUp);
  state.giveUp = setTimeout(finish, GIVE_UP_MS);
}

// The new page is here: complete now, or once the bar has shown for its
// minimum time.
function finish() {
  if (!state.loading) return;
  state.loading = false;
  if (state.giveUp) clearTimeout(state.giveUp);
  const wait = state.minMs - (performance.now() - state.startedAt);
  if (wait > 0) state.hold = setTimeout(complete, wait);
  else complete();
}

function complete() {
  state.hold = null;
  state.bar?.classList.replace("is-loading", "is-done");
  const main = document.getElementById("site-main");
  if (!main?.classList.contains("page-leaving")) return;
  // Back to full opacity from wherever the dimming had got to, so it never
  // flashes.
  main.classList.replace("page-leaving", "page-returning");
  setTimeout(() => main.classList.remove("page-returning"), RETURN_MS);
}

// A left click on a link to another page of this site (not a new tab, a
// download, another site or a #section of this page).
function isPageLink(event: MouseEvent): boolean {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return false;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || !url.protocol.startsWith("http")) return false;
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

// Site Settings > General > Page Transition. A click on a link to another
// page of this site starts an orange loading bar at the top (and, for
// "bar_fade", dims the page); when the new page's path or query arrives the
// bar completes and the page fades back in. minMs (Site Settings, up to 1s)
// holds the bar on screen at least that long, since most changes are
// instant; with 0, both effects wait 100ms and instant changes show nothing.
// Visitors who ask for reduced motion get the bar but not the fade. Styles:
// app/globals.css, "Page transition".
export default function PageTransition({ mode, minMs }: { mode: PageTransitionMode; minMs: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const location = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (mode === "off") return;
    state.bar = barRef.current;
    state.minMs = minMs;
    // With a minimum show time the bar (and dimming) appear at once;
    // without one they wait 100ms, so instant changes show nothing.
    document.documentElement.style.setProperty("--page-transition-delay", minMs > 0 ? "0ms" : "100ms");
    const fade = mode === "bar_fade" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onClick = (event: MouseEvent) => {
      if (isPageLink(event)) start(fade);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      state.bar = null;
    };
  }, [mode, minMs]);

  // The new page has arrived.
  useEffect(() => {
    finish();
  }, [location]);

  if (mode === "off") return null;
  return <div ref={barRef} className="page-progress" aria-hidden="true" />;
}
