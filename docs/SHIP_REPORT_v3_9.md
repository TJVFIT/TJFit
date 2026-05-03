# Ship Report — v3.9 (Content Foundation + Polish) — 2026-05-03

> v3.9's prompt was 30-35 hours of work split across multiple sessions
> by its own admission. This session ships the **foundation that
> unblocks every future authoring session**: schemas, exercise
> library, ONE complete program proof (Comeback 12w with full Week 1),
> the translation pipeline scaffold, and the visible polish (logo
> trim + sidebar animation utilities).
>
> Programs 2-15, diets 1-15, the actual translation runs, the PDF
> renderer rebuild, the top-nav hover-reveal, and v3.5 features 2-6
> are all queued with concrete start points below.

---

## ✅ What shipped (v3.9 — round 1)

### Schemas (Phase 1) — the spine

- [src/lib/programs/schema.ts](../src/lib/programs/schema.ts) — `Program`, `ProgramWeek`, `WorkoutDay`, `ExercisePrescription`, `Set`, `Exercise`, `LocalizedString`, `SUPPORTED_LOCALES`, `TRANSLATE` sentinel, `en()` helper. The whole training data shape lives here.
- [src/lib/diets/schema.ts](../src/lib/diets/schema.ts) — `Diet`, `DietWeek`, `DayPlan`, `Meal`, `Ingredient`, `Macros`, `computeCalories()` helper. Mirror shape for nutrition.
- Locale strategy locked: EN authored, other locales start as `__TRANSLATE__` and the translation pipeline (Phase 5) walks the data tree to fill them via DeepL (TR / ES / FR) or Microsoft Translator (AR).

### Exercise library (Phase 2) — atomic-movement vocabulary

- [src/lib/programs/exercises/library.ts](../src/lib/programs/exercises/library.ts) — 18 core movements covering everything Comeback 12w needs:
  - Compounds: barbell back squat, RDL, bench, OHP, bent row, pull-up, lat pulldown, DB bench, DB row, DB OHP
  - Specialists: Bulgarian split squat, goblet squat, leg curl, calf raise
  - Accessories: barbell curl, tricep rope, plank, push-up
- Each entry has full EN: `name`, `muscleGroups`, `equipment`, `description`, `cues` (3-5 specific bullets), `warningNotes` where relevant. TR/AR/ES/FR sit at `__TRANSLATE__` waiting for the pipeline.
- Helpers exported: `getExercise(id)`, `allExerciseIds()` for catalog views and translation runs.

### Comeback 12w (Phase 3) — full program proof

The heart of this round. End-to-end proof the schema renders a real, day-by-day, evidence-based program.

- [src/lib/programs/programs/comeback-12w/header.ts](../src/lib/programs/programs/comeback-12w/header.ts) — full program metadata:
  - Goal, who_for, who_not_for (honesty section), results_expected with realistic variance disclaimer, prerequisites
  - `why_this_works` cites the muscle-memory research (myonuclei persistence)
  - `progression_strategy` + `deload_strategy` clearly stated
  - 4 evidence citations (Schoenfeld 2018, Helms 2016, Stronger By Science muscle-memory summary, ACSM pre-screening)
- [src/lib/programs/programs/comeback-12w/weeks/week-01.ts](../src/lib/programs/programs/comeback-12w/weeks/week-01.ts) — **fully authored Week 1**:
  - 4 training days: Lower-Squat / Upper-Push / Lower-Hinge / Upper-Pull
  - Each day has full warmup script, exercise prescriptions with sets / reps / weight directives / rest seconds / RPE / tempo, day-specific notes, full cooldown
  - 3 rest days with active-recovery notes
  - Total ~48 working sets, ~240 minutes of training
  - RPE 6 across the board (foundation phase)
- [src/lib/programs/programs/comeback-12w/weeks/progression-rules.md](../src/lib/programs/programs/comeback-12w/weeks/progression-rules.md) — **the 12-week progression spec**:
  - Mesocycle map (week → phase → RPE → working sets / movement → total weekly sets → notes)
  - Per-lift week-by-week table for squat, bench, deadlift/RDL, row/pulldown
  - Deload-week details for weeks 4 and 8
  - Authoring checklist for translating the spec into `week-NN.ts` files
  - Status table (week 1 ✅, weeks 2-12 ⏳)
- [src/lib/programs/programs/comeback-12w/index.ts](../src/lib/programs/programs/comeback-12w/index.ts) — assembles header + weeks into the `Program` shape, computes `exercises_used` set automatically.
- [src/lib/programs/index.ts](../src/lib/programs/index.ts) — registry: `getProgram(slug)`, `listPrograms()`, `listProgramSlugs()`.

The Comeback program is real enough to:
- Render as a PDF once Phase 6 lands
- Drive a workout-player session screen
- Be reviewed by a coach for accuracy
- Serve as the template every future program slug copies

### Translation pipeline (Phase 5) — scaffold

