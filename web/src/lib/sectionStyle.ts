// The Style tab's free-form settings (admin/src/app/dashboard/pages/
// StyleControls.tsx), stored as text fields on itemIndex 0 and turned here
// into inline CSS on the section's root element (SectionTag). Every value is
// checked - numbers, brand token names or hex colours only - so a field can
// never inject other CSS.
//
//   stPadding, stMargin   "top right bottom left" in px, "-" = default
//   stMinHeight           "400" (px) or "60vh"
//   stBg                  none | color | linear | radial | image
//   stBgColor, stBgColor2 colours (token name like "primary-900", or #hex)
//   stBgAngle             0-360 (linear gradient, default 90)
//   stBgImage             image field; stBgSize cover|contain|auto,
//                         stBgPosition center|top|bottom|left|right,
//                         stBgOverlay a colour laid over the image
//   stFontSize            px; stFontWeight 300-900; stColor a colour
//   stBorder              none | solid | dashed | dotted | double
//   stBorderWidth px; stBorderColor a colour; stRadius px
//
// Tablet and mobile: stPadding, stMargin, stMinHeight and stFontSize (and a
// Container's gap and minHeight) can also be set per device, as the same key
// plus "Tablet" or "Mobile" (stPaddingTablet, gapMobile, ...). The value
// without a suffix is the desktop one and applies everywhere; a tablet value
// overrides it on tablet and mobile, a mobile value on mobile only. These
// become CSS variables plus marker classes (section--st-{t|m}-{prop}) that
// the generated device stylesheet (lib/deviceCss.ts) picks up.
//
// A Container uses the same fields, but its padding goes on its inner body
// (ContainerSection) and its background on the full-width band
// (sectionBgStyle's bgType fields), so it skips those here.
import type { CSSProperties } from "react";
import { field, mediaUrl, type PageSectionField } from "./pages";

// Colour token names from shared/theme/tokens.css (--color-<name>).
const COLOR_TOKENS = new Set([
  ...["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"].flatMap((n) => [`primary-${n}`, `secondary-${n}`]),
  "primary-glow",
  "success",
  "success-subtle",
  "danger",
  "star",
  "surface",
  "surface-muted",
  "text",
  "text-muted",
  "border",
]);
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function cssColor(value: string | undefined): string | undefined {
  const v = (value ?? "").trim();
  if (!v) return undefined;
  if (v === "white") return "#ffffff";
  if (v === "black") return "#000000";
  if (v === "transparent") return "transparent";
  if (COLOR_TOKENS.has(v)) return `var(--color-${v})`;
  return HEX.test(v) ? v : undefined;
}

function px(value: string | undefined, max = 2000): string | undefined {
  const n = Number((value ?? "").trim());
  return (value ?? "").trim() !== "" && Number.isFinite(n) && n >= 0 && n <= max ? `${n}px` : undefined;
}

// "10 20 - 20" -> [top, right, bottom, left]; "-" or empty = not set. One
// value applies to all four sides.
export function boxSides(value: string | undefined): [string?, string?, string?, string?] {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) parts.push(parts[0], parts[0], parts[0]);
  return [0, 1, 2, 3].map((i) => (parts[i] && parts[i] !== "-" ? px(parts[i]) : undefined)) as [string?, string?, string?, string?];
}

export function minHeightValue(value: string | undefined): string | undefined {
  const v = (value ?? "").trim();
  const vh = /^(\d{1,3})vh$/.exec(v);
  if (vh) return Number(vh[1]) <= 100 ? `${vh[1]}vh` : undefined;
  return px(v, 3000);
}

const BG_SIZES = ["cover", "contain", "auto"];
const BG_POSITIONS = ["center", "top", "bottom", "left", "right"];

export interface BackgroundInput {
  type: string;
  color?: string;
  color2?: string;
  angle?: string;
  imageUrl?: string | null;
  overlay?: string;
}

