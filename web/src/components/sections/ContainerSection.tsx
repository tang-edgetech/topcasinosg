import type { CSSProperties, ReactNode } from "react";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";

const GAP_VALUES: Record<string, string> = { s: "16px", m: "30px", l: "50px" };
const SPACE_VALUES: Record<string, string> = { none: "0px", s: "25px", m: "50px", l: "80px" };
const CONTENT_WIDTHS: Record<string, string> = { "1270": "1270px", "960": "960px", "768": "768px", full: "none" };
const ALIGN_CLASSES: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const GRID_COLUMNS = ["2", "3", "4"];

// Wraps the sections placed inside it in the editor (PageSection.inContainer)
// with one shared background - e.g. Figma's "Blacklisted Casinos to Avoid"
// band: a Title & Text component then a Blacklist Preview over a single
// navy-to-red gradient. layout "stack" keeps them one under another;
// "grid" puts them in 2/3/4 columns, each child optionally spanning its own
// width (custom_class section--w-*, see sections.css). Content width, gap and
// space above/below are presets, and textTone "light" turns the text of
// Title & Text, Rich Text, Image/Video captions and dividers inside white.
export default function ContainerSection({ section, children }: { section: PageSection; children: ReactNode }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const grid = text("layout") === "grid";
  const columns = GRID_COLUMNS.includes(text("columns")) ? text("columns") : "2";
  const gap = GAP_VALUES[text("gap")] ?? (grid ? GAP_VALUES.m : GAP_VALUES.l);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const style = {
    ...bgStyle,
    "--container-max": CONTENT_WIDTHS[text("contentWidth")] ?? CONTENT_WIDTHS["1270"],
    "--container-gap": gap,
  } as CSSProperties;
  const bodyStyle: CSSProperties = {
    paddingTop: SPACE_VALUES[text("spaceTop")] ?? SPACE_VALUES.m,
    paddingBottom: SPACE_VALUES[text("spaceBottom")] ?? SPACE_VALUES.m,
  };
  const classes = ["section--container", hasBleedBg && "section--bg", text("textTone") === "light" && "section--tone-light"];
  const bodyClasses = grid
    ? `container-section__body--grid container-section__body--cols-${columns} ${ALIGN_CLASSES[text("align")] ?? ALIGN_CLASSES.stretch}`
    : "container-section__body--stack flex flex-col";

  return (
    <section id={section.customId || undefined} className={sectionClassName(classes.filter(Boolean).join(" "), section)} style={style}>
      <div className={`container-section__body relative z-10 ${bodyClasses}`} style={bodyStyle}>
        {children}
      </div>
    </section>
  );
}
