import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanitizeRichText } from "@/lib/sanitize-html";

/**
 * Public bonus detail page (/bonuses/{slug}) — mirrors the Guide detail page
 * (web/src/app/guides/[slug]/page.tsx): global route, not region-scoped by
 * URL, even though a Bonus always carries a regionId. Content is
 * scheduled-publish aware, so every fetch uses a short revalidate window.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

interface BonusDTO {
  id: number;
  regionId: number;
  casinoId: number | null;
  bonusType: string;
  title: string;
  slug: string;
  terms: string;
  code: string | null;
  validFrom: string | null;
  validUntil: string | null;
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

interface BonusApiResponse {
  success: boolean;
  data?: {
    bonus?: BonusDTO;
  };
}

interface RegionsApiResponse {
  success: boolean;
  data?: {
    regions?: RegionDTO[];
  };
}

async function getBonus(slug: string): Promise<BonusDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bonuses/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as BonusApiResponse;
    if (!body.success || !body.data?.bonus) {
      return null;
    }

    return body.data.bonus;
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

function titleCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-SG", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bonus = await getBonus(slug);
  if (!bonus) return {};

  return {
    title: bonus.title,
    description: bonus.terms.slice(0, 160),
  };
}

export default async function BonusDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bonus = await getBonus(slug);

  if (!bonus) {
    notFound();
  }

  const regions = await getRegions();
  const regionName = regions.find((region) => region.id === bonus.regionId)?.name ?? null;
  const validFrom = formatDate(bonus.validFrom);
  const validUntil = formatDate(bonus.validUntil);

  return (
    <div id="bonus-detail-page" className="flex flex-1 flex-col bg-surface font-sans">
      <section
        id="bonus-detail-breadcrumb"
        className="bonus-detail__breadcrumb border-b border-primary-100 bg-primary-50"
      >
        <div className="mx-auto w-full max-w-4xl px-6 py-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-primary-500">
            <Link href="/" className="cursor-pointer hover:text-primary-700 hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-primary-900" aria-current="page">
              {bonus.title}
            </span>
          </nav>
        </div>
      </section>

      <article id="bonus-detail-article" className="bonus-detail__article mx-auto w-full max-w-4xl px-6 py-12">
        <header id="bonus-detail-header" className="bonus-detail__header flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bonus-detail__type-badge inline-flex w-fit items-center rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-800">
              {titleCase(bonus.bonusType)}
            </span>
            {regionName && (
              <span className="bonus-detail__region-badge inline-flex w-fit items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
                {regionName}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">{bonus.title}</h1>
          {bonus.code && (
            <p className="bonus-detail__code text-sm font-semibold text-primary-600">
              Bonus Code: <span className="font-mono">{bonus.code}</span>
            </p>
          )}
          {(validFrom || validUntil) && (
            <p className="bonus-detail__validity text-sm text-primary-500">
              Valid {validFrom ? `from ${validFrom}` : ""} {validUntil ? `until ${validUntil}` : ""}
            </p>
          )}
        </header>

        <div
          id="bonus-detail-terms"
          className="bonus-detail__terms rich-text-content mt-8 whitespace-pre-line text-base leading-relaxed text-primary-900"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(bonus.terms) }}
        />

        <div id="bonus-detail-back-link" className="bonus-detail__back mt-12 border-t border-primary-100 pt-6">
          <Link href="/" className="cursor-pointer text-sm font-semibold text-secondary-700 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </article>
    </div>
  );
}
