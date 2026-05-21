# TJFit Program Authoring Map — 51 Programs, One System

> Status: 1 program fully built (`comeback-12w`), ~17 markdown stubs in `docs/programs/*.md`, ~12 misfiled diet specs (move to `docs/diets/`), 33 programs not yet written. This map is the contract for the next ~6 weeks of program authoring. Read it before you write a single workout day.

---

## 1. Portfolio Architecture — the 51

The matrix is **Goal × Setting × Difficulty × Duration**. We fill it deliberately so no two SKUs cannibalise each other. Anything with >70% week-by-week overlap is one program with two names, and we don't ship that.

### Axes
- **Goal (7):** Hypertrophy, Strength, Fat Loss, Recomp, Conditioning, Specialty (sport-specific / aesthetic / mobility), Return-to-training.
- **Setting (4):** Gym (full equipment), Home (minimal — bands, DBs, pull-up bar), Bodyweight-only, Outdoor (track/park/hill).
- **Difficulty (3):** Beginner, Intermediate, Advanced.
- **Duration (4):** 6w (sprint/specialty), 8w (block), 12w (mesocycle — default), 16w (peaking/contest).

### Tier structure
- **Tier 1 — Foundational flagships (10):** the everyone-needs-this core. Highest volume of sales, ship first.
- **Tier 2 — Setting-shifted siblings (16):** same goal, different equipment context (e.g. Hypertrophy → Home Hypertrophy → Bodyweight Hypertrophy).
- **Tier 3 — Difficulty-shifted variants (12):** beginner and advanced cuts of the flagships.
- **Tier 4 — Specialty / Sport / Aesthetic (13):** focused, opinionated, premium-priced.

### The 51 (one-line positioning each)

**Tier 1 — Foundational (10)**
1. `hypertrophy-12w` — Israetel-style PPL hypertrophy mesocycle, gym, intermediate. *Flagship.*
2. `strength-12w` — Helms/Nuckols 4-day upper-lower strength block. Gym, intermediate.
3. `fat-loss-12w` — strength preservation + 3× lift / 2× conditioning, gym, intermediate.
4. `comeback-12w` — return-to-training. **Already built.**
5. `home-minimalist-12w` — DBs + bands + pull-up bar, intermediate, hypertrophy/strength hybrid.
6. `bodyweight-foundations-12w` — zero equipment, push/pull/squat/hinge progressions to first pull-up & pistol.
7. `recomp-16w` — calorie-cycled hypertrophy with conditioning days. Intermediate, gym.
8. `beginner-gym-12w` — first-time lifter, full-body 3×/wk, technique-first.
9. `conditioning-base-8w` — zone 2 + threshold + VO2, build the engine. Hybrid.
10. `mobility-foundations-6w` — daily 20-min routine, hip/shoulder/T-spine.

**Tier 2 — Setting-shifted siblings (16)**
11. `home-hypertrophy-12w` — Tier-1 hypertrophy, home equipment.
12. `bodyweight-hypertrophy-12w` — RR-style high-rep, tempo, unilateral progressions.
13. `home-strength-12w` — heavy DB / loaded backpack, 5×5 patterns.
14. `bodyweight-strength-12w` — tempo + pause + single-limb progressions (one-arm pushup track).
15. `home-fat-loss-12w` — DB circuits + LISS, 4×/wk.
16. `bodyweight-fat-loss-12w` — bodyweight metcons + walking volume.
17. `outdoor-fat-loss-12w` — hill sprints + bodyweight circuits + ruck.
18. `outdoor-conditioning-8w` — track-based 5k/10k base build.
19. `home-recomp-12w` — calorie cycling + DB hypertrophy.
20. `gym-conditioning-8w` — sled/erg/farmer mix, hybrid athlete style.
21. `home-mobility-6w` — same as #10, home cues.
22. `bodyweight-mobility-6w` — pure floor flow / animal patterns.
23. `outdoor-bodyweight-hybrid-12w` — park bench + hill + bar, full mix.
24. `home-beginner-12w` — first program for a non-gym person.
25. `bodyweight-beginner-8w` — zero equipment onboarding ramp.
26. `gym-conditioning-30min-6w` — short-session fat loss for time-poor lifters.

