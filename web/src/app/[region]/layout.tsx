import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getActiveRegionByCode } from "./_lib/api";

/**
 * Shared layout for every `/[region]/*` page. Resolves the `region` path
 * segment against `GET /api/regions` once and calls `notFound()` for any
 * code that doesn't match an active region — so none of the nested bespoke
 * routes (reviews, bonuses, payment-methods, rtp, guides, blacklist) need to
 * repeat that lookup themselves.
 *
 * The one exception is the bare `/{region}` path itself: since this dynamic
 * segment claims every possible single-segment URL (Next.js always prefers
 * it over the root `/[...slug]` catch-all for a 1-segment path), a
 * brand-new top-level hierarchical Pages CMS page (e.g. "/about") would
 * 404 right here before ever getting a chance to render — this route,
 * not the catch-all, IS the only route a 1-segment path can ever reach.
 * So for that exact case, this layout defers to page.tsx instead of 404ing
 * immediately: page.tsx already checks `getPage(region)` first and only
 * calls notFound() itself if there's neither a real region nor a CMS page.
 * Every deeper path still 404s here exactly as before, since those bespoke
 * routes have no such CMS-page fallback of their own.
 *
 * Deliberately doesn't wrap `children` in PageGrid — each page.tsx composes
 * its own PageGrid/IntroductionSection nesting individually (some region
 * routes render an Introduction Section, others don't). See PageGrid.tsx
 * and IntroductionSection.tsx.
 */
export default async function RegionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionData = await getActiveRegionByCode(region);

  if (!regionData) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    const isBareRegionPath = pathname === `/${region}` || pathname === `/${region}/`;
    if (!isBareRegionPath) {
      notFound();
    }
  }

  return (
    <div id="region-layout" className="region-layout flex flex-1 flex-col bg-white">
      {children}
    </div>
  );
}
