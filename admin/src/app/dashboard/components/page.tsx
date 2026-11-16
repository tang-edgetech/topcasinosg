"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Table, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import { api, ApiError } from "@/lib/api";
import type { ComponentSummaryDTO } from "@/lib/types";

// Components list (/dashboard/components). Each component is added and
// edited on its own route: new and {id}.
export default function ComponentsListPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [components, setComponents] = useState<ComponentSummaryDTO[] | null>(null);

  const load = useCallback(() => {
    api.get<{ components: ComponentSummaryDTO[] }>("/api/admin/components").then(
      (data) => setComponents(data.components ?? []),
      (err) => {
        setComponents([]);
        message.error(err instanceof ApiError ? err.message : "Could not load components.");
      },
    );
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(c: ComponentSummaryDTO) {
    if (c.usageCount > 0) {
      message.warning(`"${c.name}" is placed on ${c.usageCount} page${c.usageCount === 1 ? "" : "s"}. Remove it from them first.`);
      return;
    }
    const ok = await confirm({ title: "Delete Component", message: `Delete "${c.name}"? This cannot be undone.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await api.del(`/api/admin/components/${c.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete the component.");
    }
  }

  return (
    <div id="components-list" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Changing a component changes every page that places it.</p>
        <IconButton id="component-add" title="Add Component" onClick={() => router.push("/dashboard/components/new")} icon={<IconPlus />} />
      </div>
      <Table
        id="components-table"
        rowKey="id"
        loading={components === null}
        dataSource={components ?? []}
        pagination={false}
        columns={[
          {
            title: "Name",
            key: "name",
            render: (_, c) => (
              <div className="flex flex-col">
                <Link href={`/dashboard/components/${c.id}`} className="font-medium text-primary-700 hover:underline dark:text-text-dark">
                  {c.name}
                </Link>
                {c.description && <span className="text-xs text-text-muted dark:text-text-muted-dark">{c.description}</span>}
              </div>
            ),
          },
          { title: "Settings", key: "settings", render: (_, c) => (c.settings.length ? c.settings.map((s) => s.key).join(", ") : "—") },
          { title: "Pages", key: "usage", render: (_, c) => c.usageCount },
          { title: "Updated", key: "updated", render: (_, c) => dayjs(c.updatedAt).format("D MMM YYYY, HH:mm") },
          {
            title: "Actions",
            key: "actions",
            render: (_, c) => (
              <div className="flex gap-2">
                <IconButton id={`component-${c.id}-edit`} title="Edit Component" href={`/dashboard/components/${c.id}`} icon={<IconEdit />} variant="muted" />
                <IconButton id={`component-${c.id}-delete`} title="Delete Component" onClick={() => handleDelete(c)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
