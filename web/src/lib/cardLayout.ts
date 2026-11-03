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

// Grid columns per "perRow": fewer on small screens so cards keep a
// readable width. Full class names, so Tailwind generates every option.
export const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};
