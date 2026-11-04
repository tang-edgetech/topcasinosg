import type { CSSProperties, ReactNode } from "react";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import HorizontalSlider from "@/components/HorizontalSlider";
import ContainerTabs from "./ContainerTabs";
import SectionTag from "./SectionTag";
import { boxSides, minHeightValue } from "@/lib/sectionStyle";

const GAP_VALUES: Record<string, string> = { s: "16px", m: "30px", l: "50px" };
const SPACE_VALUES: Record<string, string> = { none: "0px", s: "25px", m: "50px", l: "80px" };
const CONTENT_WIDTHS: Record<string, string> = { "1270": "1270px", "960": "960px", "768": "768px", full: "none" };
const ALIGN_CLASSES: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const JUSTIFY_CLASSES: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};
const MIN_HEIGHTS: Record<string, string> = { s: "200px", m: "400px", l: "600px", screen: "100vh" };
const STACK_ON = ["mobile", "tablet", "never"];
const GRID_COLUMNS = ["2", "3", "4"];
const SLIDES_PER_VIEW = ["1", "2", "3", "4"];
// Tablet and mobile columns / slides (columnsTablet, perViewMobile, ...):
// blank keeps the default (2 on tablet, 1 on mobile; a carousel peeks the
// next slide on mobile). Classes from lib/deviceCss.ts.
const DEVICE_COUNTS = ["1", "2", "3", "4"];

function deviceCountClasses(text: (key: string) => string, key: string, prefix: string): string {
  return [
    DEVICE_COUNTS.includes(text(`${key}Tablet`)) && `${prefix}t-${text(`${key}Tablet`)}`,
    DEVICE_COUNTS.includes(text(`${key}Mobile`)) && `${prefix}m-${text(`${key}Mobile`)}`,
  ]
    .filter(Boolean)
    .join(" ");
}
const PANEL_LAYOUTS = ["tabs", "accordion", "carousel"];

export interface ContainerPanel {
  id: number;
  title: string;
  visibility: string;
  content: ReactNode;
}

// Wraps the sections placed inside it in the editor (PageSection.inContainer)
// with one shared background - e.g. Figma's "Blacklisted Casinos to Avoid"
// band: a Title & Text component then a Blacklist Preview over a single
// navy-to-red gradient. layout "stack" keeps them one under another;
// "grid" puts them in 2/3/4 columns, each child optionally spanning its own
// width (custom_class section--w-*, see sections.css); "tabs" shows one
// component at a time under a row of tabs, "accordion" as expandable items
// and "carousel" as a swipeable slider. Content width, gap and space
// above/below are presets, and textTone "light" turns the text of Title &
// Text, Rich Text, Image/Video captions and dividers inside white.
// "row" puts them side by side (flex): each takes an equal share, or its
// own "Width in container"; justify and align place them, and the row
// stacks on mobile (or tablet, or never: stackOn). A Container inside
// another one (nested, depth 1+) is a box in its parent: full width of its
// slot, no space of its own unless set, its background inside the box.
// componentSpacing "own" (stack layout only) leaves spacing to the components:
// each keeps its own padding and width and the container adds none - what
// the wrapper Containers from migration 0084 use, so pages that predate the
// Container-only top level look exactly as they did.
export default function ContainerSection({ section, panels }: { section: PageSection; panels: ContainerPanel[] }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const layout = text("layout");
  const grid = layout === "grid";
  const nested = Boolean(section.nested);
  const ownSpacing = (layout || "stack") === "stack" && text("componentSpacing") === "own";
  const light = text("textTone") === "light";
  const columns = GRID_COLUMNS.includes(text("columns")) ? text("columns") : "2";
  // gap: a preset (s/m/l), or px from the Style tab: "24" or "24 40" (between
  // rows, then between columns).
  const [rowGap, columnGap] = boxSides(GAP_VALUES[text("gap")] ? "" : text("gap"));
  const gap = ownSpacing ? "0px" : (GAP_VALUES[text("gap")] ?? columnGap ?? (grid || PANEL_LAYOUTS.includes(layout) ? GAP_VALUES.m : GAP_VALUES.l));
  const minHeight = MIN_HEIGHTS[text("minHeight")] ?? minHeightValue(text("minHeight"));
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  // A nested Container fills its slot unless a width is chosen, and adds no
  // space of its own unless set.
  const defaultSpace = nested ? SPACE_VALUES.none : SPACE_VALUES.m;
  // Padding from the Style tab (px per side) wins over the space presets.
  const [padTop, padRight, padBottom, padLeft] = boxSides(text("stPadding"));
  const style = {
    ...bgStyle,
    "--container-max": CONTENT_WIDTHS[text("contentWidth")] ?? (nested ? CONTENT_WIDTHS.full : CONTENT_WIDTHS["1270"]),
    "--container-gap": gap,
    ...(!ownSpacing && rowGap && rowGap !== gap ? { "--container-row-gap": rowGap } : {}),
    ...(minHeight ? { "--container-min-height": minHeight } : {}),
  } as CSSProperties;
  const bodyStyle: CSSProperties = ownSpacing
    ? {}
    : {
        paddingTop: padTop ?? SPACE_VALUES[text("spaceTop")] ?? defaultSpace,
        paddingBottom: padBottom ?? SPACE_VALUES[text("spaceBottom")] ?? defaultSpace,
        ...(nested ? { paddingInline: SPACE_VALUES[text("spaceSides")] ?? SPACE_VALUES.none } : {}),
        ...(padRight ? { paddingRight: padRight } : {}),
        ...(padLeft ? { paddingLeft: padLeft } : {}),
      };
  const classes = [
    "section--container",
    `section--container-${layout || "stack"}`,
    ownSpacing && "section--container-own",
    nested && "section--container-nested",
    minHeight && "section--container-min-height",
    hasBleedBg && "section--bg",
    light && "section--tone-light",
  ];

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName(classes.filter(Boolean).join(" "), section)} style={style}>
      <ContainerBody layout={layout} light={light} columns={columns} text={text} panels={panels} style={bodyStyle} />
    </SectionTag>
  );
}

