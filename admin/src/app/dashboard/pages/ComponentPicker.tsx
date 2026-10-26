"use client";

import { useState } from "react";
import { Input, Modal } from "antd";
import type { PageBlockType } from "@/lib/types";
import BlockIcon from "./BlockIcons";

export interface ComponentGroup {
  label: string;
  blocks: { type: PageBlockType; title: string; description: string }[];
}

// "Add Component" popup: every block type as a card with its wireframe icon,
// title and one-line description, grouped and searchable. Picking one closes
// the popup and hands the type back.
export default function ComponentPicker({
  open,
  groups,
  onPick,
  onClose,
}: {
  open: boolean;
  groups: ComponentGroup[];
  onPick: (blockType: PageBlockType) => void;
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
          placeholder="Search components…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {visibleGroups.length === 0 && (
          <p className="text-sm text-text-muted dark:text-text-muted-dark">No components match “{query}”.</p>
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
                  className="component-picker__item flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-border bg-surface p-3 text-left transition hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm focus-visible:border-primary-500 focus-visible:outline-none dark:border-border-dark dark:bg-surface-dark dark:hover:bg-surface-muted-dark"
                >
                  <span className="flex w-full items-center justify-center rounded-md bg-surface-muted py-3 text-primary-600 dark:bg-surface-muted-dark dark:text-text-dark">
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
