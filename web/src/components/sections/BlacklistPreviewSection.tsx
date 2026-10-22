import type { CSSProperties } from "react";
import Link from "next/link";
import { field, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getBlacklistEntries, type BlacklistEntryDTO } from "@/app/[region]/_lib/api";
import HorizontalSlider from "@/components/HorizontalSlider";
import StarRating from "@/components/StarRating";

const MAX_REASONS = 3;

// Figma "Avoid These Online Casinos in Thailand": a navy-to-red band with
// a slider of blacklisted casinos - logo, score out of 10 and a red panel
// listing why each one is blacklisted. Live blacklist data (the region's
// entries, see BlacklistEntry.Rating/Reasons/LogoURL). highlightText colors
// one word of the heading (e.g. "Avoid") in the danger color.
export default async function BlacklistPreviewSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const highlightText = field(section.fields, 0, "highlightText")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 10;
  const seeAllUrl = field(section.fields, 0, "seeAllUrl")?.textValue || "/blacklist";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || undefined;
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields, { bgType: "gradient", bgFrom: "primary-900", bgTo: "danger" });

  const { entries } = await getBlacklistEntries(regionCode, 1, limit);
  if (entries.length === 0) return null;

  const headingParts = highlightText && heading.includes(highlightText) ? heading.split(highlightText) : null;

  const header = (
    <div className="flex flex-col gap-1">
      {heading && (
        <h2 className="section-heading text-3xl font-bold text-white">
          {headingParts ? (
            <>
              {headingParts[0]}
              <span className="text-danger">{highlightText}</span>
              {headingParts[1]}
            </>
          ) : (
            heading
          )}
        </h2>
      )}
      {subheading && <p className="text-sm text-white/80">{subheading}</p>}
    </div>
  );

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--blacklist-preview section--bg" : "section--blacklist-preview", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col">
            <HorizontalSlider
              label="Blacklisted casinos"
              showArrows
              arrowTheme="dark"
              header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {header}
                  <Link
                    href={seeAllUrl}
                    className="cursor-pointer rounded border border-white/40 px-6 py-1.5 text-sm text-white hover:bg-white/10"
                  >
                    See All
                  </Link>
                </div>
              }
            >
              {entries.map((entry) => (
                <BlacklistCard key={entry.id} entry={entry} />
              ))}
            </HorizontalSlider>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlacklistCard({ entry }: { entry: BlacklistEntryDTO }) {
  const logo = mediaUrl(entry.logoUrl);
  const reasons = (entry.reasons?.length ? entry.reasons : [entry.reason]).filter(Boolean).slice(0, MAX_REASONS);

  return (
    <article className="blacklist-card flex w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-lg bg-white">
      <div className="flex flex-col items-center gap-1 px-4 pt-4 pb-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" src={logo} alt={entry.name} className="h-12 w-24 object-contain" />
        ) : (
          <div className="flex h-12 w-24 items-center justify-center rounded bg-primary-50 px-1 text-center text-xs font-semibold text-primary-900">
            {entry.name}
          </div>
        )}
        {entry.rating != null && (
          <p className="text-danger">
            <span className="text-2xl font-bold">{entry.rating.toFixed(1)}</span>
            <span className="text-xs">/10</span>
          </p>
        )}
        {entry.rating != null && <StarRating rating={entry.rating / 2} />}
      </div>
      <ul className="flex flex-1 flex-col gap-1 bg-danger px-4 py-3 text-sm text-white">
        {reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-2">
            <span aria-hidden="true" className="font-bold">
              ✕
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
