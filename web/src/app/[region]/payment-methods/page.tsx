import type { Metadata } from "next";
import { cmsPageMetadata } from "@/lib/seo";
import { getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu, regionMenuLabel } from "../_lib/pageMenu";
import { getPage } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";
import IntroductionSectionBlock from "@/components/sections/IntroductionSectionBlock";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/payment-methods — a real "payment-methods" page nested under
 * each region root page in the Pages tree (see api/internal/db/migrations/
 * 0033_nest_payment_methods_pages.sql), same pattern as the "bonuses" hub
 * (see /{region}/bonuses/page.tsx). All content below the intro is
 * CMS-authored (Most Trusted Payment Methods, Fees & Limits, How to
 * Deposit/Withdraw, Security Standards, FAQs, ...) via SectionRenderer -
 * there's no bespoke live-data grid on this route.
 *
 * Wrapped in PageGrid (unlike its /{region}/bonuses, /rtp, /guides,
 * /blacklist siblings) so `--primary-w` - which every page assumes is offset
 * for a real Sidebar (see shared/theme/sections.css) - actually matches the
 * rendered width here instead of squeezing content to a phantom reservation.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const result = await getPage(`${region}/payment-methods`);
  if (!result) return {};

  return cmsPageMetadata(result.page, `/${region}/payment-methods`);
}

export default async function RegionPaymentMethodsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [regionData, result] = await Promise.all([getActiveRegionByCode(region), getPage(`${region}/payment-methods`)]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const pageMenu = buildPageMenu(region, regionMenuLabel(regionName), "payment-methods");
  const sections = (result?.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const introSection = sections[0]?.blockType === "introduction_section" ? sections[0] : null;
  const bodySections = introSection ? sections.slice(1) : sections;

  const intro = introSection ? (
    <IntroductionSectionBlock section={introSection} fallbackPageMenu={pageMenu} />
  ) : (
    <IntroductionSection
      heading={`Online Casino Payment Methods in ${regionName}`}
      highlightText={regionName}
      subheading="Secure Deposit & Withdrawal"
      paragraph={`<p>When it comes to online gambling, having secure, fast, and convenient payment options is just as important as choosing the right casino. This guide breaks down the top payment methods available to players in ${regionName}, helping you deposit and withdraw with confidence.</p>`}
      pageMenu={pageMenu}
    />
  );

  return (
    <div id="region-payment-methods-page" className="region-payment-methods flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {intro}
        {bodySections.length > 0 && <SectionRenderer sections={bodySections} regionCode={region} />}
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
