import type { CSSProperties } from "react";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getRegions, getRegionBonuses } from "@/app/[region]/_lib/api";
import CasinoListTable, { loadCasinoRows } from "@/components/CasinoListTable";
import { BonusPickCard } from "./TopBonusPicksSection";

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
        const [top] = await loadCasinoRows(region.code, 1);
        if (!top) return null;
        const [welcome, more] = await Promise.all([
          getRegionBonuses(region.code, "welcome"),
          loadCasinoRows(region.code, moreCount, [top.casino.id]),
        ]);
        return { region, top, bonus: welcome.find((b) => b.casinoId === top.casino.id), more };
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
          {perRegion.map(({ region, top, bonus }) => (
            <BonusPickCard
              key={region.id}
              pick={{ casino: top.casino, bonus }}
              rank={1}
              featured
              bonusLabel="Welcome Bonus"
              flagUrl={mediaUrl(region.flagUrl)}
            />
          ))}
        </div>

        {perRegion
          .filter(({ more }) => more.length > 0)
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
              <CasinoListTable rows={more} />
            </div>
          ))}
      </div>
    </section>
  );
}
