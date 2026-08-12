"use client";

import { useEffect, useState } from "react";
import { Input, Select, App as AntApp } from "antd";
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

const BLOCK_TYPES: PageBlockType[] = [
  "hero",
  "rich_text",
  "icon_box_group",
  "image_gallery",
  "cta",
  "logo_strip",
  "stats_counter",
  "faq",
];

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

// Full-tree editor for a page's content sections. Local edits are held in
// component state and only reach the API on "Save Page Content", which
// PUTs the whole section/field tree in one shot (see PageRepo.ReplaceSections
// on the backend) — there's no per-field autosave, matching how the rest of
// this admin's content forms behave (one explicit Save action).
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
  const [addingType, setAddingType] = useState<PageBlockType>("rich_text");
  const [saving, setSaving] = useState(false);

  function addSection() {
    setSections((prev) => [
      ...prev,
      { key: nextClientKey(), blockType: addingType, customClass: "", customId: "", fields: defaultFieldsForBlockType(addingType) },
    ]);
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

  return (
    <div id="section-builder" className="section-builder flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text dark:text-text-dark">Page Content</h2>
        <div className="flex items-center gap-2">
          <Select<PageBlockType>
            value={addingType}
            onChange={(v) => setAddingType(v)}
            options={BLOCK_TYPES.map((t) => ({ value: t, label: BLOCK_TYPE_LABELS[t] }))}
            style={{ width: 200 }}
          />
          <IconButton id="section-add" title="Add Section" onClick={addSection} icon={<IconPlus />} />
        </div>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">No sections yet — add one above to start building this page.</p>
      )}

      <div className="flex flex-col gap-4">
        {sections.map((section, index) => (
          <div
            key={section.key}
            id={`section-${section.key}`}
            className="section-block flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-surface-muted-dark dark:text-text-dark">
                {BLOCK_TYPE_LABELS[section.blockType]}
              </span>
              <div className="flex gap-2">
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
                  id={`section-${section.key}-remove`}
                  title="Remove Section"
                  onClick={() => removeSection(section.key)}
                  icon={<IconTrash />}
                  variant="danger"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Custom CSS class (optional)"
                value={section.customClass}
                onChange={(e) => updateSection(section.key, { customClass: e.target.value })}
              />
              <Input
                placeholder="Custom HTML id (optional)"
                value={section.customId}
                onChange={(e) => updateSection(section.key, { customId: e.target.value })}
              />
            </div>

            <BlockFieldEditor
              blockType={section.blockType}
              fields={section.fields}
              onChange={(fields) => updateSection(section.key, { fields })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
