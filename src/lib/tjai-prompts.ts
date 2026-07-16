import { buildShoppingContext } from "@/lib/tjai/market-data";
import { composeCoachingPolicies } from "@/lib/tjai/prompts/policies";
import type { TJAIMetrics, TjaiMemorySnapshot, TjaiUserProfile } from "@/lib/tjai-types";

export function buildTJAISystemPrompt(): string {
  return `You are TJAI — the world's most advanced AI fitness and nutrition coach, built into TJFit.

You think like a team of experts: a certified strength & conditioning specialist, a registered sports dietitian, a metabolic scientist, and a behavioral psychologist — all combined into one precise intelligence.

Your job: analyze every data point the user provided and create a complete, hyper-personalized 12-week transformation plan that is:
- Scientifically calibrated (every calorie, macro, rep, and set has a reason)
- Biomechanically safe (injuries and limitations are fully respected)
- Psychologically realistic (addresses stated obstacles and motivation style)
- Immediately actionable (no guesswork — every day is planned)
- Formatted clearly for display in TJFit's app

You make decisions the way a world-class coach does:
- You notice when data points conflict (e.g. high stress + aggressive pace = modify the plan)
- You flag risk factors and adjust proactively
- You connect the dots between sleep, stress, metabolism, training capacity, and nutrition
- You never give generic advice — every sentence is specific to this person's data

Tone: Direct, expert, motivating, like a coach who knows this person deeply. Never vague. Never use filler phrases.

${composeCoachingPolicies()}

Output: A single valid JSON object. No markdown, no prose outside JSON. The JSON must conform exactly to the schema at the end of the user prompt.`;
}

