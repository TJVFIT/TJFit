# TJAI v2 — full spec

Built from 100 multiple-choice answers from Joseph (2026-04-27).
This is the spec we ship to. Treat as authoritative.

---

## North star

**"A real coach in your pocket, in 5 languages."**

A 3-stage intake → 12-week plan with workouts, daily fixed meals,
weekly grocery list (priority + alternates), goal-based supplement stack,
locally-flavored recipes, all in the user's language.

---

## 1. Intake architecture

- **3 stages** with save points between: Personal → Local → Health.
- **Adaptive** — skip irrelevant questions (no gym Qs if "home only").
- **Auto-save every answer** — resume on next visit.
- **Old quiz stays alive** as a 2-week opt-in transition; new flow at `/[locale]/ai`.
- Persona picker shown FIRST — Drill / Clinical / Mentor sets tone for everything after.
- **Tap-to-pick cards** as primary input. Sliders for numerics with **live calculation**:
  - weight slider → BMI shown live
  - budget slider → estimated grams of protein/day
  - days/week slider → "this becomes a 4-day upper/lower split"
- **Visual phase indicator with stage names** as progress UI.
- **Back navigation works any number of steps**.
- TJAI uses the user's **first name** at every prompt ("Joseph, what's your goal?").
- **Brutally honest tone** — push back on unrealistic asks ("losing 20kg in 12 weeks is unsafe; 8-10 is realistic").
- **Minimal humor** — focused tool, not a friend.

### 1A — Personal stage (~12 questions)

- Body stats: age, height, weight, body-fat estimate (visual chart), sex/gender (no cycle tracking)
- Goals: lose fat / build muscle / performance / recomp / recovery
- Training history: years lifting, injuries, prior plans
- Schedule: days/week, session length, time of day
- Lifestyle: sleep avg + quality, stress 1-5, job type (desk/active/physical)
- Identity: religion (drives halal/kosher/fasting), cultural background (drives recipes), family situation (drives portions)

### 1B — Local stage (~5 questions)

- Country picker (manual)
- City picker (manual, free-text fallback)
- "Which markets do you usually shop at?" — TJAI dynamically generates per-country options (Migros / BIM / A101 / CarrefourSA / Şok for TR; Carrefour / LuLu / Panda / Tamimi / Danube for GCC; Mercadona / Carrefour / Lidl / Dia / El Corte Inglés for ES; Carrefour / Leclerc / Auchan / Monoprix / Lidl for FR). User picks one or types their own (saved for crowdsourcing).
- Grocery delivery preference: Getir / Migros Sanal Market for TR, Talabat / Carrefour app for GCC, Glovo / Mercadona for ES — deeplinked from the grocery list.
- Cook-time budget: 15 / 30 / 60 min/day.

### 1C — Health stage (~10 questions)

