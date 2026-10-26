"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, Input, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import { IconChevronUp, IconChevronDown, IconCopy, IconIndent, IconInsertBelow, IconOutdent, IconTrash } from "@/components/Icons";
import BlockFieldEditor, { BLOCK_TYPE_LABELS, defaultFieldsForBlockType, mediaUrl, type EditableField } from "./BlockFields";
import type { SaveAction } from "./SaveActionBar";
import ComponentPicker, { type ComponentGroup } from "./ComponentPicker";
import type { PageBlockType, PageSectionDTO } from "@/lib/types";

interface EditableSection {
  key: string;
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  inContainer: boolean;
  fields: EditableField[];
}

const CONTAINER: PageBlockType = "container";

// Spacing/divider presets editors toggle with plain checkboxes - they're
// stored as classes in custom_class (see shared/theme/sections.css), so the
// "Advanced" free-text field only ever has to show whatever is left over.
const TIGHT_TOP_CLASS = "section--tight-top";
const DIVIDER_TOP_CLASS = "section--divider-top";
const WIDE_CONTENT_CLASS = "section--content-960";
const PRESET_CLASSES = [TIGHT_TOP_CLASS, DIVIDER_TOP_CLASS, WIDE_CONTENT_CLASS];
// Single-column reading blocks, whose 768px column can widen to 960px.
const WIDE_CONTENT_BLOCK_TYPES: PageBlockType[] = ["rich_text", "faq"];

// Grouped + described so editors pick a block by what it looks like, not by
// its internal name. Every key of BLOCK_TYPE_LABELS must appear in exactly one
// group; any that don't are listed under "Other" so a new block type is never
// silently missing from the picker.
const BLOCK_GROUPS: { label: string; blocks: [PageBlockType, string][] }[] = [
  {
    label: "Layout",
    blocks: [["container", "Wraps components with a shared background and title"]],
  },
  {
    label: "Headings & text",
    blocks: [
      ["introduction_section", "Page intro banner with page menu"],
      ["hero", "Large banner with image and button"],
      ["rich_text", "Heading with formatted text"],
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

function buildPickerGroups(includeContainer: boolean): ComponentGroup[] {
  const grouped = new Set(BLOCK_GROUPS.flatMap((g) => g.blocks.map(([type]) => type)));
  const other = (Object.keys(BLOCK_TYPE_LABELS) as PageBlockType[]).filter((t) => !grouped.has(t));
  const groups = other.length > 0 ? [...BLOCK_GROUPS, { label: "Other", blocks: other.map((t) => [t, ""] as [PageBlockType, string]) }] : BLOCK_GROUPS;
  return groups
    .map((group) => ({
      label: group.label,
      blocks: group.blocks
        .filter(([type]) => includeContainer || type !== CONTAINER)
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

function toggleClass(customClass: string, cls: string, on: boolean): string {
  const presets = PRESET_CLASSES.filter((c) => (c === cls ? on : hasClass(customClass, c)));
  return composeClasses(extraClasses(customClass), presets);
}

// Short human summary of a section for its collapsed header: the first
// heading-like field, stripped of any HTML.
function sectionSummary(fields: EditableField[]): string {
  for (const key of ["heading", "secondaryHeading", "headingLine1", "title", "tagline"]) {
    const value = fields.find((f) => f.itemIndex === 0 && f.fieldKey === key)?.textValue;
    if (value) return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return "";
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
}: {
  pageId: number;
  initialSections: PageSectionDTO[];
  onActionsChange?: (actions: SaveAction[]) => void;
}) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [sections, setSections] = useState<EditableSection[]>(() => fromDTO(initialSections));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(fromDTO(initialSections)));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [advancedOpen, setAdvancedOpen] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const scrollToKey = useRef<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [insertInContainer, setInsertInContainer] = useState(false);
  const pickerGroups = useMemo(() => buildPickerGroups(!insertInContainer), [insertInContainer]);

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
          inContainer: s.inContainer,
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
    onActionsChange?.([
      { id: "section-builder-add", label: "+ Add Component", onSave: () => openPicker(), variant: "default" },
      { id: "section-builder-save", label: "Save Page Content", onSave: handleSave, saving },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, sections]);

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
    const summary = sectionSummary(section.fields);
    const items = itemCount(section.fields);

    return (
      <div
        key={section.key}
        id={`section-${section.key}`}
        className={`section-block flex scroll-mt-24 flex-col rounded-lg border transition-colors ${
          isOpen
            ? "section-block--open border-primary-300 bg-primary-50/70 shadow-sm dark:border-primary-500 dark:bg-surface-muted-dark/60"
            : "border-border bg-surface dark:border-border-dark dark:bg-transparent"
        }`}
      >
        <div className={`flex items-center gap-3 rounded-t-lg px-4 py-3 ${isOpen ? "bg-primary-100/70 dark:bg-surface-muted-dark" : ""}`}>
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
          <div className="flex flex-col gap-4 border-t border-primary-200 px-5 py-5 dark:border-border-dark">
            <BlockFieldEditor
              blockType={section.blockType}
              fields={section.fields}
              onChange={(fields) => updateSection(section.key, { fields })}
            />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-surface px-4 py-3 dark:bg-surface-muted-dark">
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
              {WIDE_CONTENT_BLOCK_TYPES.includes(section.blockType) && (
                <Checkbox
                  checked={hasClass(section.customClass, WIDE_CONTENT_CLASS)}
                  onChange={(e) => updateSection(section.key, { customClass: toggleClass(section.customClass, WIDE_CONTENT_CLASS, e.target.checked) })}
                >
                  Wider content (960px)
                </Checkbox>
              )}
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

      <ComponentPicker open={pickerOpen} groups={pickerGroups} onPick={addSection} onClose={() => setPickerOpen(false)} />

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
                <button
                  type="button"
                  id={`section-${head.key}-add-inside`}
                  onClick={() => openPicker(end, true)}
                  className="cursor-pointer self-start rounded-md border border-dashed border-primary-300 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:text-text-dark dark:hover:bg-surface-muted-dark"
                >
                  + Add Component Inside
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