// The background-image layers for a background setting, or undefined when
// there's nothing to show.
export function backgroundImage(bg: BackgroundInput): string | undefined {
  const a = cssColor(bg.color);
  const b = cssColor(bg.color2) ?? a;
  const angle = Number(bg.angle);
  const deg = bg.angle && Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : 90;
  switch (bg.type) {
    case "color":
      return a ? `linear-gradient(${a}, ${a})` : undefined;
    case "linear":
      return a && b ? `linear-gradient(${deg}deg, ${a}, ${b})` : undefined;
    case "radial":
      return a && b ? `radial-gradient(circle at center, ${a}, ${b})` : undefined;
    case "image": {
      if (!bg.imageUrl || /["()\\\s]/.test(bg.imageUrl)) return undefined;
      const overlay = cssColor(bg.overlay);
      return `${overlay ? `linear-gradient(${overlay}, ${overlay}), ` : ""}url("${bg.imageUrl}")`;
    }
  }
  return undefined;
}

export function backgroundSize(value: string | undefined): string | undefined {
  return BG_SIZES.includes(value ?? "") ? value : undefined;
}

export function backgroundPosition(value: string | undefined): string | undefined {
  return BG_POSITIONS.includes(value ?? "") ? value : undefined;
}

const BORDER_STYLES = ["solid", "dashed", "dotted", "double"];
const FONT_WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];

export interface SectionBox {
  className: string;
  style: CSSProperties;
}

// The Style tab's settings for one section: marker classes (so
// shared/theme/sections.css can reach its content, e.g. text colour) and
// the inline style with the values.
export function sectionBox(fields: PageSectionField[], blockType: string): SectionBox {
  const text = (key: string) => field(fields, 0, key)?.textValue ?? "";
  const container = blockType === "container";
  const classes: string[] = [];
  const style: Record<string, string> = {};

  if (!container) {
    const [pt, pr, pb, pl] = boxSides(text("stPadding"));
    if (pt) style.paddingTop = pt;
    if (pr) style.paddingRight = pr;
    if (pb) style.paddingBottom = pb;
    if (pl) style.paddingLeft = pl;
    if (pr || pl) classes.push("section--st-pad-x");
    const minHeight = minHeightValue(text("stMinHeight"));
    if (minHeight) style.minHeight = minHeight;

    const image = backgroundImage({
      type: text("stBg"),
      color: text("stBgColor"),
      color2: text("stBgColor2"),
      angle: text("stBgAngle"),
      imageUrl: mediaUrl(field(fields, 0, "stBgImage")?.mediaUrl),
      overlay: text("stBgOverlay"),
    });
    if (image) {
      classes.push("section--st-bg");
      style.backgroundImage = image;
      style.backgroundSize = backgroundSize(text("stBgSize")) ?? "cover";
      style.backgroundPosition = backgroundPosition(text("stBgPosition")) ?? "center";
      style.backgroundRepeat = "no-repeat";
    }
  }

  const [mt, mr, mb, ml] = boxSides(text("stMargin"));
  if (mt) style.marginTop = mt;
  if (mr) style.marginRight = mr;
  if (mb) style.marginBottom = mb;
  if (ml) style.marginLeft = ml;

  const fontSize = px(text("stFontSize"), 200);
  if (fontSize) {
    classes.push("section--st-font-size");
    style["--st-font-size"] = fontSize;
  }
  if (FONT_WEIGHTS.includes(text("stFontWeight"))) {
    classes.push("section--st-font-weight");
    style["--st-font-weight"] = text("stFontWeight");
  }
  const color = cssColor(text("stColor"));
  if (color) {
    classes.push("section--text-custom");
    style["--text-preset"] = color;
  }

  const borderStyle = text("stBorder");
  if (BORDER_STYLES.includes(borderStyle)) {
    style.borderStyle = borderStyle;
    style.borderWidth = px(text("stBorderWidth"), 50) ?? "1px";
    style.borderColor = cssColor(text("stBorderColor")) ?? "var(--color-border)";
  } else if (borderStyle === "none") {
    style.border = "0";
  }
  const radius = px(text("stRadius"), 999);
  if (radius) {
    classes.push("section--st-radius");
    style.borderRadius = radius;
  }

  deviceOverrides(text, container, classes, style);

  return { className: classes.join(" "), style: style as CSSProperties };
}

// Field key suffixes of the per-device values, with their class/variable code.
export const DEVICE_SUFFIXES = [
  ["t", "Tablet"],
  ["m", "Mobile"],
] as const;

const SIDE_CODES = ["t", "r", "b", "l"];

function deviceOverrides(text: (key: string) => string, container: boolean, classes: string[], style: Record<string, string>) {
  for (const [d, suffix] of DEVICE_SUFFIXES) {
    const value = (key: string) => text(key + suffix);
    const set = (prop: string, css: string | undefined) => {
      if (!css) return;
      classes.push(`section--st-${d}-${prop}`);
      style[`--st-${d}-${prop}`] = css;
    };
    const padding = boxSides(value("stPadding"));
    padding.forEach((css, i) => set(`p${SIDE_CODES[i]}`, css));
    if (!container && (padding[1] || padding[3])) classes.push(`section--st-${d}-px`);
    boxSides(value("stMargin")).forEach((css, i) => set(`m${SIDE_CODES[i]}`, css));
    set("minh", minHeightValue(value(container ? "minHeight" : "stMinHeight")));
    set("fs", px(value("stFontSize"), 200));
    if (container) {
      // "24" or "24 40": between rows, then between columns.
      const [rowGap, columnGap] = boxSides(value("gap"));
      set("gap", columnGap);
      if (rowGap && rowGap !== columnGap) style[`--st-${d}-row-gap`] = rowGap;
    }
  }
}
