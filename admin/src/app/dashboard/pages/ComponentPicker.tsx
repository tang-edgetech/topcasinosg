"use client";

import { useState } from "react";
import { Input, Modal } from "antd";
import type { PageBlockType, SectionTemplateDTO } from "@/lib/types";
import { IconClipboardCopy, IconLayersPlus, IconTrash } from "@/components/Icons";
import BlockIcon from "./BlockIcons";

export interface ComponentGroup {
  label: string;
  blocks: { type: PageBlockType; title: string; description: string }[];
}

const CARD_CLASS =
  "component-picker__item flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-border bg-surface p-3 text-left transition hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm focus-visible:border-primary-500 focus-visible:outline-none dark:border-border-dark dark:bg-surface-dark dark:hover:bg-surface-muted-dark";
const ICON_BOX_CLASS = "flex w-full items-center justify-center rounded-md bg-surface-muted py-3 text-primary-600 dark:bg-surface-muted-dark dark:text-text-dark";

// "Add Component" popup: every block type as a card with its wireframe icon,
// title and one-line description, grouped and searchable. Above them: the
// component copied with "Copy" (from this or any other page) to paste, and
// saved templates, inserted as independent copies. Picking any of them
// closes the popup and hands the choice back.
export default function ComponentPicker({
  open,
  groups,
  templates = [],
  clipboardLabel,
  onPick,
  onPickTemplate,
  onDeleteTemplate,
  onPaste,
  onClose,
}: {
  open: boolean;
  groups: ComponentGroup[];
  templates?: SectionTemplateDTO[];
  clipboardLabel?: string;
  onPick: (blockType: PageBlockType) => void;
  onPickTemplate?: (template: SectionTemplateDTO) => void;
  onDeleteTemplate?: (template: SectionTemplateDTO) => void;
  onPaste?: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      blocks: group.blocks.filter((block) => !needle || `${block.title} ${block.description}`.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.blocks.length > 0);
  const visibleTemplates = templates.filter((t) => !needle || t.name.toLowerCase().includes(needle));
  const showPaste = Boolean(clipboardLabel && onPaste) && (!needle || "paste copied".includes(needle) || clipboardLabel!.toLowerCase().includes(needle));

  function close() {
    setQuery("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      width={920}
      title="Add Component"
      destroyOnHidden
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
    >
      <div id="component-picker" className="component-picker flex flex-col gap-5">
        <Input.Search
          id="component-picker-search"
          autoFocus
          allowClear
          placeholder="Search components and templates…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {visibleGroups.length === 0 && visibleTemplates.length === 0 && !showPaste && (
          <p className="text-sm text-text-muted dark:text-text-muted-dark">No components match “{query}”.</p>
        )}
        {(showPaste || visibleTemplates.length > 0) && (
          <div className="component-picker__group flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Copied &amp; saved</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {showPaste && (
                <button
                  type="button"
                  id="component-picker-paste"
                  onClick={() => {
                    onPaste!();
                    close();
                  }}
                  className={`${CARD_CLASS} border-primary-300 border-dashed`}
                >
                  <span className={ICON_BOX_CLASS}>
                    <IconClipboardCopy width={32} height={32} />
                  </span>
                  <span className="text-sm font-semibold text-text dark:text-text-dark">Paste copied</span>
                  <span className="line-clamp-2 text-xs leading-snug text-text-muted dark:text-text-muted-dark">{clipboardLabel}</span>
                </button>
              )}
              {visibleTemplates.map((template) => (
                <div key={template.id} className="relative">
                  <button
                    type="button"
                    id={`component-picker-template-${template.id}`}
                    onClick={() => {
                      onPickTemplate?.(template);
                      close();
                    }}
                    className={`${CARD_CLASS} h-full w-full`}
                  >
                    <span className={ICON_BOX_CLASS}>
                      <IconLayersPlus width={32} height={32} />
                    </span>
                    <span className="pr-6 text-sm font-semibold text-text dark:text-text-dark">{template.name}</span>
                    <span className="text-xs leading-snug text-text-muted dark:text-text-muted-dark">
                      Template · {template.sectionCount} component{template.sectionCount === 1 ? "" : "s"}
                    </span>
                  </button>
                  {onDeleteTemplate && (
                    <button
                      type="button"
                      id={`component-picker-template-${template.id}-delete`}
                      title="Delete Template"
                      aria-label={`Delete template ${template.name}`}
                      onClick={() => onDeleteTemplate(template)}
                      className="absolute right-2 bottom-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <IconTrash width={14} height={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {visibleGroups.map((group) => (
          <div key={group.label} className="component-picker__group flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">{group.label}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.blocks.map((block) => (
                <button
                  key={block.type}
                  type="button"
                  id={`component-picker-${block.type}`}
                  onClick={() => {
                    onPick(block.type);
                    close();
                  }}
                  className={CARD_CLASS}
                >
                  <span className={ICON_BOX_CLASS}>
                    <BlockIcon blockType={block.type} className="h-10 w-16" />
                  </span>
                  <span className="text-sm font-semibold text-text dark:text-text-dark">{block.title}</span>
                  {block.description && (
                    <span className="text-xs leading-snug text-text-muted dark:text-text-muted-dark">{block.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
