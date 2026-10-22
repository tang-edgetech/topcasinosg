import type { CSSProperties } from "react";
import Link from "next/link";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { getCasinos, getBonuses, type CasinoDTO } from "@/app/[region]/_lib/api";
import StarRating from "@/components/StarRating";

// Figma "Comparison of Thailand Online Casino Ratings": live casino data
// for the region - Brand (logo + name), its first published bonus, RTP,
// crypto support, local banking speed, payout speed and a /10 score with
// stars. Casino.rating is stored out of 5 and shown out of 10 (x2), same as
// TopBonusPicksSection. The table scrolls horizontally on narrow screens.
export default async function CasinoComparisonTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue ?? "";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 5;

  if (!regionCode) return null;

  const [casinos, bonuses] = await Promise.all([getCasinos(regionCode, undefined, limit), getBonuses(regionCode, undefined, 200)]);
  if (casinos.length === 0) return null;

  const firstBonusByCasino = new Map<number, string>();
  for (const bonus of bonuses) {
    if (bonus.casinoId != null && !firstBonusByCasino.has(bonus.casinoId)) {
      firstBonusByCasino.set(bonus.casinoId, bonus.title);
    }
  }

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--casino-comparison-table section--bg" : "section--casino-comparison-table", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-5 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-3">
              {heading && <h2 className="section-heading text-3xl font-bold text-primary-900">{heading}</h2>}
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
          <div className="section-col w-full overflow-x-auto rounded-lg border border-primary-100 bg-white">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-primary-900 text-white">
                <tr>
                  {["Brand", "Bonuses", "RTP", "Crypto Payment", "Local Banking", "Payout Speed", "Rating"].map((label) => (
                    <th key={label} className="border-r border-white/20 px-3 py-3 text-center font-medium last:border-r-0">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {casinos.map((casino) => (
                  <ComparisonRow key={casino.id} casino={casino} bonus={firstBonusByCasino.get(casino.id)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonRow({ casino, bonus }: { casino: CasinoDTO; bonus?: string }) {
  const logo = mediaUrl(casino.logoUrl);
  const cell = "border-r border-primary-100 px-3 py-3 text-center text-primary-600";

  return (
    <tr className="border-t border-primary-100">
      <td className="border-r border-primary-100 px-3 py-3">
        <Link href={`/casinos/${casino.slug}`} className="flex cursor-pointer flex-col items-center gap-1 text-center text-primary-900">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" decoding="async" src={logo} alt="" className="h-8 w-16 object-contain" />
          ) : (
            <div
              aria-hidden="true"
              className="h-8 w-16 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]"
            />
          )}
          <span className="text-xs">{casino.name}</span>
        </Link>
      </td>
      <td className={cell}>{bonus ?? "—"}</td>
      <td className={cell}>{casino.rtpPercentage != null ? `${casino.rtpPercentage.toFixed(1)}%` : "—"}</td>
      <td className={cell}>{casino.cryptoSupported ? "Yes" : "No"}</td>
      <td className={cell}>{casino.localBankingSpeed || "—"}</td>
      <td className={cell}>{casino.payoutSpeed || "—"}</td>
      <td className="px-3 py-3">
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-primary-900">
            <span className="text-xl font-bold">{Math.min(casino.rating * 2, 10).toFixed(1)}</span>
            <span className="text-xs">/10</span>
          </p>
          <StarRating rating={casino.rating} size="h-3 w-3" />
        </div>
      </td>
    </tr>
  );
}
