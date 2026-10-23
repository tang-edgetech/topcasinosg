"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, Input, Select, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import { IconChevronUp, IconChevronDown, IconPlus, IconTrash } from "@/components/Icons";
import BlockFieldEditor, { BLOCK_TYPE_LABELS, defaultFieldsForBlockType, mediaUrl, type EditableField } from "./BlockFields";
import type { SaveAction } from "./SaveActionBar";
import type { PageBlockType, PageSectionDTO } from "@/lib/types";

interface EditableSection {
  key: string;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  fields: EditableField[];
}

// Spacing/divider presets editors toggle with plain checkboxes - they're
// stored as classes in custom_class (see shared/theme/sections.css), so the
// "Advanced" free-text field only ever has to show whatever is left over.
const TIGHT_TOP_CLASS = "section--tight-top";
const DIVIDER_TOP_CLASS = "section--divider-top";
const PRESET_CLASSES = [TIGHT_TOP_CLASS, DIVIDER_TOP_CLASS];

// Grouped + described so editors pick a block by what it looks like, not by
// its internal name. Every key of BLOCK_TYPE_LABELS must appear in exactly one
// group; any that don't are listed under "Other" so a new block type is never
// silently missing from the picker.
const BLOCK_GROUPS: { label: string; blocks: [PageBlockType, string][] }[] = [
  {
    label: "Headings & text",
    blocks: [
      ["introduction_section", "Page intro banner with page menu"],
      ["hero", "Large banner with image and button"],
      ["rich_text", "Heading with formatted text"],
      ["highlight_panel", "Two-tone heading, text and optional side-by-side boxes"],
      ["cta", "Call-to-action banner with a button"],
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
      ["icon_box_group", "Icon boxes in a grid"],
      ["checklist_callout", "Mint box with a checkmark list"],
      ["numbered_steps", "Step 1, Step 2… instruction cards"],
      ["review_columns", "Player reviews: positive vs complaints"],
      ["event_highlights", "Promo event cards with banner"],
      ["game_rtp_carousel", "Slider of game cards with RTP %"],
      ["team_grid", "Team member cards"],
      ["stats_counter", "Animated number counters"],
      ["logo_strip", "Row of logos"],
      ["image_gallery", "Image gallery"],
    ],
  },
  {
    label: "Live data (updates automatically)",
    blocks: [
      ["top_bonus_picks", "Ranked casino cards from live casinos & bonuses"],
      ["bonus_listing_table", "Table of live bonuses for a region"],
      ["casino_comparison_table", "Casino ratings comparison table"],
      ["casino_list_table", "Casino list: cashback, payments, rating, safe index"],
      ["game_casino_finder", "Pick a game, see casinos that offer it"],
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
      ["comparison_table", "Hand-written comparison table with tips box"],
      ["faq", "Questions & answers accordion"],
    ],
  },
];

