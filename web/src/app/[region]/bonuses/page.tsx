import CopyCodeButton from "../_lib/CopyCodeButton";
import { formatDate, getBonuses, toTitleCase } from "../_lib/api";

export default async function RegionBonusesPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const bonuses = await getBonuses(region);

  if (bonuses.length === 0) {
    return (
      <div id="region-bonuses-page" className="region-bonuses">
        <h2 className="mb-4 text-xl font-semibold text-primary-900">Bonuses</h2>
        <p className="region-bonuses__empty text-sm text-primary-500">
          No bonuses available for this region yet.
        </p>
      </div>
    );
  }

  return (
    <div id="region-bonuses-page" className="region-bonuses flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-primary-900">Bonuses</h2>

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
    </div>
  );
}
