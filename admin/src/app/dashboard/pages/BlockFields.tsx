"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Checkbox, Input, Radio, Select } from "antd";
import RichTextEditor from "@/components/content/RichTextEditor";
import MediaPicker from "@/components/media/MediaPicker";
import IconButton from "@/components/IconButton";
import { IconPhoto, IconPlus, IconTrash } from "@/components/Icons";
import { api } from "@/lib/api";
import type { CasinoDTO, GlobalSectionDTO, MediaDTO, PageBlockType, PageFieldType, RegionDTO } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

// The component editor's Style tab (SectionBuilder) provides a DOM node;
// StyleFields renders its children there instead of in place, so each
// block editor keeps its look controls (background, size, alignment,
// colour) next to the rest of its code while editors see them under Style.
// With no Style tab around, they render in place.
export const StyleTabTarget = createContext<HTMLElement | null | undefined>(undefined);

export function StyleFields({ children }: { children: React.ReactNode }) {
  const target = useContext(StyleTabTarget);
  if (target === undefined) return <>{children}</>;
  return target ? createPortal(<div className="flex flex-col gap-4">{children}</div>, target) : null;
}

export interface EditableField {
  itemIndex: number;
  fieldKey: string;
  fieldType: PageFieldType;
  textValue: string;
  mediaId: number | null;
  mediaUrl: string | null;
  urlValue: string;
  sortOrder: number;
}

function blankField(itemIndex: number, fieldKey: string, fieldType: PageFieldType, sortOrder: number): EditableField {
  return { itemIndex, fieldKey, fieldType, textValue: "", mediaId: null, mediaUrl: null, urlValue: "", sortOrder };
}

export const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  container: "Container",
  global_section: "Global Section",
  title_set: "Title & Text",
  image: "Image",
  button_group: "Buttons",
  spacer: "Spacer / Divider",
  video: "Video",
  hero: "Hero Banner",
  rich_text: "Rich Text",
  icon_box_group: "Icon Box Group",
  logo_strip: "Logo Strip (Acknowledgement)",
  stats_counter: "Stats Counter (Track Record)",
  faq: "FAQ",
  bonus_calculator: "Bonus Calculator",
  team_grid: "Team Grid",
  top_casinos_by_region: "Top Casinos By Region",
  blacklist_preview: "Blacklist Preview",
  content_carousel: "Content Carousel (Guides/News)",
  region_explorer: "Region Explorer",
  event_highlights: "Event Highlights",
  introduction_section: "Introduction Section",
  numbered_steps: "Numbered Steps",
  feature_cards: "Feature Cards",
  checklist_callout: "Checklist Callout",
  game_rtp_carousel: "Game RTP Carousel",
  highlight_panel: "Highlight Panel (Two-Tone Heading)",
  link_card_grid: "Link Card Grid",
  top_bonus_picks: "Top Bonus Picks",
  expandable_card_grid: "Expandable Card Grid",
  review_columns: "Player Reviews (Positive / Complaints)",
  cta_link_list: "Link Button List",
  info_card_columns: "Info Card Columns",
  game_casino_finder: "Game Casino Finder",
  two_column_table: "Two-Column Table",
  data_table: "Data Table",
};

const BONUS_TYPE_OPTIONS = [
  { value: "welcome", label: "Welcome" },
  { value: "no_deposit", label: "No Deposit" },
  { value: "free_spins", label: "Free Spins" },
  { value: "deposit", label: "Deposit" },
  { value: "cashback", label: "Cashback" },
  { value: "loyalty_vip", label: "Loyalty / VIP" },
];

export type ButtonStyle = "primary" | "secondary" | "outline" | "white";

export const BUTTON_STYLE_OPTIONS: { value: ButtonStyle; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
  { value: "white", label: "White" },
];

export const COLOR_THEME_OPTIONS = [
  { value: "primary", label: "Primary (indigo)" },
  { value: "secondary", label: "Secondary (gold)" },
  { value: "white", label: "White" },
  { value: "muted", label: "Muted" },
];

// Gradient-stop palette for Introduction Section's bleed background (see
// IntroductionSectionFields below and web/src/lib/pages.ts's
// sectionBgColorValue, which resolves these same token values on render) -
// a separate token set from COLOR_THEME_OPTIONS since a background wants
// stops (e.g. "Danger red") that wouldn't make sense as icon/text colors.
export const SECTION_BG_COLOR_OPTIONS = [
  { value: "primary-900", label: "Primary (indigo)" },
  { value: "primary-glow", label: "Primary Glow (blue)" },
  { value: "secondary-600", label: "Secondary (gold)" },
  { value: "danger", label: "Danger (red)" },
  { value: "white", label: "White" },
  { value: "surface-muted", label: "Muted (grey)" },
];

// Background mode for a `.section--bg` bleed background (see
// IconBoxGroupSection.tsx): "none" skips the bleed entirely (transparent
// section, e.g. Homepage's "Our Review Process"), "color" renders a flat
// fill (bgFrom used for both gradient stops), "gradient" uses bgFrom/bgTo as
// distinct stops, "image" uses a media-picked cover image instead.
export const SECTION_BG_TYPE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "color", label: "Solid Color" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image" },
];

export const HEADING_ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const DISPLAY_MODE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "dropdown", label: "Dropdown" },
  { value: "expandable", label: "Cards with \"+\" to expand" },
];

const LAYOUT_OPTIONS = [
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
];

function textField(itemIndex: number, key: string, value: string, sortOrder: number): EditableField {
  return { ...blankField(itemIndex, key, "text", sortOrder), textValue: value };
}

export function defaultFieldsForBlockType(blockType: PageBlockType): EditableField[] {
  switch (blockType) {
    case "container":
      return [
        textField(0, "bgType", "none", 1),
        textField(0, "bgFrom", "primary-900", 2),
        textField(0, "bgTo", "danger", 3),
        blankField(0, "bgImage", "image", 4),
        textField(0, "layout", "stack", 5),
      ];
    case "global_section":
      return [blankField(0, "globalId", "text", 1)];
    case "image":
      return [
        blankField(0, "image", "image", 1),
        blankField(0, "alt", "text", 2),
        blankField(0, "caption", "text", 3),
        blankField(0, "linkUrl", "text", 4),
        textField(0, "size", "full", 5),
        textField(0, "align", "center", 6),
        textField(0, "rounded", "yes", 7),
      ];
    case "button_group":
      return [
        textField(0, "align", "left", 1),
        blankField(1, "button", "button", 1),
        textField(1, "buttonStyle", "primary", 2),
        textField(1, "newTab", "no", 3),
      ];
    case "spacer":
      return [textField(0, "size", "m", 1), textField(0, "divider", "no", 2)];
    case "video":
      return [
        blankField(0, "url", "text", 1),
        blankField(0, "title", "text", 2),
        blankField(0, "caption", "text", 3),
        textField(0, "size", "full", 4),
        textField(0, "align", "center", 5),
      ];
    case "title_set":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "highlightText", "text", 2),
        blankField(0, "text", "text", 3),
        textField(0, "headingSize", "large", 4),
        textField(0, "align", "left", 5),
        textField(0, "textTone", "auto", 6),
        textField(0, "bgType", "none", 7),
        textField(0, "bgFrom", "primary-900", 8),
        textField(0, "bgTo", "primary-glow", 9),
        blankField(0, "bgImage", "image", 10),
      ];
    case "hero":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        blankField(0, "image", "image", 3),
        blankField(0, "button", "button", 4),
        textField(0, "buttonStyle", "primary", 5),
        textField(0, "bgType", "gradient", 6),
        textField(0, "bgFrom", "primary-900", 7),
        textField(0, "bgTo", "primary-glow", 8),
        blankField(0, "bgImage", "image", 9),
      ];
    case "rich_text":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "body", "richtext", 2),
        blankField(0, "image", "image", 3),
        textField(0, "bgType", "none", 4),
        textField(0, "bgFrom", "primary-900", 5),
        textField(0, "bgTo", "primary-glow", 6),
        blankField(0, "bgImage", "image", 7),
      ];
    case "icon_box_group":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "displayMode", "default", 2),
        textField(0, "layout", "vertical", 3),
        textField(0, "columns", "3", 4),
        textField(0, "colorNormal", "primary", 5),
        textField(0, "colorHover", "secondary", 6),
        textField(0, "colorActive", "primary", 7),
        blankField(0, "body", "richtext", 8),
        textField(0, "headingAlignMobile", "left", 9),
        textField(0, "headingAlignDesktop", "left", 10),
        textField(0, "bgType", "color", 11),
        textField(0, "bgFrom", "surface-muted", 12),
        textField(0, "bgTo", "surface-muted", 13),
        blankField(0, "bgImage", "image", 14),
      ];
    case "logo_strip":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "none", 2),
        textField(0, "bgFrom", "primary-900", 3),
        textField(0, "bgTo", "primary-glow", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "stats_counter":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "color", 2),
        textField(0, "bgFrom", "surface-muted", 3),
        textField(0, "bgTo", "surface-muted", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "faq":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "none", 2),
        textField(0, "bgFrom", "primary-900", 3),
        textField(0, "bgTo", "primary-glow", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "bonus_calculator":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        blankField(0, "intro", "richtext", 3),
        textField(0, "bgType", "none", 4),
        textField(0, "bgFrom", "primary-900", 5),
        textField(0, "bgTo", "primary-glow", 6),
        blankField(0, "bgImage", "image", 7),
      ];
    case "team_grid":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "none", 2),
        textField(0, "bgFrom", "primary-900", 3),
        textField(0, "bgTo", "primary-glow", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "top_casinos_by_region":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "mode", "auto", 2),
        textField(0, "moreCount", "3", 3),
        blankField(0, "regionCode", "text", 4),
        textField(0, "bgType", "none", 5),
        textField(0, "bgFrom", "primary-900", 6),
        textField(0, "bgTo", "primary-glow", 7),
        blankField(0, "bgImage", "image", 8),
      ];
    case "blacklist_preview":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        textField(0, "limit", "6", 3),
        textField(0, "seeAllUrl", "/blacklist", 4),
        blankField(0, "regionCode", "text", 5),
        textField(0, "bgType", "none", 6),
        textField(0, "bgFrom", "primary-900", 7),
        textField(0, "bgTo", "primary-glow", 8),
        blankField(0, "bgImage", "image", 9),
      ];
    case "content_carousel":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "sourceType", "guides", 2),
        textField(0, "mode", "manual", 3),
        textField(0, "limit", "4", 4),
        blankField(0, "seeAllUrl", "text", 5),
        textField(0, "bgType", "none", 6),
        textField(0, "bgFrom", "primary-900", 7),
        textField(0, "bgTo", "primary-glow", 8),
        blankField(0, "bgImage", "image", 9),
      ];
    case "region_explorer":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "none", 2),
        textField(0, "bgFrom", "primary-900", 3),
        textField(0, "bgTo", "primary-glow", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "event_highlights":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "none", 2),
        textField(0, "bgFrom", "primary-900", 3),
        textField(0, "bgTo", "primary-glow", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "introduction_section":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "highlightText", "text", 2),
        blankField(0, "subheading", "text", 3),
        blankField(0, "paragraph", "richtext", 4),
        textField(0, "bgFrom", "primary-900", 5),
        textField(0, "bgTo", "primary-glow", 6),
      ];
    case "numbered_steps":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        blankField(0, "intro", "richtext", 3),
        textField(0, "bgType", "color", 4),
        textField(0, "bgFrom", "surface-muted", 5),
        textField(0, "bgTo", "surface-muted", 6),
        blankField(0, "bgImage", "image", 7),
      ];
    case "feature_cards":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "bgType", "none", 2),
        textField(0, "bgFrom", "primary-900", 3),
        textField(0, "bgTo", "primary-glow", 4),
        blankField(0, "bgImage", "image", 5),
      ];
    case "checklist_callout":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subtext", "text", 2),
        textField(0, "bgType", "color", 3),
        textField(0, "bgFrom", "secondary-600", 4),
        textField(0, "bgTo", "secondary-600", 5),
        blankField(0, "bgImage", "image", 6),
      ];
    case "game_rtp_carousel":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "seeAllUrl", "text", 2),
        textField(0, "bgType", "color", 3),
        textField(0, "bgFrom", "surface-muted", 4),
        textField(0, "bgTo", "surface-muted", 5),
        blankField(0, "bgImage", "image", 6),
        textField(0, "source", "auto", 10),
        textField(0, "category", "slot", 11),
        textField(0, "limit", "10", 12),
      ];
    case "highlight_panel":
      return [
        blankField(0, "headingLine1", "text", 1),
        textField(0, "headingLine1Color", "primary", 2),
        blankField(0, "headingLine2", "text", 3),
        textField(0, "headingLine2Color", "danger", 4),
        blankField(0, "intro", "richtext", 5),
        blankField(0, "box1Heading", "text", 6),
        blankField(0, "box1Body", "richtext", 7),
        blankField(0, "box2Heading", "text", 8),
        blankField(0, "box2Body", "richtext", 9),
        blankField(0, "noteText", "text", 10),
        blankField(0, "noteLinkUrl", "text", 11),
        blankField(0, "noteLinkLabel", "text", 12),
        textField(0, "bgType", "none", 13),
        textField(0, "bgFrom", "primary-900", 14),
        textField(0, "bgTo", "primary-glow", 15),
        blankField(0, "bgImage", "image", 16),
      ];
    case "link_card_grid":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "intro", "richtext", 2),
        textField(0, "columns", "2", 3),
        textField(0, "bgType", "none", 4),
        textField(0, "bgFrom", "primary-900", 5),
        textField(0, "bgTo", "primary-glow", 6),
        blankField(0, "bgImage", "image", 7),
      ];
    case "top_bonus_picks":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "intro", "richtext", 2),
        blankField(0, "regionCode", "text", 3),
        textField(0, "bonusType", "welcome", 4),
        textField(0, "limit", "3", 5),
        textField(0, "bgType", "none", 6),
        textField(0, "bgFrom", "primary-900", 7),
        textField(0, "bgTo", "primary-glow", 8),
        blankField(0, "bgImage", "image", 9),
      ];
    case "expandable_card_grid":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "tagline", "text", 2),
        blankField(0, "intro", "richtext", 3),
        blankField(0, "outro", "richtext", 4),
        textField(0, "bgType", "none", 5),
        textField(0, "bgFrom", "primary-900", 6),
        textField(0, "bgTo", "primary-glow", 7),
        blankField(0, "bgImage", "image", 8),
      ];
    case "review_columns":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "positiveLabel", "Positive Feedback Highlights", 2),
        textField(0, "complaintLabel", "Common Complaints & How They Were Resolved", 3),
        textField(0, "bgType", "color", 4),
        textField(0, "bgFrom", "surface-muted", 5),
        textField(0, "bgTo", "surface-muted", 6),
        blankField(0, "bgImage", "image", 7),
      ];
    case "cta_link_list":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "intro", "richtext", 2),
        textField(0, "bgType", "none", 3),
        textField(0, "bgFrom", "primary-900", 4),
        textField(0, "bgTo", "primary-glow", 5),
        blankField(0, "bgImage", "image", 6),
      ];
    case "info_card_columns":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "intro", "richtext", 2),
        textField(0, "bgType", "none", 3),
        textField(0, "bgFrom", "primary-900", 4),
        textField(0, "bgTo", "primary-glow", 5),
        blankField(0, "bgImage", "image", 6),
      ];
    case "data_table":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "intro", "richtext", 2),
        textField(0, "source", "casinos", 3),
        blankField(0, "regionCode", "text", 4),
        textField(0, "limit", "10", 5),
      ];
    case "two_column_table":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "intro", "richtext", 2),
        textField(0, "headerLeft", "Term", 3),
        textField(0, "headerRight", "Simple Explanation", 4),
        blankField(0, "outro", "richtext", 5),
      ];
    case "game_casino_finder":
      return [
        textField(0, "heading", "Choose an Online Casino Based on Your Playing Style", 1),
        textField(0, "panelTitle", "What Game Would You Like to Start Off with", 2),
        textField(0, "panelSubtitle", "Select one of the following options", 3),
        blankField(0, "regionCode", "text", 4),
        textField(0, "limit", "3", 5),
      ];
  }
}

