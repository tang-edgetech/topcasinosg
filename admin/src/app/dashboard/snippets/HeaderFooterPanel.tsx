"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Switch, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, SnippetLocation } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconTrash, IconPlus } from "@/components/Icons";

export const LOCATION_LABELS: Record<SnippetLocation, string> = {
  head: "Head",
  body: "Body (top of page)",
  footer: "Footer (bottom of page)",
};

// Applies unconditionally, everywhere, all the time — the simple half of
// Snippets (see CodePanel for the typed/prioritized/targeted half). Each
// snippet is added and edited on its own route: header-footer/new and
// header-footer/{id}.
export default function HeaderFooterPanel({ snippets, onReload }: { snippets: SnippetDTO[]; onReload: () => void }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();

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

  return (
    <div id="snippets-header-footer-panel" className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          Applies unconditionally, on every page, all the time.
        </p>
        <IconButton id="header-footer-add" title="Add Snippet" onClick={() => router.push("/dashboard/snippets/header-footer/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="header-footer-table"
        rowKey="id"
        dataSource={snippets}
        pagination={false}
        columns={[
          {
            title: "Name",
            key: "name",
            render: (_, s) => (
              <Link href={`/dashboard/snippets/header-footer/${s.id}`} className="font-medium text-primary-700 hover:underline dark:text-text-dark">
                {s.name}
              </Link>
            ),
          },
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
                <IconButton
                  id={`snippet-${s.id}-edit`}
                  title="Edit Snippet"
                  onClick={() => router.push(`/dashboard/snippets/header-footer/${s.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton id={`snippet-${s.id}-delete`} title="Delete Snippet" onClick={() => handleDelete(s)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
