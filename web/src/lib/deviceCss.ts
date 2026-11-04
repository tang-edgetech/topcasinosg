// The page builder's Mobile / Tablet / Desktop rules, built from the screen
// sizes saved in Site Settings (breakpoints: tablet from 768px and desktop
// from 1200px unless changed). Media queries can't read CSS variables, so
// these rules can't live in shared/theme/sections.css; the root layout puts
// this stylesheet in a <style> tag instead. It covers everything the editor
// sets per device:
//   - "Hide on" (section--hide-{mobile|tablet|desktop})
//   - the Responsive table (section--{maxw|pos|align}-{m|t|d}-{value})
//   - Container rows stacking (container-section__body--stack-{mobile|tablet}),
//     grid columns (--cols-N on desktop, --cols-t-N / --cols-m-N) and carousel
//     slides (container-carousel--N, --t-N / --m-N)
//   - the Style tab's tablet and mobile values (section--st-{t|m}-{prop},
//     web/src/lib/sectionStyle.ts): the desktop value is an inline style that
//     applies everywhere; a tablet value overrides it on tablet and mobile, a
//     mobile value on mobile only. !important so they beat the inline style.
//   - grid columns of repeatable-item blocks and data widgets (pb-cols--{m-|t-|}N:
//     pages.ts columnsClassName, cardLayout.ts GRID_COLUMNS)
// A component's own internal layout (Tailwind sm:/md:/lg: classes) keeps
// Tailwind's fixed sizes.

export interface Breakpoints {
  tablet: number;
  desktop: number;
}

export const DEFAULT_BREAKPOINTS: Breakpoints = { tablet: 768, desktop: 1200 };

// The saved sizes, or the defaults when missing or out of range (mirrors
// domain.Breakpoints.Valid in api/internal/domain/site_settings.go).
export function normalizeBreakpoints(value: Partial<Breakpoints> | null | undefined): Breakpoints {
  const tablet = Number(value?.tablet);
  const desktop = Number(value?.desktop);
  if (Number.isInteger(tablet) && Number.isInteger(desktop) && tablet >= 480 && desktop >= tablet + 100 && desktop <= 2560) {
    return { tablet, desktop };
  }
  return DEFAULT_BREAKPOINTS;
}

const LAYOUT_MAX_WIDTHS = [400, 480, 560, 640, 720, 800, 960, 1080];
const POSITIONS: Record<string, [string, string]> = { left: ["0", "auto"], center: ["auto", "auto"], right: ["auto", "0"] };
const ALIGNS: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end", justify: "" };
const GRID_COLUMNS = [1, 2, 3, 4];
const ITEM_COLUMNS = [1, 2, 3, 4, 5, 6];
const SLIDES = [1, 2, 3, 4];
const SLIDE_GAP = 16;
// Text the Style tab's font size and weight reach inside a component (same
// list as the .section--st-font-size rules in sections.css).
const TEXT_TAGS = ":is(h1, h2, h3, h4, h5, h6, p, li, dt, dd, td, th, figcaption, blockquote, label, span):not(a, button, a *, button *)";

const SECTION = ":is(section, div).section";
const CONTENT_BOX = ":is(.section-container, .container-section__body)";
const GRID = ".container-section__body--grid";

function media(query: string, rules: string[]): string {
  return `@media ${query} {\n${rules.join("\n")}\n}`;
}

function layoutRules(device: string): string[] {
  const box = (cls: string) => `${SECTION}.section--${cls} > ${CONTENT_BOX}`;
  return [
    ...LAYOUT_MAX_WIDTHS.map((px) => `${box(`maxw-${device}-${px}`)} { box-sizing: content-box; width: auto; max-width: ${px}px; }`),
    ...Object.entries(POSITIONS).map(([pos, [left, right]]) => `${box(`pos-${device}-${pos}`)} { margin-left: ${left}; margin-right: ${right}; }`),
    ...Object.entries(ALIGNS).flatMap(([align, items]) => [
      `${box(`align-${device}-${align}`)}, ${box(`align-${device}-${align}`)} * { text-align: ${align}; }`,
      ...(items ? [`${box(`align-${device}-${align}`)} .section-col:is(.items-start, .items-center, .items-end) { align-items: ${items}; }`] : []),
    ]),
  ];
}

function stackRules(classes: string[]): string[] {
  const sel = (suffix: string) => classes.map((c) => `.container-section__body--stack-${c}${suffix}`).join(", ");
  return [`${sel("")} { flex-direction: column; }`, `${sel(" > .section")} { flex: 0 0 auto; width: 100%; }`];
}

function gridColumnRules(cls: string): string[] {
  return GRID_COLUMNS.map((n) => `${GRID}.container-section__body--${cls}${n} > .section { grid-column: span ${12 / n}; }`);
}

function itemColumnRules(cls: string): string[] {
  return ITEM_COLUMNS.map((n) => `.pb-cols.pb-cols--${cls}${n} { grid-template-columns: repeat(${n}, minmax(0, 1fr)); }`);
}

