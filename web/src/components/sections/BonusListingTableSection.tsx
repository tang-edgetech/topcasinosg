import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import {
  getBonuses,
  getCasinos,
  getGameProviders,
  type BonusDTO,
  type BonusType,
  type GameProviderDTO,
} from "@/app/[region]/_lib/api";

// Mirrors api/internal/service/pagination.go's maxPageSize — passed
// explicitly so the casino cross-reference fetch below covers every
// published casino in the region (for cross-referencing by id), not just
// the API's default first-25-by-rating page, which silently dropped the
// Brand/Claim link for any casino ranked 26th or lower.
const MAX_CASINOS_FOR_LOOKUP = 200;

type CellRenderer = (bonus: BonusDTO, providers: Map<number, GameProviderDTO>) => ReactNode;

interface TypedColumn {
  label: string;
  render: CellRenderer;
}

interface TypedLayout {
  columns: TypedColumn[];
  ctaLabel: string;
}

const text = (value: string): ReactNode => value || "—";

const detailsColumn = (label: string): TypedColumn => ({ label, render: (b) => b.title });
const turnoverColumn: TypedColumn = { label: "Turnover Requirement", render: (b) => text(b.turnoverRequirement) };
const minDepositColumn: TypedColumn = { label: "Minimum Deposit", render: (b) => text(b.minDeposit) };

// Figma "D / Country / TH / Bonuses": each bonus type's table compares a
// different set of structured values (see domain.BonusDetails and admin's
// BonusForm DETAIL_FIELDS_BY_TYPE, which edits exactly these).
const TYPED_LAYOUTS: Record<BonusType, TypedLayout> = {
  no_deposit: {
    columns: [
      detailsColumn("No Deposit Bonus Details"),
      turnoverColumn,
      { label: "Max Claim Amount", render: (b) => text(b.maxClaim) },
      { label: "Min Max Withdrawal", render: (b) => text(b.withdrawalLimit) },
    ],
    ctaLabel: "Activate Bonus",
  },
  cashback: {
    columns: [
      detailsColumn("Cashback Details"),
      turnoverColumn,
      { label: "Payment Frequency", render: (b) => text(b.paymentFrequency) },
    ],
    ctaLabel: "Claim Here",
  },
  deposit: {
    columns: [detailsColumn("Deposit Bonus Details"), turnoverColumn, minDepositColumn],
    ctaLabel: "Claim Here",
  },
  welcome: {
    columns: [detailsColumn("Welcome Bonus Details"), turnoverColumn, minDepositColumn],
    ctaLabel: "Activate Offer",
  },
  free_spins: {
    columns: [
      detailsColumn("Free Spin Details"),
      turnoverColumn,
      {
        label: "Eligible Provider",
        render: (b, providers) => {
          const provider = b.eligibleProviderId ? providers.get(b.eligibleProviderId) : undefined;
          if (!provider) return "—";
          // eslint-disable-next-line @next/next/no-img-element
          return provider.logoUrl ? <img loading="lazy" decoding="async" src={mediaUrl(provider.logoUrl) ?? ""} alt={provider.name} className="mx-auto h-8 w-16 object-contain" /> : provider.name;
        },
      },
    ],
    ctaLabel: "Claim Here",
  },
  loyalty_vip: {
    columns: [
      detailsColumn("Top Benefits"),
      { label: "Upgrade Bonus", render: (b) => text(b.upgradeBonus) },
      { label: "Max Rebate", render: (b) => text(b.maxRebate) },
      { label: "Daily Withdrawal Amount", render: (b) => text(b.withdrawalLimit) },
      { label: "Perks", render: (b) => text(b.perks) },
    ],
    ctaLabel: "Claim Here",
  },
};

