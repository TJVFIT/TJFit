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

  const injuryBlock = profile.injuries.length > 0
    ? `INJURY MODIFICATIONS (required): User reported "${injuries}".
Rules:
1) Remove exercises that stress injured area.
2) Replace with safe alternatives for same muscle group.
3) Add section: "Exercises Modified for Your Injury".`
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
  if (highStress && fastPace) coachWarnings.push("⚠️ High stress + aggressive pace = elevated cortisol risk. Moderate calorie deficit automatically. Prioritize recovery days.");
  if (poorSleep) coachWarnings.push("⚠️ Sleep deprivation detected. Add sleep optimization protocol. Reduce volume on day 1 of each week.");
  if (highStress && poorSleep) coachWarnings.push("⚠️ Compounding recovery risk. Include mandatory deload in weeks 4, 8. Cortisol management is priority.");
  if (isBeginnerLevel) coachWarnings.push("⚠️ Beginner detected. Use 2-week adaptation phase. Teach RPE scale. Simpler exercises. More education notes.");

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
${coachWarnings.length > 0 ? coachWarnings.join("\n") : "✅ No critical flags detected. Proceed with standard protocol."}

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
${injuryBlock || "No injury-specific substitutions required."}

== BUDGET MODE ==
${budgetBlock || "Standard budget mode."}

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
        "focus": "What this phase builds",
        "days": [
          {
            "day": "Monday",
            "label": "Upper Body — Push",
            "exercises": [
              {
                "name": "Exercise name",
                "sets": number,
                "reps": "8–10 or AMRAP",
                "rest": "90s",
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
`;
}

