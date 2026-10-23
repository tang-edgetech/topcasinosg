import type { CSSProperties } from "react";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getCasinos } from "@/app/[region]/_lib/api";
import GameCasinoFinder, { type FinderCasino } from "./GameCasinoFinder";

const MAX_CASINOS_FOR_LOOKUP = 200;
const DEFAULT_RESULTS = 3;

// Figma "Choose an Online Casino Based on Your Playing Style": a panel of
// game tiles; picking one lists the region's best-rated casinos that offer
// that game (Casino.supportedGames). The region's casinos are fetched once
// on the server and filtered in the browser, so switching games is instant.
export default async function GameCasinoFinderSection({ section, regionCode: pageRegionCode = "" }: { section: PageSection; regionCode?: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const panelTitle = field(section.fields, 0, "panelTitle")?.textValue || "What Game Would You Like to Start Off with";
  const panelSubtitle = field(section.fields, 0, "panelSubtitle")?.textValue || "Select one of the following options";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || pageRegionCode;
  const results = Number(field(section.fields, 0, "limit")?.textValue) || DEFAULT_RESULTS;
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  if (!regionCode) return null;

  const casinos: FinderCasino[] = (await getCasinos(regionCode, undefined, MAX_CASINOS_FOR_LOOKUP))
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logo: mediaUrl(c.logoUrl),
      score: Math.min(c.rating * 2, 10),
      ctaUrl: c.ctaUrl || `/casinos/${c.slug}`,
      games: c.supportedGames ?? [],
    }));

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--game-casino-finder section--bg" : "section--game-casino-finder", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        {heading && (
          <div className="section-row">
            <div className="section-col">
              <h2 className="section-heading text-center text-2xl font-bold text-primary-900 sm:text-3xl">{heading}</h2>
            </div>
          </div>
        )}
        <div className="section-row">
          <div className="section-col">
            <GameCasinoFinder casinos={casinos} panelTitle={panelTitle} panelSubtitle={panelSubtitle} results={results} />
          </div>
        </div>
      </div>
    </section>
  );
}
