import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getNewsArticleBySlug } from "../_lib/api";
import { sanitizeRichText } from "@/lib/sanitize-html";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return { title: "News | Top Casino SG" };
  }

  return {
    title: `${article.title} | Top Casino SG`,
    description: article.excerpt,
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const publishDate = formatDate(article.publishAt);

  return (
    <div id="news-detail-page" className="news-detail-page flex flex-1 flex-col bg-white">
      <div className="news-detail-page__content mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-8">
        <nav
          id="news-detail-breadcrumb"
          aria-label="Breadcrumb"
          className="news-detail-breadcrumb mb-6 flex flex-wrap items-center gap-2 text-sm text-primary-500"
        >
          <Link href="/" className="cursor-pointer hover:text-secondary-600 hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/news" className="cursor-pointer hover:text-secondary-600 hover:underline">
            News
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-primary-900">{article.title}</span>
        </nav>

        <article id="news-detail-article" className="news-detail-article flex flex-col gap-6">
          <header className="news-detail-article__header flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
              {article.title}
            </h1>
            {publishDate && (
              <span className="news-detail-article__date text-sm font-medium text-primary-500">
                Published {publishDate}
              </span>
            )}
          </header>

          <div className="news-detail-article__cover flex h-48 w-full items-center justify-center rounded-lg bg-primary-50 text-base font-medium text-primary-300">
            Top Casino SG
          </div>

          {article.excerpt && (
            <p className="news-detail-article__excerpt text-lg leading-relaxed font-medium text-primary-900">
              {article.excerpt}
            </p>
          )}

          <div
            className="news-detail-article__body rich-text-content whitespace-pre-line text-base leading-relaxed text-primary-600"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(article.content) }}
          />
        </article>

        <div className="news-detail-page__back mt-10">
          <Link
            href="/news"
            className="news-detail-page__back-link cursor-pointer text-sm font-semibold text-secondary-600 hover:underline"
          >
            ← Back to News
          </Link>
        </div>
      </div>
    </div>
  );
}
