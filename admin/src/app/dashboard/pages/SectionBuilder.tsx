"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Checkbox, Input, Modal, Radio, Select, Space, Tabs, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import {
  IconAlignCenter,
  IconAlignJustify,
  IconAlignLeft,
  IconAlignRight,
  IconChevronUp,
  IconChevronDown,
  IconClipboardCopy,
  IconColumnCenter,
  IconColumnLeft,
  IconColumnRight,
  IconCopy,
  IconGripVertical,
  IconIndent,
  IconInsertBelow,
  IconLayersPlus,
  IconOutdent,
  IconTrash,
} from "@/components/Icons";
import BlockFieldEditor, { BLOCK_TYPE_LABELS, StyleTabTarget, defaultFieldsForBlockType, mediaUrl, type EditableField } from "./BlockFields";
import type { SaveAction } from "./SaveActionBar";
import ComponentPicker, { type ComponentGroup } from "./ComponentPicker";
import LivePreview from "./LivePreview";
import { copySectionsToClipboard, useSectionClipboard, type CopiedSection } from "@/lib/sectionClipboard";
import { CLASSIC_BLOCK_TYPES, READY_TEMPLATES, type ReadyTemplate } from "@/lib/readyTemplates";
import type { GlobalSectionDTO, MediaDTO, PageBlockType, PageSectionDTO, SectionTemplateDTO } from "@/lib/types";
import {
  BackgroundControl,
  ColorField,
  DEVICE_SUFFIX,
  DeviceRanges,
  DeviceSwitch,
  EditDeviceContext,
  PxInput,
  SideBoxes,
  StylePanel,
  StyleRow,
  ToggleButtons,
  inheritedSides,
  inheritedValue,
  joinSides,
  useEditDevice,
  type BackgroundValue,
  type EditDevice,
} from "./StyleControls";

// depth: 0 directly on the page, N inside the nearest Container before it
// at level N-1 (api/internal/domain/page.go).
interface EditableSection {
  key: string;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  depth: number;
  fields: EditableField[];
}

const CONTAINER: PageBlockType = "container";
const GLOBAL_SECTION: PageBlockType = "global_section";
// Deepest level a section can be at; a Container at most one less, so it has
// room for components (domain.MaxSectionDepth in the API).
const MAX_DEPTH = 4;

// A section's level from the API, which only sent inContainer before levels
// existed (level 1).
function sectionDepth(section: { depth?: number; inContainer?: boolean }): number {
  return section.depth && section.depth > 0 ? section.depth : section.inContainer ? 1 : 0;
}

// Spacing/divider presets editors toggle with plain checkboxes - they're
// stored as classes in custom_class (see shared/theme/sections.css), so the
// "Advanced" free-text field only ever has to show whatever is left over.
const TIGHT_TOP_CLASS = "section--tight-top";
const DIVIDER_TOP_CLASS = "section--divider-top";
const WIDE_CONTENT_CLASS = "section--content-960";
// Width of a component inside a grid or row Container (shared/theme/
// sections.css .container-section__body--grid / --row); empty = the
// container's column width (grid) or an equal share (row). "Fit content"
// is for rows only.
const WIDTH_OPTIONS = [
  { value: "", label: "Auto (column width)" },
  { value: "section--w-full", label: "Full width" },
  { value: "section--w-3-4", label: "3/4" },
  { value: "section--w-2-3", label: "2/3" },
  { value: "section--w-1-2", label: "1/2" },
  { value: "section--w-1-3", label: "1/3" },
  { value: "section--w-1-4", label: "1/4" },
];
const ROW_WIDTH_OPTIONS = [
  { value: "", label: "Equal share" },
  ...WIDTH_OPTIONS.slice(1),
  { value: "section--w-auto", label: "Fit content" },
];
const WIDTH_CLASSES = ROW_WIDTH_OPTIONS.map((o) => o.value).filter(Boolean);
// Container layouts whose components each get a "Width in container".
const SIZED_LAYOUTS = ["grid", "row"];
// Hide a component on some devices (web/src/lib/deviceCss.ts), at the
// screen sizes set in Site Settings.
const VISIBILITY_OPTIONS = [
  { cls: "section--hide-mobile", label: "Mobile" },
  { cls: "section--hide-tablet", label: "Tablet" },
  { cls: "section--hide-desktop", label: "Desktop" },
];
const HIDE_CLASSES = VISIBILITY_OPTIONS.map((o) => o.cls);
// Style tab "Layout": per-device content max width, column position and text
// alignment for any component, as section--{prop}-{device}-{value} classes
// (shared/theme/sections.css). Each device is set on its own; "" = Default,
// the component's own layout. Options with an icon show as a row of icon
// buttons instead of a dropdown.
type LayoutOption = { value: string; label: string; icon?: ReactNode };
const LAYOUT_DEVICES = [
  { code: "d", label: "Desktop" },
  { code: "t", label: "Tablet" },
  { code: "m", label: "Mobile" },
];
const LAYOUT_PROPS: { prop: string; label: string; options: LayoutOption[] }[] = [
  {
    prop: "maxw",
    label: "Content max width",
    options: [{ value: "", label: "Default" }, ...[400, 480, 560, 640, 720, 800, 960, 1080].map((px) => ({ value: String(px), label: `${px}px` }))],
  },
  {
    prop: "pos",
    label: "Column position",
    options: [
      { value: "", label: "Default" },
      { value: "left", label: "Left", icon: <IconColumnLeft /> },
      { value: "center", label: "Center", icon: <IconColumnCenter /> },
      { value: "right", label: "Right", icon: <IconColumnRight /> },
    ],
  },
  {
    prop: "align",
    label: "Text alignment",
    options: [
      { value: "", label: "Default" },
      { value: "left", label: "Left", icon: <IconAlignLeft /> },
      { value: "center", label: "Center", icon: <IconAlignCenter /> },
      { value: "right", label: "Right", icon: <IconAlignRight /> },
      { value: "justify", label: "Justify", icon: <IconAlignJustify /> },
    ],
  },
];
function layoutClass(prop: string, device: string, value: string): string {
  return `section--${prop}-${device}-${value}`;
}
function layoutGroup(prop: string, device: string): string[] {
  const options = LAYOUT_PROPS.find((p) => p.prop === prop)?.options ?? [];
  return options.filter((o) => o.value).map((o) => layoutClass(prop, device, o.value));
}
const LAYOUT_CLASSES = LAYOUT_PROPS.flatMap((p) => LAYOUT_DEVICES.flatMap((d) => layoutGroup(p.prop, d.code)));
// Vertical position of a component in a grid Container's row; "" = stretch.
const VALIGN_OPTIONS = [
  { value: "", label: "Stretch (default)" },
  { value: "section--valign-top", label: "Top" },
  { value: "section--valign-center", label: "Center" },
  { value: "section--valign-bottom", label: "Bottom" },
];
const VALIGN_CLASSES = VALIGN_OPTIONS.map((o) => o.value).filter(Boolean);
// Style tab "Box & text" and Advanced tab "Entrance animation": presets any
// component or Container can use, one class per group (section--{group}-
// {value}, shared/theme/sections.css). Colours are brand tokens only.
const STYLE_GROUPS: { id: string; label: string; options: { value: string; label: string }[] }[] = [
  {
    id: "box",
    label: "Background",
    options: [
      { value: "", label: "None" },
      { value: "section--box-white", label: "White" },
      { value: "section--box-light", label: "Light blue-grey" },
      { value: "section--box-cream", label: "Cream" },
      { value: "section--box-mint", label: "Mint" },
      { value: "section--box-navy", label: "Navy" },
      { value: "section--box-blue", label: "Blue" },
      { value: "section--box-gold", label: "Gold" },
      { value: "section--box-gradient", label: "Navy to blue gradient" },
    ],
  },
  {
    id: "text",
    label: "Text colour",
    options: [
      { value: "", label: "Default" },
      { value: "section--text-navy", label: "Navy" },
      { value: "section--text-muted", label: "Muted blue" },
      { value: "section--text-white", label: "White" },
      { value: "section--text-gold", label: "Gold" },
      { value: "section--text-blue", label: "Blue" },
    ],
  },
  {
    id: "border",
    label: "Border",
    options: [
      { value: "", label: "None" },
      { value: "section--border-light", label: "Thin, light" },
      { value: "section--border-navy", label: "Navy" },
      { value: "section--border-gold", label: "Gold" },
    ],
  },
  {
    id: "radius",
    label: "Corners",
    options: [
      { value: "", label: "Square" },
      { value: "section--radius-s", label: "Slightly rounded" },
      { value: "section--radius-m", label: "Rounded" },
      { value: "section--radius-l", label: "Very rounded" },
      { value: "section--radius-pill", label: "Pill" },
    ],
  },
  {
    id: "shadow",
    label: "Shadow",
    options: [
      { value: "", label: "None" },
      { value: "section--shadow-s", label: "Small" },
      { value: "section--shadow-m", label: "Medium" },
      { value: "section--shadow-l", label: "Large" },
    ],
  },
  {
    id: "pad",
    label: "Space inside",
    options: [
      { value: "", label: "Default" },
      { value: "section--pad-s", label: "Small (16px)" },
      { value: "section--pad-m", label: "Medium (30px)" },
      { value: "section--pad-l", label: "Large (50px)" },
    ],
  },
  {
    id: "mt",
    label: "Extra space above",
    options: [
      { value: "", label: "None" },
      { value: "section--mt-s", label: "Small (16px)" },
      { value: "section--mt-m", label: "Medium (30px)" },
      { value: "section--mt-l", label: "Large (50px)" },
    ],
  },
  {
    id: "mb",
    label: "Extra space below",
    options: [
      { value: "", label: "None" },
      { value: "section--mb-s", label: "Small (16px)" },
      { value: "section--mb-m", label: "Medium (30px)" },
      { value: "section--mb-l", label: "Large (50px)" },
    ],
  },
];
const ANIMATION_OPTIONS = [
  { value: "", label: "None" },
  { value: "section--anim-fade", label: "Fade in" },
  { value: "section--anim-fade-up", label: "Fade in, moving up" },
  { value: "section--anim-fade-left", label: "Fade in from the left" },
  { value: "section--anim-fade-right", label: "Fade in from the right" },
  { value: "section--anim-zoom", label: "Zoom in" },
];
const STYLE_CLASSES = STYLE_GROUPS.flatMap((g) => g.options.map((o) => o.value).filter(Boolean));
const ANIMATION_CLASSES = ANIMATION_OPTIONS.map((o) => o.value).filter(Boolean);
const PRESET_CLASSES = [
  TIGHT_TOP_CLASS,
  DIVIDER_TOP_CLASS,
  WIDE_CONTENT_CLASS,
  ...WIDTH_CLASSES,
  ...HIDE_CLASSES,
  ...LAYOUT_CLASSES,
  ...VALIGN_CLASSES,
  ...STYLE_CLASSES,
  ...ANIMATION_CLASSES,
];
// Containers whose components each get a title (tab or accordion item).
const PANEL_TITLE_LABELS: Record<string, string> = { tabs: "Tab title", accordion: "Accordion item title" };
const PANEL_TITLE_KEY = "panelTitle";
// Single-column reading blocks, whose 768px column can widen to 960px.
const WIDE_CONTENT_BLOCK_TYPES: PageBlockType[] = ["rich_text", "faq"];

