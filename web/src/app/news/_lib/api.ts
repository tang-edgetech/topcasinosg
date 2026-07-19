/**
 * Data-fetching helpers for the `/news` list and `/news/[slug]` detail
 * pages.
 *
 * IMPORTANT: every endpoint on the Go API wraps its payload as
 * `{ success: boolean, data: { ... } }`. The actual payload (`newsArticles`
 * for the list, `newsArticle` for the single-article lookup) lives one level
 * below `data`, not at the top level of the JSON body. Every helper below
 * unwraps `body.data` before reading anything further.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Scheduled-publish content can flip from hidden to visible at any moment
// (computed live by the DB, no rebuild/cron involved), so every fetch here
// uses a short revalidate window instead of the default indefinite cache.
const REVALIDATE_SECONDS = 60;

export interface NewsArticleDTO {
  id: number;
  title: string;
  slug: string;
  coverMediaId: number | null;
  excerpt: string;
  content: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getNewsArticles(): Promise<NewsArticleDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/news`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];

    const body = (await res.json()) as {
      success?: boolean;
      data?: { newsArticles?: NewsArticleDTO[]; total?: number };
    };
    return body.data?.newsArticles ?? [];
  } catch {
    // Public API may be briefly unreachable — degrade to empty rather than
    // failing the whole page.
    return [];
  }
}

/** Returns null if the slug doesn't exist, or the article isn't published (backend hides it and reports success:false). */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticleDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/news/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      success?: boolean;
      data?: { newsArticle?: NewsArticleDTO };
    };
    if (!body.success) return null;
    return body.data?.newsArticle ?? null;
  } catch {
    return null;
  }
}

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" });
}
