# TopCasinoSG — Project Overview

A casino review/comparison platform for Southeast Asia: a public site and an admin CMS
(both Next.js), backed by a Go API — all three live in this one repo.

## Repo layout

- `admin/` — Next.js 16 admin dashboard (`npm run dev` → port 4001)
- `web/` — Next.js 16 public site (`npm run dev` → port 4000)
- `api/` — Go backend (`go run ./cmd/api` → port 8090, module
  `github.com/tang-edgetech/topcasinosg/api`). `internal/` follows
  domain/repository/service/handler layers; `internal/db/migrations/` holds additive SQL
  migrations, run automatically on startup. Gitignored: `api/bin/`, `api/uploads/`,
  `api/tmp/`, and any `.env*` — `config.Load()` (`api/internal/config/config.go`) falls
  back to dev-friendly defaults (DSN `root:@tcp(127.0.0.1:3306)/topcasinosg`, dev JWT
  secret, etc.) when no `.env` is present, so it runs locally with zero setup as long as
  MySQL is up and the `topcasinosg` DB exists.
- `shared/theme/` — CSS design tokens and section layout rules imported by **both**
  frontend apps (`tokens.css`, `sections.css`, `rich-text.css`)
- `docs/` — planning docs: [milestones.md](docs/milestones.md) (multi-region Pages CMS
  roadmap, status: pre-Figma) and [theme.md](docs/theme.md) (Figma-sourced design tokens)

Both frontend apps reach the API via `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:8090`). Code comments in `admin/src/lib` reference the API's Go source
paths directly (e.g. `api/internal/domain/user.go`) as the source of truth — client-side
logic there is a UI-only mirror; the API enforces the real rules independently.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 — both apps
- `admin/` additionally: antd v6, Tiptap (rich text editor), `qrcode` (2FA setup)
- `web/` additionally: `sanitize-html` (sanitizing CMS-authored HTML before render)

## Domain model (mirrors the Go API)

- **Regions**: `th`/`my`/`sg` active, `id`/`vn` planned. Region-scoping is inconsistent by
  design across content types today — Casino uses many-to-many `regionIds`,
  Bonus/PaymentMethod/RTPEntry use a single required `regionId`, Guide uses a nullable
  `regionId` (global row = fallback, regional row = override), and Pages has no region
  model yet. See [docs/milestones.md](docs/milestones.md) for the plan to unify this.
- **Admin dashboard sections** (`admin/src/app/dashboard/*`): Casinos, Bonuses, Payment
  Methods, RTP Entries, Guides, Blacklist, News, Regions, Users, Pages, Navigation,
  Snippets, Site Settings, Media Library.
- **Users**: roles are `super_admin` > `admin` > `editor` (`admin/src/lib/roles.ts`,
  `types.ts`) — admins can manage editors and, if `canManageAdmins`, other admins.
- **Pages CMS**: a page is an ordered list of `PageSection` blocks (`hero`, `rich_text`,
  `cta`, `faq`, `icon_box_group`, `image_gallery`, `logo_strip`, `stats_counter`, ...),
  each with typed fields (`text`/`richtext`/`image`/`button`). Editor lives in
  `admin/src/app/dashboard/pages/*` (`BlockFields.tsx`, `SectionBuilder.tsx`); renderers
  live in `web/src/components/sections/*`, dispatched by `SectionRenderer.tsx`.
- **Navigation** menu items can be static, or dynamic (`dynamic_regions`, `dynamic_casinos`).
- **Snippets** inject head/body/footer HTML/CSS/JS, optionally targeted by conditions
  (page/URL is/is_not/contains).

## Auth

Cookie-based sessions with rotating refresh tokens (`admin/src/lib/api.ts`): a 401
triggers one shared `/api/admin/auth/refresh` call, and concurrent 401s share that single
call rather than each firing their own (refresh tokens are single-use, so a second parallel
call would race against an already-rotated token). Auth endpoints themselves never trigger
this retry — a 401 from a bad password is a real answer, not an expired-token race. OTP-based
2FA is supported (`otp_required` / `otp_setup_required` login states).

## Conventions

- **Design tokens** (colors, etc.) are defined once in `shared/theme/tokens.css` and
  imported by both apps — never redefine colors locally; edit that file instead.
- **Section layout**: every section component under `web/src/components/sections/` nests
  `.section-container` → `.section-row` → `.section-col` (defined in
  `shared/theme/sections.css`, 1270px max-width / 25px gutter), so page rhythm stays
  consistent regardless of block type.
- Backend-touching work follows additive migrations and validate-before-write (per
  conventions noted in `docs/milestones.md` from the Snippets/Pages CMS work) — confirm
  specifics against the API repo itself when it matters.
- Before considering backend-touching work done: `go build`/`go vet` on the API,
  `npm run build` on both `admin/` and `web/`, plus a rendered-HTML/curl check.

## Active planning

- [docs/milestones.md](docs/milestones.md) — multi-region Pages CMS plan. Currently at
  M0 (Figma audit, no code yet) — nothing past M0 should be treated as committed.
- [docs/theme.md](docs/theme.md) — design tokens pulled from Figma; button component
  variants and the full type scale are still open questions.

## Not covered here

Deeper Go-side conventions (repository/service/handler patterns, migration numbering,
etc.) beyond what's summarized above — read `api/internal/` directly when it matters.
