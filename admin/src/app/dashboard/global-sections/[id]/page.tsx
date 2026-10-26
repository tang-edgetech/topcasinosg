"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { GlobalSectionDTO, PageDTO, PageSectionDTO } from "@/lib/types";
import SectionBuilder from "../../pages/SectionBuilder";
import SaveActionBar, { type SaveAction } from "../../pages/SaveActionBar";

// Edits one global section: its name and its sections (the same builder as
// a page's Page Content). Saving updates every page that places it.
export default function EditGlobalSectionPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [global, setGlobal] = useState<GlobalSectionDTO | null>(null);
  const [sections, setSections] = useState<PageSectionDTO[] | null>(null);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [actions, setActions] = useState<SaveAction[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [list, data] = await Promise.all([
          api.get<{ globalSections: GlobalSectionDTO[] }>("/api/admin/global-sections"),
          api.get<{ page: PageDTO; sections: PageSectionDTO[] | null }>(`/api/admin/pages/${id}`),
        ]);
        const found = list.globalSections.find((g) => g.id === id);
        if (!found) throw new ApiError("Global section not found.", 404);
        setGlobal(found);
        setName(found.name);
        setSections(data.sections ?? []);
      } catch (err) {
        message.error(err instanceof ApiError ? err.message : "Could not load the global section.");
        router.push("/dashboard/global-sections");
      }
    }
    if (Number.isFinite(id)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function rename() {
    if (!global || !name.trim() || name.trim() === global.name) return;
    setRenaming(true);
    try {
      await api.put(`/api/admin/global-sections/${id}`, { name });
      setGlobal({ ...global, name: name.trim() });
      message.success("Name saved.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not rename the global section.");
    } finally {
      setRenaming(false);
    }
  }

  if (!user) return null;
  if (!global || sections === null) {
    return (
      <section id="global-section-edit-page" className="flex flex-col gap-6">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading…</p>
      </section>
    );
  }

  return (
    <section id="global-section-edit-page" className="global-section-edit-page flex flex-col gap-6 pb-24">
      <button
        type="button"
        onClick={() => router.push("/dashboard/global-sections")}
        className="cursor-pointer self-start text-sm font-medium text-primary-600 hover:text-primary-900"
      >
        ← Back to Global Sections
      </button>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Global Section: {global.name}</h1>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          {global.usageCount === 0
            ? "Not placed on any page yet — add it to a page with the “Global Section” component."
            : `Placed on ${global.usageCount} page${global.usageCount === 1 ? "" : "s"}. Saving updates all of them.`}
        </p>
      </div>
      <div className="flex max-w-xl items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="global-section-name" className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
            Name
          </label>
          <Input id="global-section-name" value={name} onChange={(e) => setName(e.target.value)} onPressEnter={rename} />
        </div>
        <button
          type="button"
          onClick={rename}
          disabled={renaming || !name.trim() || name.trim() === global.name}
          className="cursor-pointer rounded-md border border-border px-4 py-1.5 text-sm font-semibold text-text hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:text-text-dark"
        >
          Save Name
        </button>
      </div>
      <SectionBuilder pageId={id} initialSections={sections} onActionsChange={setActions} isGlobal />
      <SaveActionBar actions={actions} />
    </section>
  );
}