// Reusable across any block that offers a responsive column count — same
// 1/2/3-at-desktop, 2-at-tablet, 1-at-mobile convention (see
// web/src/lib/pages.ts's columnsClassName). Keep new block types using this
// same field shape (fieldKey "columns", values "1"|"2"|"3") so they can
// reuse this component directly.
export function ColumnsField({
  value,
  onChange,
  label = "Columns per row (desktop ≥ 1200px)",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <LabeledField label={label}>
      <Select
        value={value || "3"}
        onChange={onChange}
        options={[
          { value: "1", label: "1 column" },
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
          { value: "4", label: "4 columns" },
        ]}
      />
    </LabeledField>
  );
}

// Shared by every button field so a button's text/url/style edit together
// in one upsert pass, keeping the two EAV rows (the "button" field and its
// sibling "<key>Style" field) in sync.
function applyButtonFieldPatch(
  fields: EditableField[],
  itemIndex: number,
  buttonKey: string,
  styleKey: string,
  sortOrderBase: number,
  current: { textValue: string; urlValue: string; styleValue: string },
  patch: { textValue?: string; urlValue?: string; styleValue?: string }
): EditableField[] {
  let next = fields;
  if (patch.textValue !== undefined || patch.urlValue !== undefined) {
    next = upsertField(next, itemIndex, buttonKey, "button", sortOrderBase, {
      textValue: patch.textValue ?? current.textValue,
      urlValue: patch.urlValue ?? current.urlValue,
    });
  }
  if (patch.styleValue !== undefined) {
    next = upsertField(next, itemIndex, styleKey, "text", sortOrderBase + 1, { textValue: patch.styleValue });
  }
  return next;
}

function getField(fields: EditableField[], itemIndex: number, fieldKey: string): EditableField | undefined {
  return fields.find((f) => f.itemIndex === itemIndex && f.fieldKey === fieldKey);
}

function upsertField(
  fields: EditableField[],
  itemIndex: number,
  fieldKey: string,
  fieldType: PageFieldType,
  sortOrder: number,
  patch: Partial<EditableField>
): EditableField[] {
  const idx = fields.findIndex((f) => f.itemIndex === itemIndex && f.fieldKey === fieldKey);
  if (idx >= 0) {
    const next = [...fields];
    next[idx] = { ...next[idx], ...patch };
    return next;
  }
  return [...fields, { ...blankField(itemIndex, fieldKey, fieldType, sortOrder), ...patch }];
}

function itemIndexes(fields: EditableField[]): number[] {
  return Array.from(new Set(fields.filter((f) => f.itemIndex > 0).map((f) => f.itemIndex))).sort((a, b) => a - b);
}

function nextItemIndex(fields: EditableField[]): number {
  const items = itemIndexes(fields);
  return items.length > 0 ? Math.max(...items) + 1 : 1;
}

// ---- Field atoms ---------------------------------------------------------

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">{label}</label>
      {children}
    </div>
  );
}

function TextInputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <LabeledField label={label}>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </LabeledField>
  );
}

function RichTextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <LabeledField label={label}>
      <RichTextEditor value={value} onChange={onChange} />
    </LabeledField>
  );
}

function ImagePickerField({
  label,
  mediaId,
  mediaUrl: url,
  onChange,
}: {
  label: string;
  mediaId: number | null;
  mediaUrl: string | null;
  onChange: (mediaId: number, mediaUrl: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <LabeledField label={label}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <IconPhoto width={20} height={20} className="text-primary-400" />
          )}
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
        >
          Choose From Media Library
        </button>
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaDTO) => onChange(media.id, mediaUrl(media.url))}
      />
    </LabeledField>
  );
}

// Reusable background control for any block type - None / Solid Color /
// Gradient / Image, mirroring web/src/lib/pages.ts's sectionBgStyle (which
// resolves these same field keys back into the `.section--bg` bleed
// background's CSS custom properties on render, see shared/theme/
// sections.css). Each caller passes its own default* props matching
// whatever fixed look that block type had before this field existed, so
// existing un-migrated sections keep rendering the same way, and its own
// sortOrders since different block types have different numbers of fields
// ahead of these four.
function SectionBackgroundFields({
  fields,
  onChange,
  sortOrders,
  defaultBgType = "none",
  defaultBgFrom = "primary-900",
  defaultBgTo = "primary-glow",
}: {
  fields: EditableField[];
  onChange: (f: EditableField[]) => void;
  sortOrders: { bgType: number; bgFrom: number; bgTo: number; bgImage: number };
  defaultBgType?: string;
  defaultBgFrom?: string;
  defaultBgTo?: string;
}) {
  const bgType = getField(fields, 0, "bgType")?.textValue || defaultBgType;
  const bgFrom = getField(fields, 0, "bgFrom")?.textValue || defaultBgFrom;
  const bgTo = getField(fields, 0, "bgTo")?.textValue || defaultBgTo;
  const bgImage = getField(fields, 0, "bgImage");

  function setStyleField(key: string, sortOrder: number, value: string) {
    onChange(upsertField(fields, 0, key, "text", sortOrder, { textValue: value }));
  }

  return (
    <StyleFields>
    <div className="section-bg-fields flex flex-col gap-3 rounded-md bg-surface-muted p-4 dark:bg-surface-muted-dark">
      <LabeledField label="Section Background">
        <Select value={bgType} onChange={(v) => setStyleField("bgType", sortOrders.bgType, v)} options={SECTION_BG_TYPE_OPTIONS} />
      </LabeledField>
      {bgType === "color" && (
        <LabeledField label="Color">
          <Select value={bgFrom} onChange={(v) => setStyleField("bgFrom", sortOrders.bgFrom, v)} options={SECTION_BG_COLOR_OPTIONS} />
        </LabeledField>
      )}
      {bgType === "gradient" && (
        <div className="flex gap-3">
          <LabeledField label="From">
            <Select value={bgFrom} onChange={(v) => setStyleField("bgFrom", sortOrders.bgFrom, v)} options={SECTION_BG_COLOR_OPTIONS} />
          </LabeledField>
          <LabeledField label="To">
            <Select value={bgTo} onChange={(v) => setStyleField("bgTo", sortOrders.bgTo, v)} options={SECTION_BG_COLOR_OPTIONS} />
          </LabeledField>
        </div>
      )}
      {bgType === "image" && (
        <ImagePickerField
          label="Background Image"
          mediaId={bgImage?.mediaId ?? null}
          mediaUrl={bgImage?.mediaUrl ?? null}
          onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, 0, "bgImage", "image", sortOrders.bgImage, { mediaId, mediaUrl }))}
        />
      )}
    </div>
    </StyleFields>
  );
}

function ButtonField({
  label,
  textValue,
  urlValue,
  styleValue,
  onChange,
}: {
  label: string;
  textValue: string;
  urlValue: string;
  styleValue: string;
  onChange: (patch: { textValue?: string; urlValue?: string; styleValue?: string }) => void;
}) {
  return (
    <LabeledField label={label}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Input placeholder="Button label" value={textValue} onChange={(e) => onChange({ textValue: e.target.value })} />
        <Input placeholder="Link URL (e.g. /casinos)" value={urlValue} onChange={(e) => onChange({ urlValue: e.target.value })} />
        <Select value={styleValue || "primary"} onChange={(v) => onChange({ styleValue: v })} options={BUTTON_STYLE_OPTIONS} />
      </div>
    </LabeledField>
  );
}

// ---- Per-block-type composed editors -------------------------------------

interface BlockFieldsProps {
  blockType: PageBlockType;
  fields: EditableField[];
  onChange: (fields: EditableField[]) => void;
}

export default function BlockFieldEditor({ blockType, fields, onChange }: BlockFieldsProps) {
  switch (blockType) {
    case "container":
      return <ContainerFields fields={fields} onChange={onChange} />;
    case "global_section":
      return <GlobalSectionFields fields={fields} onChange={onChange} />;
    case "title_set":
      return <TitleSetFields fields={fields} onChange={onChange} />;
    case "image":
      return <ImageFields fields={fields} onChange={onChange} />;
    case "button_group":
      return <ButtonGroupFields fields={fields} onChange={onChange} />;
    case "spacer":
      return <SpacerFields fields={fields} onChange={onChange} />;
    case "video":
      return <VideoFields fields={fields} onChange={onChange} />;
    case "hero":
      return <HeroFields fields={fields} onChange={onChange} />;
    case "rich_text":
      return <RichTextBlockFields fields={fields} onChange={onChange} />;
    case "icon_box_group":
      return <IconBoxGroupFields fields={fields} onChange={onChange} />;
    case "logo_strip":
      return <LogoStripFields fields={fields} onChange={onChange} />;
    case "stats_counter":
      return <StatsCounterFields fields={fields} onChange={onChange} />;
    case "faq":
      return <FaqFields fields={fields} onChange={onChange} />;
    case "bonus_calculator":
      return <BonusCalculatorFields fields={fields} onChange={onChange} />;
    case "team_grid":
      return <TeamGridFields fields={fields} onChange={onChange} />;
    case "top_casinos_by_region":
      return <TopCasinosByRegionFields fields={fields} onChange={onChange} />;
    case "blacklist_preview":
      return <BlacklistPreviewFields fields={fields} onChange={onChange} />;
    case "content_carousel":
      return <ContentCarouselFields fields={fields} onChange={onChange} />;
    case "region_explorer":
      return <RegionExplorerFields fields={fields} onChange={onChange} />;
    case "event_highlights":
      return <EventHighlightsFields fields={fields} onChange={onChange} />;
    case "introduction_section":
      return <IntroductionSectionFields fields={fields} onChange={onChange} />;
    case "numbered_steps":
      return <NumberedStepsFields fields={fields} onChange={onChange} />;
    case "feature_cards":
      return <FeatureCardsFields fields={fields} onChange={onChange} />;
    case "checklist_callout":
      return <ChecklistCalloutFields fields={fields} onChange={onChange} />;
    case "game_rtp_carousel":
      return <GameRtpCarouselFields fields={fields} onChange={onChange} />;
    case "highlight_panel":
      return <HighlightPanelFields fields={fields} onChange={onChange} />;
    case "link_card_grid":
      return <LinkCardGridFields fields={fields} onChange={onChange} />;
    case "top_bonus_picks":
      return <TopBonusPicksFields fields={fields} onChange={onChange} />;
    case "expandable_card_grid":
      return <ExpandableCardGridFields fields={fields} onChange={onChange} />;
    case "review_columns":
      return <ReviewColumnsFields fields={fields} onChange={onChange} />;
    case "cta_link_list":
      return <CtaLinkListFields fields={fields} onChange={onChange} />;
    case "info_card_columns":
      return <InfoCardColumnsFields fields={fields} onChange={onChange} />;
    case "game_casino_finder":
      return <GameCasinoFinderFields fields={fields} onChange={onChange} />;
    case "two_column_table":
      return <TwoColumnTableFields fields={fields} onChange={onChange} />;
    case "data_table":
      return <DataTableFields fields={fields} onChange={onChange} />;
  }
}

function HeroFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const image = getField(fields, 0, "image");
  const button = getField(fields, 0, "button");
  const buttonStyle = getField(fields, 0, "buttonStyle");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Subheading"
        value={subheading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <ImagePickerField
        label="Image"
        mediaId={image?.mediaId ?? null}
        mediaUrl={image?.mediaUrl ?? null}
        onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, 0, "image", "image", 3, { mediaId, mediaUrl }))}
      />
      <ButtonField
        label="Button"
        textValue={button?.textValue ?? ""}
        urlValue={button?.urlValue ?? ""}
        styleValue={buttonStyle?.textValue ?? "primary"}
        onChange={(patch) =>
          onChange(
            applyButtonFieldPatch(
              fields,
              0,
              "button",
              "buttonStyle",
              4,
              { textValue: button?.textValue ?? "", urlValue: button?.urlValue ?? "", styleValue: buttonStyle?.textValue ?? "primary" },
              patch
            )
          )
        }
      />
      <SectionBackgroundFields
        fields={fields}
        onChange={onChange}
        sortOrders={{ bgType: 6, bgFrom: 7, bgTo: 8, bgImage: 9 }}
        defaultBgType="gradient"
        defaultBgFrom="primary-900"
        defaultBgTo="primary-glow"
      />
    </div>
  );
}

function RichTextBlockFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const body = getField(fields, 0, "body");
  const image = getField(fields, 0, "image");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading (optional)"
        value={heading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Body"
        value={body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "body", "richtext", 2, { textValue: v }))}
      />
      <ImagePickerField
        label="Image (optional — shown side-by-side with the body when set)"
        mediaId={image?.mediaId ?? null}
        mediaUrl={image?.mediaUrl ?? null}
        onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, 0, "image", "image", 3, { mediaId, mediaUrl }))}
      />
      {!image?.mediaId && (
        <LabeledField label="Text position">
          <Select
            value={getField(fields, 0, "align")?.textValue || "center"}
            onChange={(v) => onChange(upsertField(fields, 0, "align", "text", 8, { textValue: v }))}
            options={[
              { value: "center", label: "Centred, reading width" },
              { value: "left", label: "Narrow column on the left" },
            ]}
          />
        </LabeledField>
      )}
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 4, bgFrom: 5, bgTo: 6, bgImage: 7 }} />
    </div>
  );
}

function IconBoxGroupFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const body = getField(fields, 0, "body");
  const displayMode = getField(fields, 0, "displayMode")?.textValue || "default";
  const layout = getField(fields, 0, "layout")?.textValue || "vertical";
  const columns = getField(fields, 0, "columns")?.textValue || "3";
  const colorNormal = getField(fields, 0, "colorNormal")?.textValue || "primary";
  const colorHover = getField(fields, 0, "colorHover")?.textValue || "secondary";
  const colorActive = getField(fields, 0, "colorActive")?.textValue || "primary";
  const headingAlignMobile = getField(fields, 0, "headingAlignMobile")?.textValue || "left";
  const headingAlignDesktop = getField(fields, 0, "headingAlignDesktop")?.textValue || "left";
  const items = itemIndexes(fields);

  function setStyleField(key: string, sortOrder: number, value: string) {
    onChange(upsertField(fields, 0, key, "text", sortOrder, { textValue: value }));
  }

  function addBox() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "icon", "image", 1),
      blankField(idx, "heading", "text", 2),
      blankField(idx, "text", "richtext", 3),
    ]);
  }

  function removeBox(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Our Review Process"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Section Paragraph (optional)"
        value={body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "body", "richtext", 8, { textValue: v }))}
      />

      <div className="icon-box-style-row grid grid-cols-2 gap-3 rounded-md bg-surface-muted p-4 sm:grid-cols-3 dark:bg-surface-muted-dark">
        <LabeledField label="Display">
          <Select value={displayMode} onChange={(v) => setStyleField("displayMode", 2, v)} options={DISPLAY_MODE_OPTIONS} />
        </LabeledField>
        {displayMode === "default" && (
          <LabeledField label="Layout">
            <Select value={layout} onChange={(v) => setStyleField("layout", 3, v)} options={LAYOUT_OPTIONS} />
          </LabeledField>
        )}
        <ColumnsField value={columns} onChange={(v) => setStyleField("columns", 4, v)} label="Columns (desktop)" />
        <LabeledField label="Normal Color">
          <Select value={colorNormal} onChange={(v) => setStyleField("colorNormal", 5, v)} options={COLOR_THEME_OPTIONS} />
        </LabeledField>
        <LabeledField label="Hover Color">
          <Select value={colorHover} onChange={(v) => setStyleField("colorHover", 6, v)} options={COLOR_THEME_OPTIONS} />
        </LabeledField>
        <LabeledField label={displayMode === "dropdown" ? "Active (Open) Color" : "Active Color"}>
          <Select value={colorActive} onChange={(v) => setStyleField("colorActive", 7, v)} options={COLOR_THEME_OPTIONS} />
        </LabeledField>
        <LabeledField label="Heading Alignment (Mobile)">
          <Select value={headingAlignMobile} onChange={(v) => setStyleField("headingAlignMobile", 9, v)} options={HEADING_ALIGN_OPTIONS} />
        </LabeledField>
        <LabeledField label="Heading Alignment (Desktop)">
          <Select value={headingAlignDesktop} onChange={(v) => setStyleField("headingAlignDesktop", 10, v)} options={HEADING_ALIGN_OPTIONS} />
        </LabeledField>
      </div>

      <SectionBackgroundFields
        fields={fields}
        onChange={onChange}
        sortOrders={{ bgType: 11, bgFrom: 12, bgTo: 13, bgImage: 14 }}
        defaultBgType="color"
        defaultBgFrom="surface-muted"
        defaultBgTo="surface-muted"
      />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const icon = getField(fields, itemIndex, "icon");
          const boxHeading = getField(fields, itemIndex, "heading");
          const boxText = getField(fields, itemIndex, "text");
          const button = getField(fields, itemIndex, "button");
          const buttonStyle = getField(fields, itemIndex, "buttonStyle");
          return (
            <div
              key={itemIndex}
              className="icon-box-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Box {itemIndex}</span>
                <IconButton
                  id={`icon-box-${itemIndex}-remove`}
                  title="Remove Box"
                  onClick={() => removeBox(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Icon"
                mediaId={icon?.mediaId ?? null}
                mediaUrl={icon?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "icon", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Heading"
                value={boxHeading?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "heading", "text", 2, { textValue: v }))}
              />
              <RichTextField
                label="Text"
                value={boxText?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "text", "richtext", 3, { textValue: v }))}
              />
              <ButtonField
                label="CTA Button (optional — hidden if the label is left blank)"
                textValue={button?.textValue ?? ""}
                urlValue={button?.urlValue ?? ""}
                styleValue={buttonStyle?.textValue ?? "primary"}
                onChange={(patch) =>
                  onChange(
                    applyButtonFieldPatch(
                      fields,
                      itemIndex,
                      "button",
                      "buttonStyle",
                      4,
                      { textValue: button?.textValue ?? "", urlValue: button?.urlValue ?? "", styleValue: buttonStyle?.textValue ?? "primary" },
                      patch
                    )
                  )
                }
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addBox}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Box
      </button>
    </div>
  );
}

function LogoStripFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addLogo() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "logo", "image", 1), blankField(idx, "name", "text", 2), blankField(idx, "url", "text", 3)]);
  }

  function removeLogo(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading (optional)"
        value={heading?.textValue ?? ""}
        placeholder="Trusted & Licensed"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((itemIndex) => {
          const logo = getField(fields, itemIndex, "logo");
          const name = getField(fields, itemIndex, "name");
          const url = getField(fields, itemIndex, "url");
          return (
            <div key={itemIndex} className="logo-strip-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Logo {itemIndex}</span>
                <IconButton
                  id={`logo-strip-${itemIndex}-remove`}
                  title="Remove Logo"
                  onClick={() => removeLogo(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Logo"
                mediaId={logo?.mediaId ?? null}
                mediaUrl={logo?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "logo", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Name"
                value={name?.textValue ?? ""}
                placeholder="PAGCOR"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "name", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Link (optional)"
                value={url?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "url", "text", 3, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addLogo}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Logo
      </button>
    </div>
  );
}

const STAT_SOURCE_OPTIONS = [
  { value: "", label: "Typed number" },
  { value: "casinos", label: "Casinos reviewed (live count)" },
  { value: "blacklist", label: "Blacklisted operators (live count)" },
  { value: "regions", label: "Active regions (live count)" },
  { value: "guides", label: "Guides published (live count)" },
];

function StatsCounterFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addStat() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "prefix", "text", 1),
      blankField(idx, "number", "text", 2),
      blankField(idx, "suffix", "text", 3),
      blankField(idx, "title", "text", 4),
      blankField(idx, "content", "text", 5),
      blankField(idx, "source", "text", 6),
    ]);
  }

  function removeStat(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Our Track Record"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <SectionBackgroundFields
        fields={fields}
        onChange={onChange}
        sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }}
      />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const source = getField(fields, itemIndex, "source")?.textValue ?? "";
          const prefix = getField(fields, itemIndex, "prefix");
          const number = getField(fields, itemIndex, "number");
          const suffix = getField(fields, itemIndex, "suffix");
          const title = getField(fields, itemIndex, "title");
          const content = getField(fields, itemIndex, "content");
          return (
            <div
              key={itemIndex}
              className="stats-counter-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Stat {itemIndex}</span>
                <IconButton
                  id={`stat-${itemIndex}-remove`}
                  title="Remove Stat"
                  onClick={() => removeStat(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <LabeledField label="Number comes from">
                <Select
                  value={source}
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "source", "text", 6, { textValue: v }))}
                  options={STAT_SOURCE_OPTIONS}
                />
              </LabeledField>
              <div className="grid grid-cols-3 gap-2">
                <TextInputField
                  label="Prefix"
                  value={prefix?.textValue ?? ""}
                  placeholder="e.g. +"
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "prefix", "text", 1, { textValue: v }))}
                />
                <TextInputField
                  label={source ? "Number (blank = live count)" : "Number"}
                  value={number?.textValue ?? ""}
                  placeholder={source ? "Live" : "50"}
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "number", "text", 2, { textValue: v }))}
                />
                <TextInputField
                  label="Suffix"
                  value={suffix?.textValue ?? ""}
                  placeholder="e.g. +"
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "suffix", "text", 3, { textValue: v }))}
                />
              </div>
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                placeholder="Casinos Reviewed"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 4, { textValue: v }))}
              />
              <TextInputField
                label="Description (optional)"
                value={content?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "content", "text", 5, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addStat}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Stat
      </button>
    </div>
  );
}

function FaqFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addFaq() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "question", "text", 1), blankField(idx, "answer", "richtext", 2)]);
  }

  function removeFaq(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Frequently Asked Questions"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }} />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const question = getField(fields, itemIndex, "question");
          const answer = getField(fields, itemIndex, "answer");
          return (
            <div key={itemIndex} className="faq-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Question {itemIndex}</span>
                <IconButton
                  id={`faq-${itemIndex}-remove`}
                  title="Remove Question"
                  onClick={() => removeFaq(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <TextInputField
                label="Question"
                value={question?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "question", "text", 1, { textValue: v }))}
              />
              <RichTextField
                label="Answer"
                value={answer?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "answer", "richtext", 2, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addFaq}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Question
      </button>
    </div>
  );
}

// Only the surrounding copy is admin-editable here — the widget's 5 inputs
// (deposit amount, bonus %, max bonus, wagering requirement, game
// contribution rate) and the calculation itself are fixed in
// BonusCalculatorSection on the web side, not configurable per-page (wagering
// applies to the bonus amount only, not deposit+bonus — see that file).
// Surrounding content (how-it-works steps, bonus type examples, FAQ) should
// be authored as separate rich_text/icon_box_group/faq blocks on the same
// page rather than folded into this one.
function BonusCalculatorFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const intro = getField(fields, 0, "intro");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Top-Rated Online Casino Bonus Calculator"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Subheading (optional)"
        value={subheading?.textValue ?? ""}
        placeholder="Check Your Real Bonus ROI"
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <RichTextField
        label="Intro Text (optional)"
        value={intro?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 3, { textValue: v }))}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Currency symbol"
          value={getField(fields, 0, "currency")?.textValue ?? ""}
          placeholder="$"
          onChange={(v) => onChange(upsertField(fields, 0, "currency", "text", 8, { textValue: v }))}
        />
        <LabeledField label="Wager on (pre-selected)">
          <Select
            value={getField(fields, 0, "wagerBasis")?.textValue || "bonus"}
            onChange={(v) => onChange(upsertField(fields, 0, "wagerBasis", "text", 9, { textValue: v }))}
            options={[
              { value: "bonus", label: "Bonus only" },
              { value: "deposit_bonus", label: "Deposit + Bonus" },
            ]}
          />
        </LabeledField>
      </div>
      <p className="text-xs text-text-muted dark:text-text-muted-dark">
        Visitors can still switch &quot;Wager on&quot; in the calculator. Results show total bonus, final wallet balance and total bet
        required.
      </p>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 4, bgFrom: 5, bgTo: 6, bgImage: 7 }} />
    </div>
  );
}

function TeamGridFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addMember() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "photo", "image", 1),
      blankField(idx, "name", "text", 2),
      blankField(idx, "title", "text", 3),
      blankField(idx, "quote", "text", 4),
    ]);
  }

  function removeMember(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Expert Team Behind the Reviews"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Intro line (optional)"
        value={getField(fields, 0, "intro")?.textValue ?? ""}
        placeholder="Our team includes veteran gamblers, ex-casino employees, and analysts."
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "text", 6, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((itemIndex) => {
          const photo = getField(fields, itemIndex, "photo");
          const name = getField(fields, itemIndex, "name");
          const title = getField(fields, itemIndex, "title");
          const quote = getField(fields, itemIndex, "quote");
          return (
            <div key={itemIndex} className="team-member-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Member {itemIndex}</span>
                <IconButton
                  id={`team-member-${itemIndex}-remove`}
                  title="Remove Member"
                  onClick={() => removeMember(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Photo"
                mediaId={photo?.mediaId ?? null}
                mediaUrl={photo?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "photo", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Name"
                value={name?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "name", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                placeholder="Casino Reviewer"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 3, { textValue: v }))}
              />
              <TextInputField
                label="Quote (optional)"
                value={quote?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "quote", "text", 4, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addMember}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Member
      </button>
    </div>
  );
}

// Live data block — no per-item admin content. For every active region (see
// web's getRegions()), the web renderer fetches that region's casinos
// (already sorted by rating desc, GET /api/casinos?region=X) and splits them
// into `highlightCount` highlight cards + the next `moreCount` in a table.
const TOP_CASINOS_DEFAULT_COLUMNS = ["cashback", "payments", "rating", "safeIndex"];

// Featured cards + "More Online Casinos in …" tables per country. Automatic
// mode follows the active regions and ratings; custom mode lets the editor
// pick each country, its featured casino and the casinos in its table.
function TopCasinosByRegionFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  const set = (key: string, order: number) => (v: string) => onChange(upsertField(fields, 0, key, "text", order, { textValue: v }));
  const setItem = (itemIndex: number, key: string, order: number) => (v: string) =>
    onChange(upsertField(fields, itemIndex, key, "text", order, { textValue: v }));
  const mode = text(0, "mode") === "custom" ? "custom" : "auto";
  const countries = itemIndexes(fields);
  const columnValues = text(0, "columns") ? text(0, "columns").split(",").filter(Boolean) : TOP_CASINOS_DEFAULT_COLUMNS;
  const casinoColumnOptions = DATA_TABLE_COLUMNS.filter((c) => c.source === "casino").map((c) => ({ value: c.value, label: c.label }));

  function addCountry() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "regionCode", "text", 1),
      blankField(idx, "casinoId", "text", 2),
      blankField(idx, "tableCasinoIds", "text", 3),
      textField(idx, "showTable", "yes", 4),
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text(0, "heading")}
        placeholder="Top Rated Casino of the Month by Country"
        onChange={set("heading", 1)}
      />
      <SourceChoiceField
        value={mode}
        onChange={set("mode", 2)}
        options={[
          { value: "auto", label: "Automatic", hint: "Every active region, its best-rated casino, then the next best" },
          { value: "custom", label: "Choose myself", hint: "Pick the countries, featured casinos and table casinos" },
        ]}
      />

      {mode === "custom" && (
        <RepeaterShell
          label="Country"
          idPrefix="top-casinos-country"
          itemIndexes={countries}
          onRemove={(itemIndex) => onChange(fields.filter((f) => f.itemIndex !== itemIndex))}
          onAdd={addCountry}
          addLabel="Add Country"
          renderItem={(itemIndex) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <RegionCodeField label="Country" value={text(itemIndex, "regionCode")} onChange={setItem(itemIndex, "regionCode", 1)} />
              <CasinoPickerField
                label="Featured card casino (empty = best rated)"
                value={text(itemIndex, "casinoId")}
                onChange={setItem(itemIndex, "casinoId", 2)}
              />
              <div className="sm:col-span-2">
                <CasinoMultiPickerField
                  label={'"More Online Casinos" table — casinos in order (empty = next best automatically)'}
                  value={text(itemIndex, "tableCasinoIds")}
                  onChange={setItem(itemIndex, "tableCasinoIds", 3)}
                />
              </div>
              <LabeledField label="Table">
                <Select
                  value={text(itemIndex, "showTable") === "no" ? "no" : "yes"}
                  onChange={setItem(itemIndex, "showTable", 4)}
                  options={[
                    { value: "yes", label: "Show the table" },
                    { value: "no", label: "Card only, no table" },
                  ]}
                />
              </LabeledField>
            </div>
          )}
        />
      )}

      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-4 dark:border-border-dark dark:bg-surface-muted-dark">
        <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Cards &amp; tables</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInputField label="Card bonus label" value={text(0, "bonusLabel")} placeholder="Welcome Bonus" onChange={set("bonusLabel", 9)} />
          <TextInputField
            label="Table heading ({region} = country name)"
            value={text(0, "tableHeading")}
            placeholder="More Online Casinos in {region}"
            onChange={set("tableHeading", 10)}
          />
          <TextInputField
            label="Rows per table (automatic tables)"
            value={text(0, "moreCount") || "3"}
            onChange={set("moreCount", 3)}
          />
          <TextInputField label="Table button label" value={text(0, "ctaLabel")} placeholder="Visit Site" onChange={set("ctaLabel", 11)} />
        </div>
        <LabeledField label="Table columns (between Brand and the button, in order)">
          <Select
            mode="multiple"
            value={columnValues}
            options={casinoColumnOptions}
            onChange={(values: string[]) => set("columns", 13)(values.join(","))}
          />
        </LabeledField>
        <p className="text-xs text-text-muted dark:text-text-muted-dark">
          Logos, ratings, links and payment methods come from each Casino; the card&apos;s offer is the casino&apos;s Welcome bonus in that
          region.
        </p>
      </div>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 5, bgFrom: 6, bgTo: 7, bgImage: 8 }} />
    </div>
  );
}

