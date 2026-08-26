import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import IntroductionSectionBlock from "@/components/sections/IntroductionSectionBlock";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";
import { getActiveRegionByCode, getBonuses, getGuides, getPaymentMethods, getRtpEntries } from "./_lib/api";

/**
 * /{region} — region home page. Pages-CMS-driven, looked up by slug =
 * region code (e.g. "th"), same pattern as the Homepage/Calculator (see
 * app/page.tsx, app/calculator/page.tsx). Falls back to a bare stat-card
 * overview for any region that doesn't have a page authored yet.
 *
 * This is also where any brand-new top-level hierarchical Pages CMS page
 * (e.g. "/about") actually renders — [region]/layout.tsx defers 404ing on
 * an invalid region code for exactly this bare-path case, since it's the
 * only route a 1-segment URL can ever reach (see that file's comment). So
 * "region" here isn't necessarily a real region: a CMS page match wins
 * first regardless, and only once neither a CMS page nor a real region
 * matches does this finally 404 (`getActiveRegionByCode` re-checked here
 * rather than trusted from layout, since layout intentionally skipped it).
 */

interface RegionPageParams {
  region: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RegionPageParams>;
}): Promise<Metadata> {
  const { region } = await params;
  const result = await getPage(region);
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function RegionOverviewPage({
  params,
}: {
  params: Promise<RegionPageParams>;
}) {
  const { region } = await params;
  const result = await getPage(region);

  if (result && result.sections.length > 0) {
    const ordered = result.sections.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const [first, ...rest] = ordered;
    const hasIntro = first?.blockType === "introduction_section";

    return (
      <div id="region-overview-page" className="region-overview flex flex-1 flex-col">
        <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />
        <PageGrid>
          {hasIntro && <IntroductionSectionBlock section={first} />}
          <SectionRenderer sections={hasIntro ? rest : ordered} />
        </PageGrid>
        <RawHtmlBlock html={result.page.footerSnippet} />
      </div>
    );
  }

  const regionData = await getActiveRegionByCode(region);
  if (!regionData) {
    notFound();
  }

  return <FallbackOverview region={region} />;
}

interface OverviewCard {
  label: string;
  description: string;
  href: string;
  count: number;
}

// Used only for regions with no Pages-CMS content authored yet.
async function FallbackOverview({ region }: { region: string }) {
  const [bonuses, paymentMethods, rtpEntries, guides] = await Promise.all([
    getBonuses(region),
    getPaymentMethods(region),
    getRtpEntries(region),
    getGuides(region),
  ]);

  const cards: OverviewCard[] = [
    {
      label: "Bonuses",
      description: "Welcome offers, free spins, cashback and more.",
      href: `/${region}/bonuses`,
      count: bonuses.length,
    },
    {
      label: "Payment Methods",
      description: "Deposit and withdrawal options accepted in this region.",
      href: `/${region}/payment-methods`,
      count: paymentMethods.length,
    },
    {
      label: "RTP",
      description: "Return-to-player percentages for popular games.",
      href: `/${region}/rtp`,
      count: rtpEntries.length,
    },
    {
      label: "Guides",
      description: "How-to guides and tips for players in this region.",
      href: `/${region}/guides`,
      count: guides.length,
    },
  ];

  return (
    <PageGrid>
      <div id="region-overview-page" className="region-overview flex flex-col gap-8 py-10">
        <p className="region-overview__intro max-w-3xl text-base text-primary-600">
          Everything you need to play safely and get the most value in this region — the
          latest bonuses, accepted payment methods, verified RTP figures, and player guides,
          all in one place.
        </p>

        <div className="region-overview__cards grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="region-overview-card flex cursor-pointer flex-col gap-2 rounded-lg border border-primary-100 bg-surface-muted p-6 transition-colors hover:border-secondary-600"
            >
              <span className="region-overview-card__count text-3xl font-bold text-primary-900">
                {card.count}
              </span>
              <span className="region-overview-card__label text-sm font-semibold text-primary-900">
                {card.label}
              </span>
              <span className="region-overview-card__description text-xs text-primary-500">
                {card.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </PageGrid>
  );
}
