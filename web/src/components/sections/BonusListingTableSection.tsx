import type { CSSProperties } from "react";
import Link from "next/link";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getBonuses, getCasinos, type BonusType } from "@/app/[region]/_lib/api";

// Mirrors api/internal/service/pagination.go's maxPageSize — passed
// explicitly so the casino cross-reference fetch below covers every
// published casino in the region (for cross-referencing by id), not just
// the API's default first-25-by-rating page, which silently dropped the
// Brand/Claim link for any casino ranked 26th or lower.
const MAX_CASINOS_FOR_LOOKUP = 200;

// Async server component — unlike every other section (rendered purely from
// its own field data), this one fetches live Bonus/Casino data at render
// time using the admin-configured regionCode/bonusType/limit. Reuses the
// same getBonuses/getCasinos helpers the sibling /[region]/reviews page
// uses, rather than hand-rolling parallel fetch logic. Table columns are
// Brand/Bonus/Terms/Code only — Wagering Requirement and Min Deposit aren't
// separate structured fields on Bonus (just embedded in `terms` as free
// text), so showing them as their own columns would mean fabricating
// numbers that don't exist in the data.
export default async function BonusListingTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue ?? "";
  const bonusType = (field(section.fields, 0, "bonusType")?.textValue || "welcome") as BonusType;
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

  const [bonuses, casinos] = await Promise.all([
    getBonuses(regionCode, bonusType, limit),
    getCasinos(regionCode, undefined, MAX_CASINOS_FOR_LOOKUP),
  ]);
  const casinoById = new Map(casinos.map((c) => [c.id, c]));

  return (
    <section id={section.customId || undefined} className={sectionClasses} style={bgStyle as CSSProperties}>
      <div className="section-container relative z-10 flex flex-col gap-4 py-16">
        <div className="section-row">
          <div className="section-col">
            {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
          </div>
        </div>
        <div className="section-row">
          <div className="section-col w-full overflow-x-auto rounded-lg border border-primary-100">
            {bonuses.length === 0 ? (
              <p className="p-4 text-sm text-primary-500">No bonuses published for this region/type yet.</p>
            ) : (
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-primary-900 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Brand</th>
                    <th className="px-4 py-3 font-semibold">Bonus</th>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map((bonus) => {
                    const casino = bonus.casinoId ? casinoById.get(bonus.casinoId) : undefined;
                    return (
                      <tr key={bonus.id} className="border-t border-primary-100">
                        <td className="px-4 py-3 font-medium text-primary-900">
                          {casino ? (
                            <Link href={`/casinos/${casino.slug}`} className="cursor-pointer hover:text-secondary-600 hover:underline">
                              {casino.name}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-primary-600">
                          <div className="font-semibold text-primary-900">{bonus.title}</div>
                          <div className="text-xs">{bonus.terms}</div>
                        </td>
                        <td className="px-4 py-3 text-primary-600">{bonus.code ?? "—"}</td>
                        <td className="px-4 py-3">
                          {casino && (
                            <Link
                              href={`/casinos/${casino.slug}`}
                              className="cursor-pointer rounded-md bg-secondary-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-900 hover:bg-secondary-700"
                            >
                              Claim Here
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