// Async server component — fetches live Bonus/Casino data at render time
// using the admin-configured regionCode/bonusType/limit. "simple" mode (the
// default, and what every table seeded before typed mode existed uses) is a
// Brand / Bonus Details / Claim layout; "typed" mode switches to the bonus
// type's own comparison columns above.
export default async function BonusListingTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue ?? "";
  const bonusType = (field(section.fields, 0, "bonusType")?.textValue || "welcome") as BonusType;
  const typed = field(section.fields, 0, "columnsMode")?.textValue === "typed";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const sectionClasses = sectionClassName(hasBleedBg ? "section--bonus-listing-table section--bg" : "section--bonus-listing-table", section);

  if (!regionCode) {
    return (
      <section id={section.customId || undefined} className={sectionClasses} style={bgStyle as CSSProperties}>
        <div className="section-container relative z-10 py-16">
          <p className="text-sm text-primary-500">Bonus Listing Table: no region code configured.</p>
        </div>
      </section>
    );
  }

  // Number("0") is 0, a legitimate "hide this table" choice — only fall
  // back to the default when the field is genuinely empty/unset/invalid,
  // not just falsy.
  const limitRaw = field(section.fields, 0, "limit")?.textValue;
  const parsedLimit = limitRaw !== undefined && limitRaw !== "" ? Number(limitRaw) : NaN;
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 5;

  if (limit <= 0) {
    return null;
  }

  const needsProviders = typed && bonusType === "free_spins";
  const [bonuses, casinos, providerList] = await Promise.all([
    getBonuses(regionCode, bonusType, limit),
    getCasinos(regionCode, undefined, MAX_CASINOS_FOR_LOOKUP),
    needsProviders ? getGameProviders() : Promise.resolve([] as GameProviderDTO[]),
  ]);
  const casinoById = new Map(casinos.map((c) => [c.id, c]));
  const providers = new Map(providerList.map((p) => [p.id, p]));

  const layout: TypedLayout = typed
    ? TYPED_LAYOUTS[bonusType]
    : { columns: [{ label: "Bonus Details", render: simpleDetails }], ctaLabel: "Claim Here" };

  return (
    <section id={section.customId || undefined} className={sectionClasses} style={bgStyle as CSSProperties}>
      <div className="section-container relative z-10 flex flex-col gap-4 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-2">
              {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
              {intro && (
                <div
                  className="rich-text-content text-sm leading-relaxed text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
                />
              )}
            </div>
          </div>
        )}
        <div className="section-row">
          <div className="bonus-table section-col w-full overflow-x-auto rounded-lg border border-primary-100">
            {bonuses.length === 0 ? (
              <p className="p-4 text-sm text-primary-500">No bonuses published for this region/type yet.</p>
            ) : (
              <table className="bonus-table__table w-full min-w-[640px] border-collapse text-sm">
                <thead className="bg-primary-900 text-white">
                  <tr>
                    <th className="w-24 border-r border-white/20 px-3 py-3 text-center font-medium">Brand</th>
                    {layout.columns.map((col) => (
                      <th key={col.label} className="border-r border-white/20 px-3 py-3 text-center font-medium">
                        {col.label}
                      </th>
                    ))}
                    <th className="w-40 px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map((bonus) => {
                    const casino = bonus.casinoId ? casinoById.get(bonus.casinoId) : undefined;
                    return (
                      <tr key={bonus.id} className="border-t border-primary-100">
                        <td className="border-r border-primary-100 px-3 py-3 text-primary-900">
                          {casino ? (
                            <Link
                              href={`/casinos/${casino.slug}`}
                              className="flex cursor-pointer flex-col items-center gap-1 text-center hover:text-secondary-600"
                            >
                              {mediaUrl(casino.logoUrl) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img loading="lazy" decoding="async" src={mediaUrl(casino.logoUrl) ?? ""} alt="" className="h-8 w-16 object-contain" />
                              ) : (
                                <div
                                  aria-hidden="true"
                                  className="h-8 w-16 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]"
                                />
                              )}
                              <span className="text-xs whitespace-nowrap">{casino.name}</span>
                            </Link>
                          ) : (
                            <span className="block text-center">—</span>
                          )}
                        </td>
                        {layout.columns.map((col) => (
                          <td key={col.label} className="border-r border-primary-100 px-3 py-3 text-center text-primary-600">
                            {col.render(bonus, providers)}
                          </td>
                        ))}
                        <td className="bonus-table__cta bg-surface-muted px-3 py-3 text-center">
                          {casino && (
                            <Link
                              href={casino.ctaUrl || `/casinos/${casino.slug}`}
                              className="inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-primary-900 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white hover:bg-primary-800"
                            >
                              {layout.ctaLabel}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function simpleDetails(bonus: BonusDTO): ReactNode {
  return (
    <div className="text-left">
      <div className="font-semibold text-primary-900">{bonus.title}</div>
      <div className="text-xs">{bonus.terms}</div>
      {bonus.code && <div className="text-xs">Code: {bonus.code}</div>}
    </div>
  );
}
