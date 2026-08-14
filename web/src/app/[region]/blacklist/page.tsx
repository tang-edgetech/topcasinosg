import { getBlacklistEntries } from "../_lib/api";

export default async function RegionBlacklistPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const { entries } = await getBlacklistEntries(region);

  if (entries.length === 0) {
    return (
      <div id="region-blacklist-page" className="region-blacklist">
        <h2 className="mb-4 text-xl font-semibold text-primary-900">Blacklist</h2>
        <p className="region-blacklist__empty text-sm text-primary-500">
          No casinos are currently blacklisted for this region.
        </p>
      </div>
    );
  }

  return (
    <div id="region-blacklist-page" className="region-blacklist flex flex-col gap-6">
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
  );
}
