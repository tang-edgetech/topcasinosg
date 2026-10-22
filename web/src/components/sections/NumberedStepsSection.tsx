import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { CSSProperties } from "react";

const ACCENT_CLASSES: Record<string, string> = {
  primary: "text-primary-glow",
  success: "text-success",
};

// Figma "How to Make a Deposit"/"How to Withdraw Your Funds" pattern: a
// heading (optionally two lines, with one phrase - highlightText - picked
// out in the accent color), an intro paragraph, then a vertical list of
// step cards whose "Step N" labels share that accent (blue for deposit,
// green for withdraw in the design).
export default function NumberedStepsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const highlightText = field(section.fields, 0, "highlightText")?.textValue ?? "";
  const accentClass = ACCENT_CLASSES[field(section.fields, 0, "accent")?.textValue ?? ""] ?? ACCENT_CLASSES.primary;
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields, { bgType: "color", bgFrom: "surface-muted" });
  const headingParts = highlightText && heading.includes(highlightText) ? heading.split(highlightText) : null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--numbered-steps section--bg" : "section--numbered-steps", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-3">
            {heading && (
              <h2 className="section-heading text-[36px] leading-[43px] font-bold text-primary-900">
                {headingParts ? (
                  <>
                    {headingParts[0]}
                    <span className={accentClass}>{highlightText}</span>
                    {headingParts[1]}
                  </>
                ) : (
                  heading
                )}
                {subheading && <span className="block text-primary-900">{subheading}</span>}
              </h2>
            )}
            {intro && (
              <div
                className="rich-text-content text-sm leading-relaxed text-primary-600"
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
              <div key={itemIndex} className="numbered-step section-col flex flex-col gap-1 rounded-lg bg-white p-5 shadow-sm">
                <span className={`numbered-step__badge text-2xl font-bold ${accentClass}`}>Step {i + 1}</span>
                {title && <h3 className="numbered-step__title text-lg font-bold text-primary-900">{title}</h3>}
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
