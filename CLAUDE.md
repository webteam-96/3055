# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Digital directory for **Rotary International District 3055** (rotary year 2026-27) — a React 18 + Vite 6 SPA that renders the district's committees, clubs, boards, and member cards for on-screen browsing and print/PDF export.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173/. **Required** to view the app: data loads through Vite dev proxies, so opening built files as static HTML shows nothing.
- `npm run build` — `tsc -b` typecheck then `vite build`.
- `npm run lint` — ESLint over the repo.
- `npm test` — Vitest once (`vitest run`). `npm run test:watch` for watch mode.
- Single test: `npx vitest run src/api/useClubDetails.test.ts` (or `-t "<name pattern>"` for one case).

Running the dev server as a Claude `run_in_background` task gets reaped at turn end. Launch it detached instead — see `memory/run-dev-server.md`.

## Architecture

**Single-fetch data model.** The entire app is backed by ONE API call — `GET /api/district-directory/3055?rotaryYear=2026-27` (the "unified directory") — defined in `src/api/districtDirectory.ts`. That file is the single source of truth:
- `useDistrictDirectory(select, enabled)` is the base hook; every domain hook (`useCommitteeDetails`, `useClubDetails`, `useClubsBOD`, `useClubMembers`, `useDistrictCommittee`) calls it with a pure `select` transform, so all pages share **one cached fetch** (same react-query key, 30-min staleTime).
- `select*` functions (`selectExecutiveCommittee`, `selectCategories`, `selectCommitteeDetails`, `selectClubsBOD`, `selectClubDetails`, `selectClubMembers`) map the raw API shape → the UI types in `src/types/api.ts`. They are exported and unit-tested directly, and are also reused by the PDF export path (which calls `fetchDistrictDirectory()` + selectors outside of React).
- When adding a new view, add a `select*` transform here and a thin `useX` hook rather than making a new network request.

**Auth token.** The API needs a Bearer JWT that **expires**. Resolution order: `VITE_RZ_API_TOKEN` env → committed fallback in `districtDirectory.ts`. When "data isn't loading," decode the token's `exp` claim first — an expired token 401s every page at once. See `memory/rizones-api-token.md`. No login credentials live in the repo.

**Dev proxies** (`vite.config.ts`, dev-only; production calls the whitelisted origin directly):
- `/rzapi/*` → `https://rizones45678.org/API/*` — the API only CORS-whitelists the deployed origin, not localhost.
- `/imgproxy/*` → `https://rotaryindia.org/*` — makes member/club photos same-origin so `html-to-image` can inline them as base64 for ZIP export.

**Images.** All member/club photos come from `rotaryindia.org`. Always resolve paths through `resolveImg()` in `districtDirectory.ts` — it handles the three path formats the API mixes (absolute URLs, leading-slash paths, bare filenames).

**Routing.** TanStack Router, **file-based** — routes are files in `src/routes/`. `src/routeTree.gen.ts` is **auto-generated** by the router Vite plugin; never edit it by hand. `__root.tsx` wraps every page in `Header`/`Footer`. Pages read URL search params via `Route.useSearch()` with a `validateSearch`.

**Static vs. dynamic pages.** Some sections (Profile & Message, Founder, Zones & Districts, Donors, etc.) are hard-coded content, not API-driven. Their card list is `STATIC_CATEGORIES` in `src/data/staticCategories.ts` (single source of truth — add an entry there + a matching `src/routes/` page). The content data for these lives in `src/data/*.ts`.

**PDF / ZIP export** (`src/utils/pdf/`). Directory sheets are rendered **offscreen** (`renderOffscreen.tsx` / `withOffscreen`), captured to images with `html-to-image`, and either printed (`printPdf.ts`) or bundled into a per-committee/per-club folder structure in a ZIP (`downloadDirectoryZip.tsx`). `captureToPdf.ts` handles image inlining, background rasterization, and font-wait before capture.

## Conventions

- Card color palettes are fixed arrays in `src/types/api.ts` (`CARD_BODY_COLORS`, `CARD_HEADER_COLORS`, `COMMITTEE_COLORS`) — indexed by position, not looked up by name.
- Member records are ordered by the API's `sort_order`/`designationSortOrder` (Chair → Co-Chair → …). Preserve that order downstream; do **not** re-sort alphabetically. Selectors also de-dupe people who appear under multiple roles.
- Tailwind CSS v4 (via `@tailwindcss/postcss`) plus per-component `.css` files.
- Porting print-card artwork from Illustrator SVGs to pixel-exact React cards follows a specific `--u`/`cqw` container recipe with known gotchas — see `memory/svg-card-port-recipe.md` before attempting one.

## Testing

Vitest + jsdom + Testing Library (`src/test-setup.ts`, configured in `vite.config.ts`). Tests colocate as `*.test.ts(x)`. Selector logic is tested against fixtures in `src/test-fixtures/`; `realData.check.test.ts` validates against real API shape.
