"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, App as AntApp } from "antd";
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
  const isHome = target?.slug === "home";

  async function handleFinish(values: { slug: string; title: string }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Page",
      message: target ? `Update "${values.title}"?` : `Create page "${values.title}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      if (target) {
        await api.put(`/api/admin/pages/${target.id}`, values);
        message.success("Saved.");
        onSaved?.({ ...target, ...values });
      } else {
        const res = await api.post<{ page: PageDTO }>("/api/admin/pages", values);
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
        }}
      >
        <Form.Item name="title" label="Page Title" rules={[{ required: true }]} extra="Admin-facing label, e.g. 'Homepage'.">
          <Input />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only" }]}
          extra={isHome ? "The Homepage's slug must stay \"home\" — it's what the public site looks up at /." : "Used as the public URL path, e.g. \"about\" for /about."}
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
