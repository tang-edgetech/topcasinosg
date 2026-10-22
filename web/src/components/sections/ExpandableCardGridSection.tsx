import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import ExpandableCard from "@/components/ExpandableCard";

// Figma region-page pattern shared by "Bonuses You Can Claim", "Trusted
// Payment Methods", "Game Strategy & Winning Tips" and "RTP & Bonus
// Trackers": a centered heading, an italic tagline in a tinted box, a
// centered intro, a centered wrap of expandable "+" cards (3 per row on
// desktop, so a 5-card set lays out 3 + 2), then a closing note.
export default function ExpandableCardGridSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const tagline = field(section.fields, 0, "tagline")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const outro = field(section.fields, 0, "outro")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--expandable-card-grid section--bg" : "section--expandable-card-grid", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-5 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col items-center gap-4 text-center">
            {heading && <h2 className="section-heading text-3xl font-bold text-primary-900">{heading}</h2>}
            {tagline && (
              <p className="expandable-card-grid__tagline w-full rounded-lg bg-surface-muted px-6 py-4 font-serif text-xl font-bold whitespace-pre-line text-primary-glow italic md:text-2xl">
                {tagline}
              </p>
            )}
            {intro && (
              <div
                className="rich-text-content text-sm leading-relaxed text-primary-600"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
              />
            )}
          </div>
        </div>

        <div className="section-row flex flex-wrap justify-center gap-4">
          {items.map((itemIndex) => {
            const icon = mediaUrl(field(section.fields, itemIndex, "icon")?.mediaUrl);
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const text = field(section.fields, itemIndex, "text")?.textValue ?? "";
            return (
              <div key={itemIndex} className="w-full md:w-[calc((100%-2rem)/3)]">
                <ExpandableCard
                  title={title}
                  text={text}
                  icon={
                    icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" decoding="async" src={icon} alt="" className="h-8 w-8 object-contain" />
                    ) : (
                      <span aria-hidden="true" className="grid grid-cols-2 text-sm leading-none text-primary-glow">
                        <span>♠</span>
                        <span>♦</span>
                        <span>♥</span>
                        <span>♣</span>
                      </span>
                    )
                  }
                />
              </div>
            );
          })}
        </div>

        {outro && (
          <div className="section-row">
            <div
              className="section-col rich-text-content text-center text-sm text-primary-600"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(outro) }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