// Grouped + described so editors pick a block by what it looks like, not by
// its internal name. Every key of BLOCK_TYPE_LABELS must appear in exactly one
// group; any that don't are listed under "Other" so a new block type is never
// silently missing from the picker.
const BLOCK_GROUPS: { label: string; blocks: [PageBlockType, string][] }[] = [
  {
    label: "Layout",
    blocks: [
      ["container", "Wraps components with one shared background"],
      ["global_section", "A reusable section edited once under Global Sections"],
    ],
  },
  {
    label: "Basic",
    blocks: [
      ["heading", "A heading: H1-H6 for SEO, any size, optional link"],
      ["text", "Formatted text, no heading"],
      ["image", "Image with optional link and caption"],
      ["button_group", "One or more buttons in a row"],
      ["icon", "One icon from the built-in set"],
      ["divider", "A line: solid, dashed or dotted"],
      ["spacer", "Empty space, optionally with a divider line"],
      ["video", "YouTube or Vimeo video, loads on click"],
      ["title_set", "Section title (one word can be red) with a line of text"],
      ["rich_text", "Heading with formatted text"],
    ],
  },
  {
    label: "Elements",
    blocks: [
      ["icon_box", "Icon with a title and text"],
      ["icon_list", "Lines with a check or other icon"],
      ["card", "Image, title, text and a button"],
      ["counter", "A big number that counts up"],
      ["progress_bars", "Bars filled to a percentage"],
      ["alert", "Info, success, warning or danger notice"],
      ["table", "A simple table of 2-6 columns"],
      ["star_rating", "0-5 stars with the score"],
      ["testimonial", "A quote with name, photo and rating"],
    ],
  },
  {
    label: "Headings & text",
    blocks: [
      ["introduction_section", "Page intro banner with page menu"],
      ["hero", "Large banner with image and button"],
      ["highlight_panel", "Two-tone heading, text and optional side-by-side boxes"],
      ["cta_link_list", "Heading with a stack of link buttons"],
    ],
  },
  {
    label: "Cards & lists",
    blocks: [
      ["feature_cards", "Bordered cards with image and two detail lists"],
      ["expandable_card_grid", "Tagline box plus expandable \"+\" cards"],
      ["link_card_grid", "Grid of cards with big linked titles"],
      ["info_card_columns", "Two columns of white/tinted info cards"],
      ["two_column_table", "Two-column table: term and explanation"],
      ["icon_box_group", "Icon boxes in a grid"],
      ["checklist_callout", "Mint box with a checkmark list"],
      ["numbered_steps", "Step 1, Step 2… instruction cards"],
      ["review_columns", "Player reviews: positive vs complaints"],
      ["event_highlights", "Promo event cards with banner"],
      ["game_rtp_carousel", "Slider of game cards with RTP %"],
      ["team_grid", "Team member cards"],
      ["stats_counter", "Animated number counters"],
      ["logo_strip", "Row of logos"],
    ],
  },
  {
    label: "Live data (updates automatically)",
    blocks: [
      ["top_bonus_picks", "Ranked casino cards from live casinos & bonuses"],
      ["game_casino_finder", "Pick a game, see casinos that offer it"],
      ["data_table", "Table of live casinos or bonuses, columns you choose"],
      ["top_casinos_by_region", "Top casinos for a region"],
      ["blacklist_preview", "Slider of blacklisted casinos"],
      ["content_carousel", "Latest guides or news"],
      ["region_explorer", "Region picker"],
      ["bonus_calculator", "Bonus turnover calculator"],
    ],
  },
  {
    label: "Tables & FAQ",
    blocks: [
      ["faq", "Questions & answers accordion"],
    ],
  },
];

// Page levels: level 0 (directly on the page) takes only a Container or a
// Global Section; inside a Container (level 1 and deeper) go components and
// other Containers, down to MAX_DEPTH. The API enforces the same
// (validateHierarchy and validateContainers in api/internal/service).
function buildPickerGroups(depth: number, isGlobal: boolean): ComponentGroup[] {
  const allowed = (type: PageBlockType) => {
    if (depth === 0) return type === CONTAINER || (!isGlobal && type === GLOBAL_SECTION);
    if (type === CONTAINER) return depth < MAX_DEPTH;
    return !isGlobal || type !== GLOBAL_SECTION;
  };
  const grouped = new Set(BLOCK_GROUPS.flatMap((g) => g.blocks.map(([type]) => type)));
  const other = (Object.keys(BLOCK_TYPE_LABELS) as PageBlockType[]).filter((t) => !grouped.has(t));
  const groups = other.length > 0 ? [...BLOCK_GROUPS, { label: "Other", blocks: other.map((t) => [t, ""] as [PageBlockType, string]) }] : BLOCK_GROUPS;
  return groups
    .map((group) => ({
      label: group.label,
      blocks: group.blocks
        .filter(([type]) => allowed(type))
        .map(([type, description]) => ({ type, title: BLOCK_TYPE_LABELS[type], description })),
    }))
    .filter((group) => group.blocks.length > 0);
}

function splitClasses(customClass: string): string[] {
  return customClass.split(/\s+/).filter(Boolean);
}

function hasClass(customClass: string, cls: string): boolean {
  return splitClasses(customClass).includes(cls);
}

// customClass = the editor's own free-text classes (kept verbatim, so typing a
// space between two classes isn't swallowed mid-edit) + any checked presets.
function extraClasses(customClass: string): string {
  return PRESET_CLASSES.reduce((rest, cls) => rest.replace(new RegExp(`(^|\\s)${cls}(?=\\s|$)`, "g"), ""), customClass);
}

function composeClasses(extra: string, presets: string[]): string {
  return [extra, ...presets].filter(Boolean).join(" ");
}

// The class of an exclusive preset group (grid width, a layout setting)
// that customClass has, or "".
function groupClass(customClass: string, group: string[]): string {
  return group.find((cls) => hasClass(customClass, cls)) ?? "";
}

// Sets one class of an exclusive preset group ("" clears the group).
function setExclusiveClass(customClass: string, group: string[], cls: string): string {
  const presets = PRESET_CLASSES.filter((c) => !group.includes(c) && hasClass(customClass, c));
  return composeClasses(extraClasses(customClass), cls ? [...presets, cls] : presets);
}

function toggleClass(customClass: string, cls: string, on: boolean): string {
  const presets = PRESET_CLASSES.filter((c) => (c === cls ? on : hasClass(customClass, c)));
  return composeClasses(extraClasses(customClass), presets);
}

// Short human summary of a section for its collapsed header: the first
// heading-like field, stripped of any HTML.
function sectionSummary(fields: EditableField[]): string {
  for (const key of ["heading", "headingLine1", "title", "tagline", "caption", "alt", "url", "quote", "label", "number", "body"]) {
    const value = fields.find((f) => f.itemIndex === 0 && f.fieldKey === key)?.textValue;
    if (value) return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return fields
    .filter((f) => f.fieldKey === "button" && f.textValue)
    .map((f) => f.textValue)
    .join(" · ");
}

function itemCount(fields: EditableField[]): number {
  return new Set(fields.filter((f) => f.itemIndex > 0).map((f) => f.itemIndex)).size;
}

// Puts every section at a level the page can hold, mirroring the API
// (validateContainers) and the public renderer (sectionTree): a section
// belongs to the nearest Container before it one level up, so no section
// can be deeper than one past the Containers open above it, and a Container
// is at most MAX_DEPTH - 1. Level 0 holds only Containers and Global
// Sections, so a component that would end up there (dropped between
// containers, a lone component from a template or paste) gets a Container
// of its own - one that keeps the component's own spacing, so it looks the
// same as it would on its own.
function normalizeContainers(sections: EditableSection[]): EditableSection[] {
  const out: EditableSection[] = [];
  const open: number[] = [];
  for (const s of sections) {
    const isContainer = s.blockType === CONTAINER;
    let depth = Math.min(Math.max(0, s.depth), isContainer ? MAX_DEPTH - 1 : MAX_DEPTH);
    while (open.length > 0 && open[open.length - 1] >= depth) open.pop();
    const top = open.length > 0 ? open[open.length - 1] : -1;
    if (depth > top + 1) depth = top + 1;
    if (depth === 0 && !isContainer && s.blockType !== GLOBAL_SECTION) {
      out.push(wrapperContainer());
      open.push(0);
      depth = 1;
    }
    out.push(s.depth === depth ? s : { ...s, depth });
    if (isContainer) open.push(depth);
  }
  return out;
}

// A Container that leaves spacing to its components (componentSpacing
// "own", no space of its own) - what normalizeContainers and migration 0084
// wrap a lone component in.
function wrapperContainer(): EditableSection {
  const extra = [
    ["componentSpacing", "own", 16],
    ["spaceTop", "none", 10],
    ["spaceBottom", "none", 11],
  ] as const;
  return {
    key: nextClientKey(),
    blockType: CONTAINER,
    customClass: "",
    customId: "",
    depth: 0,
    fields: [
      ...defaultFieldsForBlockType(CONTAINER),
      ...extra.map(([fieldKey, textValue, sortOrder]) => ({
        itemIndex: 0,
        fieldKey,
        fieldType: "text" as const,
        textValue,
        mediaId: null,
        mediaUrl: null,
        urlValue: "",
        sortOrder,
      })),
    ],
  };
}

// End (exclusive) of the unit starting at index: the section plus
// everything nested in it (a Container's components and inner Containers).
function unitEnd(sections: EditableSection[], index: number): number {
  const depth = sections[index]?.depth ?? 0;
  let end = index + 1;
  while (end < sections.length && sections[end].depth > depth) end += 1;
  return end;
}

// Start of the unit just before index at the same level, inside the same
// Container, or -1.
function previousSiblingStart(sections: EditableSection[], index: number): number {
  const depth = sections[index].depth;
  let start = index - 1;
  while (start >= 0 && sections[start].depth > depth) start -= 1;
  return start >= 0 && sections[start].depth === depth ? start : -1;
}

// The Container a section is inside (the nearest one before it one level
// up), or -1 at level 0.
function parentIndex(sections: EditableSection[], index: number): number {
  const depth = sections[index].depth;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (sections[i].depth < depth) return sections[i].depth === depth - 1 ? i : -1;
  }
  return -1;
}

