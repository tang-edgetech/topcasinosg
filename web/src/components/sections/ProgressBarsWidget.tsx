import { field, itemIndexes, sectionClassName, type PageSection } from "@/lib/pages";
import { WIDGET_BG, WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";

// Progress Bars widget: labelled bars filled to a percentage (0-100), e.g.
// ratings per category; all bars share one brand colour.
export default function ProgressBarsWidget({ section }: { section: PageSection }) {
  const text = (itemIndex: number, key: string) => field(section.fields, itemIndex, key)?.textValue ?? "";
  const bars = itemIndexes(section.fields)
    .map((i) => ({ i, label: text(i, "label"), percent: Math.max(0, Math.min(100, parseFloat(text(i, "percent")) || 0)) }))
    .filter((bar) => bar.label);
  if (bars.length === 0) return null;
  const fill = WIDGET_BG[text(0, "color")] ?? WIDGET_BG.primary;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--progress-bars", section)}>
      <div className={`${WIDGET_CONTAINER} flex flex-col gap-4`}>
        {bars.map(({ i, label, percent }) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="tone-text flex justify-between gap-3 text-sm font-semibold">
              <span>{label}</span>
              <span className="tabular-nums">{percent}%</span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-primary-50"
              role="progressbar"
              aria-label={label}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={`h-full rounded-full ${fill}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </SectionTag>
  );
}
