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
  IconOutdent,
  IconLayersPlus,
  IconTrash,
} from "@/components/Icons";
import BlockFieldEditor, { BLOCK_TYPE_LABELS, StyleTabTarget, defaultFieldsForBlockType, mediaUrl, type EditableField } from "./BlockFields";
import type { SaveAction } from "./SaveActionBar";
import ComponentPicker, { type ComponentGroup } from "./ComponentPicker";
import LivePreview from "./LivePreview";
import { copySectionsToClipboard, useSectionClipboard, type CopiedSection } from "@/lib/sectionClipboard";
import type { GlobalSectionDTO, PageBlockType, PageSectionDTO, SectionTemplateDTO } from "@/lib/types";

interface EditableSection {
  key: string;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  inContainer: boolean;
  fields: EditableField[];
}

const CONTAINER: PageBlockType = "container";
const GLOBAL_SECTION: PageBlockType = "global_section";

// Spacing/divider presets editors toggle with plain checkboxes - they're
// stored as classes in custom_class (see shared/theme/sections.css), so the
// "Advanced" free-text field only ever has to show whatever is left over.
const TIGHT_TOP_CLASS = "section--tight-top";
const DIVIDER_TOP_CLASS = "section--divider-top";
const WIDE_CONTENT_CLASS = "section--content-960";
// Width of a component inside a grid Container (shared/theme/sections.css
// .container-section__body--grid); empty = the container's column width.
const WIDTH_OPTIONS = [
  { value: "", label: "Auto (column width)" },
  { value: "section--w-full", label: "Full width" },
  { value: "section--w-3-4", label: "3/4" },
  { value: "section--w-2-3", label: "2/3" },
  { value: "section--w-1-2", label: "1/2" },
  { value: "section--w-1-3", label: "1/3" },
  { value: "section--w-1-4", label: "1/4" },
];
const WIDTH_CLASSES = WIDTH_OPTIONS.map((o) => o.value).filter(Boolean);
// Hide a component on some devices (shared/theme/sections.css): mobile
// below 640px, tablet 640-1199px, desktop 1200px and up.
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
const PRESET_CLASSES = [TIGHT_TOP_CLASS, DIVIDER_TOP_CLASS, WIDE_CONTENT_CLASS, ...WIDTH_CLASSES, ...HIDE_CLASSES, ...LAYOUT_CLASSES, ...VALIGN_CLASSES];
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
      ["title_set", "Section title (one word can be red) with a line of text"],
      ["rich_text", "Heading with formatted text"],
      ["image", "Image with optional link and caption"],
      ["button_group", "One or more buttons in a row"],
      ["spacer", "Empty space, optionally with a divider line"],
      ["video", "YouTube or Vimeo video, loads on click"],
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

