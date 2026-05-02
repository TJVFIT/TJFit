# Diets Gap Audit — 2026-05-02

Source of truth: `src/lib/content.ts` lines 1138–1832 (entries with `category: "Nutrition"`) plus the cutting/bulking classification in `src/lib/diet-catalog.ts:5-41`. There is no `is_published` flag — every entry in the array is effectively published.

## Summary

- **Total Nutrition entries:** **32** (30 twelve-week diets + 2 starters: `clean-cut-starter` `:1790`, `lean-bulk-starter` `:1811`).
- **Master-prompt target:** 32
- **Status:** AT TARGET (exact match).
- **Phase split** (per `diet-catalog.ts:5-41`): 20 cutting + 12 bulking.
- **Distribution issues:**
  - The cultural seeds called out in the brief (Turkish breakfast, Arabic plates, German Käsebrot/Quark, Indian dal/roti, Indonesian nasi uduk/tempeh) are **not** present as dedicated diet slugs. Only `mediterranean-lean-protocol-12w` (`:1348`) and `mediterranean-maintenance-12w` (`:1628`) overlap with Turkish/Arabic-adjacent cuisine; everything else is region-neutral.
  - Brief asked for halal-cut + halal-bulk; only **halal-cut** exists (`halal-high-protein-cut-12w` `:1588`). No `halal-bulk-*`.
  - Brief asked for vegetarian-bulk; covered as `vegetarian-lean-bulk-12w` (`:1428`) and `plant-based-muscle-gain-12w` (`:1408`).
  - Brief asked for IF-cut; covered as `intermittent-fasting-cut-12w` (`:1388`).
  - Brief asked for athlete style; covered as `hard-cut-athlete-diet-12w` (`:1243`) + `muscle-gain-athlete-diet-12w` (`:1285`).
  - Brief asked for student-budget; covered as `student-fat-loss-diet-12w` (`:1180`), `student-bulk-diet-12w` (`:1306`), and `budget-cutting-meal-plan-12w` (`:1688`).
  - Brief asked for keto, clean, gut-health, mediterranean — all covered.

## Distribution by phase × level

Phase from `CUTTING_SLUGS` / `BULKING_SLUGS` (`diet-catalog.ts:5-41`); level from `difficulty`.

| Phase | Beginner | Intermediate | Advanced | All levels | Total |
|---|---|---|---|---|---|
| Cutting | 2 | 8 | 1 | 9 | 20 |
| Bulking | 1 | 4 | 3 | 4 | 12 |
| **Total** | 3 | 12 | 4 | 13 | **32** |

## Distribution by style

Inferred from slug. Each diet placed in exactly one bucket.

| Style | Count | Slugs (`content.ts` line) |
|---|---|---|
| Keto | 1 | `keto-shred-diet-12w` (`:1138`) |
| Clean / generic | 6 | `clean-cutting-diet-12w` (`:1222`), `clean-weight-gain-diet-12w` (`:1327`), `clean-cut-starter` (`:1790`), `lean-bulk-starter` (`:1811`), `lean-bulk-diet-12w` (`:1201`), `flexible-dieting-framework-12w` (`:1468`) |
| Athlete | 3 | `hard-cut-athlete-diet-12w` (`:1243`), `muscle-gain-athlete-diet-12w` (`:1285`), `post-workout-recovery-nutrition-12w` (`:1668`) |
| Student / budget | 3 | `student-fat-loss-diet-12w` (`:1180`), `student-bulk-diet-12w` (`:1306`), `budget-cutting-meal-plan-12w` (`:1688`) |
| Mediterranean | 2 | `mediterranean-lean-protocol-12w` (`:1348`), `mediterranean-maintenance-12w` (`:1628`) |
| Gut-health / sensitive | 4 | `gut-health-fat-loss-diet-12w` (`:1159`), `anti-inflammatory-reset-12w` (`:1488`), `low-fodmap-fat-loss-12w` (`:1528`), `hormone-balance-nutrition-12w` (`:1508`) |
| Halal | 1 | `halal-high-protein-cut-12w` (`:1588`) |
| Kosher | 1 | `kosher-clean-bulk-12w` (`:1608`) |
| Vegetarian / plant | 2 | `vegetarian-lean-bulk-12w` (`:1428`), `plant-based-muscle-gain-12w` (`:1408`) |
| Allergen-free | 2 | `gluten-free-performance-12w` (`:1548`), `dairy-free-muscle-plan-12w` (`:1568`) |
| Intermittent fasting | 1 | `intermittent-fasting-cut-12w` (`:1388`) |
| High-protein / cutting protocol | 4 | `high-calorie-mass-diet-12w` (`:1264`), `high-protein-fat-loss-12w` (`:1368`), `carb-cycling-system-12w` (`:1448`), `high-volume-low-calorie-cut-12w` (`:1648`) |
| Body-type / lifestyle | 2 | `endomorph-fat-loss-diet-12w` (`:1728`), `travel-and-restaurant-diet-12w` (`:1708`) |

