import type { Metadata } from "next";
import { cmsPageMetadata } from "@/lib/seo";
import { getBlacklistEntries, getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu, regionMenuLabel } from "../_lib/pageMenu";
import { getPage, sectionBgColorValue } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/blacklist — a real "blacklist" page nested under each region
 * root page in the Pages tree (see api/internal/db/migrations/
 * 0035_nest_rtp_guides_blacklist_pages.sql), same pattern as the
 * "payment-methods"/"bonuses" hubs. The live Blacklist list below is core
 * data and always renders; CMS sections authored on the hub page layer on
 * top.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const result = await getPage(`${region}/blacklist`);
  if (!result) return {};

  return cmsPageMetadata(result.page, `/${region}/blacklist`);
}

export default async function RegionBlacklistPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [{ entries }, regionData, result] = await Promise.all([
    getBlacklistEntries(region),
    getActiveRegionByCode(region),
    getPage(`${region}/blacklist`),
  ]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const intro = (
    <IntroductionSection
      heading={`Blacklisted Online Casinos in ${regionName}`}
      highlightText="Blacklisted"
      subheading="Avoid These Scam Sites"
      paragraph={`<p>Operators flagged for withheld withdrawals, rigged games, or fake licences targeting ${regionName} players.</p>`}
      bgFrom={sectionBgColorValue("primary-900")}
      bgTo={sectionBgColorValue("danger")}
      pageMenu={buildPageMenu(region, regionMenuLabel(regionName), "blacklist")}
    />
  );

  return (
    <div id="region-blacklist-page" className="region-blacklist flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {intro}
        <div className="flex flex-col gap-6 py-14">
          <h2 className="text-xl font-semibold text-primary-900">Blacklist</h2>

          {entries.length === 0 ? (
            <p className="region-blacklist__empty text-sm text-primary-500">
              No casinos are currently blacklisted for this region.
            </p>
          ) : (
            <ul className="region-blacklist__list flex flex-col gap-4">
              {entries.map((entry) => (
                <li key={entry.id} className="region-blacklist-entry rounded-lg border border-danger/30 bg-surface-muted p-6">
                  <h3 className="region-blacklist-entry__name text-base font-semibold text-primary-900">{entry.name}</h3>
                  <p className="region-blacklist-entry__reason mt-1 text-sm font-semibold text-danger">{entry.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {result && result.sections.length > 0 && <SectionRenderer sections={result.sections} regionCode={region} />}
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
