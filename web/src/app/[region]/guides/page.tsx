import Link from "next/link";
import { getGuides, getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu } from "../_lib/pageMenu";
import IntroductionSection from "@/components/IntroductionSection";

export default async function RegionGuidesPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [guides, regionData] = await Promise.all([getGuides(region), getActiveRegionByCode(region)]);
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

  if (guides.length === 0) {
    return (
      <div id="region-guides-page" className="region-guides flex flex-col">
        {intro}
        <div className="py-14">
          <h2 className="mb-4 text-xl font-semibold text-primary-900">Guides</h2>
          <p className="region-guides__empty text-sm text-primary-500">
            No guides available for this region yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="region-guides-page" className="region-guides flex flex-col">
      {intro}
      <div className="flex flex-col gap-6 py-14">
      <h2 className="text-xl font-semibold text-primary-900">Guides</h2>

      <div className="region-guides__grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="region-guide-card flex cursor-pointer flex-col gap-2 rounded-lg border border-primary-100 bg-surface-muted p-6 transition-colors hover:border-secondary-600"
          >
            <h3 className="region-guide-card__title text-base font-semibold text-primary-900">
              {guide.title}
            </h3>
            <p className="region-guide-card__excerpt text-sm text-primary-600">{guide.excerpt}</p>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
