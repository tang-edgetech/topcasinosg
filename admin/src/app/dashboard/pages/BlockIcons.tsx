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
  container: [
    <rect key="frame" x={2} y={2} width={44} height={28} rx={3} fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="3 2" />,
    line(6, 6, 18, 1),
    solid(6, 12, 36, 7, 2),
    solid(6, 21, 36, 5, 3),
  ],
  global_section: [
    <rect key="a" x={8} y={2} width={36} height={20} rx={2} fill="none" stroke="currentColor" strokeWidth={1.5} />,
    <rect key="b" x={4} y={8} width={36} height={22} rx={2} fillOpacity={0.3} />,
    line(9, 14, 22, 1),
    line(9, 19, 26, 2),
  ],
  title_set: [solid(4, 9, 30, 5, 1), line(4, 19, 40, 2), line(4, 23, 28, 3)],
  image: [box(6, 4, 36, 24, 1), dot(15, 12, 3, 2), <path key="m" d="M9 25l9-8 6 5 5-4 10 7z" fillOpacity={0.3} />],
  button_group: [solid(4, 12, 18, 8, 1), box(26, 12, 18, 8, 2)],
  spacer: [line(4, 4, 40, 1), <path key="a" d="M24 9v14M20 12l4-3 4 3M20 20l4 3 4-3" fill="none" stroke="currentColor" strokeWidth={1.5} />, line(4, 26, 40, 2)],
  video: [box(4, 4, 40, 24, 1), <path key="p" d="M20 10v12l10-6z" />],
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
  heading: [solid(4, 11, 40, 10, 1)],
  text: repeat(5, (i) => line(4, 6 + i * 5, i === 4 ? 24 : 40, i)),
  icon: [<path key="s" d="M24 6l3 6 6.5 1-4.7 4.6 1.1 6.4L24 21l-5.9 3 1.1-6.4-4.7-4.6 6.5-1z" fillOpacity={0.3} stroke="currentColor" strokeWidth={1.5} />],
  icon_box: [dot(24, 9, 4, 1), solid(14, 16, 20, 4, 2), line(10, 23, 28, 3), line(14, 27, 20, 4)],
  icon_list: repeat(4, (i) => [dot(7, 6 + i * 7, 2, `d${i}`), line(12, 5 + i * 7, i % 2 ? 22 : 30, `l${i}`)]),
  divider: [line(4, 15, 40, 1)],
  card: [box(10, 2, 28, 28, 1), solid(10, 2, 28, 11, 2), line(13, 17, 18, 3), line(13, 21, 22, 4), solid(13, 25, 10, 3, 5)],
  counter: [solid(12, 6, 24, 12, 1), line(14, 23, 20, 2)],
  progress_bars: repeat(3, (i) => [box(4, 5 + i * 9, 40, 5, `b${i}`), solid(4, 5 + i * 9, [32, 24, 36][i], 5, `s${i}`)]),
  alert: [box(4, 7, 40, 18, 1), solid(4, 7, 3, 18, 2), dot(13, 16, 3, 3), line(19, 13, 20, 4), line(19, 18, 14, 5)],
  table: [solid(4, 4, 40, 6, 1), ...repeat(3, (i) => [line(4, 14 + i * 6, 11, `a${i}`), line(18, 14 + i * 6, 11, `b${i}`), line(32, 14 + i * 6, 12, `c${i}`)])],
  star_rating: repeat(5, (i) => <path key={i} d={`M${7 + i * 8.5} 11l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z`} fillOpacity={i < 4 ? 0.6 : 0.2} />),
  testimonial: [<path key="q" d="M6 6h5v5l-3 5H6l2-5H6zM14 6h5v5l-3 5h-2l2-5h-2z" fillOpacity={0.4} />, line(6, 20, 36, 1), dot(9, 27, 3, 2), line(15, 26, 14, 3)],
};

export default function BlockIcon({ blockType, className = "" }: { blockType: PageBlockType; className?: string }) {
  return (
    <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true" className={`block-icon ${className}`}>
      {BLOCK_ICON_SHAPES[blockType] ?? box(3, 3, 42, 26)}
    </svg>
  );
}
