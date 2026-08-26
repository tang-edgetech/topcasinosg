import type { CSSProperties } from "react";
import Link from "next/link";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getBlacklistEntries } from "@/app/[region]/_lib/api";

// "Blacklisted Casinos to Avoid" — a teaser for the full /blacklist page.
// An optional regionCode scopes this to one region's entries (e.g. on
// /th); left blank, it shows global entries, matching how the section
// reads on Home. Reuses the same border-danger/30 styling as
// web/src/app/[region]/blacklist/page.tsx.
export default async function BlacklistPreviewSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 6;
  const seeAllUrl = field(section.fields, 0, "seeAllUrl")?.textValue || "/blacklist";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || undefined;

  const { entries } = await getBlacklistEntries(regionCode, 1, limit);
  if (entries.length === 0) return null;

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--blacklist-preview section--bg" : "section--blacklist-preview", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-8 py-16">
        <div className="section-row flex flex-col items-center gap-2 text-center">
          {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
          {subheading && <p className="text-base text-primary-600">{subheading}</p>}
        </div>

        <div className="section-row grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-1 rounded-lg border border-danger/30 bg-surface-muted p-4 text-center">
              <h3 className="text-sm font-semibold text-primary-900">{entry.name}</h3>
              <p className="text-xs font-semibold text-danger">{entry.reason}</p>
            </div>
          ))}
        </div>

        <Link
          href={seeAllUrl}
          className="mx-auto w-fit cursor-pointer rounded-md bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gradient-to-r hover:from-primary-900 hover:to-primary-glow"
        >
          See All Blacklisted Casinos
        </Link>
      </div>
    </section>
  );
}