function buildPickerOptions() {
  const grouped = new Set(BLOCK_GROUPS.flatMap((g) => g.blocks.map(([type]) => type)));
  const other = (Object.keys(BLOCK_TYPE_LABELS) as PageBlockType[]).filter((t) => !grouped.has(t));
  const groups = other.length > 0 ? [...BLOCK_GROUPS, { label: "Other", blocks: other.map((t) => [t, ""] as [PageBlockType, string]) }] : BLOCK_GROUPS;
  return groups.map((group) => ({
    label: group.label,
    options: group.blocks.map(([type, description]) => ({
      value: type,
      searchText: `${BLOCK_TYPE_LABELS[type]} ${description}`,
      label: (
        <div className="flex flex-col py-0.5">
          <span className="text-sm">{BLOCK_TYPE_LABELS[type]}</span>
          {description && <span className="text-xs text-text-muted dark:text-text-muted-dark">{description}</span>}
        </div>
      ),
    })),
  }));
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

function toggleClass(customClass: string, cls: string, on: boolean): string {
  const presets = PRESET_CLASSES.filter((c) => (c === cls ? on : hasClass(customClass, c)));
  return composeClasses(extraClasses(customClass), presets);
}

// Short human summary of a section for its collapsed header: the first
// heading-like field, stripped of any HTML.
function sectionSummary(fields: EditableField[]): string {
  for (const key of ["heading", "headingLine1", "title", "tagline"]) {
    const value = fields.find((f) => f.itemIndex === 0 && f.fieldKey === key)?.textValue;
    if (value) return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return "";
}

function itemCount(fields: EditableField[]): number {
  return new Set(fields.filter((f) => f.itemIndex > 0).map((f) => f.itemIndex)).size;
}

let clientKeySeq = 0;
function nextClientKey() {
  clientKeySeq += 1;
  return `new-${clientKeySeq}`;
}

function fromDTO(sections: PageSectionDTO[]): EditableSection[] {
  return sections
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({
      key: `existing-${s.id}`,
      blockType: s.blockType,
      customClass: s.customClass,
      customId: s.customId,
      // Fields come back from the API with a relative mediaUrl (e.g.
      // "/uploads/x.webp") — the API's own convention, since it's the
      // consumer's job to resolve it against the right host. Left
      // unresolved here, the browser would resolve it against the admin
      // app's own origin instead of the API's.
      fields: s.fields.map((f) => (f.mediaUrl ? { ...f, mediaUrl: mediaUrl(f.mediaUrl) } : f)),
    }));
}

function snapshot(sections: EditableSection[]): string {
  return JSON.stringify(sections.map(({ blockType, customClass, customId, fields }) => ({ blockType, customClass, customId, fields })));
}

// Full-tree editor for a page's content sections. Local edits are held in
// component state and only reach the API on "Save Page Content", which
// PUTs the whole section/field tree in one shot (see PageRepo.ReplaceSections
// on the backend). Sections start collapsed to a one-line summary so a long
// page stays scannable; only the sections being edited are expanded.
export default function SectionBuilder({
  pageId,
  initialSections,
  onSaveActionChange,
}: {
  pageId: number;
  initialSections: PageSectionDTO[];
  onSaveActionChange?: (action: SaveAction) => void;
}) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [sections, setSections] = useState<EditableSection[]>(() => fromDTO(initialSections));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(fromDTO(initialSections)));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [advancedOpen, setAdvancedOpen] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const scrollToKey = useRef<string | null>(null);
  const pickerOptions = useMemo(buildPickerOptions, []);

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

  function toggleIn(set: Set<string>, key: string): Set<string> {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  }

  function insertSection(section: EditableSection, atIndex?: number) {
    setSections((prev) => {
      const next = [...prev];
      next.splice(atIndex ?? next.length, 0, section);
      return next;
    });
    setExpanded((prev) => new Set(prev).add(section.key));
    scrollToKey.current = section.key;
  }

  function addSection(blockType: PageBlockType) {
    insertSection({ key: nextClientKey(), blockType, customClass: "", customId: "", fields: defaultFieldsForBlockType(blockType) });
  }

  function duplicateSection(index: number) {
    const source = sections[index];
    insertSection(
      { ...source, key: nextClientKey(), customId: "", fields: source.fields.map((f) => ({ ...f })) },
      index + 1,
    );
  }

  async function removeSection(key: string) {
    const ok = await confirm({
      title: "Remove Section",
      message: "Remove this section from the page? This only takes effect once you save.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    setSections((prev) => prev.filter((s) => s.key !== key));
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateSection(key: string, patch: Partial<EditableSection>) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        sections: sections.map((s, i) => ({
          blockType: s.blockType,
          customClass: s.customClass,
          customId: s.customId,
          sortOrder: i + 1,
          fields: s.fields.map((f, fi) => ({ ...f, sortOrder: fi + 1 })),
        })),
      };
      await api.put(`/api/admin/pages/${pageId}/sections`, payload);
      setSavedSnapshot(snapshot(sections));
      message.success("Page content saved.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save page content.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    onSaveActionChange?.({ id: "section-builder-save", label: "Save Page Content", onSave: handleSave, saving });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, sections]);

  const allExpanded = sections.length > 0 && sections.every((s) => expanded.has(s.key));

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
          {sections.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(allExpanded ? new Set() : new Set(sections.map((s) => s.key)))}
              className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:text-text-dark dark:hover:bg-surface-muted-dark"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
          <Select<PageBlockType>
            showSearch
            placeholder="+ Add a section…"
            value={null as unknown as PageBlockType}
            onChange={(v) => v && addSection(v)}
            options={pickerOptions}
            optionFilterProp="searchText"
            popupMatchSelectWidth={340}
            style={{ width: 240 }}
          />
        </div>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">No sections yet — use “Add a section” above to start building this page.</p>
      )}

      <div className="flex flex-col gap-3">
        {sections.map((section, index) => {
          const isOpen = expanded.has(section.key);
          const summary = sectionSummary(section.fields);
          const items = itemCount(section.fields);

          return (
            <div
              key={section.key}
              id={`section-${section.key}`}
              className={`section-block flex scroll-mt-24 flex-col rounded-lg border dark:border-border-dark ${
                isOpen ? "border-primary-300 shadow-sm" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 shrink-0 text-center text-xs font-semibold text-text-muted dark:text-text-muted-dark">{index + 1}</span>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded((prev) => toggleIn(prev, section.key))}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  <span className="shrink-0 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-surface-muted-dark dark:text-text-dark">
                    {BLOCK_TYPE_LABELS[section.blockType] ?? section.blockType}
                  </span>
                  <span className="truncate text-sm text-text dark:text-text-dark">
                    {summary || <span className="text-text-muted italic dark:text-text-muted-dark">No heading</span>}
                  </span>
                  {items > 0 && <span className="shrink-0 text-xs text-text-muted dark:text-text-muted-dark">{items} items</span>}
                  <span aria-hidden="true" className="ml-auto shrink-0 text-xs text-text-muted dark:text-text-muted-dark">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>
                <div className="flex shrink-0 gap-1">
                  <IconButton
                    id={`section-${section.key}-up`}
                    title="Move Up"
                    onClick={() => moveSection(index, -1)}
                    icon={<IconChevronUp />}
                    variant="muted"
                    disabled={index === 0}
                  />
                  <IconButton
                    id={`section-${section.key}-down`}
                    title="Move Down"
                    onClick={() => moveSection(index, 1)}
                    icon={<IconChevronDown />}
                    variant="muted"
                    disabled={index === sections.length - 1}
                  />
                  <IconButton
                    id={`section-${section.key}-duplicate`}
                    title="Duplicate Section"
                    onClick={() => duplicateSection(index)}
                    icon={<IconPlus />}
                    variant="muted"
                  />
                  <IconButton
                    id={`section-${section.key}-remove`}
                    title="Remove Section"
                    onClick={() => removeSection(section.key)}
                    icon={<IconTrash />}
                    variant="danger"
                  />
                </div>
              </div>

              {isOpen && (
                <div className="flex flex-col gap-4 border-t border-border px-5 py-5 dark:border-border-dark">
                  <BlockFieldEditor
                    blockType={section.blockType}
                    fields={section.fields}
                    onChange={(fields) => updateSection(section.key, { fields })}
                  />

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-surface-muted px-4 py-3 dark:bg-surface-muted-dark">
                    <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Layout</span>
                    <Checkbox
                      checked={hasClass(section.customClass, TIGHT_TOP_CLASS)}
                      onChange={(e) => updateSection(section.key, { customClass: toggleClass(section.customClass, TIGHT_TOP_CLASS, e.target.checked) })}
                    >
                      Less space above
                    </Checkbox>
                    <Checkbox
                      checked={hasClass(section.customClass, DIVIDER_TOP_CLASS)}
                      onChange={(e) => updateSection(section.key, { customClass: toggleClass(section.customClass, DIVIDER_TOP_CLASS, e.target.checked) })}
                    >
                      Divider line above
                    </Checkbox>
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen((prev) => toggleIn(prev, section.key))}
                      className="ml-auto cursor-pointer text-xs text-primary-600 hover:underline dark:text-text-dark"
                    >
                      {advancedOpen.has(section.key) ? "Hide advanced" : "Advanced"}
                    </button>
                  </div>

                  {advancedOpen.has(section.key) && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        addonBefore="CSS class"
                        placeholder="optional"
                        value={extraClasses(section.customClass)}
                        onChange={(e) => {
                          const presets = PRESET_CLASSES.filter((c) => hasClass(section.customClass, c));
                          updateSection(section.key, { customClass: composeClasses(e.target.value, presets) });
                        }}
                      />
                      <Input
                        addonBefore="HTML id"
                        placeholder="optional, e.g. faqs (for #faqs links)"
                        value={section.customId}
                        onChange={(e) => updateSection(section.key, { customId: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
