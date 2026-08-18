import { getBlacklistEntries, getActiveRegionByCode } from "../_lib/api";
import { buildPageMenu } from "../_lib/pageMenu";
import IntroductionSection from "@/components/IntroductionSection";

export default async function RegionBlacklistPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const [{ entries }, regionData] = await Promise.all([getBlacklistEntries(region), getActiveRegionByCode(region)]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const intro = (
    <IntroductionSection
      heading={`Blacklisted Online Casinos in ${regionName}`}
      highlightText="Blacklisted"
      subheading="Avoid These Scam Sites"
      paragraph={`<p>Operators flagged for withheld withdrawals, rigged games, or fake licences targeting ${regionName} players.</p>`}
      theme="red"
      pageMenu={buildPageMenu(region, `${regionName} 2025`, "blacklist")}
    />
  );

  if (entries.length === 0) {
    return (
      <div id="region-blacklist-page" className="region-blacklist flex flex-col">
        {intro}
        <div className="py-14">
          <h2 className="mb-4 text-xl font-semibold text-primary-900">Blacklist</h2>
          <p className="region-blacklist__empty text-sm text-primary-500">
            No casinos are currently blacklisted for this region.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="region-blacklist-page" className="region-blacklist flex flex-col">
      {intro}
      <div className="flex flex-col gap-6 py-14">
      <h2 className="text-xl font-semibold text-primary-900">Blacklist</h2>

      <ul className="region-blacklist__list flex flex-col gap-4">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="region-blacklist-entry rounded-lg border border-danger/30 bg-surface-muted p-6"
          >
            <h3 className="region-blacklist-entry__name text-base font-semibold text-primary-900">
              {entry.name}
            </h3>
            <p className="region-blacklist-entry__reason mt-1 text-sm font-semibold text-danger">
              {entry.reason}
            </p>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
