import type { CSSProperties } from "react";
import Link from "next/link";
import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import SectionTag from "./SectionTag";

// Figma "Types of Bonuses Explained" pattern: a heading + intro, then a
// grid of bordered cards - each a large blue title (optionally linking to
// its own page, e.g. /{region}/bonuses/no_deposit) over a short
// description. Generic on purpose: any "explain the categories, link out to
// each" grid can reuse it.
export default function LinkCardGridSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const columns = field(section.fields, 0, "columns")?.textValue === "3" ? "md:grid-cols-3" : "md:grid-cols-2";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--link-card-grid section--bg" : "section--link-card-grid", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-5 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-1">
              {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
              {intro && (
                <div
                  className="rich-text-content text-sm leading-relaxed text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
                />
              )}
            </div>
          </div>
        )}
        <div className={`section-row grid grid-cols-1 gap-5 ${columns}`}>
          {items.map((itemIndex) => {
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const description = field(section.fields, itemIndex, "description")?.textValue ?? "";
            const url = field(section.fields, itemIndex, "url")?.textValue ?? "";
            const titleClass = "link-card__title text-2xl font-bold text-primary-glow";
            return (
              <div key={itemIndex} className="link-card section-col flex flex-col gap-2 rounded-lg border border-primary-100 bg-surface p-5">
                {title &&
                  (url ? (
                    <Link href={url} className={`${titleClass} cursor-pointer hover:underline`}>
                      {title}
                    </Link>
                  ) : (
                    <h3 className={titleClass}>{title}</h3>
                  ))}
                {description && <p className="link-card__description text-sm leading-relaxed text-primary-600">{description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </SectionTag>
  );
}
