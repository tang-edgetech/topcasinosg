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
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function NewsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ newsArticles: NewsArticleDTO[] | null; total: number }>(
        `/api/admin/news?page=${page}&pageSize=${pageSize}`
      );
      setArticles(data.newsArticles ?? []);
      setTotal(data.total);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load news articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  if (!user) return null;

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

  return (
    <section id="news-page" className="news-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">News</h1>
        <IconButton id="news-add-button" title="Add News Article" onClick={() => router.push("/dashboard/news/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="news-table"
        rowKey="id"
        loading={loading}
        dataSource={articles}
        pagination={tablePagination(page, pageSize, total, (p, ps) => {
          if (ps !== pageSize) {
            setPageSize(ps);
            setPage(1);
          } else {
            setPage(p);
          }
        })}
        columns={[
          { title: "Title", dataIndex: "title", key: "title" },
          { title: "Slug", dataIndex: "slug", key: "slug" },
          { title: "Status", key: "status", render: (_, a) => <StatusBadge status={a.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, a) => (
              <PublishControl
                id={`news-${a.id}-publish`}
                status={a.status}
                publishAt={a.publishAt}
                onSave={(status, publishAt) => handleSetStatus(a, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, a) => (
              <div className="flex gap-2">
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
