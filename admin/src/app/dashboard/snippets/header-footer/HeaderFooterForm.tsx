"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, InputNumber, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, SnippetLocation, SnippetRevisionDTO } from "@/lib/types";
import CodeEditor from "@/components/CodeEditor";
import { LOCATION_LABELS } from "../HeaderFooterPanel";
import SnippetRevisions from "../SnippetRevisions";

type HeaderFooterValues = { name: string; location: SnippetLocation; content: string; sortOrder: number };

// Add/edit form for one Header & Footer snippet, on its own route
// (/dashboard/snippets/header-footer/new and /dashboard/snippets/header-footer/{id}).
// Saving goes back to the list. Editing also shows the snippet's revisions;
// restoring one loads it into this form.
export default function HeaderFooterForm({ target }: { target: SnippetDTO | null }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [form] = Form.useForm<HeaderFooterValues>();
  const [submitting, setSubmitting] = useState(false);

  function restoreRevision(rev: SnippetRevisionDTO) {
    form.setFieldsValue({ name: rev.name, location: rev.location, content: rev.content, sortOrder: rev.sortOrder });
  }

  async function handleFinish(values: HeaderFooterValues) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Snippet",
      message: target ? `Update "${values.name}"?` : `Create snippet "${values.name}"? It will go live on every page immediately.`,
      danger: true,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = { ...values, kind: "global" };
    try {
      if (!target) {
        await api.post("/api/admin/snippets", body);
        message.success("Snippet created.");
      } else {
        await api.put(`/api/admin/snippets/${target.id}`, body);
        message.success("Saved.");
      }
      router.push("/dashboard/snippets");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save snippet.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div id="header-footer-form" className="header-footer-form rounded-lg border border-border p-5 dark:border-border-dark">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={
            target
              ? { name: target.name, location: target.location, content: target.content, sortOrder: target.sortOrder }
              : { location: "head", sortOrder: 0 }
          }
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]} extra="Admin-facing label only, e.g. 'Google Tag Manager'.">
            <Input placeholder="Google Tag Manager" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Form.Item
              name="location"
              label="Location"
              extra="Next.js can't inject raw markup literally inside <head> — a 'Head' snippet renders as the very first thing on the page instead, before 'Body'. Scripts still execute normally either way."
            >
              <Select options={Object.entries(LOCATION_LABELS).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort Order" extra="Lower numbers render first within the same location.">
              <InputNumber className="w-full" />
            </Form.Item>
          </div>
          <Form.Item
            name="content"
            label="Content (HTML)"
            rules={[{ required: true }]}
            extra="Pasted as-is: wrap CSS in <style> and JavaScript or jQuery in <script>."
          >
            <CodeEditor id="header-footer-content" language="html" minHeight="260px" />
          </Form.Item>
          <button
            type="submit"
            id="header-footer-submit"
            disabled={submitting}
            className="btn btn--primary w-fit cursor-pointer rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </Form>
      </div>
      {target && <SnippetRevisions snippetId={target.id} onRestore={restoreRevision} />}
    </div>
  );
}
