import { getPage, type PageWithSections } from "@/lib/pages";
import type { RegionDTO } from "./api";

// Top-level Pages CMS page holding one shared copy of each region page
// (api/internal/db/migrations/0057_region_template_bonuses.sql). Never
// routable on its own — [region]/layout.tsx 404s it as an unknown region.
export const REGION_TEMPLATE_SLUG = "region-template";

export const REGION_PLACEHOLDERS = ["{region}", "{regionAdj}", "{regionCode}", "{currency}", "{year}"] as const;

export function fillRegionPlaceholders(text: string, region: RegionDTO): string {
  if (!text.includes("{")) return text;
  return text
    .replaceAll("{region}", region.name)
    .replaceAll("{regionAdj}", region.demonym || region.name)
    .replaceAll("{regionCode}", region.code)
    .replaceAll("{currency}", region.currencyCode)
    .replaceAll("{year}", String(new Date().getFullYear()));
}

function fillPage(result: PageWithSections, region: RegionDTO): PageWithSections {
  const fill = (text: string) => fillRegionPlaceholders(text, region);
  return {
    page: {
      ...result.page,
      title: fill(result.page.title),
      metaTitle: fill(result.page.metaTitle),
      metaDescription: fill(result.page.metaDescription),
    },
    sections: result.sections.map((section) => ({
      ...section,
      fields: section.fields.map((f) => ({ ...f, textValue: fill(f.textValue ?? ""), urlValue: fill(f.urlValue ?? "") })),
    })),
  };
}

// A region's own page wins when it has sections; otherwise the shared
// region-template copy is used. Either way the placeholders are filled for
// this region, so a region-specific page can use them too.
export async function getRegionPage(region: RegionDTO, subPath: string): Promise<PageWithSections | null> {
  const own = await getPage(`${region.code}/${subPath}`);
  const source = own && own.sections.length > 0 ? own : ((await getPage(`${REGION_TEMPLATE_SLUG}/${subPath}`)) ?? own);
  return source ? fillPage(source, region) : null;
}
