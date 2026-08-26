"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SaveAction } from "./SaveActionBar";
import type { PageDTO } from "@/lib/types";

// Metadata-only form (title/slug) — shared by /dashboard/pages/new and
// the top of /dashboard/pages/[id]. Section content is a separate save
// action (see SectionBuilder) since it hits a different endpoint
// (PUT .../sections, a full-tree replace) and there's no reason to force
// re-submitting the whole block tree just to fix a typo in the title.
//
// onSaveActionChange is only passed from the [id] edit page, which renders
// the submit button itself (top-right, sticky) instead of the inline one
// below — /dashboard/pages/new has no sticky bar, so it keeps the inline button.
export default function PageMetaForm({
  target,
  onSaved,
  onSaveActionChange,
}: {
  target: PageDTO | null;
  onSaved?: (page: PageDTO) => void;
  onSaveActionChange?: (action: SaveAction) => void;
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [pages, setPages] = useState<PageDTO[]>([]);
  const isHome = target?.slug === "home";

  useEffect(() => {
    api
      .get<{ pages: PageDTO[] | null }>("/api/admin/pages")
      .then((data) => setPages(data.pages ?? []))
      .catch(() => setPages([]));
  }, []);

  // A page can't be parented under itself or under one of its own
  // descendants (the server rejects this too, see PageService.Update's
  // isDescendant check) — `path` already encodes the full ancestor chain,
  // so "starts with my own path + /" is enough to spot a descendant here
  // without re-walking the tree client-side.
  const parentOptions = pages
    .filter((p) => !target || (p.id !== target.id && !p.path.startsWith(`${target.path}/`)))
    .map((p) => ({ value: p.id, label: `/${p.path}` }));

  async function handleFinish(values: { slug: string; title: string; parentId?: number | null }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Page",
      message: target ? `Update "${values.title}"?` : `Create page "${values.title}"?`,
    });
    if (!ok) return;

    const payload = { ...values, parentId: values.parentId ?? null };
    setSubmitting(true);
    try {
      if (target) {
        await api.put(`/api/admin/pages/${target.id}`, payload);
        message.success("Saved.");
        onSaved?.({ ...target, ...payload });
      } else {
        const res = await api.post<{ page: PageDTO }>("/api/admin/pages", payload);
        message.success("Page created. Now add content sections below.");
        router.push(`/dashboard/pages/${res.page.id}`);
      }
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save page.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    onSaveActionChange?.({
      id: "page-meta-form-submit",
      label: target ? "Save Details" : "Create Page",
      onSave: () => form.submit(),
      saving: submitting,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, target]);

  return (
    <div id="page-meta-form" className="page-meta-form flex max-w-2xl flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Page Details</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          slug: target?.slug ?? "",
          title: target?.title ?? "",
          parentId: target?.parentId ?? undefined,
        }}
      >
        <Form.Item name="title" label="Page Title" rules={[{ required: true }]} extra="Admin-facing label, e.g. 'Homepage'.">
          <Input />
        </Form.Item>
        <Form.Item
          name="parentId"
          label="Parent Page"
          extra={
            isHome
              ? "The Homepage stays at the root — it can't have a parent."
              : "Optional. Nesting a page under another builds its URL from both — e.g. parent \"legal\" + this page's slug \"privacy-policy\" -> /legal/privacy-policy."
          }
        >
          <Select
            allowClear
            placeholder="No parent (top-level page)"
            disabled={isHome}
            options={parentOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only" }]}
          extra={
            isHome
              ? "The Homepage's slug must stay \"home\" — it's what the public site looks up at /."
              : "One path segment, e.g. \"about\" — combined with any Parent Page above to form the full URL. Must be unique among sibling pages (same parent), not site-wide. Exception: the per-region bonus-type pages (\"th-bonuses-welcome\" etc.), which are looked up by this slug but served at /{region}/bonuses/{type}."
          }
        >
          <Input placeholder="about" disabled={isHome} />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="page-meta-form-cancel"
            onClick={() => router.push("/dashboard/pages")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            {target ? "Back to Pages" : "Cancel"}
          </button>
          {!onSaveActionChange && (
            <button
              type="submit"
              id="page-meta-form-submit"
              disabled={submitting}
              className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : target ? "Save Details" : "Create Page"}
            </button>
          )}
        </div>
      </Form>
    </div>
  );
}
