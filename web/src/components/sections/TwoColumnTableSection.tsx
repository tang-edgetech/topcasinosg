import type { CSSProperties } from "react";
import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import SectionTag from "./SectionTag";

// Figma "Comp / Table / Bonus Page - Standard": a heading, optional intro, a
// two-column table (a tinted label column and an explanation column, header
// labels editable — "Term / Simple Explanation", "What to Watch Out For / Why
// It Matters", ...) and an optional closing note. Used for Key Terms, Tips
// and Watch Out on the bonus-type pages. On mobile each row stacks.
export default function TwoColumnTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const outro = field(section.fields, 0, "outro")?.textValue ?? "";
  const headerLeft = field(section.fields, 0, "headerLeft")?.textValue ?? "";
  const headerRight = field(section.fields, 0, "headerRight")?.textValue ?? "";
  const rows = itemIndexes(section.fields)
    .map((i) => ({ key: i, left: field(section.fields, i, "left")?.textValue ?? "", right: field(section.fields, i, "right")?.textValue ?? "" }))
    .filter((row) => row.left || row.right);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  if (rows.length === 0 && !heading) return null;

  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--two-column-table section--bg" : "section--two-column-table", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-4 py-[3.125rem]">
        {(heading || intro) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-2">
              {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
              {intro && (
                <div className="rich-text-content text-sm leading-relaxed text-primary-600" dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }} />
              )}
            </div>
          </div>
        )}
        {rows.length > 0 && (
          <div className="section-row">
            <div className="section-col overflow-hidden rounded-lg border border-primary-100 text-sm">
              {(headerLeft || headerRight) && (
                <div className="hidden grid-cols-[1fr_2fr] bg-primary-900 text-white md:grid">
                  <div className="border-r border-white/20 px-4 py-3 text-center font-medium">{headerLeft}</div>
                  <div className="px-4 py-3 text-center font-medium">{headerRight}</div>
                </div>
              )}
              {rows.map((row) => (
                <div key={row.key} className="grid grid-cols-1 border-t border-primary-100 first:border-t-0 md:grid-cols-[1fr_2fr] md:first:border-t">
                  <div className="flex items-center bg-primary-50 px-4 py-3 font-semibold text-primary-900 md:justify-center md:text-center md:font-normal md:text-primary-600">
                    {row.left}
                  </div>
                  <div
                    className="rich-text-content px-4 py-3 text-primary-600 md:border-l md:border-primary-100"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(row.right) }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {outro && (
          <div className="section-row">
            <div className="section-col rich-text-content text-sm leading-relaxed text-primary-600" dangerouslySetInnerHTML={{ __html: sanitizeRichText(outro) }} />
          </div>
        )}
      </div>
    </SectionTag>
  );
}
