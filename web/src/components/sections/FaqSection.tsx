import type { CSSProperties } from "react";
import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import AccordionItem from "@/components/Accordion";

export default function FaqSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--faq section--bg" : "section--faq", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-16">
        <div className="section-row flex flex-col">
          <div className="section-col mx-auto flex w-full max-w-3xl flex-col gap-8">
            {heading && <h2 className="section-heading text-center text-2xl font-bold text-primary-900">{heading}</h2>}
            <div className="flex flex-col gap-3">
              {items.map((itemIndex) => {
                const question = field(section.fields, itemIndex, "question")?.textValue ?? "";
                const answer = field(section.fields, itemIndex, "answer")?.textValue ?? "";
                return (
                  <AccordionItem
                    key={itemIndex}
                    className="faq-item rounded-lg border border-primary-100 p-4"
                    header={<span className="faq-item__question text-base font-semibold text-primary-900">{question}</span>}
                  >
                    <div
                      className="rich-text-content pt-3 text-sm text-primary-600"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(answer) }}
                    />
                  </AccordionItem>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
