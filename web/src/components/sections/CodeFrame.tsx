"use client";

import { useEffect, useRef, useState } from "react";

// Runs HTML, CSS and JavaScript written in the backoffice (a custom_code
// block, or a Component from the Components library) in a sandboxed
// iframe: its own document with an opaque origin, so the code can't touch
// this page, read the site's cookies (SameSite=Strict anyway) or call the
// backoffice as a signed-in user. That is what lets any code go in without
// the HTML sanitizer.
//
// The frame reports its content height and the page sizes it to match
// (unless fixedHeight is set), and the page sends in the site's theme as CSS
// variables plus the text colour around the frame, so the code can match the
// site's look: var(--color-primary-900), var(--font-figtree) ... A
// component's settings are window.settings inside the frame.

const SANDBOX = "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals";
const MAX_HEIGHT = 20000;
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap";

// Used until the page sends the live theme (and in an exported copy of the
// page opened without the site's scripts).
const FALLBACK_THEME = `:root{--color-primary-50:#e7e9f4;--color-primary-100:#c3c8e5;--color-primary-200:#9da4d3;--color-primary-300:#7781c1;--color-primary-400:#5a65b4;--color-primary-500:#3e4ba8;--color-primary-600:#38439e;--color-primary-700:#2f3a92;--color-primary-800:#273086;--color-primary-900:#1a1e71;--color-primary-glow:#3139d7;--color-secondary-50:#fdf8e1;--color-secondary-100:#fbedb4;--color-secondary-200:#fae183;--color-secondary-300:#f8d650;--color-secondary-400:#f7cc2a;--color-secondary-500:#f7c30b;--color-secondary-600:#f7b500;--color-secondary-700:#f7a300;--color-secondary-800:#f89200;--color-secondary-900:#f87300;--color-success:#00bb9e;--color-success-subtle:#e6f9f6;--color-danger:#ff4553;--color-surface:#ffffff;--color-surface-muted:#e7e9f4;--font-figtree:"Figtree",ui-sans-serif,system-ui,sans-serif}`;

// "</script" inside the code would end the element early.
const guard = (code: string, tag: string) => code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);

// JSON that is safe inside a <script> element.
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

function frameDocument(frameId: string, html: string, css: string, js: string, settings: Record<string, string>): string {
  // Runs before the code: reports the content height, and applies the
  // theme the page sends. Only messages from the page itself count.
  const bridge = `window.settings=${scriptJson(settings)};(function(){var id=${scriptJson(frameId)};function send(){parent.postMessage({tcsCodeFrame:id,height:Math.ceil(document.documentElement.getBoundingClientRect().height)},"*")}
if(window.ResizeObserver)new ResizeObserver(send).observe(document.documentElement);addEventListener("load",send);
addEventListener("message",function(e){if(e.source===parent&&e.data&&typeof e.data.tcsTheme==="string"){document.getElementById("tcs-theme").textContent=e.data.tcsTheme;send()}});
parent.postMessage({tcsCodeFrame:id,ready:true},"*")})();`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_top">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONT_CSS}">
<style>${FALLBACK_THEME}html{height:auto}body{margin:0;display:flow-root;background:transparent;font-family:var(--font-figtree);color:var(--color-primary-900)}</style>
<style id="tcs-theme"></style><style>${guard(css, "style")}</style></head>
<body>${html}<script>${guard(bridge, "script")}</script><script>${guard(js, "script")}</script></body></html>`;
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

export default function CodeFrame({
  frameId,
  html,
  css,
  js,
  title,
  settings = {},
  fixedHeight,
  className,
}: {
  frameId: string;
  html: string;
  css: string;
  js: string;
  title: string;
  settings?: Record<string, string>;
  fixedHeight?: number | null;
  className?: string;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const fixed = fixedHeight && fixedHeight > 0 ? Math.min(fixedHeight, MAX_HEIGHT) : null;

  useEffect(() => {
    const sendTheme = () => {
      const win = frame.current?.contentWindow;
      if (win && wrapper.current) win.postMessage({ tcsTheme: themeFor(wrapper.current) }, "*");
    };
    const onMessage = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const data = e.data as { tcsCodeFrame?: string; height?: number; ready?: boolean } | null;
      if (!data || data.tcsCodeFrame !== frameId) return;
      if (data.ready) sendTheme();
      if (typeof data.height === "number" && data.height >= 0) setHeight(Math.min(Math.ceil(data.height), MAX_HEIGHT));
    };
    window.addEventListener("message", onMessage);
    sendTheme(); // the frame may have loaded before this page hydrated
    return () => window.removeEventListener("message", onMessage);
  }, [frameId]);

  return (
    <div ref={wrapper} className={className}>
      <iframe
        ref={frame}
        title={title}
        srcDoc={frameDocument(frameId, html, css, js, settings)}
        sandbox={SANDBOX}
        allow="clipboard-write; fullscreen"
        loading="lazy"
        scrolling={fixed ? "auto" : "no"}
        className="code-frame block w-full border-0 bg-transparent"
        style={{ height: fixed ?? height ?? 150, colorScheme: "normal" }}
      />
    </div>
  );
}