## Cultural seeds — explicit gap analysis

The brief asks for cultural diet seeds that map to the 5 active locales (en/tr/ar/es/fr per `src/lib/i18n.ts:1`). Current state:

| Cultural seed (brief) | Active locale | Current coverage | Status |
|---|---|---|---|
| Turkish breakfast (kahvaltı) | tr | None — closest is `mediterranean-lean-protocol-12w` | MISSING |
| Arabic plates (mezze, mansaf, foul) | ar | Only `halal-high-protein-cut-12w` (cuisine-neutral) | MISSING — no Arabic-cuisine plate library |
| German Käsebrot/Quark | (de — DORMANT, not routed) | n/a | SKIP per scope — de not in active locale set |
| Indian dal/roti | (hi — DORMANT, not routed) | n/a | SKIP per scope — hi not in active locale set |
| Indonesian nasi uduk/tempeh | (id — DORMANT, not routed) | n/a | SKIP per scope — id not in active locale set |

Active-locale cultural cuisine still missing: Spanish/Latin (es), French (fr).

## Recommendations

The catalog is **exactly at 32 diets**, so no quantity change is needed. Recommended swaps (if you want to add cultural cuisine without exceeding 32, deprecate the closest duplicate first):

### Candidates to deprecate (duplicates / padding)

- [ ] `clean-weight-gain-diet-12w` (`content.ts:1327`) overlaps almost entirely with `lean-bulk-diet-12w` (`:1201`) — both are clean-bulk advanced cuts.
- [ ] `mediterranean-maintenance-12w` (`:1628`) is largely a maintenance-phase variant of `mediterranean-lean-protocol-12w` (`:1348`).
- [ ] `flexible-dieting-framework-12w` (`:1468`) is conceptual scaffolding more than a meal plan; could be an article instead.

### Recommended cultural additions (concrete slug + 1-line concept)

For active locales only — do **not** add de/hi/id/pt/ru per scope guard.

- [ ] `turkish-kahvalti-cut-12w` — Turkish breakfast-led 1900–2100 kcal cutting plan: kahvaltı plate, mercimek çorbası, lean köfte, yoğurt-based snacks. Localized first to `tr`, then en/ar/es/fr.
- [ ] `arabic-mezze-cut-12w` — Levantine-Gulf cutting plan around mezze plates (foul, hummus, tabbouleh, grilled chicken/lamb shish), 1800–2200 kcal. Localized first to `ar`.
- [ ] `arabic-bulk-mansaf-12w` — Arabic high-calorie bulking plan with mansaf, freekeh, kabsa, lamb riyash; pairs with `halal-high-protein-cut-12w` to give halal-bulk + halal-cut symmetry the brief asked for. Slug variant: `halal-high-calorie-bulk-12w` if you prefer to keep the `halal-` prefix consistent.
- [ ] `spanish-mediterranean-cut-12w` — Spain-coded variant of mediterranean-lean (gazpacho, tortilla, paella ligera, pescado a la plancha). Localized first to `es`.
- [ ] `french-clean-cut-12w` — French-coded clean-cut (salade niçoise, ratatouille, poulet rôti). Localized first to `fr`.

Adding 5 cultural seeds while deprecating 3 duplicates lands at 34. To stay at exactly 32, ship the two highest-priority cultural ones and absorb the others as variants (e.g. add Turkish + halal-bulk only, deprecate `clean-weight-gain-diet-12w` + `mediterranean-maintenance-12w`).

### Pure quality / deduplication tasks (no count change)

- [ ] Stale `NUTRITION_SLUGS` set at `src/app/[locale]/programs/page.tsx:40-63` lists 22 slugs, 10 of which (`clean-bulk-diet-plan`, `high-calorie-muscle-diet`, `lean-bulk-nutrition-plan`, `mass-gain-meal-plan`, `hardcore-bulk-diet`, `fat-loss-diet-plan`, `cutting-shred-meal-plan`, `low-calorie-lean-diet`, `keto-cut-plan`, `high-protein-cutting-diet`) **don't exist in `content.ts`**. Replace with `isCatalogDiet(raw)`. (Also flagged in `PROGRAMS_GAP.md`.)
- [ ] Add `getDietCalorieSpec` entries (`src/lib/diet-catalog.ts:62-87`) for the 22 diets currently returning `null` (everything beyond `clean-cut-starter`, `lean-bulk-starter`, and the original 10).
- [ ] Add explicit `cultural_locale` or `cuisine_tag` field to the `Program` type so the cultural seeds (existing + new) can be filtered/sorted by cuisine in the UI.

### Forward-looking (not part of this sprint)

- [ ] Pricing stays `0` per `feedback_pricing.md`. Master-prompt $4.99/diet recorded for later in `project_current_upgrade.md`; do not apply now.
- [ ] All 32 entries cover the 5 active locales via `localizeProgram`; do **not** translate to de/hi/id/pt/ru — those locales are dormant per `src/lib/i18n.ts:1`.
