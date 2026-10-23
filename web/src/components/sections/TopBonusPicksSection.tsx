import type { CSSProperties } from "react";
import Link from "next/link";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import {
  getActiveRegionByCode,
  getRegionBonuses,
  getCasinos,
  toTitleCase,
  type BonusDTO,
  type BonusType,
  type CasinoDTO,
} from "@/app/[region]/_lib/api";
import StarRating from "@/components/StarRating";

const MAX_CASINOS_FOR_LOOKUP = 200;
const MAX_PROS = 4;

export interface Pick {
  bonus?: BonusDTO;
  casino: CasinoDTO;
}

// Figma "Top Bonus Picks in Thailand 2025" / "Most Popular Online Casinos
// Among Thai Players": ranked cards of the region's best-rated casinos -
// live Bonus/Casino data (same sources as BonusListingTableSection), not
// admin-authored cards. #1 gets the highlighted amber treatment and the
// region's flag; the rest show their rank. Casino.rating is stored out of 5
// and shown out of 10 (x2) to match the design's "9.6/10" scale.
// source "bonuses" (default) lists casinos that have a bonus of the
// configured type; source "casinos" ranks the region's top-rated casinos
// regardless, showing that bonus only when the casino has one. On mobile the
// cards become a swipeable row with the next card peeking in.
export default async function TopBonusPicksSection({ section, regionCode: pageRegionCode = "" }: { section: PageSection; regionCode?: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || pageRegionCode;
  const bonusType = (field(section.fields, 0, "bonusType")?.textValue || "welcome") as BonusType;
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 3;
  const byCasino = field(section.fields, 0, "source")?.textValue === "casinos";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  if (!regionCode) return null;

  const [bonuses, casinos, region] = await Promise.all([
    getRegionBonuses(regionCode, bonusType),
    getCasinos(regionCode, undefined, MAX_CASINOS_FOR_LOOKUP),
    getActiveRegionByCode(regionCode),
  ]);
  const picks = byCasino ? picksByCasino(casinos, bonuses, limit) : picksByBonus(casinos, bonuses, limit);

  if (picks.length === 0) return null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--top-bonus-picks section--bg" : "section--top-bonus-picks", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-2">
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
        <div className="bonus-picks__track section-row flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-[30px] md:overflow-visible">
          {picks.map((pick, i) => (
            <BonusPickCard
              key={pick.casino.id}
              pick={pick}
              rank={i + 1}
              bonusLabel={`${toTitleCase(bonusType)} Bonus`}
              flagUrl={i === 0 ? mediaUrl(region?.flagUrl) : null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function picksByCasino(casinos: CasinoDTO[], bonuses: BonusDTO[], limit: number): Pick[] {
  return [...casinos]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
    .map((casino) => ({ casino, bonus: bonuses.find((b) => b.casinoId === casino.id) }));
}

function picksByBonus(casinos: CasinoDTO[], bonuses: BonusDTO[], limit: number): Pick[] {
  const casinoById = new Map(casinos.map((c) => [c.id, c]));
  const seenCasinos = new Set<number>();
  const picks: Pick[] = [];
  for (const bonus of bonuses) {
    const casino = bonus.casinoId ? casinoById.get(bonus.casinoId) : undefined;
    if (!casino || seenCasinos.has(casino.id)) continue;
    seenCasinos.add(casino.id);
    picks.push({ bonus, casino });
  }
  return picks.sort((a, b) => b.casino.rating - a.casino.rating).slice(0, limit);
}

// featured (the #1 card by default) gets the amber treatment and the flag.
export function BonusPickCard({
  pick,
  rank,
  bonusLabel,
  flagUrl,
  featured = rank === 1,
}: {
  pick: Pick;
  rank: number;
  bonusLabel: string;
  flagUrl: string | null;
  featured?: boolean;
}) {
  const { bonus, casino } = pick;
  const score = Math.min(casino.rating * 2, 10);
  const pros = (casino.pros ?? []).slice(0, MAX_PROS);
  const logo = mediaUrl(casino.logoUrl);

  return (
    <article
      className={`bonus-pick section-col relative flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-lg border md:w-auto ${
        featured ? "bonus-pick--featured border-secondary-300 bg-secondary-50" : "border-primary-100 bg-surface"
      }`}
    >
      <div
        aria-hidden="true"
        className={`bonus-pick__ribbon absolute top-0 left-0 h-44 w-12 rounded-br-[100%] ${
          featured ? "bg-gradient-to-b from-secondary-600 to-secondary-900" : "bg-primary-50"
        }`}
      />
      <div className="absolute top-2 left-2 z-10">
        {featured && flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flagUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className={`text-sm font-semibold ${featured ? "text-white" : "text-primary-500"}`}>{rank}</span>
        )}
      </div>

      <div className={`relative flex flex-1 flex-col items-center gap-3 px-6 pt-6 pb-5 ${featured ? "" : "bg-surface"}`}>
        <div className="flex flex-col items-center gap-1">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-14 w-28 object-contain" />
          ) : (
            <div
              aria-hidden="true"
              className="h-14 w-28 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]"
            />
          )}
          <span className="text-sm text-primary-600">{casino.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-primary-900">
            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
            <span className="text-xs">/10</span>
          </p>
          <StarRating rating={casino.rating} />
        </div>

        {bonus && (
          <div
            className={`bonus-pick__offer flex w-full flex-col items-center gap-1 rounded-lg px-4 py-4 text-center ${
              featured ? "bg-secondary-100/60 text-secondary-900" : "bg-surface-muted text-primary-900"
            }`}
          >
            <span className="text-xs">{bonusLabel}</span>
            <span className="text-base leading-snug font-bold">{bonus.title}</span>
          </div>
        )}

        {pros.length > 0 && (
          <ul className="flex w-full flex-col gap-1">
            {pros.map((pro) => (
              <li key={pro} className="flex items-start gap-2 text-sm text-primary-600">
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`flex gap-2 px-6 py-4 ${featured ? "bg-secondary-50" : "bg-surface-muted"}`}>
        <Link
          href={casino.ctaUrl || `/casinos/${casino.slug}`}
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold text-white ${
            featured ? "bg-secondary-900 hover:bg-secondary-800" : "bg-primary-900 hover:bg-primary-800"
          }`}
        >
          Visit Site
        </Link>
        <Link
          href={`/casinos/${casino.slug}`}
          className="flex-1 cursor-pointer rounded-md bg-white px-3 py-2 text-center text-sm text-primary-600 hover:text-primary-900"
        >
          More Info
        </Link>
      </div>
    </article>
  );
}
