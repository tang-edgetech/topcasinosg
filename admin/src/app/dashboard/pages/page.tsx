"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { PageDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";

export default function PagesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ pages: PageDTO[] | null }>("/api/admin/pages");
      setPages(data.pages ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load pages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  async function handleSetStatus(page: PageDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/pages/${page.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(page: PageDTO) {
    if (page.slug === "home") {
      message.error("The Homepage can't be deleted.");
      return;
    }
    const ok = await confirm({
      title: "Delete Page",
      message: `Delete "${page.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/pages/${page.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete page.");
    }
  }

  return (
    <section id="pages-page" className="pages-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Pages</h1>
        <IconButton id="pages-add-button" title="Add Page" onClick={() => router.push("/dashboard/pages/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="pages-table"
        rowKey="id"
        loading={loading}
        dataSource={pages}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showTotal: (t) => `${t} total`,
        }}
        columns={[
          { title: "Title", dataIndex: "title", key: "title" },
          { title: "Slug", dataIndex: "slug", key: "slug" },
          { title: "Status", key: "status", render: (_, p) => <StatusBadge status={p.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, p) => (
              <PublishControl
                id={`page-${p.id}-publish`}
                status={p.status}
                publishAt={p.publishAt}
                onSave={(status, publishAt) => handleSetStatus(p, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, p) => (
              <div className="flex gap-2">
                <IconButton
                  id={`page-${p.id}-edit`}
                  title="Edit Page"
                  onClick={() => router.push(`/dashboard/pages/${p.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton
                  id={`page-${p.id}-delete`}
                  title="Delete Page"
                  onClick={() => handleDelete(p)}
                  icon={<IconTrash />}
                  variant="danger"
                  disabled={p.slug === "home"}
                />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