function slideBasis(n: number): string {
  return n === 1 ? "100%" : `calc((100% - ${(n - 1) * SLIDE_GAP}px) / ${n})`;
}

function slideRules(cls: string): string[] {
  return SLIDES.map((n) => `.container-carousel--${cls}${n} .container-carousel__slide { flex-basis: ${slideBasis(n)}; }`);
}

// Style tab overrides for one device (t or m).
function styleRules(d: string): string[] {
  const own = (prop: string) => `.section.section--st-${d}-${prop}:not(.section--container)`;
  const body = (prop: string) => `.section.section--container.section--st-${d}-${prop} > .container-section__body`;
  const sides: [string, string][] = [
    ["pt", "padding-top"],
    ["pr", "padding-right"],
    ["pb", "padding-bottom"],
    ["pl", "padding-left"],
  ];
  const margins: [string, string][] = [
    ["mt", "margin-top"],
    ["mr", "margin-right"],
    ["mb", "margin-bottom"],
    ["ml", "margin-left"],
  ];
  return [
    // Padding: on the component itself, or a Container's inner body.
    ...sides.map(([p, css]) => `${own(p)}, ${body(p)} { ${css}: var(--st-${d}-${p}) !important; }`),
    `.section.section--st-${d}-px:not(.section--container) > .section-container { padding-inline: 0; }`,
    ...margins.map(([p, css]) => `.section.section--st-${d}-${p} { ${css}: var(--st-${d}-${p}) !important; }`),
    `${own("minh")} { min-height: var(--st-${d}-minh) !important; }`,
    `${body("minh")} { min-height: var(--st-${d}-minh) !important; }`,
    `.section.section--st-${d}-fs { font-size: var(--st-${d}-fs) !important; }`,
    `${own("fs")} ${TEXT_TAGS} { font-size: var(--st-${d}-fs) !important; line-height: 1.4; }`,
    // Container gap: between columns, then between rows.
    `.section.section--st-${d}-gap { --container-gap: var(--st-${d}-gap) !important; --container-row-gap: var(--st-${d}-row-gap, var(--st-${d}-gap)) !important; }`,
  ];
}

export function deviceCss(value?: Partial<Breakpoints> | null): string {
  const { tablet, desktop } = normalizeBreakpoints(value);
  const mobileQ = `(max-width: ${tablet - 0.02}px)`;
  const tabletQ = `(min-width: ${tablet}px) and (max-width: ${desktop - 0.02}px)`;
  const belowDesktopQ = `(max-width: ${desktop - 0.02}px)`;
  const desktopQ = `(min-width: ${desktop}px)`;

  return [
    `/* Page builder devices: mobile < ${tablet}px, tablet ${tablet}-${desktop - 1}px, desktop ${desktop}px+ */`,
    `.pb-cols { grid-template-columns: repeat(1, minmax(0, 1fr)); }`,

    // Mobile.
    media(mobileQ, [
      `.section--hide-mobile { display: none !important; }`,
      ...stackRules(["mobile", "tablet"]),
      ...gridColumnRules("cols-m-"),
      `${GRID} > .section.section--w-full { grid-column: span 12; }`,
      ...slideRules("m-"),
      ...itemColumnRules("m-"),
      ...layoutRules("m"),
    ]),

    // Tablet.
    media(tabletQ, [
      `.section--hide-tablet { display: none !important; }`,
      ...stackRules(["tablet"]),
      `${GRID} > .section { grid-column: span 6; }`,
      ...gridColumnRules("cols-t-"),
      `${GRID} > .section:is(.section--w-full, .section--w-2-3, .section--w-3-4) { grid-column: span 12; }`,
      `.container-carousel__slide { flex-basis: ${slideBasis(2)}; }`,
      `.container-carousel--1 .container-carousel__slide { flex-basis: 100%; }`,
      ...slideRules("t-"),
      ...itemColumnRules("t-"),
      ...layoutRules("t"),
    ]),

    // Desktop.
    media(desktopQ, [
      `.section--hide-desktop { display: none !important; }`,
      `${GRID} > .section { grid-column: span 6; }`,
      ...gridColumnRules("cols-"),
      `${GRID} > .section.section--w-full { grid-column: span 12; }`,
      `${GRID} > .section.section--w-3-4 { grid-column: span 9; }`,
      `${GRID} > .section.section--w-2-3 { grid-column: span 8; }`,
      `${GRID} > .section.section--w-1-2 { grid-column: span 6; }`,
      `${GRID} > .section.section--w-1-3 { grid-column: span 4; }`,
      `${GRID} > .section.section--w-1-4 { grid-column: span 3; }`,
      ...slideRules(""),
      ...itemColumnRules(""),
      ...layoutRules("d"),
    ]),

    // Style tab values: tablet ones reach mobile too, mobile ones come last.
    media(belowDesktopQ, styleRules("t")),
    media(mobileQ, styleRules("m")),
  ].join("\n");
}
