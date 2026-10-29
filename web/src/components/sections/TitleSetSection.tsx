import type { CSSProperties } from "react";
import { field, headingSizeClassName, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import SectionTag from "./SectionTag";

// Figma "Comp / Title Set": a section title with one optional word in red
// (e.g. "Blacklisted Casinos to Avoid") and a short line of text under it,
// full content width. Large = 36px title with 20px to the text, medium =
// 26px with 10px. textTone "light"/"dark" force white/navy text; the
// default follows the Container it sits in (see .tone-heading/.tone-text).
export default function TitleSetSection({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const heading = text("heading");
  const highlightText = text("highlightText");
  const body = text("text");
  const medium = text("headingSize") === "medium";
  const centered = text("align") === "center";
  const tone = text("textTone");
  const headingTone = tone === "light" ? "text-white" : tone === "dark" ? "text-primary-900" : "tone-heading";
  const textTone = tone === "light" ? "text-white" : tone === "dark" ? "text-primary-600" : "tone-text";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const headingParts = highlightText && heading.includes(highlightText) ? heading.split(highlightText) : null;

  if (!heading && !body) return null;

  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--title-set section--bg" : "section--title-set", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-[3.125rem]">
        <div className="section-row">
          <div className={`title-set section-col flex flex-col ${medium ? "gap-2.5" : "gap-5"} ${centered ? "items-center text-center" : ""}`}>
            {heading && (
              <h2 className={`title-set__heading section-heading font-bold ${headingSizeClassName(text("headingSize"))} ${headingTone}`}>
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
            {body && <p className={`title-set__text text-base whitespace-pre-line ${textTone}`}>{body}</p>}
          </div>
        </div>
      </div>
    </SectionTag>
  );
}
