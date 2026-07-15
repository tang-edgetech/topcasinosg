# Theme tokens — extracted from Figma

Source: Figma file `FIxPrtniUyAFIJGxltaXSp` ("Top Casino SG — Dev Team"), **Element** page,
node `3006:8990` (group containing Color Pallet, Button Styling 1/2, Star Rating, Icons, Logo,
Country Flags). Pulled via the Figma REST API on 2026-07-15, not by hand-inspecting the canvas.

Single source of truth for these values in code: [`shared/theme/tokens.css`](../shared/theme/tokens.css),
imported by both `web/` and `admin/`. Don't redefine colors locally in either app — edit that file.

## Colors

| Role | 900 | 800 | 700 | 600 | 500 | 400 | 300 | 200 | 100 | 50 |
|---|---|---|---|---|---|---|---|---|---|---|
| Primary (indigo) | `#1a1e71` | `#273086` | `#2f3a92` | `#38439e` | `#3e4ba8` | `#5a65b4` | `#7781c1` | `#9da4d3` | `#c3c8e5` | `#e7e9f4` |
| Secondary (amber) | `#f87300` | `#f89200` | `#f7a300` | `#f7b500` | `#f7c30b` | `#f7cc2a` | `#f8d650` | `#fae183` | `#fbedb4` | `#fdf8e1` |

Other tokens: `--color-success` (`#00bb9e`, w/ `--color-success-subtle` at `#e6f9f6`),
`--color-danger` (`#ff4553`), `--color-star` (`#ffd54e`), `--color-primary-glow` (`#3139d7`,
used only as the far end of the primary button's hover gradient).

Two gradients exist in Figma but aren't tokenized as CSS variables (Tailwind v4 gradients are
composed via utilities, not a single custom property):
- `Gradient/Primary`: `#1a1e71` → `#3139d7` (`bg-gradient-to-r from-primary-900 to-primary-glow`)
- `Gradient/Secondary`: `#f7b500` → `#f87300` (`bg-gradient-to-r from-secondary-600 to-secondary-900`)

## Typography

Font family: **Figtree** (variable font, weights 300–900 available), loaded via `next/font/google`
in both apps' `layout.tsx`. Confirmed text styles from this node: 15px/18px and 16px/19.2px,
Regular (400) and Bold (700). The full heading/body type scale wasn't present in this node — it's
expected on the Desktop/Mobile pages where real page text uses named text styles in context; pull
those next when we get to actual page layouts.

## Buttons — open question, not yet finalized

The button component (`Button Styling 1` / `Button Styling 2`) has real, confirmed default-state
values: `Primary/900` fill, 5px corner radius, white text, arrow icon accented in `Secondary/600`,
hover state swaps to `Gradient/Primary`.

Beyond that, the component's Figma variant names are inconsistent (`ori`, `hower`/`howe` —
typos of "hover", plus untyped color suffixes `(orange)`/`(red)`/`(green)` and a separate `(M)`
mobile suffix) and don't map to named semantic states (primary/danger/success/warning). Decision
on what those map to is deferred — see conversation from 2026-07-15. Don't build a `<Button>`
component with hardcoded variant props until that's resolved; it'll need to be redone.

## Known gaps

- No spacing/grid scale extracted yet.
- No shadow/elevation tokens extracted yet.
- Full typography scale (headings) not yet pulled — needs the Desktop/Mobile Figma pages.
