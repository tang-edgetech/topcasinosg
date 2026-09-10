import type { Metadata } from "next";
import Link from "next/link";
import { getGuides, getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu } from "../_lib/pageMenu";
import { getPage } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/guides — a real "guides" page nested under each region root
 * page in the Pages tree (see api/internal/db/migrations/
 * 0035_nest_rtp_guides_blacklist_pages.sql), same pattern as the
 * "payment-methods"/"bonuses" hubs. The live Guides grid below is core data
 * and always renders; CMS sections authored on the hub page layer on top.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const result = await getPage(`${region}/guides`);
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function RegionGuidesPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [guides, regionData, result] = await Promise.all([
    getGuides(region),
    getActiveRegionByCode(region),
    getPage(`${region}/guides`),
  ]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const intro = (
    <IntroductionSection
      heading={`How to Play: ${regionName} Casino Guides`}
      highlightText={regionName}
      subheading="Learn the Games, Strategy, and Local Know-How"
      paragraph={`<p>Step-by-step guides written for ${regionName} players — game rules, bankroll management, and how to spot a trustworthy operator.</p>`}
      pageMenu={buildPageMenu(region, `${regionName} 2025`, "guides")}
    />
  );

  return (
    <div id="region-guides-page" className="region-guides flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {intro}
        <div className="flex flex-col gap-6 py-14">
          <h2 className="text-xl font-semibold text-primary-900">Guides</h2>

          {guides.length === 0 ? (
            <p className="region-guides__empty text-sm text-primary-500">No guides available for this region yet.</p>
          ) : (
            <div className="region-guides__grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="region-guide-card flex cursor-pointer flex-col gap-2 rounded-lg border border-primary-100 bg-surface-muted p-6 transition-colors hover:border-secondary-600"
                >
                  <h3 className="region-guide-card__title text-base font-semibold text-primary-900">{guide.title}</h3>
                  <p className="region-guide-card__excerpt text-sm text-primary-600">{guide.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {result && result.sections.length > 0 && <SectionRenderer sections={result.sections} />}
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
