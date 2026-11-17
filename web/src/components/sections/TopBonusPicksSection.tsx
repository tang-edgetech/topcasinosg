import type { CSSProperties } from "react";
import Link from "next/link";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import SwipeRow from "@/components/SwipeRow";
import HorizontalSlider from "@/components/HorizontalSlider";
import DataTable from "@/components/data-table/DataTable";
import { COLUMNS } from "@/components/data-table/columns";
import { loadRows } from "@/components/data-table/loadRows";
import { cardDisplay, perRow, GRID_COLUMNS } from "@/lib/cardLayout";
import { cardStyle, type CardStyle } from "@/lib/cardStyle";
import {
  getActiveRegionByCode,
  getRegionBonuses,
  getCasinos,
  toTitleCase,
  type BonusDTO,
  type BonusType,
  type CasinoDTO,
} from "@/app/[region]/_lib/api";
import CasinoLogo from "@/components/CasinoLogo";
import { MAX_CASINOS_FOR_LOOKUP } from "@/components/data-table/loadRows";
import ScoreDisplay from "@/components/ScoreDisplay";
import VisitSiteLink from "@/components/VisitSiteLink";
import SectionTag from "./SectionTag";

const MAX_PROS = 4;

export interface Pick {
  bonus?: BonusDTO;
  casino: CasinoDTO;
}

