import type { CSSProperties, ReactNode } from "react";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import HorizontalSlider from "@/components/HorizontalSlider";
import ContainerTabs from "./ContainerTabs";

const GAP_VALUES: Record<string, string> = { s: "16px", m: "30px", l: "50px" };
const SPACE_VALUES: Record<string, string> = { none: "0px", s: "25px", m: "50px", l: "80px" };
const CONTENT_WIDTHS: Record<string, string> = { "1270": "1270px", "960": "960px", "768": "768px", full: "none" };
const ALIGN_CLASSES: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const GRID_COLUMNS = ["2", "3", "4"];
const SLIDES_PER_VIEW = ["1", "2", "3", "4"];
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
export default function ContainerSection({ section, panels }: { section: PageSection; panels: ContainerPanel[] }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const layout = text("layout");
  const grid = layout === "grid";
  const light = text("textTone") === "light";
  const columns = GRID_COLUMNS.includes(text("columns")) ? text("columns") : "2";
  const gap = GAP_VALUES[text("gap")] ?? (grid || PANEL_LAYOUTS.includes(layout) ? GAP_VALUES.m : GAP_VALUES.l);
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
  const classes = ["section--container", `section--container-${layout || "stack"}`, hasBleedBg && "section--bg", light && "section--tone-light"];

  return (
    <section id={section.customId || undefined} className={sectionClassName(classes.filter(Boolean).join(" "), section)} style={style}>
      <ContainerBody layout={layout} light={light} columns={columns} text={text} panels={panels} style={bodyStyle} />
    </section>
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
          trackClassName={`container-carousel container-carousel--${perView}`}
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

  const bodyClasses =
    layout === "grid"
      ? `container-section__body--grid container-section__body--boxed container-section__body--cols-${columns} ${ALIGN_CLASSES[text("align")] ?? ALIGN_CLASSES.stretch}`
      : "container-section__body--stack flex flex-col";
  return (
    <div className={`${base} ${bodyClasses}`} style={style}>
      {panels.map((panel) => panel.content)}
    </div>
  );
}
