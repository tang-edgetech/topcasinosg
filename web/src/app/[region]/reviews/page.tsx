import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu, regionMenuLabel } from "../_lib/pageMenu";
import { getRegionPage } from "../_lib/regionPage";
import IntroductionSectionBlock from "@/components/sections/IntroductionSectionBlock";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/reviews (Figma "D / Country / TH / Reviews"). Content comes from
 * the region's own Pages CMS page when it has sections, otherwise from the
 * shared region-template/reviews page with the region placeholders filled
 * (see _lib/regionPage.ts). The live blocks — Top-Rated cards, casino list,
 * blacklist slider, game finder — follow the page's region.
 */

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const regionData = await getActiveRegionByCode(region);
  const result = regionData ? await getRegionPage(regionData, "reviews") : null;
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function RegionReviewsPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const regionData = await getActiveRegionByCode(region);
  if (!regionData) notFound();

  const result = await getRegionPage(regionData, "reviews");
  const sections = (result?.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const [first, ...rest] = sections;
  const hasIntro = first?.blockType === "introduction_section";
  const pageMenu = buildPageMenu(region, regionMenuLabel(regionData.name), "reviews");

  return (
    <div id="region-reviews-page" className="region-reviews flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {hasIntro && <IntroductionSectionBlock section={first} fallbackPageMenu={pageMenu} />}
        <SectionRenderer sections={hasIntro ? rest : sections} regionCode={region} />
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