**Tier 3 — Difficulty-shifted variants (12)**
27. `hypertrophy-advanced-12w` — specialization phases, MRV-pushing, 5-6×/wk.
28. `strength-advanced-12w` — block periodization, RPE 9-10, singles work.
29. `fat-loss-aggressive-8w` — high-deficit cut, lift preservation + sprint conditioning.
30. `beginner-strength-12w` — Starting-Strength-style LP, gym.
31. `intermediate-bridge-8w` — for graduates of beginner-gym, transition to undulating.
32. `advanced-conditioning-8w` — VO2max blocks, threshold work, lactate clearance.
33. `women-foundations-12w` — glute/back/core bias, 4×/wk gym, intermediate.
34. `over-40-strength-12w` — joint-friendly, longer warmups, frequency 3×, intermediate.
35. `teen-athlete-12w` — 16-19 yr, GPP + strength, gym.
36. `student-recomp-12w` — budget gym, 3×/wk, hostel-friendly.
37. `office-worker-12w` — 3×45-min sessions, postural correctives front-loaded.
38. `travel-anywhere-8w` — hotel-room bodyweight + bands.

**Tier 4 — Specialty / Sport / Aesthetic (13)**
39. `strong-bench-12w` — bench-only peaking, 3×/wk press frequency, gym.
40. `strong-squat-12w` — squat peaking, Smolov-light variant.
41. `strong-deadlift-12w` — pull peaking, Coan-template inspired.
42. `arms-specialization-6w` — 6×/wk biceps/triceps focus, maintenance everywhere else.
43. `glutes-specialization-8w` — high-frequency glute hypertrophy, gym.
44. `shoulders-specialization-6w` — delt volume + overhead pressing.
45. `back-specialization-8w` — lat/upper-back size, gym.
46. `first-pull-up-8w` — negatives + band-assisted + scapular work.
47. `first-muscle-up-12w` — for those with 10+ pull-ups, ring/bar.
48. `runner-strength-8w` — concurrent runner support, 2× lift + run volume.
49. `combat-athlete-conditioning-8w` — anaerobic + grip + neck, MMA/BJJ.
50. `pre-vacation-shred-6w` — short, opinionated aesthetic cut.
51. `aesthetic-photoshoot-peak-16w` — 16-week proper contest-prep-lite arc.

### Cleanup before authoring
Move these out of `docs/programs/` to `docs/diets/`: `clean-cutting-diet-12w.md`, `clean-weight-gain-diet-12w.md`, `gut-health-fat-loss-diet-12w.md`, `hard-cut-athlete-diet-12w.md`, `high-calorie-mass-diet-12w.md`, `keto-shred-diet-12w.md`, `lean-bulk-diet-12w.md`, `muscle-gain-athlete-diet-12w.md`, `student-bulk-diet-12w.md`, `student-fat-loss-diet-12w.md`. These are diet specs, not training programs.

---

## 2. Coaching Design Framework

For every program in the catalog, the canonical author walks this 8-step sequence. No shortcuts.

1. **Goal definition** — one verb, one metric, one timeline. *"Add 8-12 lb lean mass in 12 weeks at <2% bodyfat gain."* Goes in `goal` (LocalizedString).
2. **Target audience & prerequisites** — training age, weekly hour budget, equipment access, contraindications. → `who_for`, `who_not_for`, `prerequisites`.
3. **Modality & equipment** — gym/home/bodyweight/outdoor. → `setting`, `equipment_needed[]`.
4. **Split selection** — match split to frequency and goal:
   - 3×/wk → full body
   - 4×/wk → upper/lower
   - 5×/wk → PPL+1 or U/L/U/L/full
   - 6×/wk → PPL ×2 (hypertrophy ceiling)
5. **Weekly volume target — Israetel landmarks per muscle (hard sets/wk):**
   - Chest: MV 8 / MEV 10 / MAV 12-20 / MRV 22
   - Back: MV 8 / MEV 10 / MAV 14-22 / MRV 25
   - Quads: MV 6 / MEV 8 / MAV 12-18 / MRV 20
   - Hamstrings: MV 4 / MEV 6 / MAV 10-16 / MRV 20
   - Delts (side): MV 0 / MEV 8 / MAV 16-22 / MRV 26
   - Biceps/Triceps: MV 5 / MEV 8 / MAV 14-20 / MRV 22
   - Glutes: MEV 4 / MAV 8-16 / MRV 18
   Mesocycle climbs MEV → MAV → MRV → deload → reset. Sum across days = `weeklyVolume_estimate.sets`.
