# Ship Report — Round 2 — 2026-05-02

> Round 1 (`docs/SHIP_REPORT_2026-05-02.md`): C1–C6 hardening + audits.
> Round 2 (this file): master upgrade prompt — pricing, color discipline, catalog hygiene, TJAI feedback substrate.
> All work additive: no rebuilds, no destructive deletions.

---

## ✅ What shipped

### Phase 0 — Audits
- New programs/diets gap audit by structured agent. **Finding: catalog already at 51 programs / 32 diets exactly** (master prompt's targets met by count). Gap is quality, not quantity. Reports: [docs/audits/PROGRAMS_GAP.md](audits/PROGRAMS_GAP.md), [docs/audits/DIETS_GAP.md](audits/DIETS_GAP.md).
- The other three audits (TJAI / mobile / i18n) live in [docs/TJAI_AUDIT.md](TJAI_AUDIT.md), [docs/MOBILE_AUDIT.md](MOBILE_AUDIT.md), [docs/LOCALE_AUDIT.md](LOCALE_AUDIT.md) — most ship-blockers were closed in Round 1. Open items remain in Round 1's "Open issues" section.

### P3.A — Color discipline tokens
- [tailwind.config.ts:71-93](../tailwind.config.ts) — added the missing semantic tokens the master prompt called for:
  - `premium: #A78BFA` — true purple, reserved for premium / AI / Apex / TJAI badges only (the existing `accent-violet: #94A3B8` is slate gray; renaming would have rippled across 18 files, so the new token is additive)
  - `warning: #F59E0B`
  - `danger: #F87171` (softer than the legacy `#EF4444`, pairs better with cyan accent)
  - `surface.3: #1E2126` for hover / sticky-bar elevation (top of the 3-elevation stack alongside existing `surface`, `surface.elevated`)
- [src/app/globals.css:21-30](../src/app/globals.css) — same tokens exposed as CSS vars: `--color-premium`, `--color-warning`, `--color-error` updated to softer red, new `--color-surface-3`.
- `color-scheme: dark` on `<html>` was **already in place** at [globals.css:6](../src/app/globals.css) — confirmed during the audit, no change needed.

### P1 — Pricing model (Tier-1 wired, Tier 2/3 stubbed)
- **Updated** [src/lib/tjai-pricing.ts](../src/lib/tjai-pricing.ts) with the locked prices: `TJAI_ONE_TIME_PRICE_USD = 8`, Pro `$10/mo` + `$79/yr`, Apex `$19.99/mo` + `$159/yr`, plus new exports `PROGRAM_PRICE_USD = 5.99`, `DIET_PRICE_USD = 4.99`, and `BUNDLE_PRICES_USD` for the three SKUs in master prompt 1.7.
- **New** [src/lib/pricing/locale-tier.ts](../src/lib/pricing/locale-tier.ts) — regional pricing helper. `resolveTier(country)` maps ISO-3166 codes to Tier 1/2/3 (US/EU vs TR/MX/BR vs IQ/EG/IN/etc.). Tier 1 is wired live; Tier 2 and Tier 3 prices are defined but only activate if `NEXT_PUBLIC_TIER_2_LIVE=true` / `NEXT_PUBLIC_TIER_3_LIVE=true` are set in env. This means **no risk of accidentally undercharging** before the Paddle product IDs per tier exist.
- **New** [src/components/pricing/tjai-usage-tier-table.tsx](../src/components/pricing/tjai-usage-tier-table.tsx) — server component rendering the master prompt's 1.3 table verbatim:

  | Feature | $8 plan only | Pro $10/mo | Apex $19.99/mo |
  |---|:-:|:-:|:-:|
  | Plan generation cost | $8 each | $8 each | $8 each |
  | Chat messages per plan | 10 | Unlimited | Unlimited |
  | Voice input | — | ✓ | ✓ |
  | Voice output | — | — | ✓ |
  | Cross-plan memory | — | — | ✓ |
  | Reasoning mode | — | — | ✓ |
  | Form-check video upload | — | — | ✓ |
  | Auto adaptive adjustments | — | ✓ | ✓ |

  Full 5-locale i18n (en/tr/ar/es/fr) inline. Reinforces the rule that **TJAI plan generation is never bundled into a subscription** — subs unlock more *usage* of TJAI chat after the user has paid for a plan.
- **New** [src/app/[locale]/pro/page.tsx](../src/app/[locale]/pro/page.tsx) — canonical pricing page per master prompt 1.6. TJAI section first, then the existing `<MembershipPricing />` Pro/Apex comparison. `generateMetadata` for SEO per locale. Existing `/membership` route is left intact (additive — both routes work; redirects can land in a follow-up).

### P2.A — Stale `NUTRITION_SLUGS` bug
- [src/app/[locale]/programs/page.tsx:228-235](../src/app/[locale]/programs/page.tsx) — replaced `NUTRITION_SLUGS.has(raw.slug)` with `isCatalogDiet(raw)` from [src/lib/diet-catalog.ts:44](../src/lib/diet-catalog.ts) (the canonical helper, already used by [src/app/[locale]/page.tsx:45-46](../src/app/[locale]/page.tsx)). The 22-entry stale Set listed 10 slugs that no longer exist in `content.ts`, breaking the diet vs training counter at line 234.
- The Set itself is left in place with a deprecation comment (additive rule). Safe to remove in a follow-up cleanup once nothing imports it.

### P6.A — TJAI adaptive feedback substrate
- **New migration** [supabase/migrations/20260502130000_tjai_feedback.sql](../supabase/migrations/20260502130000_tjai_feedback.sql) — `tjai_feedback` table with `(user_id, workout_log_id, context, rating, note, created_at)`. Rating constrained to `too_easy | right | too_hard`. Context defaults to `workout` but supports `meal | day | week` for future surfaces. RLS: select + insert own rows.
- **New API route** [src/app/api/tjai/feedback/route.ts](../src/app/api/tjai/feedback/route.ts) — POST endpoint with auth gate, input validation (whitelist on rating + context), 500-on-DB-error with structured `{ error, code, details }` (matching the pattern from C3 round 1). 500-char cap on free-form `note`.
- **New component** [src/components/tjai/workout-feedback-prompt.tsx](../src/components/tjai/workout-feedback-prompt.tsx) — `<WorkoutFeedbackPrompt locale workoutLogId? context? />` standalone block. Renders the 3-emoji 1-tap UI (😩 / 👌 / 🔥) per master prompt 6.4 with full 5-locale copy. POSTs to the new route, collapses to a quiet "logged" state on success, retry message on error. **Tap targets 44px**, focus rings on cyan.
- **Wiring is intentionally left to a follow-up** — the building block ships; mounting it on the workout-complete view + the diet-day view + a weekly summary needs a dedicated audit of those screens. Drop-in usage is one line: `<WorkoutFeedbackPrompt locale={locale} workoutLogId={log.id} />`.

---

## ⚠️ Deferred (with rationale)

| Phase | Item | Why deferred | Where to start |
|---|---|---|---|
| 1 | Tier 2/3 regional pricing **live** | Needs Paddle dashboard work — distinct product IDs per tier per item, manual setup outside the codebase. Helper is wired and `NEXT_PUBLIC_TIER_*_LIVE` env vars flip it on. | Create products in Paddle, set env vars, test with VPN |
| 1 | Bundles checkout (Starter Stack / Transform / Pro+TJAI first month) | Needs Paddle bundle products + a UI section on `/pro`. Prices are defined in `tjai-pricing.ts`. | New `<BundlesSection />` on `/pro`, Paddle product IDs |
| 1 | Annual sub default-on toggle + 14-day refund + pause-before-cancel + win-back email | UI structure for annual exists in `<MembershipPricing />`; default-state flip is one prop. Refund/pause/win-back is account-settings + Resend email infra. | `<MembershipPricing>` initial state + `account/settings/page.tsx` |
| 2 | **B** — Cultural seed catalog entries (turkish-kahvalti-cut-12w, arabic-mezze-cut-12w, halal-bulk-12w) | Real recipe content + native-speaker review per locale. Audit at [docs/audits/DIETS_GAP.md](audits/DIETS_GAP.md) lists slug + concept; full content drafting is a content-writer task, not an engineer task. | One slug at a time with native review |
| 2 | Inference-default fixes (27 programs tagged `hybrid` because slug doesn't start with `home-`/`gym-`; 16 programs use catch-all `Beginner to Advanced` difficulty) | Touches every program entry — needs explicit `location` + `level` per row. Not a bug, just data quality. | Add `location` + `level` columns to each entry in `content.ts`, drop the inference defaults in `program-catalog.ts:275-360` |
| 3 | Card personality split (Spotify-style programs vs cookbook-style diets) | Visual direction; needs design exploration before code. | Two card variants in shared `Card` primitive |
| 3 | Mobile bottom nav (4 tabs, logged-in only) | New surface — needs auth-state read in `SiteShell`, route guards, design pass. | `<MobileBottomNav />` mounted in `SiteShell` |
| 3 | Serif typography pairing (Fraunces / GT Sectra) | License + font loading + audit of headline sites. | Add font via `next/font`, swap `font-display` token |
| 4 | Workout player music-app pattern (full-screen rest timer with haptics, swipe between exercises, big tabular-nums, alternatives sheet, replace-exercise) | Multi-session work — needs its own audit + design + build phase. The current player works; this is a tier-up. | Dedicated session, start with audit of current player file |
| 5 | Diet day cook-mode + recipe modal swipe-to-dismiss + shopping list generator | Same shape as Phase 4. | Dedicated session |
| 6 | **B** — "Here's why" reasoning section appended after TJAI plan generation | Needs an audit of the TJAI generation pipeline first to know where to splice. The system-prompt change is small once the splice point is known. | Audit `/api/tjai/generate/route.ts` + `tjai-plan-store.ts` |
| 6 | Motivational interviewing intake (Stanford Bloom-style 8 questions) + streaming-as-blocks plan UI + voice mode (Apex) + coach review (Apex) + adaptive regen | Each is its own focused task. The feedback substrate from P6.A here is the upstream input — week 3 regen suggestions can read from `tjai_feedback` once the regen logic exists. | Plan a TJAI-focused session |
| 7 | Streak engine + Sunday weekly check-in cron + transformations page + live counter + email lifecycle (5+ emails × N locales) + push notifications | Cron infra (no scheduler today), email templates, push subscription handling, and content writing per locale. Substantial. | Plan a retention-focused session |
| 8 | RTL `<bdi>` wrapper sweep, locale-aware date/time/units, per-locale SEO `hreflang` audit, language-detect banner, Cairo / Tajawal font preload for `ar` | Discrete polish items — pick off in a focused i18n session. | Audit existing usage, add per-page |
| 9 | `transition-all` audit (11 files use the Tailwind shorthand) + `tabular-nums` global sweep | Per-file work, mostly cosmetic. The fixed-bottom safe-area requirement is **already satisfied** at both sites ([mobile-cta-bar.tsx:47](../src/components/mobile-cta-bar.tsx) and [luxury-home.tsx:892](../src/components/luxury/luxury-home.tsx)). | Replace `transition-all` with `transition-{colors,transform,opacity}` per usage |
| 9 | Color discipline audit (cyan vs purple usage across the app) | Existing slate `accent-violet` is slate not purple, and existing literal-purple usage in `<MembershipPricing />` and `<TjaiUsageTierTable />` is correctly gated to Apex/AI surfaces. So the audit risk is low — but a sweep would still confirm. | Grep for `text-violet-` / `border-violet-` / `bg-violet-` outside membership + tjai paths |

---

## 📊 Build status

**Round 2 final: GREEN ✅** (`next build` `✓ Compiled successfully`, exit 0).

- Build #1 of Round 2 (after /pro + tier table + pricing helper + token additions) — passed; `/pro` route built for all 5 active locales.
- Build #2 of Round 2 (after P2.A + P6.A migration + route + component) — passed; new `/api/tjai/feedback` dynamic route + the `/{en,tr,ar,es,fr}/pro` static routes both present in the route map.
- **Bundle-size delta vs Round 1: zero** — First Load JS shared by all stayed at 158 kB across both builds. The /pro page itself is ~3 kB on top.

Open warnings unchanged from Round 1: ~80× `themeColor` deprecation across `[locale]/*` pages (pre-existing; not from this work).

---

## 🚀 Deploy

Branch is still `claude/jolly-kalam-ffc5a9`, local. To open a preview:

```bash
git push -u origin claude/jolly-kalam-ffc5a9
gh pr create --base main \
  --title "feat: master upgrade — pricing page, color tokens, TJAI feedback substrate, catalog bug fix" \
  --body-file docs/SHIP_REPORT_2026-05-02_round2.md
```

**Three migrations need to land in Supabase before deploy:**
1. `supabase/migrations/20260502120000_tjai_consume_trial_message_rpc.sql` (Round 1 — atomic trial enforcement)
2. `supabase/migrations/20260502120100_workout_logs_exercise_name_sync.sql` (Round 1 — exercise/exercise_name sync trigger)
3. `supabase/migrations/20260502130000_tjai_feedback.sql` (Round 2 — adaptive feedback substrate)

Smoke tests for the preview (in addition to Round 1's list):
- `/{locale}/pro` — TJAI usage tier table renders correctly across all 5 locales (especially `ar` for RTL); MembershipPricing checkout still works; no layout shift between hero and table
- POST to `/api/tjai/feedback` with `{ rating: "right" }` — returns `{ ok: true, id, created_at }`; with bad rating returns 400
- Programs catalog category counter (`/{locale}/programs`) — shows correct training/nutrition counts (was off by ~10 before P2.A)

---

## 🛡️ Hard rules honored (Round 2)

- ✅ Read every file before editing
- ✅ Additive only — no deletions of components, routes, or DB rows. `NUTRITION_SLUGS` Set is deprecated-with-comment, not removed.
- ✅ No `framer-motion`
- ✅ No Anthropic SDK swap (Round 1 dual-provider preserved)
- ✅ No EUR migration (TRY in DB; USD displayed via `tjai-pricing.ts` and `lib/pricing/locale-tier.ts`)
- ✅ All edited files under 500 lines
- ✅ No `.env` commits
- ✅ Logical CSS properties (`me-2` in feedback prompt, etc.)
- ✅ Tabular numerals on price displays in the new tier table
- ✅ 44px tap targets on all new buttons
- ✅ Branded copy on the feedback prompt's success state
- ✅ `prefers-reduced-motion` not applicable to the new pieces (no animations introduced)
- ✅ All file paths + line numbers cited
