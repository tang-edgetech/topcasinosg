import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { CSSProperties } from "react";
import Thumbnail from "@/components/Thumbnail";

// Figma "Most Trusted Payment Methods" pattern: a bordered card per item -
// heading + description spanning the full card width, then a row below
// with an image on the left and two labeled detail blocks on the right
// (e.g. "Supported Banks May Include:" / "Why Players Use It:"). Distinct
// from IconBoxGroupSection, whose icon+heading+text all sit side by side in
// one row - this card's heading/description sit ABOVE the image+details row.
export default function FeatureCardsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--feature-cards section--bg" : "section--feature-cards", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 pt-[3.125rem] pb-6">
        {heading && (
          <div className="section-row">
            <div className="section-col">
              <h2 className="section-heading text-[36px] leading-[43px] font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}

        <div className="section-row flex flex-col gap-6">
          {items.map((itemIndex) => {
            const image = mediaUrl(field(section.fields, itemIndex, "image")?.mediaUrl);
            const cardHeading = field(section.fields, itemIndex, "heading")?.textValue ?? "";
            const description = field(section.fields, itemIndex, "description")?.textValue ?? "";
            const detail1Heading = field(section.fields, itemIndex, "detail1Heading")?.textValue ?? "";
            const detail1Body = field(section.fields, itemIndex, "detail1Body")?.textValue ?? "";
            const detail2Heading = field(section.fields, itemIndex, "detail2Heading")?.textValue ?? "";
            const detail2Body = field(section.fields, itemIndex, "detail2Body")?.textValue ?? "";

            return (
              <article
                key={itemIndex}
                className="feature-card section-col flex flex-col gap-4 rounded-lg border border-primary-100 p-5"
              >
                {cardHeading && <h3 className="feature-card__heading text-2xl font-bold text-primary-glow">{cardHeading}</h3>}
                {description && (
                  <div
                    className="rich-text-content text-sm leading-relaxed text-primary-600"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(description) }}
                  />
                )}

                <div className="feature-card__body flex flex-col gap-[30px] sm:flex-row">
                  <Thumbnail src={image} className="feature-card__image h-40 w-full shrink-0 rounded-md sm:h-auto sm:w-[31.25%]" />
                  <div className="flex flex-1 flex-col gap-4">
                    {(detail1Heading || detail1Body) && (
                      <div className="flex flex-col gap-1">
                        {detail1Heading && <h4 className="text-lg font-bold text-primary-900">{detail1Heading}</h4>}
                        {detail1Body && (
                          <div
                            className="rich-text-content text-sm text-primary-600"
                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(detail1Body) }}
                          />
                        )}
                      </div>
                    )}
                    {(detail2Heading || detail2Body) && (
                      <div className="flex flex-col gap-1">
                        {detail2Heading && <h4 className="text-lg font-bold text-primary-900">{detail2Heading}</h4>}
                        {detail2Body && (
                          <div
                            className="feature-card__list rich-text-content caret-list text-sm text-primary-900"
                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(detail2Body) }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
