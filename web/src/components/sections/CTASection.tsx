import type { CSSProperties } from "react";
import Link from "next/link";
import { field, sectionClassName, sectionBgStyle, buttonClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

export default function CTASection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const body = field(section.fields, 0, "body")?.textValue ?? "";
  const button = field(section.fields, 0, "button");
  const buttonStyle = field(section.fields, 0, "buttonStyle")?.textValue;
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields, { bgType: "color", bgFrom: "primary-900" });

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--cta section--bg" : "section--cta", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-16">
        <div className="section-row flex flex-col">
          <div className="section-col mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
            {heading && <h2 className="section-heading text-2xl font-bold text-white">{heading}</h2>}
            {body && (
              <div
                className="rich-text-content text-white/90"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
              />
            )}
            {button?.textValue && button.urlValue && (
              <Link href={button.urlValue} className={buttonClassName(buttonStyle)}>
                {button.textValue}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
