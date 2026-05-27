# Bundle PDP Audit — 2026-05-27

**Method:** static review of [src/lib/bundles.ts](../../src/lib/bundles.ts), [src/lib/bundle-pdf-builder.ts](../../src/lib/bundle-pdf-builder.ts), [src/app/\[locale\]/bundles/page.tsx](../../src/app/[locale]/bundles/page.tsx) and [src/app/\[locale\]/bundles/\[slug\]/page.tsx](../../src/app/[locale]/bundles/[slug]/page.tsx).

**Scope correction:** the earlier LASTCLAUDECODE.md note + Plan-1 Phase 4 description referred to "14 bundles" / "12 bundles". The registry actually defines **12** bundles.

## Architecture finding

Bundles are **self-contained** — `src/lib/bundles.ts` does NOT reference `src/lib/programs/` or `src/lib/diets/` registries. Each bundle ships its own:

- `phases[]` — 3-phase outline (Weeks 1-4 / 5-8 / 9-12 names + focus)
- `sampleTrainingDay` — one named day with ~7 exercises (sets/reps)
- `sampleMealDay` — one meal-by-meal day with items + macros
- `nutrition` — style / proteinTarget / calorieBias / notes
- `phases` outline + headline `weeks: 12`

The schema also declares **optional** rich-content fields the PDF builder will render when present:

```ts
weeklyTemplate?: BundleWeeklyTemplateDay[]; // full weekly split (training)
progression?: BundleProgressionPhase[];     // phase-by-phase loading scheme
warmup?: string[];
cooldown?: string[];
equipment?: string[];
recipes?: BundleRecipe[];                   // recipe library
groceryList?: BundleGroceryCategory[];      // categorized weekly grocery list
```

**Status of optional fields across all 12 bundles:** zero matches for `weeklyTemplate:`, `recipes:`, `groceryList:`, `progression:`, `warmup:`, `cooldown:`, `equipment:` set as object keys. **None of the 12 bundles ship the rich content.**

## Per-bundle table

| # | Slug | Phases outline | Sample training day | Sample meal day | Weekly template | Recipes | Grocery list | Progression | Warmup/Cooldown | Equipment | Free? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `fat-loss` | ✓ (Prime/Strip/Polish) | ✓ Push Day A (7 ex) | ✓ (4 meals) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 2 | `lean-bulk` | ✓ (Base/Build/Peak) | ✓ Pull Day A (7 ex) | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 3 | `home-starter` | ✓ (Habit/Build/Push) | ✓ Full Body Bodyweight | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 4 | `definition` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 5 | `recomp` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 6 | `powerbuilding` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 7 | `calisthenics` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 8 | `athlete-conditioning` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 9 | `beginner-foundations` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 10 | `womens-sculpt` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 11 | `senior-strength` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |
| 12 | `cutting-peak` | ✓ | ✓ | ✓ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✓ |

`isFree: true` on all 12 (per pricing directive: programs/diets stay $0 until owner sets prices).

## PDF builder coverage

[src/lib/bundle-pdf-builder.ts](../../src/lib/bundle-pdf-builder.ts) renders:

- Hero / cover (always)
- Phase outline (always — 3 phases)
- Sample training day (always — 1 day, ~7 exercises)
- Sample meal day (always — ~4 meals)
- Weekly template section (**guarded by `if (bundle.weeklyTemplate?.length)`** — currently never fires)
- Recipes section (**guarded** — never fires)
- Grocery list section (**guarded** — never fires)
- Progression scheme (**guarded** — never fires)
- Warmup/Cooldown (**guarded** — never fires)

The PDF builder is well-architected: it gracefully omits sections when data is absent. The PDF that ships today is **a 1-sample-day overview + 3-phase outline + nutrition note**, not a 12-week complete plan.

## Marketing-claim gap

| Bundle PDP / marketing language | Real backing? |
|---|---|
| "12 weeks" (`weeks: 12`) | **Partial** — 3-phase outline + 1 sample day. No week-by-week training. |
| "Phase progression" | **Partial** — phase names + focus only, no loading scheme. |
| "Bundle includes nutrition" | ✓ — sample meal day + protein target + calorie bias text. |
| "Bundle includes a sample" | ✓ — one training day + one meal day. |
| "Grocery list" | **NOT BACKED** — no bundle ships `groceryList`. PDP / PDF currently does not claim this in the bundle hooks (verified — `hook` strings don't mention grocery lists). Safe today, but Cycle 018 + the master prompt warn against future claims. |
| "Recipes" | **NOT BACKED** — same as above. |
| "Custom 12-week plan" (subscription-cancel page) | **NOT BACKED** by bundle data alone. Refers to TJAI plan generation, not bundles. |

## Locale coverage

Bundles.ts has English-only string fields (`name`, `hook`, `description`, phase names, exercise names, meal items). Localization for bundles happens via:

- [src/lib/bundles-i18n.ts](../../src/lib/bundles-i18n.ts) — bundle-page chrome / labels (verified exists)
- The bundle PDF builder accepts `t` (translations) and renders headers per locale

But the **bundle content itself** (exercise names, meal items, phase descriptions, nutrition notes) is English-only. A Turkish user gets Turkish chrome + English exercises. **Not flagged as a hard breakage** — exercise names are universal in fitness — but a 5-locale audit later might want to translate Push Day A → Push Günü A, etc.

## Recommendations

For Phase 7 ⚠ (Diet honesty pass) and Phase 8 ⚠ (Program honesty pass), the framing should be:

- **Bundles are honest as "sample-driven 12-week roadmaps"** — UI must not claim a full week-by-week prescription it doesn't deliver.
- **OK as-is:** "12-week phase outline + sample workout + sample meal day + nutrition guidance"
- **NOT OK going forward:** any PDP language saying "full grocery list", "complete recipe library", "every workout day prescribed", "all 84 sessions detailed" — none of those are backed.

The detail-page audit is **clean as it stands** (hooks don't over-claim), but the marketing layer (homepage, pricing, bundle list cards) should be re-read with this lens before next launch push.

Suggested Phase 7/8 work:

1. Audit homepage + bundle-grid + bundle hooks for over-claim language (read-only first).
2. If over-claim exists, replace with truthful descriptors.
3. Optionally — populate `weeklyTemplate` / `recipes` / `groceryList` for top-3 bundles (fat-loss, lean-bulk, home-starter) before marketing them as complete. Owner decision.

## What this audit did NOT cover

- Locale coverage of bundle content (English-only exercise/meal names).
- Whether `src/lib/bundles-i18n.ts` covers all chrome strings the bundle pages render.
- Bundle hero image asset state (paths point to `/bundles/*.jpg` placeholders — separate asset audit).
- Bundle-detail entitlement flow (paid + admin gating — covered in Plan 1 commit `0ba61c9`).
- PDF generation perf / accessibility / file size — separate Phase 16/17 territory.
