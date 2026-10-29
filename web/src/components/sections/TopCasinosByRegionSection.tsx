import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getRegions, getRegionBonuses, type RegionDTO } from "@/app/[region]/_lib/api";
import DataTable from "@/components/data-table/DataTable";
import { COLUMNS } from "@/components/data-table/columns";
import { loadRows } from "@/components/data-table/loadRows";
import SwipeRow from "@/components/SwipeRow";
import { BonusPickCard } from "./TopBonusPicksSection";
import SectionTag from "./SectionTag";

const DEFAULT_COLUMNS = ["cashback", "payments", "rating", "safeIndex"];
const DEFAULT_MORE_COUNT = 3;
const DEFAULT_COUNTRY_COUNT = 3;
const DEFAULT_BONUS_LABEL = "Welcome Bonus";
const DEFAULT_TABLE_HEADING = "More Online Casinos in {region}";
const DEFAULT_CTA_LABEL = "Visit Site";
const REGION_TOKEN = "{region}";

interface CountryEntry {
  region: RegionDTO;
  featuredCasinoId: number | null;
  tableCasinoIds: number[];
  showTable: boolean;
}

function idList(value: string | undefined): number[] {
  return (value ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

// Figma Home "Top Rated Casino of the Month by Country": a featured card per
// country (its casino, flag and welcome bonus), then a "More Online Casinos
// in <country>" table per country. Automatic by default — the first
// countryCount active regions (by sort order), each with its best-rated
// casino, then the next best — or, in "custom" mode,
// the countries, featured casinos and table casinos the editor picked.
export default async function TopCasinosByRegionSection({ section }: { section: PageSection }) {
  const text = (itemIndex: number, key: string) => field(section.fields, itemIndex, key)?.textValue ?? "";
  const heading = text(0, "heading");
  const moreCount = Number(text(0, "moreCount")) || DEFAULT_MORE_COUNT;
  const countryCount = Number(text(0, "countryCount")) || DEFAULT_COUNTRY_COUNT;
  const bonusLabel = text(0, "bonusLabel") || DEFAULT_BONUS_LABEL;
  const tableHeading = text(0, "tableHeading") || DEFAULT_TABLE_HEADING;
  const ctaLabel = text(0, "ctaLabel") || DEFAULT_CTA_LABEL;
  const columnKeys = text(0, "columns").split(",").map((key) => key.trim()).filter((key) => COLUMNS[key]?.source === "casino");
  const columns = (columnKeys.length > 0 ? columnKeys : DEFAULT_COLUMNS).map((key) => ({ key, label: COLUMNS[key].label, def: COLUMNS[key] }));
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const regions = (await getRegions()).sort((a, b) => a.sortOrder - b.sortOrder);
  const entries: CountryEntry[] =
    text(0, "mode") === "custom"
      ? itemIndexes(section.fields).flatMap((itemIndex) => {
          const region = regions.find((r) => r.code === text(itemIndex, "regionCode"));
          if (!region) return [];
          return [{
            region,
            featuredCasinoId: idList(text(itemIndex, "casinoId"))[0] ?? null,
            tableCasinoIds: idList(text(itemIndex, "tableCasinoIds")),
            showTable: text(itemIndex, "showTable") !== "no",
          }];
        })
      : regions.filter((r) => r.isActive).slice(0, countryCount).map((region) => ({ region, featuredCasinoId: null, tableCasinoIds: [], showTable: true }));

  const perRegion = (
    await Promise.all(
      entries.map(async ({ region, featuredCasinoId, tableCasinoIds, showTable }) => {
        const featuredIds = featuredCasinoId ? [featuredCasinoId] : undefined;
        let { rows: [top] } = await loadRows({ source: "casinos", regionCode: region.code, limit: 1, includeCasinoIds: featuredIds });
        if (!top?.casino && featuredIds) ({ rows: [top] } = await loadRows({ source: "casinos", regionCode: region.code, limit: 1 }));
        if (!top?.casino) return null;
        const topCasino = top.casino;
        const [welcome, more] = await Promise.all([
          getRegionBonuses(region.code, "welcome"),
          showTable
            ? loadRows({
                source: "casinos",
                regionCode: region.code,
                limit: tableCasinoIds.length > 0 ? tableCasinoIds.length : moreCount,
                includeCasinoIds: tableCasinoIds,
                excludeCasinoIds: [topCasino.id],
              })
            : null,
        ]);
        return { region, topCasino, bonus: welcome.find((b) => b.casinoId === topCasino.id), more };
      })
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (perRegion.length === 0) return null;

  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--top-casinos-by-region section--bg" : "section--top-casinos-by-region", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-10 py-[3.125rem]">
        {heading && (
          <div className="section-row">
            <div className="section-col text-center">
              <h2 className="section-heading text-3xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}

        <SwipeRow label={heading || "Top casinos by country"} className="bonus-picks__track section-row pb-1" slideClassName="w-[85%]" gridFrom="md" gridColumns={3} gridGap={30}>
          {perRegion.map(({ region, topCasino, bonus }) => (
            <BonusPickCard
              key={region.id}
              pick={{ casino: topCasino, bonus }}
              rank={1}
              featured
              bonusLabel={bonusLabel}
              flagUrl={mediaUrl(region.flagUrl)}
            />
          ))}
        </SwipeRow>

        {perRegion
          .filter(({ more }) => more && more.rows.length > 0)
          .map(({ region, more }) => (
            <div key={region.id} className="flex flex-col gap-4">
              <div className="section-row">
                <h3 className="section-col flex items-center justify-center gap-2 text-xl font-bold text-primary-900">
                  {region.flagUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(region.flagUrl) ?? ""} alt="" className="h-6 w-6 rounded-full object-cover" />
                  )}
                  {tableHeading.split(REGION_TOKEN).join(region.name)}
                </h3>
              </div>
              <DataTable rows={more!.rows} ctx={more!.ctx} columns={columns} ctaLabel={ctaLabel} moreInfo mobile="swipe" />
            </div>
          ))}
      </div>
    </SectionTag>
  );
}
