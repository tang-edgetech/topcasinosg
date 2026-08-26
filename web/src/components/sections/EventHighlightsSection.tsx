import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";

// "Event Highlights" — purely admin-authored promo banner cards (image,
// title, date range, CTA). No backing entity (Bonus has no image field),
// same convention as Team Grid.
export default function EventHighlightsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);

  if (items.length === 0) return null;

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--event-highlights section--bg" : "section--event-highlights", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-16">
        {heading && (
          <div className="section-row">
            <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>
          </div>
        )}
        <div className="section-row grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((itemIndex) => {
            const image = mediaUrl(field(section.fields, itemIndex, "image")?.mediaUrl);
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const dateRange = field(section.fields, itemIndex, "dateRange")?.textValue ?? "";
            const button = field(section.fields, itemIndex, "button");

            return (
              <div key={itemIndex} className="event-highlight-card flex flex-col overflow-hidden rounded-lg border border-primary-100 bg-surface shadow-sm">
                <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-primary-900 to-primary-glow">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {title && <h3 className="text-base font-semibold text-primary-900">{title}</h3>}
                  {dateRange && <p className="text-xs text-primary-500">{dateRange}</p>}
                  {button?.textValue && button.urlValue && (
                    <a
                      href={button.urlValue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-fit cursor-pointer rounded-md bg-secondary-600 px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-secondary-700"
                    >
                      {button.textValue}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
