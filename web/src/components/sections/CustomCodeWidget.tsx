"use client";

import { useEffect, useRef, useState } from "react";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import SectionTag from "./SectionTag";

// Custom Code: a component the client writes themselves as HTML, CSS and
// JavaScript ("html", "css", "js" fields; api/internal/handler/
// block_docs.go). It runs in a sandboxed iframe: its own document with an
// opaque origin, so its code can't touch this page, read the site's cookies
// (they are SameSite=Strict anyway) or call the backoffice as a signed-in
// user. That is what lets any code go in without the HTML sanitizer.
//
// The frame reports its content height and the page sizes it to match
// (unless "height" fixes it), and the page sends in the site's theme as CSS
// variables plus the text colour around the frame, so the code can match
// the site's look: var(--color-primary-900), var(--font-figtree) ...

const SANDBOX = "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals";
const MAX_HEIGHT = 20000;
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap";

// Used until the page sends the live theme (and in an exported copy of the
// page opened without the site's scripts).
const FALLBACK_THEME = `:root{--color-primary-900:#1a1e71;--color-primary-glow:#3139d7;--color-secondary-500:#f7c30b;--color-success:#00bb9e;--color-danger:#ff4553;--font-figtree:"Figtree",ui-sans-serif,system-ui,sans-serif}`;

// "</script" inside the code would end the element early.
const guard = (code: string, tag: string) => code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);

function frameDocument(id: number, html: string, css: string, js: string): string {
  // Runs before the client's code: reports the content height, and applies
  // the theme the page sends. Only messages from the page itself count.
  const bridge = `(function(){var id=${id};function send(){parent.postMessage({tcsCustomCode:id,height:Math.ceil(document.documentElement.getBoundingClientRect().height)},"*")}
if(window.ResizeObserver)new ResizeObserver(send).observe(document.documentElement);addEventListener("load",send);
addEventListener("message",function(e){if(e.source===parent&&e.data&&typeof e.data.tcsTheme==="string"){document.getElementById("tcs-theme").textContent=e.data.tcsTheme;send()}});
parent.postMessage({tcsCustomCode:id,ready:true},"*")})();`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_top">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONT_CSS}">
<style>${FALLBACK_THEME}html{height:auto}body{margin:0;display:flow-root;background:transparent;font-family:var(--font-figtree);color:var(--color-primary-900)}</style>
<style id="tcs-theme"></style><style>${guard(css, "style")}</style></head>
<body>${html}<script>${bridge}</script><script>${guard(js, "script")}</script></body></html>`;
}

// The site's theme as the page has it now (tokens.css plus Site Settings
// colours), and the text colour around the frame.
function themeFor(el: HTMLElement): string {
  const root = getComputedStyle(document.documentElement);
  const vars: string[] = [];
  for (let i = 0; i < root.length; i++) {
    const name = root[i];
    if (name.startsWith("--color-") || name.startsWith("--font-")) vars.push(`${name}:${root.getPropertyValue(name).trim()}`);
  }
  return `:root{${vars.join(";")}}body{color:${getComputedStyle(el).color}}`;
}

export default function CustomCodeWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const html = text("html");
  const css = text("css");
  const js = text("js");
  const fixed = Number.parseInt(text("height"), 10);
  const fixedHeight = Number.isFinite(fixed) && fixed > 0 ? Math.min(fixed, MAX_HEIGHT) : null;

  const wrapper = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const sendTheme = () => {
      const win = frame.current?.contentWindow;
      if (win && wrapper.current) win.postMessage({ tcsTheme: themeFor(wrapper.current) }, "*");
    };
    const onMessage = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const data = e.data as { tcsCustomCode?: number; height?: number; ready?: boolean } | null;
      if (!data || data.tcsCustomCode !== section.id) return;
      if (data.ready) sendTheme();
      if (typeof data.height === "number" && data.height >= 0) setHeight(Math.min(Math.ceil(data.height), MAX_HEIGHT));
    };
    window.addEventListener("message", onMessage);
    sendTheme(); // the frame may have loaded before this page hydrated
    return () => window.removeEventListener("message", onMessage);
  }, [section.id]);

  if (!html.trim() && !js.trim()) return null;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--custom-code", section)}>
      <div ref={wrapper} className="section-container">
        <iframe
          ref={frame}
          title={text("title") || "Interactive component"}
          srcDoc={frameDocument(section.id, html, css, js)}
          sandbox={SANDBOX}
          allow="clipboard-write; fullscreen"
          loading="lazy"
          scrolling={fixedHeight ? "auto" : "no"}
          className="custom-code-frame block w-full border-0 bg-transparent"
          style={{ height: fixedHeight ?? height ?? 150, colorScheme: "normal" }}
        />
      </div>
    </SectionTag>
  );
}