// Deepest level in a unit, relative to its first section, with one extra
// for a Container (it must have room for components).
function unitDepthSpan(unit: EditableSection[]): number {
  const base = unit[0]?.depth ?? 0;
  return Math.max(0, ...unit.map((s) => s.depth - base + (s.blockType === CONTAINER ? 1 : 0)));
}

function shiftDepth(unit: EditableSection[], by: number): EditableSection[] {
  return by === 0 ? unit : unit.map((s) => ({ ...s, depth: s.depth + by }));
}

type DropPosition = "before" | "after" | "inside";
interface DropTarget {
  key: string;
  position: DropPosition;
}
const END_DROP_KEY = "__end";

// Where a dragged section (a Container brings everything inside it) lands.
// "before"/"after" a section puts it next to that section, at its level -
// except just below a Container's header, which puts it first inside that
// Container; "inside" appends it to a Container. A drop that would nest it
// too deep, or into itself, does nothing.
function applyDrop(list: EditableSection[], dragKey: string, target: DropTarget): EditableSection[] | null {
  const from = list.findIndex((s) => s.key === dragKey);
  if (from < 0) return null;
  const end = unitEnd(list, from);
  const unit = list.slice(from, end);
  if (unit.some((s) => s.key === target.key)) return null;
  const rest = [...list.slice(0, from), ...list.slice(end)];
  let at: number;
  let depth: number;

  if (target.key === END_DROP_KEY) {
    at = rest.length;
    depth = 0;
  } else {
    const t = rest.findIndex((s) => s.key === target.key);
    if (t < 0) return null;
    const targetSection = rest[t];
    if (target.position === "inside" || (targetSection.blockType === CONTAINER && target.position === "after")) {
      at = target.position === "inside" ? unitEnd(rest, t) : t + 1;
      depth = targetSection.depth + 1;
    } else {
      at = target.position === "before" ? t : unitEnd(rest, t);
      depth = targetSection.depth;
    }
  }

  if (depth + unitDepthSpan(unit) > MAX_DEPTH) return null;
  return normalizeContainers([...rest.slice(0, at), ...shiftDepth(unit, depth - unit[0].depth), ...rest.slice(at)]);
}

// One expanded component: Content (its own fields), Style (background, size,
// alignment, colours - portalled in from the block editor via StyleFields -
// plus spacing and grid width) and Advanced (CSS class, HTML id).
function SectionEditor({
  section,
  parentLayout,
  panelLabel,
  onUpdate,
}: {
  section: EditableSection;
  parentLayout: string | null;
  panelLabel: string | null;
  onUpdate: (patch: Partial<EditableSection>) => void;
}) {
  const inGrid = SIZED_LAYOUTS.includes(parentLayout ?? "");
  const [styleTarget, setStyleTarget] = useState<HTMLDivElement | null>(null);
  const [tab, setTab] = useState("content");
  const panelTitle = section.fields.find((f) => f.itemIndex === 0 && f.fieldKey === PANEL_TITLE_KEY)?.textValue ?? "";

  function setPanelTitle(value: string) {
    const exists = section.fields.some((f) => f.itemIndex === 0 && f.fieldKey === PANEL_TITLE_KEY);
    onUpdate({
      fields: exists
        ? section.fields.map((f) => (f.itemIndex === 0 && f.fieldKey === PANEL_TITLE_KEY ? { ...f, textValue: value } : f))
        : [
            ...section.fields,
            { itemIndex: 0, fieldKey: PANEL_TITLE_KEY, fieldType: "text", textValue: value, mediaId: null, mediaUrl: null, urlValue: "", sortOrder: section.fields.length + 1 },
          ],
    });
  }

  return (
    <StyleTabTarget.Provider value={styleTarget}>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        className="section-editor-tabs"
        items={[
          {
            key: "content",
            label: "Content",
            children: (
              <div className="flex flex-col gap-4">
                {panelLabel && (
                  <Space.Compact block>
                    <Space.Addon>{panelLabel}</Space.Addon>
                    <Input
                      id={`section-${section.key}-panel-title`}
                      placeholder="Leave empty to use this component's heading"
                      value={panelTitle}
                      onChange={(e) => setPanelTitle(e.target.value)}
                    />
                  </Space.Compact>
                )}
                <BlockFieldEditor
                  blockType={section.blockType}
                  fields={section.fields}
                  nested={section.depth > 0}
                  onChange={(fields) => onUpdate({ fields })}
                />
              </div>
            ),
          },
          {
            key: "style",
            label: "Style",
            forceRender: true,
            children: (
              <div className="flex flex-col gap-4">
                <DeviceSwitch id={`section-${section.key}-device`} />
                <StylePanel title="General">
                <div ref={setStyleTarget} className="section-style-fields flex flex-col gap-4 empty:hidden" />
                <SpacingSettings section={section} onUpdate={onUpdate} />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Checkbox
                    checked={hasClass(section.customClass, TIGHT_TOP_CLASS)}
                    onChange={(e) => onUpdate({ customClass: toggleClass(section.customClass, TIGHT_TOP_CLASS, e.target.checked) })}
                  >
                    Less space above
                  </Checkbox>
                  <Checkbox
                    checked={hasClass(section.customClass, DIVIDER_TOP_CLASS)}
                    onChange={(e) => onUpdate({ customClass: toggleClass(section.customClass, DIVIDER_TOP_CLASS, e.target.checked) })}
                  >
                    Divider line above
                  </Checkbox>
                  {WIDE_CONTENT_BLOCK_TYPES.includes(section.blockType) && (
                    <Checkbox
                      checked={hasClass(section.customClass, WIDE_CONTENT_CLASS)}
                      onChange={(e) => onUpdate({ customClass: toggleClass(section.customClass, WIDE_CONTENT_CLASS, e.target.checked) })}
                    >
                      Wider content (960px)
                    </Checkbox>
                  )}
                  {inGrid && (
                    <label className="flex items-center gap-2 text-sm">
                      Width in container
                      <Select
                        size="small"
                        className="min-w-36"
                        value={groupClass(section.customClass, WIDTH_CLASSES)}
                        onChange={(cls: string) => onUpdate({ customClass: setExclusiveClass(section.customClass, WIDTH_CLASSES, cls) })}
                        options={parentLayout === "row" ? ROW_WIDTH_OPTIONS : WIDTH_OPTIONS}
                      />
                    </label>
                  )}
                </div>
                </StylePanel>
                <BoxSettings section={section} onUpdate={onUpdate} />
                <LayoutSettings section={section} inGrid={inGrid} onUpdate={onUpdate} />
              </div>
            ),
          },
          {
            key: "advanced",
            label: "Advanced",
            children: (
              <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-surface px-4 py-3 dark:bg-surface-muted-dark">
                <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Hide on</span>
                {VISIBILITY_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.cls}
                    id={`section-${section.key}-${option.cls}`}
                    checked={hasClass(section.customClass, option.cls)}
                    onChange={(e) => onUpdate({ customClass: toggleClass(section.customClass, option.cls, e.target.checked) })}
                  >
                    {option.label}
                  </Checkbox>
                ))}
                <DeviceRanges />
              </div>
              <label className="flex flex-wrap items-center gap-3 rounded-md bg-surface px-4 py-3 text-sm dark:bg-surface-muted-dark">
                <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Entrance animation</span>
                <Select
                  id={`section-${section.key}-animation`}
                  size="small"
                  className="min-w-56"
                  value={groupClass(section.customClass, ANIMATION_CLASSES)}
                  onChange={(cls: string) => onUpdate({ customClass: setExclusiveClass(section.customClass, ANIMATION_CLASSES, cls) })}
                  options={ANIMATION_OPTIONS}
                />
                <span className="text-xs text-text-muted dark:text-text-muted-dark">Plays once, when it scrolls into view.</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Space.Compact block>
                  <Space.Addon>CSS class</Space.Addon>
                  <Input
                    placeholder="optional"
                    value={extraClasses(section.customClass)}
                    onChange={(e) => {
                      const presets = PRESET_CLASSES.filter((c) => hasClass(section.customClass, c));
                      onUpdate({ customClass: composeClasses(e.target.value, presets) });
                    }}
                  />
                </Space.Compact>
                <Space.Compact block>
                  <Space.Addon>HTML id</Space.Addon>
                  <Input
                    placeholder="optional, e.g. faqs (for #faqs links)"
                    value={section.customId}
                    onChange={(e) => onUpdate({ customId: e.target.value })}
                  />
                </Space.Compact>
              </div>
              </div>
            ),
          },
        ]}
      />
    </StyleTabTarget.Provider>
  );
}

// ---- Style tab: spacing, background, font and border ----------------------
// Free-form values stored as text fields on itemIndex 0 (read by the site in
// web/src/lib/sectionStyle.ts). The older presets (section--pad-*, --box-*,
// --text-*, ...) still render; the controls show them as values, and
// changing one replaces its preset class with the field.

const STYLE_FIELD_ORDER: Record<string, number> = {
  stPadding: 100,
  stMargin: 101,
  stMinHeight: 102,
  stBg: 103,
  stBgColor: 104,
  stBgColor2: 105,
  stBgAngle: 106,
  stBgImage: 107,
  stBgSize: 108,
  stBgPosition: 109,
  stBgOverlay: 110,
  stFontSize: 111,
  stFontWeight: 112,
  stColor: 113,
  stBorder: 114,
  stBorderWidth: 115,
  stBorderColor: 116,
  stRadius: 117,
  bgType: 1,
  bgFrom: 2,
  bgTo: 3,
  bgImage: 4,
  gap: 7,
  minHeight: 20,
  bgAngle: 120,
  bgSize: 121,
  bgPosition: 122,
  bgOverlay: 123,
  // Tablet and mobile values (see DEVICE_SUFFIX).
  ...Object.fromEntries(
    ["stPadding", "stMargin", "stMinHeight", "stFontSize", "gap", "minHeight"].flatMap((key, i) => [
      [`${key}Tablet`, 130 + i * 2],
      [`${key}Mobile`, 131 + i * 2],
    ])
  ),
};

