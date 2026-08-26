import type { CSSProperties } from "react";
import Link from "next/link";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getRegions, getCasinos, type CasinoDTO } from "@/app/[region]/_lib/api";

// "Top Rated Casino of the Month by Country" — for every active region,
// fetches that region's casinos (GET /api/casinos?region=X, already sorted
// by rating desc) and splits them into `highlightCount` highlight cards +
// the next `moreCount` in a table, per the confirmed ranking rule ("top" =
// highest rating, fully automatic — no admin curation).
//
// An optional regionCode narrows this to a single region and switches to
// "highlight only" mode (no per-region table, no heading, no "See all"
// link) — used on /{region} pages ("Most Popular Online Casinos Among Thai
// Players") where a separate casino_comparison_table section already covers
// the full ranked list.
export default async function TopCasinosByRegionSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const highlightCount = Number(field(section.fields, 0, "highlightCount")?.textValue) || 3;
  const moreCount = Number(field(section.fields, 0, "moreCount")?.textValue) || 5;
  const onlyRegionCode = field(section.fields, 0, "regionCode")?.textValue || undefined;

  const allRegions = (await getRegions()).filter((r) => r.isActive);
  const regions = onlyRegionCode ? allRegions.filter((r) => r.code === onlyRegionCode) : allRegions;
  if (regions.length === 0) return null;

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const sectionClasses = sectionClassName(hasBleedBg ? "section--top-casinos-by-region section--bg" : "section--top-casinos-by-region", section);

  if (onlyRegionCode) {
    const casinos = await getCasinos(onlyRegionCode, undefined, highlightCount);
    if (casinos.length === 0) return null;
    return (
      <section id={section.customId || undefined} className={sectionClasses} style={bgStyle as CSSProperties}>
        <div className="section-container relative z-10 flex flex-col gap-6 py-16">
          {heading && (
            <div className="section-row">
              <div className="section-col text-center">
                <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>
              </div>
            </div>
          )}
          <div className="section-row grid grid-cols-1 gap-4 sm:grid-cols-3">
            {casinos.map((casino) => (
              <CasinoHighlightCard key={casino.id} casino={casino} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const perRegionCasinos = await Promise.all(
    regions.map((region) => getCasinos(region.code, undefined, highlightCount + moreCount)),
  );

  return (
    <section id={section.customId || undefined} className={sectionClasses} style={bgStyle as CSSProperties}>
      <div className="section-container relative z-10 flex flex-col gap-12 py-16">
        {heading && (
          <div className="section-row">
            <div className="section-col text-center">
              <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}

        {regions.map((region, i) => {
          const casinos = perRegionCasinos[i];
          if (casinos.length === 0) return null;
          const highlights = casinos.slice(0, highlightCount);
          const more = casinos.slice(highlightCount, highlightCount + moreCount);

          return (
            <div key={region.id} className="section-row flex flex-col gap-4">
              <h3 className="text-lg font-bold text-primary-900">More Online Casinos in {region.name}</h3>

              {highlights.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {highlights.map((casino) => (
                    <CasinoHighlightCard key={casino.id} casino={casino} />
                  ))}
                </div>
              )}

              {more.length > 0 && (
                <div className="w-full overflow-x-auto rounded-lg border border-primary-100">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="bg-primary-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Brand</th>
                        <th className="px-4 py-3 font-semibold">Rating</th>
                        <th className="px-4 py-3 font-semibold">Safe Index</th>
                        <th className="px-4 py-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {more.map((casino) => (
                        <tr key={casino.id} className="border-t border-primary-100">
                          <td className="px-4 py-3 font-medium text-primary-900">
                            <Link href={`/casinos/${casino.slug}`} className="cursor-pointer hover:text-secondary-600 hover:underline">
                              {casino.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-primary-600">{casino.rating.toFixed(1)}</td>
                          <td className="px-4 py-3 text-primary-600">{casino.safeIndex ?? "—"}</td>
                          <td className="px-4 py-3">
                            <a
                              href={casino.ctaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer rounded-md bg-secondary-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-900 hover:bg-secondary-700"
                            >
                              Visit Site
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Link
                href={`/${region.code}/reviews`}
                className="w-fit cursor-pointer text-sm font-semibold text-secondary-600 hover:underline"
              >
                See all {region.name} reviews &rarr;
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CasinoHighlightCard({ casino }: { casino: CasinoDTO }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-primary-100 bg-surface-muted p-5 text-center">
      <h4 className="text-base font-bold text-primary-900">{casino.name}</h4>
      <span className="text-2xl font-bold text-secondary-600">{casino.rating.toFixed(1)}</span>
      {casino.safeIndex !== null && <span className="text-xs text-primary-500">Safe Index {casino.safeIndex}</span>}
      <a
        href={casino.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 w-full cursor-pointer rounded-md bg-secondary-600 px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-secondary-700"
      >
        Visit Site
      </a>
      <Link href={`/casinos/${casino.slug}`} className="cursor-pointer text-xs font-medium text-primary-600 hover:underline">
        More Info
      </Link>
    </div>
  );
}