- [scripts/translate-content.ts](../scripts/translate-content.ts) — full file walker + placeholder detector + provider router (DeepL for TR/ES/FR, Microsoft for AR) + idempotency-via-hash design. **Provider HTTP calls are stubbed** with explicit "not wired" errors and a setup checklist in the file header. To activate: install `deepl-node` + `@azure-rest/ai-translation-text`, set `DEEPL_API_KEY` / `AZURE_TRANSLATOR_*` env vars, replace the two stub functions.
- [scripts/translation-glossary.json](../scripts/translation-glossary.json) — 50 locked terms across all 5 active locales: brand names (TJFit, TJAI, Pro, Apex), training vocabulary (rep/set/RPE/AMRAP/EMOM/RIR/warmup/cooldown/deload/superset/tempo), equipment (barbell/dumbbell/kettlebell/bench/rack/cable/pull-up bar), lifts (squat/deadlift/bench press/OHP/row/pull-up), goal vocabulary (fat loss/muscle gain/bulking/cutting/recomp), macros (calories/protein/carbs/fat/fiber/macros), cultural (halal/iftar/suhoor/Ramadan).
- Run modes documented in the file header: `--check` (dry-run, count chars + cost estimate), `--asset programs --id comeback-12w --locales tr,ar` (single asset), `--asset all` (full rebuild).

