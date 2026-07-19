import { notFound } from "next/navigation";
import { getActiveRegionByCode } from "./_lib/api";
import RegionTabs from "./_lib/RegionTabs";

/**
 * Shared layout for every `/[region]/*` page. Resolves the `region` path
 * segment against `GET /api/regions` once, renders a title + tab-nav bar,
 * and calls `notFound()` for any code that doesn't match an active region —
 * so none of the 5 pages below need to repeat that lookup themselves.
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
      <div className="region-layout__header border-b border-primary-100 bg-primary-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:px-8">
          <h1 className="region-layout__title text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
            {regionData.name} Online Casinos
          </h1>
          <RegionTabs regionCode={regionData.code} />
        </div>
      </div>

      <div className="region-layout__content mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8">
        {children}
      </div>
    </div>
  );
}