- Cardiovascular history (heart, BP, recent surgery)
- Diabetes (T1/T2, insulin)
- Pregnancy / postpartum
- ED history (current or in recovery) — gates honestly per existing safety guard
- Smoking / vaping
- Alcohol intake (per-week)
- Caffeine (cups/day)
- Hydration current habit
- Existing supplement stack (don't double-dose)
- Allergies (food + supplement-derived: whey, soy, shellfish-omega)
- Medications (interaction risk for supplements)
- Caffeine/stim tolerance

**High-risk handling: generate normally with a small disclaimer** (Joseph's
choice — note: this conflicts with the existing strict-medical-refusal
guard for extreme cuts. The medical-safety addendum still refuses extreme
cuts; the disclaimer path applies to other risk signals like CV history).

**Re-prompt cadence:** ask once at intake; user updates via settings;
**re-prompt automatically when weight changes by > 3 kg** since last
intake (intake "tune-up" suggestion).

---

## 2. The plan output

### 2A — Workout program

- **12-week block** (3 phases × 4 weeks).
- Split chosen by **goal** (hypertrophy → PPL, strength → upper/lower).
- Each exercise includes: sets, reps, RPE/RIR target, tempo, rest, form cue, linked YouTube video.
- **Auto-progresses week to week** — small load/rep bump unless RPE was too high last week.
- User logs sessions: **picks quick mode (one tap per set) or detailed mode (weight + reps + RPE)**.
- Body tracking: weekly weigh-in (already built).

### 2B — Diet plan

- **Daily fixed meals** (Mon — oats + chicken; Tue — ...).
- Macro math: BMR via Mifflin-St Jeor + activity, then **goal-bias preset** (cut: -500 kcal, recomp: -200, bulk: +300).
- Respects **prep time budget** (15/30/60 min/day intake).
- **Hard filters**: religion (halal/kosher), allergies, vegetarian/vegan/pescatarian, fasting periods (Ramadan-aware).
- Soft filter: dislikes.
- Meal logging: **tap-to-tick from today's plan** (no manual macros).

### 2C — Recipes

- **Full recipes**: ingredients + step-by-step + macros + cost estimate + cook time + difficulty (1-3) + substitution notes.
- **Locally-flavored**: TR users get Turkish recipes, AR users get Middle-Eastern, ES Spanish, FR French.
- **Generated fresh by Claude Haiku** per user (model routing already built).
- **Cache by hash** of (goal + diet + ingredients): same profile shape gets the same recipe — saves cost.
- Photo: Joseph chose "full recipe with photo" — note: image generation is out of scope for v1; ship recipes without photos initially.

### 2D — Grocery list

- **Generic + brand hint** ("chicken breast — try Banvit at Migros").
- **Organized by priority** (must-haves vs optional).
- **Alternates per item**: 1-2 swaps + budget-tier swaps ("grass-fed beef → regular beef") + halal-aware swaps.
- **Weekly Sunday list** — one big shop.
- **PDF export** as primary delivery.
- Tight-budget mode: bias to eggs, chicken thigh, lentils, oats. Surface store-brand alternates.

### 2E — Supplement stack

- **Goal-based defaults** (cut → EAA + caffeine; bulk → creatine + protein).
- **Cite generic published ranges** with disclaimer ("creatine 3-5g/day per most studies; consult a clinician").
- **Region-specific buy links**: Suplementler.com (TR), iHerb (international).
- Filtered by allergies + medications + tolerance from health intake.

---

## 3. Persistence + memory

- **Reuse existing tables** (`saved_tjai_plans`, `tjai_user_memory`) — extend with new fields for groceries / supplements / recipes.
- New tables (small, self-contained):
  - `tjai_recipes_cache` (recipe hash → JSON for cohort dedup)
  - `tjai_market_writeins` (crowdsourced market names per locale)
  - `tjai_intake_v2_answers` (the new 3-stage answers schema)
- Intake **auto-deletes after 12 months of inactivity**.
- "Delete my account" = **hard delete** (every row gone).
- TJAI uses anonymized aggregates only for cohort patterns; **never trains models on user data**.

---

## 4. Tracking + check-ins

- **Daily 30-second check-in** (3 questions: energy / soreness / hit your meals?) replaces the weekly check-in for high-touch.
- Weekly: **auto-emailed Sunday report** (macros adherence + workouts hit + weight delta).
- Body tracking: weekly weigh-in (built); flag weight delta > 3 kg as intake-tune-up trigger.
- Comparison: only **vs user's past self** (this week vs week 1) — never vs others.
- **No coach handoff promotion** — TJAI is the coach.
- **No community plans inspiration view** — every plan stays personal.

---

## 5. Monetization

- **Free trial**: 5 messages, includes one full intake (current cap).
- **Paid tier unlocks**: full 12-week plan + unlimited TJAI chat + voice replies + adaptive weekly suggestions.
- **Upgrade prompt fires AFTER plan preview, BEFORE showing full plan**.
- **No coach-review upsell** — TJAI handles it.
- **Affiliate links**: supplements (Suplementler.com / iHerb), grocery delivery (Getir / Migros / Talabat), equipment (existing /store).
- **No sponsor mentions** — recommendations stay neutral.
- **One paid upsell**: "Add 4 weeks to my plan" for a small fee.

---

## 6. AI infrastructure

- **Plan generation**: hybrid — Opus for the 12-week plan structure, Haiku for grocery list + recipes + supplement stack.
- **Caching**:
  - System prompts via `cache_control` (already built)
  - Recipe cache (hash on profile shape)
  - Grocery list templates per region+budget tier
- **Generation UX**: **streaming** — user watches each section appear.
- **No vision**, no photo macros, no form-check video — text + numerics only for v1.

---

## 7. Localization

- **Full plan generation in user's locale**, including recipes (TR/AR/ES/FR all native).
- Cultural patterns: Ramadan-aware intake, regional meal-time defaults, local breakfast staples in recipes.
- Units: **user picks at intake** (metric vs imperial).
- Currency: TRY-base, formatted per locale (already built).
- RTL: layout flips on /ar (built in middleware), but **charts/calculators stay LTR** for clarity.

---

## 8. Sharing + growth

- **Refer-a-friend**: both get a discount when the friend signs up.
- Existing share-card generator already built — keep, don't extend.
- **No public plan links** — privacy stance.

---

## 9. Edge cases

- **>2 kg/week loss request**: generate with disclaimer (Joseph's choice). ⚠️ Conflicts with existing extreme-cut refusal in `medical-safety.ts` — the disclaimer path bypasses that guard for cardio history etc., but the extreme-cut regex *should still refuse* the > 2 kg/week ask. Confirm policy.
- **BMI < 18.5 + cut request**: generate careful maintenance plan with "see your doctor" banner.
- **0 days/week schedule**: TJAI pushes back, requires at least 2 days/week.
- **Contradictory answers**: TJAI flags + asks "which is more important?".

---

## 10. Brand promise + first action

- Tagline shown post-plan: **"A real coach in your pocket, in 5 languages."**
- First action prompt: **schedule first workout** (calendar deeplink prompt).
- Plan generation moment: **quiet "Plan ready" card with 1-line summary** — no confetti.

---

## Build sequencing

Joseph's pick: **start with Stage 1 intake** (personal questions) replacing the current quiz. Then iterate in this order:

1. **Stage 1 intake** (personal) — replace current TJAI quiz UX
2. **Stage 2 intake** (local) — adds market picker + dynamic country options
3. **Stage 3 intake** (health) — adds medical/lifestyle/restrictions
4. **New plan generation pipeline** (Opus + Haiku hybrid, streaming)
5. **Recipes generator** (Haiku, cached by hash)
6. **Grocery list generator** (Haiku, market-aware, priority+alternates)
7. **Supplement stack generator** (deterministic + Haiku for personalization notes)
8. **Daily 30-sec check-in** (replaces weekly with extension)
9. **Sunday report** (extends existing pro-renewal-email)
10. **Affiliate link layer** (config table + interceptor on every external link)
11. **Refer-a-friend** (existing growth memory note + new discount table)
12. **Old quiz deprecation** (after 2 weeks of beta on new flow)

---

## Resolved policy decisions

1. **Extreme requests**: Keep the strict regex refusal for hard-extreme
   asks (>2 kg/week loss, BMI<17 cuts, ED-pattern, drug-dosing). The
   disclaimer path applies to grayer health signals (cardiovascular
   history, smoking, alcohol, etc.).

2. **Recipe caching**: Cache regional recipe **templates** and ingredient
   lookups (per cuisine + dietary restriction). The user's specific
   generated recipe text is fresh per generation via Haiku (~$0.05/recipe).

3. **External export**: PDF-only for v1. Notion + Google Docs export
   deferred to Phase 2 polish. No OAuth work in the launch path.

4. **Coach handoff**: Leave existing `request-coach-review` API and
   `coach-review-request.tsx` component in place — they already work on
   program detail pages. Don't surface them inside the TJAI flow itself.

---

## What this means for code

This will take **several focused sessions** to land safely. The build order above translates to roughly 6-8 PRs, one per major chunk. Each one independently shippable behind a feature flag.

**Next session, we start with #1 — Stage 1 intake replacement.** I'll need:
- Look at current `tjai-quiz.tsx` to understand the existing UX
- Design new question schema with adaptive logic
- Migration for `tjai_intake_v2_answers`
- New stage-1 page with persona-first flow + auto-save

Don't ask me to do all 12 in one session. Pick the next one when you're ready.
