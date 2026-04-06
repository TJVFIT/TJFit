import type { QuizAnswers, TJAIMetrics } from "@/lib/tjai-types";

export function buildTJAISystemPrompt(): string {
  return `
You are TJAI — TJFit's elite AI fitness coach.

You create complete, personalized 12-week transformation plans
combining a structured diet system and training program.

Your plans are:
- Scientifically accurate
- Realistic and sustainable
- Detailed enough to follow immediately
- Formatted clearly for display on TJFit

You write like a world-class coach: direct, clear, expert, motivating.
Never generic. Never vague. Every recommendation is specific to this person.
`;
}

function fmtArray(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") return v;
  return "N/A";
}

export function buildTJAIUserPrompt(answers: QuizAnswers, metrics: TJAIMetrics): string {
  const goal = String(answers.s2_goal ?? "");
  const injuries = String(answers.s17_injuries ?? "").trim();
  const budget = String(answers.s14_budget ?? "");
  const religious = String(answers.s13_religious ?? "None");
  const stress = String(answers.s9_stress ?? "");
  const sleepQuality = String(answers.s8_quality ?? "");
  const sleepHours = Number(answers.s8_hours ?? 0);
  const biggestProblem = fmtArray(answers.s18_biggest_problem);
  const beginnerMode =
    biggestProblem.includes("Not knowing what to do") ||
    answers.s10_dieted === "No" ||
    answers.s5_trains === "No";

  const calorieCyclingBlock = goal.startsWith("Gain muscle")
    ? `CALORIE CYCLING:
- Training days: calorieTarget + 200
- Rest days: calorieTarget - 100
- Weekly average must still equal calorieTarget * 7.`
    : goal.startsWith("Maintain")
      ? "CALORIE CYCLING: Skip cycling. Use same calories every day."
      : `CALORIE CYCLING:
- Training days: calorieTarget + 150, carbs +40-50g, fat -5g
- Rest days: calorieTarget - 150, carbs -40-50g, fat +5g
- Weekly average must still equal calorieTarget * 7.
- Label meal blocks as Training Day Meal Plan / Rest Day Meal Plan.`;

  const refeedBlock = goal.startsWith("Lose fat")
    ? `REFEED WEEKS:
- Week 4 and Week 8: raise to TDEE for 5 days.
- Increase carbs, keep protein same, fat same/slightly lower.
- Label each refeed week clearly and explain this is strategic, not a cheat week.`
    : "REFEED WEEKS: Not needed for this goal.";

  const injuryBlock = injuries
    ? `INJURY MODIFICATIONS (required): User reported "${injuries}".
Rules:
1) Remove exercises that stress injured area.
2) Replace with safe alternatives for same muscle group.
3) Add section: "Exercises Modified for Your Injury".`
    : "";

  const budgetBlock =
    budget === "Low — I need budget-friendly meals"
      ? `BUDGET MODE ACTIVE:
- Use budget staples only.
- No expensive ingredients.
- Meal cost under EUR 3.
- Include "buy in bulk" note.
- Weekly grocery list under EUR 40.`
      : "";

  const recoveryBlock =
    sleepQuality === "Poor — I wake up often" || sleepHours < 6 || stress === "High" || stress === "Very high"
      ? `RECOVERY PROTOCOL REQUIRED:
- Add dedicated section: "Your Recovery Protocol".
- Include sleep optimization, cortisol management, and weekly recovery metrics.`
      : "";

  const religiousBlock =
    religious !== "None"
      ? `RELIGIOUS RESTRICTIONS: ${religious}
- Every meal must be compliant.
- Label meal plans accordingly ([HALAL]/[KOSHER]/[NO BEEF]).`
      : "";

  const reverseDietBlock = metrics.reverseDietNeeded
    ? `REVERSE DIET REQUIRED:
- Add Metabolic Reset Phase (Weeks -2 to -1) before main 12-week plan.
- Calories at TDEE, light training 3x/week, no intense cardio.
- Then begin main 12-week plan.
- Label clearly as "Metabolic Reset Phase".`
    : "";

  const cheatMealBlock =
    goal.startsWith("Lose fat") || goal.startsWith("Recomposition")
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

  return `
Generate a complete 12-week transformation plan for this person.

== CALCULATED METRICS ==
BMR: ${metrics.bmr} kcal
TDEE: ${metrics.tdee} kcal
Daily calorie target: ${metrics.calorieTarget} kcal
Protein: ${metrics.protein}g | Fat: ${metrics.fat}g | Carbs: ${metrics.carbs}g
Water: ${metrics.water}ml/day
Estimated body fat: ${metrics.estimatedBodyFat}%
Expected progress: ${metrics.weeklyWeightChange}kg/week
Estimated time to goal: ${metrics.timeToGoal}
Metabolic type: ${metrics.metabolicType}
Plateau week prediction: ${metrics.plateauWeek}
Reverse diet needed: ${metrics.reverseDietNeeded}
Training day calories: ${metrics.trainingDayCalories}
Rest day calories: ${metrics.restDayCalories}
Refeed weeks: ${metrics.refeedWeeks.join(", ") || "none"}
Deload weeks: ${metrics.deloadWeeks.join(", ") || "none"}
Lean mass: ${metrics.leanMass}kg
Projected final weight: ${metrics.projectedFinalWeight}kg
Projected final body fat: ${metrics.projectedFinalBF}%
Confidence score: ${metrics.confidenceScore}/100

== PERSON PROFILE ==
Age: ${answers.s1_age} | Gender: ${answers.s1_gender}
Height: ${answers.s1_height}cm | Weight: ${answers.s1_weight}kg
Goal: ${answers.s2_goal} | Pace: ${answers.s2_pace}
Activity: ${answers.s4_daily_activity}
Steps: ${answers.s4_steps}
Trains: ${answers.s5_trains} | Days: ${answers.s5_days ?? "N/A"}
Training type: ${fmtArray(answers.s5_type)}
Cardio: ${answers.s6_cardio}
Sleep: ${answers.s8_hours}hrs | Quality: ${answers.s8_quality}
Stress: ${answers.s9_stress}
Meals per day: ${answers.s11_meals}
Diet style: ${answers.s12_diet_style}
Foods they like: ${answers.s12_foods_like ?? "No preference stated"}
Foods they avoid: ${answers.s12_foods_hate ?? "None stated"}
Allergies: ${fmtArray(answers.s13_allergies)}
Religious restrictions: ${answers.s13_religious}
Cooks own food: ${answers.s14_cooks}
Budget: ${answers.s14_budget}
Time for cooking: ${answers.s14_time}
Water intake: ${answers.s15_water}
Supplements: ${fmtArray(answers.s16_which_supps)}
Injuries: ${answers.s17_injuries ?? "None"}
Medical conditions: ${answers.s17_conditions ?? "None"}
Discipline level: ${answers.s18_discipline}
Biggest challenge: ${fmtArray(answers.s18_biggest_problem)}
Target weight: ${answers.s19_target_weight}kg
Timeframe: ${answers.s19_timeframe}

== DAILY ROUTINE (analyze for NEAT and meal timing) ==
${answers.s19_daily_routine}

== METABOLIC TYPE CLASSIFICATION ==
Metabolic Classification: ${metrics.metabolicType}
Apply ${metrics.metabolicType}-specific coaching language and adjustments.

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

