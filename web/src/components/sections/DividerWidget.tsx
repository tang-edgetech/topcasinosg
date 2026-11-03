import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { JUSTIFY, WIDGET_CONTAINER } from "@/lib/widgets";

const STYLE: Record<string, string> = { solid: "border-solid", dashed: "border-dashed", dotted: "border-dotted" };
const WIDTH: Record<string, string> = { full: "w-full", half: "w-1/2", short: "w-24" };
const WEIGHT: Record<string, string> = { thin: "border-t", thick: "border-t-[3px]" };
const COLOR: Record<string, string> = { light: "border-primary-100", navy: "border-primary-900", gold: "border-secondary-600" };
const SPACE: Record<string, string> = { none: "py-0", s: "py-2", m: "py-5", l: "py-10" };

// Divider widget: a line in a style, length, thickness and colour, with
// space above and below. Without a colour it follows the text around it.
export default function DividerWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const lineClass = [
    "m-0 border-0",
    WEIGHT[text("weight")] ?? WEIGHT.thin,
    STYLE[text("style")] ?? STYLE.solid,
    WIDTH[text("width")] ?? WIDTH.full,
    COLOR[text("color")] ?? "tone-line",
  ].join(" ");

  return (
    <div id={section.customId || undefined} className={sectionClassName("section--divider", section)}>
      <div className={`${WIDGET_CONTAINER} flex ${JUSTIFY[text("align")] ?? JUSTIFY.center} ${SPACE[text("space")] ?? SPACE.m}`}>
        <hr className={lineClass} />
      </div>
    </div>
  );
}
