# Overnight loop report — 2026-05-20

Self-paced autonomous loop on branch `claude/nice-dewdney-703ecd`. 14 iterations, 14 commits, +2,188 / −2,477 lines across 69 files. No pushes to main, no deploys, no Supabase data mutated.

**PR ready to review:** https://github.com/TJVFIT/TJFit/pull/new/claude/nice-dewdney-703ecd

---

## What landed (commit log, newest first)

| # | Commit | What |
|---|---|---|
| 14 | `32da554` | README: programs marketplace → bundle catalog refs |
| 13 | `79ba987` | verify-deploy.sh: bundle routing sanity checks |
| 12 | `ef4d494` | `.env.example`: 16 missing keys documented |
| 11 | `5d2d221` | robots disallow auth paths + bundle hreflang alternates |
| 10 | `d8a04a3` | Vulnerability triage doc (read-only) |
|  9 | `ce57a74` | /404 copy → "Browse Bundles" across 5 locales |
|  8 | `41b5a6d` | Bundle Product + ItemList JSON-LD + canonical URLs |
|  7 | `78675bb` | a11y: aria-labels on chips/CTAs + motion-safe |
|  6 | `ae76b68` | /start funnel: stale program tabs → bundle preview |
|  5 | `96787e2` | Mobile audit: 44px+ tap targets, wrap exercise names |
|  4 | `f031da5` | 12 on-brand SVG bundle hero placeholders |
|  3 | `c589c1b` | layout: themeColor → viewport, manifest URL fix |
|  2 | `bab5329` | Restore node_modules (build was broken), −6 orphans |
|  1 | `d00481e` | The big one: 12-bundle restructure (your earlier work — first commit) |

---

## Real bugs caught and fixed

1. **Production `next build` was failing** — `vitest.config.ts` typechecked against a missing `vitest/config` because `node_modules` wasn't installed. Iter 1's `npm install` fixed it; build is now warning-free.
2. **`/manifest.json` was a 404** — `src/app/layout.tsx` pointed at the wrong filename; Next emits `/manifest.webmanifest`. Iter 2 fixed.
3. **`themeColor` warnings on every locale × every page** — moved to `viewport` export per Next 14 guidance. Iter 2.
4. **6 orphan components** left dangling after the programs/diets demolition (program-detail-hero, program-payment-success-notice, program-upload-client, free-product-detail-view, program-blueprint-navigator, program-content-lock). Iter 1 deleted them — 928 lines gone.
5. **/start funnel** still loaded the old `programs` catalog and toggled between program/diet tabs that both linked to /bundles. Iter 6 replaced with a single bundle preview.
6. **/404 page** still said "Browse Programs" / had separate "Programs" and "Diets" links. Iter 9 fixed across 5 locales.
7. **Sub-44px tap targets** on all bundle CTAs. Iter 5 added `min-h-[44px]` / `[48px]` and stacked actions on mobile.
8. **Exercise names truncating** in sample-session list on narrow screens. Iter 5 dropped `truncate` and let them wrap.

## New product polish

- **12 SVG bundle heroes** at `/public/bundles/*.svg`, cyan/blue/black gradient family with unique angle per bundle and 01–12 watermark numerals. Regenerable via `scripts/generate-bundle-heroes.mjs`. Cards show them at 0.7 opacity by default, full on hover. Detail pages now have a 21:9 hero banner.
- **Per-card aria-label** like "Download Fat Loss Bundle PDF" so screen reader users can distinguish 12 download buttons.
- **All hover/active transforms** wrapped in `motion-safe:` to respect OS reduced-motion preference.

## SEO additions

- **Sitemap now emits 60 new URLs** — 12 bundle detail pages × 5 locales.
- **`Product` JSON-LD** on each detail page (name, image, brand, category, free Offer).
- **`ItemList` JSON-LD** on the /bundles index.
- **Per-page `alternates.canonical` + `hreflang`** on bundle index + detail (was inheriting homepage map; now points at sibling /<loc>/bundles URLs).
- **robots.txt** disallows 13 middleware-gated paths + /coming-soon + /api/ (saves crawl budget).

## Hygiene + ops

- **`.env.example` +16 keys** documented with usage notes (CRON_SECRET, UPSTASH, ELEVENLABS, ANTHROPIC_MODEL_*, NEXT_PUBLIC_TIER_*_LIVE, etc.).
- **verify-deploy.sh** new section: confirms /en/bundles is 2xx, /en/bundles/fat-loss is 2xx, /api/bundles/download/fat-loss is 401, /en/programs is 404 (canary that catalog stays demolished).
- **README** routes table and Included list refreshed for bundle surface.

## Followups I didn't do (saved for you)

These need a daylight call or a decision:

1. **Drop real hero images** under `/public/bundles/*.webp` and swap the registry paths back to `.webp`. The SVGs are nice-but-clearly-placeholder; commercial-quality .webp would lift the catalog visibly.
2. **Wire real Paddle pricing** to bundle slugs and flip individual bundles to `isFree: false`. Right now every bundle downloads for any signed-in user.
3. **Replace `to-ico` in `scripts/generate-brand-assets.mjs`** — single biggest dependency-vuln win (kills ~13 transitive criticals/highs). See [docs/audits/2026-05-20-vuln-triage.md](docs/audits/2026-05-20-vuln-triage.md).
4. **Run `npm audit fix`** (no --force) to bump `ws` for Supabase realtime. Non-breaking. Loop policy didn't auto-run.
5. **i18n extraction of bundle copy** — the 12 bundles ship English-only. Extracting names/hooks/phases/meals into per-locale dictionaries is a multi-hour task; deferred.
6. **`eslint-config-next` v14 → v16 bump** (separate PR — semver-major, may need ESLint v9 migration).
7. **TODO at `src/app/api/webhooks/gumroad/route.ts:150`** — refund flow ("mark order refunded, revoke access, emit audit log").
8. **Auth gh CLI in this env or paste the PR title/body manually**; gh wasn't authenticated so the PR is push-only.

## What's clean as of this report

- `npm run typecheck` ✓
- `npm run lint` ✓ (no warnings)
- `npm run build` ✓ (no warnings)
- `npm run i18n:check` ✓ (5-locale keyset parity)
- All routes resolve internally (no dead links)
- No commits to main, no deploys, no Supabase mutations
