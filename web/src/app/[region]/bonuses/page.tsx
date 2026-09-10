import type { Metadata } from "next";
import CopyCodeButton from "../_lib/CopyCodeButton";
import { formatDate, getBonuses, getActiveRegionByCode, toTitleCase } from "../_lib/api";
import { buildPageMenu } from "../_lib/pageMenu";
import { getPage } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/bonuses — the "bonuses" hub page, a real child of the region
 * root page in the Pages tree (see api/internal/db/migrations/
 * 0032_nest_bonus_type_pages.sql). Same merge pattern as
 * /{region}/payment-methods: the live Bonuses grid below is core data and
 * always renders; CMS sections authored on the hub page layer on top of it.
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
  const [bonuses, regionData, result] = await Promise.all([
    getBonuses(region),
    getActiveRegionByCode(region),
    getPage(`${region}/bonuses`),
  ]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const intro = (
    <IntroductionSection
      heading={`${regionName} Online Casino Bonuses`}
      highlightText={regionName}
      subheading="Claim the Best Real-Money Offers"
      paragraph={`<p>Every bonus listed here is scored for ${regionName} players — compare wagering requirements and terms before you claim, or use the Bonus Calculator on each bonus page to check your real payout.</p>`}
      pageMenu={buildPageMenu(region, `${regionName} 2025`, "bonuses")}
    />
  );

  return (
    <div id="region-bonuses-page" className="region-bonuses flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {intro}
        <div className="flex flex-col gap-6 py-14">
          <h2 className="text-xl font-semibold text-primary-900">Bonuses</h2>

          {bonuses.length === 0 ? (
            <p className="region-bonuses__empty text-sm text-primary-500">
              No bonuses available for this region yet.
            </p>
          ) : (
            <div className="region-bonuses__list grid grid-cols-1 gap-4 lg:grid-cols-2">
              {bonuses.map((bonus) => {
                const validFrom = formatDate(bonus.validFrom);
                const validUntil = formatDate(bonus.validUntil);
                const hasValidityRange = validFrom || validUntil;

                return (
                  <article
                    key={bonus.id}
                    className="region-bonus-card flex flex-col gap-3 rounded-lg border border-primary-100 bg-surface-muted p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="region-bonus-card__title text-lg font-semibold text-primary-900">
                        {bonus.title}
                      </h3>
                      <span className="region-bonus-card__type shrink-0 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-900">
                        {toTitleCase(bonus.bonusType)}
                      </span>
                    </div>

                    <p className="region-bonus-card__terms text-sm text-primary-600">{bonus.terms}</p>

                    {hasValidityRange && (
                      <p className="region-bonus-card__validity text-xs text-primary-500">
                        Valid {validFrom ? `from ${validFrom}` : ""}
                        {validFrom && validUntil ? " " : ""}
                        {validUntil ? `until ${validUntil}` : ""}
                      </p>
                    )}

                    {bonus.code && (
                      <div className="region-bonus-card__code-row flex items-center gap-2">
                        <span className="text-xs font-medium text-primary-500">Code:</span>
                        <CopyCodeButton code={bonus.code} />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {result && result.sections.length > 0 && <SectionRenderer sections={result.sections} />}
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
