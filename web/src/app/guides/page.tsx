import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import IntroductionSection from "@/components/IntroductionSection";
import PageGrid from "@/components/PageGrid";
import Thumbnail from "@/components/Thumbnail";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/guides",
    title: "Casino Guides | Top Casino SG",
    description: "Independently written guides covering game rules, bonus terms, and strategy for online casino players.",
  });
}

/**
 * Public guides list — all published guides (global or region-scoped),
 * mixed together in one grid. Each card shows the guide's cover, or the
 * placeholder image when none is set.
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

interface GuidesApiResponse {
  success: boolean;
  data?: {
    guides?: GuideDTO[];
    total?: number;
  };
}

interface RegionsApiResponse {
  success: boolean;
  data?: {
    regions?: RegionDTO[];
  };
}

async function getGuides(): Promise<GuideDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/guides`, {
      // Guides can move from "scheduled" to "published" the moment their
      // publishAt time passes (computed live, no cron) — keep this short-lived.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as GuidesApiResponse;
    return Array.isArray(body.data?.guides) ? body.data.guides : [];
  } catch {
    // Public API may be unreachable during build — degrade to empty list.
    return [];
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


export default async function GuidesPage() {
  const [guides, regions] = await Promise.all([getGuides(), getRegions()]);
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));

  return (
    <div id="guides-page" className="flex flex-1 flex-col bg-surface font-sans">
      <PageGrid>
      <IntroductionSection
        heading="Casino Guides"
        highlightText="Guides"
        subheading="Learn the Games, Bonuses, and Strategy"
        paragraph="<p>Independently written guides covering game rules, bonus terms, and strategy for online casino players.</p>"
      />
      <section id="guides-list" className="guides-page__list w-full py-12">
        {guides.length === 0 ? (
          <p
            id="guides-empty-state"
            className="guides-page__empty rounded-lg border border-primary-100 bg-surface-muted px-6 py-16 text-center text-base text-primary-500"
          >
            No guides published yet.
          </p>
        ) : (
          <div
            id="guides-grid"
            className="guides-page__grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {guides.map((guide) => {
              const regionName = guide.regionId != null ? regionNameById.get(guide.regionId) : null;

              return (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="guide-card group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-primary-100 bg-surface shadow-sm transition-shadow hover:shadow-md"
                >
                  <Thumbnail src={guide.coverUrl} className="guide-card__cover aspect-[31/22] w-full rounded-t-lg" />
                  <div className="guide-card__body flex flex-1 flex-col gap-2 p-5">
                    {regionName && (
                      <span className="guide-card__region-badge inline-flex w-fit items-center rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-800">
                        {regionName}
                      </span>
                    )}
                    <h2 className="guide-card__title text-lg font-semibold text-primary-900 group-hover:text-primary-700">
                      {guide.title}
                    </h2>
                    <p className="guide-card__excerpt line-clamp-3 text-sm text-primary-600">
                      {guide.excerpt}
                    </p>
                    <span className="guide-card__read-more mt-auto pt-2 text-sm font-semibold text-secondary-700 group-hover:underline">
                      Read guide &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      </PageGrid>
    </div>
  );
}
