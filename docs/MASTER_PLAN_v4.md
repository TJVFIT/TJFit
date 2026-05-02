# TJFIT — PRODUCT BUILD MASTER PLAN v4
## The Programs, Diets, and TJAI Roadmap

> **Mission:** Now that the website (v1, v2, v3) is being built, this plan covers the actual *product* — what users pay for. Programs, diets, and the TJAI experience. The site is the storefront. This is the merchandise.
>
> **Frame:** Three layers — content (programs + diets), intelligence (TJAI), and ritual (how the user lives inside the product day-to-day). All three have to be exceptional or the platform is just another fitness app with nice animations.
>
> **Mode:** This is mostly the founder's work + AI helpers, not a "Claude Code build this" prompt. It's a roadmap, content brief, generation playbook, and review system. Use it to plan the next 3 months of product work.
>
> **Final outcome:** A focused, defensible product line — fewer SKUs, higher quality, real differentiation in MENA + global English markets. The kind of programs people screenshot and recommend. The kind of TJAI that feels like a coach, not a chatbot.

---

## STRATEGIC FRAMING (READ FIRST)

### The flagship-not-marketplace decision

You are NOT Trainerize. You're not building a marketplace where 200 mediocre coaches list 5,000 mediocre programs. That race is lost — Trainerize, FitSW, Trainwell already won it.

You're building **a flagship brand**: a small library of TJFit-branded programs and diets that nobody else has, plus TJAI as the intelligent layer connecting them. Coaches eventually layer on top, but the foundation is YOUR product.

**Implication:** Quality > quantity. Better to launch with 8 incredible programs than 51 mediocre ones. Cut the catalog target. Be honest about what's actually shippable.

### The MENA edge

You have an unfair advantage that no Silicon Valley fitness app can copy quickly: you write Arabic natively, you understand Ramadan, halal eating, MENA gym culture, and the cultural cadence of the region. Every Western fitness app is bad at this. Lean in hard.

### The TJAI edge

Generic AI plan generators (a thousand exist now) all do the same boring thing: ask 5 questions, generate a plan, done. Yours has to feel like it's being written by a real coach who knows you. The differentiator isn't the AI model — it's the *intake depth*, the *cultural voice*, the *learning loop*, and the *honesty*.

### The pricing reality

From v1 prompt locked in:
- Programs: $5.99 one-time (Tier 1), ~50% Tier 2 (TR/MX/BR), ~30% Tier 3 (IQ/EG/IN)
- Diets: $4.99 one-time
- TJAI plan: $8 per generation
- Pro: $10/mo (unlimited TJAI chat fast)
- Apex: $19.99/mo (Pro + voice + memory + form-check + reasoning)

This means each program needs to feel like $20+ value at $5.99. Each diet needs to feel like $15+ value at $4.99. TJAI plan at $8 needs to feel non-negotiable.

---

## PART 1 — PROGRAMS

### 1.1 — The launch lineup (8 flagship programs)

Don't ship 51. Ship these 8. They cover 80% of buyer intent and you can make each one excellent.

#### Program 1 — "The Comeback" (12 weeks)
**Audience:** Returning to gym after 6+ month break (injury, life, kids, mental health).
**Why it sells:** Most underserved fitness audience. Most programs assume current fitness; yours assumes none. Emotional resonance.
**Structure:**
- Weeks 1-2: Habit before body. 2-3 short sessions/week, 25-35 min each. Goal: just show up.
- Weeks 3-6: Foundation. 3-4 sessions/week, full-body movements, no max effort.
- Weeks 7-10: Building. 4 sessions/week, push-pull-legs split, mild progressive overload.
- Weeks 11-12: Confidence. 4-5 sessions/week, you're back.

**Key features:**
- "Permission to skip" framing — week 1 has 1 mandatory session, rest optional
- Daily check-in mood prompt: 1-tap how you felt
- Trainer's voice in copy: warm, no shame

**Differentiator:** The program ASSUMES you'll miss days and accommodates without judgment.

