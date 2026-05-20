# Overnight loop report — 2026-05-20

Self-paced autonomous loop on branch `claude/nice-dewdney-703ecd`. **20 iterations, 21 commits, +2,710 / −2,484 lines across 77 files.** No pushes to main, no deploys, no Supabase data mutated.

**PR ready to review:** https://github.com/TJVFIT/TJFit/pull/new/claude/nice-dewdney-703ecd

---

## What landed (commit log, newest first)

| # | Commit | What |
|---|---|---|
| 20 | `00ec96c` | test: bundle PDF builder smoke — all 12 PDFs build to 8 pages |
| 19 | `3a78f61` | test: 14 bundle-registry invariants (slugs, goals, lookups) |
| 18 | `f06822a` | test: sitemap emits 60 bundle URLs + no legacy programs/diets |
| 17 | `076238b` | Sentry configs verified clean; ProgramsDepthFx → BundlesDepthFx |
| 16 | `be9c837` | test: extract JSON-LD builders + 4-test vitest coverage |
| 15 | `3918e2f` | Filter chips by goal on /bundles (All · Cut · Build · …) |
| 14 | `6c61339` | First overnight report doc (now refreshed by this iter) |
| 13 | `32da554` | README: programs marketplace → bundle catalog refs |
| 12 | `79ba987` | verify-deploy.sh: bundle routing sanity checks |
| 11 | `ef4d494` | `.env.example`: 16 missing keys documented |
| 10 | `5d2d221` | robots disallow auth paths + bundle hreflang alternates |
|  9 | `d8a04a3` | Vulnerability triage doc (read-only) |
|  8 | `ce57a74` | /404 copy → "Browse Bundles" across 5 locales |
|  7 | `41b5a6d` | Bundle Product + ItemList JSON-LD + canonical URLs |
|  6 | `78675bb` | a11y: aria-labels on chips/CTAs + motion-safe |
|  5 | `ae76b68` | /start funnel: stale program tabs → bundle preview |
|  4 | `96787e2` | Mobile audit: 44px+ tap targets, wrap exercise names |
|  3 | `f031da5` | 12 on-brand SVG bundle hero placeholders |
|  2 | `c589c1b` | layout: themeColor → viewport, manifest URL fix |
|  1 | `bab5329` | Restore node_modules (build was broken), −6 orphans |
|  0 | `d00481e` | (prior session) 12-bundle restructure baseline |

---

## Real bugs caught and fixed

1. **Production `next build` was failing** — `vitest.config.ts` typechecked against a missing `vitest/config` because `node_modules` wasn't installed. `npm install` fixed it; build is warning-free.
2. **`/manifest.json` was a 404** — pointed at the wrong filename; Next emits `/manifest.webmanifest`. Fixed.
3. **`themeColor` warnings on every locale × every page** — moved to `viewport` export per Next 14 guidance.
4. **6 orphan components** left dangling after the programs/diets demolition. Deleted, 928 lines gone.
5. **/start funnel** still loaded the old `programs` catalog and toggled dead tabs. Replaced with a single bundle preview.
6. **/404 page** still said "Browse Programs" / had separate Programs and Diets links. Fixed across 5 locales.
7. **Sub-44px tap targets** on all bundle CTAs. Added `min-h-[44px]`/`[48px]` + mobile-first stacking.
8. **Exercise names truncating** in sample-session list on narrow screens. Dropped `truncate` and let them wrap.

## Product polish

- **12 SVG bundle heroes** at `/public/bundles/*.svg`. Regenerable via `scripts/generate-bundle-heroes.mjs`. Cards show them at 0.7 opacity by default, 1.0 on hover. Detail pages got a 21:9 hero banner.
- **Filter chip strip** above the catalog: `All (12) · Cut (3) · Build (2) · Recomp (1) · Strength (2) · Conditioning (1) · Start (3)` — counts render per chip, empty chips auto-hide, aria-live announces filter changes, `role=tablist` wired for screen readers.
- **Per-card aria-label** like "Download Fat Loss Bundle PDF" so SR users can distinguish 12 download CTAs.
- **All hover/active transforms** wrapped in `motion-safe:` to respect OS reduced-motion.