function buildPickerGroups(includeContainer: boolean, includeGlobal: boolean): ComponentGroup[] {
  const grouped = new Set(BLOCK_GROUPS.flatMap((g) => g.blocks.map(([type]) => type)));
  const other = (Object.keys(BLOCK_TYPE_LABELS) as PageBlockType[]).filter((t) => !grouped.has(t));
  const groups = other.length > 0 ? [...BLOCK_GROUPS, { label: "Other", blocks: other.map((t) => [t, ""] as [PageBlockType, string]) }] : BLOCK_GROUPS;
  return groups
    .map((group) => ({
      label: group.label,
      blocks: group.blocks
        .filter(([type]) => (includeContainer || type !== CONTAINER) && (includeGlobal || type !== GLOBAL_SECTION))
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
  for (const key of ["heading", "headingLine1", "title", "tagline", "caption", "alt", "url"]) {
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

// A container's components are the in-container sections right after it,
// mirroring the API (PageSection.InContainer) and the public renderer.
// Anything that would leave a component outside a container (a container
// removed or moved) turns it back into a normal top-level section.
function normalizeContainers(sections: EditableSection[]): EditableSection[] {
  let open = false;
  return sections.map((s) => {
    const isContainer = s.blockType === CONTAINER;
    const inContainer = !isContainer && s.inContainer && open;
    open = isContainer || inContainer;
    return inContainer === s.inContainer ? s : { ...s, inContainer };
  });
}

// End (exclusive) of the top-level unit starting at index: a container plus
// its components, or a single section.
function unitEnd(sections: EditableSection[], index: number): number {
  if (sections[index]?.blockType !== CONTAINER) return index + 1;
  let end = index + 1;
  while (end < sections.length && sections[end].inContainer) end += 1;
  return end;
}

function previousUnitStart(sections: EditableSection[], index: number): number {
  let start = index - 1;
  while (start >= 0 && sections[start].inContainer) start -= 1;
  return start;
}

type DropPosition = "before" | "after" | "inside";
interface DropTarget {
  key: string;
  position: DropPosition;
}
const END_DROP_KEY = "__end";

// Where a dragged section (a container brings its components along) lands.
// Dropping on a component inside a container keeps it inside; just below a
// container's header puts it first inside; "inside" appends to a container.
// A container is never dropped into another one - it lands next to it.
function applyDrop(list: EditableSection[], dragKey: string, target: DropTarget): EditableSection[] | null {
  const from = list.findIndex((s) => s.key === dragKey);
  if (from < 0) return null;
  const end = unitEnd(list, from);
  const unit = list.slice(from, end);
  if (unit.some((s) => s.key === target.key)) return null;
  const rest = [...list.slice(0, from), ...list.slice(end)];
  const draggingContainer = unit[0].blockType === CONTAINER;
  let at: number;
  let inContainer = false;

  if (target.key === END_DROP_KEY) {
    at = rest.length;
  } else {
    const t = rest.findIndex((s) => s.key === target.key);
    if (t < 0) return null;
    const targetSection = rest[t];
    if (target.position === "inside") {
      at = unitEnd(rest, t);
      inContainer = !draggingContainer;
    } else if (targetSection.inContainer) {
      if (draggingContainer) {
        let head = t;
        while (head > 0 && rest[head].inContainer) head -= 1;
        at = target.position === "before" ? head : unitEnd(rest, head);
      } else {
        at = target.position === "before" ? t : t + 1;
        inContainer = true;
      }
    } else if (targetSection.blockType === CONTAINER && target.position === "after") {
      at = draggingContainer ? unitEnd(rest, t) : t + 1;
      inContainer = !draggingContainer;
    } else {
      at = target.position === "before" ? t : t + 1;
    }
  }

  const moved = draggingContainer ? unit : [{ ...unit[0], inContainer }];
  return normalizeContainers([...rest.slice(0, at), ...moved, ...rest.slice(at)]);
}

// One expanded component: Content (its own fields), Style (background, size,
// alignment, colours - portalled in from the block editor via StyleFields -
// plus spacing and grid width) and Advanced (CSS class, HTML id).
function SectionEditor({
  section,
  inGrid,
  panelLabel,
  onUpdate,
}: {
  section: EditableSection;
  inGrid: boolean;
  panelLabel: string | null;
  onUpdate: (patch: Partial<EditableSection>) => void;
}) {
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
                <BlockFieldEditor blockType={section.blockType} fields={section.fields} onChange={(fields) => onUpdate({ fields })} />
              </div>
            ),
          },
          {
            key: "style",
            label: "Style",
            forceRender: true,
            children: (
              <div className="flex flex-col gap-4">
                <div ref={setStyleTarget} className="section-style-fields flex flex-col gap-4 empty:hidden" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-surface px-4 py-3 dark:bg-surface-muted-dark">
                  <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Spacing</span>
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
                        options={WIDTH_OPTIONS}
                      />
                    </label>
                  )}
                </div>
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
                <span className="text-xs text-text-muted dark:text-text-muted-dark">Mobile is below 640px, tablet 640–1199px, desktop 1200px and up.</span>
              </div>
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
      <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Layout</span>
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
        narrower than the page. Mobile is below 640px, tablet 640–1199px, desktop 1200px and up.
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
        inContainer: Boolean(s.inContainer),
        // Fields come back from the API with a relative mediaUrl (e.g.
        // "/uploads/x.webp") — the API's own convention, since it's the
        // consumer's job to resolve it against the right host. Left
        // unresolved here, the browser would resolve it against the admin
        // app's own origin instead of the API's.
        fields: s.fields.map((f) => (f.mediaUrl ? { ...f, mediaUrl: mediaUrl(f.mediaUrl) } : f)),
      })),
  );
}

