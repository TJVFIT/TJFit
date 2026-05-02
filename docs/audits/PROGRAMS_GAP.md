# Programs Gap Audit — 2026-05-02

Source of truth: `src/lib/content.ts` lines 137–1832 (single static `programs: Program[]` array, no `is_published` flag — every entry in the array is effectively published). Diet vs. training split derived via `isCatalogDiet()` at `src/lib/diet-catalog.ts:44-46` (category === "Nutrition").

## Summary

- **Total entries in `programs`:** 83 (`src/lib/content.ts:137`)
- **Training programs (category != "Nutrition"):** **51**
- **Diets (category === "Nutrition"):** 32 (covered in `DIETS_GAP.md`)
- **Master-prompt target:** 51 training
- **Status:** AT TARGET (exact match)
- **Distribution issues:**
  - No entries categorized as `recomp` (the catalog only uses Fat Loss / Strength / Muscle Gain / Performance — `inferGoalKey` at `src/lib/program-catalog.ts:274-284` returns `recomp` only when slug/category contains "recomp", which never happens).
  - Heavy skew to `hybrid` location (27/51) because most slugs don't start with `home-` or `gym-` and the inference at `program-catalog.ts:286-293` defaults to hybrid.
  - Only 4 explicitly `Advanced`-only programs; 16 are `Beginner to Advanced` (all-levels) which dilutes level filtering.
  - The stale `NUTRITION_SLUGS` set at `src/app/[locale]/programs/page.tsx:40-63` lists 22 slugs, **10 of which (`clean-bulk-diet-plan`, `high-calorie-muscle-diet`, `lean-bulk-nutrition-plan`, `mass-gain-meal-plan`, `hardcore-bulk-diet`, `fat-loss-diet-plan`, `cutting-shred-meal-plan`, `low-calorie-lean-diet`, `keto-cut-plan`, `high-protein-cutting-diet`) do not exist in `content.ts`**. The training/nutrition counter at `page.tsx:234` is therefore wrong (treats 22 as nutrition, 61 as training). Recommend replacing with `isCatalogDiet(raw)` from `diet-catalog.ts`.

## Distribution by goal × level

Levels mapped from `difficulty` per `inferLevelKey` (`program-catalog.ts:295-301`); "Beginner to Advanced" treated as `all_levels`.

| Goal | Beginner | Intermediate | Advanced | All levels | Total |
|---|---|---|---|---|---|
| Fat loss (Fat Loss) | 6 | 2 | 1 | 9 | 18 |
| Muscle (Strength + Muscle Gain) | 3 | 9 | 3 | 6 | 21 |
| Performance | 3 | 8 | 0 | 1 | 12 |
| Recomp | 0 | 0 | 0 | 0 | 0 |
| **Total** | 12 | 19 | 4 | 16 | **51** |

## Distribution by location

Inferred from slug prefix per `inferLocationKey` (`program-catalog.ts:286-293`).

| Location | Count | Examples |
|---|---|---|
| home | 19 | `home-fat-burn-accelerator-12w` (`content.ts:139`), `bodyweight-shred-system-12w` (`:160`), `calisthenics-growth-system-12w` (`:307`), `busy-parent-home-system-12w` (`:1018`) |
| gym | 5 | `gym-fat-loss-protocol-12w` (`:349`), `gym-mass-builder-12w` (`:454`), `gym-muscle-starter` (`:1769`), `shred-and-sweat-gym-plan-12w` (`:370`), `cutting-system-gym-12w` (`:391`) |
| hybrid (default fallback) | 27 | `powerlifting-foundations-12w` (`:738`), `5x5-strength-protocol-12w` (`:758`), `athletic-conditioning-12w` (`:838`), `womens-strength-sculpt-12w` (`:938`), `runners-strength-support-12w` (`:1078`) |

Hybrid is over-represented because the inference function only matches slugs that start with `home-` or `gym-`. 22 of the 27 hybrid programs are obviously gym-equipment programs (powerlifting, 5x5, deadlift, bench, squat, hypertrophy, push-pull-legs, upper-lower, arm/back specialization, athletic conditioning, etc.). Recommend extending the slug heuristic or adding an explicit `location` field.

## Distribution by equipment archetype

Inferred from `requiredEquipment` + slug per `inferEquipmentKey` (`program-catalog.ts:303-311`) and the `PROGRAM_STRUCTURE_OVERRIDES` table at `program-catalog.ts:72-99`.

| Equipment | Count | Notes |
|---|---|---|
| bodyweight | 17 | All `home-*`, `bodyweight-*`, `calisthenics-*`, `lean-at-home`, `sweat-and-burn`, `low-impact`, `busy-parent`, `desk-worker`, `mobility`, `postpartum`, `express-30` |
| commercial / full_gym | 13 | All `gym-*`, hypertrophy, aesthetic, mass-builder; powerlifting/5x5/deadlift/bench/squat have explicit `["Barbell", ...]` equipment (`content.ts:741, 761, 781, 801, 821`) |
| home cardio kit | 1 | `treadmill-transformation-12w` (`content.ts:601` `["Treadmill"]`) |
| minimal / field | 20 | Default fallback for the remaining hybrid splits, sport-specific (runners, boxers, cyclist, sprint, endurance, athletic-conditioning, explosive, functional), women's/senior/youth, etc. |

## Distribution by days/week

