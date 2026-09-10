"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { NewsArticleDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import StatusFilter, { type StatusFilterValue } from "@/components/content/StatusFilter";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import { CLIENT_TABLE_PAGINATION, FETCH_ALL_PAGE_SIZE } from "@/lib/pagination";

export default function NewsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ newsArticles: NewsArticleDTO[] | null; total: number }>(
        `/api/admin/news?pageSize=${FETCH_ALL_PAGE_SIZE}`
      );
      setArticles(data.newsArticles ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load news articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const filtered = statusFilter === "all" ? articles : articles.filter((a) => a.status === statusFilter);
  const selectedArticles = articles.filter((a) => selectedRowKeys.includes(a.id));

  async function handleSetStatus(article: NewsArticleDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/news/${article.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(article: NewsArticleDTO) {
    const ok = await confirm({
      title: "Delete News Article",
      message: `Delete "${article.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/news/${article.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete news article.");
    }
  }

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish News Articles" : "Set News Articles to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedArticles.length} article(s)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedArticles, (a) =>
      api.put(`/api/admin/news/${a.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete News Articles",
      message: `Delete ${selectedArticles.length} article(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedArticles, (a) => api.del(`/api/admin/news/${a.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="news-page" className="news-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">News</h1>
        <IconButton id="news-add-button" title="Add News Article" onClick={() => router.push("/dashboard/news/new")} icon={<IconPlus />} />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter id="news-status-filter" value={statusFilter} onChange={setStatusFilter} />
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "news-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "news-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          { id: "news-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
      />

      <Table
        id="news-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={CLIENT_TABLE_PAGINATION}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          { title: "Title", dataIndex: "title", key: "title", sorter: (a, b) => a.title.localeCompare(b.title) },
          { title: "Slug", dataIndex: "slug", key: "slug" },
          {
            title: "Status",
            key: "status",
            render: (_, a) => <StatusBadge status={a.status} />,
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, a) => (
              <div className="flex items-center gap-2">
                {a.status !== "published" && (
                  <PublishControl
                    id={`news-${a.id}-publish`}
                    status={a.status}
                    publishAt={a.publishAt}
                    onSave={(status, publishAt) => handleSetStatus(a, status, publishAt)}
                  />
                )}
                <IconButton
                  id={`news-${a.id}-edit`}
                  title="Edit News Article"
                  onClick={() => router.push(`/dashboard/news/${a.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton id={`news-${a.id}-delete`} title="Delete News Article" onClick={() => handleDelete(a)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