function fieldText(section: EditableSection, key: string): string {
  return section.fields.find((f) => f.itemIndex === 0 && f.fieldKey === key)?.textValue ?? "";
}

function withTextFields(fields: EditableField[], values: Record<string, string>): EditableField[] {
  let next = fields;
  for (const [key, value] of Object.entries(values)) {
    const i = next.findIndex((f) => f.itemIndex === 0 && f.fieldKey === key);
    if (i >= 0) next = next.map((f, j) => (j === i ? { ...f, textValue: value } : f));
    else if (value !== "")
      next = [
        ...next,
        { itemIndex: 0, fieldKey: key, fieldType: "text", textValue: value, mediaId: null, mediaUrl: null, urlValue: "", sortOrder: STYLE_FIELD_ORDER[key] ?? 100 },
      ];
  }
  return next;
}

function withImageField(fields: EditableField[], key: string, media: MediaDTO | null): EditableField[] {
  const patch = { mediaId: media?.id ?? null, mediaUrl: media ? mediaUrl(media.url) : null };
  const i = fields.findIndex((f) => f.itemIndex === 0 && f.fieldKey === key);
  if (i >= 0) return fields.map((f, j) => (j === i ? { ...f, ...patch } : f));
  return [...fields, { itemIndex: 0, fieldKey: key, fieldType: "image", textValue: "", urlValue: "", sortOrder: STYLE_FIELD_ORDER[key] ?? 100, ...patch }];
}

const PRESET_PADDING: Record<string, string> = { "section--pad-s": "16", "section--pad-m": "30", "section--pad-l": "50" };
const PRESET_MARGIN_TOP: Record<string, string> = { "section--mt-s": "16", "section--mt-m": "30", "section--mt-l": "50" };
const PRESET_MARGIN_BOTTOM: Record<string, string> = { "section--mb-s": "16", "section--mb-m": "30", "section--mb-l": "50" };
const MARGIN_CLASSES = [...Object.keys(PRESET_MARGIN_TOP), ...Object.keys(PRESET_MARGIN_BOTTOM)];
const PRESET_BOX: Record<string, Partial<BackgroundValue>> = {
  "section--box-white": { type: "color", color: "white" },
  "section--box-light": { type: "color", color: "primary-50" },
  "section--box-cream": { type: "color", color: "secondary-50" },
  "section--box-mint": { type: "color", color: "success-subtle" },
  "section--box-navy": { type: "color", color: "primary-900" },
  "section--box-blue": { type: "color", color: "primary-glow" },
  "section--box-gold": { type: "color", color: "secondary-600" },
  "section--box-gradient": { type: "linear", color: "primary-900", color2: "primary-glow", angle: "90" },
};
const PRESET_TEXT: Record<string, string> = {
  "section--text-navy": "primary-900",
  "section--text-muted": "primary-500",
  "section--text-white": "white",
  "section--text-gold": "secondary-600",
  "section--text-blue": "primary-glow",
};
const PRESET_BORDER: Record<string, { style: string; width: string; color: string }> = {
  "section--border-light": { style: "solid", width: "1", color: "primary-100" },
  "section--border-navy": { style: "solid", width: "2", color: "primary-900" },
  "section--border-gold": { style: "solid", width: "2", color: "secondary-600" },
};
const PRESET_RADIUS: Record<string, string> = { "section--radius-s": "6", "section--radius-m": "12", "section--radius-l": "20", "section--radius-pill": "999" };
const SHADOW_OPTIONS = STYLE_GROUPS.find((g) => g.id === "shadow")!.options;
const SHADOW_CLASSES = SHADOW_OPTIONS.map((o) => o.value).filter(Boolean);

// A Container's space presets in px (web ContainerSection).
const CONTAINER_SPACE_PX: Record<string, string> = { none: "0", s: "25", m: "50", l: "80" };
const CONTAINER_GAP_PX: Record<string, string> = { s: "16", m: "30", l: "50" };
const MIN_HEIGHT_PRESETS: Record<string, string> = { s: "200", m: "400", l: "600", screen: "100vh" };

const FONT_WEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi-bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra bold" },
];
const BORDER_STYLE_OPTIONS = [
  { value: "", label: "Default" },
  { value: "none", label: "None" },
  { value: "solid", label: "Solid ───" },
  { value: "dashed", label: "Dashed - - -" },
  { value: "dotted", label: "Dotted ·····" },
  { value: "double", label: "Double ═══" },
];

// Minimum height: a number with px or vh (% of the screen height).
function MinHeightInput({ id, value, placeholder, onChange }: { id: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  const vh = value ? value.endsWith("vh") : Boolean(placeholder?.endsWith("vh"));
  const number = value.replace(/vh$/, "");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PxInput id={id} value={number} placeholder={placeholder?.replace(/vh$/, "") || "None"} max={vh ? 100 : 3000} suffix="" onChange={(v) => onChange(v === "" ? "" : vh ? `${v}vh` : v)} />
      <ToggleButtons
        id={`${id}-unit`}
        value={vh ? "vh" : "px"}
        options={[
          { value: "px", label: "px" },
          { value: "vh", label: "% of screen" },
        ]}
        onChange={(unit) => number !== "" && onChange(unit === "vh" ? `${Math.min(100, Number(number))}vh` : number)}
      />
    </div>
  );
}

// General: padding, margin, a Container's gap between its items, and the
// minimum height.
function SpacingSettings({ section, onUpdate }: { section: EditableSection; onUpdate: (patch: Partial<EditableSection>) => void }) {
  const text = (key: string) => fieldText(section, key);
  const { device } = useEditDevice();
  const sfx = DEVICE_SUFFIX[device];
  const desktop = device === "desktop";
  const container = section.blockType === CONTAINER;
  const id = `section-${section.key}`;
  const set = (values: Record<string, string>, clearClasses: string[] = []) =>
    onUpdate({
      fields: withTextFields(section.fields, values),
      ...(clearClasses.length ? { customClass: setExclusiveClass(section.customClass, clearClasses, "") } : {}),
    });

  const padClass = groupClass(section.customClass, Object.keys(PRESET_PADDING));
  const padding = text("stPadding") || (padClass ? PRESET_PADDING[padClass] : "");
  const mt = PRESET_MARGIN_TOP[groupClass(section.customClass, Object.keys(PRESET_MARGIN_TOP))] ?? "";
  const mb = PRESET_MARGIN_BOTTOM[groupClass(section.customClass, Object.keys(PRESET_MARGIN_BOTTOM))] ?? "";
  const margin = text("stMargin") || joinSides([mt, "", mb, ""]);

  const layout = text("layout") || "stack";
  const ownSpacing = container && layout === "stack" && text("componentSpacing") === "own";
  const nested = section.depth > 0;
  const spaceDefault = nested ? "none" : "m";
  const sides = nested ? CONTAINER_SPACE_PX[text("spaceSides") || "none"] : "25";
  const paddingPlaceholders = container
    ? [CONTAINER_SPACE_PX[text("spaceTop") || spaceDefault], sides, CONTAINER_SPACE_PX[text("spaceBottom") || spaceDefault], sides]
    : [];
  const gapDefault = layout === "grid" || ["tabs", "accordion", "carousel"].includes(layout) ? "30" : "50";
  const gapValue = CONTAINER_GAP_PX[text("gap")] ?? text("gap");
  const minHeightKey = container ? "minHeight" : "stMinHeight";
  const minHeight = MIN_HEIGHT_PRESETS[text(minHeightKey)] ?? (text(minHeightKey) === "none" ? "" : text(minHeightKey));

  // On tablet / mobile: the device's own value, with the one it inherits as
  // the placeholder. Desktop edits also drop the old preset classes.
  const deviceBox = (key: string, desktopValue: string, defaults: string[] = []) =>
    desktop
      ? { value: desktopValue, placeholders: defaults }
      : {
          value: text(key + sfx),
          placeholders: inheritedSides(device === "mobile" ? [text(key + DEVICE_SUFFIX.tablet), desktopValue] : [desktopValue], defaults),
        };
  const setDevice = (key: string, v: string, clearClasses: string[] = []) => set({ [key + sfx]: v }, desktop ? clearClasses : []);
  const paddingBox = deviceBox("stPadding", padding, paddingPlaceholders);
  const marginBox = deviceBox("stMargin", margin);
  const gapBox = deviceBox("gap", gapValue, [gapDefault, gapDefault]);
  const minHeightOwn = desktop ? minHeight : text(minHeightKey + sfx);
  const minHeightInherited = desktop ? "" : inheritedValue(text, minHeightKey, device, minHeight);

  return (
    <div className="flex flex-col gap-3">
      {ownSpacing ? (
        <span className="text-xs text-text-muted dark:text-text-muted-dark">
          Padding and gap are off: this container is set to “Each component keeps its own” spacing.
        </span>
      ) : (
        <StyleRow
          label="Padding"
          responsive
          hint={container ? "Space inside the container, around its content. Empty boxes keep the default shown." : "Space inside the component's box."}
        >
          <SideBoxes
            id={`${id}-padding-${device}`}
            value={paddingBox.value}
            placeholders={paddingBox.placeholders}
            onChange={(v) => setDevice("stPadding", v, Object.keys(PRESET_PADDING))}
          />
        </StyleRow>
      )}
      <StyleRow label="Margin" responsive hint="Space outside the box, pushing it away from what is around it.">
        <SideBoxes
          id={`${id}-margin-${device}`}
          value={marginBox.value}
          placeholders={marginBox.placeholders}
          onChange={(v) => setDevice("stMargin", v, MARGIN_CLASSES)}
        />
      </StyleRow>
      {container && !ownSpacing && (
        <StyleRow label="Gap" responsive hint="Space between the components inside.">
          <SideBoxes
            id={`${id}-gap-${device}`}
            value={gapBox.value}
            labels={["Between rows", "Between columns"]}
            placeholders={gapBox.placeholders}
            onChange={(v) => setDevice("gap", v)}
          />
        </StyleRow>
      )}
      {(!container || layout === "stack" || layout === "row") && (
        <StyleRow label="Minimum height" responsive>
          <MinHeightInput
            id={`${id}-min-height-${device}`}
            value={minHeightOwn}
            placeholder={minHeightInherited}
            onChange={(v) => setDevice(minHeightKey, v)}
          />
        </StyleRow>
      )}
    </div>
  );
}

