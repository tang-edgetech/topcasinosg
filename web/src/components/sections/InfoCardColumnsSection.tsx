import type { CSSProperties } from "react";
import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

interface InfoCard {
  itemIndex: number;
  title: string;
  body: string;
  tinted: boolean;
}

// Figma "Our Recommended Payment Security Standards to Protect You": a
// heading + intro over two independent columns of rich-text cards (the
// columns don't line up row by row, so each item picks its column rather
// than flowing into a grid), each card either white with a border or tinted.
// Stacks into a single column on mobile, left column first.
export default function InfoCardColumnsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const left: InfoCard[] = [];
  const right: InfoCard[] = [];
  for (const itemIndex of itemIndexes(section.fields)) {
    const card: InfoCard = {
      itemIndex,
      title: field(section.fields, itemIndex, "title")?.textValue ?? "",
      body: field(section.fields, itemIndex, "body")?.textValue ?? "",
      tinted: field(section.fields, itemIndex, "tinted")?.textValue === "yes",
    };
    (field(section.fields, itemIndex, "column")?.textValue === "right" ? right : left).push(card);
  }

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--info-card-columns section--bg" : "section--info-card-columns", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-5 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-3">
            {heading && <h2 className="section-heading max-w-2xl text-[36px] leading-[43px] font-bold text-primary-900">{heading}</h2>}
            {intro && (
              <div
                className="rich-text-content text-sm leading-relaxed text-primary-600"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
              />
            )}
          </div>
        </div>
        <div className="section-row grid grid-cols-1 items-start gap-3 md:grid-cols-2">
          {[left, right].map((column, i) => (
            <div key={i} className="flex flex-col gap-3">
              {column.map((card) => (
                <article
                  key={card.itemIndex}
                  className={`info-card flex flex-col gap-2 rounded-lg p-5 ${
                    card.tinted ? "bg-surface-muted" : "border border-primary-100 bg-white"
                  }`}
                >
                  {card.title && <h3 className="text-lg font-semibold text-primary-900">{card.title}</h3>}
                  {card.body && (
                    <div
                      className="rich-text-content caret-list text-sm leading-relaxed text-primary-600"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(card.body) }}
                    />
                  )}
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
