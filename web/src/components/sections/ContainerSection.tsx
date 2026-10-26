import type { CSSProperties, ReactNode } from "react";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";

// Wraps the sections placed inside it in the editor (PageSection.inContainer)
// with one shared background and a main title set - heading (one word
// optionally in red), intro - like Figma's "Blacklisted Casinos to Avoid",
// whose slider keeps its own secondary heading. Children render as normal
// sections; sections.css drops their own vertical padding so the container
// owns the rhythm (50px around and between).
export default function ContainerSection({ section, children }: { section: PageSection; children: ReactNode }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const heading = text("heading");
  const highlightText = text("highlightText");
  const intro = text("intro");
  const light = text("textTone") === "light";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const headingParts = highlightText && heading.includes(highlightText) ? heading.split(highlightText) : null;
  const hasTitle = Boolean(heading || intro);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(
        ["section--container", hasBleedBg && "section--bg", light && "section--container-light"].filter(Boolean).join(" "),
        section
      )}
      style={bgStyle as CSSProperties}
    >
      {hasTitle && (
        <div className="section-container relative z-10 pt-[3.125rem]">
          <div className="section-row">
            <div className="container-section__title section-col flex flex-col gap-5">
              {heading && (
                <h2 className={`section-heading text-[36px] leading-[43px] font-bold ${light ? "text-white" : "text-primary-900"}`}>
                  {headingParts ? (
                    <>
                      {headingParts[0]}
                      <span className="text-danger">{highlightText}</span>
                      {headingParts.slice(1).join(highlightText)}
                    </>
                  ) : (
                    heading
                  )}
                </h2>
              )}
              {intro && <p className={`text-base whitespace-pre-line ${light ? "text-white" : "text-primary-600"}`}>{intro}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="container-section__body relative z-10 flex flex-col gap-[3.125rem] py-[3.125rem]">{children}</div>
    </section>
  );
}
