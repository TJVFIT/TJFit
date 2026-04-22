import {
  EVIDENCE_BASE_FOR_PLAN,
  renderEvidenceBase
} from "@/lib/tjai/knowledge/evidence-base";
import {
  renderSafetyFlagsForPrompt,
  screenUserProfile,
  type SafetyFlagSet
} from "@/lib/tjai/safety/screening";
import type { TJAIMetrics, TjaiMemorySnapshot, TjaiUserProfile } from "@/lib/tjai-types";

export function buildTJAISystemPrompt(): string {
  return `You are TJAI — the fitness AI coach inside TJFit. You are built to be the most evidence-based, personalised, and safe coaching voice on the internet.

You reason like a panel of four specialists collapsed into one mind:
1. A NSCA CSCS strength & conditioning coach fluent in RPE/RIR autoregulation and Israetel/Helms volume landmarks.
2. A registered sports dietitian following the 2024 ISSN position stand on protein and the IOC RED-S 2023 consensus.
3. A behaviour-change specialist trained in Motivational Interviewing (Miller & Rollnick) — empathy first, prescription second.
4. A physiotherapist who runs a PAR-Q+ screen on every intake and refuses to push past referral triggers.

Hard rules you never break:
- Every prescription is grounded in the evidence base and the user's data. No generic advice.
- Volume is prescribed in weekly sets per muscle with an MEV→MAV ramp, never "go to failure on everything".
- Intensity is prescribed as RPE (and RIR) per working set, never just "heavy".
- Safety triggers from the screening block are non-negotiable: if the set flags a referral, you add the clearance language and you DO NOT prescribe aggressive deficits or near-failure work.
- Deload is scheduled, not improvised. You name the deload triggers so the user can spot them.
- Nutrition is a floor (protein g/kg, fiber, hydration), a target (calories), and a framework (carb distribution around training) — never a rigid meal-by-meal law.
- You speak Motivational-Interviewing style: reflect first, prescribe second, no shame language around food or missed workouts.
- You never diagnose. If the screening block says refer, you say refer — clearly and once.

Output: one valid JSON object. No markdown, no prose outside JSON. Match the schema at the end of the user prompt exactly. Every optional evidence field you fill in raises the quality of the plan — fill them when you can.`;
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

function selectPeriodizationModel(profile: TjaiUserProfile): "linear" | "dup" | "block" | "autoregulated" {
  if (profile.experienceLevel === "beginner") return "linear";
  if (profile.trainingDays <= 3) return "dup";
  if (profile.scheduleConstraint === "shift_work" || profile.scheduleConstraint === "travel") return "autoregulated";
  return "block";
}

export function buildTJAIUserPrompt(
  profile: TjaiUserProfile,
  metrics: TJAIMetrics,
  memory?: TjaiMemorySnapshot | null,
  safetyOverride?: SafetyFlagSet
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

  const safetySet = safetyOverride ?? screenUserProfile(profile);
  const effectivePace: "slow" | "moderate" | "aggressive" =
    safetySet.disallowAggressivePace && profile.pace === "aggressive" ? "moderate" : profile.pace;
  const effectiveGoal: TjaiUserProfile["goal"] = safetySet.redsConcern ? "recomposition" : profile.goal;
  const periodization = selectPeriodizationModel(profile);

  const calorieCyclingBlock = effectiveGoal === "muscle_gain"
    ? `CALORIE CYCLING:
- Training days: calorieTarget + 200
- Rest days: calorieTarget - 100
- Weekly average must still equal calorieTarget * 7.`
    : effectiveGoal === "fitness" || effectiveGoal === "stay_active" || safetySet.redsConcern
      ? "CALORIE CYCLING: Skip cycling. Use same calories every day (recovery-first protocol)."
      : `CALORIE CYCLING:
- Training days: calorieTarget + 150, carbs +40-50g, fat -5g
- Rest days: calorieTarget - 150, carbs -40-50g, fat +5g
- Weekly average must still equal calorieTarget * 7.
- Label meal blocks as Training Day Meal Plan / Rest Day Meal Plan.`;

  const refeedBlock = effectiveGoal === "fat_loss" && !safetySet.redsConcern
    ? `REFEED WEEKS:
- Week 4 and Week 8: raise to TDEE for 5 days.
- Increase carbs, keep protein same, fat same/slightly lower.
- Label each refeed week clearly and explain this is strategic, not a cheat week.`
    : "REFEED WEEKS: Not needed for this goal.";

  const injuryBlock = profile.injuries.length > 0
    ? `INJURY MODIFICATIONS (required): User reported "${injuries}".
Rules:
1) Remove exercises that stress injured area.
2) Replace with the highest-SFR safe alternative for the same muscle group.
3) Add section: "Exercises Modified for Your Injury".
4) Every modified exercise keeps the same prescribed RPE/RIR.`
    : "";

  const budgetBlock =
    profile.monthlyFoodBudget === "budget"
      ? `BUDGET MODE ACTIVE:
- Use affordable staples only (oats, eggs, rice, canned tuna, chicken, legumes, frozen vegetables).
- No expensive ingredients.
- Include "buy in bulk" notes.
- Weekly grocery cost under $50.`
      : "";

  const poorSleep = profile.sleepHours < 6;
  const recoveryBlock =
    poorSleep || profile.stressLevel === "high" || profile.stressLevel === "very_high"
      ? `RECOVERY PROTOCOL REQUIRED:
- Add dedicated section: "Your Recovery Protocol".
- Include sleep optimisation (caffeine cutoff 8h pre-bed, 15 min wind-down, consistent wake time),
  cortisol management (Zone-2 walks, breathwork, alcohol limit), and weekly recovery metrics
  (morning RHR, HRV trend if available, session RPE drift).`
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
    (effectiveGoal === "fat_loss" || effectiveGoal === "recomposition") && !safetySet.eatingDisorderConcern && !safetySet.redsConcern
      ? `STRATEGIC MEAL STRATEGY:
- Call this a "high-carb refeed meal" (not a cheat meal — no moralising language).
- Include pre, during, and post protocol: normal protein, slightly higher carbs, less dietary fat.
- ${effectivePace === "aggressive" ? "Once per 2 weeks" : "Weekly"}.`
      : "";

  const educationBlock = beginnerMode
    ? `EDUCATION MODE ACTIVE:
- Add "Beginner Foundations" section (10 concise rules) that explicitly teaches the RPE/RIR scale and what "leave 2 in the tank" feels like.
- Each exercise includes educationNote.
- Each meal includes educationNote.`
    : "";

  const highStress = profile.stressLevel === "high" || profile.stressLevel === "very_high";
  const fastPace = effectivePace === "aggressive";
  const isBeginnerLevel = profile.experienceLevel === "beginner";

  const coachWarnings: string[] = [];
  if (highStress && fastPace) coachWarnings.push("⚠️ High stress + aggressive pace = elevated cortisol risk. Moderate the deficit and prioritise recovery days.");
  if (poorSleep) coachWarnings.push("⚠️ Sleep deprivation detected. Add sleep optimisation protocol. Cap working sets at RPE 8 on day 1 of each week.");
  if (highStress && poorSleep) coachWarnings.push("⚠️ Compounding recovery deficit. Mandatory deload in weeks 4 and 8. Cortisol management is priority.");
  if (isBeginnerLevel) coachWarnings.push("⚠️ Beginner detected. Use a 2-week adaptation phase. Teach RPE scale explicitly. Use the top-SFR exercise in every slot.");
  if (safetySet.requiresMedicalClearance) coachWarnings.push("🛑 Medical-clearance trigger active. Include a visible clearance note in the summary and NEVER prescribe near-failure work until clearance is obtained.");
  if (safetySet.eatingDisorderConcern) coachWarnings.push("⚠️ Disordered-eating risk pattern detected. Plan MUST lead with recomposition framing and non-alarmist referral language.");
  if (safetySet.redsConcern) coachWarnings.push("🛑 RED-S risk pattern detected. Hold at TDEE. Recomposition only. Encourage a physician check-in.");

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
Generate a complete 12-week transformation plan for this person. Apply the full evidence base below. Connect every data point, notice conflicts, and make decisions that optimise their results safely.

══ EVIDENCE BASE (reference every recommendation back to this) ══
${renderEvidenceBase(EVIDENCE_BASE_FOR_PLAN)}

══ SAFETY SCREEN ══
${renderSafetyFlagsForPrompt(safetySet)}

══ COACH INTELLIGENCE ANALYSIS ══
${coachWarnings.length > 0 ? coachWarnings.join("\n") : "✅ No critical flags detected. Proceed with standard evidence-based protocol."}

Metabolic type: ${metrics.metabolicType} — adjust macro ratios accordingly.
Confidence score: ${metrics.confidenceScore}/100
Periodization model (use this unless evidence contradicts): ${periodization}
Effective pace (after safety overrides): ${effectivePace}
Effective goal (after safety overrides): ${effectiveGoal}

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
Sleep: ${profile.sleepHours} hours | Stress: ${pretty.stressLevel}
Training level: ${pretty.experienceLevel}
Training location: ${pretty.trainingLocation}
Training days/week: ${profile.trainingDays}
Session duration: ${profile.sessionMinutes} min
Equipment: ${equipment}
Training preference: ${pretty.trainingPreference}
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
Injuries/limitations: ${injuries}
Medical notes: ${profile.injuryNotes ?? "None"}
Supplements already using: ${supplements}
Restriction notes: ${profile.restrictionNotes ?? "None"}

== DAILY ROUTINE (analyse for NEAT and meal timing) ==
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
- +10 min Zone-2 cardio on 2 days
- return to normal week after.

== REVERSE DIET FLAG ==
${reverseDietBlock || "No mandatory reverse diet phase."}

== CALORIE CYCLING ==
${calorieCyclingBlock}

== REFEED SCHEDULE ==
${refeedBlock}

== INJURY SUBSTITUTIONS ==
${injuryBlock || "No injury-specific substitutions required."}

== BUDGET MODE ==
${budgetBlock || "Standard budget mode."}

== SUPPLEMENT STACK ==
Generate tiers (evidence ranking):
- Tier 1 Essential — creatine monohydrate 3–5g/day, whey/plant protein to hit daily target, vitamin D3 if low sun.
- Tier 2 Helpful — caffeine 3–6 mg/kg pre-workout (if tolerated, not late-session), omega-3 2–3 g/day EPA+DHA, magnesium 200–400 mg if sleep/stress poor.
- Tier 3 Optional — beta-alanine 3–5 g/day (tingles; >60s efforts only), citrulline 6–8 g pre-workout, ashwagandha 300–600 mg for stress (caution w/ thyroid meds).
Every supplement: name, dose, timing, why, estimated cost, alreadyUsing flag.
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
${cheatMealBlock || "No strategic refeed meal required for this goal."}

== DELOAD WEEKS ==
Scheduled deload weeks at 4 and 8 (and any week the readiness protocol triggers):
- sets -40%
- load -10–20%
- same frequency, shorter sessions
- cap RPE at 7, no failure work
- no HIIT
- label clearly in weekRange.

== EDUCATION MODE ==
${educationBlock || "Education mode not mandatory."}

== OUTPUT FORMAT (STRICT JSON) ==

Respond in this EXACT JSON structure. Fill the new evidence-based fields (rpe, rir, tempo, sfrRank, periodization, weeklyVolumeTargets, safety, readiness). Do not hallucinate — only fill what you can ground in the evidence base above.

{
  "summary": {
    "greeting": "Personal opening message (2-3 sentences, use their data, Motivational-Interviewing tone: reflect, then point forward)",
    "calorieTarget": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "water": number,
    "weeklyChange": "e.g. -0.5kg/week",
    "timeToGoal": "e.g. approximately 10-12 weeks",
    "keyInsight": "One powerful insight about their specific situation (1-2 sentences)",
    "evidenceAnchor": "Name the main evidence lever this plan uses, e.g. 'MEV→MAV volume ramp + RPE 7–8 autoregulation, ISSN protein floor 2.0 g/kg'."
  },
  "safety": {
    "flags": [{ "code": "", "severity": "info|caution|refer", "message": "", "action": "" }],
    "requiresMedicalClearance": boolean,
    "clearanceNote": "Short, specific clearance line shown near the top of the plan — ONLY if a refer flag fired, otherwise omit.",
    "referralLanguage": "Single non-alarmist sentence pointing to a qualified professional if needed."
  },
  "readiness": {
    "morningChecklist": ["Sleep ≥7h?", "RHR within 5 bpm of baseline?", "Soreness ≤ 3/10?", "Ready to train at prescribed RPE?"],
    "deloadTriggers": ["List the concrete signs this user should watch for before requesting a deload."],
    "autoregulationRules": ["Session rules written in user's language — e.g. 'If warm-up feels RPE 8, drop top set 5–10% and hold reps.'"],
    "sleepHygiene": ["Caffeine cutoff 8h pre-bed", "Wind-down routine 20 min", "Consistent wake time"]
  },
  "diet": {
    "philosophy": "Brief explanation of why this diet approach suits them, referenced to ISSN protein + TDEE logic (2-3 sentences)",
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
        "adjustment": "What changes and why — reference evidence",
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
    "philosophy": "Why this training approach suits them — reference periodization model and volume landmarks",
    "structure": "e.g. 4-day upper/lower split, block periodization, RPE autoregulated",
    "periodization": {
      "model": "${periodization}",
      "mesocycleWeeks": 4,
      "deloadEvery": 4,
      "rationale": "Why this model fits this user (1 sentence)"
    },
    "weeklyVolumeTargets": [
      { "muscle": "Chest", "sets": 10, "band": "MEV" },
      { "muscle": "Back",  "sets": 14, "band": "MEV" }
    ],
    "beginnerFoundations": ["..."],
    "autoregulationRules": [
      "If warm-up feels heavier than prescribed RPE — drop working load 5–10%.",
      "If top-set RPE is lower than prescribed — keep load, add reps next session.",
      "Sleep <5h or stress spike — cap every working set at prescribed RPE -1.",
      "Pain (not DOMS) in a joint — substitute down the SFR list, do not push through."
    ],
    "weeks": [
      {
        "weekRange": "Weeks 1–4",
        "phase": "Foundation / Accumulation",
        "focus": "Build technique and reach MAV volume",
        "isDeload": false,
        "volumeBand": "MEV",
        "days": [
          {
            "day": "Monday",
            "label": "Upper Body — Push",
            "exercises": [
              {
                "name": "Exercise name (top-SFR for this user's equipment)",
                "sets": 3,
                "reps": "8–10",
                "rest": "90s",
                "rpe": "7–8",
                "rir": "2",
                "tempo": "2-0-1-0",
                "sfrRank": 1,
                "substitution": "Alternative if equipment/injury prevents main lift",
                "note": "Form cue or coaching note",
                "educationNote": "optional short beginner note"
              }
            ],
            "warmup": "5 min specific warm-up (ramp sets to RPE 6 on main lift)",
            "cooldown": "3 min description",
            "duration": "~45 min"
          }
        ]
      }
    ],
    "progressionRules": ["How to add weight/reps each week using RPE targets"],
    "cardioRecommendation": "Specific cardio plan grounded in the cardio dose-response evidence",
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
    "weeklyCheckin": "What to track and review each week (readiness checklist + key lift weights + sleep + sessional RPE drift)",
    "ifYouStruggle": "Specific advice for their biggest challenge, MI-style — reflect first, suggest one tiny next action",
    "motivation": "Personal motivational message based on their goals, never shame-based"
  }
}

Make every meal use their liked foods and avoid their hated foods.
If they have religious restrictions, respect them strictly.
If budget is low: use affordable staples (oats, eggs, rice, canned tuna, chicken, legumes).
If time is low: batch cooking meals, simple 3-ingredient options.
If injuries noted: remove affected exercises and add alternatives from the SFR hierarchy.
`;
}