6. **Progression scheme** — pick one and write it into `progression_strategy`:
   - **Linear** (beginner, comeback, peaking): +load/+reps weekly.
   - **Double progression** (hypertrophy default): fill the rep range, then add weight.
   - **DUP** (intermediate strength): heavy/medium/light within the week.
   - **Block** (advanced): accumulation → intensification → realization.
7. **Deload cadence** — write into `deload_strategy`. Default: every 4-5 weeks for hypertrophy/recomp; every 4 weeks for strength; mid-block + end-block for 8-week programs.
8. **Exit criteria** — what completes the program: a 1RM test, a body comp checkpoint, a skill achieved (first pull-up). Lives in `results_expected`.

Schema mapping check: every field above corresponds to a `Program` field in `src/lib/programs/schema.ts`. No new schema needed for the 51.

---

## 3. Periodization Templates

Five templates carry ~90% of the catalog. Each lives as a `progression-rules.md` next to the program folder, copy-edited per program. Comeback's `progression-rules.md` is the prototype.

### T1 — "12-week Linear Hypertrophy w/ deload at 4 & 8"
- Weeks 1-3 accumulation (MEV → MAV, RPE 7), Wk 4 deload, Wk 5-7 push to MRV (RPE 8), Wk 8 deload, Wk 9-11 intensification (lower reps, RPE 8-9), Wk 12 light test/photos.
- Volume curve: 12 → 16 → 20 → 10 → 18 → 22 → 25 → 12 → 18 → 16 → 14 → 10 sets/muscle.
- Use for: #1, #11, #12, #19, #27, #33, #42, #43, #45.

### T2 — "12-week Block Strength"
- Wk 1-4 hypertrophy block (5×5-8 @ RPE 7), Wk 5 deload, Wk 6-9 strength block (5×3-5 @ RPE 8), Wk 10 deload, Wk 11-12 realization (heavy singles, RPE 9 → test).
- Use for: #2, #13, #14, #28, #30, #39, #40, #41.

### T3 — "8-week Fat-Loss Concurrent"
- 4× lift (full body or U/L), 2× conditioning (1× zone 2 30-45min, 1× HIIT 12-20min), 1 long walk.
- Lifting volume held at MEV-MAV (preserve LBM); conditioning progresses LISS minutes + HIIT intervals.
- Deload at week 5. Use for: #3, #15, #16, #17, #29, #50.

### T4 — "12-week Home/Bodyweight Minimalist"
- Tempo-based double progression (rep-and-tempo ladder before adding load). 4× full body.
- Progression: 3-1-1-0 → 3-2-1-0 → 4-2-1-0 → add load or harder regression.
- Wk 4 & 8 deload (cut sets 40%). Use for: #5, #6, #11-#16, #22-#25, #38, #46, #47.

### T5 — "6-week Specialty Sprint"
- Single muscle group / single goal, 3× direct work + 3× maintenance everywhere else. No traditional deload — week 6 is the taper.
- Volume: weeks 1-2 MAV, weeks 3-4 push past MRV briefly, weeks 5-6 cut volume 30% (functional overreach → supercompensation).
- Use for: #10, #21, #26, #42, #44, #50.

