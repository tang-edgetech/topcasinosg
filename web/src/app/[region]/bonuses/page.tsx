import type { Metadata } from "next";
import { getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu, regionMenuLabel } from "../_lib/pageMenu";
import { getPage } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/bonuses — the "bonuses" hub page, a real child of the region
 * root page in the Pages tree (see api/internal/db/migrations/
 * 0032_nest_bonus_type_pages.sql). All content below the intro is
 * CMS-authored (Figma "D / Country / TH / Bonuses": types grid, Top Bonus
 * Picks, the six per-type bonus tables, How to Claim, Bonuses to Avoid,
 * calculator, FAQs) via SectionRenderer - the live Bonus/Casino data comes
 * in through the top_bonus_picks and bonus_listing_table blocks, not a
 * bespoke grid on this route.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const result = await getPage(`${region}/bonuses`);
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function RegionBonusesPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [regionData, result] = await Promise.all([getActiveRegionByCode(region), getPage(`${region}/bonuses`)]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const intro = (
    <IntroductionSection
      heading={`Best Online Casino Bonuses in ${regionName} 2025`}
      highlightText={`${regionName} 2025`}
      subheading="Top Casino Verified"
      paragraph="<p>If you want more value for your money, you're in the right place. Whether you're new to online casinos or a seasoned high-roller, this expert guide highlights the best casino bonuses of 2025 which feature verified platforms offering no-deposit deals, free spins, cashback rewards, and high-value welcome packages.</p>"
      pageMenu={buildPageMenu(region, regionMenuLabel(regionName), "bonuses")}
    />
  );

  return (
    <div id="region-bonuses-page" className="region-bonuses flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {intro}
        {result && result.sections.length > 0 && <SectionRenderer sections={result.sections} />}
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
