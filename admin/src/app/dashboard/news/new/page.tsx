"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import NewsArticleForm from "../NewsArticleForm";

export default function NewNewsArticlePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section id="news-new-page" className="news-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/news" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to News
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add News Article</h1>
      <NewsArticleForm target={null} />
    </section>
  );
}
