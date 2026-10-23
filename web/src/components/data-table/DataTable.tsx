import Link from "next/link";
import CasinoBrand from "@/components/CasinoBrand";
import VisitSiteLink from "@/components/VisitSiteLink";
import type { CellContext, ColumnDef, DataRow } from "./columns";

export interface TableColumn {
  key: string;
  label: string;
  def: ColumnDef;
}

const CTA_CLASS =
  "inline-flex cursor-pointer items-center justify-center rounded-md bg-primary-900 px-4 py-2 text-xs font-semibold whitespace-nowrap text-white hover:bg-primary-800";

// The shared table behind every casino and bonus table: Brand first, the
// chosen columns, then the CTA (and an arrow to the review page when
// moreInfo is on). Desktop is a horizontally scrollable table; on mobile the
// rows become cards — a swipeable row ("swipe") or a vertical list ("stack").
export default function DataTable({
  rows,
  ctx,
  columns,
  ctaLabel,
  moreInfo = false,
  mobile = "stack",
}: {
  rows: DataRow[];
  ctx: CellContext;
  columns: TableColumn[];
  ctaLabel: string | null;
  moreInfo?: boolean;
  mobile?: "swipe" | "stack";
}) {
  const hasActions = Boolean(ctaLabel) || moreInfo;
  const swipe = mobile === "swipe";

  return (
    <>
      <div className="section-row md:hidden">
        <ol className={`data-table-cards section-col ${swipe ? "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1" : "flex flex-col gap-3"}`}>
          {rows.map((row, i) => (
            <li
              key={row.key}
              className={`data-table-card flex flex-col gap-3 rounded-lg border border-primary-100 bg-white p-4 text-sm ${swipe ? "w-[220px] shrink-0 snap-start items-center text-center" : ""}`}
            >
              {swipe && <span className="self-start text-sm font-semibold text-primary-500">{i + 1}</span>}
              {row.casino && <CasinoBrand casino={row.casino} layout={swipe ? "stack" : "row"} />}
              <dl className={`flex w-full flex-col gap-2 ${swipe ? "items-center" : ""}`}>
                {columns.map((col) => (
                  <div key={col.key} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-medium text-primary-500">{col.label}</dt>
                    <dd className="text-primary-900">{col.def.render(row, ctx)}</dd>
                  </div>
                ))}
              </dl>
              {row.casino && hasActions && (
                <div className="mt-auto flex w-full flex-col gap-2">
                  {ctaLabel && (
                    <VisitSiteLink href={row.casino.ctaUrl} fallbackHref={`/casinos/${row.casino.slug}`} className={`${CTA_CLASS} w-full py-2.5 text-sm`}>
                      {ctaLabel}
                    </VisitSiteLink>
                  )}
                  {moreInfo && (
                    <Link href={`/casinos/${row.casino.slug}`} className="cursor-pointer text-xs text-primary-600 hover:text-primary-900">
                      More Info
                    </Link>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="section-row hidden md:block">
        <div className="data-table section-col w-full overflow-x-auto rounded-lg border border-primary-100 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="bg-primary-900 text-white">
              <tr>
                <th className="w-28 border-r border-white/20 px-3 py-3 text-center font-medium">Brand</th>
                {columns.map((col) => (
                  <th key={col.key} className="border-r border-white/20 px-3 py-3 text-center font-medium last:border-r-0">
                    {col.label}
                  </th>
                ))}
                {hasActions && (
                  <th className="w-44 px-3 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-primary-100">
                  <td className="border-r border-primary-100 px-3 py-3">{row.casino ? <CasinoBrand casino={row.casino} /> : <span className="block text-center">—</span>}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="border-r border-primary-100 px-3 py-3 text-center text-primary-600 last:border-r-0">
                      <div className="flex justify-center">{col.def.render(row, ctx)}</div>
                    </td>
                  ))}
                  {hasActions && (
                    <td className="bg-surface-muted px-3 py-3">
                      {row.casino && (
                        <div className="flex items-center justify-center gap-2">
                          {ctaLabel && (
                            <VisitSiteLink href={row.casino.ctaUrl} fallbackHref={`/casinos/${row.casino.slug}`} className={`${CTA_CLASS} flex-1`}>
                              {ctaLabel}
                            </VisitSiteLink>
                          )}
                          {moreInfo && (
                            <Link
                              href={`/casinos/${row.casino.slug}`}
                              aria-label={`${row.casino.name} review`}
                              title="More Info"
                              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-white text-primary-900 hover:text-secondary-700"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                <path d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
