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
  | "hero"
  | "rich_text"
  | "icon_box_group"
  | "image_gallery"
  | "cta"
  | "logo_strip"
  | "stats_counter"
  | "faq"
  | "bonus_calculator"
  | "bonus_listing_table"
  | "team_grid"
  | "top_casinos_by_region"
  | "blacklist_preview"
  | "content_carousel"
  | "region_explorer"
  | "casino_comparison_table"
  | "event_highlights"
  | "introduction_section";

export interface PageSection {
  id: number;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
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
export async function getPage(path: string): Promise<PageWithSections | null> {
  try {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(`${API_BASE_URL}/api/pages/${encodedPath}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as ApiEnvelope<{ page?: PageMeta; sections?: PageSection[] }>;
    if (!body.success || !body.data?.page) return null;

    return { page: body.data.page, sections: body.data.sections ?? [] };
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

export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

export function sectionClassName(canonical: string, section: Pick<PageSection, "customClass">): string {
  return ["section", canonical, section.customClass].filter(Boolean).join(" ");
}

// Reusable responsive-column convention for any repeatable-item block: 1
// column on mobile, 2 on tablet, and an admin-chosen 1/2/3 on desktop
// (>=1200px — not a stock Tailwind breakpoint, hence the arbitrary
// `min-[1200px]:` variant). Keep new block types on this same convention
// (see admin's ColumnsField) so column behavior stays consistent site-wide.
export function columnsClassName(columns: string | undefined): string {
  const desktop = columns === "1" || columns === "2" || columns === "3" ? columns : "3";
  return `grid-cols-1 sm:grid-cols-2 min-[1200px]:grid-cols-${desktop}`;
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
