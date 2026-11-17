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
const state = { bar: null as HTMLElement | null, loading: false, giveUp: null as ReturnType<typeof setTimeout> | null };

function start(fade: boolean) {
  const bar = state.bar;
  if (!bar) return;
  state.loading = true;
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

function finish() {
  if (!state.loading) return;
  state.loading = false;
  if (state.giveUp) clearTimeout(state.giveUp);
  state.bar?.classList.replace("is-loading", "is-done");
  const main = document.getElementById("site-main");
  if (!main?.classList.contains("page-leaving")) return;
  // Back to full opacity from wherever the dimming had got to (nothing, if
  // the page arrived within its 100ms delay), so it never flashes.
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
// bar completes and the page fades back in. Instant (prefetched) changes
// show nothing: both effects wait about 100ms before appearing. Visitors who
// ask for reduced motion get the bar but not the fade. Styles:
// app/globals.css, "Page transition".
export default function PageTransition({ mode }: { mode: PageTransitionMode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const location = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (mode === "off") return;
    state.bar = barRef.current;
    const fade = mode === "bar_fade" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onClick = (event: MouseEvent) => {
      if (isPageLink(event)) start(fade);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      state.bar = null;
    };
  }, [mode]);

  // The new page has arrived.
  useEffect(() => {
    finish();
  }, [location]);

  if (mode === "off") return null;
  return <div ref={barRef} className="page-progress" aria-hidden="true" />;
}