#### Program 2 — "Ramadan Athlete" (29-30 day variable cycle, syncs with Hijri calendar)
**Audience:** Muslims training during fasting month. Massive MENA + global Muslim diaspora demand.
**Why it sells:** Nobody does this well. Generic apps either pause training entirely or ignore Ramadan. Yours is purpose-built.
**Structure:**
- Pre-fast week (Sha'ban final week): primer session, lower volume to ease in
- Daily cycle:
  - Pre-iftar window (last hour before sunset): low-intensity walk OR rest
  - Post-iftar window (1.5-2hrs after meal): main strength session, reduced volume (60-70% of normal)
  - Post-tarawih or pre-suhoor: optional mobility/stretch
- Weekly structure: 3 strength + 2 mobility, never 5 high-intensity
- Volume reduction protocol: 30-40% lower than normal program for first 10 days, gradually build back
- Suhoor + iftar nutrition guidelines integrated (pairs with Ramadan diet — see Diets section)
- Eid week: deload + celebration training

**Key features:**
- Auto-detects Hijri date, adjusts timing
- Locale-aware: Arabic version writes in proper voice
- "Niyyah" (intention) framing — ties training to spiritual practice respectfully

**Differentiator:** Cultural authenticity. Real, not retrofitted.

#### Program 3 — "Phone in Pocket" (8 weeks, 3 versions in one)
**Audience:** Travelers, hotel-gym users, home setups, beginners with no equipment.
**Why it sells:** Three programs in one purchase. Massive value perception.
**Structure:** Same 8-week progression engine, three input modes:
- **Full Gym version:** barbell, racks, full equipment
- **Half-equipped version:** dumbbells + adjustable bench + bands
- **Bodyweight-only version:** literally nothing needed

User toggles between versions per session ("today I'm at the hotel" → bodyweight day, progression continues). Same exercise *intent* (push, pull, hinge, squat, carry) — different *implementation*.

**Key features:**
- Travel-mode toggle in-app
- Equipment-availability filter per session
- Maintains streak even if user swaps versions

**Differentiator:** Real life is messy. Most programs ignore that. This one was built for it.

#### Program 4 — "Body Recomp Track" (16 weeks)
**Audience:** Beginners and early-intermediate who want both fat loss AND muscle gain.
**Why it sells:** Most programs are either cut or bulk and lecture users about "you can't do both." Beginners CAN. This program is the rare one that admits it.
**Structure:**
- Weeks 1-4: Foundation, slight calorie deficit, full-body 3x/week, learning movement patterns
- Weeks 5-10: Build phase, calorie maintenance, 4x/week upper-lower split, focus on volume
- Weeks 11-14: Cut phase, slight deficit again, maintain volume, drop frequency to 3x
- Weeks 15-16: Maintenance + photo week — show what you built

Pairs with "Body Recomp Diet" (calculated daily macro targets, weekly photo check-in).

**Key features:**
- Bi-weekly progress photo prompts (private)
- Body composition estimator built in
- Honest framing: "this works because you're a beginner, advanced users need different protocols"

**Differentiator:** Sells results most programs claim are impossible. They aren't, for this audience.

#### Program 5 — "The Real Schedule: Father Edition" (10 weeks)
**Audience:** Working dads with kids, 30-50 years old.
**Why it sells:** This audience has money, motivation, and zero time. They will pay top dollar for something that respects their reality.
**Structure:**
- 3 sessions/week, all under 35 minutes
- Each session has a "10-minute escape hatch" — if you only have 10 min, do these 3 movements
- Weekend: optional family-friendly activity day (hike, swim, walk with kids)
- Progressive overload over time despite short sessions
- Volume: lower than typical, intensity slightly higher

**Key features:**
- Calendar integration suggesting times
- "Caught in a meeting" mode — auto-shifts session to evening
- Voice cues so user can do session while half-watching kids

**Differentiator:** Built around real adult life, not fantasy training schedule.

#### Program 6 — "The Real Schedule: Student Edition" (12 weeks, syncs with semester)
**Audience:** University students 18-25, especially in Turkey/MENA.
**Why it sells:** Cheap audience but huge volume. Word-of-mouth among friends. Loyalty for years.
**Structure:**
- Mid-semester: 4 sessions/week, balanced
- Pre-exam weeks: drops to 2 maintenance sessions
- Exam week: full deload, just walks + stretches
- Post-exam recovery week: rebuild
- Cycles around academic calendar with built-in deload triggers

**Key features:**
- Calendar input (exam dates) → program auto-adjusts
- Budget-conscious diet pairing
- "Dorm room" version of every session for when gym is closed

**Differentiator:** First fitness program built around academic life.

#### Program 7 — "Strong Bench" (8 weeks, lift-specific)
**Audience:** Intermediate lifters wanting bigger bench. Niche but devoted.
**Why it sells:** People who want this REALLY want this. They'll pay for it and finish it.
**Structure:**
- 4 sessions/week — 2 bench-focused, 2 supporting (back, shoulders, triceps)
- Weeks 1-3: Volume accumulation (5x5 + accessory volume)
- Weeks 4-6: Intensity (3x3 + back-off sets)
- Weeks 7-8: Peaking + test (work up to a true 1RM)
- 25+ lb increase target for most users

**Key features:**
- Bench technique video library (10+ angles, common mistakes)
- 1RM calculator + tracking
- "Form check upload" prompt at week 4 (Apex feature)

**Differentiator:** Programs that produce a measurable, brag-worthy result.

#### Program 8 — "Strong Squat" (8 weeks, sister to Strong Bench)
Same structure, squat-focused. Same audience.

**Future programs (post-launch):** Strong Deadlift, Strong Pull-up, Female Glute Builder, Senior Strength (50+), Boxer Conditioning, Football Conditioning, Climber Power.

### 1.2 — Program build specification (every program follows this)

Every program ships with these components. This is the production checklist.

**Required content per program:**
1. Title (5 locales)
2. Tagline — one line, sells the program (5 locales)
3. Description — 2-3 paragraphs, hero copy (5 locales)
4. Trainer credentials block — who built this, why they're qualified
5. Hero image — original photography or clean composite, NEVER stock
6. 60-second intro video — trainer talking to camera, locale-specific or English with subtitles
7. Week-by-week structure (12+ weeks for most)
8. Day-by-day workouts within each week
9. Per-exercise:
   - Name (5 locales)
   - Demo video, 15-30 sec, multiple angles where possible
   - Form cues (3-5 bullets)
   - Common mistakes (2-3)
   - Reps/sets/rest target
   - Substitution options (if equipment unavailable, if injury)
10. Per-week:
    - Coach's note — 3-4 sentences setting the week's focus
    - Volume + intensity targets
11. FAQ — 8-12 common questions answered
12. Equipment checklist
13. Difficulty + experience requirements (clear "is this for me?" criteria)
14. Sample week 1 free preview (per v1 prompt)

**Quality bar:**
- Every form cue written by a real trainer (you), not AI
- Every demo video shot in good lighting, multiple angles
- Every program tested on at least 3 real people before launch
- No filler exercises — every movement has a reason in the program

### 1.3 — Database schema additions

See the migration shipped alongside this plan: `supabase/migrations/20260502160000_programs_v4_columns.sql`. It adds the v4-required columns to `programs` (`program_type`, `target_audience_i18n`, `experience_required`, `equipment_modes`, `prerequisites_i18n`, `results_target_i18n`, `trainer_id`, `testimonials_count`, `average_rating`, `total_completions`) and creates the `program_completions` table (start/complete tracking + ratings + consented testimonial text).

### 1.4 — Content production playbook

For each of the 8 launch programs, follow this 10-day cycle:

- **Day 1-2:** Outline week-by-week structure (you, trainer brain, no AI)
- **Day 3-4:** Write every workout — sets, reps, exercises, progression. Use AI for first draft, then heavily edit.
- **Day 5:** Record demo videos (batch shoot all programs in one day if possible)
- **Day 6:** Write all coach's notes per week (your voice, not AI)
- **Day 7:** Translation pass — get native speakers per locale
- **Day 8:** Test the first 2 weeks on yourself + 2 friends
- **Day 9:** Fix what didn't work, finalize copy
- **Day 10:** Upload, set is_published=false, internal review, then publish

**Estimated total time:** 80 days for all 8 programs, OR 20 days if you batch shoot videos and parallelize translations.

### 1.5 — Pricing strategy

| Program | Price (Tier 1) | Why |
|---|---|---|
| The Comeback | $4.99 | Lower price = lower barrier for hesitant audience |
| Ramadan Athlete | $5.99 | Standard price, premium positioning |
| Phone in Pocket | $7.99 | Three programs in one — premium value |
| Body Recomp Track | $5.99 | Standard |
| Real Schedule: Father | $5.99 | Standard |
| Real Schedule: Student | $3.99 | Student budget |
| Strong Bench | $5.99 | Standard |
| Strong Squat | $5.99 | Standard |

Bundle option: "Strong Lifts Pack" (Bench + Squat + future Deadlift) for $14.99 (save $3).

---

## PART 2 — DIETS

### 2.1 — The launch lineup (5 flagship diets)

#### Diet 1 — "Middle Eastern Cuisine Diet" (4 weeks, configurable calorie target)
**Audience:** MENA users, Middle Eastern diaspora, anyone who's bored of grilled chicken and rice.
**Why it sells:** Your unfair advantage. Nobody else has this calibrated.
**Structure:**
- 28 days of meals, all macros calculated
- Breakfast: foul, shakshuka, manakish, labneh + olives, etc.
- Lunch: kabsa, mansaf (lighter version), grilled fish + tabbouleh, lentil soup
- Dinner: grilled meats + salad, stuffed vegetables, fattoush bowls
- Snacks: dates + nuts, hummus + veg, halloumi
- Cultural authenticity > calorie reduction. People stick with food they want to eat.

**Calorie targets:** 1500 / 1800 / 2100 / 2400 / 2700 (user picks based on goal). **Macros calculated for:** fat loss / maintenance / muscle gain.

**Differentiator:** Real food, real spices, real cultural context.

#### Diet 2 — "Ramadan Diet" (29-30 days, syncs with Hijri)
**Audience:** Muslims fasting during Ramadan, who don't want to lose muscle or feel terrible.
**Why it sells:** Pairs with Ramadan Athlete program. Sells together.
**Structure:**
- Suhoor (pre-dawn): slow-digesting carbs + protein + healthy fats. Examples: oats with nuts and honey, eggs with whole grain bread, labneh with olive oil
- Iftar opener: dates + water + soup (traditional, also smart for blood sugar)
- Iftar main (30-45 min after opener): balanced plate, moderate portion
- Tarawih break (post-prayer): light snack if hungry — fruit, yogurt
- Pre-suhoor: hydration focus
- Hydration protocol: 2L water between iftar and suhoor, no exceptions

**Calorie targets:** Maintenance during Ramadan (most people OVEReat at iftar — this prevents that).
**Differentiator:** Built by someone who's actually fasted, not Westernized.

#### Diet 3 — "Halal Bulking Diet" (4 weeks, repeatable)
**Audience:** Muslim lifters trying to build muscle. Underserved everywhere.
**Why it sells:** Most "bulking diets" recommend protein supplements that may not be halal, or pork-based recipes. Yours doesn't.
**Structure:**
- 3500-4000 cal/day (configurable)
- All halal protein sources verified: chicken, beef, lamb, fish, eggs, dairy, halal-certified protein powders
- High-volume meals, no shame
- Breakfast options, lunch, post-workout, dinner, pre-bed
- Snack rotation
- Halal supplement guide included (which whey is halal, etc.)

**Differentiator:** Honest, devout, not preachy. Just useful.

#### Diet 4 — "The 'I Hate Cooking' Diet" (4 weeks)
**Audience:** Busy people, students, men who don't cook.
**Why it sells:** This is what 80% of users actually need but no one admits. Sells widely.
**Structure:**
- Every meal max 5 ingredients
- Every meal max 15 min prep
- Sunday batch-cook day: 2 hours, makes 5 days of food
- Microwave-only options for every meal
- No fancy techniques — pan, pot, oven, microwave only

**Calorie targets:** 1500 / 1800 / 2100 / 2400.
**Differentiator:** Honest framing. No "hello chef!" tone.

#### Diet 5 — "Body Recomp Diet" (16 weeks, pairs with Body Recomp program)
**Audience:** Same as Body Recomp Track program.
**Why it sells:** Bundle pairing.
**Structure:** Phased calorie cycling matching the training program — slight deficit, maintenance, slight deficit again.

### 2.2 — Diet build spec

Every diet ships with:
1. Title + tagline (5 locales)
2. Intro letter from trainer (5 locales)
3. 28+ days of meals, all calculated
4. Per meal:
   - Recipe with photo
   - Ingredients (metric + imperial, locale-aware grocery names)
   - Instructions step-by-step
   - Prep time + cook time
   - Macros (P/C/F/cal)
   - Substitution options
   - Optional video (priority for popular meals)
5. Weekly grocery list — locale-aware (Migros/Carrefour TR, regional staples)
6. Macros per day, week, total
7. FAQ
8. "Days off" framework — what to do when you can't follow the plan

### 2.3 — Pricing

| Diet | Price (Tier 1) |
|---|---|
| Middle Eastern Cuisine | $4.99 |
| Ramadan Diet | $4.99 |
| Halal Bulking | $5.99 (premium niche) |
| I Hate Cooking | $4.99 |
| Body Recomp Diet | $4.99 |

Bundle: "Ramadan Pack" (Ramadan Athlete program + Ramadan Diet) for $9.99.

---

## PART 3 — TJAI: THE INTELLIGENCE LAYER

### 3.1 — The TJAI architecture (two products, one brand)

**TJAI Quiz Bot** (one-time generation, $8): The intake → generated plan flow. Already partially built.

**TJAI Chatbot** (ongoing chat, included with Pro/Apex): Conversational coach that lives across the app, knows the user, helps in-context.

These are different products. Plan separately.

### 3.2 — TJAI Quiz Bot — the intake redesign

The intake is what makes TJAI feel like a coach instead of a form. Per the v1 prompt + your direction:

**Phase 1: Boring questions (3 of them, fast):**
1. Goal — fat loss / muscle gain / both / general health
2. Where you train — home / gym / both
3. Days per week available — 2 / 3 / 4 / 5

**Phase 2: Surprising questions (5 of them, the differentiator):**
4. "What's a workout you've stuck with before, even briefly? What did you like about it?" (text input)
5. "What usually causes you to fall off?" (multi-select: schedule, motivation, boredom, soreness, injury, social pressure, other)
6. "What does your kitchen actually look like? Stove + oven + fridge? Just microwave? Mom cooks for you?" (radio)
7. "What's a food you cannot give up?" (text input — this gets WORKED INTO the diet plan)
8. "Picture your body at 80% of your goal — what does that look like? What's working, what's not?" (text input)

**Phase 3: Constraints:**
9. Any injuries we should work around? (multi-select with "other")
10. Cultural/religious dietary requirements? (halal / vegetarian / vegan / kosher / none / other)
11. Locale-specific question (e.g., for AR users: "Do you fast Ramadan?")

**Phase 4: Confidence sliders (after all questions):**
- "How committed are you right now?" 1-10 slider (used internally to calibrate volume)
- "How much time do you have per session?" 20 / 30 / 45 / 60 / 75 / 90 min

**Generation:** Once submitted, TJAI builds the plan. While generating:
- Streaming output (visible)
- "Considering..." reasoning visible (per v3 living-place principle)
- Generation takes ~30-60 sec for premium feel (don't make it instant — too cheap-feeling)

### 3.3 — Generated plan structure

A TJAI-generated plan ships with:
1. **Cover page (PDF):** User name, goal, plan duration, generation date
2. **"Why this plan" letter (1 page):** TJAI explains in user's voice why these choices were made — addresses their stated failure points, references their stuck-with-it example, etc. THIS IS THE MAGIC.
3. **Confidence section:** "I'm 80% sure on the volume here. Adjust after week 2 based on how you feel." Honest about uncertainty.
4. **Week-by-week training plan** — same structure as flagship programs
5. **Daily nutrition plan** — using the user's stated favorite foods, kitchen reality, and dietary requirements
6. **The "watch for" list:** 3-5 specific things TJAI flags based on the user's profile ("you mentioned soreness causes drop-off — here's how we mitigate that")
7. **Weekly check-in protocol:** what to report back, how
8. **PDF download:** Premium-styled (black bg, cyan/purple accents, Geist Mono numbers)

### 3.4 — TJAI Chatbot upgrades (the "lives in the app" feature)

Per locked-in ideas. Implementation phases:

**Phase A — Foundation (ship first):**
- Memory across chats (Apex tier): user_id-keyed conversation history, surfaces relevant past chats automatically
- Context awareness: knows current page (`/programs/strong-bench` → "I see you're looking at Strong Bench, want me to walk you through it?")
- Quick-action buttons after replies: "swap this exercise" / "make easier" / "add to plan"
- Streaming with thought visible
- "I don't know" honesty: when low confidence, says so + offers human coach review (Apex)

**Phase B — Voice match:**
- Detects user's typing style (casual vs formal) over first 3 messages
- Locks tone for that user
- "Talk to me like a friend / coach / strict trainer" override in settings

**Phase C — Inline progress:**
- "Want me to log this set for you?" (pulls from chat → workout log)
- "Should I update your plan to skip leg day this week?" (writes to plan)
- "Add this meal to your diet plan?" (writes to diet)
- Chat does work, not just talks

**Phase D — Image input:**
- User photographs meal → TJAI estimates macros + calories
- User photographs workout setup → TJAI suggests session
- Form check (Apex): user uploads short video, TJAI flags top issue

**Phase E — Voice (Apex):**
- Voice input — already in /ai voice orb (v3 prompt)
- Voice output — TJAI replies in audio when user is mid-workout, hands busy

**Phase F — Pinned threads:**
- "My injuries" thread, always-available context
- "My schedule" thread
- "My goals" thread
- TJAI references these automatically when relevant

**Phase G — Session summary:**
- End of every chat session: "Here's what we decided today" — sticky takeaway saved to user account

### 3.5 — TJAI personality + voice

**Brand personality:**
- Direct, not chatty
- Honest about uncertainty
- Warm but not cute
- Cultural awareness without performing it
- Uses fitness vocabulary correctly (a real trainer, not a wellness coach)
- Never says "amazing!" or "you got this!" — that's American app energy
- Never asks empty validation questions

**Voice samples (English):**
- ❌ "Great choice! Let's crush this workout! 💪"
- ✅ "Solid pick. Let's get to it."
- ❌ "How are you feeling today? You're doing amazing!"
- ✅ "Quick check — is the soreness from Tuesday gone? If not, we drop a set today."
- ❌ "Don't worry, every fitness journey has its ups and downs!"
- ✅ "You missed three sessions. That's fine. Here's the plan to recover the week."

**Voice per locale (these are direction notes, not literal translations):**
- **TR:** Direct, slightly punchy. Not cute.
- **AR:** Formal balanced respect. Like a real coach, not a friend.
- **ES:** Warmer than English, more communal ("vamos" energy without being cheesy).
- **FR:** Precise, structured.
- **EN:** Lean, confident, no fluff.

### 3.6 — TJAI prompts (system-level)

The actual prompts driving TJAI behavior live in `docs/runbooks/tjai-prompts.md` so they can be versioned and refined over time without touching code.

### 3.7 — TJAI cost management

OpenAI / Anthropic API costs scale with usage. Budget:
- Quiz bot generation: ~$0.30-0.80 per plan (4-6K tokens output). Sells for $8 → ~95% margin.
- Chatbot Pro user: ~$0.05-0.15 per message (avg). 1000 msgs/month/user = $50-150 worst case. At $10/mo, this can lose money on heavy users.

**Mitigations:**
- Pro tier: rate-limited to 50 messages/day soft cap, 200/day hard cap with friendly message
- Apex tier: unlimited but with 2-tier model — fast model (cheap) for quick responses, slow model (expensive, GPT-4 / Claude Opus tier) only on demand or for complex queries
- Chatbot uses small context window per message (only last 6 messages + pinned threads), not full history, to keep token cost down
- Cache common responses (FAQ-style)

---

## PART 4 — RITUAL (the day-to-day product experience)

The programs and TJAI are nothing without the daily ritual that ties them together.

### 4.1 — The morning open

When user opens app for the day:
- "Good morning, [name]. Today's session: Push Day, ~45 min."
- One-tap to start
- If user has TJAI, optional "any updates before we start?" (text or voice)

### 4.2 — Pre-workout brief (30 sec read)

Per TJAI suggestions list. Before starting workout:
- Today's focus: one sentence (e.g., "Bench-focused — quality over quantity")
- One cue to remember (e.g., "Tuck elbows on bench, keep upper back tight")
- Estimated time: "~45 min including rest"

### 4.3 — During workout

- Per v1 + v3 prompts (workout player ritualized, haptics, audio, etc.)
- Mid-workout: TJAI silent unless user invokes (voice "TJAI, is this set form okay?" → quick response)

### 4.4 — Post-workout (90 seconds)

- Stats summary
- 1-tap feedback: too easy / right / too hard
- Optional voice memo: "how'd that feel?"
- TJAI reads input → adjusts next session if needed
- Earned-number bloom if milestone hit (per v3)

### 4.5 — Evening / before bed

- Optional check-in prompt at user's bedtime (configurable): "How was today? 1-tap mood + stress level"
- Used internally for next-day adjustments

### 4.6 — Sunday weekly review

Per v1 prompt:
- AI-generated summary: "This week — 4 of 4 sessions complete, average performance up 8%, missed 2 meals on Friday"
- "Watch for" alerts: "Squat performance flat 2 weeks in a row — recommend deload next week"
- Optional photo + weight log
- "Plan adjustments for next week?" auto-prompt with TJAI suggestions

### 4.7 — Mid-week pulse (Wednesday)

- Auto-message: "Halfway through the week — how's it going?"
- 3-tap response: on track / falling off / something's wrong
- Triggers TJAI-driven adjustments based on response

---

## PART 5 — PRODUCTION ROADMAP (next 90 days)

### Days 1-30: Programs sprint

- Day 1: Lock the 8 launch programs (this doc is your spec)
- Days 2-5: Outline structures for all 8
- Days 6-10: Write workout-by-workout for first 4 (Comeback, Ramadan Athlete, Phone-in-Pocket, Body Recomp)
- Days 11-15: Write workout-by-workout for next 4 (Real Schedule Father, Real Schedule Student, Strong Bench, Strong Squat)
- Days 16-18: Batch-shoot demo videos for all programs (one big day or two)
- Days 19-22: Translate all programs (hire native speakers, $100-300 total via Fiverr or local TR/AR translators)
- Days 23-26: Internal test: you + 2 friends try first 2 weeks of each
- Days 27-30: Fix what broke, polish, upload, prepare for launch

### Days 31-50: Diets sprint

Same cycle for the 5 launch diets. Less video work, more recipe testing + photography.

### Days 51-65: TJAI sprint

- Refine quiz bot intake (the 5 surprising questions are KEY)
- Build the "why this plan" letter generation
- Build PDF export with premium styling
- Build feedback loop logic (too easy / right / too hard → next-week adjustment)
- Implement Phase A of chatbot upgrades (memory + context + quick actions + streaming + honesty)

### Days 66-80: Ritual sprint

- Pre-workout brief
- Post-workout feedback flow
- Weekly Sunday review
- Mid-week pulse

### Days 81-90: Launch prep

- Final QA pass on every program + diet
- Loading first 100 testimonial users (per v1 priors — free Apex 3 months in exchange for testimonial)
- Marketing assets (program preview videos, social proof setup)
- Soft launch to first cohort
- Iterate on feedback

### After day 90:

- Add more programs as data shows demand (Strong Deadlift, Strong Pull-up next likely)
- Coach onboarding (let real coaches sell programs through the platform)
- Expansion into more diets (Mexican Cuisine, South Asian Cuisine for those markets)

---

## PART 6 — REVIEW CHECKLISTS

### Program ship checklist
- [ ] Title + tagline written in 5 locales
- [ ] Description (2-3 paragraphs) in 5 locales
- [ ] Hero image (original, no stock)
- [ ] 60-sec intro video
- [ ] Week-by-week structure complete
- [ ] Day-by-day workouts complete
- [ ] Every exercise has demo video, form cues, common mistakes, substitutions
- [ ] Every week has coach's note
- [ ] FAQ (8-12 questions)
- [ ] Equipment checklist
- [ ] Difficulty + experience requirements clearly stated
- [ ] Sample week 1 free preview enabled
- [ ] Tested on 3+ real users for first 2 weeks
- [ ] Pricing set per tier
- [ ] is_published toggled true
- [ ] Listed on `/programs` catalog

### Diet ship checklist
- [ ] Title + tagline (5 locales)
- [ ] Intro letter from trainer (5 locales)
- [ ] 28+ days of meals
- [ ] Every meal has recipe + photo + macros + substitutions
- [ ] Weekly grocery list (locale-aware)
- [ ] Macros calculated for fat loss / maintenance / muscle gain
- [ ] FAQ
- [ ] "Days off" framework
- [ ] Tested by 3+ real users for at least 1 week
- [ ] Pricing set per tier
- [ ] is_published toggled true

### TJAI ship checklist
- [ ] Quiz bot 5 surprising questions tested with 10+ users
- [ ] "Why this plan" letter generation feels personal, not generic
- [ ] Confidence section honest about uncertainty
- [ ] PDF export styled premium
- [ ] Feedback loop (too easy/right/too hard) wired in
- [ ] Chatbot voice matches user style after 3 messages
- [ ] Memory works across sessions for Apex users
- [ ] Quick-action buttons functional ("swap exercise", "log set")
- [ ] Streaming with thought visible
- [ ] "I don't know" trigger working when confidence low
- [ ] Cost per generation under $1 (sells for $8)
- [ ] Cost per Pro user under $5/month average

---

## CROSS-CUTTING PRINCIPLES (NON-NEGOTIABLE)

- **Quality > quantity.** 8 great programs beats 51 mediocre ones.
- **Cultural authenticity > Westernized polish.** Lean into MENA edge.
- **Honest > hyped.** TJAI says "I don't know" instead of bullshitting.
- **Real food, real lives.** No "1500 calories of grilled chicken" filler diets.
- **Tested before shipped.** Every program/diet tested on 3+ real humans.
- **Trainer's voice > AI voice.** AI generates first draft; YOU edit every coach's note.
- **Pricing reflects value.** Don't undercharge for premium content.
- **Margin matters.** TJAI generation cost <12% of price. Pro tier rate-limited.
- **Locale isn't translation.** Each locale gets cultural treatment, not Google Translate.

---

## STARTING ACTION

Pick the first program. Most likely candidate: **Ramadan Athlete** (Ramadan is coming, market timing matters) OR **The Comeback** (broadest audience, easiest to test).

Outline week-by-week structure tomorrow.

This is the part where TJFit stops being a website and starts being a product people pay for, return to, and tell friends about.
