"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import RawHtmlBlock from "./RawHtmlBlock";

// Settings > Snippets, at the top or the bottom of <body>. The root layout
// renders the snippets for the first page a visitor opens, but Next keeps
// that layout as they click to other pages of the site, so a snippet set to
// run only on some pages would never come or go. This asks for the right
// snippets for each new page (app/api/snippets/route.ts): one still wanted
// stays as it is (site-wide analytics don't run twice), one no longer wanted
// is removed, and a new one is added and its scripts run (RawHtmlBlock).
export type SnippetSlot = "top" | "bottom";
type SlotSnippets = Record<SnippetSlot, string[]>;

// Both slots ask for the same page; one request serves them.
const requests = new Map<string, Promise<SlotSnippets | null>>();

function snippetsFor(path: string): Promise<SlotSnippets | null> {
  let request = requests.get(path);
  if (!request) {
    request = fetch(`/api/snippets?path=${encodeURIComponent(path)}`)
      .then((res) => (res.ok ? (res.json() as Promise<SlotSnippets>) : null))
      .catch(() => null)
      .finally(() => setTimeout(() => requests.delete(path), 1000));
    requests.set(path, request);
  }
  return request;
}

export default function SiteSnippets({ slot, initial }: { slot: SnippetSlot; initial: string[] }) {
  const pathname = usePathname();
  const [snippets, setSnippets] = useState(initial);
  const firstPath = useRef(pathname);

  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = "";
    let current = true;
    snippetsFor(pathname).then((next) => {
      // Keep what is there if the request failed; a later page will retry.
      if (current && next) setSnippets(next[slot]);
    });
    return () => {
      current = false;
    };
  }, [pathname, slot]);

  // The same snippet keeps the same key on every page, so React leaves it
  // in place instead of adding it again.
  const seen = new Map<string, number>();
  return snippets.map((html) => {
    const n = (seen.get(html) ?? 0) + 1;
    seen.set(html, n);
    return <RawHtmlBlock key={`${n}:${html}`} html={html} />;
  });
}
