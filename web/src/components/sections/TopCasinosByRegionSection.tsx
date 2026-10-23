import type { CSSProperties } from "react";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getRegions, getRegionBonuses } from "@/app/[region]/_lib/api";
import DataTable from "@/components/data-table/DataTable";
import { COLUMNS } from "@/components/data-table/columns";
import { loadRows } from "@/components/data-table/loadRows";
import { BonusPickCard } from "./TopBonusPicksSection";

const TABLE_COLUMNS = ["cashback", "payments", "rating", "safeIndex"].map((key) => ({ key, label: COLUMNS[key].label, def: COLUMNS[key] }));

const DEFAULT_MORE_COUNT = 3;

// Figma Home "Top Rated Casino of the Month by Country": one card per active
// region (its best-rated casino, with the region's flag and welcome bonus),
// then a "More Online Casinos in <region>" table per region listing the next
// best casinos. Fully automatic — "top" is the highest rating, and a newly
// activated region appears without any editing.
export default async function TopCasinosByRegionSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const moreCount = Number(field(section.fields, 0, "moreCount")?.textValue) || DEFAULT_MORE_COUNT;
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const regions = (await getRegions()).filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const perRegion = (
    await Promise.all(
      regions.map(async (region) => {
        const { rows: [top] } = await loadRows({ source: "casinos", regionCode: region.code, limit: 1 });
        if (!top?.casino) return null;
        const topCasino = top.casino;
        const [welcome, more] = await Promise.all([
          getRegionBonuses(region.code, "welcome"),
          loadRows({ source: "casinos", regionCode: region.code, limit: moreCount, excludeCasinoIds: [topCasino.id] }),
        ]);
        return { region, topCasino, bonus: welcome.find((b) => b.casinoId === topCasino.id), more };
      })
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (perRegion.length === 0) return null;

  return (
    <section
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

        <div className="bonus-picks__track section-row flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-[30px] md:overflow-visible">
          {perRegion.map(({ region, topCasino, bonus }) => (
            <BonusPickCard
              key={region.id}
              pick={{ casino: topCasino, bonus }}
              rank={1}
              featured
              bonusLabel="Welcome Bonus"
              flagUrl={mediaUrl(region.flagUrl)}
            />
          ))}
        </div>

        {perRegion
          .filter(({ more }) => more.rows.length > 0)
          .map(({ region, more }) => (
            <div key={region.id} className="flex flex-col gap-4">
              <div className="section-row">
                <h3 className="section-col flex items-center justify-center gap-2 text-xl font-bold text-primary-900">
                  {region.flagUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(region.flagUrl) ?? ""} alt="" className="h-6 w-6 rounded-full object-cover" />
                  )}
                  More Online Casinos in {region.name}
                </h3>
              </div>
              <DataTable rows={more.rows} ctx={more.ctx} columns={TABLE_COLUMNS} ctaLabel="Visit Site" moreInfo mobile="swipe" />
            </div>
          ))}
      </div>
    </section>
  );
}
