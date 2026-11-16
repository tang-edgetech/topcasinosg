"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import CodeEditor from "@/components/CodeEditor";
import { api, ApiError } from "@/lib/api";
import type { ComponentDTO, ComponentRevisionDTO, ComponentSetting } from "@/lib/types";
import SettingsEditor, { settingKeyProblem } from "./SettingsEditor";
import ComponentPreview from "./ComponentPreview";
import ComponentRevisions from "./ComponentRevisions";

const MAX_CODE_KB = 256;

interface Draft {
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
  settings: ComponentSetting[];
}

const toDraft = (c: ComponentDTO | ComponentRevisionDTO | null): Draft =>
  c
    ? { name: c.name, description: c.description, html: c.html, css: c.css, js: c.js, settings: c.settings ?? [] }
    : { name: "", description: "", html: "", css: "", js: "", settings: [] };

interface UsedOn {
  id: number;
  title: string;
  slug: string;
  kind: string;
}

// Add/edit form for one component (/dashboard/components/new and
// /dashboard/components/{id}). Saving changes every page that places it;
// each save is kept as a revision.
export default function ComponentForm({ target }: { target: ComponentDTO | null }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(target));
  const [preview, setPreview] = useState<Draft>(draft);
  const [submitting, setSubmitting] = useState(false);
  const [usedOn, setUsedOn] = useState<UsedOn[] | null>(null);
  // Bumped on each save so the revisions list reloads.
  const [saves, setSaves] = useState(0);
  const set = <K extends keyof Draft>(key: K) => (value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // The preview follows the code half a second after typing stops.
  useEffect(() => {
    const t = setTimeout(() => setPreview(draft), 500);
    return () => clearTimeout(t);
  }, [draft]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    api.get<{ pages: UsedOn[] }>(`/api/admin/components/${target.id}/pages`).then(
      (data) => !cancelled && setUsedOn(data.pages ?? []),
      () => !cancelled && setUsedOn([]),
    );
    return () => {
      cancelled = true;
    };
  }, [target]);

  function problems(): string | null {
    if (!draft.name.trim()) return "Give the component a name.";
    if (!draft.html.trim() && !draft.js.trim()) return "Add some HTML or JavaScript.";
    for (const [label, code] of [
      ["HTML", draft.html],
      ["CSS", draft.css],
      ["JavaScript", draft.js],
    ] as const) {
      if (new Blob([code]).size > MAX_CODE_KB * 1024) return `The ${label} is over ${MAX_CODE_KB} KB. Load big libraries from a CDN instead.`;
    }
    const keys = new Set<string>();
    for (const s of draft.settings) {
      const p = settingKeyProblem(s.key);
      if (p) return `Setting "${s.key || "(no key)"}": ${p}`;
      if (keys.has(s.key)) return `Two settings have the key "${s.key}".`;
      keys.add(s.key);
      if (s.type === "select" && !(s.options ?? []).some((o) => o.value.trim())) return `Setting "${s.key}" needs at least one choice.`;
    }
    return null;
  }

  async function handleSave() {
    const problem = problems();
    if (problem) {
      message.error(problem);
      return;
    }
    const pages = target?.usageCount ?? 0;
    const ok = await confirm({
      title: target ? "Save Component" : "Add Component",
      message: target
        ? `Save "${draft.name}"?${pages > 0 ? ` It is placed on ${pages} page${pages === 1 ? "" : "s"}, which change straight away.` : ""}`
        : `Create component "${draft.name}"?`,
      danger: pages > 0,
    });
    if (!ok) return;
    setSubmitting(true);
    const body = {
      ...draft,
      settings: draft.settings.map((s) => ({
        ...s,
        options: s.type === "select" ? (s.options ?? []).filter((o) => o.value.trim()) : undefined,
      })),
    };
    try {
      if (target) {
        await api.put(`/api/admin/components/${target.id}`, body);
        message.success("Saved. Pages show the change within a minute.");
        setSaves((n) => n + 1);
      } else {
        const data = await api.post<{ component: ComponentDTO }>("/api/admin/components", body);
        message.success("Component created.");
        router.push(`/dashboard/components/${data.component.id}`);
      }
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save the component.");
    } finally {
      setSubmitting(false);
    }
  }

  function restoreRevision(rev: ComponentRevisionDTO) {
    setDraft(toDraft(rev));
  }

  const sectionClass = "flex flex-col gap-3 rounded-lg border border-border p-5 dark:border-border-dark";
  const heading = "text-base font-bold text-text dark:text-text-dark";
  const hint = "text-xs text-text-muted dark:text-text-muted-dark";

  return (
    <div id="component-form" className="component-form flex flex-col gap-6">
      <div className={sectionClass}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text dark:text-text-dark">Name</span>
            <Input id="component-name" value={draft.name} placeholder="Lucky Number Generator" onChange={(e) => set("name")(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text dark:text-text-dark">Description (for editors)</span>
            <Input
              id="component-description"
              value={draft.description}
              placeholder="Picks random Toto or 4D numbers"
              onChange={(e) => set("description")(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex flex-col gap-0.5">
          <h3 className={heading}>Settings</h3>
          <span className={hint}>
            Options each page fills in. Use them as <code>{"{{key}}"}</code> in the HTML and <code>window.settings.key</code> in the JavaScript.
          </span>
        </div>
        <SettingsEditor value={draft.settings} onChange={set("settings")} />
      </div>

      <div className={sectionClass}>
        <div className="flex flex-col gap-0.5">
          <h3 className={heading}>Code</h3>
          <span className={hint}>
            It runs in its own frame: write it self-contained (no &lt;html&gt;, &lt;head&gt; or &lt;body&gt;). The site&apos;s colours are CSS
            variables such as <code>var(--color-primary-900)</code> and <code>var(--color-secondary-500)</code>. localStorage and cookies
            aren&apos;t available. Up to {MAX_CODE_KB} KB each.
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text dark:text-text-dark">HTML</span>
          <CodeEditor id="component-html" language="html" value={draft.html} onChange={set("html")} minHeight="180px" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text dark:text-text-dark">CSS</span>
          <CodeEditor id="component-css" language="css" value={draft.css} onChange={set("css")} minHeight="140px" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text dark:text-text-dark">JavaScript</span>
          <CodeEditor id="component-js" language="js" value={draft.js} onChange={set("js")} minHeight="180px" />
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex flex-col gap-0.5">
          <h3 className={heading}>Preview</h3>
          <span className={hint}>With each setting&apos;s default. It updates as you type; nothing changes on the site until you save.</span>
        </div>
        <div className="rounded-md bg-surface-muted p-4 dark:bg-surface-muted-dark">
          <ComponentPreview html={preview.html} css={preview.css} js={preview.js} settings={preview.settings} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          id="component-submit"
          disabled={submitting}
          onClick={handleSave}
          className="btn btn--primary w-fit cursor-pointer rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        {target && (
          <span className={hint}>
            {target.usageCount === 0 ? "Not placed on any page yet." : `Placed on ${target.usageCount} page${target.usageCount === 1 ? "" : "s"}.`}
          </span>
        )}
      </div>

      {target && (
        <div id="component-used-on" className={sectionClass}>
          <div className="flex flex-col gap-0.5">
            <h3 className={heading}>Placed on</h3>
            <span className={hint}>Add it to a page in the page builder: Elements &gt; Component.</span>
          </div>
          {usedOn === null ? (
            <p className={hint}>Loading…</p>
          ) : usedOn.length === 0 ? (
            <p className={hint}>No pages yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {usedOn.map((p) => (
                <li key={p.id}>
                  <Link
                    href={p.kind === "global" ? `/dashboard/global-sections/${p.id}` : `/dashboard/pages/${p.id}`}
                    className="text-primary-700 hover:underline dark:text-text-dark"
                  >
                    {p.title}
                  </Link>
                  <span className={`ml-2 ${hint}`}>{p.kind === "global" ? "Global Section" : p.kind === "template" ? "Template" : `/${p.slug}`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {target && <ComponentRevisions key={saves} componentId={target.id} onRestore={restoreRevision} />}
    </div>
  );
}
