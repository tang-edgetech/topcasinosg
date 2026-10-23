import type { CSSProperties } from "react";
import Link from "next/link";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getRegions } from "@/app/[region]/_lib/api";

// Figma Home "Explore Online Casinos by Region": an amber gradient panel of
// region cards (flag, "Online Casino <region>", arrow), one per active
// Region, linking to /{regionCode}. Live data only — activating a region
// adds its card.
export default async function RegionExplorerSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const regions = (await getRegions()).filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  if (regions.length === 0) return null;

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--region-explorer section--bg" : "section--region-explorer", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col items-center gap-5 rounded-[20px] bg-gradient-to-b from-secondary-600 to-secondary-900 px-4 py-10 sm:px-10">
            {heading && <h2 className="section-heading text-center text-3xl font-bold text-white">{heading}</h2>}
            <div className="grid w-full max-w-[860px] grid-cols-2 justify-center gap-3 sm:flex sm:flex-wrap">
              {regions.map((region) => {
                const flag = mediaUrl(region.flagUrl);
                return (
                  <Link
                    key={region.id}
                    href={`/${region.code}`}
                    className="group flex cursor-pointer items-center overflow-hidden rounded-lg bg-white text-primary-900 shadow-sm hover:shadow-md sm:w-[206px]"
                  >
                    <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center bg-secondary-50">
                      {flag ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={flag} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="h-9 w-9 rounded-full bg-primary-100" />
                      )}
                    </span>
                    <span className="flex-1 px-3 text-left text-xs leading-tight sm:text-sm">
                      Online Casino
                      <br />
                      {region.name}
                    </span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mr-3 h-4 w-4 shrink-0 text-primary-900 group-hover:translate-x-0.5" aria-hidden="true">
                      <path d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
