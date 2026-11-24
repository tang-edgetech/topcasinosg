import type { SitemapReason, SitemapType } from "./types";

// Shared wording for Settings > Sitemap and the Sitemap box in SEO tabs.
// The API decides what is listed (api/internal/service/sitemap_service.go).

export const SITEMAP_TYPES: { value: SitemapType; label: string; one: string }[] = [
  { value: "page", label: "Pages", one: "Page" },
  { value: "casino", label: "Casino reviews", one: "Casino review" },
  { value: "guide", label: "Guides", one: "Guide" },
  { value: "news", label: "News", one: "News" },
  { value: "bonus", label: "Bonuses", one: "Bonus" },
  { value: "listing", label: "List pages (/casinos, /guides, /news, /blacklist)", one: "List page" },
];

export function sitemapTypeLabel(type: SitemapType, single = false): string {
  const t = SITEMAP_TYPES.find((x) => x.value === type);
  return t ? (single ? t.one : t.label) : type;
}

export const SITEMAP_REASONS: Record<SitemapReason, { label: string; tone: "ok" | "off" | "warn" }> = {
  listed: { label: "Listed", tone: "ok" },
  included: { label: "Listed · always include", tone: "ok" },
  excluded: { label: "Excluded", tone: "off" },
  type_off: { label: "Not listed · type off", tone: "off" },
  noindex: { label: "Not listed · noindex", tone: "warn" },
  redirected: { label: "Not listed · redirected", tone: "warn" },
  unpublished: { label: "Not published yet", tone: "warn" },
};

export const SITEMAP_TONE_CLASSES: Record<"ok" | "off" | "warn", string> = {
  ok: "bg-success/10 text-success",
  off: "bg-danger/10 text-danger",
  warn: "bg-secondary-600/15 text-secondary-900",
};
