"use client";

import { useEffect, useState } from "react";
import { Form, Input, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SaveAction } from "./SaveActionBar";
import type { PageDTO } from "@/lib/types";

const { TextArea } = Input;

// Split into two independently-saveable forms because they're two different
// permission tiers: Meta Title/Description/robots are editable by any
// content-management role (same as the rest of a page; indexing/following is
// controlled site-wide only, see Dashboard > Settings), while the raw
// Head/Body/Footer code injection is Super Admin only — same trust tier as
// the site-wide Snippets tool, since it's unrestricted script injection.
// Non-super-admins simply don't see the code section (see Sidebar's
// role-gated "Snippets" link for the same pattern).
export default function PageSEOForm({
  page,
  onSaved,
  onSaveActionsChange,
}: {
  page: PageDTO;
  onSaved: (page: PageDTO) => void;
  onSaveActionsChange?: (actions: SaveAction[]) => void;
}) {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [seoForm] = Form.useForm();
  const [snippetsForm] = Form.useForm();
  const [savingSeo, setSavingSeo] = useState(false);
  const [savingSnippets, setSavingSnippets] = useState(false);

  async function handleSaveSeo(values: { metaTitle: string; metaDescription: string }) {
    setSavingSeo(true);
    try {
      await api.put(`/api/admin/pages/${page.id}/seo`, values);
      message.success("SEO settings saved.");
      onSaved({ ...page, ...values });
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save SEO settings.");
    } finally {
      setSavingSeo(false);
    }
  }

  async function handleSaveSnippets(values: { headSnippet: string; bodySnippet: string; footerSnippet: string }) {
    const ok = await confirm({
      title: "Save Custom Code",
      message: "This code runs on every visitor's browser for this page. Only paste code you trust.",
      danger: true,
    });
    if (!ok) return;

    setSavingSnippets(true);
    try {
      await api.put(`/api/admin/pages/${page.id}/snippets`, values);
      message.success("Custom code saved.");
      onSaved({ ...page, ...values });
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save custom code.");
    } finally {
      setSavingSnippets(false);
    }
  }

  useEffect(() => {
    if (!onSaveActionsChange) return;
    const actions: SaveAction[] = [
      { id: "page-seo-form-submit", label: "Save SEO Settings", onSave: () => seoForm.submit(), saving: savingSeo },
    ];
    if (user?.role === "super_admin") {
      actions.push({
        id: "page-snippets-form-submit",
        label: "Save Custom Code",
        onSave: () => snippetsForm.submit(),
        saving: savingSnippets,
        variant: "default",
      });
    }
    onSaveActionsChange(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingSeo, savingSnippets, user?.role]);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div id="page-seo-form" className="page-seo-form flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
        <h2 className="text-lg font-bold text-text dark:text-text-dark">SEO</h2>
        <Form
          form={seoForm}
          layout="vertical"
          onFinish={handleSaveSeo}
          initialValues={{
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
          }}
        >
          <Form.Item name="metaTitle" label="Meta Title" extra="Leave blank to fall back to the page title.">
            <Input placeholder="About Us | Top Casino SG" />
          </Form.Item>
          <Form.Item
            name="metaDescription"
            label="Meta Description"
            extra="Search engine indexing/following is controlled site-wide — see Dashboard > Settings."
          >
            <TextArea rows={2} maxLength={300} showCount />
          </Form.Item>
          {!onSaveActionsChange && (
            <button
              type="submit"
              id="page-seo-form-submit"
              disabled={savingSeo}
              className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingSeo ? "Saving…" : "Save SEO Settings"}
            </button>
          )}
        </Form>
      </div>

      {user?.role === "super_admin" && (
        <div id="page-snippets-form" className="page-snippets-form flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
          <div>
            <h2 className="text-lg font-bold text-text dark:text-text-dark">Custom Code</h2>
            <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
              Raw HTML/JavaScript for just this page, layered on top of the site-wide Snippets. A &quot;Head&quot; block
              can&apos;t literally be injected inside &lt;head&gt; (a Next.js App Router limitation) — it renders as the
              very first thing on the page instead, before &quot;Body&quot;. Scripts still execute normally.
            </p>
          </div>
          <Form
            form={snippetsForm}
            layout="vertical"
            onFinish={handleSaveSnippets}
            initialValues={{
              headSnippet: page.headSnippet,
              bodySnippet: page.bodySnippet,
              footerSnippet: page.footerSnippet,
            }}
          >
            <Form.Item name="headSnippet" label="Head">
              <TextArea rows={6} className="font-mono" />
            </Form.Item>
            <Form.Item name="bodySnippet" label="Body (top of page)">
              <TextArea rows={6} className="font-mono" />
            </Form.Item>
            <Form.Item name="footerSnippet" label="Footer (bottom of page)">
              <TextArea rows={6} className="font-mono" />
            </Form.Item>
            {!onSaveActionsChange && (
              <button
                type="submit"
                id="page-snippets-form-submit"
                disabled={savingSnippets}
                className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingSnippets ? "Saving…" : "Save Custom Code"}
              </button>
            )}
          </Form>
        </div>
      )}
    </div>
  );
}
