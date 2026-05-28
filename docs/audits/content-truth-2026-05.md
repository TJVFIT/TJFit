# Content Truth Audit — Programs + Diets — 2026-05-27 (Plan2 phases 7 + 8, approved)

**Method:** traced every program/diet content source and how it reaches customers. Files: `src/lib/content.ts`, `src/lib/bundles.ts`, `src/lib/free-product-pages.ts`, `src/lib/programs/index.ts`, `src/lib/diets/index.ts`, `src/app/api/free/download/route.ts`, `src/app/[locale]/page.tsx`, bundle pages.

## The four content sources (and what's real)

| Source | Entries | Real day-by-day content? | Reaches customers? |
|---|---|---|---|
| `src/lib/free-product-pages.ts` | **4** (`home-fat-loss-starter`, `gym-muscle-starter`, `clean-cut-starter`, `lean-bulk-starter`) | ✅ YES — `getFreeProductPageModel` returns real `blocks` | ✅ via `/api/free/download` PDF |
| `src/lib/bundles.ts` | **12** bundles | ⚠ PARTIAL — 3-phase outline + 1 sample training day + 1 sample meal day. No full week-by-week (see bundle-pdp-2026-05.md) | ✅ bundle pages + PDF |
| `src/lib/content.ts` | **83** programs+diets | ❌ MOSTLY NO — marketing metadata only (title, description, `assets[]` labels, `previewImages[]`). Real `blocks` only for the 4 slugs that also have a free-product model | ✅ homepage catalog + `/api/free/download` |
| `src/lib/programs/index.ts` + `src/lib/diets/index.ts` | 1 + 1 (placeholder, empty `weeks`) | ❌ NO | ❌ **dead code — imported nowhere** |

## The over-claim

`content.ts` markets 83 programs/diets, each titled "(12 Weeks)" with `assets`:
```
"12-week day-by-day workout schedule"
"Movement form and pacing guide" / "exercise-video"
"Execution and recovery handbook" / "pdf-guide"
"Fat-loss meal timing support notes" / "nutrition-plan"
```

When a customer downloads one of these via `/api/free/download`, [route.ts line 366](../../src/app/api/free/download/route.ts) does `blocks: model?.blocks ?? []`. For the **79 catalog entries that are NOT one of the 4 backed free-product slugs, `blocks` is empty** — the generated PDF contains the title, the asset-label list (rendered as if delivered), safety lines, and evidence lines, but **no actual workout/meal days**.

That is the content-truth gap: the asset list reads like a table of contents for content that isn't in the file.

## Severity

- **Financial: none today.** Every program/diet is `price: 0` / `is_free: true` (owner directive: prices stay $0 until set). Nobody is paying for unfulfilled content.
- **Reputational: P2.** A free download that promises "12-week day-by-day schedule" and delivers a structural shell undermines trust — exactly the failure mode LASTCLAUDECODE.md Cycle 018 + the master prompt (#3 priority) warn against.

## What was changed in this pass (safe, non-destructive)

1. **`src/lib/diets/index.ts`** — added a ⚠ DEAD CODE banner: imported nowhere, empty `weeks`, must not be wired to a customer route until it holds real content.
2. **`src/lib/programs/index.ts`** — added a ⚠ banner clarifying it's not the customer-facing source and registers only `comeback12w`.

**Deliberately NOT changed** (these are product/content decisions, not surgical edits — flagged for owner):
- Did **not** gate or remove the 79 catalog downloads. Removing customer-reachable functionality unilaterally is out of scope; everything is free so there's no urgent financial harm.
- Did **not** rewrite the 83 catalog `assets` labels. The honest fix is either (a) author the real content, or (b) soften the labels — both owner calls.

## Recommended owner decisions (Plan 3)

| Option | Effort | Truthfulness |
|---|---|---|
| **A. Author real content** for the top N catalog programs (real `blocks` like the 4 starters) | High (content authoring) | Best — delivers the promise |
| **B. Gate `/api/free/download`** to only emit PDFs for slugs with real `blocks`; mark the rest "Coming soon" on the catalog | Low (code) | Honest — no hollow PDFs |
| **C. Soften `assets[]` labels** in content.ts to describe what's actually in the shell PDF ("structural overview", "weekly framework") | Low (copy) | Honest but weaker product |

Recommendation: **B now** (stops hollow PDFs immediately, low risk, reversible) **+ A over time** (real content for flagship programs). Both need owner sign-off on which programs are "live" vs "coming soon".

## What this audit confirms is honest today

- The **4 free-product starters** deliver real day-by-day PDFs. ✓
- The **12 bundles** are honest as "sample-driven 12-week roadmaps" — hooks don't claim grocery lists / full recipes (bundle-pdp-2026-05.md). ✓
- The dead placeholder registries are now clearly marked so no future dev wires an empty-weeks diet into a "12-week diet" route. ✓
