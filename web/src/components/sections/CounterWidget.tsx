import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { ITEMS_ALIGN, WIDGET_COLOR, WIDGET_CONTAINER } from "@/lib/widgets";
import CountUpNumber from "./CountUpNumber";
import SectionTag from "./SectionTag";

const SIZE: Record<string, string> = { m: "text-4xl", l: "text-5xl", xl: "text-6xl" };

// Counter widget: one big number (with an optional prefix and suffix, like
// "$" or "+") that counts up when it scrolls into view, and a label under it.
export default function CounterWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const number = text("number");
  if (!number) return null;
  const align = text("align") || "center";

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--counter", section)}>
      <div className={`${WIDGET_CONTAINER} flex flex-col gap-1 ${ITEMS_ALIGN[align] ?? ITEMS_ALIGN.center} ${align === "center" ? "text-center" : ""}`}>
        <span className={`widget-counter__number font-bold tabular-nums ${SIZE[text("size")] ?? SIZE.l} ${WIDGET_COLOR[text("color")] ?? "tone-heading"}`}>
          <CountUpNumber value={number} prefix={text("prefix")} suffix={text("suffix")} />
        </span>
        {text("label") && <span className="widget-counter__label tone-text text-base">{text("label")}</span>}
      </div>
    </SectionTag>
  );
}
