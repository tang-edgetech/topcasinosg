import type { Metadata } from "next";
import { getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu } from "../_lib/pageMenu";
import { getPage } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/rtp — a real "rtp" page nested under each region root page in
 * the Pages tree (see api/internal/db/migrations/
 * 0035_nest_rtp_guides_blacklist_pages.sql), same pattern as the
 * "payment-methods"/"bonuses" hubs. All content below the intro is
 * CMS-authored (Top RTP game carousels, how-the-tracker-works copy, the
 * live Bonus Tracker table, watch-outs, suggestions, FAQs, ...) via
 * SectionRenderer - there's no bespoke live-data RTP table on this route
 * (see Figma "D / Country / TH / RTP", which replaces the older plain
 * game/category/RTP% grid with curated carousels and a live bonus table).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const result = await getPage(`${region}/rtp`);
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function RegionRtpPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [regionData, result] = await Promise.all([getActiveRegionByCode(region), getPage(`${region}/rtp`)]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const intro = (
    <IntroductionSection
      heading={`${regionName} Real-Time RTP & Live Casino Bonus Trackers`}
      highlightText="Real-Time RTP"
      subheading="Top Casino Updated"
      paragraph={`<p>Want to play smarter and win more? We give you access to real-time RTP stats and live casino bonus updates tailored just for players in ${regionName}. Whether you're chasing high-payout slots or exclusive limited-time offers, this is your go-to hub.</p>`}
      pageMenu={buildPageMenu(region, `${regionName} 2025`, "rtp")}
    />
  );

  return (
    <div id="region-rtp-page" className="region-rtp flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {intro}
        {result && result.sections.length > 0 && <SectionRenderer sections={result.sections} />}
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
