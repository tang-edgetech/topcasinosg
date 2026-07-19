"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { NewsArticleDTO } from "@/lib/types";
import NewsArticleForm from "../NewsArticleForm";

export default function EditNewsArticlePage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticleDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ newsArticle: NewsArticleDTO }>(`/api/admin/news/${params.id}`)
      .then((data) => setArticle(data.newsArticle))
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load news article."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="news-edit-page" className="news-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/news" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to News
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit News Article</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : article ? (
        <NewsArticleForm target={article} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">News article not found.</p>
      )}
    </section>
  );
}
