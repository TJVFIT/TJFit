/**
 * Bundle registry — the ONLY product surface on TJFit.
 * Each bundle pairs a 12-week training protocol with a matching diet system,
 * delivered as a branded PDF dossier via /api/bundles/download/[slug].
 *
 * Prices are intentionally $0 until the owner sets them (see feedback_pricing).
 */

export type BundleGoal =
  | "fat-loss"
  | "muscle-gain"
  | "recomp"
  | "strength"
  | "conditioning"
  | "foundation";

export type BundleExercise = { name: string; sets: string; notes?: string };
export type BundleTrainingDay = { name: string; exercises: BundleExercise[] };

export type BundleWeeklyTemplateDay = {
  day: string;
  sessionName: string;
  focus: string;
  exercises: BundleExercise[];
};

export type BundleProgressionPhase = {
  phase: string;
  weeks: string;
  loadingScheme: string;
  intensityCue: string;
};

export type BundleRecipe = {
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "shake";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  ingredients: string[];
  steps: string[];
};

export type BundleGroceryCategory = {
  category: string;
  items: Array<{ item: string; quantity: string }>;
};

export type Bundle = {
  slug: string;
  name: string;
  hook: string;
  goal: BundleGoal;
  goalLabel: string;
  programTitle: string;
  dietTitle: string;
  weeks: number;
  sessionsPerWeek: number;
  /** Display chip — currently always "Free" until owner sets pricing. */
  save: string;
  /** Free bundles bypass purchase gating on download. */
  isFree: boolean;
  /** Hero image path — owner will drop real assets later. Falls back to gradient. */
  heroImage: string;
  /** Long-form value prop for the detail page. */
  description: string;
  /** Phase outline shown on cards and inside the PDF. */
  phases: Array<{ name: string; focus: string }>;
  /** Macro / nutrition overview baked into the PDF. */
  nutrition: {
    style: string;
    proteinTarget: string;
    calorieBias: string;
    notes: string;
  };
  /** Bundle-specific sample training session — rendered in the PDF + detail page. */
  sampleTrainingDay: BundleTrainingDay;
  /** Bundle-specific sample meal day — rendered in the PDF + detail page. */
  sampleMealDay: Array<{ meal: string; items: string; macros?: string }>;
  /** Full weekly training template — one entry per training day. */
  weeklyTemplate?: BundleWeeklyTemplateDay[];
  /** Phase-by-phase loading schemes that drive the 12-week progression. */
  progression?: BundleProgressionPhase[];
  /** Warm-up routine prescribed before every session. */
  warmup?: string[];
  /** Cool-down routine prescribed after every session. */
  cooldown?: string[];
  /** Minimum equipment list. */
  equipment?: string[];
  /** Branded recipe library — drives the detail page + PDF. */
  recipes?: BundleRecipe[];
  /** Weekly grocery list, categorized. */
  groceryList?: BundleGroceryCategory[];
};