Source: `PROGRAM_STRUCTURE_OVERRIDES` (`program-catalog.ts:72-99`) plus `inferWeeklySessions` default (`program-catalog.ts:313-321`). Most non-overridden 12-week programs default to **4 sessions/week**; push-pull/hypertrophy/strength slugs default to **5**; starter (4-week) programs are pinned at **3-4**.

| Sessions/wk | Approx count | Source |
|---|---|---|
| 3 | 1 | `home-fat-loss-starter` (override `:95`) |
| 4 | ~38 | All home/bodyweight + sport-niche defaults |
| 5 | ~12 | All `gym-*-12w` + push-pull/hypertrophy/strength splits |
| 25-min express | 1 | `express-30-min-fat-loss-12w` (`content.ts:538`) — not stored as a separate sessions/wk value, but the slug+title encode the 30-min commitment the prompt asks for |

## Specialist niche coverage (from master-prompt brief)

- Powerlifting starter — exists: `powerlifting-foundations-12w` (`content.ts:738`), `5x5-strength-protocol-12w` (`:758`), `deadlift-mastery-12w` (`:778`), `bench-press-breakthrough-12w` (`:798`), `squat-strength-ladder-12w` (`:818`)
- Calisthenics progression — exists: `calisthenics-growth-system-12w` (`content.ts:307`)
- Female-focused glutes/core — partial: `womens-strength-sculpt-12w` (`content.ts:938`) and `postpartum-return-plan-12w` (`:958`); no dedicated **glutes/core** program. Consider one targeted addition (see recommendations).
- Post-injury return — partial: `mobility-recovery-system-12w` (`content.ts:1038`), `desk-worker-reset-12w` (`:1058`), `postpartum-return-plan-12w` (`:958`); no slug contains "post-injury" or "rehab". Recommend re-labeling or adding one.
- Busy-parent 25-min — exists: `busy-parent-home-system-12w` (`content.ts:1018`) and `express-30-min-fat-loss-12w` (`:538`). The latter is 30 min not 25 — close enough.
- Athlete conditioning — exists: `athletic-conditioning-12w` (`content.ts:838`), `explosive-power-development-12w` (`:858`), `functional-athlete-plan-12w` (`:878`), `sprint-agility-protocol-12w` (`:898`), `endurance-athlete-builder-12w` (`:918`), plus sport-specific: `boxers-conditioning-12w` (`:1098`), `runners-strength-support-12w` (`:1078`), `cyclist-power-base-12w` (`:1118`), `youth-athlete-development-12w` (`:998`)

## Recommendations

The catalog is **exactly at 51 training programs**, so no quantity change is needed. Action items are quality / coverage:

### Coverage gaps to fill (without exceeding 51)

If you want to swap, not add, candidates to deprecate (look like padding — same goal+level+location, very similar concept):

- [ ] `lean-at-home-program-12w` (`content.ts:202`) overlaps heavily with `home-cardio-melt-12w` (`:181`) and `sweat-and-burn-blueprint-12w` (`:223`) — three home cardio-cutters at the same level.
- [ ] `lean-muscle-home-program-12w` (`content.ts:328`) overlaps with `home-muscle-builder-12w` (`:244`) and `bodyweight-mass-plan-12w` (`:265`).

If swapping one of those, recommended replacements (concrete slug + concept, no content):

- [ ] `glute-and-core-shape-12w` — female-focused glute hypertrophy + core stability, 4×/wk, minimal equipment (band + dumbbell). Closes the explicit glutes/core gap noted above.
- [ ] `post-injury-return-12w` — gentle progressive loading after lower-back / shoulder / knee injury, 3×/wk, bodyweight + band. Replaces ambiguity with mobility/desk-worker.
- [ ] `recomp-hybrid-system-12w` — adds the missing `recomp` goal entry; hybrid location, intermediate, 4×/wk strength + 2×/wk conditioning.

### Pure quality / deduplication tasks (no count change)

- [ ] Replace `NUTRITION_SLUGS` set at `src/app/[locale]/programs/page.tsx:40-63` with `isCatalogDiet(raw)` from `src/lib/diet-catalog.ts` (10 of 22 entries are dead slugs; the count at `page.tsx:234` is wrong).
- [ ] Add a `location` field to the `Program` type (`src/lib/content.ts:38-49`) so the 22 hybrid-by-default programs (powerlifting, hypertrophy splits, sport-specific) can be tagged correctly, instead of relying on slug-prefix inference.
- [ ] Fill in `requiredEquipment` for the 12 `gym-*` and split-routine programs that currently have `[]` (e.g. `gym-fat-loss-protocol-12w` `:349`, `hypertrophy-system-12w` `:475`, `aesthetic-muscle-plan-12w` `:517`, all `*-blueprint-12w` and split routines).
- [ ] Add explicit `Beginner` / `Intermediate` / `Advanced` to slugs currently typed as `Beginner to Advanced` — 16 of 51 use this catch-all and it short-circuits the level filter at `program-catalog.ts:299`.

### Forward-looking (not part of this sprint)

- [ ] Pricing remains `0` per `feedback_pricing.md`. Master prompt's future $5.99/program is recorded in `project_current_upgrade.md`; do not apply now.
- [ ] All entries already cover the 5 active locales (en/tr/ar/es/fr) via `getProgramUiCopy` localization; do **not** add de/hi/id/pt/ru content (those locales aren't routed per `src/lib/i18n.ts:1`).
