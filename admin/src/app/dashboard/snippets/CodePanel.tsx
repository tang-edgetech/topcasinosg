"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Switch, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, PageDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconTrash, IconPlus } from "@/components/Icons";
import { CODE_TYPE_LABELS, describeConditions } from "./codeSnippets";

// Typed, prioritized, conditionally-targeted the second half of Snippets
// (see HeaderFooterPanel for the simple/unconditional half). Each snippet is
// added and edited on its own route: code/new and code/{id}.
export default function CodePanel({ snippets, pages, onReload }: { snippets: SnippetDTO[]; pages: PageDTO[]; onReload: () => void }) {
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
    <div id="snippets-code-panel" className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          Typed, prioritized, and optionally targeted to pages/URLs with AND/OR conditions. No conditions = applies everywhere.
        </p>
        <IconButton id="code-add" title="Add Code Snippet" onClick={() => router.push("/dashboard/snippets/code/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="code-table"
        rowKey="id"
        dataSource={snippets}
        pagination={false}
        columns={[
          {
            title: "Name",
            key: "name",
            render: (_, s) => (
              <Link href={`/dashboard/snippets/code/${s.id}`} className="font-medium text-primary-700 hover:underline dark:text-text-dark">
                {s.name}
              </Link>
            ),
          },
          { title: "Type", key: "type", render: (_, s) => (s.codeType ? CODE_TYPE_LABELS[s.codeType] : "—") },
          { title: "Priority", dataIndex: "priority", key: "priority" },
          {
            title: "Targeting",
            key: "targeting",
            render: (_, s) => (s.conditions.length === 0 ? "Everywhere" : describeConditions(s.conditions, pages)),
          },
          { title: "Active", key: "active", render: (_, s) => <Switch checked={s.isActive} onChange={(checked) => handleToggleActive(s, checked)} /> },
          {
            title: "Actions",
            key: "actions",
            render: (_, s) => (
              <div className="flex gap-2">
                <IconButton id={`code-${s.id}-edit`} title="Edit Snippet" onClick={() => router.push(`/dashboard/snippets/code/${s.id}`)} icon={<IconEdit />} variant="muted" />
                <IconButton id={`code-${s.id}-delete`} title="Delete Snippet" onClick={() => handleDelete(s)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