export const BUNDLES: Bundle[] = [
  {
    slug: "fat-loss",
    name: "Fat Loss Bundle",
    hook: "12-week gym fat-loss protocol — resistance + cardio progression that preserves muscle.",
    goal: "fat-loss",
    goalLabel: "Cut",
    programTitle: "Gym Fat Loss Protocol",
    dietTitle: "Clean Cutting Diet",
    weeks: 12,
    sessionsPerWeek: 5,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/fat-loss.svg",
    description:
      "A 12-week resistance-led cut. Compound lifts hold muscle, conditioning blocks raise daily energy expenditure, and the diet keeps protein high through a controlled deficit.",
    phases: [
      { name: "Prime (Weeks 1-4)", focus: "Strength base, modest deficit, baseline conditioning" },
      { name: "Strip (Weeks 5-8)", focus: "Higher density work, sharper deficit, cardio block" },
      { name: "Polish (Weeks 9-12)", focus: "Refeed weeks, peak conditioning, definition finish" }
    ],
    nutrition: {
      style: "Clean cutting · whole-food first",
      proteinTarget: "1.0 g per lb bodyweight",
      calorieBias: "-15% from maintenance",
      notes: "Two refeed weeks built in. Carbs cycled around training days."
    },
    sampleTrainingDay: {
      name: "Push Day A",
      exercises: [
        { name: "Barbell Bench Press", sets: "4 × 6-8" },
        { name: "Incline Dumbbell Press", sets: "3 × 10" },
        { name: "Cable Fly", sets: "3 × 12" },
        { name: "Seated Overhead Press", sets: "3 × 8" },
        { name: "Lateral Raise", sets: "3 × 15" },
        { name: "Rope Tricep Pushdown", sets: "3 × 12" },
        { name: "Bike Intervals", sets: "10 min · 30s on / 30s off", notes: "Finisher" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast (7 AM)", items: "4 egg whites + 2 whole eggs, 1 cup oats, ½ cup berries", macros: "~450 kcal · 35g P" },
      { meal: "Lunch (12 PM)", items: "6 oz chicken, 1 cup rice, mixed vegetables", macros: "~550 kcal · 50g P" },
      { meal: "Snack (3:30 PM)", items: "Whey shake + 1 apple", macros: "~250 kcal · 30g P" },
      { meal: "Dinner (7 PM)", items: "6 oz lean beef, baked sweet potato, salad", macros: "~600 kcal · 50g P" },
      { meal: "Evening (9:30 PM)", items: "1 cup cottage cheese + berries", macros: "~200 kcal · 25g P" }
    ]
  },
  {
    slug: "lean-bulk",
    name: "Lean Bulk Bundle",
    hook: "Add quality muscle without the fat — controlled surplus + heavy compound progression.",
    goal: "muscle-gain",
    goalLabel: "Bulk",
    programTitle: "Gym Mass Builder",
    dietTitle: "Lean Bulk Diet",
    weeks: 12,
    sessionsPerWeek: 5,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/lean-bulk.svg",
    description:
      "Push-pull-legs hypertrophy split layered over a small surplus. Heavy compounds drive strength, accessory volume drives size, and the diet keeps the gain ratio clean.",
    phases: [
      { name: "Base (Weeks 1-4)", focus: "Volume accumulation, technique refinement" },
      { name: "Build (Weeks 5-8)", focus: "Intensification, progressive overload" },
      { name: "Peak (Weeks 9-12)", focus: "Heavy strength weeks, top-set work" }
    ],
    nutrition: {
      style: "Lean bulk · 80/20 whole foods",
      proteinTarget: "1.0 g per lb bodyweight",
      calorieBias: "+10% above maintenance",
      notes: "Slow gain target: 0.5-1 lb per week. Re-baseline every 4 weeks."
    },
    sampleTrainingDay: {
      name: "Pull Day A",
      exercises: [
        { name: "Conventional Deadlift", sets: "4 × 5" },
        { name: "Pull-up (weighted if able)", sets: "4 × 8" },
        { name: "Barbell Row", sets: "4 × 8" },
        { name: "Lat Pulldown", sets: "3 × 10" },
        { name: "Face Pull", sets: "3 × 15" },
        { name: "Barbell Curl", sets: "3 × 10" },
        { name: "Hammer Curl", sets: "3 × 12" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast (7 AM)", items: "3 whole eggs, 1 cup oats, banana, 2 slices toast + butter", macros: "~700 kcal · 35g P" },
      { meal: "Pre-lift (11 AM)", items: "Peanut butter sandwich + whey shake", macros: "~500 kcal · 40g P" },
      { meal: "Post-lift (2 PM)", items: "8 oz chicken, 1.5 cup rice, vegetables", macros: "~750 kcal · 60g P" },
      { meal: "Dinner (7 PM)", items: "8 oz salmon, pasta with olive oil, salad", macros: "~800 kcal · 55g P" },
      { meal: "Evening (10 PM)", items: "Greek yogurt, honey, granola, almonds", macros: "~400 kcal · 25g P" }
    ]
  },
  {
    slug: "home-starter",
    name: "Home Starter Bundle",
    hook: "Zero equipment, four sessions a week, full plan — your first 12 weeks done right.",
    goal: "foundation",
    goalLabel: "Start",
    programTitle: "Home Fat Loss Starter",
    dietTitle: "Clean Cut Starter",
    weeks: 12,
    sessionsPerWeek: 4,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/home-starter.svg",
    description:
      "The on-ramp. Four short bodyweight sessions a week, a calorie framework you can actually follow, and a progression model that makes month 3 feel different from month 1.",
    phases: [
      { name: "Habit (Weeks 1-4)", focus: "Movement quality, calorie awareness" },
      { name: "Build (Weeks 5-8)", focus: "Tempo progressions, conditioning intervals" },
      { name: "Push (Weeks 9-12)", focus: "Density circuits, unilateral work" }
    ],
    nutrition: {
      style: "Beginner-friendly cutting",
      proteinTarget: "0.8 g per lb bodyweight",
      calorieBias: "-10% from maintenance",
      notes: "Plate-based portioning — no weighing required for the first 4 weeks."
    },
    sampleTrainingDay: {
      name: "Full Body Bodyweight",
      exercises: [
        { name: "Bodyweight Squat", sets: "3 × 15" },
        { name: "Push-up (knee or full)", sets: "3 × 10-15" },
        { name: "Inverted Row (table/sheet)", sets: "3 × 8-10" },
        { name: "Reverse Lunge", sets: "3 × 10 per side" },
        { name: "Plank", sets: "3 × 30s" },
        { name: "Mountain Climber", sets: "3 × 30s" },
        { name: "Brisk Walk", sets: "20 min", notes: "Cooldown + NEAT" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast", items: "Oatmeal + 1 scoop whey + banana + cinnamon" },
      { meal: "Lunch", items: "Tuna sandwich on whole grain, side fruit, water" },
      { meal: "Snack", items: "Greek yogurt + small handful almonds" },
      { meal: "Dinner", items: "Palm-sized chicken, fist of rice, two fists of vegetables" },
      { meal: "Evening", items: "Cottage cheese + cinnamon (optional)" }
    ]
  },
  {
    slug: "definition",
    name: "Muscle Definition Bundle",
    hook: "Hypertrophy split + hard cut macros for a sharper, more defined physique.",
    goal: "fat-loss",
    goalLabel: "Sculpt",
    programTitle: "Hypertrophy System",
    dietTitle: "Hard Cut Athlete Diet",
    weeks: 12,
    sessionsPerWeek: 5,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/definition.svg",
    description:
      "Volume-rich hypertrophy training married to an aggressive cut. For lifters who already have muscle and want to see it. High protein, structured cardio, weekly refeeds.",
    phases: [
      { name: "Accumulate (Weeks 1-4)", focus: "High-rep volume, MMC focus" },
      { name: "Define (Weeks 5-8)", focus: "Drop sets, supersets, conditioning ramp" },
      { name: "Peak (Weeks 9-12)", focus: "Refeed cycling, peak week" }
    ],
    nutrition: {
      style: "Hard cut · macro-tracked",
      proteinTarget: "1.2 g per lb bodyweight",
      calorieBias: "-20% from maintenance",
      notes: "Weekly refeed day. Carbs front-loaded around training."
    },
    sampleTrainingDay: {
      name: "Hypertrophy Push",
      exercises: [
        { name: "Incline Barbell Bench", sets: "4 × 8" },
        { name: "Flat DB Press", sets: "4 × 10" },
        { name: "Pec Deck", sets: "3 × 12", notes: "Drop set on last" },
        { name: "Seated DB Shoulder Press", sets: "4 × 10" },
        { name: "Cable Lateral Raise", sets: "4 × 15" },
        { name: "Overhead Tricep Extension", sets: "3 × 12" },
        { name: "Rope Pushdown", sets: "3 × 15 + drop" },
        { name: "Cardio (steady-state)", sets: "20 min", notes: "Zone 2" }
      ]
    },
    sampleMealDay: [
      { meal: "7 AM", items: "5 egg whites + 1 yolk, ½ cup oats, black coffee", macros: "~350 kcal · 35g P" },
      { meal: "10 AM", items: "5 oz chicken, ¾ cup rice, broccoli", macros: "~450 kcal · 45g P" },
      { meal: "1 PM", items: "Tuna salad in lettuce wraps", macros: "~250 kcal · 30g P" },
      { meal: "4 PM", items: "Whey isolate shake", macros: "~150 kcal · 30g P" },
      { meal: "7 PM", items: "6 oz lean beef, asparagus, ¼ avocado", macros: "~500 kcal · 45g P" },
      { meal: "9:30 PM", items: "Casein shake", macros: "~120 kcal · 25g P" }
    ]
  },
  {
    slug: "recomp",
    name: "Recomp Bundle",
    hook: "Build muscle and strip fat at the same time — disciplined macros, hard training.",
    goal: "recomp",
    goalLabel: "Recomp",
    programTitle: "Recomposition Protocol",
    dietTitle: "Recomp Macro System",
    weeks: 12,
    sessionsPerWeek: 5,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/recomp.svg",
    description:
      "The hardest plan to do well. Maintenance calories, surgical macro timing, and progressive overload that turns body composition over the long arc.",
    phases: [
      { name: "Calibrate (Weeks 1-4)", focus: "Find true maintenance, dial protein" },
      { name: "Drive (Weeks 5-8)", focus: "Progressive overload at maintenance" },
      { name: "Confirm (Weeks 9-12)", focus: "Mini-cut + lean reset" }
    ],
    nutrition: {
      style: "Maintenance · high protein",
      proteinTarget: "1.1 g per lb bodyweight",
      calorieBias: "At maintenance",
      notes: "Carb cycling: high on lift days, moderate on rest days."
    },
    sampleTrainingDay: {
      name: "Upper Body",
      exercises: [
        { name: "Bench Press", sets: "4 × 6" },
        { name: "Weighted Pull-up", sets: "4 × 6-8" },
        { name: "DB Shoulder Press", sets: "4 × 8" },
        { name: "Barbell Row", sets: "4 × 8" },
        { name: "Incline DB Curl", sets: "3 × 10" },
        { name: "Skullcrusher", sets: "3 × 10" },
        { name: "Cable Row (close grip)", sets: "3 × 12" }
      ]
    },
    sampleMealDay: [
      { meal: "8 AM", items: "4 eggs, 1 cup oats, ½ cup berries" },
      { meal: "11 AM", items: "5 oz chicken, ½ cup rice, mixed salad" },
      { meal: "1:30 PM (pre-lift)", items: "Whey shake + banana" },
      { meal: "4 PM (post-lift)", items: "6 oz chicken, 1 cup rice, vegetables" },
      { meal: "7 PM", items: "6 oz salmon, sweet potato, broccoli" }
    ]
  },
  {
    slug: "powerbuilding",
    name: "Powerbuilding Bundle",
    hook: "Strength like a powerlifter, size like a bodybuilder — the best of both worlds.",
    goal: "strength",
    goalLabel: "Power",
    programTitle: "Powerbuilding System",
    dietTitle: "Strength Athlete Diet",
    weeks: 12,
    sessionsPerWeek: 4,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/powerbuilding.svg",
    description:
      "Heavy main lifts (squat, bench, deadlift, OHP) paired with hypertrophy accessories. Linear strength progression on the big four, volume-driven size on everything else.",
    phases: [
      { name: "Volume (Weeks 1-4)", focus: "Higher rep ranges, accessory base" },
      { name: "Intensity (Weeks 5-8)", focus: "5×5 main work, accessory refinement" },
      { name: "Peak (Weeks 9-12)", focus: "Triples, doubles, top-end strength" }
    ],
    nutrition: {
      style: "Strength-fueled · slight surplus",
      proteinTarget: "1.0 g per lb bodyweight",
      calorieBias: "+5% above maintenance",
      notes: "Pre-workout carbs prioritized. Creatine recommended."
    },
    sampleTrainingDay: {
      name: "Squat & Accessories",
      exercises: [
        { name: "Back Squat", sets: "5 × 5" },
        { name: "Front Squat", sets: "3 × 8" },
        { name: "Romanian Deadlift", sets: "3 × 8" },
        { name: "Walking Lunge", sets: "3 × 10 per leg" },
        { name: "Leg Press", sets: "3 × 12" },
        { name: "Standing Calf Raise", sets: "4 × 15" },
        { name: "Hanging Leg Raise", sets: "3 × 12" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast", items: "4 eggs, 1 cup oatmeal, banana, coffee" },
      { meal: "Pre-lift", items: "1 cup rice, 5 oz chicken, banana" },
      { meal: "Post-lift", items: "Whey shake + 30g dextrose" },
      { meal: "Dinner", items: "8 oz steak, baked potato, side salad" },
      { meal: "Evening", items: "Greek yogurt, almonds, honey" }
    ]
  },
  {
    slug: "calisthenics",
    name: "Calisthenics Bundle",
    hook: "Pull-up to muscle-up — bodyweight strength progressions built for real gyms or parks.",
    goal: "strength",
    goalLabel: "Bodyweight",
    programTitle: "Calisthenics Progression",
    dietTitle: "Athlete Maintenance Diet",
    weeks: 12,
    sessionsPerWeek: 4,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/calisthenics.svg",
    description:
      "A bodyweight-only path from solid pull-ups to clean muscle-ups, handstands, and pistol squats. Skill work, strength work, and the nutrition to support both.",
    phases: [
      { name: "Foundation (Weeks 1-4)", focus: "Pull-up volume, handstand wall holds" },
      { name: "Skill (Weeks 5-8)", focus: "Explosive pulls, freestanding skills" },
      { name: "Mastery (Weeks 9-12)", focus: "Muscle-up progressions, pistol work" }
    ],
    nutrition: {
      style: "Lean performance",
      proteinTarget: "0.9 g per lb bodyweight",
      calorieBias: "At maintenance",
      notes: "Light pre-training meal preferred. Bodyweight matters."
    },
    sampleTrainingDay: {
      name: "Pull / Push Skill Day",
      exercises: [
        { name: "Pull-up", sets: "5 × max-1" },
        { name: "Archer Pull-up", sets: "3 × 4 per side" },
        { name: "Handstand Wall Hold", sets: "4 × 30s" },
        { name: "Pike Push-up", sets: "4 × 8" },
        { name: "L-Sit (bars or floor)", sets: "4 × 20s" },
        { name: "Dragon Flag Negative", sets: "3 × 5" },
        { name: "Active Hang", sets: "3 × 30s" }
      ]
    },
    sampleMealDay: [
      { meal: "Pre-train (light)", items: "Banana + black coffee" },
      { meal: "Post-train", items: "5 oz chicken, 1 cup rice, vegetables" },
      { meal: "Lunch", items: "Salmon, ½ cup quinoa, mixed salad" },
      { meal: "Snack", items: "Apple + tablespoon almond butter" },
      { meal: "Dinner", items: "Beef or tofu stir-fry with rice and veg" }
    ]
  },
  {
    slug: "athlete-conditioning",
    name: "Athlete Conditioning Bundle",
    hook: "Engine, work capacity, and resilience — built for in-season athletes.",
    goal: "conditioning",
    goalLabel: "Conditioning",
    programTitle: "Athlete GPP Protocol",
    dietTitle: "Performance Fueling Diet",
    weeks: 12,
    sessionsPerWeek: 5,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/athlete-conditioning.svg",
    description:
      "General physical preparation for sport. Mixed-modal conditioning, sprint work, strength maintenance, and the carb-forward fueling strategy to sustain it.",
    phases: [
      { name: "Aerobic Base (Weeks 1-4)", focus: "Zone 2 volume, strength maintenance" },
      { name: "Threshold (Weeks 5-8)", focus: "Tempo intervals, mixed circuits" },
      { name: "Peak (Weeks 9-12)", focus: "VO2 max work, race-pace efforts" }
    ],
    nutrition: {
      style: "Carb-forward · athlete",
      proteinTarget: "0.9 g per lb bodyweight",
      calorieBias: "At or slightly above maintenance",
      notes: "Carbs scale with training load. Hydration plan included."
    },
    sampleTrainingDay: {
      name: "Threshold Session",
      exercises: [
        { name: "Warm-up (easy bike or row)", sets: "10 min" },
        { name: "Threshold Interval", sets: "4 × 6 min @ threshold", notes: "2 min easy between" },
        { name: "Core Circuit", sets: "3 rounds", notes: "Plank 30s · Side plank 20s/side · Hollow hold 30s" },
        { name: "Cooldown Walk", sets: "5 min" },
        { name: "Mobility (hips + ankles)", sets: "5 min" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast", items: "Oats, banana, peanut butter, scoop whey" },
      { meal: "Pre-train", items: "Toast + jam + black coffee" },
      { meal: "Lunch", items: "Rice bowl: chicken, black beans, salsa, avocado" },
      { meal: "Snack", items: "Greek yogurt + granola + berries" },
      { meal: "Dinner", items: "Pasta with lean ground beef, side salad" }
    ]
  },
  {
    slug: "beginner-foundations",
    name: "Beginner Foundations Bundle",
    hook: "Day one to month three — technique, habit, and your first real strength gains.",
    goal: "foundation",
    goalLabel: "Beginner",
    programTitle: "Foundations Strength",
    dietTitle: "Beginner Nutrition System",
    weeks: 12,
    sessionsPerWeek: 3,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/beginner-foundations.svg",
    description:
      "Three sessions a week, the six lifts that matter, and a nutrition framework you can sustain without weighing food. Built for someone who has never lifted seriously before.",
    phases: [
      { name: "Learn (Weeks 1-4)", focus: "Movement patterns, light loads, technique" },
      { name: "Apply (Weeks 5-8)", focus: "Linear progression, intro to volume" },
      { name: "Confirm (Weeks 9-12)", focus: "Heavier sets, deload, retest" }
    ],
    nutrition: {
      style: "Habit-first nutrition",
      proteinTarget: "0.8 g per lb bodyweight",
      calorieBias: "At maintenance",
      notes: "No tracking required. Plate-based portion guide."
    },
    sampleTrainingDay: {
      name: "Full Body Day A",
      exercises: [
        { name: "Goblet Squat", sets: "3 × 8" },
        { name: "DB Bench Press", sets: "3 × 8" },
        { name: "DB Row (each arm)", sets: "3 × 8" },
        { name: "Romanian Deadlift (light DBs)", sets: "3 × 10" },
        { name: "Plank", sets: "3 × 20s" },
        { name: "Treadmill Walk", sets: "10 min", notes: "Cooldown" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast", items: "2 eggs, toast, fruit, coffee" },
      { meal: "Lunch", items: "Chicken sandwich, side salad" },
      { meal: "Snack", items: "Protein bar or Greek yogurt" },
      { meal: "Dinner", items: "Palm-sized salmon, fist of rice, two fists of vegetables" },
      { meal: "Evening", items: "Greek yogurt with berries" }
    ]
  },
  {
    slug: "womens-sculpt",
    name: "Women's Sculpt Bundle",
    hook: "Lower-body emphasis, smart upper work, female-tuned macros — strong and shaped.",
    goal: "muscle-gain",
    goalLabel: "Sculpt",
    programTitle: "Women's Strength & Sculpt",
    dietTitle: "Women's Performance Diet",
    weeks: 12,
    sessionsPerWeek: 4,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/womens-sculpt.svg",
    description:
      "Glute-focused lower days, balanced upper work, and a nutrition plan tuned to a woman's training week. Strength first, shape as the result.",
    phases: [
      { name: "Activate (Weeks 1-4)", focus: "Mind-muscle, glute priming, base volume" },
      { name: "Build (Weeks 5-8)", focus: "Heavy hinges and squats, upper hypertrophy" },
      { name: "Define (Weeks 9-12)", focus: "Density blocks, conditioning add-on" }
    ],
    nutrition: {
      style: "Women's lean performance",
      proteinTarget: "0.9 g per lb bodyweight",
      calorieBias: "At maintenance · slight surplus on lift days",
      notes: "Iron and calcium emphasized. Cycle-aware notes included."
    },
    sampleTrainingDay: {
      name: "Glute Focus Day",
      exercises: [
        { name: "Barbell Hip Thrust", sets: "4 × 10" },
        { name: "Bulgarian Split Squat", sets: "3 × 10 per leg" },
        { name: "Cable Kickback", sets: "3 × 12 per side" },
        { name: "Romanian Deadlift", sets: "3 × 10" },
        { name: "Walking Lunge", sets: "3 × 12 per leg" },
        { name: "Banded Glute Bridge", sets: "3 × 15" },
        { name: "Plank", sets: "3 × 40s" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast", items: "Smoothie: whey, banana, spinach, ½ cup oats, almond milk" },
      { meal: "Lunch", items: "Salmon, sweet potato, asparagus" },
      { meal: "Snack", items: "Greek yogurt + berries" },
      { meal: "Dinner", items: "Lean turkey, quinoa, roasted vegetables" },
      { meal: "Evening", items: "Cottage cheese + handful of almonds" }
    ]
  },
  {
    slug: "senior-strength",
    name: "Senior Strength Bundle",
    hook: "50+ joint-friendly strength, mobility, and the protein protocol to back it up.",
    goal: "foundation",
    goalLabel: "50+",
    programTitle: "Lifelong Strength Protocol",
    dietTitle: "Longevity Nutrition System",
    weeks: 12,
    sessionsPerWeek: 3,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/senior-strength.svg",
    description:
      "Strength training built around joint longevity. Machines and dumbbells over barbells where it matters, mobility integrated into every session, and a protein-forward diet for the over-50 athlete.",
    phases: [
      { name: "Mobilize (Weeks 1-4)", focus: "Range of motion, foundation lifts" },
      { name: "Strengthen (Weeks 5-8)", focus: "Progressive load, joint-friendly variants" },
      { name: "Sustain (Weeks 9-12)", focus: "Maintenance template, long-term plan" }
    ],
    nutrition: {
      style: "Longevity · protein-forward",
      proteinTarget: "1.0 g per lb bodyweight",
      calorieBias: "At maintenance",
      notes: "Protein spread across 4 meals. Vitamin D and omega-3 emphasized."
    },
    sampleTrainingDay: {
      name: "Full Body (Joint-Friendly)",
      exercises: [
        { name: "Leg Press", sets: "3 × 10", notes: "Controlled tempo" },
        { name: "Chest-Supported Row", sets: "3 × 10" },
        { name: "Seated DB Press", sets: "3 × 10" },
        { name: "Goblet Squat", sets: "3 × 8" },
        { name: "Lat Pulldown", sets: "3 × 10" },
        { name: "Plank", sets: "3 × 20-30s" },
        { name: "Hip Mobility Flow", sets: "5 min" }
      ]
    },
    sampleMealDay: [
      { meal: "Breakfast", items: "Oatmeal + walnuts + berries, 2 eggs on the side" },
      { meal: "Lunch", items: "Grilled chicken, sweet potato, leafy greens" },
      { meal: "Snack", items: "Cottage cheese + sliced fruit" },
      { meal: "Dinner", items: "Baked fish, quinoa, roasted vegetables" },
      { meal: "Evening", items: "Greek yogurt + honey" }
    ]
  },
  {
    slug: "cutting-peak",
    name: "Cutting Peak Bundle",
    hook: "Advanced contest-style cut — refeeds, peak week, the works. For lifters with a base.",
    goal: "fat-loss",
    goalLabel: "Peak",
    programTitle: "Peak Cut Protocol",
    dietTitle: "Contest Prep Macro System",
    weeks: 12,
    sessionsPerWeek: 6,
    save: "Free",
    isFree: true,
    heroImage: "/bundles/cutting-peak.svg",
    description:
      "The advanced cut. Engineered for lifters who already have muscle and want to peak. Structured refeeds, weekly check-ins, peak week protocol, and the discipline to match.",
    phases: [
      { name: "Lead-In (Weeks 1-4)", focus: "Diet break, baseline lifts, cardio start" },
      { name: "Strip (Weeks 5-8)", focus: "Aggressive deficit, refeed cycling, training intensity" },
      { name: "Peak (Weeks 9-12)", focus: "Carb depletion, water cuts, peak week protocol" }
    ],
    nutrition: {
      style: "Contest prep · tracked",
      proteinTarget: "1.3 g per lb bodyweight",
      calorieBias: "-25% from maintenance",
      notes: "Weekly refeeds. Peak week protocol detailed. Not for beginners."
    },
    sampleTrainingDay: {
      name: "Chest / Shoulder / Tri (Week 8)",
      exercises: [
        { name: "Incline Smith Press", sets: "4 × 8" },
        { name: "Flat DB Press", sets: "4 × 10" },
        { name: "Cable Crossover", sets: "4 × 12", notes: "Drop set on last" },
        { name: "Seated DB Shoulder Press", sets: "4 × 10" },
        { name: "Lateral Raise", sets: "5 × 15" },
        { name: "Rear Delt Fly", sets: "4 × 15" },
        { name: "Rope Pushdown", sets: "4 × 12", notes: "Drop on last" },
        { name: "Overhead Tri Extension", sets: "3 × 12" },
        { name: "Steady-state Cardio", sets: "30 min", notes: "Post-lift" }
      ]
    },
    sampleMealDay: [
      { meal: "6 AM", items: "6 egg whites, ½ cup oats, black coffee", macros: "~280 kcal · 35g P" },
      { meal: "9 AM", items: "5 oz chicken, ½ cup rice", macros: "~350 kcal · 45g P" },
      { meal: "12 PM", items: "5 oz tilapia, asparagus, lemon", macros: "~250 kcal · 40g P" },
      { meal: "3 PM", items: "Whey isolate shake", macros: "~120 kcal · 30g P" },
      { meal: "6 PM", items: "6 oz lean steak, large salad with vinegar", macros: "~400 kcal · 45g P" },
      { meal: "9 PM", items: "Casein shake + 1 tbsp chia seeds", macros: "~150 kcal · 25g P" }
    ]
  }
];

import { BUNDLE_CONTENT } from "@/lib/bundle-content";

function enrich(b: Bundle): Bundle {
  const content = BUNDLE_CONTENT[b.slug];
  if (!content) return b;
  return { ...b, ...content };
}

/** Lookup a bundle by slug. Returns undefined if not found. */
export function getBundle(slug: string): Bundle | undefined {
  const base = BUNDLES.find((b) => b.slug === slug);
  return base ? enrich(base) : undefined;
}

/** All bundles, enriched with their rich content layer. */
export function listBundles(): Bundle[] {
  return BUNDLES.map(enrich);
}

/** All bundle slugs — used for generateStaticParams on detail pages. */
export function listBundleSlugs(): string[] {
  return BUNDLES.map((b) => b.slug);
}