// Several casinos in a chosen order, stored as comma-separated ids.
function CasinoMultiPickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCasinos().then((list) => {
      if (cancelled) return;
      setCasinos(list);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LabeledField label={label}>
      <Select
        mode="multiple"
        allowClear
        showSearch
        optionFilterProp="label"
        loading={!loaded}
        placeholder="Next best casinos (automatic)"
        value={value.split(",").filter(Boolean)}
        onChange={(values: string[]) => onChange(values.join(","))}
        options={casinos.map((c) => ({ value: String(c.id), label: c.name }))}
      />
    </LabeledField>
  );
}

const HEADING_SIZE_OPTIONS = [
  { value: "large", label: "Large (36px section title)" },
  { value: "medium", label: "Medium (26px sub-title)" },
];

const TEXT_TONE_OPTIONS = [
  { value: "dark", label: "Dark text (for light backgrounds)" },
  { value: "light", label: "White text (for dark backgrounds)" },
];

const TITLE_TONE_OPTIONS = [{ value: "auto", label: "Follow container" }, ...TEXT_TONE_OPTIONS];

const SIZE_OPTIONS = [
  { value: "full", label: "Full width" },
  { value: "large", label: "Large (800px)" },
  { value: "medium", label: "Medium (560px)" },
  { value: "small", label: "Small (360px)" },
];

const ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
  { value: "right", label: "Right" },
];

const SPACE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "s", label: "Small (25px)" },
  { value: "m", label: "Medium (50px)" },
  { value: "l", label: "Large (80px)" },
];

function textOf(fields: EditableField[], key: string): string {
  return getField(fields, 0, key)?.textValue ?? "";
}

function textSetter(fields: EditableField[], onChange: (f: EditableField[]) => void) {
  return (key: string, order: number) => (v: string) => onChange(upsertField(fields, 0, key, "text", order, { textValue: v }));
}

// Container — one shared background for the components placed inside it
// (web ContainerSection), laid out as a stack or a 2/3/4-column grid; each
// component's own "Width in container" (in its Layout row) overrides the
// column width. The components bring their own titles and text.
function ContainerFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (key: string) => textOf(fields, key);
  const set = textSetter(fields, onChange);
  const grid = text("layout") === "grid";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-muted dark:text-text-muted-dark">
        Components inside this container share its background and layout. Add them with “+ Add Component Inside”, or use “Move Into
        Container Above” on the section right below the container. Layout, spacing, colours and background are in the Style tab; in a
        grid, set each component&apos;s width in its own Style tab.
      </p>
      <StyleFields>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LabeledField label="Layout">
          <Select
            value={grid ? "grid" : "stack"}
            onChange={set("layout", 5)}
            options={[
              { value: "stack", label: "Stack (one under another)" },
              { value: "grid", label: "Grid (columns)" },
            ]}
          />
        </LabeledField>
        {grid && (
          <LabeledField label="Columns (desktop)">
            <Select
              value={["2", "3", "4"].includes(text("columns")) ? text("columns") : "2"}
              onChange={set("columns", 6)}
              options={["2", "3", "4"].map((n) => ({ value: n, label: `${n} columns` }))}
            />
          </LabeledField>
        )}
        <LabeledField label="Gap between components">
          <Select
            value={text("gap") || (grid ? "m" : "l")}
            onChange={set("gap", 7)}
            options={[
              { value: "s", label: "Small (16px)" },
              { value: "m", label: "Medium (30px)" },
              { value: "l", label: "Large (50px)" },
            ]}
          />
        </LabeledField>
        {grid && (
          <LabeledField label="Vertical alignment">
            <Select
              value={text("align") || "stretch"}
              onChange={set("align", 8)}
              options={[
                { value: "stretch", label: "Stretch (equal height)" },
                { value: "start", label: "Top" },
                { value: "center", label: "Middle" },
                { value: "end", label: "Bottom" },
              ]}
            />
          </LabeledField>
        )}
        <LabeledField label="Content width">
          <Select
            value={text("contentWidth") || "1270"}
            onChange={set("contentWidth", 9)}
            options={[
              { value: "1270", label: "Boxed (1270px)" },
              { value: "960", label: "Narrow (960px)" },
              { value: "768", label: "Reading (768px)" },
              { value: "full", label: "Full width" },
            ]}
          />
        </LabeledField>
        <LabeledField label="Space above">
          <Select value={text("spaceTop") || "m"} onChange={set("spaceTop", 10)} options={SPACE_OPTIONS} />
        </LabeledField>
        <LabeledField label="Space below">
          <Select value={text("spaceBottom") || "m"} onChange={set("spaceBottom", 11)} options={SPACE_OPTIONS} />
        </LabeledField>
        <LabeledField label="Text colour inside">
          <Select value={text("textTone") === "light" ? "light" : "dark"} onChange={set("textTone", 12)} options={TEXT_TONE_OPTIONS} />
        </LabeledField>
      </div>
      <p className="text-xs text-text-muted dark:text-text-muted-dark">
        Text colour applies to Title &amp; Text (when set to “Follow container”), Rich Text, Image and Video captions and divider lines.
      </p>
      </StyleFields>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 1, bgFrom: 2, bgTo: 3, bgImage: 4 }} />
    </div>
  );
}

