import { notFound } from "next/navigation";
import { getActiveRegionByCode } from "./_lib/api";
import PageWithSidebar from "@/components/PageWithSidebar";

/**
 * Shared layout for every `/[region]/*` page. Resolves the `region` path
 * segment against `GET /api/regions` once and calls `notFound()` for any
 * code that doesn't match an active region — so none of the pages below
 * need to repeat that lookup themselves.
 *
 * The old title+RegionTabs header bar is gone — each page now renders its
 * own Introduction Section (heading/subheading/paragraph + page-menu) as
 * its first bit of content, wrapped here in the shared Sidebar layout (see
 * PageWithSidebar).
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
    notFound();
  }

  return (
    <div id="region-layout" className="region-layout flex flex-1 flex-col bg-white">
      <PageWithSidebar>{children}</PageWithSidebar>
    </div>
  );
}