function snapshot(sections: EditableSection[]): string {
  return JSON.stringify(
    sections.map(({ blockType, customClass, customId, inContainer, fields }) => ({ blockType, customClass, customId, inContainer, fields })),
  );
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
  const [sections, setSections] = useState<EditableSection[]>(() => fromDTO(initialSections));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(fromDTO(initialSections)));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollToKey = useRef<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [insertInContainer, setInsertInContainer] = useState(false);
  const pickerGroups = useMemo(() => buildPickerGroups(!insertInContainer, !isGlobal), [insertInContainer, isGlobal]);
  const [globalNames, setGlobalNames] = useState<Map<string, string>>(() => new Map());
  const [libraryIndex, setLibraryIndex] = useState<number | null>(null);
  const [libraryName, setLibraryName] = useState("");
  const [libraryKind, setLibraryKind] = useState<"template" | "global">("template");
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [templates, setTemplates] = useState<SectionTemplateDTO[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
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
    (t) => !(insertInContainer && t.blockTypes.includes(CONTAINER)) && !(isGlobal && t.blockTypes.includes(GLOBAL_SECTION)),
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
          inContainer: insertInContainer && blockType !== CONTAINER,
          fields: defaultFieldsForBlockType(blockType),
        },
      ],
      insertAt ?? undefined,
    );
  }

  function openPicker(atIndex: number | null = null, inContainer = false) {
    setInsertAt(atIndex);
    setInsertInContainer(inContainer);
    setPickerOpen(true);
  }

  function insertBelow(index: number) {
    const section = sections[index];
    if (section.inContainer) openPicker(index + 1, true);
    else openPicker(unitEnd(sections, index));
  }

  // Inserts copies (pasted, or from a template) where the picker was opened:
  // a lone component goes inside the container there if any; a container
  // brings its own components and can't go inside another container.
  function insertCopies(copies: CopiedSection[], what: string, at: number | null = insertAt, inside = insertInContainer): boolean {
    if (copies.length === 0) return false;
    const bringsContainer = copies[0].blockType === CONTAINER;
    if (inside && copies.some((c) => c.blockType === CONTAINER)) {
      message.warning(`This ${what} has a container, which can't go inside another container. Add it outside the container instead.`);
      return false;
    }
    if (isGlobal && copies.some((c) => c.blockType === GLOBAL_SECTION)) {
      message.warning(`This ${what} places a global section, which can't go inside another global section.`);
      return false;
    }
    insertSections(
      copies.map((c, i) => ({
        key: nextClientKey(),
        blockType: c.blockType,
        customClass: c.customClass,
        customId: "",
        inContainer: bringsContainer ? i > 0 && c.inContainer : inside,
        fields: c.fields.map((f) => ({ ...f, mediaUrl: f.mediaUrl ? mediaUrl(f.mediaUrl) : f.mediaUrl })),
      })),
      at ?? undefined,
    );
    return true;
  }

  function toCopies(unit: EditableSection[]): CopiedSection[] {
    return unit.map((s, i) => ({
      blockType: s.blockType,
      customClass: s.customClass,
      customId: s.customId,
      inContainer: i > 0 && s.inContainer,
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
      const copies = (data.sections ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => ({ blockType: s.blockType, customClass: s.customClass, customId: s.customId, inContainer: Boolean(s.inContainer), fields: s.fields }));
      if (insertCopies(copies, "template")) message.success(`Inserted “${template.name}”. Save Page Content to keep it.`);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load the template.");
    }
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

  async function removeSection(index: number) {
    const section = sections[index];
    const isContainer = section.blockType === CONTAINER;
    const ok = await confirm({
      title: isContainer ? "Remove Container" : "Remove Section",
      message: isContainer
        ? "Remove this container? The components inside it stay on the page, outside any container. This only takes effect once you save."
        : "Remove this section from the page? This only takes effect once you save.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    update((prev) => prev.filter((s) => s.key !== section.key));
  }

  function canMove(index: number, direction: -1 | 1): boolean {
    const section = sections[index];
    if (section.inContainer) return Boolean(sections[index + direction]?.inContainer);
    return direction === -1 ? previousUnitStart(sections, index) >= 0 : unitEnd(sections, index) < sections.length;
  }

  function moveSection(index: number, direction: -1 | 1) {
    if (!canMove(index, direction)) return;
    update((prev) => {
      if (prev[index].inContainer) {
        const next = [...prev];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        return next;
      }
      const end = unitEnd(prev, index);
      const unit = prev.slice(index, end);
      if (direction === -1) {
        const start = previousUnitStart(prev, index);
        return [...prev.slice(0, start), ...unit, ...prev.slice(start, index), ...prev.slice(end)];
      }
      const nextEnd = unitEnd(prev, end);
      return [...prev.slice(0, index), ...prev.slice(end, nextEnd), ...unit, ...prev.slice(nextEnd)];
    });
  }

  function containerLayout(index: number): string {
    for (let i = index - 1; i >= 0; i -= 1) {
      if (sections[i].blockType === CONTAINER) {
        return sections[i].fields.find((f) => f.itemIndex === 0 && f.fieldKey === "layout")?.textValue ?? "stack";
      }
    }
    return "stack";
  }

  function canMoveIntoContainer(index: number): boolean {
    const section = sections[index];
    const previous = sections[index - 1];
    return section.blockType !== CONTAINER && !section.inContainer && Boolean(previous && (previous.blockType === CONTAINER || previous.inContainer));
  }

  function moveIntoContainer(index: number) {
    if (!canMoveIntoContainer(index)) return;
    update((prev) => prev.map((s, i) => (i === index ? { ...s, inContainer: true } : s)));
  }

  function moveOutOfContainer(index: number) {
    update((prev) => {
      let end = index + 1;
      while (end < prev.length && prev[end].inContainer) end += 1;
      const moved = { ...prev[index], inContainer: false };
      return [...prev.slice(0, index), ...prev.slice(index + 1, end), moved, ...prev.slice(end)];
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
    const unit = sections.slice(libraryIndex, unitEnd(sections, libraryIndex));
    const unitPayload = unit.map((s, i) => ({
      blockType: s.blockType,
      customClass: s.customClass,
      customId: s.customId,
      inContainer: i > 0 && s.inContainer,
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
        inContainer: unit[0].inContainer,
        fields: [{ itemIndex: 0, fieldKey: "globalId", fieldType: "text", textValue: String(created.id), mediaId: null, mediaUrl: null, urlValue: "", sortOrder: 1 }],
      };
      update((prev) => {
        const start = prev.findIndex((s) => s.key === unit[0].key);
        return [...prev.slice(0, start), placeholder, ...prev.slice(start + unit.length)];
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
        inContainer: s.inContainer,
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
      { id: "section-builder-add", label: "+ Add Component", onSave: () => openPicker(), variant: "default" },
      { id: "section-builder-save", label: "Save Page Content", onSave: handleSave, saving },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, sections, previewOpen]);

  const allExpanded = sections.length > 0 && sections.every((s) => expanded.has(s.key));

  const units: { start: number; end: number; number: number }[] = [];
  for (let i = 0; i < sections.length; ) {
    const end = unitEnd(sections, i);
    units.push({ start: i, end, number: units.length + 1 });
    i = end;
  }

  function renderSection(section: EditableSection, index: number, label: string) {
    const isOpen = expanded.has(section.key);
    const isContainer = section.blockType === CONTAINER;
    const inGrid = section.inContainer && containerLayout(index) === "grid";
    const componentCount = isContainer ? unitEnd(sections, index) - index - 1 : 0;
    const globalId = section.blockType === GLOBAL_SECTION ? (section.fields.find((f) => f.fieldKey === "globalId")?.textValue ?? "") : "";
    const summary = isContainer
      ? `${componentCount} component${componentCount === 1 ? "" : "s"} inside`
      : globalId
        ? (globalNames.get(globalId) ?? `Global section #${globalId}`)
        : sectionSummary(section.fields);
    const items = itemCount(section.fields);
    const hiddenOn = VISIBILITY_OPTIONS.filter((o) => hasClass(section.customClass, o.cls)).map((o) => o.label.toLowerCase());
    const customLayout = [...LAYOUT_CLASSES, ...VALIGN_CLASSES].some((cls) => hasClass(section.customClass, cls));
    const panelLabel = section.inContainer ? (PANEL_TITLE_LABELS[containerLayout(index)] ?? null) : null;

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
                Custom layout
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
            {section.inContainer ? (
              <IconButton
                id={`section-${section.key}-outdent`}
                title="Move Out of Container"
                onClick={() => moveOutOfContainer(index)}
                icon={<IconOutdent />}
                variant="muted"
              />
            ) : (
              canMoveIntoContainer(index) && (
                <IconButton
                  id={`section-${section.key}-indent`}
                  title="Move Into Container Above"
                  onClick={() => moveIntoContainer(index)}
                  icon={<IconIndent />}
                  variant="muted"
                />
              )
            )}
            <IconButton
              id={`section-${section.key}-insert`}
              title={isContainer ? "Add Component Below Container" : "Add Component Below"}
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
            <SectionEditor section={section} inGrid={inGrid} panelLabel={panelLabel} onUpdate={(patch) => updateSection(section.key, patch)} />
          </div>
        )}
      </div>
    );
  }

  return (
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
                if (insertCopies(clipboard.sections, "copied component", null, false)) message.success("Pasted at the end. Save Page Content to keep it.");
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
        clipboardLabel={clipboard?.label}
        onPick={addSection}
        onPickTemplate={insertTemplate}
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
        <p className="text-sm text-text-muted dark:text-text-muted-dark">No sections yet — use “+ Add Component” to start building this page.</p>
      )}

      <div className="flex flex-col gap-3">
        {units.map(({ start, end, number }) => {
          const head = sections[start];
          if (head.blockType !== CONTAINER) return renderSection(head, start, String(number));
          const children = sections.slice(start + 1, end);
          return (
            <div
              key={`container-${head.key}`}
              id={`container-${head.key}`}
              className="container-block flex flex-col gap-2 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/30 p-2 dark:border-border-dark dark:bg-transparent"
            >
              {renderSection(head, start, String(number))}
              <div className="ml-4 flex flex-col gap-2 border-l-2 border-primary-200 pl-3 sm:ml-6 dark:border-border-dark">
                {children.map((child, i) => renderSection(child, start + 1 + i, `${number}.${i + 1}`))}
                {children.length === 0 && (
                  <p className="px-1 py-2 text-xs text-text-muted dark:text-text-muted-dark">
                    This container is empty — add a component inside it, or use “Move Into Container Above” on the section below.
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
                    onClick={() => openPicker(end, true)}
                    className="cursor-pointer rounded-md border border-dashed border-primary-300 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:text-text-dark dark:hover:bg-surface-muted-dark"
                  >
                    + Add Component Inside
                  </button>
                  {dragKey && <span className="text-xs text-text-muted dark:text-text-muted-dark">or drop here to add it to this container</span>}
                </div>
              </div>
            </div>
          );
        })}
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
  );
}