Cost estimate at full content (per the v3.9 prompt's analysis): **~$115 one-time** for 4 locales × ~5.4M chars total. Held until programs 2-15 + diets are authored.

### Logo trim (Phase 8)

The existing `<Logo>` component is already a clean SVG TJ monogram with cyan/blue gradient — not AI-generated as feared. The "AI-made cheap" feeling came from the inline "Performance" subtitle below the wordmark. [src/components/ui/Logo.tsx](../src/components/ui/Logo.tsx) — that subtitle removed, wordmark stands clean. PNG fallbacks at `public/brand/logo-{main,mark,source}.png` left for now (designer pass to replace those is its own follow-up; they only render in JSON-LD metadata and the press page, not in the live UI).

### Sidebar animation CSS (Phase 9)

[src/app/globals.css](../src/app/globals.css) — six new opt-in utility classes added to the existing `@layer utilities` block:

- `.tj-sidebar-section` + `.tj-sidebar-link-item` — stagger fade-up on overlay open via `--tj-section-i` / `--tj-link-i` custom properties (set per-instance for varied delays)
- `.tj-sidebar-link` + `::before` slide-in cyan-tint background on hover (RTL-aware via `inset-inline-start: 0`)
- `.tj-sidebar-link-dot` — cyan dot that fades + scales in on hover / active
- `[aria-current="page"]` selector adds a 3px cyan vertical bar via `::after` (RTL-aware)
- All gated under `@media (prefers-reduced-motion: reduce)` to disable

Existing [src/components/shell/site-side-overlay.tsx](../src/components/shell/site-side-overlay.tsx) (392 lines, untouched) opts in by adding these classes + the index custom properties to its existing markup. That wire-up lands in the next session.

---

## ⚠️ Deferred — full v3.9 catalog with concrete start points

| Phase / item | Status | Concrete next step |
|---|---|---|
| **P3 — Comeback Weeks 2-12** | Authoring rules locked in `progression-rules.md`; weeks 2-12 files don't exist yet | New session: copy `week-01.ts` shape, walk the per-lift progression table, author one week per session. Each week ~150-300 lines. |
| **P3 — Programs 2-15** | None built. Slugs decided in v3.9 prompt §3.1. | New folder per slug under `src/lib/programs/programs/{slug}/`. Reuse the Comeback file shape (header + weeks + index). Each program ~12-15 hours of authoring per the prompt's own estimate. |
| **P4 — Diets 1-15** | Schema + ingredient slot ready. No diet author files yet, no ingredient library yet. | Build `src/lib/diets/ingredients/library.ts` (~30 staples), then one diet at a time. Middle-Eastern Cutting recommended as the proof-of-concept. |
| **P5 — Translation runs** | Pipeline scaffold landed. SDKs not installed, env vars not set. | `pnpm add -D deepl-node @azure-rest/ai-translation-text`; replace `callDeepL` / `callMicrosoft` stubs in `scripts/translate-content.ts`; set env vars; run `pnpm tsx scripts/translate-content.ts --check` first to confirm dry-run. |
| **P6 — Locale-aware PDF** | Existing PDFs use `jspdf` (not `@react-pdf/renderer` as the v3.9 prompt assumed). | Either rebuild the 5 existing PDF builders (`src/lib/program-pdf-builder.ts`, `diet-pdf-builder.ts`, `tjai-pdf-builder.ts`, `tjai-pdf.ts`, `premium-pdf-theme.ts`) on `@react-pdf/renderer` for proper RTL support, or extend the jspdf path with Unicode-RLE markers (U+202B) + Cairo/NotoSansArabic font registration. The latter is faster. Recommend: keep jspdf; add Arabic font registration + `‫` wrapping for AR text. Add a `?locale=` query-string handler to the existing routes. |
| **P7 — UI integration (locale-aware program/diet pages)** | Catalog still reads from `src/lib/content.ts`; new program detail page should read from `src/lib/programs/getProgram(slug)`. | New route `[locale]/programs/v2/[slug]` that reads from `getProgram()` and renders `program.weeks[*].days[*]` per `params.locale`. Keep old route alive for non-migrated programs. |
| **P7.3 — Diet section accessibility fix** | Founder reported "can't access diet section". | Confirm `[locale]/diets/page.tsx` and `[locale]/diets/[slug]/page.tsx` both exist (per round 1 audit, they do). Fix any 404s by populating `src/lib/diets/index.ts` with at least one published diet, then re-link from the sidebar's TRAIN section. |
| **P8 — Logo PNG replacement** | Inline SVG Logo trimmed; PNG fallbacks at `public/brand/logo-{main,mark,source}.png` are still AI-generated. | Hire a designer ($200-400 Fiverr) for refined wordmark + monogram set; export as `public/brand/logo-monogram.svg`, `logo-wordmark.svg`, `logo-stacked.svg`, `logo-horizontal.svg`, plus PWA icons (192/512/maskable) + favicon + apple-touch-icon. Update `src/lib/brand-assets.ts` to point at the new files. |
| **P9 — Sidebar wire-up** | CSS utilities ready; sidebar component doesn't apply them yet. | Edit [src/components/shell/site-side-overlay.tsx](../src/components/shell/site-side-overlay.tsx): add `.tj-sidebar-open` to the root when open, `.tj-sidebar-section` + `style={{ ['--tj-section-i']: i }}` per section, `.tj-sidebar-link-item` + `--tj-link-i` per link, `.tj-sidebar-link-dot` span inside each link's anchor. ~40 lines of edits. |
| **P10 — Top nav hover-reveal** | Not started. | `pnpm add @radix-ui/react-navigation-menu`; new `src/components/nav/TopNav.tsx` per v3.9 prompt §10.2; mount in [src/components/shell/site-top-bar.tsx](../src/components/shell/site-top-bar.tsx) replacing the existing nav strip. |
| **P11 — v3.5 features 2-6** | Feature 1 (card breathing on /programs) shipped at commit `f86ba16`. Features 2-6 deferred from v3.5 sprint. | Per v3.5 prompt: NumberDisplay wire-up, spatial Z-fold transitions, modal blooming, mobile tilt parallax, workout player full immersion. Each is a focused session. |
| **Phase 0 audits (4 reports)** | Skipped this round per "no more discussion, just build" directive. The audit content is folded into this ship report instead. | If a future round wants the formal docs/audits/v3_9/ trio, regenerate from current state via Explore agent in <30 min. |

---

## 📊 Build status

**v3.9 final: GREEN ✅** — `next build` `✓ Compiled successfully`.

Build #1 caught a TS error on the glossary JSON cast (the `_doc` comment-style key in JSON didn't fit the `Record<string, Record<Locale, string>>` Glossary type). Fixed by routing the cast through `unknown`. Build #2 clean.

| Round | Static pages | First Load JS shared |
|---|---|---|
| Round 1 | 353 | 158 kB |
| Round 2 | 354 | 158 kB |
| v2 | 373 | 158 kB |
| v3 | 373 | 158 kB |
| v3.5 #1 | 373 | 158 kB |
| **v3.9** | 373 (no new routes — content layer is data, not pages) | 158 kB |

No new npm dependencies. v3.9 changes: 7 new files, 2 small edits, 1 CSS addition.

---

## 🛡️ Hard rules honored (v3.9)

- ✅ Read every file before editing (existing Logo SVG was clean — saved a rebuild)
- ✅ Additive only — `src/lib/content.ts` untouched; old PDF builders untouched; existing program / diet routes untouched
- ✅ No `framer-motion`
- ✅ No new heavy dependencies (`deepl-node` / `@azure-rest/ai-translation-text` / `@radix-ui/react-navigation-menu` / `@react-pdf/renderer` all explicitly deferred with install commands documented)
- ✅ All new files under 500 lines (week-01.ts is the largest at ~250)
- ✅ Files split into per-week structure under `comeback-12w/weeks/` so the cap is naturally honored as weeks 2-12 land
- ✅ All `__TRANSLATE__` placeholders flagged for the translation pipeline; EN content authored per evidence-based research with citations
- ✅ Logical CSS properties (`inset-inline-start`, `margin-inline-end`) on every new sidebar utility
- ✅ All animations gated under `@media (prefers-reduced-motion: reduce)`
- ✅ Translation glossary uses underscore comment field (`"_doc"`) — JSON-comment workaround
- ✅ All file paths cited above

---

## 🚀 Deploy state

Branch `claude/jolly-kalam-ffc5a9` continues stacking. Going to push + fast-forward `main` after this report lands.

**No new migrations required.** v3.9 is content + scaffold; no schema additions. The five existing migrations from prior rounds (R1×2, R2×1, v2×1, v3×1, v4×1 = 6 total) plus already applied are unchanged.

**Vercel auto-deploys** [tjfit.org](https://tjfit.org) from `main` within ~3 min of the push.
