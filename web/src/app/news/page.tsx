import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getNewsArticles } from "./_lib/api";
import IntroductionSection from "@/components/IntroductionSection";
import PageGrid from "@/components/PageGrid";

export const metadata: Metadata = {
  title: "News | Top Casino SG",
  description: "The latest casino industry news, updates, and announcements.",
};

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <div id="news-page" className="news-page flex flex-1 flex-col bg-white">
      <PageGrid>
      <IntroductionSection
        heading="Casino News"
        highlightText="News"
        subheading="The Latest From the Online Casino Scene"
        paragraph="<p>The latest announcements, promotions, and industry updates we're tracking across every region.</p>"
      />
      <div id="news-page-content" className="news-page__content w-full flex-1 py-10">
        {articles.length === 0 ? (
          <div
            id="news-empty-state"
            className="news-empty-state flex flex-col items-center gap-2 rounded-lg border border-primary-100 bg-surface-muted px-6 py-16 text-center"
          >
            <p className="text-lg font-semibold text-primary-900">
              No news articles published yet.
            </p>
            <p className="max-w-md text-sm text-primary-500">
              Check back soon for the latest updates from the Singapore online casino scene.
            </p>
          </div>
        ) : (
          <ul id="news-article-list" className="news-article-list grid grid-cols-1 gap-6 sm:grid-cols-2">
            {articles.map((article) => {
              const publishDate = formatDate(article.publishAt);
              return (
                <li key={article.id} className="news-article-card">
                  <Link
                    href={`/news/${article.slug}`}
                    className="news-article-card__link flex h-full cursor-pointer flex-col gap-3 rounded-lg border border-primary-100 bg-white p-6 shadow-sm transition-colors hover:border-secondary-600"
                  >
                    <div className="news-article-card__cover flex h-32 w-full items-center justify-center rounded-md bg-primary-50 text-sm font-medium text-primary-300">
                      Top Casino SG
                    </div>
                    {publishDate && (
                      <span className="news-article-card__date text-xs font-medium text-primary-500">
                        {publishDate}
                      </span>
                    )}
                    <h2 className="news-article-card__title text-lg font-bold text-primary-900">
                      {article.title}
                    </h2>
                    <p className="news-article-card__excerpt line-clamp-3 text-sm text-primary-600">
                      {article.excerpt}
                    </p>
                    <span className="news-article-card__cta mt-auto text-sm font-semibold text-secondary-600">
                      Read more →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </PageGrid>
    </div>
  );
}
