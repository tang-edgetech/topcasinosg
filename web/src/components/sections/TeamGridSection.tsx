import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";

// Figma Home "Expert Team Behind the Reviews": heading + intro, then member
// cards — a tinted photo panel (cut-out portrait), name, job title and a
// short quote. Purely admin-authored. 2 per row on mobile, 4 on desktop.
export default function TeamGridSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  if (items.length === 0) return null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--team-grid section--bg" : "section--team-grid", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-2">
              {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
              {intro && <p className="text-sm text-primary-600">{intro}</p>}
            </div>
          </div>
        )}
        <div className="section-row grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((itemIndex) => {
            const photo = mediaUrl(field(section.fields, itemIndex, "photo")?.mediaUrl);
            const name = field(section.fields, itemIndex, "name")?.textValue ?? "";
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const quote = field(section.fields, itemIndex, "quote")?.textValue ?? "";

            return (
              <div key={itemIndex} className="team-member section-col flex flex-col items-center gap-1 text-center">
                <div
                  className={`team-member__photo mb-2 flex aspect-[2/1] w-full items-end justify-center overflow-hidden rounded-lg${photo ? "" : " bg-surface-muted"}`}
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={photo} alt={name} className="h-full w-auto object-contain object-bottom" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3/4 w-auto text-primary-100" aria-hidden="true">
                      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z" />
                    </svg>
                  )}
                </div>
                {(name || title || quote) && (
                  <div className="team-member__info flex flex-col items-center gap-1">
                    {name && <h3 className="team-member__name text-sm font-bold text-primary-900">{name}</h3>}
                    {title && <p className="team-member__title text-xs text-primary-500">{title}</p>}
                    {quote && <p className="team-member__quote text-sm text-primary-500">{quote}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
