import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { getCasinos, getPaymentMethods } from "@/app/[region]/_lib/api";
import type { CSSProperties } from "react";

const OPTION_ICON_COUNT = 5;
const DEFAULT_CASINO_LIMIT = 5;

interface PaymentOption {
  name: string;
  icon: string | null;
}

interface ComparisonRow {
  key: string | number;
  logo: string | null;
  brandName: string;
  options: PaymentOption[];
  optionsText: string;
  processingTime: string;
  extraCells: Record<string, string>;
}

const placeholderPattern = "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)]";

// Figma "Fees, Processing Time & Limits" pattern: heading + intro, an
// optional tips/recommendation callout pair, then a table comparing casino
// brands - each row is a brand (logo + name), the payment methods it
// supports (a row of icons), and its processing time.
// source "casinos" builds the rows live from the region's Casinos: logo,
// the payment methods each casino accepts (shown with the icon of the
// matching Payment Method record, or as a text chip when there's no icon),
// and its payout speed. source "manual" keeps hand-typed rows; rows seeded
// before this became a brand comparison still render via the
// "label"/"options" text fallback.
export default async function ComparisonTableSection({ section, regionCode: pageRegionCode }: { section: PageSection; regionCode?: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const tipHeading = field(section.fields, 0, "tipHeading")?.textValue ?? "";
  const tipBody = field(section.fields, 0, "tipBody")?.textValue ?? "";
  const recommendation = field(section.fields, 0, "recommendation")?.textValue ?? "";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const col1Label = field(section.fields, 0, "col1Label")?.textValue || "Brand";
  const col2Label = field(section.fields, 0, "col2Label")?.textValue || "Options";
  const col3Label = field(section.fields, 0, "col3Label")?.textValue || "Processing Time";

  const isLive = field(section.fields, 0, "source")?.textValue === "casinos";

  // Columns 4-6 are purely admin-added extras (generic text) for comparing
  // more attributes as more data comes in - see ComparisonTableFields in the
  // admin dashboard. They only apply to hand-typed rows.
  const extraColumns = isLive
    ? []
    : [4, 5, 6]
        .map((n) => ({
          key: `col${n}`,
          label: field(section.fields, 0, `col${n}Label`)?.textValue ?? "",
          align: (field(section.fields, 0, `col${n}Align`)?.textValue === "right" ? "right" : "left") as "left" | "right",
        }))
        .filter((c) => c.label);

  const rows = isLive ? await loadCasinoRows(section, pageRegionCode) : manualRows(section, extraColumns.map((c) => c.key));

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--comparison-table section--bg" : "section--comparison-table", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-3">
            {heading && <h2 className="section-heading text-[36px] leading-[43px] font-bold text-primary-900">{heading}</h2>}
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
                {tipHeading && <h3 className="mb-2 text-sm text-primary-600">{tipHeading}</h3>}
                <div
                  className="rich-text-content caret-list text-sm text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(tipBody) }}
                />
              </div>
            )}
            {recommendation && (
              <div className="comparison-table__recommendation section-col rounded-lg border border-primary-100 bg-surface-muted p-4">
                <h3 className="mb-1 text-base font-semibold text-primary-glow">Recommendation:</h3>
                <div
                  className="rich-text-content text-xs text-primary-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(recommendation) }}
                />
              </div>
            )}
          </div>
        )}

        {rows.length > 0 && (
          <div className="section-row">
            <div className="comparison-table__wrapper section-col overflow-x-auto rounded-lg border border-primary-100">
              <table className="comparison-table__table w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-primary-900">
                    <th className="px-4 py-3 font-semibold text-white">{col1Label}</th>
                    <th className="px-4 py-3 font-semibold text-white">{col2Label}</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">{col3Label}</th>
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
                  {rows.map((row) => (
                    <tr key={row.key} className="comparison-table__row border-t border-primary-100">
                      <td className="comparison-table__brand px-4 py-3">
                        <div className="flex flex-col items-center gap-1 text-center">
                          {row.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img loading="lazy" decoding="async" src={row.logo} alt="" className="h-8 w-20 object-contain" />
                          ) : (
                            <div aria-hidden="true" className={`h-8 w-20 rounded ${placeholderPattern} bg-[length:10px_10px]`} />
                          )}
                          {row.brandName && <span className="text-xs font-semibold text-primary-900">{row.brandName}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PaymentOptionsCell row={row} />
                      </td>
                      <td className="px-4 py-3 text-center text-primary-600">{row.processingTime}</td>
                      {extraColumns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 text-primary-600 ${col.align === "right" ? "text-right" : ""}`}>
                          {row.extraCells[col.key] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PaymentOptionsCell({ row }: { row: ComparisonRow }) {
  if (row.options.length > 0) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {row.options.map((option) =>
          option.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              loading="lazy"
              decoding="async"
              key={option.name}
              src={option.icon}
              alt={option.name}
              title={option.name}
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <span key={option.name} className="rounded border border-primary-100 bg-surface-muted px-2 py-1 text-xs text-primary-600">
              {option.name}
            </span>
          )
        )}
      </div>
    );
  }
  if (row.optionsText) return <span className="text-primary-600">{row.optionsText}</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: OPTION_ICON_COUNT }, (_, i) => (
        <div key={i} aria-hidden="true" className={`h-8 w-8 shrink-0 rounded ${placeholderPattern} bg-[length:10px_10px]`} />
      ))}
    </div>
  );
}

async function loadCasinoRows(section: PageSection, pageRegionCode: string | undefined): Promise<ComparisonRow[]> {
  const regionCode = field(section.fields, 0, "regionCode")?.textValue || pageRegionCode;
  if (!regionCode) return [];
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || DEFAULT_CASINO_LIMIT;

  const [casinos, paymentMethods] = await Promise.all([getCasinos(regionCode, undefined, limit), getPaymentMethods(regionCode)]);
  const iconByName = new Map(paymentMethods.map((pm) => [pm.name.trim().toLowerCase(), mediaUrl(pm.iconUrl)]));

  return casinos.map((casino) => ({
    key: casino.id,
    logo: mediaUrl(casino.logoUrl),
    brandName: casino.name,
    options: (casino.paymentMethods ?? []).map((name) => ({ name, icon: iconByName.get(name.trim().toLowerCase()) ?? null })),
    optionsText: "",
    processingTime: casino.payoutSpeed,
    extraCells: {},
  }));
}

function manualRows(section: PageSection, extraKeys: string[]): ComparisonRow[] {
  return itemIndexes(section.fields).map((itemIndex) => {
    const text = (key: string) => field(section.fields, itemIndex, key)?.textValue ?? "";
    const icons = Array.from({ length: OPTION_ICON_COUNT }, (_, n) => mediaUrl(field(section.fields, itemIndex, `icon${n + 1}`)?.mediaUrl)).filter(
      (src): src is string => Boolean(src)
    );
    return {
      key: itemIndex,
      logo: mediaUrl(field(section.fields, itemIndex, "logo")?.mediaUrl),
      brandName: text("brandName") || text("label"),
      options: icons.map((icon, i) => ({ name: `Option ${i + 1}`, icon })),
      optionsText: text("options"),
      processingTime: text("processingTime"),
      extraCells: Object.fromEntries(extraKeys.map((key) => [key, text(key)])),
    };
  });
}