// Box & text: background, font and border of the component's own box. A
// Container's background is its full-width band (the bgType fields).
function BoxSettings({ section, onUpdate }: { section: EditableSection; onUpdate: (patch: Partial<EditableSection>) => void }) {
  const text = (key: string) => fieldText(section, key);
  const container = section.blockType === CONTAINER;
  const id = `section-${section.key}`;
  const update = (fields: EditableField[], clearClasses: string[] = []) =>
    onUpdate({ fields, ...(clearClasses.length ? { customClass: setExclusiveClass(section.customClass, clearClasses, "") } : {}) });
  const set = (values: Record<string, string>, clearClasses: string[] = []) => update(withTextFields(section.fields, values), clearClasses);
  const { device } = useEditDevice();
  const fontSizeKey = `stFontSize${DEVICE_SUFFIX[device]}`;

  // Background: which fields it lives in, and its value (or its preset's).
  const keys = container
    ? { type: "bgType", color: "bgFrom", color2: "bgTo", angle: "bgAngle", image: "bgImage", size: "bgSize", position: "bgPosition", overlay: "bgOverlay" }
    : { type: "stBg", color: "stBgColor", color2: "stBgColor2", angle: "stBgAngle", image: "stBgImage", size: "stBgSize", position: "stBgPosition", overlay: "stBgOverlay" };
  const boxClasses = Object.keys(PRESET_BOX);
  const boxPreset = PRESET_BOX[groupClass(section.customClass, boxClasses)];
  const storedType = container ? (text("bgType") === "gradient" ? "linear" : text("bgType")) : text("stBg");
  const imageField = section.fields.find((f) => f.itemIndex === 0 && f.fieldKey === keys.image);
  const brandDefaults = container && storedType !== "" && storedType !== "none";
  const background: BackgroundValue =
    (!storedType || storedType === "none") && boxPreset
      ? { type: "none", color: "", color2: "", angle: "", imageUrl: null, size: "", position: "", overlay: "", ...boxPreset }
      : {
          type: storedType || "none",
          color: text(keys.color) || (brandDefaults ? "primary-900" : ""),
          color2: text(keys.color2) || (brandDefaults ? "primary-glow" : ""),
          // A Container's gradient without an angle runs top to bottom.
          angle: text(keys.angle) || (container && storedType === "linear" ? "180" : ""),
          imageUrl: imageField?.mediaUrl ?? null,
          size: text(keys.size),
          position: text(keys.position),
          overlay: text(keys.overlay),
        };

  function setBackground(patch: Partial<BackgroundValue>) {
    const next = { ...background, ...patch };
    // Starting a colour or gradient: begin from brand colours, not nothing.
    if (patch.type === "color" && !next.color) next.color = "primary-50";
    if ((patch.type === "linear" || patch.type === "radial") && !next.color) next.color = "primary-900";
    if ((patch.type === "linear" || patch.type === "radial") && !next.color2) next.color2 = "primary-glow";
    set(
      {
        [keys.type]: container && next.type === "linear" ? "gradient" : next.type,
        [keys.color]: next.color,
        [keys.color2]: next.color2,
        [keys.angle]: next.angle,
        [keys.size]: next.size,
        [keys.position]: next.position,
        [keys.overlay]: next.overlay,
      },
      boxClasses
    );
  }

  const color = text("stColor") || PRESET_TEXT[groupClass(section.customClass, Object.keys(PRESET_TEXT))] || "";
  const borderPreset = PRESET_BORDER[groupClass(section.customClass, Object.keys(PRESET_BORDER))];
  const borderStyle = text("stBorder") || borderPreset?.style || "";
  const borderWidth = text("stBorderWidth") || borderPreset?.width || "";
  const borderColor = text("stBorderColor") || borderPreset?.color || "";
  const setBorder = (values: Record<string, string>) =>
    set({ stBorder: borderStyle, stBorderWidth: borderWidth, stBorderColor: borderColor, ...values }, Object.keys(PRESET_BORDER));
  const radius = text("stRadius") || PRESET_RADIUS[groupClass(section.customClass, Object.keys(PRESET_RADIUS))] || "";
  const hasBorder = borderStyle !== "" && borderStyle !== "none";

  return (
    <StylePanel title="Box & text" className="section-box-settings">
      <StyleRow label="Background" hint={container ? "Fills the container's full width." : "The component's own box."}>
        <BackgroundControl
          id={`${id}-bg`}
          value={background}
          onChange={setBackground}
          onImage={(media) => update(withImageField(withTextFields(section.fields, { [keys.type]: "image" }), keys.image, media), boxClasses)}
        />
      </StyleRow>
      <div className="border-t border-border dark:border-border-dark" />
      <StyleRow label="Font size" responsive hint={container ? "For text inside that has no size of its own." : "All the component's text; buttons keep theirs."}>
        <PxInput
          id={`${id}-font-size-${device}`}
          value={text(fontSizeKey)}
          placeholder={inheritedValue(text, "stFontSize", device) || "Default"}
          max={200}
          onChange={(v) => set({ [fontSizeKey]: v })}
        />
      </StyleRow>
      <StyleRow label="Font weight">
        <ToggleButtons id={`${id}-font-weight`} value={text("stFontWeight")} options={FONT_WEIGHT_OPTIONS} onChange={(v) => set({ stFontWeight: v })} />
      </StyleRow>
      <StyleRow label="Text colour" hint="Headings, text and lists; buttons and links keep theirs.">
        <ColorField id={`${id}-text-color`} value={color} onChange={(v) => set({ stColor: v }, Object.keys(PRESET_TEXT))} />
      </StyleRow>
      <div className="border-t border-border dark:border-border-dark" />
      <StyleRow label="Border">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            id={`${id}-border-style`}
            size="small"
            className="min-w-36"
            value={borderStyle}
            onChange={(v: string) => setBorder({ stBorder: v, ...(v && v !== "none" && !borderWidth ? { stBorderWidth: "1" } : {}) })}
            options={BORDER_STYLE_OPTIONS}
          />
          {hasBorder && <PxInput id={`${id}-border-width`} value={borderWidth} placeholder="1" max={50} onChange={(v) => setBorder({ stBorderWidth: v })} />}
        </div>
      </StyleRow>
      {hasBorder && (
        <StyleRow label="Border colour">
          <ColorField id={`${id}-border-color`} value={borderColor} onChange={(v) => setBorder({ stBorderColor: v })} />
        </StyleRow>
      )}
      <StyleRow label="Rounded corners">
        <div className="flex flex-wrap items-center gap-2">
          <PxInput id={`${id}-radius`} value={radius} placeholder="0" max={999} onChange={(v) => set({ stRadius: v }, Object.keys(PRESET_RADIUS))} />
          <ToggleButtons
            value={["0", "6", "12", "20", "999"].includes(radius) ? radius : ""}
            options={[
              { value: "0", label: "Square" },
              { value: "6", label: "S" },
              { value: "12", label: "M" },
              { value: "20", label: "L" },
              { value: "999", label: "Pill" },
            ]}
            onChange={(v) => set({ stRadius: v }, Object.keys(PRESET_RADIUS))}
          />
        </div>
      </StyleRow>
      <StyleRow label="Shadow">
        <ToggleButtons
          id={`${id}-shadow`}
          value={groupClass(section.customClass, SHADOW_CLASSES)}
          options={SHADOW_OPTIONS}
          onChange={(cls) => onUpdate({ customClass: setExclusiveClass(section.customClass, SHADOW_CLASSES, cls) })}
        />
      </StyleRow>
    </StylePanel>
  );
}

