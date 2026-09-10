import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { CSSProperties } from "react";

const OPTION_ICON_COUNT = 5;

// Figma "Fees, Processing Time & Limits" pattern: heading + intro, an
// optional tips/recommendation callout pair, then a table comparing casino
// brands - each row is a brand (logo + name), the payment methods it
// supports (a row of icons), and its processing time. Rows seeded before
// this became a brand comparison still render via the "label"/"options"
// text fallback below until an admin uploads a logo/icons for them.
export default function ComparisonTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const tipHeading = field(section.fields, 0, "tipHeading")?.textValue ?? "";
  const tipBody = field(section.fields, 0, "tipBody")?.textValue ?? "";
  const recommendation = field(section.fields, 0, "recommendation")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const col1Label = field(section.fields, 0, "col1Label")?.textValue || "Brand";
  const col2Label = field(section.fields, 0, "col2Label")?.textValue || "Options";
  const col3Label = field(section.fields, 0, "col3Label")?.textValue || "Processing Time";

  // Columns 4-6 are purely admin-added extras (generic text) for comparing
  // more attributes as more data comes in - see ComparisonTableFields in the
  // admin dashboard.
  const extraColumns = [4, 5, 6]
    .map((n) => ({
      key: `col${n}`,
      label: field(section.fields, 0, `col${n}Label`)?.textValue ?? "",
      align: (field(section.fields, 0, `col${n}Align`)?.textValue === "right" ? "right" : "left") as "left" | "right",
    }))
    .filter((c) => c.label);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--comparison-table section--bg" : "section--comparison-table", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-3">
            {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
            {intro && (
              <div
                className="rich-text-content max-w-3xl text-base leading-relaxed text-primary-600"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
              />
            )}
          </div>
        </div>

        {(tipBody || recommendation) && (
          <div className="section-row grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tipBody && (
              <div className="comparison-table__tips section-col">
                {tipHeading && <h3 className="mb-2 text-sm font-semibold text-primary-900">{tipHeading}</h3>}
                <div
                  className="rich-text-content caret-list text-sm text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(tipBody) }}
                />
              </div>
            )}
            {recommendation && (
              <div className="comparison-table__recommendation section-col rounded-lg bg-primary-700 p-5 text-white">
                <h3 className="mb-2 text-sm font-semibold text-white">Recommendation:</h3>
                <div
                  className="rich-text-content text-sm text-white/90"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(recommendation) }}
                />
              </div>
            )}
          </div>
        )}

        <div className="section-row">
          <div className="comparison-table__wrapper section-col overflow-x-auto rounded-lg border border-primary-100">
            <table className="comparison-table__table w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-primary-900">
                  <th className="px-4 py-3 font-semibold text-white">{col1Label}</th>
                  <th className="px-4 py-3 font-semibold text-white">{col2Label}</th>
                  <th className="px-4 py-3 text-right font-semibold text-white">{col3Label}</th>
                  {extraColumns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 font-semibold text-white ${col.align === "right" ? "text-right" : "text-left"}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((itemIndex) => {
                  const logo = mediaUrl(field(section.fields, itemIndex, "logo")?.mediaUrl);
                  const brandName = field(section.fields, itemIndex, "brandName")?.textValue || field(section.fields, itemIndex, "label")?.textValue || "";
                  const icons = Array.from({ length: OPTION_ICON_COUNT }, (_, n) =>
                    mediaUrl(field(section.fields, itemIndex, `icon${n + 1}`)?.mediaUrl)
                  ).filter((src): src is string => Boolean(src));
                  const optionsText = field(section.fields, itemIndex, "options")?.textValue ?? "";
                  const processingTime = field(section.fields, itemIndex, "processingTime")?.textValue ?? "";

                  return (
                    <tr key={itemIndex} className="comparison-table__row border-t border-primary-100">
                      <td className="comparison-table__brand px-4 py-3">
                        <div className="flex flex-col items-center gap-1 text-center">
                          {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt="" className="h-8 w-20 object-contain" />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="h-8 w-20 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]"
                            />
                          )}
                          {brandName && <span className="text-xs font-semibold text-primary-900">{brandName}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {icons.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {icons.map((src, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={src} alt="" className="h-8 w-8 rounded object-contain" />
                            ))}
                          </div>
                        ) : optionsText ? (
                          <span className="text-primary-600">{optionsText}</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: OPTION_ICON_COUNT }, (_, i) => (
                              <div
                                key={i}
                                aria-hidden="true"
                                className="h-8 w-8 shrink-0 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]"
                              />
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-primary-600">{processingTime}</td>
                      {extraColumns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 text-primary-600 ${col.align === "right" ? "text-right" : ""}`}>
                          {field(section.fields, itemIndex, col.key)?.textValue ?? ""}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
