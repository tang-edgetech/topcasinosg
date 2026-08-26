import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import IntroductionSectionBlock from "@/components/sections/IntroductionSectionBlock";
import PageGrid from "@/components/PageGrid";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * Root catch-all for hierarchical Pages CMS pages 2+ segments deep (e.g.
 * "/legal/privacy-policy") — a page's slug is just one path segment, and its
 * full URL is built by walking its parent chain (see api/internal/service/
 * page_service.go's ResolvePath, which this hits via getPage).
 *
 * Next.js only ever routes a request here once every more specific route has
 * failed to match: `/casinos`, `/guides`, etc. are literal folders (always
 * win), and any 2-segment path starting with a real region code (e.g.
 * "/th/reviews") already matches one of `[region]`'s own named subfolders
 * (reviews, bonuses, payment-methods, rtp, guides, blacklist) - this catch-all
 * only ever sees paths that don't fit any of those. A brand-new top-level
 * (1-segment) CMS page is a different case entirely, handled inside
 * `[region]/page.tsx` instead - see that file's comment for why a 1-segment
 * path can never reach this catch-all at all (`[region]` always claims it).
 */

interface SlugPageParams {
  slug: string[];
}

function pathFromParams(slug: string[]): string {
  return slug.join("/");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<SlugPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPage(pathFromParams(slug));
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function HierarchicalPage({ params }: { params: Promise<SlugPageParams> }) {
  const { slug } = await params;
  const result = await getPage(pathFromParams(slug));

  if (!result || result.sections.length === 0) {
    notFound();
  }

  const ordered = result.sections.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const [first, ...rest] = ordered;
  const hasIntro = first?.blockType === "introduction_section";

  return (
    <div id="hierarchical-page" className="hierarchical-page flex flex-1 flex-col">
      <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />
      <PageGrid>
        {hasIntro && <IntroductionSectionBlock section={first} />}
        <SectionRenderer sections={hasIntro ? rest : ordered} />
      </PageGrid>
      <RawHtmlBlock html={result.page.footerSnippet} />
    </div>
  );
}
