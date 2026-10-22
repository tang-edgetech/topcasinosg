import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { getAllCasinos } from "@/app/[region]/_lib/api";

// Figma "Event Highlights": admin-authored promo cards - a navy title bar,
// the event banner, a Brand / Event Duration strip, then Visit Site and
// More Info buttons. Each card can pick a Casino: its name fills Brand, its
// link fills Visit Site and its review page fills More Info, so a casino's
// URL is only ever maintained on the Casino itself. Anything typed on the
// card overrides those. On mobile the cards become a swipeable row that
// snaps each card to the center with its neighbours peeking in.
export default async function EventHighlightsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const items = itemIndexes(section.fields);

  if (items.length === 0) return null;

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const needsCasinos = items.some((i) => field(section.fields, i, "casinoId")?.textValue);
  const casinoById = new Map((needsCasinos ? await getAllCasinos() : []).map((c) => [String(c.id), c]));

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--event-highlights section--bg" : "section--event-highlights", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-5 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-1">
              {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
              {intro && (
                <div
                  className="rich-text-content text-sm text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
                />
              )}
            </div>
          </div>
        )}
        <div className="event-highlights__track section-row flex snap-x snap-mandatory gap-4 overflow-x-auto px-[7.5%] pb-1 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {items.map((itemIndex) => {
            const image = mediaUrl(field(section.fields, itemIndex, "image")?.mediaUrl);
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const casino = casinoById.get(field(section.fields, itemIndex, "casinoId")?.textValue ?? "");
            const brand = field(section.fields, itemIndex, "brand")?.textValue || casino?.name || "";
            const dateRange = field(section.fields, itemIndex, "dateRange")?.textValue ?? "";
            const button = field(section.fields, itemIndex, "button");
            const visitUrl = button?.urlValue || casino?.ctaUrl || "";
            const visitLabel = button?.textValue || (visitUrl ? "Visit Site" : "");
            const moreInfoUrl = field(section.fields, itemIndex, "moreInfoUrl")?.textValue || (casino ? `/casinos/${casino.slug}` : "");

            return (
              <article
                key={itemIndex}
                className="event-card flex w-[85%] shrink-0 snap-center flex-col overflow-hidden rounded-lg border border-primary-100 bg-surface-muted md:w-auto"
              >
                {title && <h3 className="bg-primary-900 px-4 py-2.5 text-center text-base font-bold text-white">{title}</h3>}
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img loading="lazy" decoding="async" src={image} alt={title} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div
                    aria-hidden="true"
                    className="aspect-[4/3] w-full bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
                  />
                )}
                {(brand || dateRange) && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 bg-white px-4 py-2 text-xs text-primary-500">
                    {brand && <dt>Brand</dt>}
                    {dateRange && <dt>Event Duration</dt>}
                    {brand && <dd className="text-sm font-semibold text-primary-900">{brand}</dd>}
                    {dateRange && <dd className="text-sm font-semibold text-primary-900">{dateRange}</dd>}
                  </dl>
                )}
                <div className="flex gap-2 px-4 py-3">
                  {visitLabel && visitUrl && (
                    <a
                      href={visitUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex-1 cursor-pointer rounded-md bg-primary-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-800"
                    >
                      {visitLabel}
                    </a>
                  )}
                  {moreInfoUrl && (
                    <a
                      href={moreInfoUrl}
                      className="flex-1 cursor-pointer rounded-md bg-white px-3 py-2 text-center text-sm text-primary-600 hover:text-primary-900"
                    >
                      More Info
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