function fmtArray(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function humanizeProfile(profile: TjaiUserProfile) {
  return {
    goal: titleCase(profile.goal),
    goalDetail: titleCase(profile.goalDetail),
    pace: titleCase(profile.pace),
    bodyType: titleCase(profile.bodyType),
    sex: titleCase(profile.sex),
    activityLevel: titleCase(profile.activityLevel),
    stressLevel: titleCase(profile.stressLevel),
    experienceLevel: titleCase(profile.experienceLevel),
    trainingLocation: titleCase(profile.trainingLocation),
    trainingPreference: titleCase(profile.trainingPreference),
    dietStyle: titleCase(profile.dietStyle),
    budget: titleCase(profile.monthlyFoodBudget),
    cookingStyle: titleCase(profile.cookingStyle),
    successVision: titleCase(profile.successVision)
  };
}

export function buildTJAIUserPrompt(
  profile: TjaiUserProfile,
  metrics: TJAIMetrics,
  memory?: TjaiMemorySnapshot | null
): string {
  const pretty = humanizeProfile(profile);
  const injuries = fmtArray(profile.injuries.map(titleCase));
  const restrictions = fmtArray(profile.dietaryRestrictions.map(titleCase));
  const biggestProblem = fmtArray(profile.biggestObstacles.map(titleCase));
  const likedFoods = fmtArray(profile.likedFoods.map(titleCase));
  const avoidedFoods = fmtArray(profile.avoidedFoods.map(titleCase));
  const equipment = fmtArray(profile.equipment.map(titleCase));
  const supplements = fmtArray(profile.supplements.map(titleCase));
  const beginnerMode =
    profile.experienceLevel === "beginner" ||
    profile.biggestObstacles.includes("training_knowledge");

  const calorieCyclingBlock = profile.goal === "muscle_gain"
    ? `CALORIE CYCLING:
- Training days: calorieTarget + 200
- Rest days: calorieTarget - 100
- Weekly average must still equal calorieTarget * 7.`
    : profile.goal === "fitness" || profile.goal === "stay_active"
      ? "CALORIE CYCLING: Skip cycling. Use same calories every day."
      : `CALORIE CYCLING:
- Training days: calorieTarget + 150, carbs +40-50g, fat -5g
- Rest days: calorieTarget - 150, carbs -40-50g, fat +5g
- Weekly average must still equal calorieTarget * 7.
- Label meal blocks as Training Day Meal Plan / Rest Day Meal Plan.`;

  const refeedBlock = profile.goal === "fat_loss"
    ? `REFEED WEEKS:
- Week 4 and Week 8: raise to TDEE for 5 days.
- Increase carbs, keep protein same, fat same/slightly lower.
- Label each refeed week clearly and explain this is strategic, not a cheat week.`
    : "REFEED WEEKS: Not needed for this goal.";

  const injurySeverityRules: Record<string, string> = {
    mild_discomfort:
      "Severity: mild discomfort. Keep the movement pattern but choose joint-friendly variations, cap RPE at 8 on lifts loading the affected area, and give a pain-monitoring note.",
    working_around:
      "Severity: working around it. EXCLUDE direct high-load movements for the affected areas, program substitutions as the primary exercise, cap RPE at 7 on anything adjacent, and rebuild gradually.",
    recovering:
      "Severity: recovering. Treat affected areas as rehab-adjacent: start their patterns at RPE 6 with slow tempo (e.g. 3-1-1), tiny load jumps, and explicit stop rules if pain exceeds 3/10."
  };
  const injuryAreaContraindications: Record<string, string> = {
    knee: "knee: avoid deep loaded knee flexion, jumping and high-impact lockouts early; prefer box squats, leg press to comfortable depth, hip hinges",
    shoulder: "shoulder: avoid barbell overhead pressing, dips and wide-grip bench early; prefer landmine press, neutral-grip DB press, cable work",
    lower_back: "lower back: avoid loaded spinal flexion and heavy hinging early; prefer supported rows, hip thrusts, split squats, McGill-style core work",
    wrist: "wrist: avoid loaded wrist extension (front rack, flat-palm pushups); prefer neutral-grip dumbbells, straps or pushup handles",
    ankle: "ankle: avoid jumping, running and unstable single-leg landings early; prefer bikes, sleds, supported calf and stability work",
    hip: "hip: avoid deep loaded hip flexion and aggressive stretching under load; prefer partial-range squats, glute bridges, controlled abduction",
    neck: "neck: avoid loaded bridging, heavy shrug volume and anything compressing the cervical spine; keep head neutral on all lifts",
    other: "other/unspecified area: default to conservative machine or bodyweight variations and add a note to train around pain, never through it"
  };
  const injuryDetail =
    profile.injuryAreas && profile.injuryAreas.length > 0
      ? `\nAffected areas (from follow-up): ${profile.injuryAreas.map(titleCase).join(", ")}.
${profile.injuryAreas.map((area) => `- ${injuryAreaContraindications[area] ?? injuryAreaContraindications.other}`).join("\n")}
${profile.injurySeverity ? injurySeverityRules[profile.injurySeverity] ?? "" : ""}
Every substituted exercise's "substitutions" list must ALSO be safe for these areas.`
      : "";
  const injuryBlock = profile.injuries.length > 0
    ? `INJURY MODIFICATIONS (required): User reported "${injuries}".
Rules:
1) Remove exercises that stress injured area.
2) Replace with safe alternatives for same muscle group.
3) Add section: "Exercises Modified for Your Injury".${injuryDetail}`
    : "";

  const sessionCapMinutes = profile.sessionLengthMinutes ?? profile.sessionMinutes;
  const dislikedBlock =
    profile.dislikedExercises && profile.dislikedExercises.length > 0
      ? `BANNED EXERCISES (hard rule): ${profile.dislikedExercises.map(titleCase).join(", ")}.
Never program these or close variants anywhere in the plan. Substitute equally effective alternatives for the same movement pattern and muscles, using their available equipment. Do not mention the banned exercise in notes.`
      : "";
  const splitBlock =
    profile.preferredSplit && profile.preferredSplit !== "no_preference"
      ? `REQUESTED SPLIT: ${titleCase(profile.preferredSplit)}.
Honor it if it fits ${profile.trainingDays} training days/week and the ${profile.goal} goal. If incompatible (e.g. push/pull/legs on 2 days), use the closest effective split and explain the trade-off in one sentence inside program.philosophy.`
      : "";

  const budgetBlock =
    profile.monthlyFoodBudget === "budget"
      ? `BUDGET MODE ACTIVE:
- Use affordable staples only (oats, eggs, rice, canned tuna, chicken, legumes).
- No expensive ingredients.
- Include "buy in bulk" notes.
- Weekly grocery cost under $50.`
      : "";

  const poorSleep = profile.sleepHours < 6;
  const recoveryBlock =
    poorSleep || profile.stressLevel === "high" || profile.stressLevel === "very_high"
      ? `RECOVERY PROTOCOL REQUIRED:
- Add dedicated section: "Your Recovery Protocol".
- Include sleep optimization, cortisol management, and weekly recovery metrics.`
      : "";

  const religiousBlock =
    profile.dietaryRestrictions.some((item) => item !== "none")
      ? `DIETARY RESTRICTIONS: ${restrictions}
- Every meal must respect these restrictions strictly.
- Label meal plans accordingly.`
      : "";

  const reverseDietBlock = metrics.reverseDietNeeded
    ? `REVERSE DIET REQUIRED:
- Add Metabolic Reset Phase (Weeks -2 to -1) before main 12-week plan.
- Calories at TDEE, light training 3x/week, no intense cardio.
- Then begin main 12-week plan.
- Label clearly as "Metabolic Reset Phase".`
    : "";

  const cheatMealBlock =
    profile.goal === "fat_loss" || profile.goal === "recomposition"
      ? `CHEAT MEAL STRATEGY REQUIRED:
- Include strategic cheat meal section with exact day/time.
- Include pre-cheat, during-cheat, post-cheat protocol.
- Aggressive pace: once per 2 weeks; moderate pace: weekly.`
      : "";

  const educationBlock = beginnerMode
    ? `EDUCATION MODE ACTIVE:
- Add "Beginner Foundations" section (10 concise rules).
- Each exercise includes educationNote.
- Each meal includes educationNote.`
    : "";

  const highStress = profile.stressLevel === "high" || profile.stressLevel === "very_high";
  const fastPace = profile.pace === "aggressive";
  const isBeginnerLevel = profile.experienceLevel === "beginner";

  const coachWarnings: string[] = [];
  if (highStress && fastPace) coachWarnings.push("High stress + aggressive pace = elevated cortisol risk. Moderate calorie deficit automatically. Prioritize recovery days.");
  if (poorSleep) coachWarnings.push("Sleep deprivation detected. Add sleep optimization protocol. Reduce volume on day 1 of each week.");
  if (highStress && poorSleep) coachWarnings.push("Compounding recovery risk. Include mandatory deload in weeks 4, 8. Cortisol management is priority.");
  if (isBeginnerLevel) coachWarnings.push("Beginner detected. Use 2-week adaptation phase. Teach RPE scale. Simpler exercises. More education notes.");
  if (profile.dietHistory === "regained" || profile.dietHistory === "yo_yo")
    coachWarnings.push("Rebound dieting history. The deficit has been capped at moderate — explain WHY in the plan. Teach maintenance skills during the plan, schedule diet-break guidance, and include a dedicated 'After Week 12: keeping the results' section.");
  if (profile.sleepQuality === "poor")
    coachWarnings.push("Poor sleep QUALITY (independent of hours). Include a wind-down protocol (screens, caffeine cutoff time, room temperature) and treat recovery capacity as reduced.");
  if (profile.drinkHabits.includes("sugary_drinks") || profile.drinkHabits.includes("alcohol") || profile.drinkHabits.includes("energy_drinks"))
    coachWarnings.push(`Liquid calories detected (${profile.drinkHabits.join(", ")}). Add a "Liquid Calories" subsection: quantify the typical weekly damage, give direct swaps, and if alcohol is present set explicit weekly limits with training-day rules.`);
  if (profile.eatingOutFrequency === "several_weekly" || profile.eatingOutFrequency === "daily")
    coachWarnings.push("Eats out often. Add an 'Eating Out Survival Guide': how to order for their macros at common restaurant types, and design the meal plan so restaurant meals slot in rather than break the plan.");
  if (profile.weekendConsistency === "derails")
    coachWarnings.push("Weekends derail this person. Add a 'Weekend Protocol': slightly lower weekday calories to bank a weekend buffer, plan ONE flexible meal per weekend day, and give a Monday reset routine. Never leave weekends unplanned.");
  if (highStress || poorSleep || profile.sleepQuality === "poor")
    coachWarnings.push("Recovery capacity is reduced (sleep/stress). Moderate training volume: keep weekly hard sets per muscle at the lower effective end (10-12), keep average rpe at or below 8 in weeks 1-2, and prefer an extra rest day over junk volume.");

  const memoryBlock = memory
    ? `== TJAI MEMORY ==
Latest plan summary: ${memory.latestPlanSummary ?? "none"}
Prior plan goal: ${memory.priorPlanGoal ?? "none"}
Plan version: ${memory.planVersion ?? "none"}
Stored preferences: ${
        memory.preferences.length > 0
          ? memory.preferences.map((item) => `${item.key}: ${item.value}`).join("; ")
          : "none"
      }
Recent workouts:
${memory.workoutSummary.length > 0 ? memory.workoutSummary.join("\n") : "No workouts logged yet."}
Progress snapshot:
- Latest weight: ${memory.progressSummary.latestWeightKg ?? "not logged"}kg
- Weight change: ${memory.progressSummary.changeKg ?? "not logged"}kg
- Latest body fat: ${memory.progressSummary.latestBodyFatPercent ?? "not logged"}%
- Latest waist: ${memory.progressSummary.latestWaistCm ?? "not logged"}cm
Adaptive checkpoint: ${
        memory.adaptiveCheckpoint
          ? `${memory.adaptiveCheckpoint.urgency} urgency; trigger regen ${memory.adaptiveCheckpoint.triggerRegen}; ${memory.adaptiveCheckpoint.regenReason ?? "no regen reason"}`
          : "none"
      }`
    : "== TJAI MEMORY ==\nNo prior TJAI memory available.";

  return `
Generate a complete 12-week transformation plan for this person. Apply your full coaching intelligence to this data — connect every data point, notice conflicts, and make decisions that optimize their results.

══ COACH INTELLIGENCE ANALYSIS ══
${coachWarnings.length > 0 ? coachWarnings.join("\n") : "No critical flags detected. Proceed with standard protocol."}

Metabolic type: ${metrics.metabolicType} — adjust macro ratios accordingly.
Confidence score: ${metrics.confidenceScore}/100

══ CALCULATED METRICS ══
BMR: ${metrics.bmr} kcal | TDEE: ${metrics.tdee} kcal
Daily calorie target: ${metrics.calorieTarget} kcal
Protein: ${metrics.protein}g | Fat: ${metrics.fat}g | Carbs: ${metrics.carbs}g
Water: ${metrics.water}ml/day
Training day calories: ${metrics.trainingDayCalories} | Rest day calories: ${metrics.restDayCalories}
Estimated body fat: ${metrics.estimatedBodyFat}%
Lean mass: ${metrics.leanMass}kg
Expected progress: ${metrics.weeklyWeightChange}kg/week
Projected final weight: ${metrics.projectedFinalWeight}kg | Final body fat: ${metrics.projectedFinalBF}%
Estimated time to goal: ${metrics.timeToGoal}
Plateau week prediction: ${metrics.plateauWeek}
Refeed weeks: ${metrics.refeedWeeks.join(", ") || "none"}
Deload weeks: ${metrics.deloadWeeks.join(", ") || "none"}
Reverse diet needed: ${metrics.reverseDietNeeded}

══ PERSON PROFILE ══
Age: ${profile.age} | Gender: ${pretty.sex}
Height: ${profile.heightCm} cm | Weight: ${profile.weightKg} kg
Goal: ${pretty.goal} | Goal detail: ${pretty.goalDetail} | Pace: ${pretty.pace}
Target weight: ${profile.targetWeightKg ?? "not specified"}kg
Body type: ${pretty.bodyType} | Estimated body fat: ${profile.estimatedBodyFat}%
Activity level: ${pretty.activityLevel}
Job type: ${titleCase(profile.jobType)} | Daily steps: ${profile.dailySteps.replace(/_/g, " ")}
Sleep: ${profile.sleepHours} hours (${titleCase(profile.sleepQuality)} quality) | Stress: ${pretty.stressLevel}
Diet history: ${titleCase(profile.dietHistory)}
Drinks besides water: ${fmtArray(profile.drinkHabits.map(titleCase))}
Eats out: ${titleCase(profile.eatingOutFrequency)} | Weekend pattern: ${titleCase(profile.weekendConsistency)}
Training level: ${pretty.experienceLevel}
Training location: ${pretty.trainingLocation}
Training days/week: ${profile.trainingDays}
Session duration: ${profile.sessionMinutes} min${
    profile.sessionLengthMinutes && profile.sessionLengthMinutes !== profile.sessionMinutes
      ? ` (preferred length: ${profile.sessionLengthMinutes} min)`
      : ""
  }
Equipment: ${equipment}
Training preference: ${pretty.trainingPreference}${
    profile.preferredSplit ? `\nPreferred split: ${titleCase(profile.preferredSplit)}` : ""
  }${
    profile.dislikedExercises && profile.dislikedExercises.length > 0
      ? `\nExercises to avoid: ${profile.dislikedExercises.map(titleCase).join(", ")}`
      : ""
  }
Meals per day: ${profile.mealsPerDay}
Diet style: ${pretty.dietStyle}
Foods they enjoy: ${likedFoods}
Foods they avoid: ${avoidedFoods}
Dietary restrictions: ${restrictions}
Food budget: ${pretty.budget}
Cooking style: ${pretty.cookingStyle}
Schedule constraint: ${titleCase(profile.scheduleConstraint)}
Schedule notes: ${profile.scheduleNotes ?? "None"}
Biggest obstacles: ${biggestProblem}
Success vision: ${pretty.successVision}
Injuries/limitations: ${injuries}${
    profile.injuryAreas && profile.injuryAreas.length > 0
      ? `\nAffected areas: ${profile.injuryAreas.map(titleCase).join(", ")}${
          profile.injurySeverity ? ` (severity: ${titleCase(profile.injurySeverity)})` : ""
        }`
      : ""
  }
Medical notes: ${profile.injuryNotes ?? "None"}
Supplements already using: ${supplements}
Restriction notes: ${profile.restrictionNotes ?? "None"}

== DAILY ROUTINE (analyze for NEAT and meal timing) ==
${profile.dailyRoutine || "No free-text routine provided."}

== METABOLIC TYPE CLASSIFICATION ==
Metabolic Classification: ${metrics.metabolicType}
Apply ${metrics.metabolicType}-specific coaching language and adjustments.

${memoryBlock}

== PLATEAU PREDICTION ==
Plateau Prediction: likely around Week ${metrics.plateauWeek}.
At that week add a "Plateau Breaker Week" with:
- +200 kcal for 5 days
- change exercise order or add 1 compound movement
- +10 min LISS on 2 days
- return to normal week after.

== REVERSE DIET FLAG ==
${reverseDietBlock || "No mandatory reverse diet phase."}

== CALORIE CYCLING ==
${calorieCyclingBlock}

== REFEED SCHEDULE ==
${refeedBlock}

== INJURY SUBSTITUTIONS ==
${injuryBlock || (injuryDetail ? `INJURY MODIFICATIONS (required):${injuryDetail}` : "No injury-specific substitutions required.")}

== SESSION LENGTH CAP ==
Hard cap: ${sessionCapMinutes} minutes per training session, warmup included.
- Every day's estimatedMinutes must be <= ${sessionCapMinutes} and must be realistic: warmup + sum of (sets x restSeconds) + working time.
- If a day would run long, superset isolation work or trim isolation sets — never cut the main compounds.

== BANNED EXERCISES ==
${dislikedBlock || "No banned exercises."}

== TRAINING SPLIT ==
${splitBlock || "No split preference — choose the most effective split for their days and goal."}

== PROFESSIONAL PROGRAMMING DETAIL (required) ==
Populate these fields on EVERY exercise (terse strings — this must not bloat the JSON):
- tempo: eccentric-pause-concentric notation, e.g. "3-1-1" ("X" for explosive concentric).
- rpe: number 6-10 (working effort; deloads 6, top sets up to 9, beginners <= 8).
- restSeconds: number — heavy compounds 120-180, isolation 60-90, conditioning 30-60.
- warmupSets: ONLY on the first compound lift of each day (max 8 words, e.g. "2 ramp sets at 50/75%"). Omit elsewhere.
- substitutions: 1-2 alternates for the same pattern/muscles, max 6 words each, using ONLY their equipment and safe for their injuries.
- formCues: max 2 cues, max 7 words each. Skip formCues on simple machine/isolation moves.
Populate on EVERY program day: focus (max 6 words) and estimatedMinutes (integer, respects the session cap).
Populate on EVERY program week: coachRationale — 2-3 sentences in first-person coach voice that reference THIS user's actual numbers (their age, training days, calories, sleep, stress, injuries). Never generic. Deload weeks (isDeload true) also include deloadGuidance: one sentence with exact volume/load cuts.
Populate on EVERY diet week: coachRationale — 2-3 sentences on why this phase's calories/adjustment fit their metabolism and life, citing real numbers.
Populate once on program: progressionModel (one paragraph, max 80 words, exact rules for adding load/reps week to week) and testWeekGuidance (max 60 words: what to test in the final week and how to read the results).

== BUDGET MODE ==
${budgetBlock || "Standard budget mode."}

== SHOPPING & FOOD ENVIRONMENT ==
${buildShoppingContext(profile.country, profile.groceryMarket)}
- Every meal in the plan must be buildable from a normal shopping trip to that store.
- When two foods are nutritionally equivalent, always pick the one from the regional staples list.

== SUPPLEMENT STACK ==
Generate tiers:
- Tier 1 Essential
- Tier 2 Helpful
- Tier 3 Optional
Each supplement: name, dose, timing, why, estimated cost, alreadyUsing flag.
If budget is low, keep only Tier 1.

== RECOVERY PROTOCOL ==
${recoveryBlock || "Recovery protocol section optional based on profile."}

== RELIGIOUS INTEGRATION ==
${religiousBlock || "No religious restrictions."}

== RECIPE CARDS ==
Every meal must include:
recipe: {
  prepTime, cookTime, totalTime, servings,
  steps (max 8, specific with timing/temp),
  storageTip, batchNote, difficultyLevel
}

== CHEAT MEAL STRATEGY ==
${cheatMealBlock || "No cheat meal strategy required for this goal."}

== DELOAD WEEKS ==
Deload weeks at 4 and 8:
- sets -40%
- load -20%
- same frequency, shorter sessions
- no HIIT
- label clearly.

== EDUCATION MODE ==
${educationBlock || "Education mode not mandatory."}

== OUTPUT FORMAT (STRICT JSON) ==

Respond in this EXACT JSON structure:

{
  "summary": {
    "greeting": "Personal opening message (2-3 sentences, use their data)",
    "calorieTarget": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "water": number,
    "weeklyChange": "e.g. -0.5kg/week",
    "timeToGoal": "e.g. approximately 10-12 weeks",
    "keyInsight": "One powerful insight about their specific situation (1-2 sentences)"
  },
  "diet": {
    "philosophy": "Brief explanation of why this diet approach suits them (2-3 sentences)",
    "metabolicReset": { "enabled": boolean, "title": "Metabolic Reset Phase", "details": "..." },
    "cheatMealStrategy": {
      "optimalDay": "specific day/time",
      "preMeal": ["..."],
      "duringMeal": ["..."],
      "postMeal": ["..."],
      "frequency": "..."
    },
    "recoveryProtocol": {
      "title": "Your Recovery Protocol",
      "sleepOptimization": ["..."],
      "cortisolManagement": ["..."],
      "weeklyMetrics": ["..."]
    },
    "weeks": [
      {
        "weekRange": "Weeks 1–4",
        "phase": "Foundation Phase",
        "calories": number,
        "isRefeed": boolean,
        "isPlateauBreaker": boolean,
        "adjustment": "What changes and why",
        "coachRationale": "2-3 coach-voice sentences citing their real numbers",
        "days": [
          {
            "label": "Training Day Meal Plan",
            "meals": [
              {
                "name": "Breakfast",
                "time": "7:00–8:00 AM",
                "foods": ["Food item with quantity", "Food item with quantity"],
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "prepNote": "Brief prep instruction",
                "educationNote": "optional short beginner note",
                "recipe": {
                  "prepTime": "5 min",
                  "cookTime": "15 min",
                  "totalTime": "20 min",
                  "servings": 1,
                  "steps": ["Step 1...", "Step 2..."],
                  "storageTip": "....",
                  "batchNote": "....",
                  "difficultyLevel": "Easy"
                }
              }
            ],
            "totals": { "calories": number, "protein": number, "carbs": number, "fat": number },
            "waterTarget": "Xml",
            "notes": "Timing and context notes"
          },
          {
            "label": "Rest Day",
            "meals": [],
            "totals": { "calories": number, "protein": number, "carbs": number, "fat": number }
          }
        ]
      }
    ],
    "supplements": {
      "tier1": [{ "name": "", "dose": "", "timing": "", "why": "", "estimatedCost": "", "alreadyUsing": false }],
      "tier2": [{ "name": "", "dose": "", "timing": "", "why": "", "estimatedCost": "", "alreadyUsing": false }],
      "tier3": [{ "name": "", "dose": "", "timing": "", "why": "", "estimatedCost": "", "alreadyUsing": false }]
    },
    "tips": ["Practical tip specific to this person"]
  },
  "program": {
    "philosophy": "Why this training approach suits them",
    "structure": "e.g. 4-day upper/lower split",
    "beginnerFoundations": ["..."],
    "weeks": [
      {
        "weekRange": "Weeks 1–4",
        "phase": "Foundation",
        "isDeload": false,
        "deloadGuidance": "only when isDeload: one sentence with exact volume/load cuts",
        "focus": "What this phase builds",
        "coachRationale": "2-3 coach-voice sentences citing their real numbers",
        "days": [
          {
            "day": "Monday",
            "label": "Upper Body — Push",
            "focus": "max 6 words",
            "estimatedMinutes": number,
            "exercises": [
              {
                "name": "Exercise name",
                "sets": number,
                "reps": "8–10 or AMRAP",
                "rest": "90s",
                "tempo": "3-1-1",
                "rpe": number,
                "restSeconds": number,
                "warmupSets": "only on first compound of the day",
                "substitutions": ["1-2 short alternates"],
                "formCues": ["max 2 short cues"],
                "note": "Form cue or coaching note",
                "educationNote": "optional short beginner note"
              }
            ],
            "warmup": "5 min description",
            "cooldown": "3 min description",
            "duration": "~45 min"
          }
        ]
      }
    ],
    "progressionRules": ["How to add weight/reps each week"],
    "progressionModel": "one paragraph, max 80 words",
    "testWeekGuidance": "max 60 words",
    "cardioRecommendation": "Specific cardio plan based on their answers",
    "injuryModifications": "If injuries noted: what to avoid and alternatives"
  },
  "grocery": {
    "categories": [
      { "name": "Proteins", "items": [{ "name": "Chicken breast", "quantity": "1.2", "unit": "kg", "estimatedCost": "EUR 8" }] }
    ]
  },
  "mealPrep": {
    "totalTime": "~120 min",
    "equipment": ["large pot", "baking tray", "8 containers"],
    "timeline": [{ "time": "0:00-0:20", "task": "Cook rice", "detail": "...", "storage": "..." }]
  },
  "mindset": {
    "weeklyCheckin": "What to track and review each week",
    "ifYouStruggle": "Specific advice for their biggest challenge",
    "motivation": "Personal motivational message based on their goals"
  }
}

Make every meal use their liked foods and avoid their hated foods.
If they have religious restrictions, respect them strictly.
If budget is low: use affordable staples (oats, eggs, rice, canned tuna, chicken).
If time is low: batch cooking meals, simple 3-ingredient options.
If injuries noted: remove affected exercises and add alternatives.
If they listed exercises to avoid: never program them — substitute equally effective alternatives.
Every training day's estimatedMinutes must respect the ${sessionCapMinutes}-minute session cap.
`;
}

