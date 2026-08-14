import Link from "next/link";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { getRegions } from "@/app/[region]/_lib/api";

// "Explore Online Casinos by Region" — live-data only (no per-item admin
// content): lists every active Region as a pill linking to /{regionCode}.
export default async function RegionExplorerSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const regions = (await getRegions()).filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  if (regions.length === 0) return null;

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--region-explorer", section)}>
      <div className="section-container flex flex-col items-center gap-6 rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-500 py-12">
        {heading && <h2 className="section-heading text-center text-2xl font-bold text-primary-900">{heading}</h2>}
        <div className="section-row flex flex-wrap items-center justify-center gap-3 px-6">
          {regions.map((region) => (
            <Link
              key={region.id}
              href={`/${region.code}`}
              className="cursor-pointer rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary-900 shadow-sm hover:bg-primary-50"
            >
              Online Casinos in {region.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
