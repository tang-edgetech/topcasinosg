import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { CSSProperties } from "react";

// Figma "How to Make a Deposit"/"How to Withdraw Your Funds" pattern: a
// heading (optionally two lines), an intro paragraph, then a vertical list
// of numbered step cards - each with its own title and rich-text body.
export default function NumberedStepsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields, { bgType: "color", bgFrom: "surface-muted" });

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--numbered-steps section--bg" : "section--numbered-steps", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-8 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-3">
            {heading && (
              <h2 className="section-heading text-2xl font-bold text-primary-900">
                {heading}
                {subheading && <span className="block text-primary-900">{subheading}</span>}
              </h2>
            )}
            {intro && (
              <div
                className="rich-text-content max-w-3xl text-base leading-relaxed text-primary-600"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
              />
            )}
          </div>
        </div>

        <div className="section-row flex flex-col gap-4">
          {items.map((itemIndex, i) => {
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const body = field(section.fields, itemIndex, "body")?.textValue ?? "";
            return (
              <div key={itemIndex} className="numbered-step section-col flex flex-col gap-2 rounded-lg bg-white p-5 shadow-sm">
                <span className="numbered-step__badge text-lg font-bold text-primary-glow">Step {i + 1}</span>
                {title && <h3 className="numbered-step__title text-xl font-bold text-primary-900">{title}</h3>}
                {body && (
                  <div
                    className="numbered-step__body rich-text-content caret-list text-sm leading-relaxed text-primary-600"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
