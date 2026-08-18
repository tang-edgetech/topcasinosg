"use client";

import { useEffect, useState } from "react";
import { Input, Checkbox, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SidebarSectionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconPlus, IconTrash } from "@/components/Icons";

/**
 * The Sidebar widget shown on every non-Home page (Figma "Comp / Header /
 * Sidebar") — 3 fixed sections (never added/removed, only their heading and
 * link list are editable). Same single-page, single-Save-action shape as
 * /dashboard/settings, since this is one global config object rather than a
 * list of records.
 */
export default function SidebarPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [sections, setSections] = useState<SidebarSectionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ sections: SidebarSectionDTO[] }>("/api/admin/sidebar");
      setSections(data.sections ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load the sidebar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSection(id: number, patch: Partial<SidebarSectionDTO>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addLink(sectionId: number) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: [
                ...s.links,
                { id: 0, label: "", url: "", hasDropdown: false, sortOrder: s.links.length + 1 },
              ],
            }
          : s
      )
    );
  }

  function updateLink(sectionId: number, index: number, patch: Partial<SidebarSectionDTO["links"][number]>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, links: s.links.map((l, i) => (i === index ? { ...l, ...patch } : l)) } : s
      )
    );
  }

  function removeLink(sectionId: number, index: number) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, links: s.links.filter((_, i) => i !== index) } : s))
    );
  }

  async function handleSave() {
    const ok = await confirm({
      title: "Save Sidebar",
      message: "This updates the sidebar shown on every non-Home page across the site. Continue?",
      confirmLabel: "Save",
    });
    if (!ok) return;

    setSaving(true);
    try {
      const payload = {
        sections: sections.map((s, i) => ({
          id: s.id,
          heading: s.heading,
          sortOrder: i + 1,
          links: s.links.map((l, li) => ({ ...l, sortOrder: li + 1 })),
        })),
      };
      await api.put("/api/admin/sidebar", payload);
      message.success("Sidebar saved.");
      await load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save the sidebar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading…</p>;
  }

  return (
    <section id="sidebar-page" className="sidebar-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Sidebar</h1>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Sidebar"}
        </button>
      </div>
      <p className="max-w-2xl text-sm text-text-muted dark:text-text-muted-dark">
        Shown on every page except the Homepage. The 3 sections below are fixed — edit each section&apos;s heading and
        link list, but sections themselves can&apos;t be added or removed.
      </p>

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            id={`sidebar-section-${section.id}`}
            className="flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">
                Section Heading
              </label>
              <Input value={section.heading} onChange={(e) => updateSection(section.id, { heading: e.target.value })} />
            </div>

            <div className="flex flex-col gap-2">
              {section.links.map((link, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
                  <Input
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => updateLink(section.id, index, { label: e.target.value })}
                  />
                  <Input
                    placeholder="/casinos"
                    value={link.url}
                    onChange={(e) => updateLink(section.id, index, { url: e.target.value })}
                  />
                  <Checkbox
                    checked={link.hasDropdown}
                    onChange={(e) => updateLink(section.id, index, { hasDropdown: e.target.checked })}
                  >
                    Dropdown
                  </Checkbox>
                  <IconButton
                    id={`sidebar-section-${section.id}-link-${index}-remove`}
                    title="Remove Link"
                    onClick={() => removeLink(section.id, index)}
                    icon={<IconTrash width={14} height={14} />}
                    variant="danger"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addLink(section.id)}
              className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
            >
              <IconPlus width={14} height={14} />
              Add Link
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
