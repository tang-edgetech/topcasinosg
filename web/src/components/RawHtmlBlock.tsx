"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Renders admin-authored raw HTML/JS verbatim (Snippets, per-page Custom
// Code). This is deliberately NOT sanitized — unlike WYSIWYG body content
// (see lib/sanitize-html.ts), the entire point of a snippet is to run
// arbitrary script (analytics, tracking pixels, chat widgets), and editing
// it is restricted to Super Admin at the API layer (see server.go).
//
// On the first page a visitor opens, the HTML is in the server response and
// the browser runs its <script> tags as it reads the page. A block that
// appears later, on a page reached by clicking a link inside the site, is
// put in by React, and browsers never run scripts added that way — so then
// each script is replaced by a fresh copy, which does run (in order, as on
// a normal page load).
const noSubscribe = () => () => {};

export default function RawHtmlBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // true only while hydrating server HTML, whose scripts already ran.
  const fromServer = useSyncExternalStore(noSubscribe, () => false, () => true);
  const skipScripts = useRef(fromServer);

  useEffect(() => {
    if (skipScripts.current) {
      skipScripts.current = false;
      return;
    }
    if (ref.current) runScripts(ref.current);
  }, [html]);

  if (!html) return null;
  return <div ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

// Scripts this has already put in, so running the effect again (React does
// that on purpose in development) never runs one twice.
const started = new WeakSet<HTMLScriptElement>();

function runScripts(root: HTMLElement) {
  for (const old of Array.from(root.querySelectorAll("script"))) {
    if (started.has(old)) continue;
    const script = document.createElement("script");
    started.add(script);
    for (const attr of Array.from(old.attributes)) script.setAttribute(attr.name, attr.value);
    // Added scripts load async by default; keep the page's order instead.
    if (script.src) script.async = old.hasAttribute("async");
    script.text = old.text;
    old.replaceWith(script);
  }
}
