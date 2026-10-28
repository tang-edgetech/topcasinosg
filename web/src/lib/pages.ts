/**
 * Data-fetching + field-access helpers for the block-based Pages CMS
 * (admin/src/app/dashboard/pages). A page is an ordered list of sections;
 * each section is one of a fixed set of blockTypes and holds an EAV-style
 * field list (see api/internal/domain/page.go) — itemIndex 0 holds the
 * section's own singular fields, itemIndex >= 1 each hold one repeatable
 * item's fields (an icon box, a gallery image, ...).
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Scheduled-publish pages can flip visibility at any moment — keep this
// short, matching every other content fetcher in web/.
const REVALIDATE_SECONDS = 60;

export type PageFieldType = "text" | "richtext" | "image" | "button";

export interface PageSectionField {
  itemIndex: number;
  fieldKey: string;
  fieldType: PageFieldType;
  textValue: string;
  mediaId: number | null;
  mediaUrl: string | null;
  urlValue: string;
  sortOrder: number;
}

export type PageBlockType =
  | "container"
  | "global_section"
  | "title_set"
  | "image"
  | "button_group"
  | "spacer"
  | "video"
  | "hero"
  | "rich_text"
  | "icon_box_group"
  | "logo_strip"
  | "stats_counter"
  | "faq"
  | "bonus_calculator"
  | "team_grid"
  | "top_casinos_by_region"
  | "blacklist_preview"
  | "content_carousel"
  | "region_explorer"
  | "event_highlights"
  | "introduction_section"
  | "numbered_steps"
  | "feature_cards"
  | "checklist_callout"
  | "game_rtp_carousel"
  | "highlight_panel"
  | "link_card_grid"
  | "top_bonus_picks"
  | "expandable_card_grid"
  | "review_columns"
  | "cta_link_list"
  | "info_card_columns"
  | "game_casino_finder"
  | "two_column_table"
  | "data_table";

export interface PageSection {
  id: number;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  inContainer?: boolean;
  sortOrder: number;
  fields: PageSectionField[];
}

export interface PageMeta {
  id: number;
  parentId: number | null;
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headSnippet: string;
  bodySnippet: string;
  footerSnippet: string;
}

export interface PageWithSections {
  page: PageMeta;
  sections: PageSection[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

// `path` can be a single slug ("home") or a full hierarchical path
// ("legal/privacy-policy") - the API resolves either the same way (see
// api/internal/service/page_service.go's ResolvePath). Each segment is
// encoded individually rather than the whole string, since encoding the "/"
// separators themselves would turn a multi-segment path into one that no
// longer matches the API's `{path...}` route.
// {year} works in any page text (headings, meta title, ...) so copy like
// "Best Casinos in {year}" never goes stale.
function fillYear(result: PageWithSections): PageWithSections {
  const year = String(new Date().getFullYear());
  const fill = (text: string) => (text && text.includes("{year}") ? text.replaceAll("{year}", year) : text);
  return {
    page: { ...result.page, title: fill(result.page.title), metaTitle: fill(result.page.metaTitle), metaDescription: fill(result.page.metaDescription) },
    sections: result.sections.map((s) => ({ ...s, fields: s.fields.map((f) => ({ ...f, textValue: fill(f.textValue) })) })),
  };
}

export async function getPage(path: string): Promise<PageWithSections | null> {
  try {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(`${API_BASE_URL}/api/pages/${encodedPath}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as ApiEnvelope<{ page?: PageMeta; sections?: PageSection[] }>;
    if (!body.success || !body.data?.page) return null;

    return fillYear({ page: body.data.page, sections: body.data.sections ?? [] });
  } catch {
    return null;
  }
}

// One global section's sections (GET /api/global-sections/{id}), with the
// same {year} filling as page content.
export async function getGlobalSections(id: number): Promise<PageSection[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/global-sections/${id}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiEnvelope<{ sections?: PageSection[] }>;
    if (!body.success) return null;
    const year = String(new Date().getFullYear());
    return (body.data?.sections ?? []).map((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.textValue?.includes("{year}") ? { ...f, textValue: f.textValue.replaceAll("{year}", year) } : f)),
    }));
  } catch {
    return null;
  }
}

export function field(fields: PageSectionField[], itemIndex: number, key: string): PageSectionField | undefined {
  return fields.find((f) => f.itemIndex === itemIndex && f.fieldKey === key);
}

export function itemIndexes(fields: PageSectionField[]): number[] {
  return Array.from(new Set(fields.filter((f) => f.itemIndex > 0).map((f) => f.itemIndex))).sort((a, b) => a - b);
}

// This site's own address, for media URLs: NEXT_PUBLIC_SITE_URL in
// production (https://topcasinosg.com.sg), localhost:4000 in development.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000").replace(/\/+$/, "");
const UPLOADS_PREFIX = "/uploads/";

// mediaUrl turns a stored media path into the address pages use. Uploads
// (/uploads/<file>, also as a full API URL) are served from this site at
// /assets/images/<file> — src/app/assets/images/[file]/route.ts reads them
// from the API's upload folder on this machine — so
// image addresses are on the website's domain, never the API's. Other full
// URLs pass through; other paths are this site's own files (e.g. /certifications/...).
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith(`${API_BASE_URL}${UPLOADS_PREFIX}`)) url = url.slice(API_BASE_URL.length);
  if (url.startsWith(UPLOADS_PREFIX)) return `${SITE_URL}/assets/images/${url.slice(UPLOADS_PREFIX.length)}`;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Figma title sizes: large = section title (36/43), medium = sub-title
// inside a band (26/31). Used by Title & Text and Blacklist Preview.
const HEADING_SIZE_CLASSES: Record<string, string> = {
  large: "text-[36px] leading-[43px]",
  medium: "text-[26px] leading-[31px]",
};

export function headingSizeClassName(size: string | undefined): string {
  return HEADING_SIZE_CLASSES[size ?? ""] ?? HEADING_SIZE_CLASSES.large;
}

export function sectionClassName(canonical: string, section: Pick<PageSection, "customClass">): string {
  return ["section", canonical, section.customClass].filter(Boolean).join(" ");
}

// Reusable responsive-column convention for any repeatable-item block: 1
// column on mobile, 2 on tablet, and an admin-chosen 1/2/3 on desktop
// (>=1200px — not a stock Tailwind breakpoint, hence the arbitrary
// `min-[1200px]:` variant). Keep new block types on this same convention
// (see admin's ColumnsField) so column behavior stays consistent site-wide.
// Full class names (not interpolated) so Tailwind generates every option.
// The tablet step uses min-[640px] rather than sm: because Tailwind sorts
// arbitrary min-[...] variants before named ones, so sm:grid-cols-2 would
// always beat min-[1200px]:grid-cols-N.
const DESKTOP_COLUMN_CLASSES: Record<string, string> = {
  "1": "min-[1200px]:grid-cols-1",
  "2": "min-[1200px]:grid-cols-2",
  "3": "min-[1200px]:grid-cols-3",
  "4": "min-[1200px]:grid-cols-4",
};

export function columnsClassName(columns: string | undefined): string {
  return `grid-cols-1 min-[640px]:grid-cols-2 ${DESKTOP_COLUMN_CLASSES[columns ?? ""] ?? DESKTOP_COLUMN_CLASSES["3"]}`;
}

export type ButtonStyle = "primary" | "secondary" | "outline" | "white";

const BUTTON_STYLE_CLASSES: Record<ButtonStyle, string> = {
  primary: "bg-primary-900 text-white hover:bg-gradient-to-r hover:from-primary-900 hover:to-primary-glow",
  secondary: "bg-secondary-600 text-primary-900 hover:bg-secondary-700",
  outline: "border border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white",
  white: "bg-white text-primary-900 hover:bg-primary-50",
};

export function buttonClassName(style: string | undefined): string {
  const key = (style as ButtonStyle) in BUTTON_STYLE_CLASSES ? (style as ButtonStyle) : "primary";
  return `inline-flex w-fit cursor-pointer items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition-colors ${BUTTON_STYLE_CLASSES[key]}`;
}

// Same fixed 4-token palette as BUTTON_STYLE_CLASSES/admin's
// COLOR_THEME_OPTIONS, but resolved to a CSS color value rather than a
// className — used where a component needs the raw color (e.g. as a CSS
// custom property for a normal/hover/active swap, see IconBoxGroupSection).
const COLOR_THEME_VALUES: Record<string, string> = {
  primary: "var(--color-primary-900)",
  secondary: "var(--color-secondary-600)",
  white: "#ffffff",
  muted: "var(--color-text-muted)",
};

export function colorThemeValue(token: string | undefined): string {
  return COLOR_THEME_VALUES[token ?? ""] ?? COLOR_THEME_VALUES.primary;
}

// Palette for a `.section--bg` bleed background's gradient stops (see
// IntroductionSection.tsx) - a separate token set from COLOR_THEME_VALUES
// since a background gradient reasonably wants stops (e.g. "danger") that
// wouldn't make sense as icon/text color options. Resolved to a CSS custom
// property rather than a className, exactly like colorThemeValue, so the
// admin-picked color is data the component renders rather than a
// component-owned "theme" it maps from a hardcoded enum.
const SECTION_BG_COLOR_VALUES: Record<string, string> = {
  "primary-900": "var(--color-primary-900)",
  "primary-glow": "var(--color-primary-glow)",
  "secondary-600": "var(--color-secondary-600)",
  danger: "var(--color-danger)",
  white: "#ffffff",
  "surface-muted": "var(--color-surface-muted)",
};

export function sectionBgColorValue(token: string | undefined): string {
  return SECTION_BG_COLOR_VALUES[token ?? ""] ?? SECTION_BG_COLOR_VALUES["primary-900"];
}

export interface SectionBg {
  hasBleedBg: boolean;
  style: Record<string, string>;
}

// Reads the admin-authored bgType/bgFrom/bgTo/bgImage fields any block type
// can opt into (see admin/src/app/dashboard/pages/BlockFields.tsx's
// SectionBackgroundFields) and turns them into what a component needs to
// render `.section--bg`'s bleed background (shared/theme/sections.css):
// whether to add the `section--bg` class at all, and the inline style
// carrying its `--section-bg-*` custom properties. `defaults` lets each
// block type preserve whatever fixed look it had before this field existed
// (e.g. CTA defaulting to a solid indigo fill) for section rows saved
// before the field was added, rather than every un-migrated section
// suddenly going transparent.
export function sectionBgStyle(
  fields: PageSectionField[],
  defaults: { bgType?: string; bgFrom?: string; bgTo?: string } = {}
): SectionBg {
  const bgType = field(fields, 0, "bgType")?.textValue || defaults.bgType || "none";
  if (bgType === "none") return { hasBleedBg: false, style: {} };

  const bgFrom = field(fields, 0, "bgFrom")?.textValue || defaults.bgFrom || "primary-900";
  const bgTo = field(fields, 0, "bgTo")?.textValue || defaults.bgTo || "primary-glow";
  const bgImageUrl = mediaUrl(field(fields, 0, "bgImage")?.mediaUrl);

  if (bgType === "image" && bgImageUrl) {
    return { hasBleedBg: true, style: { "--section-bg-image": `url(${bgImageUrl})` } };
  }
  if (bgType === "gradient") {
    return {
      hasBleedBg: true,
      style: { "--section-bg-from": sectionBgColorValue(bgFrom), "--section-bg-to": sectionBgColorValue(bgTo) },
    };
  }
  if (bgType === "color") {
    const value = sectionBgColorValue(bgFrom);
    return { hasBleedBg: true, style: { "--section-bg-from": value, "--section-bg-to": value } };
  }
  return { hasBleedBg: false, style: {} };
}

const ALIGN_ITEMS_CLASSES: Record<string, string> = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};

const ALIGN_TEXT_CLASSES: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Independent mobile/desktop alignment for a heading+paragraph block (see
// IconBoxGroupSection.tsx) - two admin-picked tokens ("left"/"center"/
// "right") rather than one, since the same block can reasonably want to
// read centered on a narrow mobile column but left-align once it has room
// on desktop. "sm" (640px) is the split, matching the same breakpoint
// columnsClassName already treats as "no longer mobile" above.
export function headingAlignClassName(mobile: string | undefined, desktop: string | undefined): string {
  const m = ALIGN_ITEMS_CLASSES[mobile ?? ""] ? mobile! : "left";
  const d = ALIGN_ITEMS_CLASSES[desktop ?? ""] ? desktop! : "left";
  return `${ALIGN_ITEMS_CLASSES[m]} ${ALIGN_TEXT_CLASSES[m]} sm:${ALIGN_ITEMS_CLASSES[d]} sm:${ALIGN_TEXT_CLASSES[d]}`;
}

// The editor's unsaved sections (GET /api/page-previews/{token}), never
// cached: every refresh of the backoffice's live preview is a new token.
export async function getPagePreview(token: string): Promise<PageWithSections | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/page-previews/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiEnvelope<{ page?: PageMeta; sections?: PageSection[] }>;
    if (!body.success || !body.data?.page) return null;
    return fillYear({ page: body.data.page, sections: body.data.sections ?? [] });
  } catch {
    return null;
  }
}

const PANEL_TITLE_KEYS = ["panelTitle", "heading", "headingLine1", "title", "tagline", "caption"];

// Title of a component shown as a tab or accordion item in a Container: its
// own "Tab / item title", else its heading, else "Tab N".
export function panelTitle(section: PageSection, index: number): string {
  for (const key of PANEL_TITLE_KEYS) {
    const value = field(section.fields, 0, key)?.textValue?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (value) return value;
  }
  return `Tab ${index + 1}`;
}

// "Hide on mobile/tablet/desktop" presets (custom_class section--hide-*,
// shared/theme/sections.css), copied onto a tab button, accordion item or
// slide so hiding a component also hides its handle.
export function visibilityClasses(section: Pick<PageSection, "customClass">): string {
  return section.customClass
    .split(/\s+/)
    .filter((cls) => cls.startsWith("section--hide-"))
    .join(" ");
}
