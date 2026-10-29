import type { CSSProperties } from "react";
import Link from "next/link";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import SectionTag from "./SectionTag";

const HEADING_COLOR_CLASSES: Record<string, string> = {
  primary: "text-primary-900",
  danger: "text-danger",
  success: "text-success",
  secondary: "text-secondary-600",
  white: "text-white",
};

function headingColorClass(token: string | undefined): string {
  return HEADING_COLOR_CLASSES[token ?? ""] ?? HEADING_COLOR_CLASSES.primary;
}

// Figma "Things you should watch out for / Fake RTP & Bonus Claims" and
// "Suggestions for / Maximizing RTP & Bonuses" pattern: a two-line heading
// (each line its own admin-picked color), an optional intro, and either two
// side-by-side bullet-list boxes with a trailing note link (watch-outs) or
// just body paragraphs (suggestions) - both are the same shape with
// different fields populated, so one flexible block type covers both
// instead of two narrow ones. theme "dark" (the Bonuses hub's "Bonuses to
// Avoid" band, over a navy-to-red gradient background) flips body copy to
// white and renders intro lists with alert icons; highlightText colors one
// substring of headingLine1 (e.g. "Avoid") in highlightColor.
export default function HighlightPanelSection({ section }: { section: PageSection }) {
  const headingLine1 = field(section.fields, 0, "headingLine1")?.textValue ?? "";
  const headingLine1Color = field(section.fields, 0, "headingLine1Color")?.textValue;
  const headingLine2 = field(section.fields, 0, "headingLine2")?.textValue ?? "";
  const headingLine2Color = field(section.fields, 0, "headingLine2Color")?.textValue;
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const box1Heading = field(section.fields, 0, "box1Heading")?.textValue ?? "";
  const box1Body = field(section.fields, 0, "box1Body")?.textValue ?? "";
  const box2Heading = field(section.fields, 0, "box2Heading")?.textValue ?? "";
  const box2Body = field(section.fields, 0, "box2Body")?.textValue ?? "";
  const outro = field(section.fields, 0, "outro")?.textValue ?? "";
  const noteText = field(section.fields, 0, "noteText")?.textValue ?? "";
  const noteLinkUrl = field(section.fields, 0, "noteLinkUrl")?.textValue ?? "";
  const noteLinkLabel = field(section.fields, 0, "noteLinkLabel")?.textValue ?? "";
  const dark = field(section.fields, 0, "theme")?.textValue === "dark";
  const highlightText = field(section.fields, 0, "highlightText")?.textValue ?? "";
  const highlightColor = field(section.fields, 0, "highlightColor")?.textValue || "danger";
  const line1Parts = highlightText && headingLine1.includes(highlightText) ? headingLine1.split(highlightText) : null;
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(
        ["section--highlight-panel", hasBleedBg && "section--bg", dark && "section--highlight-panel-dark"].filter(Boolean).join(" "),
        section,
      )}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-3">
            {(headingLine1 || headingLine2) && (
              <h2 className="section-heading text-2xl font-bold">
                {headingLine1 && (
                  <span className={headingColorClass(headingLine1Color)}>
                    {line1Parts ? (
                      <>
                        {line1Parts[0]}
                        <span className={headingColorClass(highlightColor)}>{highlightText}</span>
                        {line1Parts[1]}
                      </>
                    ) : (
                      headingLine1
                    )}
                  </span>
                )}
                {headingLine1 && headingLine2 && <br />}
                {headingLine2 && <span className={headingColorClass(headingLine2Color)}>{headingLine2}</span>}
              </h2>
            )}
            {intro && (
              <div
                className={
                  dark
                    ? "highlight-panel__intro rich-text-content alert-list max-w-3xl text-sm leading-relaxed text-white"
                    : "highlight-panel__intro rich-text-content max-w-3xl text-base leading-relaxed text-primary-600"
                }
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
              />
            )}
          </div>
        </div>

        {(box1Body || box2Body) && (
          <div className="section-row grid grid-cols-1 gap-4 md:grid-cols-2">
            {box1Body && (
              <div className="highlight-panel__box section-col rounded-lg bg-surface-muted p-5">
                {box1Heading && <h3 className="highlight-panel__box-heading mb-2 text-lg font-semibold text-primary-900">{box1Heading}</h3>}
                <div
                  className="rich-text-content caret-list text-sm text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(box1Body) }}
                />
              </div>
            )}
            {box2Body && (
              <div className="highlight-panel__box section-col rounded-lg bg-surface-muted p-5">
                {box2Heading && <h3 className="highlight-panel__box-heading mb-2 text-lg font-semibold text-primary-glow">{box2Heading}</h3>}
                <div
                  className="rich-text-content diamond-list text-sm text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(box2Body) }}
                />
              </div>
            )}
          </div>
        )}

        {outro && (
          <div className="section-row">
            <div
              className="highlight-panel__outro section-col rich-text-content text-sm leading-relaxed text-primary-600"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(outro) }}
            />
          </div>
        )}

        {(noteText || noteLinkUrl) && (
          <div className="section-row">
            <p className="section-col text-sm text-primary-600">
              {noteText}
              {noteLinkUrl && noteLinkLabel && (
                <Link href={noteLinkUrl} className="cursor-pointer font-semibold text-secondary-600 hover:underline">
                  {noteLinkLabel}
                </Link>
              )}
            </p>
          </div>
        )}
      </div>
    </SectionTag>
  );
}
