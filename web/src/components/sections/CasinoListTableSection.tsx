import type { CSSProperties } from "react";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import CasinoListTable, { loadCasinoRows } from "@/components/CasinoListTable";

const DEFAULT_LIMIT = 10;

// Figma "Thai Online Casinos List" (Reviews): the region's casinos, best
// rated first, in the shared casino list table (see CasinoListTable.tsx).
// regionCode blank = the page's own region.
export default async function CasinoListTableSection({ section, regionCode: pageRegionCode = "" }: { section: PageSection; regionCode?: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || pageRegionCode;
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || DEFAULT_LIMIT;
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  if (!regionCode) return null;

  const rows = await loadCasinoRows(regionCode, limit);
  if (rows.length === 0) return null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--casino-list-table section--bg" : "section--casino-list-table", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-5 py-[3.125rem]">
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
        <CasinoListTable rows={rows} />
      </div>
    </section>
  );
}
