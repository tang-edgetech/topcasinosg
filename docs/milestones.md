# Multi-Region Pages CMS — Milestone Plan

Status: **pre-Figma** — this plan is written before design access, so M0 is the audit that will
confirm or revise everything after it. Nothing past M0 should be treated as committed.

## Context

Region-awareness today is inconsistent across the codebase:

| Content type | Region model |
|---|---|
| Casino | many-to-many `regionIds` |
| Bonus / PaymentMethod / RTPEntry | single required `regionId` |
| Guide | nullable `regionId` (global row, or a regional override) |
| Pages (Homepage etc.) | **none** — one global row per slug, e.g. `home` at `/` |

Current regions in the DB: `th` (Thailand), `my` (Malaysia), `sg` (Singapore) — active; `id`
(Indonesia), `vn` (Vietnam) — inactive/planned.

Web already has `/[region]/bonuses`, `/[region]/guides`, `/[region]/payment-methods`,
`/[region]/rtp` dynamic routes. The Pages CMS (built this project) has no regional routing at all
yet — Homepage only exists at `/`.

## The core open question

Does a region get its own page **structure** (different sections, different order), or just
different **content** in the same structure (same sections, region-specific text/casinos/logos)?
The answer is very unlikely to be uniform across every section — some blocks (FAQ, Responsible
Gaming disclaimer) are likely identical everywhere just localized; others (Hero, featured casinos,
licensing logos) are likely genuinely region-specific; there may also be sections that only exist
for one region. This classification is the fact that decides the schema, and it can only come from
comparing the actual region frames in Figma — not guessed in advance.

## M0 — Figma audit (no code)

Goal: classify every section of every region-specific page before touching schema.

- Line up each region's Homepage (and any other region-specific page) frame-by-frame.
- Classify every section into one of:
  - **Shared structure + shared content** (e.g. FAQ, Responsible Gaming)
  - **Shared structure + divergent content** (e.g. Hero heading/image differs per region)
  - **Region-exclusive section** (exists in some regions, not others)
- Check whether region data needs to cross into existing content types — e.g. does "featured
  casinos" pull live Casino rows filtered by region (a data-layer join, no new Pages schema needed)
  vs. the admin hand-picking specific casinos per region (needs per-region field overrides on the
  section)?
- Check Navigation (header/footer menus) and Site Settings (site title, SEO defaults, logo) for
  the same question — region-scoping might need to touch those too, not just `pages`.
- Output: a section-by-section classification table + a gap list (what's already buildable from
  existing region-scoped content vs. what's net-new).

## M1 — Schema decision + migration

Land on one of these (or a variant), based on M0's findings:

1. **Nullable `region_id` on `pages`, scoped-not-global slug uniqueness** — mirrors the existing
   Guide pattern exactly (global row = fallback, regional row = override). Cheapest change, reuses
   a pattern already in the codebase.
2. **Region-conditional sections within one page** — same EAV `page_sections` table, add a
   region-scope (could reuse the Snippets targeting-conditions engine's shape) so a section only
   renders for certain regions. Fits "shared structure, some divergent blocks" without duplicating
   whole pages.
3. **Both, combined** — page-level region override for wholesale differences, section-level region
   tagging for surgical differences. Most flexible, most admin-UI complexity to build and explain.

Deliverable: migration + updated `domain.Page`/`domain.PageSection` + repository/service/handler
changes, following the same additive-migration, validate-before-write conventions already used
elsewhere in this codebase (Snippets, Pages CMS v1/v2).

## M2 — Admin UI

- Region selector on the Pages list/edit screen.
- Region-conditional section editing (however M1 lands — either a page-level region field, a
  per-section region-scope control, or both).
- A "copy to another region" action, if regions are expected to start similar and diverge — likely
  true given SG/MY/TH probably share a lot of casino-review boilerplate.

## M3 — Web routing

- Extend `/[region]` (already exists for Bonuses/Guides/RTP/PaymentMethods) to also resolve
  region-scoped Pages, with fallback-to-global logic from M1.
- Confirm `generateMetadata`/robots/snippets (all built in the Pages CMS v1/v2 work) still resolve
  correctly per region.

## M4 — Content authoring per region

Author real content for each active region (TH/MY/SG) using the finished admin tooling from M2.

## M5 — Cross-region verification

- Confirm fallback behaves correctly for inactive/future regions (ID, VN).
- Confirm nothing regressed for the existing region-scoped content types (Casino/Bonus/Guide/etc.)
- Full `go build`/`go vet` + `npm run build` (admin, web) + curl/rendered-HTML verification per
  region, same discipline used throughout the Pages CMS work so far.

## Open question for next Figma-access session

Is "multiple regions... may cross-over multiple layers" only about the Pages CMS, or does it also
imply a layer above region — e.g. language/currency, or a franchise/brand layer? That changes where
M0's audit should start.