// Style tab "Layout": a row per device with its content max width, column
// position and text alignment, plus the vertical position in a grid
// Container's row.
function LayoutSettings({
  section,
  inGrid,
  onUpdate,
}: {
  section: EditableSection;
  inGrid: boolean;
  onUpdate: (patch: Partial<EditableSection>) => void;
}) {
  return (
    <div className="section-layout-settings flex flex-col gap-3 rounded-md bg-surface px-4 py-3 dark:bg-surface-muted-dark">
      <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Responsive</span>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs text-text-muted dark:text-text-muted-dark">
              <th className="pr-3 pb-1 font-medium">Device</th>
              {LAYOUT_PROPS.map((p) => (
                <th key={p.prop} className="pr-3 pb-1 font-medium">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAYOUT_DEVICES.map((device) => (
              <tr key={device.code}>
                <td className="py-1 pr-3 whitespace-nowrap text-text dark:text-text-dark">{device.label}</td>
                {LAYOUT_PROPS.map((p) => {
                  const group = layoutGroup(p.prop, device.code);
                  const current = groupClass(section.customClass, group);
                  const id = `section-${section.key}-${p.prop}-${device.code}`;
                  const value = current ? current.slice(layoutClass(p.prop, device.code, "").length) : "";
                  const set = (v: string) =>
                    onUpdate({ customClass: setExclusiveClass(section.customClass, group, v ? layoutClass(p.prop, device.code, v) : "") });
                  return (
                    <td key={p.prop} className="py-1 pr-3">
                      {p.options.some((o) => o.icon) ? (
                        <Radio.Group
                          id={id}
                          size="small"
                          optionType="button"
                          buttonStyle="solid"
                          className="layout-icon-radio flex whitespace-nowrap"
                          aria-label={`${p.label}, ${device.label}`}
                          value={value}
                          onChange={(e) => set(e.target.value)}
                        >
                          {p.options.map((o) => (
                            <Radio.Button key={o.value} id={`${id}-${o.value || "default"}`} value={o.value} title={o.label} aria-label={o.label}>
                              {o.icon ? <span className="flex h-full items-center">{o.icon}</span> : o.label}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      ) : (
                        <Select id={id} size="small" className="w-full min-w-28" value={value} onChange={set} options={p.options} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {inGrid && (
        <label className="flex items-center gap-2 text-sm">
          Vertical position in container
          <Select
            size="small"
            className="min-w-36"
            value={groupClass(section.customClass, VALIGN_CLASSES)}
            onChange={(cls: string) => onUpdate({ customClass: setExclusiveClass(section.customClass, VALIGN_CLASSES, cls) })}
            options={VALIGN_OPTIONS}
          />
        </label>
      )}
      <span className="text-xs text-text-muted dark:text-text-muted-dark">
        Default keeps the component&apos;s own layout. Max width is the content&apos;s width; position places it when it is
        narrower than the page. <DeviceRanges />
      </span>
    </div>
  );
}

let clientKeySeq = 0;
function nextClientKey() {
  clientKeySeq += 1;
  return `new-${clientKeySeq}`;
}

function fromDTO(sections: PageSectionDTO[]): EditableSection[] {
  return normalizeContainers(
    sections
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        key: `existing-${s.id}`,
        blockType: s.blockType,
        customClass: s.customClass,
        customId: s.customId,
        depth: sectionDepth(s),
        // Fields come back from the API with a relative mediaUrl (e.g.
        // "/uploads/x.webp") — the API's own convention, since it's the
        // consumer's job to resolve it against the right host. Left
        // unresolved here, the browser would resolve it against the admin
        // app's own origin instead of the API's.
        fields: s.fields.map((f) => (f.mediaUrl ? { ...f, mediaUrl: mediaUrl(f.mediaUrl) } : f)),
      })),
  );
}

function initialEditable(sections: PageSectionDTO[]): EditableSection[] {
  if (sections.length > 0) return fromDTO(sections);
  return [{ key: nextClientKey(), blockType: CONTAINER, customClass: "", customId: "", depth: 0, fields: defaultFieldsForBlockType(CONTAINER) }];
}

function snapshot(sections: EditableSection[]): string {
  return JSON.stringify(sections.map(({ blockType, customClass, customId, depth, fields }) => ({ blockType, customClass, customId, depth, fields })));
}

function cloneSection(source: EditableSection, patch: Partial<EditableSection> = {}): EditableSection {
  return { ...source, key: nextClientKey(), customId: "", fields: source.fields.map((f) => ({ ...f })), ...patch };
}

// Full-tree editor for a page's content sections. Local edits are held in
// component state and only reach the API on "Save Page Content", which
// PUTs the whole section/field tree in one shot (see PageRepo.ReplaceSections
// on the backend). Sections start collapsed to a one-line summary so a long
// page stays scannable; only the sections being edited are expanded, and an
// expanded one is tinted so its fields read as one block. A Container lists
// its components inside its own frame. "Add Component" and "Save" are handed
// up as floating actions (onActionsChange) so they're reachable without
// scrolling back to the top.
export default function SectionBuilder({
  pageId,
  initialSections,
  onActionsChange,
  isGlobal = false,
}: {
  pageId: number;
  initialSections: PageSectionDTO[];
  onActionsChange?: (actions: SaveAction[]) => void;
  isGlobal?: boolean;
}) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  // A page with no content yet starts with one empty Container (level 0),
  // ready for "+ Add Component Inside"; it's only stored once saved.
  const [sections, setSections] = useState<EditableSection[]>(() => initialEditable(initialSections));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(initialEditable(initialSections)));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollToKey = useRef<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [insertDepth, setInsertDepth] = useState(0);
  const pickerGroups = useMemo(() => buildPickerGroups(insertDepth, isGlobal), [insertDepth, isGlobal]);
  const [globalNames, setGlobalNames] = useState<Map<string, string>>(() => new Map());
  const [libraryIndex, setLibraryIndex] = useState<number | null>(null);
  const [libraryName, setLibraryName] = useState("");
  const [libraryKind, setLibraryKind] = useState<"template" | "global">("template");
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [templates, setTemplates] = useState<SectionTemplateDTO[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  // The device the Style tab edits and the Live Preview shows.
  const [editDevice, setEditDevice] = useState<EditDevice>("desktop");
  const deviceContext = useMemo(() => ({ device: editDevice, setDevice: setEditDevice }), [editDevice]);
  const clipboard = useSectionClipboard();

  useEffect(() => {
    if (isGlobal) return;
    api
      .get<{ globalSections: GlobalSectionDTO[] }>("/api/admin/global-sections")
      .then((data) => setGlobalNames(new Map((data.globalSections ?? []).map((g) => [String(g.id), g.name]))))
      .catch(() => undefined);
  }, [isGlobal]);

  function loadTemplates() {
    api
      .get<{ templates: SectionTemplateDTO[] }>("/api/admin/section-templates")
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => undefined);
  }

  useEffect(loadTemplates, []);

  const pickerTemplates = templates.filter(
    (t) => !(insertDepth >= MAX_DEPTH && t.blockTypes.includes(CONTAINER)) && !(isGlobal && t.blockTypes.includes(GLOBAL_SECTION)),
  );

  const dirty = snapshot(sections) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!scrollToKey.current) return;
    document.getElementById(`section-${scrollToKey.current}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToKey.current = null;
  });

  function update(change: (prev: EditableSection[]) => EditableSection[]) {
    setSections((prev) => normalizeContainers(change(prev)));
  }

  function toggleIn(set: Set<string>, key: string): Set<string> {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  }

  function insertSections(added: EditableSection[], atIndex?: number) {
    update((prev) => {
      const next = [...prev];
      next.splice(atIndex ?? next.length, 0, ...added);
      return next;
    });
    setExpanded((prev) => new Set(prev).add(added[0].key));
    scrollToKey.current = added[0].key;
  }

  function addSection(blockType: PageBlockType) {
    insertSections(
      [
        {
          key: nextClientKey(),
          blockType,
          customClass: "",
          customId: "",
          depth: insertDepth,
          fields: defaultFieldsForBlockType(blockType),
        },
      ],
      insertAt ?? undefined,
    );
  }

  function openPicker(atIndex: number | null = null, depth = 0) {
    setInsertAt(atIndex);
    setInsertDepth(depth);
    setPickerOpen(true);
  }

  function insertBelow(index: number) {
    openPicker(unitEnd(sections, index), sections[index].depth);
  }

  // Inserts copies (pasted, or from a template) where the picker was opened,
  // at that level: their own levels are relative to the first copy (a
  // Container brings what is inside it). A lone component at level 0 gets a
  // Container of its own (normalizeContainers).
  function insertCopies(copies: CopiedSection[], what: string, at: number | null = insertAt, depth = insertDepth): boolean {
    if (copies.length === 0) return false;
    if (isGlobal && copies.some((c) => c.blockType === GLOBAL_SECTION)) {
      message.warning(`This ${what} places a global section, which can't go inside another global section.`);
      return false;
    }
    const added: EditableSection[] = copies.map((c, i) => ({
      key: nextClientKey(),
      blockType: c.blockType,
      customClass: c.customClass,
      customId: "",
      depth: depth + (i === 0 ? 0 : sectionDepth(c)),
      fields: c.fields.map((f) => ({ ...f, mediaUrl: f.mediaUrl ? mediaUrl(f.mediaUrl) : f.mediaUrl })),
    }));
    if (Math.max(depth, 1) + unitDepthSpan(shiftDepth(added, -depth)) > MAX_DEPTH) {
      message.warning(`This ${what} has containers nested too deep to go here. Add it at a higher level instead.`);
      return false;
    }
    insertSections(added, at ?? undefined);
    return true;
  }

  // Copies keep their levels relative to the first one (level 0).
  function toCopies(unit: EditableSection[]): CopiedSection[] {
    const base = unit[0]?.depth ?? 0;
    return unit.map((s) => ({
      blockType: s.blockType,
      customClass: s.customClass,
      customId: s.customId,
      depth: s.depth - base,
      inContainer: s.depth > base,
      fields: s.fields.map((f) => ({ ...f })),
    }));
  }

  function copySection(index: number) {
    const unit = sections.slice(index, unitEnd(sections, index));
    const summary = sectionSummary(unit[0].blockType === CONTAINER ? (unit[1]?.fields ?? []) : unit[0].fields);
    const label = `${BLOCK_TYPE_LABELS[unit[0].blockType] ?? unit[0].blockType}${summary ? `: ${summary}` : ""}${
      unit.length > 1 ? ` (+${unit.length - 1} inside)` : ""
    }`;
    if (copySectionsToClipboard({ label, sections: toCopies(unit) })) {
      message.success("Copied. Paste it on any page from “+ Add Component”.");
    } else {
      message.error("Could not copy — this browser is blocking local storage.");
    }
  }

  function pasteClipboard() {
    if (clipboard && insertCopies(clipboard.sections, "copied component")) message.success("Pasted. Save Page Content to keep it.");
  }

  async function insertTemplate(template: SectionTemplateDTO) {
    try {
      const data = await api.get<{ sections: PageSectionDTO[] }>(`/api/admin/section-templates/${template.id}`);
      const ordered = (data.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const base = ordered.length > 0 ? sectionDepth(ordered[0]) : 0;
      const copies = ordered.map((s) => ({
        blockType: s.blockType,
        customClass: s.customClass,
        customId: s.customId,
        depth: sectionDepth(s) - base,
        inContainer: sectionDepth(s) > base,
        fields: s.fields,
      }));
      if (insertCopies(copies, "template")) message.success(`Inserted “${template.name}”. Save Page Content to keep it.`);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load the template.");
    }
  }

  function insertReadyTemplate(template: ReadyTemplate) {
    if (insertCopies(template.sections, "ready-made section")) message.success(`Inserted “${template.name}”. Replace the sample text, then Save Page Content.`);
  }

  async function deleteTemplate(template: SectionTemplateDTO) {
    const ok = await confirm({
      title: "Delete Template",
      message: `Delete the template “${template.name}”? Pages that already used it keep their copy.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/section-templates/${template.id}`);
      message.success("Template deleted.");
      loadTemplates();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete the template.");
    }
  }

  function duplicateSection(index: number) {
    const end = unitEnd(sections, index);
    insertSections(
      sections.slice(index, end).map((s) => cloneSection(s)),
      end,
    );
  }

  // A Container goes with everything inside it: its components can't stay
  // on the page outside a Container (level 0 takes only Containers).
  async function removeSection(index: number) {
    const section = sections[index];
    const isContainer = section.blockType === CONTAINER;
    const unit = sections.slice(index, unitEnd(sections, index));
    const inside = unit.length - 1;
    const ok = await confirm({
      title: isContainer ? "Remove Container" : "Remove Section",
      message: isContainer
        ? inside > 0
          ? `Remove this container and the ${inside} section${inside === 1 ? "" : "s"} inside it? To keep one, drag it into another container first. This only takes effect once you save.`
          : "Remove this empty container? This only takes effect once you save."
        : "Remove this section from the page? This only takes effect once you save.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    const keys = new Set(unit.map((s) => s.key));
    update((prev) => prev.filter((s) => !keys.has(s.key)));
  }

  // Up and down swap a section (with everything inside it) with the one
  // next to it at the same level, inside the same Container.
  function canMove(index: number, direction: -1 | 1): boolean {
    if (direction === -1) return previousSiblingStart(sections, index) >= 0;
    return sections[unitEnd(sections, index)]?.depth === sections[index].depth;
  }

  function moveSection(index: number, direction: -1 | 1) {
    if (!canMove(index, direction)) return;
    update((prev) => {
      const end = unitEnd(prev, index);
      const unit = prev.slice(index, end);
      if (direction === -1) {
        const start = previousSiblingStart(prev, index);
        return [...prev.slice(0, start), ...unit, ...prev.slice(start, index), ...prev.slice(end)];
      }
      const nextEnd = unitEnd(prev, end);
      return [...prev.slice(0, index), ...prev.slice(end, nextEnd), ...unit, ...prev.slice(nextEnd)];
    });
  }

  // The layout of the Container a section is inside ("stack" at level 0).
  function parentLayout(index: number): string | null {
    const parent = parentIndex(sections, index);
    if (parent < 0) return null;
    return sections[parent].fields.find((f) => f.itemIndex === 0 && f.fieldKey === "layout")?.textValue || "stack";
  }

  // Indent: into the Container just above, at the same level, as its last
  // section. Outdent: out of its Container, placed right after it.
  function canIndent(index: number): boolean {
    const previous = previousSiblingStart(sections, index);
    if (previous < 0 || sections[previous].blockType !== CONTAINER) return false;
    const unit = sections.slice(index, unitEnd(sections, index));
    return sections[index].depth + 1 + unitDepthSpan(unit) <= MAX_DEPTH;
  }

  function indent(index: number) {
    if (!canIndent(index)) return;
    update((prev) => {
      const end = unitEnd(prev, index);
      return [...prev.slice(0, index), ...shiftDepth(prev.slice(index, end), 1), ...prev.slice(end)];
    });
  }

  function canOutdent(index: number): boolean {
    const section = sections[index];
    if (section.depth === 0) return false;
    return section.depth > 1 || section.blockType === CONTAINER || section.blockType === GLOBAL_SECTION;
  }

  function outdent(index: number) {
    if (!canOutdent(index)) return;
    update((prev) => {
      const parent = parentIndex(prev, index);
      if (parent < 0) return prev;
      const end = unitEnd(prev, index);
      const unit = shiftDepth(prev.slice(index, end), -1);
      const rest = [...prev.slice(0, index), ...prev.slice(end)];
      const at = unitEnd(rest, parent);
      return [...rest.slice(0, at), ...unit, ...rest.slice(at)];
    });
  }

  function dragOver(e: React.DragEvent<HTMLElement>, key: string, position?: DropPosition) {
    if (!dragKey) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const next = position ?? (e.clientY < rect.top + rect.height / 2 ? "before" : "after");
    if (dropTarget?.key !== key || dropTarget.position !== next) setDropTarget({ key, position: next });
  }

  function drop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (dragKey && dropTarget) {
      const next = applyDrop(sections, dragKey, dropTarget);
      if (next) {
        setSections(next);
        scrollToKey.current = null;
      }
    }
    endDrag();
  }

  function endDrag() {
    setDragKey(null);
    setDropTarget(null);
  }

  function startDrag(e: React.DragEvent<HTMLElement>, section: EditableSection) {
    setDragKey(section.key);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", section.key);
    const preview = document.getElementById(section.blockType === CONTAINER ? `container-${section.key}` : `section-${section.key}`);
    if (preview) e.dataTransfer.setDragImage(preview, 24, 24);
  }

  function isDragged(index: number): boolean {
    if (!dragKey) return false;
    const from = sections.findIndex((s) => s.key === dragKey);
    return from >= 0 && index >= from && index < unitEnd(sections, from);
  }

  // "Save to Library": a template is a copy inserted later from + Add
  // Component (this page keeps its section); a global section is linked - it
  // is created at once and a Global Section block takes the section's place
  // here, which still needs "Save Page Content".
  async function saveToLibrary() {
    if (libraryIndex === null) return;
    const picked = sections.slice(libraryIndex, unitEnd(sections, libraryIndex));
    // Saved at level 0. A global section's own content follows the page
    // levels too, so a lone component is saved inside a Container of its own.
    const relative = shiftDepth(picked, -picked[0].depth);
    const unit = libraryKind === "global" && picked[0].blockType !== CONTAINER ? [wrapperContainer(), ...shiftDepth(relative, 1)] : relative;
    const unitPayload = unit.map((s, i) => ({
      blockType: s.blockType,
      customClass: s.customClass,
      customId: s.customId,
      depth: s.depth,
      inContainer: s.depth > 0,
      sortOrder: i + 1,
      fields: s.fields.map((f, fi) => ({ ...f, sortOrder: fi + 1 })),
    }));
    setSavingLibrary(true);
    try {
      if (libraryKind === "template") {
        await api.post("/api/admin/section-templates", { name: libraryName, sections: unitPayload });
        loadTemplates();
        setLibraryIndex(null);
        message.success(`Saved “${libraryName.trim()}” as a template. Insert it on any page from “+ Add Component”.`);
        return;
      }
      const data = await api.post<{ globalSection: GlobalSectionDTO }>("/api/admin/global-sections", { name: libraryName, sections: unitPayload });
      const created = data.globalSection;
      setGlobalNames((prev) => new Map(prev).set(String(created.id), created.name));
      const placeholder: EditableSection = {
        key: nextClientKey(),
        blockType: GLOBAL_SECTION,
        customClass: "",
        customId: "",
        depth: picked[0].depth,
        fields: [{ itemIndex: 0, fieldKey: "globalId", fieldType: "text", textValue: String(created.id), mediaId: null, mediaUrl: null, urlValue: "", sortOrder: 1 }],
      };
      update((prev) => {
        const start = prev.findIndex((s) => s.key === picked[0].key);
        return [...prev.slice(0, start), placeholder, ...prev.slice(start + picked.length)];
      });
      setLibraryIndex(null);
      message.success(`"${created.name}" is now a global section. Save Page Content to keep it on this page.`);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save to the library.");
    } finally {
      setSavingLibrary(false);
    }
  }

  function openLibrary(index: number) {
    const section = sections[index];
    setLibraryName(sectionSummary(section.blockType === CONTAINER ? (sections[index + 1]?.fields ?? []) : section.fields));
    setLibraryKind("template");
    setLibraryIndex(index);
  }

  function sectionsPayload() {
    return {
      sections: sections.map((s, i) => ({
        blockType: s.blockType,
        customClass: s.customClass,
        customId: s.customId,
        depth: s.depth,
        inContainer: s.depth > 0,
        sortOrder: i + 1,
        fields: s.fields.map((f, fi) => ({ ...f, sortOrder: fi + 1 })),
      })),
    };
  }

  function updateSection(key: string, patch: Partial<EditableSection>) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/api/admin/pages/${pageId}/sections`, sectionsPayload());
      setSavedSnapshot(snapshot(sections));
      message.success("Page content saved.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save page content.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    onActionsChange?.([
      { id: "section-builder-preview", label: previewOpen ? "Hide Preview" : "Preview", onSave: () => setPreviewOpen((v) => !v), variant: "default" },
      { id: "section-builder-add", label: "+ Add Container", onSave: () => openPicker(), variant: "default" },
      { id: "section-builder-save", label: "Save Page Content", onSave: handleSave, saving },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, sections, previewOpen]);

  const allExpanded = sections.length > 0 && sections.every((s) => expanded.has(s.key));

  // Starts of the sections directly inside the Container at parent (-1 =
  // the page itself).
  function childStarts(parent: number): number[] {
    const depth = parent < 0 ? 0 : sections[parent].depth + 1;
    const end = parent < 0 ? sections.length : unitEnd(sections, parent);
    const starts: number[] = [];
    for (let i = parent + 1; i < end; ) {
      if (sections[i].depth === depth) starts.push(i);
      i = unitEnd(sections, i);
    }
    return starts;
  }

  // A section, or a Container framing everything inside it (numbered 1,
  // 1.2, 1.2.1...), with "+ Add Component Inside" at the end of each.
  function renderUnit(start: number, number: string): ReactNode {
    const head = sections[start];
    if (head.blockType !== CONTAINER) return renderSection(head, start, number);
    const end = unitEnd(sections, start);
    const children = childStarts(start);
    return (
      <div
        key={`container-${head.key}`}
        id={`container-${head.key}`}
        className={`container-block flex flex-col gap-2 rounded-xl border-2 border-dashed p-2 dark:border-border-dark dark:bg-transparent ${
          head.depth === 0 ? "border-primary-200 bg-primary-50/30" : "border-primary-300 bg-white/60"
        }`}
      >
        {renderSection(head, start, number)}
        <div className="ml-4 flex flex-col gap-2 border-l-2 border-primary-200 pl-3 sm:ml-6 dark:border-border-dark">
          {children.map((child, i) => renderUnit(child, `${number}.${i + 1}`))}
          {children.length === 0 && (
            <p className="px-1 py-2 text-xs text-text-muted dark:text-text-muted-dark">
              This container is empty — add a component inside it, or drag one in.
            </p>
          )}
          <div
            onDragOver={(e) => dragOver(e, head.key, "inside")}
            onDrop={drop}
            className={`flex items-center gap-3 rounded-md ${
              dropTarget?.key === head.key && dropTarget.position === "inside" ? "bg-primary-100 outline-2 outline-primary-500 outline-dashed" : ""
            }`}
          >
            <button
              type="button"
              id={`section-${head.key}-add-inside`}
              onClick={() => openPicker(end, head.depth + 1)}
              className="cursor-pointer rounded-md border border-dashed border-primary-300 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:text-text-dark dark:hover:bg-surface-muted-dark"
            >
              + Add Component Inside
            </button>
            {dragKey && <span className="text-xs text-text-muted dark:text-text-muted-dark">or drop here to add it to this container</span>}
          </div>
        </div>
      </div>
    );
  }

  function renderSection(section: EditableSection, index: number, label: string) {
    const isOpen = expanded.has(section.key);
    const isContainer = section.blockType === CONTAINER;
    const layoutAbove = parentLayout(index);
    const componentCount = isContainer ? sections.slice(index + 1, unitEnd(sections, index)).filter((s) => s.depth === section.depth + 1).length : 0;
    const globalId = section.blockType === GLOBAL_SECTION ? (section.fields.find((f) => f.fieldKey === "globalId")?.textValue ?? "") : "";
    const summary = isContainer
      ? `${componentCount} component${componentCount === 1 ? "" : "s"} inside`
      : globalId
        ? (globalNames.get(globalId) ?? `Global section #${globalId}`)
        : sectionSummary(section.fields);
    const items = itemCount(section.fields);
    const hiddenOn = VISIBILITY_OPTIONS.filter((o) => hasClass(section.customClass, o.cls)).map((o) => o.label.toLowerCase());
    const customLayout = [...LAYOUT_CLASSES, ...VALIGN_CLASSES, ...STYLE_CLASSES].some((cls) => hasClass(section.customClass, cls));
    const animated = ANIMATION_CLASSES.some((cls) => hasClass(section.customClass, cls));
    const panelLabel = layoutAbove ? (PANEL_TITLE_LABELS[layoutAbove] ?? null) : null;

    const dropHere = dropTarget?.key === section.key ? dropTarget.position : null;

    return (
      <div
        key={section.key}
        id={`section-${section.key}`}
        onDragOver={(e) => dragOver(e, section.key)}
        onDrop={drop}
        className={`section-block relative flex scroll-mt-24 flex-col rounded-lg border transition-colors ${isDragged(index) ? "opacity-40" : ""} ${
          isOpen
            ? "section-block--open border-primary-300 bg-primary-50/70 shadow-sm dark:border-primary-500 dark:bg-surface-muted-dark/60"
            : "border-border bg-surface dark:border-border-dark dark:bg-transparent"
        }`}
      >
        {dropHere && dropHere !== "inside" && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 z-10 h-1 rounded bg-primary-500 ${dropHere === "before" ? "-top-2" : "-bottom-2"}`}
          />
        )}
        <div className={`flex items-center gap-2 rounded-t-lg py-3 pr-4 pl-2 ${isOpen ? "bg-primary-100/70 dark:bg-surface-muted-dark" : ""}`}>
          <span
            draggable
            onDragStart={(e) => startDrag(e, section)}
            onDragEnd={endDrag}
            title={isContainer ? "Drag to move the container and its components" : "Drag to move"}
            aria-label="Drag to move"
            className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-text-muted hover:text-primary-700 active:cursor-grabbing dark:text-text-muted-dark"
          >
            <IconGripVertical width={16} height={16} />
          </span>
          <span className="w-7 shrink-0 text-center text-xs font-semibold text-text-muted dark:text-text-muted-dark">{label}</span>
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setExpanded((prev) => toggleIn(prev, section.key))}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
          >
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold dark:bg-surface-muted-dark dark:text-text-dark ${
                isContainer ? "bg-primary-700 text-white" : "bg-primary-100 text-primary-700"
              }`}
            >
              {BLOCK_TYPE_LABELS[section.blockType] ?? section.blockType}
            </span>
            <span
              title={
                section.depth > 0
                  ? `Level ${section.depth}: inside a Container, renders as <div>`
                  : "Level 0: directly on the page, renders as <section>"
              }
              className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-muted dark:border-border-dark dark:text-text-muted-dark"
            >
              {section.depth > 0 ? `L${section.depth} · div` : isContainer ? "L0 · section" : "L0"}
            </span>
            <span className="truncate text-sm text-text dark:text-text-dark">
              {summary || <span className="text-text-muted italic dark:text-text-muted-dark">No heading</span>}
            </span>
            {items > 0 && <span className="shrink-0 text-xs text-text-muted dark:text-text-muted-dark">{items} items</span>}
            {hiddenOn.length > 0 && (
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark">
                Hidden on {hiddenOn.join(", ")}
              </span>
            )}
            {customLayout && (
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark">
                Custom style
              </span>
            )}
            {animated && (
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark">
                Animated
              </span>
            )}
            <span aria-hidden="true" className="ml-auto shrink-0 text-xs text-text-muted dark:text-text-muted-dark">
              {isOpen ? "▲" : "▼"}
            </span>
          </button>
          <div className="flex shrink-0 gap-1">
            <IconButton
              id={`section-${section.key}-up`}
              title={isContainer ? "Move Container Up" : "Move Up"}
              onClick={() => moveSection(index, -1)}
              icon={<IconChevronUp />}
              variant="muted"
              disabled={!canMove(index, -1)}
            />
            <IconButton
              id={`section-${section.key}-down`}
              title={isContainer ? "Move Container Down" : "Move Down"}
              onClick={() => moveSection(index, 1)}
              icon={<IconChevronDown />}
              variant="muted"
              disabled={!canMove(index, 1)}
            />
            {canIndent(index) && (
              <IconButton
                id={`section-${section.key}-indent`}
                title="Move Into Container Above"
                onClick={() => indent(index)}
                icon={<IconIndent />}
                variant="muted"
              />
            )}
            {canOutdent(index) && (
              <IconButton
                id={`section-${section.key}-outdent`}
                title="Move Out of This Container"
                onClick={() => outdent(index)}
                icon={<IconOutdent />}
                variant="muted"
              />
            )}
            <IconButton
              id={`section-${section.key}-insert`}
              title={section.depth > 0 ? "Add Below, in the Same Container" : "Add Container Below"}
              onClick={() => insertBelow(index)}
              icon={<IconInsertBelow />}
              variant="muted"
            />
            <IconButton
              id={`section-${section.key}-save-library`}
              title={isContainer ? "Save Container as Template or Global Section" : "Save as Template or Global Section"}
              onClick={() => openLibrary(index)}
              icon={<IconLayersPlus />}
              variant="muted"
            />
            <IconButton
              id={`section-${section.key}-copy`}
              title={isContainer ? "Copy Container to Paste on Another Page" : "Copy to Paste on Another Page"}
              onClick={() => copySection(index)}
              icon={<IconClipboardCopy />}
              variant="muted"
            />
            <IconButton
              id={`section-${section.key}-duplicate`}
              title={isContainer ? "Duplicate Container and Its Components" : "Duplicate Section"}
              onClick={() => duplicateSection(index)}
              icon={<IconCopy />}
              variant="muted"
            />
            <IconButton
              id={`section-${section.key}-remove`}
              title={isContainer ? "Remove Container" : "Remove Section"}
              onClick={() => removeSection(index)}
              icon={<IconTrash />}
              variant="danger"
            />
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-primary-200 px-5 pt-2 pb-5 dark:border-border-dark">
            <SectionEditor
              section={section}
              parentLayout={layoutAbove}
              panelLabel={panelLabel}
              onUpdate={(patch) => updateSection(section.key, patch)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <EditDeviceContext.Provider value={deviceContext}>
    <div id="section-builder" className="section-builder flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text dark:text-text-dark">Page Content</h2>
          <span className="text-xs text-text-muted dark:text-text-muted-dark">{sections.length} sections</span>
          {dirty && (
            <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-semibold text-secondary-900">Unsaved changes</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {clipboard && (
            <button
              type="button"
              id="section-builder-paste"
              title={`Paste at the end: ${clipboard.label}`}
              onClick={() => {
                if (insertCopies(clipboard.sections, "copied component", null, 0)) message.success("Pasted at the end. Save Page Content to keep it.");
              }}
              className="flex max-w-72 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-primary-300 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:text-text-dark dark:hover:bg-surface-muted-dark"
            >
              <IconClipboardCopy className="shrink-0" />
              <span className="truncate">Paste copied</span>
            </button>
          )}
          {sections.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(allExpanded ? new Set() : new Set(sections.map((s) => s.key)))}
              className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:text-text-dark dark:hover:bg-surface-muted-dark"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>
      </div>

      <ComponentPicker
        open={pickerOpen}
        groups={pickerGroups}
        templates={pickerTemplates}
        readyTemplates={READY_TEMPLATES.filter((t) => Math.max(insertDepth, 1) + Math.max(...t.sections.map((s) => s.depth ?? 0)) <= MAX_DEPTH)}
        classicTypes={CLASSIC_BLOCK_TYPES}
        clipboardLabel={clipboard?.label}
        title={insertDepth > 0 ? "Add Component" : "Add Container"}
        hint={
          insertDepth > 0
            ? `Inside a Container (level ${insertDepth}, rendered as <div>).${
                insertDepth < MAX_DEPTH ? " A Container here makes a row, a column or a box inside it." : ""
              }`
            : `Directly on the page (level 0, rendered as <section>): a Container${isGlobal ? "" : " or a Global Section"}. Components go inside a Container.`
        }
        onPick={addSection}
        onPickTemplate={insertTemplate}
        onPickReady={insertReadyTemplate}
        onDeleteTemplate={deleteTemplate}
        onPaste={pasteClipboard}
        onClose={() => setPickerOpen(false)}
      />

      <LivePreview open={previewOpen} onClose={() => setPreviewOpen(false)} pageId={pageId} payload={sectionsPayload} version={snapshot(sections)} />

      <Modal
        open={libraryIndex !== null}
        title="Save to Library"
        okText={libraryKind === "template" ? "Save Template" : "Create Global Section"}
        onOk={saveToLibrary}
        okButtonProps={{ disabled: !libraryName.trim(), loading: savingLibrary }}
        onCancel={() => setLibraryIndex(null)}
        destroyOnHidden
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-text-muted">
            {libraryIndex !== null && sections[libraryIndex]?.blockType === CONTAINER
              ? "Save this container and the components inside it:"
              : "Save this component:"}
          </p>
          <Radio.Group value={libraryKind} onChange={(e) => setLibraryKind(e.target.value)} className="flex flex-col gap-3">
            <Radio value="template" id="save-library-template">
              <span className="font-semibold">As a template</span>
              <span className="block text-xs text-text-muted">
                A starting point you insert from “+ Add Component” on any page. Each page gets its own copy to edit; this page stays as it is.
              </span>
            </Radio>
            <Radio
              value="global"
              id="save-library-global"
              disabled={isGlobal || (libraryIndex !== null && sections[libraryIndex]?.blockType === GLOBAL_SECTION)}
            >
              <span className="font-semibold">As a global section</span>
              <span className="block text-xs text-text-muted">
                Linked: edited once under Global Sections and the same everywhere it&apos;s placed. Here it&apos;s replaced by a Global
                Section component showing the same content.
              </span>
            </Radio>
          </Radio.Group>
          <div className="flex flex-col gap-1">
            <label htmlFor="save-library-name" className="text-xs font-semibold tracking-wide text-text-muted uppercase">
              Name (only shown in the backoffice)
            </label>
            <Input id="save-library-name" autoFocus value={libraryName} onChange={(e) => setLibraryName(e.target.value)} />
          </div>
        </div>
      </Modal>

      {sections.length === 0 && (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          No content yet — use “+ Add Container” to start. Components go inside Containers.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {childStarts(-1).map((start, i) => renderUnit(start, String(i + 1)))}
        {dragKey && (
          <div
            onDragOver={(e) => dragOver(e, END_DROP_KEY, "after")}
            onDrop={drop}
            className={`rounded-lg border-2 border-dashed px-4 py-3 text-center text-xs text-text-muted dark:text-text-muted-dark ${
              dropTarget?.key === END_DROP_KEY ? "border-primary-500 bg-primary-100" : "border-primary-200"
            }`}
          >
            Drop here to move to the end of the page
          </div>
        )}
      </div>
    </div>
    </EditDeviceContext.Provider>
  );
}
