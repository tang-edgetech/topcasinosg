import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { articleJsonLd, buildMetadata, getSeoMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Thumbnail from "@/components/Thumbnail";

/**
 * Public guide detail page. Content is scheduled-publish aware: the API
 * computes visibility live at read-time, so this page must not be fully
 * static — every fetch uses a short revalidate window.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

interface GuideDTO {
  id: number;
  regionId: number | null;
  title: string;
  slug: string;
  coverMediaId: number | null;
  coverUrl?: string | null;
  excerpt: string;
  content: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RegionDTO {
  id: number;
  code: string;
  name: string;
}

interface GuideApiResponse {
  success: boolean;
  data?: {
    guide?: GuideDTO;
  };
}

interface RegionsApiResponse {
  success: boolean;
  data?: {
    regions?: RegionDTO[];
  };
}

async function getGuide(slug: string): Promise<GuideDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/guides/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as GuideApiResponse;
    if (!body.success || !body.data?.guide) {
      return null;
    }

    return body.data.guide;
  } catch {
    return null;
  }
}

async function getRegions(): Promise<RegionDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/regions`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as RegionsApiResponse;
    return Array.isArray(body.data?.regions) ? body.data.regions : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};
  return buildMetadata({
    path: `/guides/${guide.slug}`,
    title: `${guide.title} | Top Casino SG`,
    description: guide.excerpt,
    image: guide.coverUrl,
    seo: await getSeoMeta("guide", guide.id),
    type: "article",
    article: { publishedTime: guide.publishAt ?? guide.createdAt, modifiedTime: guide.updatedAt, section: "Guides" },
  });
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    notFound();
  }

  const regions = guide.regionId != null ? await getRegions() : [];
  const regionName =
    guide.regionId != null ? regions.find((region) => region.id === guide.regionId)?.name : null;

  const jsonLd = await articleJsonLd({
    type: "Article",
    path: `/guides/${guide.slug}`,
    headline: guide.title,
    description: guide.excerpt,
    image: guide.coverUrl,
    datePublished: guide.publishAt ?? guide.createdAt,
    dateModified: guide.updatedAt,
    seo: await getSeoMeta("guide", guide.id),
  });

  return (
    <div id="guide-detail-page" className="flex flex-1 flex-col bg-surface font-sans">
      <JsonLd data={jsonLd} />
      <section
        id="guide-detail-breadcrumb"
        className="guide-detail__breadcrumb border-b border-primary-100 bg-primary-50"
      >
        <div className="mx-auto w-full max-w-4xl px-6 py-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-primary-500">
            <Link href="/" className="cursor-pointer hover:text-primary-700 hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/guides" className="cursor-pointer hover:text-primary-700 hover:underline">
              Guides
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-primary-900" aria-current="page">
              {guide.title}
            </span>
          </nav>
        </div>
      </section>

      <article id="guide-detail-article" className="guide-detail__article mx-auto w-full max-w-4xl px-6 py-12">
        <header id="guide-detail-header" className="guide-detail__header flex flex-col gap-4">
          {regionName && (
            <span className="guide-detail__region-badge inline-flex w-fit items-center rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-800">
              {regionName}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            {guide.title}
          </h1>
          {guide.excerpt && (
            <p className="guide-detail__excerpt text-lg font-medium text-primary-600">
              {guide.excerpt}
            </p>
          )}
        </header>

        <Thumbnail src={guide.coverUrl} alt={guide.title} className="guide-detail__cover mt-8 h-56 w-full rounded-lg sm:h-80" />

        <div
          id="guide-detail-content"
          className="guide-detail__content rich-text-content mt-8 whitespace-pre-line text-base leading-relaxed text-primary-900"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(guide.content) }}
        />

        <div id="guide-detail-back-link" className="guide-detail__back mt-12 border-t border-primary-100 pt-6">
          <Link
            href="/guides"
            className="cursor-pointer text-sm font-semibold text-secondary-700 hover:underline"
          >
            &larr; Back to Guides
          </Link>
        </div>
      </article>
    </div>
  );
}
