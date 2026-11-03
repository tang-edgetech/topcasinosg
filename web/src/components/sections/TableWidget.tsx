import { field, itemIndexes, sectionClassName, type PageSection } from "@/lib/pages";
import { WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";

const MAX_COLUMNS = 6;

// Table widget: a simple table of 2-6 columns. The column headings are the
// section's own fields (h1..h6), each row an item with c1..c6; rows can be
// striped. Scrolls sideways on small screens instead of squashing.
export default function TableWidget({ section }: { section: PageSection }) {
  const text = (itemIndex: number, key: string) => field(section.fields, itemIndex, key)?.textValue ?? "";
  const columns = Math.min(MAX_COLUMNS, Math.max(2, parseInt(text(0, "columns"), 10) || 3));
  const cols = Array.from({ length: columns }, (_, c) => c + 1);
  const headers = cols.map((c) => text(0, `h${c}`));
  const rows = itemIndexes(section.fields).filter((i) => cols.some((c) => text(i, `c${c}`)));
  if (rows.length === 0) return null;
  const striped = text(0, "striped") !== "no";

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--table", section)}>
      <div className={WIDGET_CONTAINER}>
        <div className="widget-table overflow-x-auto rounded-lg border border-primary-100">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            {headers.some(Boolean) && (
              <thead>
                <tr className="bg-primary-900 text-white">
                  {headers.map((h, c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((i, r) => (
                <tr key={i} className={`border-t border-primary-100 ${striped && r % 2 === 1 ? "bg-primary-50/60" : "bg-white"}`}>
                  {cols.map((c) => (
                    <td key={c} className="px-4 py-3 align-top whitespace-pre-line text-primary-700">
                      {text(i, `c${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionTag>
  );
}