Non-template programs (#9, #18, #20, #32, #48, #49, #51) get bespoke periodization — these are the ones the head coach hand-writes.

---

## 4. Authoring Workflow — how to ship 50 more without quality collapse

### Options considered
- **(A) Hand-author every week of every program.** ~40 hrs/program × 50 = 2,000 hrs. Highest quality, infeasible.
- **(B) Pure AI generation.** Fast, fails QA — invents exercises, mis-sets volume, no coaching voice. Reject.
- **(C) Template-driven + AI-assisted week generation + mandatory human review.** Recommended.

### Recommended workflow
1. **Expand the exercise library first (1 day).** Current `library.ts` has ~18 ids — heavily gym-biased. Add ~60 more before authoring any home/bodyweight program. Required additions (non-exhaustive):
   - Bodyweight: pike pushup, archer pushup, pseudo-planche, ring/bar dip, hollow body, L-sit, hanging leg raise, nordic curl, pistol squat, shrimp squat, glute bridge variations.
   - Home/DB: DB floor press, DB Bulgarian, DB RDL, DB thruster, single-arm row, kettlebell swing, goblet reverse lunge, band pull-apart, band pull-through.
   - Outdoor: hill sprint, sled push, farmer carry, sandbag clean, ruck march.
   - Gym gaps: hack squat, leg press, Pendlay row, hip thrust, JM press, cable lateral, face pull.
2. **Author the 5 template `progression-rules.md` files.** Same shape as comeback's. ~3 hrs each.
3. **Per program — the 8-hour pipeline:**
   - **Hour 1:** Author `header.ts` by hand. Goal, audience, citations. Non-negotiable hand-craft.
   - **Hour 2:** Pick template, write program-specific `progression-rules.md` (deltas from template, e.g. specialization lift, conditioning protocol).
   - **Hour 3:** Hand-author `week-01.ts` end-to-end. This becomes the AI prompt anchor.
   - **Hours 4-6:** AI generates `week-02.ts` … `week-12.ts` from the rules + week-01 example. One model call per week, structured-output validated against the schema.
   - **Hours 7-8:** Coach review. Read every week, fix volume drift, fix exercise id typos, fix tone. Run quality gates (§6). Commit.
4. **Estimate:** 8 hrs/program × 50 = 400 hrs = ~10 weeks at 40 hrs/wk. Wave 1 (10 flagships) costs 80 hrs and unlocks 80% of revenue.

The key insight: **week-01 + progression-rules.md is the contract.** Everything downstream is mechanical. The comeback program already proved this.

---

## 5. Evidence Base — the shared citation pool

Every program's `evidence_citations[]` draws from this pool. No fabricated URLs. If a topic isn't covered here, the citation is omitted, not invented.

1. **Schoenfeld 2017 — Dose-response of volume for hypertrophy.** https://pubmed.ncbi.nlm.nih.gov/27433992/
2. **Schoenfeld 2016 — Frequency meta-analysis (matched volume, frequency doesn't matter much).** https://pubmed.ncbi.nlm.nih.gov/27102172/
3. **Helms et al. 2016 — RPE for resistance training prescription.** https://pubmed.ncbi.nlm.nih.gov/27328853/
4. **Schoenfeld 2010 — Mechanisms of hypertrophy (tension, damage, metabolic stress).** https://pubmed.ncbi.nlm.nih.gov/20847704/
5. **Gundersen 2016 — Muscle memory & myonuclei retention.** https://pubmed.ncbi.nlm.nih.gov/27406602/
6. **Grgic et al. 2018 — Effects of rest interval on hypertrophy.** https://pubmed.ncbi.nlm.nih.gov/28933059/
7. **Israetel — Volume landmarks (MV/MEV/MAV/MRV framework).** https://renaissanceperiodization.com/training-volume-landmarks-muscle-growth/
8. **Nuckols — Stronger By Science research roundups.** https://www.strongerbyscience.com/
9. **Helms — MASS Research Review / Pyramid books.** https://3dmusclejourney.com/
10. **Seiler 2010 — Polarized endurance training distribution.** https://pubmed.ncbi.nlm.nih.gov/20861519/
11. **Murach 2020 — Muscle memory: epigenetic & myonuclear evidence.** https://pubmed.ncbi.nlm.nih.gov/31894740/
12. **Refalo et al. 2021 — Training to failure & hypertrophy.** https://pubmed.ncbi.nlm.nih.gov/34542868/

A 12-week program should cite 4-6 of these. A 6-week specialty program 3-4. Citations are not decoration — pick the ones whose conclusions actually drove a design decision in that specific program.

---

## 6. Quality Gates — pre-merge checklist

Every program PR must pass all of:

- [ ] **Schema validation:** all 12 weeks parse against `Program` type. No `any`, no missing fields.
- [ ] **Volume in range:** per-muscle hard sets within MEV-MRV for the target audience tier. Beginner programs cap at MAV.
- [ ] **Deloads present:** at least one deload week per 5 training weeks. Volume cut ≥40%, RPE cap ≤6.
- [ ] **Warmup matches movement:** day's warmup includes activation for the day's primary lift (no upper-body warmup on a squat day).
- [ ] **No orphan exercise ids:** every `exerciseId` exists in `library.ts`. CI script must enforce.
- [ ] **`exercises_used[]` accurate:** matches the union of ids actually referenced in the 12 weeks.
- [ ] **Locale placeholders correct:** every `LocalizedString` has `en` filled and `tr/ar/es/fr = __TRANSLATE__`. No partial fills.
- [ ] **Pricing = $0:** `pricing_usd: 0` (per `feedback_pricing.md`). User sets prices manually.
- [ ] **Brand colors clean:** any cover image / accent ref is cyan/blue/black — no champagne/gold (per `feedback_brand_colors.md`).
- [ ] **Evidence cited from approved pool only:** §5 URLs, no fabrications.
- [ ] **Coaching tone audit:** read 3 random days. Imperative voice, specific prescriptions, no "consider" / "you might want to."
- [ ] **No Shopify references:** zero equipment-store hooks (per `feedback_shopify_scope.md`).
- [ ] **`why_this_works` is real reasoning:** explains the mechanism, names the periodization model, justifies the deload cadence. Not marketing fluff.
- [ ] **Duration estimates honest:** session minutes within ±10% of (working sets × avg rest + warmup + cooldown).

Add `scripts/validate-program.ts` to run gates 1, 5, 6, 7, 8 mechanically. Coach signs off on the rest.

---

## 7. Phased Rollout — 5 waves

Order is by revenue leverage, not alphabet. Ship the SKUs that 80% of buyers want first.

### Wave 1 — Flagship 10 (weeks 1-2)
`hypertrophy-12w`, `strength-12w`, `fat-loss-12w`, `home-minimalist-12w`, `bodyweight-foundations-12w`, `beginner-gym-12w`, `recomp-16w`, `conditioning-base-8w`, `mobility-foundations-6w`, plus comeback (already done). **Why first:** covers every primary goal × every primary setting at intermediate difficulty. A buyer landing on TJFit can find their program. Also: these stress-test every template.

### Wave 2 — Setting siblings (weeks 3-4)
The 10 most popular Tier-2 SKUs: `home-hypertrophy-12w`, `bodyweight-hypertrophy-12w`, `home-strength-12w`, `bodyweight-strength-12w`, `home-fat-loss-12w`, `bodyweight-fat-loss-12w`, `outdoor-fat-loss-12w`, `home-beginner-12w`, `bodyweight-beginner-8w`, `travel-anywhere-8w`. **Why:** these are mechanical translations of Wave 1 to different equipment — cheapest to author per unit because the template is proven.

### Wave 3 — Difficulty variants + audience cuts (weeks 5-6)
`hypertrophy-advanced-12w`, `strength-advanced-12w`, `fat-loss-aggressive-8w`, `beginner-strength-12w`, `women-foundations-12w`, `over-40-strength-12w`, `student-recomp-12w`, `office-worker-12w`, `intermediate-bridge-8w`, `teen-athlete-12w`. **Why:** these expand TAM without inventing new periodization.

### Wave 4 — Lift peaking + specialization (weeks 7-8)
`strong-bench-12w`, `strong-squat-12w`, `strong-deadlift-12w`, `arms-specialization-6w`, `glutes-specialization-8w`, `shoulders-specialization-6w`, `back-specialization-8w`, `first-pull-up-8w`. **Why:** premium SKUs, focused customers willing to pay more.

### Wave 5 — Sport / aesthetic / remaining tail (weeks 9-10)
`runner-strength-8w`, `combat-athlete-conditioning-8w`, `pre-vacation-shred-6w`, `aesthetic-photoshoot-peak-16w`, `first-muscle-up-12w`, `outdoor-conditioning-8w`, `outdoor-bodyweight-hybrid-12w`, `gym-conditioning-8w`, `gym-conditioning-30min-6w`, `advanced-conditioning-8w`, `home-recomp-12w`, `home-mobility-6w`, `bodyweight-mobility-6w`. **Why last:** smaller audiences per SKU, bespoke periodization, head-coach-only authoring.

---

## 8. What this map does not authorize

- Inventing new schema fields. The v3.9 schema is the spine until the head coach signs off on a change.
- New top-level categories beyond the eight in `ProgramCategory`.
- Touching `src/lib/content.ts` (catalog cards) — that's a separate layer.
- Authoring diets, Shopify hooks, or pricing edits.
- Translation pipeline runs before EN is signed off.

---

**Confirmed save path:** `C:\Users\yousi\TJFit\.claude\worktrees\frosty-elion-d4bcaa\docs\PROGRAM_AUTHORING_MAP.md`