## SEO additions

- **Sitemap now emits 60 new URLs** — 12 bundle detail pages × 5 locales.
- **`Product` JSON-LD** on each detail page (name, image, brand, category, free Offer) — extracted to `src/lib/bundle-jsonld.ts` with explicit types.
- **`ItemList` JSON-LD** on the /bundles index.
- **Per-page `alternates.canonical` + `hreflang`** on bundle index + detail (5 locales + x-default).
- **robots.txt** disallows 13 middleware-gated paths + /coming-soon + /api/.

## Test coverage (new this loop — 5 files, 32 tests)

| File | Assertions | What it locks down |
|---|---|---|
| [tests/bundle-jsonld.test.ts](tests/bundle-jsonld.test.ts) | 4 | Product + ItemList LD shape for every bundle, locale URL respected |
| [tests/sitemap.test.ts](tests/sitemap.test.ts) | 4 | 60 bundle URLs present, zero legacy programs/diets, priority hierarchy |
| [tests/bundles-registry.test.ts](tests/bundles-registry.test.ts) | 14 | unique slugs, valid goals, sane week/session counts, all sample data populated, save/isFree alignment |
| [tests/bundle-pdf-builder.test.ts](tests/bundle-pdf-builder.test.ts) | 5 | All 12 PDFs build to 8 pages, valid `%PDF-` arraybuffer, edge cases (9 vs 6 exercises, tracked vs untracked meals) |
| tests/tjai-generate-refund.test.ts | (existing) | TJAI refund flow |

`npm test` will catch a regression in any of these before deploy.

## Hygiene + ops

- **`.env.example` +16 keys** documented (CRON_SECRET, UPSTASH, ELEVENLABS, ANTHROPIC_MODEL_*, NEXT_PUBLIC_TIER_*_LIVE, etc.).
- **verify-deploy.sh**: new section confirms /en/bundles is 2xx, /en/bundles/fat-loss is 2xx, /api/bundles/download/fat-loss is 401, /en/programs is 404 (canary).
- **README** routes table and Included list refreshed for bundle surface.
- **Sentry configs** audited — clean (DSN-guarded, 10% sampling, router transitions wired).
- **`ProgramsDepthFx` renamed → `BundlesDepthFx`** for naming coherence.

## Followups I didn't do (need a daylight call)

1. **Drop real hero images** under `/public/bundles/*.webp` and swap the registry paths back to `.webp`.
2. **Wire real Paddle pricing** to bundle slugs and flip `isFree: false` where appropriate.
3. **Replace `to-ico` in `scripts/generate-brand-assets.mjs`** — single biggest dep-vuln win (~13 transitive criticals/highs). See `docs/audits/2026-05-20-vuln-triage.md`.
4. **Run `npm audit fix`** (no --force) to bump `ws` for Supabase realtime. Non-breaking.
5. **i18n extraction of bundle copy** — 12 bundles ship English-only.
6. **`eslint-config-next` v14 → v16** (separate PR; semver-major).
7. **TODO at `src/app/api/webhooks/gumroad/route.ts:150`** — refund flow.
8. **luxury-home diet section** — still rendering "diets" copy that links to /bundles; the section UX is incoherent. Real refactor needed.
9. **Auth `gh` CLI** or paste the PR title/body manually; `gh` wasn't authenticated.

## Health snapshot (right now)

- `npm run typecheck` ✓
- `npm run lint` ✓ (no warnings)
- `npm run build` ✓ (no warnings)
- `npm run i18n:check` ✓ (5-locale keyset parity)
- `npx vitest run` ✓ (**5 files, 32 tests**)
- All routes resolve internally (no dead links)
- No commits to main, no deploys, no Supabase mutations
