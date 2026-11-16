"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentSetting } from "@/lib/types";

// Live preview of a component while it's edited, run the way the public site
// runs it (web/src/components/sections/CodeFrame.tsx and ComponentBlock.tsx,
// kept in step by hand): a sandboxed iframe, {{key}} in the HTML and
// window.settings in the JavaScript filled from the settings' defaults, the
// site's colours as CSS variables, and the height following the content.

const SANDBOX = "allow-scripts allow-forms allow-modals";
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap";
const THEME = `:root{--color-primary-50:#e7e9f4;--color-primary-100:#c3c8e5;--color-primary-200:#9da4d3;--color-primary-300:#7781c1;--color-primary-400:#5a65b4;--color-primary-500:#3e4ba8;--color-primary-600:#38439e;--color-primary-700:#2f3a92;--color-primary-800:#273086;--color-primary-900:#1a1e71;--color-primary-glow:#3139d7;--color-secondary-50:#fdf8e1;--color-secondary-100:#fbedb4;--color-secondary-200:#fae183;--color-secondary-300:#f8d650;--color-secondary-400:#f7cc2a;--color-secondary-500:#f7c30b;--color-secondary-600:#f7b500;--color-secondary-700:#f7a300;--color-secondary-800:#f89200;--color-secondary-900:#f87300;--color-success:#00bb9e;--color-success-subtle:#e6f9f6;--color-danger:#ff4553;--color-surface:#ffffff;--color-surface-muted:#e7e9f4;--font-figtree:"Figtree",ui-sans-serif,system-ui,sans-serif}`;

const guard = (code: string, tag: string) => code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function fillSettings(html: string, settings: ComponentSetting[], values: Record<string, string>) {
  const inHtml: Record<string, string> = {};
  const plain: Record<string, string> = {};
  for (const s of settings) {
    const value = (values[s.key] ?? "").trim() === "" ? s.default : values[s.key];
    plain[s.key] = value;
    inHtml[s.key] = s.type === "richtext" ? value : s.type === "textarea" ? escapeHtml(value).replace(/\r?\n/g, "<br>") : escapeHtml(value);
  }
  const filled = html.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g, (match, key: string) => (key in inHtml ? inHtml[key] : match));
  return { html: filled, settings: plain };
}

export default function ComponentPreview({
  html,
  css,
  js,
  settings,
  values = {},
}: {
  html: string;
  css: string;
  js: string;
  settings: ComponentSetting[];
  values?: Record<string, string>;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(150);
  const [frameId] = useState(() => `preview-${Math.random().toString(36).slice(2)}`);

  const srcDoc = useMemo(() => {
    const filled = fillSettings(html, settings, values);
    const bridge = `window.settings=${scriptJson(filled.settings)};(function(){var id=${scriptJson(frameId)};function send(){parent.postMessage({tcsCodeFrame:id,height:Math.ceil(document.documentElement.getBoundingClientRect().height)},"*")}
if(window.ResizeObserver)new ResizeObserver(send).observe(document.documentElement);addEventListener("load",send)})();`;
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${FONT_CSS}"><style>${THEME}html{height:auto}body{margin:0;display:flow-root;background:transparent;font-family:var(--font-figtree);color:var(--color-primary-900)}</style>
<style>${guard(css, "style")}</style></head><body>${filled.html}<script>${guard(bridge, "script")}</script><script>${guard(js, "script")}</script></body></html>`;
  }, [html, css, js, settings, values, frameId]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const data = e.data as { tcsCodeFrame?: string; height?: number } | null;
      if (data?.tcsCodeFrame === frameId && typeof data.height === "number") setHeight(Math.min(Math.max(Math.ceil(data.height), 40), 4000));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameId]);

  return (
    <iframe
      ref={frame}
      title="Component preview"
      srcDoc={srcDoc}
      sandbox={SANDBOX}
      className="component-preview block w-full rounded-md border border-border bg-white dark:border-border-dark"
      style={{ height, colorScheme: "light" }}
    />
  );
}
