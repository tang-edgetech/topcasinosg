import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsPageMetadata } from "@/lib/seo";
import { getActiveRegionByCode } from "./api";
import { buildPageMenu, regionMenuLabel, type PageKey } from "./pageMenu";
import { getRegionPage } from "./regionPage";
import IntroductionSectionBlock from "@/components/sections/IntroductionSectionBlock";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

// Shared shell for CMS-driven region pages (Bonuses, Reviews, the six bonus
// types): content comes from the region's own page when it has sections,
// otherwise from the shared region-template copy with placeholders filled
// (see regionPage.ts). A leading introduction_section becomes the header with
// the fixed region page menu; live blocks follow the page's region.
export async function regionCmsMetadata(region: string, subPath: string): Promise<Metadata> {
  const regionData = await getActiveRegionByCode(region);
  const result = regionData ? await getRegionPage(regionData, subPath) : null;
  if (!result) return {};
  return cmsPageMetadata(result.page, `/${region}/${subPath}`);
}

export default async function RegionCmsPage({ region, subPath, menu, id }: { region: string; subPath: string; menu: PageKey; id: string }) {
  const regionData = await getActiveRegionByCode(region);
  if (!regionData) notFound();

  const result = await getRegionPage(regionData, subPath);
  const sections = (result?.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const [first, ...rest] = sections;
  const hasIntro = first?.blockType === "introduction_section";
  const pageMenu = buildPageMenu(region, regionMenuLabel(regionData.name), menu);

  return (
    <div id={id} className={`${id} flex flex-1 flex-col`}>
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      <PageGrid>
        {hasIntro && <IntroductionSectionBlock section={first} fallbackPageMenu={pageMenu} />}
        <SectionRenderer sections={hasIntro ? rest : sections} regionCode={region} />
      </PageGrid>
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}
