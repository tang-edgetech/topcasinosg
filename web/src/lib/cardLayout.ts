// "Layout" option of the data widgets (Top Bonus Picks, Top Casinos By
// Region, Blacklist Preview, Game RTP Carousel, Content Carousel, Region
// Explorer, Data Table), as the admin's DisplayFields stores it
// (admin/src/app/dashboard/pages/BlockFields.tsx): field "display" picks
// how the cards are laid out, "perRow" how many sit in a grid row. Blank or
// unknown values keep each widget's original look (the first allowed value).

export type CardDisplay = "swipe" | "carousel" | "grid" | "list" | "table" | "cards" | "panel";

export function cardDisplay<T extends CardDisplay>(value: string | undefined, allowed: readonly T[]): T {
  return allowed.includes(value as T) ? (value as T) : allowed[0];
}

export function perRow(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 6 ? n : fallback;
}

// Grid columns per "perRow" on desktop, fewer on tablet and mobile so cards
// keep a readable width (the pb-cols classes follow the Site Settings screen
// sizes: lib/deviceCss.ts).
export const GRID_COLUMNS: Record<number, string> = {
  1: "pb-cols pb-cols--m-1 pb-cols--t-1 pb-cols--1",
  2: "pb-cols pb-cols--m-1 pb-cols--t-2 pb-cols--2",
  3: "pb-cols pb-cols--m-1 pb-cols--t-2 pb-cols--3",
  4: "pb-cols pb-cols--m-1 pb-cols--t-2 pb-cols--4",
  5: "pb-cols pb-cols--m-2 pb-cols--t-3 pb-cols--5",
  6: "pb-cols pb-cols--m-2 pb-cols--t-3 pb-cols--6",
};
