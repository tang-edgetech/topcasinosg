import type { Metadata } from "next";
import { getSiteSettings, type SiteSettings } from "./site-settings";
import { mediaUrl } from "./pages";

/**
 * Builds every route's <head> SEO from one place: title, description,
 * keywords, canonical URL, robots, Open Graph (incl. article:* tags) and
 * X/Twitter card. Each route passes what it knows about itself (its own
 * path, title, excerpt, image, dates); the item's SEO overrides from the
 * backoffice (GET /api/seo/{type}/{id}, see api/internal/domain/seo.go) win
 * over those, and site-wide defaults (Settings > General: share image, X
 * handle, site name) fill the rest.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const REVALIDATE_SECONDS = 60;
const DESCRIPTION_MAX_LENGTH = 160;
const OG_LOCALE = "en_SG";

export type SeoEntityType = "page" | "casino" | "guide" | "news" | "bonus";

export interface SeoMeta {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
  canonicalUrl: string;
  robotsNoindex: boolean;
  robotsNofollow: boolean;
  articleAuthor: string;
}

export interface SeoInput {
  path: string;
  title?: string;
  description?: string;
  image?: string | null;
  seo?: SeoMeta | null;
  type?: "website" | "article";
  article?: {
    publishedTime?: string | null;
    modifiedTime?: string | null;
    section?: string;
  };
}

export async function getSeoMeta(type: SeoEntityType, id: number | undefined): Promise<SeoMeta | null> {
  if (!id) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/seo/${type}/${id}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const body = (await res.json()) as { success: boolean; data?: { seo?: SeoMeta } };
    return body.success ? (body.data?.seo ?? null) : null;
  } catch {
    return null;
  }
}

// The address search engines should treat as the page's own: the
// NEXT_PUBLIC_SITE_URL of this environment, else Settings > Site URL.
export function siteBaseUrl(settings: Pick<SiteSettings, "siteUrl">): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || settings.siteUrl || "http://localhost:4000";
  return base.replace(/\/+$/, "");
}

export function absoluteUrl(base: string, url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Share images and the logo, on this site's own domain like every other
// media URL (see mediaUrl).
export function assetUrl(url: string | null | undefined): string | null {
  return mediaUrl(url);
}

export function plainText(html: string | null | undefined, maxLength = DESCRIPTION_MAX_LENGTH): string {
  const text = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), maxLength / 2)).trim()}…`;
}

function keywordList(keywords: string | undefined): string[] {
  return (keywords ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function fillYear(seo: SeoMeta | null | undefined): SeoMeta | null | undefined {
  if (!seo) return seo;
  const year = String(new Date().getFullYear());
  const fill = (text: string) => text.replaceAll("{year}", year);
  return { ...seo, metaTitle: fill(seo.metaTitle), metaDescription: fill(seo.metaDescription), ogTitle: fill(seo.ogTitle), ogDescription: fill(seo.ogDescription) };
}

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const settings = await getSiteSettings();
  const base = siteBaseUrl(settings);
  const seo = fillYear(input.seo);
  const title = seo?.metaTitle || input.title || settings.siteTitle;
  const description = seo?.metaDescription || plainText(input.description) || undefined;
  const canonical = absoluteUrl(base, seo?.canonicalUrl || input.path);
  const image = assetUrl(seo?.ogImageUrl || input.image || settings.ogImageUrl || settings.logoUrl);
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const keywords = keywordList(seo?.keywords);
  const handle = settings.twitterHandle ? `@${settings.twitterHandle.replace(/^@/, "")}` : undefined;
  const images = image ? [{ url: image, alt: ogTitle }] : undefined;
  const article = input.type === "article" ? input.article : undefined;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical },
    openGraph: article
      ? {
          type: "article",
          url: canonical,
          siteName: settings.siteTitle,
          locale: OG_LOCALE,
          title: ogTitle,
          description: ogDescription,
          images,
          publishedTime: article.publishedTime ?? undefined,
          modifiedTime: article.modifiedTime ?? undefined,
          authors: [seo?.articleAuthor || settings.siteTitle],
          section: article.section,
          tags: keywords.length > 0 ? keywords : undefined,
        }
      : {
          type: "website",
          url: canonical,
          siteName: settings.siteTitle,
          locale: OG_LOCALE,
          title: ogTitle,
          description: ogDescription,
          images,
        },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      site: handle,
      creator: handle,
      title: ogTitle,
      description: ogDescription,
      images: image ? [image] : undefined,
    },
  };

  if (seo?.robotsNoindex || seo?.robotsNofollow) {
    metadata.robots = { index: settings.seoIndex && !seo.robotsNoindex, follow: settings.seoFollow && !seo.robotsNofollow };
  }
  return metadata;
}

// SEO for a Pages CMS page served at path: its meta title/description from
// the page's SEO tab, plus its SEO overrides (share image, canonical...).
export async function cmsPageMetadata(
  page: { id: number; title: string; metaTitle: string; metaDescription: string },
  path: string,
): Promise<Metadata> {
  return buildMetadata({
    path,
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
    seo: await getSeoMeta("page", page.id),
  });
}

// schema.org Article / NewsArticle for a guide or news article page.
export async function articleJsonLd(input: {
  type: "Article" | "NewsArticle";
  path: string;
  headline: string;
  description?: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  seo?: SeoMeta | null;
}): Promise<Record<string, unknown>> {
  const settings = await getSiteSettings();
  const base = siteBaseUrl(settings);
  const url = absoluteUrl(base, input.seo?.canonicalUrl || input.path);
  const image = assetUrl(input.seo?.ogImageUrl || input.image || settings.ogImageUrl);
  const logo = assetUrl(settings.logoUrl);
  const author = input.seo?.articleAuthor;
  return {
    "@context": "https://schema.org",
    "@type": input.type,
    headline: plainText(fillYear(input.seo)?.metaTitle || input.headline, 110),
    description: plainText(fillYear(input.seo)?.metaDescription || input.description) || undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(image ? { image: [image] } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author: author ? { "@type": "Person", name: author } : { "@type": "Organization", name: settings.siteTitle, url: `${base}/` },
    publisher: { "@type": "Organization", name: settings.siteTitle, ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}) },
  };
}
