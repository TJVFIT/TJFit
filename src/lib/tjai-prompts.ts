import type { QuizAnswers, TJAIMetrics } from "@/lib/tjai-types";

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

function fmtArray(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") return v;
  return "N/A";
}

export function buildTJAIUserPrompt(answers: QuizAnswers, metrics: TJAIMetrics): string {
  const goal = String(answers.s2_goal ?? "");
  const injuries = fmtArray(answers.s17_injuries);
  const budget = String(answers.s14_budget ?? "");
  const religious = String(answers.s13_allergies ?? "None");
  const stress = String(answers.s9_stress ?? "");
  const biggestProblem = fmtArray(answers.s18_biggest_problem);
  const beginnerMode =
    biggestProblem.includes("Not knowing what to do") ||
    String(answers.s5_trains ?? "").includes("Beginner");

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
    budget.toLowerCase().includes("budget")
      ? `BUDGET MODE ACTIVE:
- Use affordable staples only (oats, eggs, rice, canned tuna, chicken, legumes).
- No expensive ingredients.
- Include "buy in bulk" notes.
- Weekly grocery cost under $50.`
      : "";

  const sleepHoursNum = Number(String(answers.s8_hours ?? "7").match(/\d+/)?.[0] ?? 7);
  const poorSleep = sleepHoursNum < 6;
  const recoveryBlock =
    poorSleep || stress.includes("High") || stress.includes("Very High")
      ? `RECOVERY PROTOCOL REQUIRED:
- Add dedicated section: "Your Recovery Protocol".
- Include sleep optimization, cortisol management, and weekly recovery metrics.`
      : "";

  const religiousBlock =
    religious && !religious.includes("None")
      ? `DIETARY RESTRICTIONS: ${religious}
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

  const highStress = stress.includes("High") || stress.includes("Very High");
  const fastPace = String(answers.s2_pace ?? "").includes("Fast");
  const isBeginnerLevel = String(answers.s5_trains ?? "").includes("Beginner");

  const coachWarnings: string[] = [];
  if (highStress && fastPace) coachWarnings.push("⚠️ High stress + aggressive pace = elevated cortisol risk. Moderate calorie deficit automatically. Prioritize recovery days.");
  if (poorSleep) coachWarnings.push("⚠️ Sleep deprivation detected. Add sleep optimization protocol. Reduce volume on day 1 of each week.");
  if (highStress && poorSleep) coachWarnings.push("⚠️ Compounding recovery risk. Include mandatory deload in weeks 4, 8. Cortisol management is priority.");
  if (isBeginnerLevel) coachWarnings.push("⚠️ Beginner detected. Use 2-week adaptation phase. Teach RPE scale. Simpler exercises. More education notes.");

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
Age: ${answers.s1_age} | Gender: ${answers.s1_gender}
Height: ${answers.s1_height} | Weight: ${answers.s1_weight}
Goal: ${answers.s2_goal} | Pace: ${answers.s2_pace}
Body type: ${answers.s3_body_silhouette}
Activity level: ${answers.s4_daily_activity}
Sleep: ${answers.s8_hours} | Stress: ${answers.s9_stress}
Training level: ${answers.s5_trains}
Training location: ${fmtArray(answers.s5_type)}
Training days/week: ${answers.s5_days ?? "N/A"}
Session duration: ${answers.s5_duration ?? "45 min"}
Equipment: ${fmtArray(answers.s5_equipment) || "Full gym"}
Meals per day: ${answers.s11_meals}
Diet style: ${answers.s12_diet_style}
Foods they enjoy: ${fmtArray(answers.s12_foods_like) || "No preference stated"}
Dietary restrictions: ${fmtArray(answers.s13_allergies)}
Food budget: ${answers.s14_budget}
Cooking comfort: ${answers.s14_time}
Past experience: ${answers.s10_dieted}
Biggest obstacles: ${fmtArray(answers.s18_biggest_problem)}
Success vision: ${answers.s19_success_vision}
Injuries/limitations: ${fmtArray(answers.s17_injuries) || "None"}
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

