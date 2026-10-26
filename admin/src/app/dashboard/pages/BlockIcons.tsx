import type { ReactNode } from "react";
import type { PageBlockType } from "@/lib/types";

// Small wireframe thumbnails for the "Add Component" picker — each sketches
// the block's layout so editors can recognise it at a glance. Drawn on a
// 48×32 grid in currentColor; `solid` shapes are the tinted accents.
const line = (x: number, y: number, w: number, key?: string | number) => <rect key={key} x={x} y={y} width={w} height={2} rx={1} />;
const box = (x: number, y: number, w: number, h: number, key?: string | number) => (
  <rect key={key} x={x} y={y} width={w} height={h} rx={2} fill="none" stroke="currentColor" strokeWidth={1.5} />
);
const solid = (x: number, y: number, w: number, h: number, key?: string | number) => (
  <rect key={key} x={x} y={y} width={w} height={h} rx={2} fillOpacity={0.3} />
);
const dot = (cx: number, cy: number, r: number, key?: string | number) => <circle key={key} cx={cx} cy={cy} r={r} />;
const repeat = (count: number, draw: (i: number) => ReactNode) => Array.from({ length: count }, (_, i) => draw(i));

const BLOCK_ICON_SHAPES: Record<PageBlockType, ReactNode> = {
  hero: [line(4, 8, 18, 1), line(4, 13, 14, 2), solid(4, 19, 10, 5, 3), box(27, 5, 17, 22, 4)],
  rich_text: [line(4, 6, 20, 1), ...repeat(4, (i) => line(4, 12 + i * 4, i === 3 ? 26 : 40, `l${i}`))],
  icon_box_group: repeat(3, (i) => [box(3 + i * 15, 6, 13, 20, `b${i}`), dot(9.5 + i * 15, 12, 2.5, `d${i}`), line(5 + i * 15, 18, 9, `l${i}`)]),
  logo_strip: [line(14, 5, 20, 1), ...repeat(4, (i) => solid(3 + i * 11.5, 14, 9, 8, `s${i}`))],
  stats_counter: repeat(3, (i) => [box(3 + i * 15, 7, 13, 18, `b${i}`), solid(6 + i * 15, 11, 7, 4, `s${i}`), line(6 + i * 15, 19, 7, `l${i}`)]),
  faq: repeat(4, (i) => [box(4, 3 + i * 7, 40, 5, `b${i}`), line(7, 4.5 + i * 7, 18, `l${i}`)]),
  bonus_calculator: [box(4, 4, 24, 24, 1), line(7, 9, 18, 2), line(7, 15, 18, 3), solid(7, 21, 18, 4, 4), box(31, 4, 13, 24, 5), solid(34, 12, 7, 6, 6)],
  team_grid: repeat(4, (i) => [box(3 + i * 11.5, 5, 9.5, 12, `b${i}`), dot(7.75 + i * 11.5, 11, 2.5, `d${i}`), line(4 + i * 11.5, 21, 7.5, `l${i}`), line(5 + i * 11.5, 25, 5.5, `m${i}`)]),
  top_casinos_by_region: [...repeat(3, (i) => [box(3 + i * 15, 3, 13, 14, `b${i}`), dot(9.5 + i * 15, 8, 2.5, `d${i}`)]), ...repeat(3, (i) => line(3, 21 + i * 4, 42, `t${i}`))],
  blacklist_preview: [...repeat(3, (i) => [box(3 + i * 15, 6, 13, 20, `b${i}`), solid(6 + i * 15, 9, 7, 7, `s${i}`)]), line(5, 22, 9, "x")],
  content_carousel: [...repeat(3, (i) => [box(3 + i * 15, 4, 13, 20, `b${i}`), solid(3 + i * 15, 4, 13, 8, `s${i}`)]), dot(21, 28, 1.2, "d1"), dot(24, 28, 1.2, "d2"), dot(27, 28, 1.2, "d3")],
  region_explorer: [line(14, 4, 20, 1), ...repeat(4, (i) => [dot(9 + i * 10, 17, 4, `d${i}`), line(5 + i * 10, 25, 8, `l${i}`)])],
  event_highlights: repeat(2, (i) => [box(3 + i * 22, 4, 20, 24, `b${i}`), solid(3 + i * 22, 4, 20, 10, `s${i}`), line(6 + i * 22, 18, 14, `l${i}`), line(6 + i * 22, 22, 10, `m${i}`)]),
  introduction_section: [solid(3, 3, 42, 14, 1), line(6, 21, 10, 2), line(19, 21, 10, 3), line(32, 21, 10, 4), line(3, 27, 30, 5)],
  numbered_steps: repeat(3, (i) => [box(3 + i * 15, 5, 13, 22, `b${i}`), solid(6 + i * 15, 8, 6, 6, `s${i}`), line(6 + i * 15, 18, 8, `l${i}`), line(6 + i * 15, 22, 6, `m${i}`)]),
  feature_cards: repeat(2, (i) => [box(3 + i * 22, 3, 20, 26, `b${i}`), solid(6 + i * 22, 6, 14, 7, `s${i}`), line(6 + i * 22, 17, 14, `l${i}`), line(6 + i * 22, 21, 10, `m${i}`), line(6 + i * 22, 25, 12, `n${i}`)]),
  checklist_callout: [solid(3, 3, 42, 26, 1), ...repeat(4, (i) => [dot(9, 9 + i * 5, 1.6, `d${i}`), <rect key={`l${i}`} x={13} y={8 + i * 5} width={26} height={2} rx={1} fill="white" />])],
  game_rtp_carousel: [...repeat(4, (i) => [box(3 + i * 11.5, 5, 9.5, 18, `b${i}`), solid(3 + i * 11.5, 5, 9.5, 9, `s${i}`)]), line(18, 27, 12, "x")],
  highlight_panel: [line(4, 5, 14, 1), solid(19, 4, 14, 4, 2), line(4, 11, 40, 3), box(4, 16, 19, 12, 4), box(25, 16, 19, 12, 5)],
  link_card_grid: repeat(4, (i) => [box(3 + (i % 2) * 22, 3 + Math.floor(i / 2) * 14, 20, 12, `b${i}`), solid(6 + (i % 2) * 22, 6 + Math.floor(i / 2) * 14, 12, 3, `s${i}`)]),
  top_bonus_picks: repeat(3, (i) => [box(3 + i * 15, 3, 13, 26, `b${i}`), solid(3 + i * 15, 3, 4, 10, `s${i}`), dot(11 + i * 15, 10, 2.5, `d${i}`), line(5 + i * 15, 18, 9, `l${i}`), solid(5 + i * 15, 23, 9, 3, `c${i}`)]),
  expandable_card_grid: [solid(3, 3, 42, 6, 1), ...repeat(4, (i) => [box(3 + (i % 2) * 22, 12 + Math.floor(i / 2) * 9, 20, 7, `b${i}`), line(20 + (i % 2) * 22, 15 + Math.floor(i / 2) * 9, 3, `p${i}`)])],
  review_columns: [box(3, 3, 20, 26, 1), box(25, 3, 20, 26, 2), ...repeat(3, (i) => [line(6, 8 + i * 6, 14, `a${i}`), line(28, 8 + i * 6, 14, `b${i}`)])],
  cta_link_list: [line(4, 4, 20, 1), ...repeat(3, (i) => [box(4, 9 + i * 7, 40, 5, `b${i}`), line(7, 10.5 + i * 7, 16, `l${i}`)])],
  info_card_columns: [...repeat(2, (i) => box(3, 3 + i * 13, 20, 11, `a${i}`)), ...repeat(2, (i) => solid(25, 3 + i * 13, 20, 11, `b${i}`))],
  game_casino_finder: [solid(3, 3, 42, 6, 1), ...repeat(4, (i) => box(3 + i * 11, 12, 9, 6, `g${i}`)), line(3, 23, 42, 2), line(3, 27, 30, 3)],
  two_column_table: repeat(4, (i) => [box(3, 3 + i * 6.5, 42, 6.5, `r${i}`), line(5, 5 + i * 6.5, 10, `a${i}`), line(20, 5 + i * 6.5, 22, `b${i}`)]),
  data_table: [solid(3, 3, 42, 5, 1), ...repeat(4, (i) => [line(3, 11 + i * 5, 10, `a${i}`), line(16, 11 + i * 5, 12, `b${i}`), line(31, 11 + i * 5, 14, `c${i}`)])],
};

export default function BlockIcon({ blockType, className = "" }: { blockType: PageBlockType; className?: string }) {
  return (
    <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true" className={`block-icon ${className}`}>
      {BLOCK_ICON_SHAPES[blockType] ?? box(3, 3, 42, 26)}
    </svg>
  );
}