// Figma "Top Bonus Picks in Thailand 2025" / "Most Popular Online Casinos
// Among Thai Players": ranked cards of the region's best-rated casinos -
// live Bonus/Casino data (same sources as DataTableSection), not
// admin-authored cards. Every card shows the region's flag (its rank when the
// region has none) on the orange corner ribbon; #1 also gets the amber
// colours. The block's card colours and rating icons (lib/cardStyle.ts)
// override those built-in colours on every card. Casino.rating is stored out of 5
// and shown out of 10 (x2) to match the design's "9.6/10" scale.
// source "bonuses" (default) lists casinos that have a bonus of the
// configured type; source "casinos" ranks the region's top-rated casinos
// regardless, showing that bonus only when the casino has one. On mobile the
// cards become a swipeable row with the next card peeking in. "display"
// swaps that for a grid, a carousel with arrows, a list of rows or a table
// (see lib/cardLayout.ts); "perRow" sets the cards per row.
export default async function TopBonusPicksSection({ section, regionCode: pageRegionCode = "" }: { section: PageSection; regionCode?: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || pageRegionCode;
  const bonusType = (field(section.fields, 0, "bonusType")?.textValue || "welcome") as BonusType;
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 3;
  const byCasino = field(section.fields, 0, "source")?.textValue === "casinos";
  const display = cardDisplay(field(section.fields, 0, "display")?.textValue, ["swipe", "grid", "carousel", "list", "table"] as const);
  const columns = perRow(field(section.fields, 0, "perRow")?.textValue, 3);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const look = cardStyle(section.fields);

  if (!regionCode) return null;

  const [bonuses, casinos, region] = await Promise.all([
    getRegionBonuses(regionCode, bonusType),
    getCasinos(regionCode, undefined, MAX_CASINOS_FOR_LOOKUP),
    getActiveRegionByCode(regionCode),
  ]);
  const picks = byCasino ? picksByCasino(casinos, bonuses, limit) : picksByBonus(casinos, bonuses, limit);

  if (picks.length === 0) return null;
  const bonusLabel = `${toTitleCase(bonusType)} Bonus`;
  const flagUrl = mediaUrl(region?.flagUrl);
  const cards = picks.map((pick, i) => (
    <BonusPickCard key={pick.casino.id} pick={pick} rank={i + 1} bonusLabel={bonusLabel} flagUrl={flagUrl} look={look} />
  ));

  return (
    <SectionTag section={section}
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
        {display === "swipe" ? (
          <SwipeRow label={heading || "Top bonus picks"} className="bonus-picks__track section-row pb-1" slideClassName="w-[85%]" gridFrom="md" gridColumns={columns} gridGap={30}>
            {cards}
          </SwipeRow>
        ) : display === "table" ? (
          <PicksTable picks={picks} regionCode={regionCode} bonusLabel={bonusLabel} />
        ) : (
          <div className="section-row">
            <div className="section-col">
              <HorizontalSlider label={heading || "Top bonus picks"} layout={display === "carousel" ? "slider" : display} slideClassName="w-[85%] sm:w-[340px]" showArrows gridClassName={GRID_COLUMNS[columns]}>
                {display === "list"
                  ? picks.map((pick, i) => <BonusPickRow key={pick.casino.id} pick={pick} rank={i + 1} bonusLabel={bonusLabel} look={look} />)
                  : cards}
              </HorizontalSlider>
            </div>
          </div>
        )}
      </div>
    </SectionTag>
  );
}

// display "table": the picks as a casino table, the pick's bonus first.
async function PicksTable({ picks, regionCode, bonusLabel }: { picks: Pick[]; regionCode: string; bonusLabel: string }) {
  const { rows, ctx } = await loadRows({ source: "casinos", regionCode, limit: picks.length, includeCasinoIds: picks.map((p) => p.casino.id) });
  const withBonus = rows.map((row) => ({ ...row, bonus: picks.find((p) => p.casino.id === row.casino?.id)?.bonus }));
  const columns = [
    { key: "details", label: bonusLabel, def: COLUMNS.details },
    { key: "rating", label: COLUMNS.rating.label, def: COLUMNS.rating },
    { key: "payments", label: COLUMNS.payments.label, def: COLUMNS.payments },
  ];
  return <DataTable rows={withBonus} ctx={ctx} columns={columns} ctaLabel="Visit Site" moreInfo mobile="stack" />;
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

// display "list": one row per pick - rank, logo, score, bonus and buttons
// side by side (stacked on mobile).
export function BonusPickRow({ pick, rank, bonusLabel, look }: { pick: Pick; rank: number; bonusLabel: string; look?: CardStyle }) {
  const { bonus, casino } = pick;
  return (
    <article className="bonus-pick-row flex flex-col items-center gap-4 rounded-lg border border-primary-100 bg-surface p-4 sm:flex-row">
      <span className="w-6 shrink-0 text-center text-sm font-semibold text-primary-500">{rank}</span>
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-32">
        <CasinoLogo src={casino.logoUrl} name={casino.name} className="h-12 w-24" />
        <span className="text-sm text-primary-600">{casino.name}</span>
      </div>
      <ScoreDisplay rating={casino.rating} icons={look?.rating} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-center sm:text-left">
        {bonus && (
          <>
            <span className="text-xs text-primary-500">{bonusLabel}</span>
            <span className="text-base leading-snug font-bold text-primary-900">{bonus.title}</span>
          </>
        )}
      </div>
      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
        <VisitSiteLink
          href={casino.ctaUrl}
          fallbackHref={`/casinos/${casino.slug}`}
          className="flex-1 cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-white hover:bg-primary-800"
        />
        <Link
          href={`/casinos/${casino.slug}`}
          className="flex-1 cursor-pointer rounded-md border border-primary-100 bg-white px-4 py-2 text-center text-sm whitespace-nowrap text-primary-600 hover:text-primary-900"
        >
          More Info
        </Link>
      </div>
    </article>
  );
}

// Corner ribbon from Figma (49×166): full width at the top, then a concave
// curve that tapers to a point at the bottom-left.
const RIBBON_SHAPE = "path('M0 0H49C1 46 3 139 0 166Z')";

// Every card gets the corner ribbon and the flag (or its rank without one);
// featured (the #1 card by default) also gets the amber colours. look's
// colours, when set, replace the built-in ones on every card.
export function BonusPickCard({
  pick,
  rank,
  bonusLabel,
  flagUrl,
  featured = rank === 1,
  look,
}: {
  pick: Pick;
  rank: number;
  bonusLabel: string;
  flagUrl: string | null;
  featured?: boolean;
  look?: CardStyle;
}) {
  const { bonus, casino } = pick;
  const pros = (casino.pros ?? []).slice(0, MAX_PROS);

  return (
    <article
      className={`bonus-pick section-col relative flex flex-col overflow-hidden rounded-lg border ${
        featured ? "bonus-pick--featured border-secondary-300 bg-secondary-50" : "border-primary-100 bg-surface"
      }`}
      style={{ background: look?.cardBg, borderColor: look?.cardBorder }}
    >
      <div
        aria-hidden="true"
        style={{ clipPath: RIBBON_SHAPE, background: look?.ribbon }}
        className="bonus-pick__ribbon absolute top-0 left-0 h-[166px] w-[49px] bg-gradient-to-b from-secondary-600 to-secondary-900"
      />
      <div className="absolute top-2 left-2 z-10">
        {flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flagUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-5 items-center justify-center text-sm font-semibold text-white">{rank}</span>
        )}
      </div>

      {/* No background of its own: the card's shows through, and the
          ribbon behind this stays visible. */}
      <div className="relative flex flex-1 flex-col items-center gap-3 px-6 pt-6 pb-5">
        <div className="flex flex-col items-center gap-1">
          <CasinoLogo src={casino.logoUrl} name={casino.name} className="h-14 w-28" />
          <span className="text-sm text-primary-600">{casino.name}</span>
        </div>

        <ScoreDisplay rating={casino.rating} icons={look?.rating} />

        {bonus && (
          <div
            className={`bonus-pick__offer flex w-full flex-col items-center gap-1 rounded-lg px-4 py-4 text-center ${
              featured ? "bg-secondary-100/60 text-secondary-900" : "bg-surface-muted text-primary-900"
            }`}
            style={{ background: look?.offerBg, color: look?.offerText }}
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

      <div className={`flex gap-2 px-6 py-4 ${featured ? "bg-secondary-50" : "bg-surface-muted"}`} style={{ background: look?.footerBg }}>
        <VisitSiteLink
          href={casino.ctaUrl}
          fallbackHref={`/casinos/${casino.slug}`}
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold text-white ${
            featured ? "bg-secondary-900 hover:bg-secondary-800" : "bg-primary-900 hover:bg-primary-800"
          } ${look?.ctaBg ? "hover:brightness-110" : ""}`}
          style={{ background: look?.ctaBg, color: look?.ctaText }}
        />
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