// Global Section — places one reusable global section (edited under Global
// Sections) here; its content is shared with every page that places it.
function GlobalSectionFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const [globals, setGlobals] = useState<GlobalSectionDTO[] | null>(null);
  const value = textOf(fields, "globalId");

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ globalSections: GlobalSectionDTO[] }>("/api/admin/global-sections")
      .then((data) => !cancelled && setGlobals(data.globalSections ?? []))
      .catch(() => !cancelled && setGlobals([]));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <LabeledField label="Global section">
        <Select
          showSearch
          optionFilterProp="label"
          loading={globals === null}
          placeholder="Choose a global section"
          value={value || undefined}
          onChange={textSetter(fields, onChange)("globalId", 1)}
          options={(globals ?? []).map((g) => ({ value: String(g.id), label: g.name }))}
        />
      </LabeledField>
      <p className="text-xs text-text-muted dark:text-text-muted-dark">
        Its content is edited once under Global Sections and shows the same on every page that places it.{" "}
        {value ? (
          <a href={`/dashboard/global-sections/${value}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
            Edit this global section ↗
          </a>
        ) : (
          <a href="/dashboard/global-sections" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
            Manage global sections ↗
          </a>
        )}
      </p>
    </div>
  );
}

// Image — media library image with optional link, caption, size and
// alignment (web ImageSection).
function ImageFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (key: string) => textOf(fields, key);
  const set = textSetter(fields, onChange);
  const image = getField(fields, 0, "image");

  return (
    <div className="flex flex-col gap-4">
      <ImagePickerField
        label="Image"
        mediaId={image?.mediaId ?? null}
        mediaUrl={image?.mediaUrl ?? null}
        onChange={(mediaId, url) => onChange(upsertField(fields, 0, "image", "image", 1, { mediaId, mediaUrl: url }))}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField label="Alt text (describes the image)" value={text("alt")} onChange={set("alt", 2)} />
        <TextInputField label="Caption (optional)" value={text("caption")} onChange={set("caption", 3)} />
        <TextInputField label="Link (optional)" value={text("linkUrl")} placeholder="/casinos" onChange={set("linkUrl", 4)} />
      </div>
      <StyleFields>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LabeledField label="Size">
          <Select value={text("size") || "full"} onChange={set("size", 5)} options={SIZE_OPTIONS} />
        </LabeledField>
        <LabeledField label="Alignment">
          <Select value={text("align") || "center"} onChange={set("align", 6)} options={ALIGN_OPTIONS} />
        </LabeledField>
        <LabeledField label="Corners">
          <Select
            value={text("rounded") === "no" ? "no" : "yes"}
            onChange={set("rounded", 7)}
            options={[
              { value: "yes", label: "Rounded" },
              { value: "no", label: "Square" },
            ]}
          />
        </LabeledField>
      </div>
      </StyleFields>
    </div>
  );
}

// Buttons — one or more link buttons in a row (web ButtonGroupSection).
function ButtonGroupFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  function addButton() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "button", "button", 1), textField(idx, "buttonStyle", "primary", 2), textField(idx, "newTab", "no", 3)]);
  }

  return (
    <div className="flex flex-col gap-4">
      <RepeaterShell
        label="Button"
        idPrefix="button-group-item"
        itemIndexes={itemIndexes(fields)}
        onRemove={(itemIndex) => onChange(fields.filter((f) => f.itemIndex !== itemIndex))}
        onAdd={addButton}
        addLabel="Add Button"
        renderItem={(itemIndex) => {
          const button = getField(fields, itemIndex, "button");
          const style = getField(fields, itemIndex, "buttonStyle")?.textValue ?? "primary";
          return (
            <div className="flex flex-col gap-3">
              <ButtonField
                label="Label, link and style"
                textValue={button?.textValue ?? ""}
                urlValue={button?.urlValue ?? ""}
                styleValue={style}
                onChange={(patch) =>
                  onChange(
                    applyButtonFieldPatch(
                      fields,
                      itemIndex,
                      "button",
                      "buttonStyle",
                      1,
                      { textValue: button?.textValue ?? "", urlValue: button?.urlValue ?? "", styleValue: style },
                      patch
                    )
                  )
                }
              />
              <Checkbox
                checked={getField(fields, itemIndex, "newTab")?.textValue === "yes"}
                onChange={(e) => onChange(upsertField(fields, itemIndex, "newTab", "text", 3, { textValue: e.target.checked ? "yes" : "no" }))}
              >
                Open in a new tab
              </Checkbox>
            </div>
          );
        }}
      />
      <StyleFields>
        <LabeledField label="Alignment">
          <Select value={textOf(fields, "align") || "left"} onChange={textSetter(fields, onChange)("align", 1)} options={ALIGN_OPTIONS} />
        </LabeledField>
      </StyleFields>
    </div>
  );
}

// Spacer / Divider — empty space of a preset height, optionally with a line
// (web SpacerSection).
function SpacerFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const set = textSetter(fields, onChange);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <LabeledField label="Height">
        <Select
          value={textOf(fields, "size") || "m"}
          onChange={set("size", 1)}
          options={[
            { value: "xs", label: "Extra small (16px)" },
            { value: "s", label: "Small (25px)" },
            { value: "m", label: "Medium (50px)" },
            { value: "l", label: "Large (80px)" },
            { value: "xl", label: "Extra large (120px)" },
          ]}
        />
      </LabeledField>
      <LabeledField label="Divider line">
        <Select
          value={textOf(fields, "divider") === "yes" ? "yes" : "no"}
          onChange={set("divider", 2)}
          options={[
            { value: "no", label: "No line, just space" },
            { value: "yes", label: "Line across the middle" },
          ]}
        />
      </LabeledField>
    </div>
  );
}

const VIDEO_URL_PATTERN = /(youtube\.com\/(watch|embed|shorts|live)|youtu\.be\/|vimeo\.com\/)/;

// Video — YouTube or Vimeo link, loaded on click (web VideoSection).
function VideoFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (key: string) => textOf(fields, key);
  const set = textSetter(fields, onChange);
  const url = text("url");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField label="YouTube or Vimeo link" value={url} placeholder="https://www.youtube.com/watch?v=…" onChange={set("url", 1)} />
      {url && !VIDEO_URL_PATTERN.test(url) && (
        <p className="text-xs text-danger">This doesn&apos;t look like a YouTube or Vimeo link, so the video won&apos;t show.</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField label="Title (for screen readers)" value={text("title")} onChange={set("title", 2)} />
        <TextInputField label="Caption (optional)" value={text("caption")} onChange={set("caption", 3)} />
      </div>
      <StyleFields>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledField label="Size">
            <Select value={text("size") || "full"} onChange={set("size", 4)} options={SIZE_OPTIONS} />
          </LabeledField>
          <LabeledField label="Alignment">
            <Select value={text("align") || "center"} onChange={set("align", 5)} options={ALIGN_OPTIONS} />
          </LabeledField>
        </div>
      </StyleFields>
    </div>
  );
}

// Title & Text — Figma "Comp / Title Set": a title (one word can be red)
// and a short line of text under it (web TitleSetSection).
function TitleSetFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (key: string) => getField(fields, 0, key)?.textValue ?? "";
  const set = (key: string, order: number) => (v: string) => onChange(upsertField(fields, 0, key, "text", order, { textValue: v }));

  return (
    <div className="flex flex-col gap-4">
      <TextInputField label="Title" value={text("heading")} placeholder="Blacklisted Casinos to Avoid" onChange={set("heading", 1)} />
      <TextInputField
        label="Highlight word in title (optional, shown in red)"
        value={text("highlightText")}
        placeholder="Avoid"
        onChange={set("highlightText", 2)}
      />
      <LabeledField label="Text (optional)">
        <Input.TextArea autoSize={{ minRows: 2 }} value={text("text")} onChange={(e) => set("text", 3)(e.target.value)} />
      </LabeledField>
      <StyleFields>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LabeledField label="Title size">
          <Select value={text("headingSize") === "medium" ? "medium" : "large"} onChange={set("headingSize", 4)} options={HEADING_SIZE_OPTIONS} />
        </LabeledField>
        <LabeledField label="Alignment">
          <Select
            value={text("align") === "center" ? "center" : "left"}
            onChange={set("align", 5)}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Centre" },
            ]}
          />
        </LabeledField>
        <LabeledField label="Text colour">
          <Select
            value={["light", "dark"].includes(text("textTone")) ? text("textTone") : "auto"}
            onChange={set("textTone", 6)}
            options={TITLE_TONE_OPTIONS}
          />
        </LabeledField>
      </div>
      </StyleFields>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 7, bgFrom: 8, bgTo: 9, bgImage: 10 }} />
    </div>
  );
}

// Live data block — fetches the most recently added published Blacklist
// entries (GET /api/blacklist, no region filter) at render time; only the
// surrounding copy and row count are admin-configured. Inside a Container,
// use the medium heading size (a sub-title under the Title & Text above).
function BlacklistPreviewFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const limit = getField(fields, 0, "limit");
  const seeAllUrl = getField(fields, 0, "seeAllUrl");
  const regionCode = getField(fields, 0, "regionCode");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Blacklisted Casinos to Avoid"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Highlight word in heading (optional, shown in red)"
        value={getField(fields, 0, "highlightText")?.textValue ?? ""}
        placeholder="Avoid"
        onChange={(v) => onChange(upsertField(fields, 0, "highlightText", "text", 10, { textValue: v }))}
      />
      <TextInputField
        label="Intro text under the heading (optional)"
        value={subheading?.textValue ?? ""}
        placeholder="Problems such as delays in payouts… have been reported at these casinos."
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <StyleFields>
        <LabeledField label="Heading size">
          <Select
            value={getField(fields, 0, "headingSize")?.textValue === "medium" ? "medium" : "large"}
            onChange={(v) => onChange(upsertField(fields, 0, "headingSize", "text", 11, { textValue: v }))}
            options={HEADING_SIZE_OPTIONS}
          />
        </LabeledField>
      </StyleFields>
      <TextInputField
        label="Max Entries"
        value={limit?.textValue ?? "6"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 3, { textValue: v }))}
      />
      <RegionCodeField
        label="Region Code"
        value={regionCode?.textValue ?? ""}
        emptyLabel="Global entries only"
        pageRegionOption
        onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 5, { textValue: v }))}
      />
      <TextInputField
        label={'"See All" Link'}
        value={seeAllUrl?.textValue ?? "/blacklist"}
        onChange={(v) => onChange(upsertField(fields, 0, "seeAllUrl", "text", 4, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 6, bgFrom: 7, bgTo: 8, bgImage: 9 }} />
    </div>
  );
}

const CAROUSEL_SOURCE_OPTIONS = [
  { value: "guides", label: "Guides" },
  { value: "news", label: "News" },
];

const CAROUSEL_MODE_OPTIONS = [
  { value: "manual", label: "Manually picked" },
  { value: "latest", label: "Latest (auto)" },
];

// One reusable carousel block covers all 3 Homepage instances (Guides
// Winning Strategies, How to Play, Latest Casino News) — Guide has no
// category field to auto-split "Winning Strategies" from "How to Play", so
// Guides carousels are always manually curated by slug; News has no such
// split need, so it supports "latest" auto mode too.
function ContentCarouselFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const sourceType = getField(fields, 0, "sourceType")?.textValue || "guides";
  const mode = getField(fields, 0, "mode")?.textValue || "manual";
  const limit = getField(fields, 0, "limit");
  const seeAllUrl = getField(fields, 0, "seeAllUrl");
  const items = itemIndexes(fields);

  function addItem() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "slug", "text", 1)]);
  }

  function removeItem(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Casino Guides: Winning Strategies"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Intro line (optional)"
        value={getField(fields, 0, "intro")?.textValue ?? ""}
        placeholder="How to Pick the Right Casino: learn how to identify safe sites."
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "text", 10, { textValue: v }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Source">
          <Select
            value={sourceType}
            onChange={(v) => onChange(upsertField(fields, 0, "sourceType", "text", 2, { textValue: v }))}
            options={CAROUSEL_SOURCE_OPTIONS}
          />
        </LabeledField>
        <LabeledField label="Mode">
          <Select
            value={mode}
            onChange={(v) => onChange(upsertField(fields, 0, "mode", "text", 3, { textValue: v }))}
            options={CAROUSEL_MODE_OPTIONS}
          />
        </LabeledField>
      </div>
      <TextInputField
        label="Max Items"
        value={limit?.textValue ?? "4"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 4, { textValue: v }))}
      />
      <TextInputField
        label={'"See All" Link (optional)'}
        value={seeAllUrl?.textValue ?? ""}
        placeholder="/guides"
        onChange={(v) => onChange(upsertField(fields, 0, "seeAllUrl", "text", 5, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 6, bgFrom: 7, bgTo: 8, bgImage: 9 }} />

      {mode === "manual" && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
            Featured {sourceType === "news" ? "Articles" : "Guides"} (in order)
          </label>
          {items.map((itemIndex) => {
            const slug = getField(fields, itemIndex, "slug");
            return (
              <div key={itemIndex} className="flex items-center gap-2">
                <ContentItemPicker
                  sourceType={sourceType}
                  value={slug?.textValue ?? ""}
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "slug", "text", 1, { textValue: v }))}
                />
                <IconButton
                  id={`carousel-item-${itemIndex}-remove`}
                  title="Remove Item"
                  onClick={() => removeItem(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
            );
          })}
          <button
            type="button"
            onClick={addItem}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            <IconPlus width={14} height={14} />
            Add Item
          </button>
        </div>
      )}
    </div>
  );
}

// Live data block — no per-item admin content. The web renderer lists every
// active Region (GET /api/regions) as a link to /{regionCode}; only the
// heading is admin-authored.
function RegionExplorerFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Explore Online Casinos by Region"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }} />
    </div>
  );
}

// Admin-authored promo banner cards. Picking a Casino fills the brand name,
// Visit Site link and More Info link on the website; the typed fields only
// override those.
function EventHighlightsFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addEvent() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "image", "image", 1),
      blankField(idx, "title", "text", 2),
      blankField(idx, "dateRange", "text", 3),
      blankField(idx, "button", "button", 4),
      blankField(idx, "casinoId", "text", 7),
    ]);
  }

  function removeEvent(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Event Highlights"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Intro (optional)"
        value={getField(fields, 0, "intro")?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 6, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((itemIndex) => {
          const image = getField(fields, itemIndex, "image");
          const title = getField(fields, itemIndex, "title");
          const dateRange = getField(fields, itemIndex, "dateRange");
          const button = getField(fields, itemIndex, "button");
          return (
            <div key={itemIndex} className="event-highlight-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Event {itemIndex}</span>
                <IconButton
                  id={`event-highlight-${itemIndex}-remove`}
                  title="Remove Event"
                  onClick={() => removeEvent(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Banner Image"
                mediaId={image?.mediaId ?? null}
                mediaUrl={image?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "image", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                placeholder="Huat Spin Giveaway"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Date Range"
                value={dateRange?.textValue ?? ""}
                placeholder="19 Jan - 15 Feb, 2025"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "dateRange", "text", 3, { textValue: v }))}
              />
              <CasinoPickerField
                label="Casino"
                value={getField(fields, itemIndex, "casinoId")?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "casinoId", "text", 7, { textValue: v }))}
              />
              {(() => {
                const fromCasino = Boolean(getField(fields, itemIndex, "casinoId")?.textValue);
                const auto = (fallback: string) => (fromCasino ? "From casino" : fallback);
                return (
                  <details className="text-sm" open={!fromCasino}>
                    <summary className="cursor-pointer text-xs font-medium text-primary-600 select-none">
                      {fromCasino ? "Override brand / links (optional)" : "Brand & links"}
                    </summary>
                    <div className="mt-2 flex flex-col gap-2">
                      <TextInputField
                        label="Brand"
                        value={getField(fields, itemIndex, "brand")?.textValue ?? ""}
                        placeholder={auto("EU9")}
                        onChange={(v) => onChange(upsertField(fields, itemIndex, "brand", "text", 5, { textValue: v }))}
                      />
                      <TextInputField
                        label="More Info Link"
                        value={getField(fields, itemIndex, "moreInfoUrl")?.textValue ?? ""}
                        placeholder={fromCasino ? "Casino review page" : "/casinos/eu9"}
                        onChange={(v) => onChange(upsertField(fields, itemIndex, "moreInfoUrl", "text", 6, { textValue: v }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <TextInputField
                          label="Button Label"
                          value={button?.textValue ?? ""}
                          placeholder="Visit Site"
                          onChange={(v) =>
                            onChange(upsertField(fields, itemIndex, "button", "button", 4, { textValue: v, urlValue: button?.urlValue ?? "" }))
                          }
                        />
                        <TextInputField
                          label="Button Link"
                          value={button?.urlValue ?? ""}
                          placeholder={auto("https://…")}
                          onChange={(v) =>
                            onChange(upsertField(fields, itemIndex, "button", "button", 4, { textValue: button?.textValue ?? "", urlValue: v }))
                          }
                        />
                      </div>
                    </div>
                  </details>
                );
              })()}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addEvent}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Event
      </button>
    </div>
  );
}

// Every non-Home page's first section (Figma "Introduction Section") —
// heading with one highlighted substring, subheading, paragraph, and an
// optional page-menu link list (first item renders as the active tab, per
// the Figma "Thailand 2025" example — see IntroductionSection.tsx). The
// bleed background is two independent color-stop pickers (bgFrom/bgTo, see
// SECTION_BG_COLOR_OPTIONS above) rather than a single "theme" preset, so
// the admin can combine any two stops instead of picking from a fixed
// blue/red enum the component used to hardcode.
function IntroductionSectionFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const highlightText = getField(fields, 0, "highlightText");
  const subheading = getField(fields, 0, "subheading");
  const paragraph = getField(fields, 0, "paragraph");
  const bgFrom = getField(fields, 0, "bgFrom")?.textValue || "primary-900";
  const bgTo = getField(fields, 0, "bgTo")?.textValue || "primary-glow";
  const items = itemIndexes(fields);

  function addMenuItem() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "label", "text", 1), blankField(idx, "url", "text", 2)]);
  }

  function removeMenuItem(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Online Casinos in Thailand 2025"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Highlighted Portion of Heading (optional — must match part of the heading text)"
        value={highlightText?.textValue ?? ""}
        placeholder="Thailand 2025"
        onChange={(v) => onChange(upsertField(fields, 0, "highlightText", "text", 2, { textValue: v }))}
      />
      <TextInputField
        label="Subheading"
        value={subheading?.textValue ?? ""}
        placeholder="Real Money & Real Players"
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 3, { textValue: v }))}
      />
      <RichTextField
        label="Paragraph"
        value={paragraph?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "paragraph", "richtext", 4, { textValue: v }))}
      />
      <div className="flex gap-4">
        <LabeledField label="Background — From">
          <Select
            value={bgFrom}
            onChange={(v) => onChange(upsertField(fields, 0, "bgFrom", "text", 5, { textValue: v }))}
            options={SECTION_BG_COLOR_OPTIONS}
          />
        </LabeledField>
        <LabeledField label="Background — To">
          <Select
            value={bgTo}
            onChange={(v) => onChange(upsertField(fields, 0, "bgTo", "text", 6, { textValue: v }))}
            options={SECTION_BG_COLOR_OPTIONS}
          />
        </LabeledField>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
          Page Menu (optional — on region pages, leave empty to show the standard region menu automatically; first item shows as the
          active tab)
        </label>
        {items.map((itemIndex) => {
          const label = getField(fields, itemIndex, "label");
          const url = getField(fields, itemIndex, "url");
          return (
            <div key={itemIndex} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={label?.textValue ?? ""}
                onChange={(e) => onChange(upsertField(fields, itemIndex, "label", "text", 1, { textValue: e.target.value }))}
              />
              <Input
                placeholder="/th/bonuses"
                value={url?.textValue ?? ""}
                onChange={(e) => onChange(upsertField(fields, itemIndex, "url", "text", 2, { textValue: e.target.value }))}
              />
              <IconButton
                id={`intro-menu-${itemIndex}-remove`}
                title="Remove Item"
                onClick={() => removeMenuItem(itemIndex)}
                icon={<IconTrash width={14} height={14} />}
                variant="danger"
              />
            </div>
          );
        })}
        <button
          type="button"
          onClick={addMenuItem}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
        >
          <IconPlus width={14} height={14} />
          Add Menu Item
        </button>
      </div>
    </div>
  );
}

function NumberedStepsFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const intro = getField(fields, 0, "intro");
  const items = itemIndexes(fields);

  function addStep() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "title", "text", 1), blankField(idx, "body", "richtext", 2)]);
  }

  function removeStep(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="How to Make a Deposit"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Heading — second line (optional)"
        value={subheading?.textValue ?? ""}
        placeholder="at Online Casinos in Thailand"
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Highlighted phrase in heading (optional)"
          value={getField(fields, 0, "highlightText")?.textValue ?? ""}
          placeholder="Make a Deposit"
          onChange={(v) => onChange(upsertField(fields, 0, "highlightText", "text", 8, { textValue: v }))}
        />
        <LabeledField label="Card style">
          <Select
            value={getField(fields, 0, "labelMode")?.textValue || "steps"}
            onChange={(v) => onChange(upsertField(fields, 0, "labelMode", "text", 10, { textValue: v }))}
            options={[
              { value: "steps", label: "Numbered (Step 1, Step 2…)" },
              { value: "titles", label: "Titled cards (no step numbers)" },
            ]}
          />
        </LabeledField>
        <LabeledField label="Accent color (highlight + Step labels)">
          <Select
            value={getField(fields, 0, "accent")?.textValue || "primary"}
            onChange={(v) => onChange(upsertField(fields, 0, "accent", "text", 9, { textValue: v }))}
            options={[
              { value: "primary", label: "Blue" },
              { value: "success", label: "Green" },
            ]}
          />
        </LabeledField>
      </div>
      <RichTextField
        label="Intro (optional)"
        value={intro?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 3, { textValue: v }))}
      />
      <SectionBackgroundFields
        fields={fields}
        onChange={onChange}
        sortOrders={{ bgType: 4, bgFrom: 5, bgTo: 6, bgImage: 7 }}
        defaultBgType="color"
        defaultBgFrom="surface-muted"
        defaultBgTo="surface-muted"
      />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex, i) => {
          const title = getField(fields, itemIndex, "title");
          const body = getField(fields, itemIndex, "body");
          return (
            <div key={itemIndex} className="numbered-step-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Step {i + 1}</span>
                <IconButton
                  id={`numbered-step-${itemIndex}-remove`}
                  title="Remove Step"
                  onClick={() => removeStep(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 1, { textValue: v }))}
              />
              <RichTextField
                label="Body"
                value={body?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "body", "richtext", 2, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addStep}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Step
      </button>
    </div>
  );
}

function FeatureCardsFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addCard() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "heading", "text", 1),
      blankField(idx, "description", "richtext", 2),
      blankField(idx, "image", "image", 3),
      blankField(idx, "detail1Heading", "text", 4),
      blankField(idx, "detail1Body", "richtext", 5),
      blankField(idx, "detail2Heading", "text", 6),
      blankField(idx, "detail2Body", "richtext", 7),
    ]);
  }

  function removeCard(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Most Trusted Payment Methods in Thailand"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 2, bgFrom: 3, bgTo: 4, bgImage: 5 }} />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const cardHeading = getField(fields, itemIndex, "heading");
          const description = getField(fields, itemIndex, "description");
          const image = getField(fields, itemIndex, "image");
          const detail1Heading = getField(fields, itemIndex, "detail1Heading");
          const detail1Body = getField(fields, itemIndex, "detail1Body");
          const detail2Heading = getField(fields, itemIndex, "detail2Heading");
          const detail2Body = getField(fields, itemIndex, "detail2Body");
          return (
            <div key={itemIndex} className="feature-card-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Card {itemIndex}</span>
                <IconButton
                  id={`feature-card-${itemIndex}-remove`}
                  title="Remove Card"
                  onClick={() => removeCard(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <TextInputField
                label="Heading"
                value={cardHeading?.textValue ?? ""}
                placeholder="Local Bank Transfers"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "heading", "text", 1, { textValue: v }))}
              />
              <RichTextField
                label="Description"
                value={description?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "description", "richtext", 2, { textValue: v }))}
              />
              <ImagePickerField
                label="Image (optional)"
                mediaId={image?.mediaId ?? null}
                mediaUrl={image?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "image", "image", 3, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Detail 1 Heading"
                value={detail1Heading?.textValue ?? ""}
                placeholder="Supported Banks May Include:"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "detail1Heading", "text", 4, { textValue: v }))}
              />
              <RichTextField
                label="Detail 1 Body"
                value={detail1Body?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "detail1Body", "richtext", 5, { textValue: v }))}
              />
              <TextInputField
                label="Detail 2 Heading"
                value={detail2Heading?.textValue ?? ""}
                placeholder="Why Players Use It:"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "detail2Heading", "text", 6, { textValue: v }))}
              />
              <RichTextField
                label="Detail 2 Body"
                value={detail2Body?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "detail2Body", "richtext", 7, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addCard}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Card
      </button>
    </div>
  );
}

function ChecklistCalloutFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subtext = getField(fields, 0, "subtext");
  const items = itemIndexes(fields);

  function addItem() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "text", "text", 1)]);
  }

  function removeItem(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Trust Factors"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Subtext"
        value={subtext?.textValue ?? ""}
        placeholder="You Should Look for in Online Casinos"
        onChange={(v) => onChange(upsertField(fields, 0, "subtext", "text", 2, { textValue: v }))}
      />
      <LabeledField label="Layout">
        <Select
          value={getField(fields, 0, "layout")?.textValue || "split"}
          onChange={(v) => onChange(upsertField(fields, 0, "layout", "text", 7, { textValue: v }))}
          options={[
            { value: "split", label: "Split — label left, checklist right" },
            { value: "stacked", label: "Stacked — heading above checklist" },
          ]}
        />
      </LabeledField>

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const text = getField(fields, itemIndex, "text");
          return (
            <div key={itemIndex} className="flex items-center gap-2">
              <Input
                placeholder="SSL encryption on checkout pages"
                value={text?.textValue ?? ""}
                onChange={(e) => onChange(upsertField(fields, itemIndex, "text", "text", 1, { textValue: e.target.value }))}
              />
              <IconButton
                id={`checklist-item-${itemIndex}-remove`}
                title="Remove Item"
                onClick={() => removeItem(itemIndex)}
                icon={<IconTrash width={14} height={14} />}
                variant="danger"
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Item
      </button>
    </div>
  );
}

const RTP_SLIDER_CATEGORY_OPTIONS = [
  { value: "slot", label: "Slots" },
  { value: "table,live", label: "Table & live games" },
  { value: "table", label: "Table games only" },
  { value: "live", label: "Live casino only" },
  { value: "", label: "All games" },
];

function GameRtpCarouselFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  const source = text(0, "source") || "manual";
  const items = itemIndexes(fields);

  function addCard() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "image", "image", 1),
      blankField(idx, "name", "text", 2),
      blankField(idx, "provider", "text", 3),
      blankField(idx, "rtp", "text", 4),
      blankField(idx, "casinoId", "text", 7),
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text(0, "heading")}
        placeholder="Top High RTP Slot Games (Updated Weekly)"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <SourceChoiceField
        value={source}
        onChange={(v) => onChange(upsertField(fields, 0, "source", "text", 10, { textValue: v }))}
        options={[
          { value: "auto", label: "Automatic from RTP Entries", hint: "Recommended — games update themselves" },
          { value: "manual", label: "Pick cards by hand", hint: "For a one-off curated list" },
        ]}
      />

      {source === "auto" ? (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-muted p-4 dark:border-border-dark dark:bg-surface-muted-dark">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabeledField label="Which games">
              <Select
                value={text(0, "category")}
                onChange={(v) => onChange(upsertField(fields, 0, "category", "text", 11, { textValue: v }))}
                options={RTP_SLIDER_CATEGORY_OPTIONS}
              />
            </LabeledField>
            <TextInputField
              label="Number of games"
              value={text(0, "limit") || "10"}
              onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 12, { textValue: v }))}
            />
          </div>
          <RegionCodeField
            label="Region"
            value={text(0, "regionCode")}
            emptyLabel="This page's region (automatic)"
            onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 13, { textValue: v }))}
          />
          <p className="text-xs text-text-muted dark:text-text-muted-dark">
            Shows the region&apos;s published RTP Entries, highest RTP first. Image, provider and the Visit Site link come from each
            entry — edit them under{" "}
            <a href="/dashboard/rtp" target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-900">
              RTP Entries
            </a>
            .
          </p>
        </div>
      ) : (
        <RepeaterShell
          label="Card"
          idPrefix="game-rtp-card"
          itemIndexes={items}
          onRemove={(i) => onChange(fields.filter((f) => f.itemIndex !== i))}
          onAdd={addCard}
          addLabel="Add Card"
          renderItem={(i) => {
            const image = getField(fields, i, "image");
            return (
              <>
                <ImagePickerField
                  label="Image"
                  mediaId={image?.mediaId ?? null}
                  mediaUrl={image?.mediaUrl ?? null}
                  onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, i, "image", "image", 1, { mediaId, mediaUrl }))}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TextInputField
                    label="Game Name"
                    value={text(i, "name")}
                    placeholder="Wisdom of Athena"
                    onChange={(v) => onChange(upsertField(fields, i, "name", "text", 2, { textValue: v }))}
                  />
                  <TextInputField
                    label="Provider"
                    value={text(i, "provider")}
                    placeholder="Pragmatic Play"
                    onChange={(v) => onChange(upsertField(fields, i, "provider", "text", 3, { textValue: v }))}
                  />
                  <TextInputField
                    label="RTP %"
                    value={text(i, "rtp")}
                    placeholder="98.00%"
                    onChange={(v) => onChange(upsertField(fields, i, "rtp", "text", 4, { textValue: v }))}
                  />
                </div>
                <CasinoPickerField
                  label="Casino (Visit Site link)"
                  value={text(i, "casinoId")}
                  onChange={(v) => onChange(upsertField(fields, i, "casinoId", "text", 7, { textValue: v }))}
                />
                {text(i, "ctaUrl") && (
                  <TextInputField
                    label="Custom link (overrides the casino's link — clear it to use the casino)"
                    value={text(i, "ctaUrl")}
                    onChange={(v) => onChange(upsertField(fields, i, "ctaUrl", "text", 5, { textValue: v }))}
                  />
                )}
              </>
            );
          }}
        />
      )}

      <TextInputField
        label="See All link (optional)"
        value={text(0, "seeAllUrl")}
        placeholder="/th/rtp"
        onChange={(v) => onChange(upsertField(fields, 0, "seeAllUrl", "text", 2, { textValue: v }))}
      />
      <SectionBackgroundFields
        fields={fields}
        onChange={onChange}
        sortOrders={{ bgType: 3, bgFrom: 4, bgTo: 5, bgImage: 6 }}
        defaultBgType="color"
        defaultBgFrom="surface-muted"
        defaultBgTo="surface-muted"
      />
    </div>
  );
}

const HIGHLIGHT_HEADING_COLOR_OPTIONS = [
  { value: "primary", label: "Primary (navy)" },
  { value: "danger", label: "Danger (red)" },
  { value: "success", label: "Success (teal)" },
  { value: "secondary", label: "Secondary (gold)" },
  { value: "white", label: "White" },
];

function HighlightPanelFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const headingLine1 = getField(fields, 0, "headingLine1");
  const headingLine1Color = getField(fields, 0, "headingLine1Color");
  const headingLine2 = getField(fields, 0, "headingLine2");
  const headingLine2Color = getField(fields, 0, "headingLine2Color");
  const intro = getField(fields, 0, "intro");
  const box1Heading = getField(fields, 0, "box1Heading");
  const box1Body = getField(fields, 0, "box1Body");
  const box2Heading = getField(fields, 0, "box2Heading");
  const box2Body = getField(fields, 0, "box2Body");
  const noteText = getField(fields, 0, "noteText");
  const noteLinkUrl = getField(fields, 0, "noteLinkUrl");
  const noteLinkLabel = getField(fields, 0, "noteLinkLabel");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Heading — Line 1"
          value={headingLine1?.textValue ?? ""}
          placeholder="Things you should watch out for"
          onChange={(v) => onChange(upsertField(fields, 0, "headingLine1", "text", 1, { textValue: v }))}
        />
        <LabeledField label="Line 1 Color">
          <Select
            value={headingLine1Color?.textValue || "primary"}
            onChange={(v) => onChange(upsertField(fields, 0, "headingLine1Color", "text", 2, { textValue: v }))}
            options={HIGHLIGHT_HEADING_COLOR_OPTIONS}
          />
        </LabeledField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Heading — Line 2 (optional)"
          value={headingLine2?.textValue ?? ""}
          placeholder="Fake RTP & Bonus Claims"
          onChange={(v) => onChange(upsertField(fields, 0, "headingLine2", "text", 3, { textValue: v }))}
        />
        <LabeledField label="Line 2 Color">
          <Select
            value={headingLine2Color?.textValue || "danger"}
            onChange={(v) => onChange(upsertField(fields, 0, "headingLine2Color", "text", 4, { textValue: v }))}
            options={HIGHLIGHT_HEADING_COLOR_OPTIONS}
          />
        </LabeledField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Highlight word in Line 1 (optional)"
          value={getField(fields, 0, "highlightText")?.textValue ?? ""}
          placeholder="Avoid"
          onChange={(v) => onChange(upsertField(fields, 0, "highlightText", "text", 17, { textValue: v }))}
        />
        <LabeledField label="Highlight Color">
          <Select
            value={getField(fields, 0, "highlightColor")?.textValue || "danger"}
            onChange={(v) => onChange(upsertField(fields, 0, "highlightColor", "text", 18, { textValue: v }))}
            options={HIGHLIGHT_HEADING_COLOR_OPTIONS}
          />
        </LabeledField>
      </div>
      <LabeledField label="Theme">
        <Select
          value={getField(fields, 0, "theme")?.textValue || "light"}
          onChange={(v) => onChange(upsertField(fields, 0, "theme", "text", 19, { textValue: v }))}
          options={[
            { value: "light", label: "Light — dark text" },
            { value: "dark", label: "Dark — white text, alert-icon lists (use with a dark background)" },
          ]}
        />
      </LabeledField>
      <RichTextField
        label="Intro (optional)"
        value={intro?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 5, { textValue: v }))}
      />
      <TextInputField
        label="Box 1 Heading (optional)"
        value={box1Heading?.textValue ?? ""}
        placeholder="To verify real RTP data"
        onChange={(v) => onChange(upsertField(fields, 0, "box1Heading", "text", 6, { textValue: v }))}
      />
      <RichTextField
        label="Box 1 Body (optional, bullet list)"
        value={box1Body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "box1Body", "richtext", 7, { textValue: v }))}
      />
      <TextInputField
        label="Box 2 Heading (optional)"
        value={box2Heading?.textValue ?? ""}
        placeholder="To identify high chance fake bonus pages"
        onChange={(v) => onChange(upsertField(fields, 0, "box2Heading", "text", 8, { textValue: v }))}
      />
      <RichTextField
        label="Box 2 Body (optional, bullet list)"
        value={box2Body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "box2Body", "richtext", 9, { textValue: v }))}
      />
      <RichTextField
        label="Text below boxes (optional)"
        value={getField(fields, 0, "outro")?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "outro", "richtext", 20, { textValue: v }))}
      />
      <TextInputField
        label="Note Text (optional)"
        value={noteText?.textValue ?? ""}
        placeholder="You can check out the "
        onChange={(v) => onChange(upsertField(fields, 0, "noteText", "text", 10, { textValue: v }))}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Note Link URL (optional)"
          value={noteLinkUrl?.textValue ?? ""}
          placeholder="/th/blacklist"
          onChange={(v) => onChange(upsertField(fields, 0, "noteLinkUrl", "text", 11, { textValue: v }))}
        />
        <TextInputField
          label="Note Link Label (optional)"
          value={noteLinkLabel?.textValue ?? ""}
          placeholder="blacklisted casinos here."
          onChange={(v) => onChange(upsertField(fields, 0, "noteLinkLabel", "text", 12, { textValue: v }))}
        />
      </div>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 13, bgFrom: 14, bgTo: 15, bgImage: 16 }} />
    </div>
  );
}

function LinkCardGridFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const items = itemIndexes(fields);

  function addCard() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "title", "text", 1), blankField(idx, "description", "text", 2), blankField(idx, "url", "text", 3)]);
  }

  function removeCard(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={getField(fields, 0, "heading")?.textValue ?? ""}
        placeholder="Types of Bonuses Explained"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Intro (optional)"
        value={getField(fields, 0, "intro")?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 2, { textValue: v }))}
      />
      <LabeledField label="Columns (desktop)">
        <Select
          value={getField(fields, 0, "columns")?.textValue || "2"}
          onChange={(v) => onChange(upsertField(fields, 0, "columns", "text", 3, { textValue: v }))}
          options={[
            { value: "2", label: "2 columns" },
            { value: "3", label: "3 columns" },
          ]}
        />
      </LabeledField>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 4, bgFrom: 5, bgTo: 6, bgImage: 7 }} />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => (
          <div key={itemIndex} className="link-card-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Card {itemIndex}</span>
              <IconButton
                id={`link-card-${itemIndex}-remove`}
                title="Remove Card"
                onClick={() => removeCard(itemIndex)}
                icon={<IconTrash width={14} height={14} />}
                variant="danger"
              />
            </div>
            <TextInputField
              label="Title"
              value={getField(fields, itemIndex, "title")?.textValue ?? ""}
              placeholder="No Deposit Bonuses"
              onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 1, { textValue: v }))}
            />
            <TextInputField
              label="Description"
              value={getField(fields, itemIndex, "description")?.textValue ?? ""}
              onChange={(v) => onChange(upsertField(fields, itemIndex, "description", "text", 2, { textValue: v }))}
            />
            <TextInputField
              label="Link URL (optional)"
              value={getField(fields, itemIndex, "url")?.textValue ?? ""}
              placeholder="/th/bonuses/no_deposit"
              onChange={(v) => onChange(upsertField(fields, itemIndex, "url", "text", 3, { textValue: v }))}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCard}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Card
      </button>
    </div>
  );
}

function TopBonusPicksFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={getField(fields, 0, "heading")?.textValue ?? ""}
        placeholder="Top Bonus Picks in Thailand 2025"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Intro (optional)"
        value={getField(fields, 0, "intro")?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 2, { textValue: v }))}
      />
      <RegionCodeField
        label="Region Code"
        value={getField(fields, 0, "regionCode")?.textValue ?? ""}
        emptyLabel="This page's region (automatic)"
        onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 3, { textValue: v }))}
      />
      <LabeledField label="Bonus Type">
        <Select
          value={getField(fields, 0, "bonusType")?.textValue || "welcome"}
          onChange={(v) => onChange(upsertField(fields, 0, "bonusType", "text", 4, { textValue: v }))}
          options={BONUS_TYPE_OPTIONS}
        />
      </LabeledField>
      <LabeledField label="Which casinos">
        <Select
          value={getField(fields, 0, "source")?.textValue || "bonuses"}
          onChange={(v) => onChange(upsertField(fields, 0, "source", "text", 10, { textValue: v }))}
          options={[
            { value: "bonuses", label: "Casinos that have a bonus of this type" },
            { value: "casinos", label: "Top-rated casinos (show this bonus type when they have one)" },
          ]}
        />
      </LabeledField>
      <TextInputField
        label="Number of Casinos"
        value={getField(fields, 0, "limit")?.textValue ?? "3"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 5, { textValue: v }))}
      />
      <p className="text-xs text-text-muted dark:text-text-muted-dark">
        Cards are live data: the region&apos;s highest-rated casinos that have a published bonus of this type. Rating, logo, pros and
        links come from each Casino; the offer text comes from its Bonus.
      </p>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 6, bgFrom: 7, bgTo: 8, bgImage: 9 }} />
    </div>
  );
}

function RepeaterShell({
  label,
  itemIndexes: indexes,
  onRemove,
  onAdd,
  addLabel,
  renderItem,
  idPrefix,
}: {
  label: string;
  itemIndexes: number[];
  onRemove: (itemIndex: number) => void;
  onAdd: () => void;
  addLabel: string;
  renderItem: (itemIndex: number) => React.ReactNode;
  idPrefix: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        {indexes.map((itemIndex) => (
          <div key={itemIndex} className="flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">
                {label} {itemIndex}
              </span>
              <IconButton
                id={`${idPrefix}-${itemIndex}-remove`}
                title={`Remove ${label}`}
                onClick={() => onRemove(itemIndex)}
                icon={<IconTrash width={14} height={14} />}
                variant="danger"
              />
            </div>
            {renderItem(itemIndex)}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        {addLabel}
      </button>
    </>
  );
}

function ExpandableCardGridFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text(0, "heading")}
        placeholder="Thailand Online Casino Bonuses You Can Claim"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Tagline (italic, tinted box)"
        value={text(0, "tagline")}
        onChange={(v) => onChange(upsertField(fields, 0, "tagline", "text", 2, { textValue: v }))}
      />
      <RichTextField label="Intro" value={text(0, "intro")} onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 3, { textValue: v }))} />
      <RichTextField
        label="Note below cards (optional)"
        value={text(0, "outro")}
        onChange={(v) => onChange(upsertField(fields, 0, "outro", "richtext", 4, { textValue: v }))}
      />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 5, bgFrom: 6, bgTo: 7, bgImage: 8 }} />
      <RepeaterShell
        label="Card"
        idPrefix="expandable-card"
        itemIndexes={itemIndexes(fields)}
        onRemove={(i) => onChange(fields.filter((f) => f.itemIndex !== i))}
        onAdd={() => {
          const idx = nextItemIndex(fields);
          onChange([...fields, blankField(idx, "icon", "image", 1), blankField(idx, "title", "text", 2), blankField(idx, "text", "text", 3)]);
        }}
        addLabel="Add Card"
        renderItem={(i) => {
          const icon = getField(fields, i, "icon");
          return (
            <>
              <ImagePickerField
                label="Icon (optional)"
                mediaId={icon?.mediaId ?? null}
                mediaUrl={icon?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, i, "icon", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Title"
                value={text(i, "title")}
                onChange={(v) => onChange(upsertField(fields, i, "title", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Text (shown when expanded)"
                value={text(i, "text")}
                onChange={(v) => onChange(upsertField(fields, i, "text", "text", 3, { textValue: v }))}
              />
            </>
          );
        }}
      />
    </div>
  );
}

function ReviewColumnsFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text(0, "heading")}
        placeholder="Real Reviews from Thai Players"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Positive group label"
          value={text(0, "positiveLabel")}
          onChange={(v) => onChange(upsertField(fields, 0, "positiveLabel", "text", 2, { textValue: v }))}
        />
        <TextInputField
          label="Complaints group label"
          value={text(0, "complaintLabel")}
          onChange={(v) => onChange(upsertField(fields, 0, "complaintLabel", "text", 3, { textValue: v }))}
        />
      </div>
      <SectionBackgroundFields
        fields={fields}
        onChange={onChange}
        sortOrders={{ bgType: 4, bgFrom: 5, bgTo: 6, bgImage: 7 }}
        defaultBgType="color"
        defaultBgFrom="surface-muted"
        defaultBgTo="surface-muted"
      />
      <RepeaterShell
        label="Review"
        idPrefix="review"
        itemIndexes={itemIndexes(fields)}
        onRemove={(i) => onChange(fields.filter((f) => f.itemIndex !== i))}
        onAdd={() => {
          const idx = nextItemIndex(fields);
          onChange([
            ...fields,
            textField(idx, "column", "positive", 1),
            blankField(idx, "name", "text", 2),
            blankField(idx, "timeAgo", "text", 3),
            blankField(idx, "quote", "text", 4),
            blankField(idx, "avatar", "image", 5),
          ]);
        }}
        addLabel="Add Review"
        renderItem={(i) => {
          const avatar = getField(fields, i, "avatar");
          return (
            <>
              <LabeledField label="Group">
                <Select
                  value={text(i, "column") || "positive"}
                  onChange={(v) => onChange(upsertField(fields, i, "column", "text", 1, { textValue: v }))}
                  options={[
                    { value: "positive", label: "Positive feedback" },
                    { value: "complaint", label: "Complaint & resolution" },
                  ]}
                />
              </LabeledField>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInputField label="Name" value={text(i, "name")} onChange={(v) => onChange(upsertField(fields, i, "name", "text", 2, { textValue: v }))} />
                <TextInputField
                  label="When"
                  value={text(i, "timeAgo")}
                  placeholder="4 days ago"
                  onChange={(v) => onChange(upsertField(fields, i, "timeAgo", "text", 3, { textValue: v }))}
                />
              </div>
              <TextInputField label="Quote" value={text(i, "quote")} onChange={(v) => onChange(upsertField(fields, i, "quote", "text", 4, { textValue: v }))} />
              <ImagePickerField
                label="Avatar (optional)"
                mediaId={avatar?.mediaId ?? null}
                mediaUrl={avatar?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, i, "avatar", "image", 5, { mediaId, mediaUrl }))}
              />
            </>
          );
        }}
      />
    </div>
  );
}

function CtaLinkListFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text(0, "heading")}
        placeholder="Ready to Win? Start Playing Smart in Thai Casinos"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField label="Intro (optional)" value={text(0, "intro")} onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 2, { textValue: v }))} />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 3, bgFrom: 4, bgTo: 5, bgImage: 6 }} />
      <RepeaterShell
        label="Link"
        idPrefix="cta-link"
        itemIndexes={itemIndexes(fields)}
        onRemove={(i) => onChange(fields.filter((f) => f.itemIndex !== i))}
        onAdd={() => {
          const idx = nextItemIndex(fields);
          onChange([...fields, blankField(idx, "label", "text", 1), blankField(idx, "url", "text", 2)]);
        }}
        addLabel="Add Link"
        renderItem={(i) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInputField label="Label" value={text(i, "label")} onChange={(v) => onChange(upsertField(fields, i, "label", "text", 1, { textValue: v }))} />
            <TextInputField
              label="URL"
              value={text(i, "url")}
              placeholder="/th/bonuses"
              onChange={(v) => onChange(upsertField(fields, i, "url", "text", 2, { textValue: v }))}
            />
          </div>
        )}
      />
    </div>
  );
}

function InfoCardColumnsFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text(0, "heading")}
        placeholder="Our Recommended Payment Security Standards to Protect You"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField label="Intro (optional)" value={text(0, "intro")} onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 2, { textValue: v }))} />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 3, bgFrom: 4, bgTo: 5, bgImage: 6 }} />
      <RepeaterShell
        label="Card"
        idPrefix="info-card"
        itemIndexes={itemIndexes(fields)}
        onRemove={(i) => onChange(fields.filter((f) => f.itemIndex !== i))}
        onAdd={() => {
          const idx = nextItemIndex(fields);
          onChange([
            ...fields,
            textField(idx, "column", "left", 1),
            textField(idx, "tinted", "no", 2),
            blankField(idx, "title", "text", 3),
            blankField(idx, "body", "richtext", 4),
          ]);
        }}
        addLabel="Add Card"
        renderItem={(i) => (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledField label="Column">
                <Select
                  value={text(i, "column") || "left"}
                  onChange={(v) => onChange(upsertField(fields, i, "column", "text", 1, { textValue: v }))}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "right", label: "Right" },
                  ]}
                />
              </LabeledField>
              <LabeledField label="Style">
                <Select
                  value={text(i, "tinted") || "no"}
                  onChange={(v) => onChange(upsertField(fields, i, "tinted", "text", 2, { textValue: v }))}
                  options={[
                    { value: "no", label: "White with border" },
                    { value: "yes", label: "Tinted" },
                  ]}
                />
              </LabeledField>
            </div>
            <TextInputField label="Title" value={text(i, "title")} onChange={(v) => onChange(upsertField(fields, i, "title", "text", 3, { textValue: v }))} />
            <RichTextField label="Body" value={text(i, "body")} onChange={(v) => onChange(upsertField(fields, i, "body", "richtext", 4, { textValue: v }))} />
          </>
        )}
      />
    </div>
  );
}

let regionsRequest: Promise<RegionDTO[]> | null = null;

// One shared request per admin session - every region dropdown on the page
// reuses it instead of each block refetching the list.
function loadRegions(): Promise<RegionDTO[]> {
  regionsRequest ??= api
    .get<{ regions: RegionDTO[] | null }>("/api/admin/regions")
    .then((data) => data.regions ?? [])
    .catch(() => {
      regionsRequest = null;
      return [];
    });
  return regionsRequest;
}

// Region picker for blocks that pull live, region-scoped data. Stores the
// region code (e.g. "th") exactly like the free-text field it replaces, so
// existing content keeps working. emptyLabel offers a "no region" choice for
// blocks where blank has a meaning (e.g. "All active regions").
// Filled in with the page's region code by the website on region pages (see
// web/src/app/[region]/_lib/regionPage.ts).
const PAGE_REGION_TOKEN = "{regionCode}";

function RegionCodeField({
  label,
  value,
  onChange,
  emptyLabel,
  pageRegionOption = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  emptyLabel?: string;
  pageRegionOption?: boolean;
}) {
  const [regions, setRegions] = useState<RegionDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadRegions().then((list) => {
      if (!cancelled) setRegions(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = [
    ...(emptyLabel ? [{ value: "", label: emptyLabel }] : []),
    ...(pageRegionOption ? [{ value: PAGE_REGION_TOKEN, label: "This page's region (region pages only)" }] : []),
    ...regions.map((r) => ({ value: r.code, label: `${r.name} (${r.code})${r.isActive ? "" : " — inactive"}` })),
    ...(value && value !== PAGE_REGION_TOKEN && !regions.some((r) => r.code === value) && regions.length > 0 ? [{ value, label: `${value} (unknown region)` }] : []),
  ];

  return (
    <LabeledField label={label}>
      <Select value={value} onChange={onChange} options={options} placeholder="Choose a region" loading={regions.length === 0} />
    </LabeledField>
  );
}

let casinosRequest: Promise<CasinoDTO[]> | null = null;

// One shared request per admin session, same as loadRegions.
function loadCasinos(): Promise<CasinoDTO[]> {
  casinosRequest ??= api
    .get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=500")
    .then((data) => (data.casinos ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)))
    .catch(() => {
      casinosRequest = null;
      return [];
    });
  return casinosRequest;
}

// Picks a Casino by id (stored as text, like every other section field) so
// a card's brand name, Visit Site link and review link come from the Casino
// record instead of being retyped on every page.
function CasinoPickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCasinos().then((list) => {
      if (cancelled) return;
      setCasinos(list);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const picked = casinos.find((c) => String(c.id) === value);

  return (
    <LabeledField label={label}>
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        value={value || undefined}
        onChange={(v) => onChange(v ?? "")}
        placeholder="Choose a casino"
        loading={!loaded}
        options={casinos.map((c) => ({ value: String(c.id), label: c.name }))}
      />
      {picked && (
        <span className="mt-1 block text-xs text-text-muted dark:text-text-muted-dark">
          Links to {picked.ctaUrl || "— this casino has no link yet"}
        </span>
      )}
    </LabeledField>
  );
}

// "Where does this section's data come from" switch shown at the top of
// blocks that can either read live records or take hand-typed items.
function SourceChoiceField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; hint: string }[];
}) {
  return (
    <LabeledField label="Content source">
      <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} className="flex flex-col gap-2 sm:flex-row">
        {options.map((option) => (
          <Radio.Button key={option.value} value={option.value} className="!h-auto flex-1 !py-2 !leading-tight">
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="block text-xs opacity-75">{option.hint}</span>
          </Radio.Button>
        ))}
      </Radio.Group>
    </LabeledField>
  );
}

// Live data block: game tiles that list the region's best casinos for the
// picked game (Casino → Supported Games) — see GameCasinoFinderSection.tsx.
function GameCasinoFinderFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (key: string) => getField(fields, 0, key)?.textValue ?? "";
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={text("heading")}
        placeholder="Choose an Online Casino Based on Your Playing Style"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField
          label="Panel title"
          value={text("panelTitle")}
          placeholder="What Game Would You Like to Start Off with"
          onChange={(v) => onChange(upsertField(fields, 0, "panelTitle", "text", 2, { textValue: v }))}
        />
        <TextInputField
          label="Panel subtitle"
          value={text("panelSubtitle")}
          placeholder="Select one of the following options"
          onChange={(v) => onChange(upsertField(fields, 0, "panelSubtitle", "text", 3, { textValue: v }))}
        />
        <RegionCodeField
          label="Region"
          value={text("regionCode")}
          emptyLabel="This page's region (automatic)"
          onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 4, { textValue: v }))}
        />
        <TextInputField
          label="Casinos shown per game"
          value={text("limit") || "3"}
          onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 5, { textValue: v }))}
        />
      </div>
      <p className="text-xs text-text-muted dark:text-text-muted-dark">
        Picking a game lists the region&apos;s best-rated casinos that have it ticked under Casinos → Supported Games.
      </p>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 6, bgFrom: 7, bgTo: 8, bgImage: 9 }} />
    </div>
  );
}

let guidesRequest: Promise<{ slug: string; title: string }[]> | null = null;
let newsRequest: Promise<{ slug: string; title: string }[]> | null = null;

// One shared request per admin session, same as loadCasinos.
function loadContentItems(sourceType: string): Promise<{ slug: string; title: string }[]> {
  if (sourceType === "news") {
    newsRequest ??= api
      .get<{ newsArticles: { slug: string; title: string }[] | null }>("/api/admin/news?pageSize=500")
      .then((data) => data.newsArticles ?? [])
      .catch(() => {
        newsRequest = null;
        return [];
      });
    return newsRequest;
  }
  guidesRequest ??= api
    .get<{ guides: { slug: string; title: string }[] | null }>("/api/admin/guides?pageSize=500")
    .then((data) => data.guides ?? [])
    .catch(() => {
      guidesRequest = null;
      return [];
    });
  return guidesRequest;
}

// Pick a guide or news article by title (stored as its slug).
function ContentItemPicker({ sourceType, value, onChange }: { sourceType: string; value: string; onChange: (v: string) => void }) {
  const [items, setItems] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadContentItems(sourceType).then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, [sourceType]);

  const options = [
    ...items.map((item) => ({ value: item.slug, label: item.title })),
    ...(value && items.length > 0 && !items.some((item) => item.slug === value) ? [{ value, label: `${value} (not found)` }] : []),
  ];

  return (
    <Select
      showSearch
      optionFilterProp="label"
      className="w-full"
      value={value || undefined}
      placeholder={sourceType === "news" ? "Choose an article" : "Choose a guide"}
      onChange={onChange}
      options={options}
    />
  );
}

// Figma "Bonus Page - Standard" table: heading, intro, editable column
// headers, rows of label + explanation, closing note.
function TwoColumnTableFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  return (
    <div className="flex flex-col gap-4">
      <TextInputField label="Heading" value={text(0, "heading")} placeholder="Key Terms You Should Know" onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))} />
      <RichTextField label="Intro (optional)" value={text(0, "intro")} onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 2, { textValue: v }))} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInputField label="Left column heading" value={text(0, "headerLeft")} placeholder="Term" onChange={(v) => onChange(upsertField(fields, 0, "headerLeft", "text", 3, { textValue: v }))} />
        <TextInputField label="Right column heading" value={text(0, "headerRight")} placeholder="Simple Explanation" onChange={(v) => onChange(upsertField(fields, 0, "headerRight", "text", 4, { textValue: v }))} />
      </div>
      <RepeaterShell
        label="Row"
        idPrefix="two-column-row"
        itemIndexes={itemIndexes(fields)}
        onRemove={(i) => onChange(fields.filter((f) => f.itemIndex !== i))}
        onAdd={() => {
          const idx = nextItemIndex(fields);
          onChange([...fields, blankField(idx, "left", "text", 1), blankField(idx, "right", "richtext", 2)]);
        }}
        addLabel="Add Row"
        renderItem={(i) => (
          <>
            <TextInputField label="Left (term)" value={text(i, "left")} onChange={(v) => onChange(upsertField(fields, i, "left", "text", 1, { textValue: v }))} />
            <RichTextField label="Right (explanation)" value={text(i, "right")} onChange={(v) => onChange(upsertField(fields, i, "right", "richtext", 2, { textValue: v }))} />
          </>
        )}
      />
      <RichTextField label="Closing note (optional)" value={text(0, "outro")} onChange={(v) => onChange(upsertField(fields, 0, "outro", "richtext", 5, { textValue: v }))} />
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 6, bgFrom: 7, bgTo: 8, bgImage: 9 }} />
    </div>
  );
}

// Mirrors web/src/components/data-table/columns.tsx's COLUMNS (same keys and
// default labels). Casino values work for both sources (a bonus row shows its
// casino's values); bonus values only for source "bonuses".
const DATA_TABLE_COLUMNS: { value: string; label: string; source: "casino" | "bonus" }[] = [
  { value: "rating", label: "Rating", source: "casino" },
  { value: "safeIndex", label: "Safe Index", source: "casino" },
  { value: "cashback", label: "Cashback Details", source: "casino" },
  { value: "topBonus", label: "Bonuses", source: "casino" },
  { value: "payments", label: "Payment Method", source: "casino" },
  { value: "payoutSpeed", label: "Processing Time", source: "casino" },
  { value: "rtp", label: "RTP", source: "casino" },
  { value: "crypto", label: "Crypto Payment", source: "casino" },
  { value: "localBanking", label: "Local Banking", source: "casino" },
  { value: "currencies", label: "Currencies", source: "casino" },
  { value: "details", label: "Bonus Details", source: "bonus" },
  { value: "terms", label: "Terms", source: "bonus" },
  { value: "code", label: "Bonus Code", source: "bonus" },
  { value: "turnover", label: "Wagering Requirement", source: "bonus" },
  { value: "maxClaim", label: "Max Claim Amount", source: "bonus" },
  { value: "withdrawal", label: "Min Max Withdrawal", source: "bonus" },
  { value: "minDeposit", label: "Min. Deposit", source: "bonus" },
  { value: "frequency", label: "Payment Frequency", source: "bonus" },
  { value: "eligibleGames", label: "Eligible Games", source: "bonus" },
  { value: "provider", label: "Eligible Provider", source: "bonus" },
  { value: "pointConversion", label: "Point Conversion Rate", source: "bonus" },
  { value: "upgradeBonus", label: "Upgrade Bonus", source: "bonus" },
  { value: "maxRebate", label: "Max Rebate", source: "bonus" },
  { value: "perks", label: "Perks", source: "bonus" },
  { value: "validUntil", label: "Valid Until", source: "bonus" },
];

// One editor for every casino and bonus table (web DataTableSection): pick
// the source, region, rows and the columns between Brand and the button.
function DataTableFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const text = (itemIndex: number, key: string) => getField(fields, itemIndex, key)?.textValue ?? "";
  const set = (key: string, order: number, type: "text" | "richtext" = "text") => (v: string) => onChange(upsertField(fields, 0, key, type, order, { textValue: v }));
  const source = text(0, "source") === "bonuses" ? "bonuses" : "casinos";
  const columnsMode = source === "casinos" ? "custom" : text(0, "columnsMode") || "simple";
  const columnOptions = DATA_TABLE_COLUMNS.filter((c) => source === "bonuses" || c.source === "casino").map((c) => ({
    value: c.value,
    label: source === "bonuses" ? `${c.label}${c.source === "casino" ? " (casino)" : ""}` : c.label,
  }));
  const columnItems = itemIndexes(fields);

  return (
    <div className="flex flex-col gap-4">
      <TextInputField label="Heading" value={text(0, "heading")} placeholder="{regionAdj} Online Casinos List" onChange={set("heading", 1)} />
      <RichTextField label="Intro (optional)" value={text(0, "intro")} onChange={set("intro", 2, "richtext")} />
      <SourceChoiceField
        value={source}
        onChange={set("source", 3)}
        options={[
          { value: "casinos", label: "Casinos", hint: "One row per casino, best rated first" },
          { value: "bonuses", label: "Bonuses", hint: "One row per bonus of one type" },
        ]}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RegionCodeField label="Region" value={text(0, "regionCode")} emptyLabel="This page's region (automatic)" onChange={set("regionCode", 4)} />
        <TextInputField label="Number of rows" value={text(0, "limit") || (source === "bonuses" ? "5" : "10")} onChange={set("limit", 5)} />
        {source === "bonuses" && (
          <LabeledField label="Bonus type">
            <Select value={text(0, "bonusType") || "welcome"} onChange={set("bonusType", 6)} options={BONUS_TYPE_OPTIONS} />
          </LabeledField>
        )}
        {source === "bonuses" && (
          <LabeledField label="Columns">
            <Select
              value={columnsMode}
              onChange={set("columnsMode", 10)}
              options={[
                { value: "simple", label: "Simple — Bonus Details only" },
                { value: "typed", label: "This bonus type's standard columns" },
                { value: "custom", label: "Choose columns myself" },
              ]}
            />
          </LabeledField>
        )}
      </div>

      {columnsMode === "custom" && (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-4 dark:border-border-dark dark:bg-surface-muted-dark">
          <p className="text-xs text-text-muted dark:text-text-muted-dark">
            Brand is always the first column and the button the last. Pick the columns in between, in order; leave a label empty to use the
            default name.{source === "casinos" ? " With no columns picked, the table shows Cashback, Payment Method, Rating and Safe Index." : ""}
          </p>
          {columnItems.map((itemIndex, position) => (
            <div key={itemIndex} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <LabeledField label={`Column ${position + 1}`}>
                <Select
                  value={text(itemIndex, "column") || undefined}
                  placeholder="Choose a value"
                  options={columnOptions}
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "column", "text", 1, { textValue: v }))}
                />
              </LabeledField>
              <TextInputField
                label="Label (optional)"
                value={text(itemIndex, "label")}
                placeholder={DATA_TABLE_COLUMNS.find((c) => c.value === text(itemIndex, "column"))?.label ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "label", "text", 2, { textValue: v }))}
              />
              <IconButton
                id={`data-table-column-${itemIndex}-remove`}
                title="Remove column"
                onClick={() => onChange(fields.filter((f) => f.itemIndex !== itemIndex))}
                icon={<IconTrash width={14} height={14} />}
                variant="danger"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const idx = nextItemIndex(fields);
              onChange([...fields, blankField(idx, "column", "text", 1), blankField(idx, "label", "text", 2)]);
            }}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            <IconPlus width={14} height={14} />
            Add Column
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LabeledField label="Button">
          <Select
            value={text(0, "showCta") === "no" ? "no" : "yes"}
            onChange={set("showCta", 11)}
            options={[
              { value: "yes", label: "Show button" },
              { value: "no", label: "No button" },
            ]}
          />
        </LabeledField>
        <TextInputField label="Button label" value={text(0, "ctaLabel")} placeholder={source === "casinos" ? "Visit Site" : "Claim Here"} onChange={set("ctaLabel", 12)} />
        <LabeledField label="Review link">
          <Select
            value={text(0, "moreInfo") === "yes" ? "yes" : "no"}
            onChange={set("moreInfo", 13)}
            options={[
              { value: "no", label: "Hidden" },
              { value: "yes", label: "Show arrow to review" },
            ]}
          />
        </LabeledField>
      </div>

      <details className="rounded-md border border-border p-3 dark:border-border-dark">
        <summary className="cursor-pointer text-sm font-medium text-text dark:text-text-dark">Notes around the table (optional)</summary>
        <div className="mt-3 flex flex-col gap-3">
          <TextInputField label="Tip box heading" value={text(0, "tipHeading")} placeholder="Use this table to:" onChange={set("tipHeading", 14)} />
          <RichTextField label="Tip box (above the table)" value={text(0, "tipBody")} onChange={set("tipBody", 15, "richtext")} />
          <RichTextField label="Recommendation box (above the table)" value={text(0, "recommendation")} onChange={set("recommendation", 16, "richtext")} />
          <RichTextField label="Note below the table" value={text(0, "outro")} onChange={set("outro", 17, "richtext")} />
        </div>
      </details>
      <SectionBackgroundFields fields={fields} onChange={onChange} sortOrders={{ bgType: 18, bgFrom: 19, bgTo: 20, bgImage: 21 }} />
    </div>
  );
}