function ContainerBody({
  layout,
  light,
  columns,
  text,
  panels,
  style,
}: {
  layout: string;
  light: boolean;
  columns: string;
  text: (key: string) => string;
  panels: ContainerPanel[];
  style: CSSProperties;
}) {
  const base = "container-section__body relative z-10";

  if (layout === "tabs") {
    return (
      <div className={`${base} container-section__body--boxed`} style={style}>
        <ContainerTabs panels={panels} align={text("tabsAlign") === "center" ? "center" : "start"} />
      </div>
    );
  }

  if (layout === "accordion") {
    const firstOpen = text("firstOpen") !== "no";
    return (
      <div className={`${base} container-section__body--boxed container-accordion flex flex-col`} style={style}>
        {panels.map((panel, index) => (
          <details key={panel.id} open={firstOpen && index === 0} className={`container-accordion__item ${panel.visibility}`}>
            <summary className="container-accordion__summary tone-heading">
              <span>{panel.title}</span>
              <span aria-hidden="true" className="container-accordion__icon" />
            </summary>
            <div className="container-panel container-accordion__panel">{panel.content}</div>
          </details>
        ))}
      </div>
    );
  }

  if (layout === "carousel") {
    const perView = SLIDES_PER_VIEW.includes(text("perView")) ? text("perView") : "3";
    return (
      <div className={`${base} container-section__body--boxed`} style={style}>
        <HorizontalSlider
          showArrows
          arrowTheme={light ? "dark" : "light"}
          label="Carousel"
          trackClassName={`container-carousel container-carousel--${perView} ${deviceCountClasses(text, "perView", "container-carousel--")}`.trim()}
          slideClassName={panels.map((panel) => `container-carousel__slide ${panel.visibility}`)}
        >
          {panels.map((panel) => (
            <div key={panel.id} className="container-panel">
              {panel.content}
            </div>
          ))}
        </HorizontalSlider>
      </div>
    );
  }

  if (layout === "row") {
    const stackOn = STACK_ON.includes(text("stackOn")) ? text("stackOn") : "mobile";
    const rowClasses = [
      "container-section__body--row container-section__body--boxed flex",
      `container-section__body--stack-${stackOn}`,
      text("wrap") === "no" ? "flex-nowrap" : "flex-wrap",
      JUSTIFY_CLASSES[text("justify")] ?? JUSTIFY_CLASSES.start,
      ALIGN_CLASSES[text("align")] ?? ALIGN_CLASSES.stretch,
    ];
    return (
      <div className={`${base} ${rowClasses.join(" ")}`} style={style}>
        {panels.map((panel) => panel.content)}
      </div>
    );
  }

  const bodyClasses =
    layout === "grid"
      ? `container-section__body--grid container-section__body--boxed container-section__body--cols-${columns} ${deviceCountClasses(text, "columns", "container-section__body--cols-")} ${ALIGN_CLASSES[text("align")] ?? ALIGN_CLASSES.stretch}`
      : ["container-section__body--stack flex flex-col", ALIGN_CLASSES[text("align")], JUSTIFY_CLASSES[text("justify")]].filter(Boolean).join(" ");
  return (
    <div className={`${base} ${bodyClasses}`} style={style}>
      {panels.map((panel) => panel.content)}
    </div>
  );
}
