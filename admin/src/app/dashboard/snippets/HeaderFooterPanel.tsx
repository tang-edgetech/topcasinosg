"use client";

import { useState } from "react";
import { Table, Form, Input, Select, InputNumber, Switch, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, SnippetLocation } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconTrash, IconPlus, IconClose } from "@/components/Icons";

const { TextArea } = Input;

export const LOCATION_LABELS: Record<SnippetLocation, string> = {
  head: "Head",
  body: "Body (top of page)",
  footer: "Footer (bottom of page)",
};

const SNIPPET_PLACEHOLDER = `<!-- e.g. a Google Tag Manager / analytics / chat-widget snippet -->
<script>
  console.log("hello from a snippet");
</script>`;

// Applies unconditionally, everywhere, all the time — the simple half of
// Snippets (see CodePanel for the typed/prioritized/targeted half). Add/edit
// happens inline on this same page, not a Modal or a separate route.
export default function HeaderFooterPanel({ snippets, onReload }: { snippets: SnippetDTO[]; onReload: () => void }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function startAdd() {
    form.resetFields();
    setEditingId("new");
  }

  function startEdit(s: SnippetDTO) {
    form.setFieldsValue({ name: s.name, location: s.location, content: s.content, sortOrder: s.sortOrder });
    setEditingId(s.id);
  }

  async function handleToggleActive(s: SnippetDTO, active: boolean) {
    try {
      await api.put(`/api/admin/snippets/${s.id}/active`, { active });
      message.success(active ? "Snippet activated." : "Snippet deactivated.");
      onReload();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not update snippet.");
    }
  }

  async function handleDelete(s: SnippetDTO) {
    const ok = await confirm({ title: "Delete Snippet", message: `Delete "${s.name}"? This cannot be undone.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await api.del(`/api/admin/snippets/${s.id}`);
      message.success("Deleted.");
      onReload();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete snippet.");
    }
  }

  async function handleFinish(values: { name: string; location: SnippetLocation; content: string; sortOrder: number }) {
    const ok = await confirm({
      title: editingId === "new" ? "Add Snippet" : "Save Changes",
      message: editingId === "new" ? `Create snippet "${values.name}"? It will go live on every page immediately.` : `Update "${values.name}"?`,
      danger: true,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = { ...values, kind: "global" };
    try {
      if (editingId === "new") {
        await api.post("/api/admin/snippets", body);
        message.success("Snippet created.");
      } else {
        await api.put(`/api/admin/snippets/${editingId}`, body);
        message.success("Saved.");
      }
      setEditingId(null);
      onReload();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save snippet.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="snippets-header-footer-panel" className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          Applies unconditionally, on every page, all the time.
        </p>
        {editingId === null && <IconButton id="header-footer-add" title="Add Snippet" onClick={startAdd} icon={<IconPlus />} />}
      </div>

      {editingId !== null && (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text dark:text-text-dark">{editingId === "new" ? "Add Snippet" : "Edit Snippet"}</h3>
            <IconButton id="header-footer-cancel" title="Cancel" onClick={() => setEditingId(null)} icon={<IconClose width={14} height={14} />} variant="muted" />
          </div>
          <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ location: "head", sortOrder: 0 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]} extra="Admin-facing label only, e.g. 'Google Tag Manager'.">
              <Input placeholder="Google Tag Manager" />
            </Form.Item>
            <Form.Item
              name="location"
              label="Location"
              extra="Next.js can't inject raw markup literally inside <head> — a 'Head' snippet renders as the very first thing on the page instead, before 'Body'. Scripts still execute normally either way."
            >
              <Select options={Object.entries(LOCATION_LABELS).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
            <Form.Item name="content" label="Content" rules={[{ required: true }]}>
              <TextArea rows={10} className="font-mono" placeholder={SNIPPET_PLACEHOLDER} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort Order" extra="Lower numbers render first within the same location.">
              <InputNumber className="w-full" />
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
      )}

      <Table
        id="header-footer-table"
        rowKey="id"
        dataSource={snippets}
        pagination={false}
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          {
            title: "Location",
            key: "location",
            render: (_, s) => (
              <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-surface-muted-dark dark:text-text-dark">
                {LOCATION_LABELS[s.location]}
              </span>
            ),
          },
          { title: "Active", key: "active", render: (_, s) => <Switch checked={s.isActive} onChange={(checked) => handleToggleActive(s, checked)} /> },
          { title: "Sort Order", dataIndex: "sortOrder", key: "sortOrder" },
          {
            title: "Actions",
            key: "actions",
            render: (_, s) => (
              <div className="flex gap-2">
                <IconButton id={`snippet-${s.id}-edit`} title="Edit Snippet" onClick={() => startEdit(s)} icon={<IconEdit />} variant="muted" />
                <IconButton id={`snippet-${s.id}-delete`} title="Delete Snippet" onClick={() => handleDelete(s)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
