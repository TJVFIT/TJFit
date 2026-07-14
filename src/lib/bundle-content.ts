/**
 * Rich content layer for each bundle — full weekly training template,
 * phase-by-phase progression, warm-up/cool-down, equipment list, recipe
 * library, and weekly grocery list. Merged into the base Bundle record
 * by getBundle() in bundles.ts so callers see one consistent shape.
 *
 * English source of truth. Localization layer (bundle-localization) carries
 * non-English overlays for the strings users actually read; this file holds
 * the structured catalogue that feeds the detail page sections and PDF.
 *
 * Prices stay $0 / Free — see feedback_pricing.
 */

import type {
  BundleGroceryCategory,
  BundleProgressionPhase,
  BundleRecipe,
  BundleWeeklyTemplateDay
} from "@/lib/bundles";

export type BundleContent = {
  weeklyTemplate: BundleWeeklyTemplateDay[];
  progression: BundleProgressionPhase[];
  warmup: string[];
  cooldown: string[];
  equipment: string[];
  recipes: BundleRecipe[];
  groceryList: BundleGroceryCategory[];
};

/* ─── Shared building blocks ───────────────────────────────────────── */

const GYM_WARMUP = [
  "5 min easy bike or row · raise core temp",
  "Hip CARs · 5 reps per side",
  "T-spine rotations · 8 per side",
  "Banded shoulder dislocates · 10 reps",
  "2 ramp-up sets on the first main lift (50% · 70%)"
];

const HOME_WARMUP = [
  "5 min brisk walk or marching in place",
  "World's greatest stretch · 5 per side",
  "Glute bridges · 12 reps",
  "Arm circles + scap push-ups · 10 each",
  "Bodyweight squat to stand · 10 reps"
];

const STD_COOLDOWN = [
  "3 min easy walk to bring HR down",
  "90/90 hip stretch · 60s per side",
  "Doorway pec stretch · 45s per side",
  "Box breathing · 6 rounds (4-4-4-4)"
];

const ATHLETE_COOLDOWN = [
  "5 min easy spin or jog",
  "Couch stretch · 60s per side",
  "Ankle dorsiflexion · 10 reps per side",
  "Nasal-only breathing · 3 minutes"
];

const FULL_GYM_EQUIPMENT = [
  "Barbell + plates",
  "Squat rack + bench",
  "Dumbbells (light → heavy)",
  "Pull-up bar",
  "Cable stack",
  "Bench / box",
  "Lifting belt (optional)",
  "Resistance bands"
];

const HOME_EQUIPMENT = [
  "Yoga mat",
  "Sturdy chair or low table",
  "Doorway pull-up bar (optional)",
  "Resistance band (medium)",
  "Towel + water bottle (filled, as load)",
  "Timer or phone stopwatch"
];

/* ─── Reusable recipes ─────────────────────────────────────────────── */

const REC_GREEK_OATS: BundleRecipe = {
  name: "Greek Yogurt Power Oats",
  mealType: "breakfast",
  kcal: 480,
  protein: 38,
  carbs: 58,
  fat: 10,
  time: "8 min",
  ingredients: [
    "1 cup rolled oats",
    "1 cup non-fat Greek yogurt",
    "1 scoop whey protein",
    "1/2 cup mixed berries",
    "1 tbsp honey · pinch cinnamon"
  ],
  steps: [
    "Cook oats with 1.5 cups water until creamy.",
    "Off heat, stir in whey + cinnamon.",
    "Top with Greek yogurt, berries, drizzle of honey.",
    "Eat warm or chill overnight for grab-and-go."
  ]
};

const REC_EGG_SCRAMBLE: BundleRecipe = {
  name: "Tex-Mex Egg White Scramble",
  mealType: "breakfast",
  kcal: 410,
  protein: 42,
  carbs: 28,
  fat: 12,
  time: "10 min",
  ingredients: [
    "5 egg whites + 2 whole eggs",
    "1/2 cup black beans (rinsed)",
    "1/4 cup salsa · 2 tbsp shredded cheese",
    "1 small whole-grain tortilla",
    "Cilantro · hot sauce to taste"
  ],
  steps: [
    "Warm beans in a non-stick pan.",
    "Pour in beaten eggs, scramble 2-3 min.",
    "Fold in salsa + cheese until just melted.",
    "Spoon onto warm tortilla, top with cilantro."
  ]
};

const REC_CHICKEN_RICE_BOWL: BundleRecipe = {
  name: "Chipotle Chicken Rice Bowl",
  mealType: "lunch",
  kcal: 620,
  protein: 52,
  carbs: 68,
  fat: 16,
  time: "20 min",
  ingredients: [
    "6 oz chicken breast",
    "1 cup cooked jasmine rice",
    "1/2 cup black beans · 1/2 cup corn",
    "1/4 avocado · 1/4 cup pico de gallo",
    "Lime · cumin · paprika · garlic powder"
  ],
  steps: [
    "Season chicken with cumin, paprika, garlic, salt.",
    "Sear 4 min per side, rest 3 min, slice.",
    "Layer rice, beans, corn in a bowl.",
    "Top with chicken, avocado, pico, lime squeeze."
  ]
};

const REC_SALMON_SWEET_POTATO: BundleRecipe = {
  name: "Honey-Garlic Salmon + Sweet Potato",
  mealType: "dinner",
  kcal: 640,
  protein: 46,
  carbs: 54,
  fat: 22,
  time: "25 min",
  ingredients: [
    "6 oz salmon fillet",
    "1 medium sweet potato",
    "2 cups broccoli florets",
    "1 tbsp honey · 1 tbsp soy sauce · 1 clove garlic",
    "1 tsp olive oil · sesame seeds"
  ],
  steps: [
    "Roast cubed sweet potato 20 min at 425°F.",
    "Whisk honey, soy, minced garlic; brush onto salmon.",
    "Pan-sear salmon skin-down 4 min, flip 2 min.",
    "Steam broccoli, plate everything, sprinkle sesame."
  ]
};

const REC_LEAN_BEEF_PASTA: BundleRecipe = {
  name: "Lean Beef & Veg Pasta",
  mealType: "dinner",
  kcal: 720,
  protein: 50,
  carbs: 78,
  fat: 20,
  time: "20 min",
  ingredients: [
    "6 oz 93/7 ground beef",
    "2 oz dry whole-wheat penne",
    "1 cup marinara · 1 cup baby spinach",
    "1/4 cup grated parmesan",
    "Garlic · oregano · red pepper flakes"
  ],
  steps: [
    "Boil pasta to al dente, reserve 1/4 cup water.",
    "Brown beef with garlic, drain excess fat.",
    "Add marinara + spinach, simmer 3 min.",
    "Toss in pasta + reserved water, finish with parmesan."
  ]
};

const REC_COTTAGE_BERRIES: BundleRecipe = {
  name: "Cottage Cheese + Berries",
  mealType: "snack",
  kcal: 220,
  protein: 28,
  carbs: 18,
  fat: 4,
  time: "2 min",
  ingredients: [
    "1 cup low-fat cottage cheese",
    "1/2 cup mixed berries",
    "1 tbsp slivered almonds",
    "Pinch cinnamon"
  ],
  steps: [
    "Spoon cottage cheese into a bowl.",
    "Top with berries, almonds, cinnamon.",
    "Eat immediately or pack for later."
  ]
};

const REC_PB_BANANA_SHAKE: BundleRecipe = {
  name: "PB & Banana Recovery Shake",
  mealType: "shake",
  kcal: 360,
  protein: 32,
  carbs: 38,
  fat: 9,
  time: "3 min",
  ingredients: [
    "1 scoop whey protein",
    "1 banana",
    "1 tbsp natural peanut butter",
    "1 cup unsweetened almond milk",
    "Ice · cinnamon"
  ],
  steps: [
    "Drop everything in the blender.",
    "Blend 30s until smooth.",
    "Pour, dust cinnamon, drink within 30 min of training."
  ]
};

const REC_TURKEY_LETTUCE_WRAPS: BundleRecipe = {
  name: "Asian Turkey Lettuce Wraps",
  mealType: "lunch",
  kcal: 440,
  protein: 44,
  carbs: 26,
  fat: 18,
  time: "15 min",
  ingredients: [
    "6 oz lean ground turkey",
    "6 large butter-lettuce leaves",
    "1/4 cup shredded carrots · 2 scallions",
    "1 tbsp soy sauce · 1 tsp sesame oil · 1 tsp rice vinegar",
    "1 clove garlic · 1 tsp grated ginger"
  ],
  steps: [
    "Sauté garlic + ginger in sesame oil, 30s.",
    "Add turkey, brown 4 min, drain fat.",
    "Stir in soy + vinegar, fold in carrots + scallions.",
    "Spoon into lettuce cups and serve."
  ]
};

const REC_OVERNIGHT_OATS_PB: BundleRecipe = {
  name: "PB-Chocolate Overnight Oats",
  mealType: "breakfast",
  kcal: 520,
  protein: 34,
  carbs: 56,
  fat: 16,
  time: "5 min + overnight",
  ingredients: [
    "3/4 cup rolled oats",
    "1 scoop chocolate whey",
    "1 cup unsweetened almond milk",
    "1 tbsp natural peanut butter",
    "1 tbsp chia seeds · 1/2 banana sliced"
  ],
  steps: [
    "Combine oats, whey, chia, milk in a jar.",
    "Stir until smooth, swirl in peanut butter.",
    "Refrigerate overnight (or at least 4 hours).",
    "Top with banana before eating."
  ]
};

/* ─── Bundle content ───────────────────────────────────────────────── */

export const BUNDLE_CONTENT: Record<string, BundleContent> = {
  "fat-loss": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Push A",
        focus: "Chest · shoulders · triceps + conditioning finisher",
        exercises: [
          { name: "Barbell Bench Press", sets: "4 × 6-8" },
          { name: "Incline DB Press", sets: "3 × 10" },
          { name: "Cable Fly", sets: "3 × 12" },
          { name: "Seated OHP", sets: "3 × 8" },
          { name: "Lateral Raise", sets: "3 × 15" },
          { name: "Rope Pushdown", sets: "3 × 12" },
          { name: "Bike Intervals", sets: "10 min · 30s on / 30s off", notes: "Finisher" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Pull A",
        focus: "Back · biceps · rear delts",
        exercises: [
          { name: "Trap-bar Deadlift", sets: "4 × 5" },
          { name: "Chest-supported Row", sets: "4 × 10" },
          { name: "Lat Pulldown", sets: "3 × 12" },
          { name: "Face Pull", sets: "3 × 15" },
          { name: "DB Curl", sets: "3 × 12" },
          { name: "Hammer Curl", sets: "3 × 12" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Legs A",
        focus: "Quad-dominant + core",
        exercises: [
          { name: "Back Squat", sets: "4 × 6-8" },
          { name: "Leg Press", sets: "3 × 10" },
          { name: "Walking Lunge", sets: "3 × 10 per leg" },
          { name: "Leg Extension", sets: "3 × 15" },
          { name: "Hanging Leg Raise", sets: "3 × 12" },
          { name: "Plank", sets: "3 × 45s" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Push B / Conditioning",
        focus: "Upper hypertrophy + steady-state",
        exercises: [
          { name: "Incline Bench Press", sets: "4 × 8" },
          { name: "Machine Chest Press", sets: "3 × 12" },
          { name: "DB Lateral Raise", sets: "4 × 15" },
          { name: "Overhead Tri Extension", sets: "3 × 12" },
          { name: "Steady-state Cardio", sets: "25 min Zone 2" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Pull B + Legs Posterior",
        focus: "Posterior chain + back volume",
        exercises: [
          { name: "Romanian Deadlift", sets: "4 × 8" },
          { name: "Pull-up (assisted if needed)", sets: "4 × max-1" },
          { name: "Seated Cable Row", sets: "3 × 12" },
          { name: "Hip Thrust", sets: "3 × 10" },
          { name: "Standing Calf Raise", sets: "4 × 15" },
          { name: "Incline Treadmill Walk", sets: "20 min @ 4-6% incline" }
        ]
      }
    ],
    progression: [
      {
        phase: "Prime",
        weeks: "1-4",
        loadingScheme: "Base sets/reps · add 1 rep per set per week, then add load",
        intensityCue: "RPE 7 — leave 3 reps in the tank on every working set"
      },
      {
        phase: "Strip",
        weeks: "5-8",
        loadingScheme: "Drop reps by 2, add 5-10 lb on main lifts, add 1 conditioning block",
        intensityCue: "RPE 8 — leave 2 reps in the tank, push the cardio"
      },
      {
        phase: "Polish",
        weeks: "9-12",
        loadingScheme: "Top set + 2 back-off sets on main lifts, refeed every 5th day",
        intensityCue: "RPE 8-9 — peak conditioning, technique over ego"
      }
    ],
    warmup: GYM_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: FULL_GYM_EQUIPMENT,
    recipes: [REC_GREEK_OATS, REC_EGG_SCRAMBLE, REC_CHICKEN_RICE_BOWL, REC_SALMON_SWEET_POTATO, REC_TURKEY_LETTUCE_WRAPS, REC_COTTAGE_BERRIES],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "3 lb" },
          { item: "Salmon fillets", quantity: "2 lb" },
          { item: "Lean ground turkey", quantity: "1.5 lb" },
          { item: "Eggs", quantity: "2 dozen" },
          { item: "Greek yogurt (non-fat)", quantity: "32 oz" },
          { item: "Cottage cheese (low-fat)", quantity: "16 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Jasmine rice", quantity: "2 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Sweet potatoes", quantity: "4 medium" },
          { item: "Whole-grain tortillas", quantity: "1 pack" },
          { item: "Berries (frozen mix)", quantity: "2 bags" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Broccoli florets", quantity: "2 lb" },
          { item: "Butter lettuce", quantity: "2 heads" },
          { item: "Baby spinach", quantity: "1 bag" },
          { item: "Bell peppers", quantity: "4" },
          { item: "Onions", quantity: "3" },
          { item: "Garlic", quantity: "1 head" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Avocado", quantity: "4" },
          { item: "Slivered almonds", quantity: "8 oz" },
          { item: "Olive oil", quantity: "1 bottle" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Black beans (canned)", quantity: "4 cans" },
          { item: "Salsa", quantity: "1 jar" },
          { item: "Honey", quantity: "1 jar" },
          { item: "Soy sauce (low-sodium)", quantity: "1 bottle" },
          { item: "Spices: cumin, paprika, cinnamon, garlic powder", quantity: "as needed" }
        ]
      }
    ]
  },

  "lean-bulk": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Push (Heavy)",
        focus: "Bench-focused chest + shoulders",
        exercises: [
          { name: "Barbell Bench Press", sets: "5 × 5" },
          { name: "Standing Overhead Press", sets: "4 × 6" },
          { name: "Incline DB Press", sets: "3 × 10" },
          { name: "DB Lateral Raise", sets: "3 × 12" },
          { name: "Close-grip Bench", sets: "3 × 8" },
          { name: "Rope Pushdown", sets: "3 × 12" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Pull (Heavy)",
        focus: "Deadlift + back thickness",
        exercises: [
          { name: "Conventional Deadlift", sets: "4 × 5" },
          { name: "Weighted Pull-up", sets: "4 × 6-8" },
          { name: "Barbell Row", sets: "4 × 8" },
          { name: "Lat Pulldown", sets: "3 × 10" },
          { name: "Face Pull", sets: "3 × 15" },
          { name: "Barbell Curl", sets: "4 × 8" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Legs (Quad focus)",
        focus: "Squat + quad volume",
        exercises: [
          { name: "Back Squat", sets: "5 × 5" },
          { name: "Front Squat", sets: "3 × 8" },
          { name: "Bulgarian Split Squat", sets: "3 × 10 per leg" },
          { name: "Leg Extension", sets: "3 × 12" },
          { name: "Standing Calf Raise", sets: "4 × 12" },
          { name: "Hanging Leg Raise", sets: "3 × 12" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Push (Hypertrophy)",
        focus: "Chest volume + lateral delts",
        exercises: [
          { name: "Incline Bench Press", sets: "4 × 8" },
          { name: "Flat DB Press", sets: "4 × 10" },
          { name: "Cable Crossover", sets: "3 × 12" },
          { name: "Seated DB OHP", sets: "3 × 10" },
          { name: "Cable Lateral Raise", sets: "4 × 15" },
          { name: "Overhead Tri Extension", sets: "3 × 12" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Legs (Posterior) + Pull Accessories",
        focus: "RDL + hamstring + back finisher",
        exercises: [
          { name: "Romanian Deadlift", sets: "4 × 6-8" },
          { name: "Hip Thrust", sets: "4 × 10" },
          { name: "Hamstring Curl", sets: "3 × 12" },
          { name: "Chest-supported Row", sets: "4 × 10" },
          { name: "Hammer Curl", sets: "3 × 12" },
          { name: "Standing Calf Raise", sets: "4 × 15" }
        ]
      }
    ],
    progression: [
      {
        phase: "Base",
        weeks: "1-4",
        loadingScheme: "5×5 main lifts at 75%, accessories 3×10",
        intensityCue: "RPE 7 — accumulate volume, dial technique"
      },
      {
        phase: "Build",
        weeks: "5-8",
        loadingScheme: "5×5 at 82%, accessories 4×8 with load increase",
        intensityCue: "RPE 8 — bar speed must stay crisp"
      },
      {
        phase: "Peak",
        weeks: "9-12",
        loadingScheme: "3×3 top sets at 87% + 2×5 back-offs, accessories 4×6-8",
        intensityCue: "RPE 8-9 — heavy work, recover hard"
      }
    ],
    warmup: GYM_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: FULL_GYM_EQUIPMENT,
    recipes: [REC_OVERNIGHT_OATS_PB, REC_EGG_SCRAMBLE, REC_CHICKEN_RICE_BOWL, REC_LEAN_BEEF_PASTA, REC_SALMON_SWEET_POTATO, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "3 lb" },
          { item: "Lean ground beef (93/7)", quantity: "2 lb" },
          { item: "Salmon fillets", quantity: "1.5 lb" },
          { item: "Eggs", quantity: "2 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Jasmine rice", quantity: "3 lb" },
          { item: "Whole-wheat pasta", quantity: "2 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Sweet potatoes", quantity: "5 medium" },
          { item: "Bananas", quantity: "10" },
          { item: "Whole-grain bread", quantity: "1 loaf" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Broccoli", quantity: "2 lb" },
          { item: "Baby spinach", quantity: "2 bags" },
          { item: "Bell peppers", quantity: "5" },
          { item: "Onions", quantity: "3" },
          { item: "Garlic", quantity: "1 head" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Natural peanut butter", quantity: "1 jar" },
          { item: "Olive oil", quantity: "1 bottle" },
          { item: "Avocado", quantity: "4" }
        ]
      },
      {
        category: "Dairy",
        items: [
          { item: "Whole milk", quantity: "1 gallon" },
          { item: "Parmesan (grated)", quantity: "8 oz" },
          { item: "Almond milk (unsweetened)", quantity: "1/2 gallon" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Marinara sauce", quantity: "2 jars" },
          { item: "Honey", quantity: "1 jar" },
          { item: "Chia seeds", quantity: "8 oz" },
          { item: "Creatine monohydrate", quantity: "300 g" }
        ]
      }
    ]
  },

  "home-starter": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Full Body A",
        focus: "Squat pattern + push",
        exercises: [
          { name: "Bodyweight Squat", sets: "3 × 15" },
          { name: "Push-up (knee or full)", sets: "3 × 10-15" },
          { name: "Reverse Lunge", sets: "3 × 10 per side" },
          { name: "Inverted Row (table)", sets: "3 × 8-10" },
          { name: "Plank", sets: "3 × 30s" },
          { name: "Brisk Walk", sets: "20 min" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Full Body B",
        focus: "Hinge pattern + pull",
        exercises: [
          { name: "Glute Bridge", sets: "3 × 15" },
          { name: "Single-leg RDL (bodyweight)", sets: "3 × 8 per leg" },
          { name: "Pike Push-up", sets: "3 × 6-10" },
          { name: "Doorway Row (towel)", sets: "3 × 10" },
          { name: "Dead Bug", sets: "3 × 8 per side" },
          { name: "Brisk Walk", sets: "20 min" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Full Body C",
        focus: "Conditioning circuit",
        exercises: [
          { name: "Goblet Squat (water jug)", sets: "3 × 12" },
          { name: "Push-up", sets: "3 × max-2" },
          { name: "Step-up (chair)", sets: "3 × 10 per leg" },
          { name: "Superman Hold", sets: "3 × 20s" },
          { name: "Mountain Climber", sets: "3 × 30s" },
          { name: "Side Plank", sets: "3 × 20s per side" }
        ]
      },
      {
        day: "Sun",
        sessionName: "Active Recovery",
        focus: "Walk + mobility flow",
        exercises: [
          { name: "Long Walk", sets: "45 min" },
          { name: "Cat-cow", sets: "2 × 10" },
          { name: "Hip 90/90", sets: "2 × 60s per side" },
          { name: "Doorway Pec Stretch", sets: "2 × 45s per side" }
        ]
      }
    ],
    progression: [
      {
        phase: "Habit",
        weeks: "1-4",
        loadingScheme: "Hit every prescribed rep with 2-3 sec eccentric, no rush",
        intensityCue: "Effort 6/10 — finish each set with 3-4 reps left"
      },
      {
        phase: "Build",
        weeks: "5-8",
        loadingScheme: "Add 2 reps per set, slow the eccentric to 4 sec",
        intensityCue: "Effort 7/10 — controlled, no missed reps"
      },
      {
        phase: "Push",
        weeks: "9-12",
        loadingScheme: "Add a 4th round to circuits, introduce unilateral variants",
        intensityCue: "Effort 8/10 — finish breathing hard, not broken"
      }
    ],
    warmup: HOME_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: HOME_EQUIPMENT,
    recipes: [REC_GREEK_OATS, REC_EGG_SCRAMBLE, REC_TURKEY_LETTUCE_WRAPS, REC_CHICKEN_RICE_BOWL, REC_COTTAGE_BERRIES, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "2 lb" },
          { item: "Ground turkey", quantity: "1 lb" },
          { item: "Eggs", quantity: "1 dozen" },
          { item: "Tuna pouches", quantity: "6" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Cottage cheese", quantity: "16 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Whole-grain bread", quantity: "1 loaf" },
          { item: "Brown rice", quantity: "2 lb" },
          { item: "Bananas", quantity: "7" },
          { item: "Apples", quantity: "6" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Mixed salad greens", quantity: "2 bags" },
          { item: "Carrots", quantity: "1 lb" },
          { item: "Broccoli", quantity: "1 lb" },
          { item: "Cucumber", quantity: "2" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Natural peanut butter", quantity: "1 jar" },
          { item: "Almonds", quantity: "8 oz" },
          { item: "Olive oil", quantity: "1 bottle" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Black beans (canned)", quantity: "3 cans" },
          { item: "Salsa", quantity: "1 jar" },
          { item: "Honey", quantity: "1 small jar" }
        ]
      }
    ]
  },

  definition: {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Hypertrophy Push",
        focus: "Chest · shoulders · triceps · drop sets",
        exercises: [
          { name: "Incline Barbell Bench", sets: "4 × 8" },
          { name: "Flat DB Press", sets: "4 × 10" },
          { name: "Pec Deck", sets: "3 × 12", notes: "Drop set last" },
          { name: "Seated DB OHP", sets: "4 × 10" },
          { name: "Cable Lateral Raise", sets: "4 × 15" },
          { name: "Overhead Tri Extension", sets: "3 × 12" },
          { name: "Steady-state Cardio", sets: "20 min Zone 2" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Hypertrophy Pull",
        focus: "Back width + biceps",
        exercises: [
          { name: "Lat Pulldown (wide)", sets: "4 × 10" },
          { name: "Chest-supported Row", sets: "4 × 10" },
          { name: "Cable Pullover", sets: "3 × 12" },
          { name: "Face Pull", sets: "4 × 15" },
          { name: "Incline DB Curl", sets: "4 × 10" },
          { name: "Cable Hammer Curl", sets: "3 × 12" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Leg Volume",
        focus: "Quads · hamstrings · glutes",
        exercises: [
          { name: "Hack Squat", sets: "4 × 10" },
          { name: "Romanian Deadlift", sets: "4 × 10" },
          { name: "Walking Lunge", sets: "3 × 12 per leg" },
          { name: "Leg Curl", sets: "3 × 12" },
          { name: "Leg Extension", sets: "3 × 15", notes: "Drop set last" },
          { name: "Standing Calf Raise", sets: "4 × 15" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Arms + Shoulders Focus",
        focus: "Arm volume + delt detail",
        exercises: [
          { name: "Seated DB OHP", sets: "4 × 10" },
          { name: "Cable Lateral Raise", sets: "5 × 15" },
          { name: "Rear Delt Fly", sets: "4 × 15" },
          { name: "EZ-bar Curl", sets: "4 × 10" },
          { name: "Skullcrusher", sets: "4 × 10" },
          { name: "Rope Pushdown", sets: "3 × 15", notes: "Drop set last" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Posterior + Conditioning",
        focus: "Glutes · hamstrings · cardio",
        exercises: [
          { name: "Hip Thrust", sets: "4 × 10" },
          { name: "Single-leg RDL (DB)", sets: "3 × 10 per leg" },
          { name: "Cable Kickback", sets: "3 × 12 per side" },
          { name: "Pull-up (assisted if needed)", sets: "3 × max-1" },
          { name: "Stairmaster", sets: "20 min" }
        ]
      }
    ],
    progression: [
      {
        phase: "Accumulate",
        weeks: "1-4",
        loadingScheme: "Base sets at RPE 7, add reps weekly",
        intensityCue: "Mind-muscle connection over load"
      },
      {
        phase: "Define",
        weeks: "5-8",
        loadingScheme: "Add drop sets to final movement of each session, +1 cardio block",
        intensityCue: "RPE 8 — squeeze every working set"
      },
      {
        phase: "Peak",
        weeks: "9-12",
        loadingScheme: "Refeed every 5th day; add supersets to arms and delts",
        intensityCue: "RPE 8-9 — peak week protocol week 12"
      }
    ],
    warmup: GYM_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: FULL_GYM_EQUIPMENT,
    recipes: [REC_EGG_SCRAMBLE, REC_GREEK_OATS, REC_CHICKEN_RICE_BOWL, REC_SALMON_SWEET_POTATO, REC_TURKEY_LETTUCE_WRAPS, REC_COTTAGE_BERRIES],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "4 lb" },
          { item: "Tilapia / white fish", quantity: "2 lb" },
          { item: "Lean steak (sirloin)", quantity: "1.5 lb" },
          { item: "Egg whites (carton) + whole eggs", quantity: "32 oz + 1 dozen" },
          { item: "Whey isolate", quantity: "1 tub" },
          { item: "Casein protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Jasmine rice", quantity: "2 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Sweet potatoes", quantity: "4 medium" },
          { item: "Rice cakes", quantity: "1 pack" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Asparagus", quantity: "2 bunches" },
          { item: "Broccoli", quantity: "2 lb" },
          { item: "Mixed greens", quantity: "2 bags" },
          { item: "Bell peppers", quantity: "5" },
          { item: "Cucumber", quantity: "3" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Avocado", quantity: "3" },
          { item: "Almonds", quantity: "8 oz" },
          { item: "Olive oil spray", quantity: "1 can" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Sugar-free electrolytes", quantity: "1 box" },
          { item: "Apple cider vinegar", quantity: "1 bottle" },
          { item: "Spices: paprika, garlic, lemon pepper", quantity: "as needed" }
        ]
      }
    ]
  },

  recomp: {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Upper Strength",
        focus: "Bench + row strength",
        exercises: [
          { name: "Bench Press", sets: "5 × 5" },
          { name: "Weighted Pull-up", sets: "4 × 6-8" },
          { name: "DB Shoulder Press", sets: "4 × 8" },
          { name: "Barbell Row", sets: "4 × 8" },
          { name: "Incline DB Curl", sets: "3 × 10" },
          { name: "Skullcrusher", sets: "3 × 10" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Lower Strength",
        focus: "Squat + hinge",
        exercises: [
          { name: "Back Squat", sets: "5 × 5" },
          { name: "Romanian Deadlift", sets: "4 × 8" },
          { name: "Walking Lunge", sets: "3 × 10 per leg" },
          { name: "Leg Press", sets: "3 × 12" },
          { name: "Hanging Leg Raise", sets: "3 × 12" }
        ]
      },
      {
        day: "Thu",
        sessionName: "Upper Hypertrophy",
        focus: "Volume + arms",
        exercises: [
          { name: "Incline Bench Press", sets: "4 × 8" },
          { name: "Chest-supported Row", sets: "4 × 10" },
          { name: "DB Lateral Raise", sets: "4 × 15" },
          { name: "Face Pull", sets: "3 × 15" },
          { name: "EZ-bar Curl", sets: "3 × 10" },
          { name: "Rope Pushdown", sets: "3 × 12" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Lower Hypertrophy",
        focus: "Glute + hamstring volume",
        exercises: [
          { name: "Hip Thrust", sets: "4 × 8" },
          { name: "Bulgarian Split Squat", sets: "3 × 10 per leg" },
          { name: "Leg Curl", sets: "3 × 12" },
          { name: "Leg Extension", sets: "3 × 15" },
          { name: "Standing Calf Raise", sets: "4 × 15" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Conditioning",
        focus: "Zone 2 + core",
        exercises: [
          { name: "Incline Treadmill Walk", sets: "35 min" },
          { name: "Plank", sets: "3 × 45s" },
          { name: "Side Plank", sets: "3 × 30s per side" },
          { name: "Pallof Press", sets: "3 × 10 per side" }
        ]
      }
    ],
    progression: [
      {
        phase: "Calibrate",
        weeks: "1-4",
        loadingScheme: "Find true maintenance kcal, log every working set",
        intensityCue: "RPE 7-8 — leave 2-3 reps in the tank"
      },
      {
        phase: "Drive",
        weeks: "5-8",
        loadingScheme: "Add 5 lb to mains weekly, hold accessories steady",
        intensityCue: "RPE 8 — strength must climb at maintenance kcal"
      },
      {
        phase: "Confirm",
        weeks: "9-12",
        loadingScheme: "Mini-cut weeks 9-11 (-300 kcal), maintenance week 12, retest",
        intensityCue: "RPE 8 — preserve lifts during deficit"
      }
    ],
    warmup: GYM_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: FULL_GYM_EQUIPMENT,
    recipes: [REC_GREEK_OATS, REC_OVERNIGHT_OATS_PB, REC_CHICKEN_RICE_BOWL, REC_SALMON_SWEET_POTATO, REC_LEAN_BEEF_PASTA, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "3 lb" },
          { item: "Salmon", quantity: "1.5 lb" },
          { item: "Lean ground beef", quantity: "1.5 lb" },
          { item: "Eggs", quantity: "2 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Jasmine rice", quantity: "2 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Whole-wheat pasta", quantity: "1 lb" },
          { item: "Sweet potatoes", quantity: "4 medium" },
          { item: "Berries", quantity: "2 bags frozen" },
          { item: "Bananas", quantity: "6" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Broccoli", quantity: "2 lb" },
          { item: "Baby spinach", quantity: "2 bags" },
          { item: "Bell peppers", quantity: "4" },
          { item: "Onions", quantity: "3" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Natural peanut butter", quantity: "1 jar" },
          { item: "Avocado", quantity: "4" },
          { item: "Olive oil", quantity: "1 bottle" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Marinara sauce", quantity: "1 jar" },
          { item: "Honey", quantity: "1 jar" },
          { item: "Creatine monohydrate", quantity: "300 g" }
        ]
      }
    ]
  },

  powerbuilding: {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Squat Day",
        focus: "Back squat + quad accessories",
        exercises: [
          { name: "Back Squat", sets: "5 × 5" },
          { name: "Front Squat", sets: "3 × 8" },
          { name: "Romanian Deadlift", sets: "3 × 8" },
          { name: "Walking Lunge", sets: "3 × 10 per leg" },
          { name: "Standing Calf Raise", sets: "4 × 12" },
          { name: "Plank", sets: "3 × 45s" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Bench Day",
        focus: "Bench press + push accessories",
        exercises: [
          { name: "Bench Press", sets: "5 × 5" },
          { name: "Close-grip Bench", sets: "4 × 6" },
          { name: "Incline DB Press", sets: "3 × 10" },
          { name: "DB Lateral Raise", sets: "3 × 12" },
          { name: "Tricep Pushdown", sets: "3 × 12" },
          { name: "Face Pull", sets: "3 × 15" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Deadlift Day",
        focus: "Deadlift + back",
        exercises: [
          { name: "Conventional Deadlift", sets: "4 × 5" },
          { name: "Barbell Row", sets: "4 × 8" },
          { name: "Pull-up (weighted if able)", sets: "4 × 6" },
          { name: "Hammer Curl", sets: "3 × 10" },
          { name: "Hyperextension", sets: "3 × 12" }
        ]
      },
      {
        day: "Sat",
        sessionName: "OHP Day",
        focus: "Overhead press + arms",
        exercises: [
          { name: "Standing OHP", sets: "5 × 5" },
          { name: "Push Press", sets: "3 × 5" },
          { name: "DB Shoulder Press", sets: "3 × 10" },
          { name: "EZ Curl", sets: "4 × 10" },
          { name: "Skullcrusher", sets: "4 × 10" }
        ]
      }
    ],
    progression: [
      {
        phase: "Volume",
        weeks: "1-4",
        loadingScheme: "Mains 5×5 at 70%, accessories 3×10",
        intensityCue: "RPE 7 — build volume tolerance"
      },
      {
        phase: "Intensity",
        weeks: "5-8",
        loadingScheme: "Mains 5×5 at 80%, accessories 4×8",
        intensityCue: "RPE 8 — bar speed must remain crisp"
      },
      {
        phase: "Peak",
        weeks: "9-12",
        loadingScheme: "Mains 5×3 at 87% → 3×2 at 90% (wk12), accessories 3×6-8",
        intensityCue: "RPE 8-9 — heavy singles in week 12"
      }
    ],
    warmup: GYM_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: FULL_GYM_EQUIPMENT,
    recipes: [REC_EGG_SCRAMBLE, REC_OVERNIGHT_OATS_PB, REC_CHICKEN_RICE_BOWL, REC_LEAN_BEEF_PASTA, REC_SALMON_SWEET_POTATO, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Lean steak (sirloin)", quantity: "2 lb" },
          { item: "Chicken breast", quantity: "3 lb" },
          { item: "Salmon", quantity: "1 lb" },
          { item: "Eggs", quantity: "2 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Jasmine rice", quantity: "3 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Bananas", quantity: "10" },
          { item: "Baked potatoes", quantity: "5 large" },
          { item: "Whole-grain bread", quantity: "1 loaf" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Mixed salad", quantity: "2 bags" },
          { item: "Broccoli", quantity: "1.5 lb" },
          { item: "Asparagus", quantity: "1 bunch" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Peanut butter", quantity: "1 jar" },
          { item: "Olive oil", quantity: "1 bottle" },
          { item: "Almonds", quantity: "8 oz" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Dextrose powder", quantity: "1 lb" },
          { item: "Creatine monohydrate", quantity: "300 g" },
          { item: "Marinara sauce", quantity: "1 jar" },
          { item: "Honey", quantity: "1 jar" }
        ]
      }
    ]
  },

  calisthenics: {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Pull / Push Skill",
        focus: "Pulling strength + handstand",
        exercises: [
          { name: "Pull-up", sets: "5 × max-1" },
          { name: "Archer Pull-up", sets: "3 × 4 per side" },
          { name: "Handstand Wall Hold", sets: "4 × 30s" },
          { name: "Pike Push-up", sets: "4 × 8" },
          { name: "L-Sit", sets: "4 × 20s" },
          { name: "Active Hang", sets: "3 × 30s" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Push / Core",
        focus: "Pressing + core",
        exercises: [
          { name: "Dip", sets: "5 × 8-10" },
          { name: "Pseudo-planche Push-up", sets: "4 × 6" },
          { name: "Diamond Push-up", sets: "3 × 12" },
          { name: "Dragon Flag Negative", sets: "3 × 5" },
          { name: "Hollow Hold", sets: "3 × 30s" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Lower / Explosive",
        focus: "Single-leg + jump",
        exercises: [
          { name: "Pistol Squat Progression", sets: "4 × 5 per leg" },
          { name: "Shrimp Squat", sets: "3 × 6 per leg" },
          { name: "Box Jump", sets: "5 × 5" },
          { name: "Nordic Curl (assisted)", sets: "3 × 6" },
          { name: "Calf Raise (single-leg)", sets: "3 × 12 per leg" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Skill Practice",
        focus: "Muscle-up + handstand walk",
        exercises: [
          { name: "Muscle-up Transitions", sets: "6 × 2", notes: "Quality over fatigue" },
          { name: "Handstand Walk Practice", sets: "5 × 30s" },
          { name: "False-grip Hold", sets: "4 × 20s" },
          { name: "Skin-the-cat", sets: "3 × 3" }
        ]
      }
    ],
    progression: [
      {
        phase: "Foundation",
        weeks: "1-4",
        loadingScheme: "Volume on pull-ups + pike push-ups, hold isometrics",
        intensityCue: "RPE 7 — clean reps, no kipping"
      },
      {
        phase: "Skill",
        weeks: "5-8",
        loadingScheme: "Explosive pulls, archer progressions, longer holds",
        intensityCue: "RPE 8 — every rep purposeful"
      },
      {
        phase: "Mastery",
        weeks: "9-12",
        loadingScheme: "Muscle-up attempts, freestanding handstand, pistol work",
        intensityCue: "RPE 8 — skill day stays fresh"
      }
    ],
    warmup: [
      "5 min easy jog or jump rope",
      "Scapular pull-ups · 3 × 8",
      "Wrist circles + push-ups · 10",
      "Hip flow · cossack squat × 8 per side",
      "Pike walks · 3 × 10"
    ],
    cooldown: ATHLETE_COOLDOWN,
    equipment: [
      "Pull-up bar (park or doorway)",
      "Parallel bars or sturdy chairs",
      "Resistance bands (assist)",
      "Gymnastic rings (optional)",
      "Wall space for handstand"
    ],
    recipes: [REC_GREEK_OATS, REC_TURKEY_LETTUCE_WRAPS, REC_CHICKEN_RICE_BOWL, REC_SALMON_SWEET_POTATO, REC_COTTAGE_BERRIES, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "3 lb" },
          { item: "Salmon", quantity: "1 lb" },
          { item: "Eggs", quantity: "1 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Quinoa", quantity: "1 lb" },
          { item: "Jasmine rice", quantity: "1 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Bananas", quantity: "7" },
          { item: "Sweet potatoes", quantity: "3" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Mixed salad", quantity: "2 bags" },
          { item: "Broccoli", quantity: "1 lb" },
          { item: "Carrots", quantity: "1 lb" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Almond butter", quantity: "1 jar" },
          { item: "Avocado", quantity: "3" },
          { item: "Olive oil", quantity: "1 bottle" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Sugar-free electrolytes", quantity: "1 box" },
          { item: "Honey", quantity: "1 jar" }
        ]
      }
    ]
  },

  "athlete-conditioning": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Zone 2 Aerobic",
        focus: "Aerobic base",
        exercises: [
          { name: "Easy Run / Bike", sets: "45 min @ 130-145 bpm" },
          { name: "Core Circuit", sets: "3 rounds", notes: "Plank 30s · Side 20s/side · Hollow 30s" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Strength Maintenance",
        focus: "Compound lifts at moderate volume",
        exercises: [
          { name: "Trap-bar Deadlift", sets: "4 × 5" },
          { name: "Bench Press", sets: "4 × 6" },
          { name: "Chin-up", sets: "4 × max-2" },
          { name: "Walking Lunge", sets: "3 × 10 per leg" },
          { name: "Farmer's Carry", sets: "3 × 40m" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Threshold Intervals",
        focus: "Lactate threshold",
        exercises: [
          { name: "Bike or Row Intervals", sets: "4 × 6 min @ threshold", notes: "2 min easy between" },
          { name: "Core Circuit", sets: "3 rounds", notes: "Pallof 10/side · Bird Dog 8/side · Dead Bug 8/side" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Sprint / Power",
        focus: "Speed + explosiveness",
        exercises: [
          { name: "Sprint", sets: "10 × 60m", notes: "Full recovery" },
          { name: "Broad Jump", sets: "5 × 3" },
          { name: "Med-ball Slam", sets: "4 × 8" },
          { name: "Plank Drag", sets: "3 × 30s" }
        ]
      },
      {
        day: "Sun",
        sessionName: "Long Aerobic",
        focus: "Zone 2 extended",
        exercises: [
          { name: "Long Run / Ride", sets: "60-90 min Zone 2" },
          { name: "Mobility Flow", sets: "10 min" }
        ]
      }
    ],
    progression: [
      {
        phase: "Aerobic Base",
        weeks: "1-4",
        loadingScheme: "Zone 2 volume, strength maintenance at RPE 6-7",
        intensityCue: "Nasal breathing on Zone 2 — if you can't, slow down"
      },
      {
        phase: "Threshold",
        weeks: "5-8",
        loadingScheme: "Add tempo intervals, hold strength at 80% loads",
        intensityCue: "Threshold = uncomfortable but sustainable"
      },
      {
        phase: "Peak",
        weeks: "9-12",
        loadingScheme: "VO2 work, race-pace simulations, sprint power",
        intensityCue: "RPE 9 on key efforts, full recovery between"
      }
    ],
    warmup: [
      "5 min easy jog",
      "Leg swings · 10 per side, each direction",
      "A-skips · 2 × 20m",
      "B-skips · 2 × 20m",
      "Strides · 4 × 60m building"
    ],
    cooldown: ATHLETE_COOLDOWN,
    equipment: [
      "Running shoes",
      "Bike or rower",
      "Barbell + plates",
      "Med ball (12-20 lb)",
      "GPS watch or HR monitor",
      "Foam roller"
    ],
    recipes: [REC_OVERNIGHT_OATS_PB, REC_EGG_SCRAMBLE, REC_CHICKEN_RICE_BOWL, REC_LEAN_BEEF_PASTA, REC_SALMON_SWEET_POTATO, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "2 lb" },
          { item: "Lean ground beef", quantity: "1.5 lb" },
          { item: "Salmon", quantity: "1 lb" },
          { item: "Eggs", quantity: "2 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs (high)",
        items: [
          { item: "Jasmine rice", quantity: "3 lb" },
          { item: "Rolled oats", quantity: "24 oz" },
          { item: "Whole-wheat pasta", quantity: "2 lb" },
          { item: "Bagels", quantity: "6" },
          { item: "Bananas", quantity: "10" },
          { item: "Sweet potatoes", quantity: "5" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Mixed greens", quantity: "2 bags" },
          { item: "Broccoli", quantity: "1.5 lb" },
          { item: "Bell peppers", quantity: "4" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Peanut butter", quantity: "1 jar" },
          { item: "Avocado", quantity: "3" },
          { item: "Olive oil", quantity: "1 bottle" }
        ]
      },
      {
        category: "Hydration & fuel",
        items: [
          { item: "Sports drink mix", quantity: "1 tub" },
          { item: "Electrolyte tablets", quantity: "1 tube" },
          { item: "Honey or maple syrup", quantity: "1 jar" },
          { item: "Dates", quantity: "1 lb" }
        ]
      }
    ]
  },

  "beginner-foundations": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Full Body A",
        focus: "Squat + push",
        exercises: [
          { name: "Goblet Squat", sets: "3 × 8" },
          { name: "DB Bench Press", sets: "3 × 8" },
          { name: "DB Row (each arm)", sets: "3 × 8" },
          { name: "Romanian Deadlift (light DB)", sets: "3 × 10" },
          { name: "Plank", sets: "3 × 20s" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Full Body B",
        focus: "Hinge + press",
        exercises: [
          { name: "Trap-bar Deadlift (light)", sets: "3 × 6" },
          { name: "Seated DB Shoulder Press", sets: "3 × 10" },
          { name: "Lat Pulldown", sets: "3 × 10" },
          { name: "Walking Lunge", sets: "3 × 8 per leg" },
          { name: "Dead Bug", sets: "3 × 8 per side" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Full Body C",
        focus: "Variety + conditioning",
        exercises: [
          { name: "Goblet Squat", sets: "3 × 10" },
          { name: "Push-up", sets: "3 × max-2" },
          { name: "Chest-supported Row", sets: "3 × 10" },
          { name: "Glute Bridge", sets: "3 × 12" },
          { name: "Brisk Walk", sets: "20 min" }
        ]
      }
    ],
    progression: [
      {
        phase: "Learn",
        weeks: "1-4",
        loadingScheme: "Same loads, focus on technique, finish 2-3 reps short",
        intensityCue: "RPE 6 — every rep clean"
      },
      {
        phase: "Apply",
        weeks: "5-8",
        loadingScheme: "Add 5 lb when all sets feel easy, otherwise repeat",
        intensityCue: "RPE 7 — controlled progression"
      },
      {
        phase: "Confirm",
        weeks: "9-12",
        loadingScheme: "Heavier sets at 8 reps, deload week 11, retest week 12",
        intensityCue: "RPE 8 on retest only"
      }
    ],
    warmup: HOME_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: [
      "Dumbbells (adjustable or pair set)",
      "Bench or sturdy surface",
      "Resistance band",
      "Yoga mat",
      "Pull-up bar (optional)"
    ],
    recipes: [REC_GREEK_OATS, REC_EGG_SCRAMBLE, REC_CHICKEN_RICE_BOWL, REC_SALMON_SWEET_POTATO, REC_COTTAGE_BERRIES, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "2 lb" },
          { item: "Salmon", quantity: "1 lb" },
          { item: "Eggs", quantity: "1 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Cottage cheese", quantity: "16 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Jasmine rice", quantity: "1 lb" },
          { item: "Whole-grain bread", quantity: "1 loaf" },
          { item: "Bananas", quantity: "6" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Mixed salad", quantity: "2 bags" },
          { item: "Broccoli", quantity: "1 lb" },
          { item: "Carrots", quantity: "1 lb" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Peanut butter", quantity: "1 jar" },
          { item: "Olive oil", quantity: "1 bottle" },
          { item: "Almonds", quantity: "8 oz" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Honey", quantity: "1 jar" },
          { item: "Basic spices", quantity: "as needed" }
        ]
      }
    ]
  },

  "womens-sculpt": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Glute Focus",
        focus: "Hip thrust + posterior chain",
        exercises: [
          { name: "Barbell Hip Thrust", sets: "4 × 10" },
          { name: "Bulgarian Split Squat", sets: "3 × 10 per leg" },
          { name: "Cable Kickback", sets: "3 × 12 per side" },
          { name: "Romanian Deadlift", sets: "3 × 10" },
          { name: "Banded Glute Bridge", sets: "3 × 15" },
          { name: "Plank", sets: "3 × 40s" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Upper Push & Pull",
        focus: "Balanced upper body",
        exercises: [
          { name: "DB Shoulder Press", sets: "4 × 10" },
          { name: "Lat Pulldown", sets: "4 × 10" },
          { name: "Incline DB Press", sets: "3 × 10" },
          { name: "Seated Cable Row", sets: "3 × 12" },
          { name: "Cable Lateral Raise", sets: "3 × 15" },
          { name: "Tricep Pushdown", sets: "3 × 12" }
        ]
      },
      {
        day: "Thu",
        sessionName: "Quad Focus",
        focus: "Squat + quad volume",
        exercises: [
          { name: "Goblet Squat", sets: "4 × 10" },
          { name: "Walking Lunge", sets: "3 × 12 per leg" },
          { name: "Leg Press", sets: "3 × 12" },
          { name: "Leg Extension", sets: "3 × 15" },
          { name: "Standing Calf Raise", sets: "4 × 15" },
          { name: "Hanging Leg Raise", sets: "3 × 10" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Glute + Cardio",
        focus: "Glute hypertrophy + steady-state",
        exercises: [
          { name: "Hip Thrust", sets: "4 × 8 (heavy)" },
          { name: "Single-leg RDL", sets: "3 × 10 per leg" },
          { name: "Cable Pull-through", sets: "3 × 12" },
          { name: "Stairmaster", sets: "20 min" }
        ]
      }
    ],
    progression: [
      {
        phase: "Activate",
        weeks: "1-4",
        loadingScheme: "Light loads, focus on mind-muscle on glutes",
        intensityCue: "RPE 7 — feel every rep in the target muscle"
      },
      {
        phase: "Build",
        weeks: "5-8",
        loadingScheme: "Add load to hip thrusts and RDLs weekly",
        intensityCue: "RPE 8 — push the hinges, ego-free"
      },
      {
        phase: "Define",
        weeks: "9-12",
        loadingScheme: "Add density blocks + supersets, +1 cardio session",
        intensityCue: "RPE 8-9 on heavy hip thrusts"
      }
    ],
    warmup: [
      "5 min easy walk or bike",
      "Glute bridge · 2 × 15 (band)",
      "Bird dog · 2 × 8 per side",
      "Hip 90/90 transitions · 8 per side",
      "Banded clamshell · 2 × 12 per side"
    ],
    cooldown: STD_COOLDOWN,
    equipment: [
      "Barbell + plates",
      "Hip thrust bench / box",
      "Dumbbells (light → heavy)",
      "Resistance bands (booty band set)",
      "Cable stack",
      "Stairmaster (optional)"
    ],
    recipes: [REC_GREEK_OATS, REC_EGG_SCRAMBLE, REC_TURKEY_LETTUCE_WRAPS, REC_SALMON_SWEET_POTATO, REC_COTTAGE_BERRIES, REC_PB_BANANA_SHAKE],
    groceryList: [
      {
        category: "Proteins",
        items: [
          { item: "Chicken breast", quantity: "3 lb" },
          { item: "Salmon", quantity: "1.5 lb" },
          { item: "Lean ground turkey", quantity: "1 lb" },
          { item: "Eggs", quantity: "1.5 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Cottage cheese", quantity: "16 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Sweet potatoes", quantity: "5 medium" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Quinoa", quantity: "1 lb" },
          { item: "Berries", quantity: "2 bags frozen" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Asparagus", quantity: "2 bunches" },
          { item: "Baby spinach", quantity: "2 bags" },
          { item: "Broccoli", quantity: "1 lb" },
          { item: "Roasted veg mix", quantity: "as needed" }
        ]
      },
      {
        category: "Healthy fats",
        items: [
          { item: "Avocado", quantity: "4" },
          { item: "Almonds", quantity: "8 oz" },
          { item: "Olive oil", quantity: "1 bottle" }
        ]
      },
      {
        category: "Iron & calcium support",
        items: [
          { item: "Lean red meat (sirloin or 93/7)", quantity: "1 lb" },
          { item: "Dark chocolate (70%+)", quantity: "1 bar" },
          { item: "Calcium-fortified almond milk", quantity: "1/2 gallon" }
        ]
      }
    ]
  },

  "senior-strength": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Full Body (Joint-friendly)",
        focus: "Machines + dumbbells, controlled tempo",
        exercises: [
          { name: "Leg Press", sets: "3 × 10", notes: "3-second eccentric" },
          { name: "Chest-supported Row", sets: "3 × 10" },
          { name: "Seated DB Press", sets: "3 × 10" },
          { name: "Goblet Squat", sets: "3 × 8" },
          { name: "Lat Pulldown", sets: "3 × 10" },
          { name: "Plank", sets: "3 × 20-30s" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Mobility + Strength",
        focus: "Posterior chain + balance",
        exercises: [
          { name: "Romanian Deadlift (light DB)", sets: "3 × 10" },
          { name: "Step-up (knee-friendly height)", sets: "3 × 8 per leg" },
          { name: "Single-leg Stance", sets: "3 × 30s per leg" },
          { name: "Cable Row", sets: "3 × 12" },
          { name: "Bird Dog", sets: "3 × 8 per side" },
          { name: "Hip Mobility Flow", sets: "5 min" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Full Body (Tempo)",
        focus: "Slow tempo for joint health",
        exercises: [
          { name: "Goblet Squat (slow)", sets: "3 × 10", notes: "4-1-2 tempo" },
          { name: "DB Bench Press", sets: "3 × 10" },
          { name: "Seated Row", sets: "3 × 12" },
          { name: "Glute Bridge", sets: "3 × 12" },
          { name: "Calf Raise", sets: "3 × 15" },
          { name: "Brisk Walk", sets: "15 min" }
        ]
      }
    ],
    progression: [
      {
        phase: "Mobilize",
        weeks: "1-4",
        loadingScheme: "Light loads, full ROM, log every set",
        intensityCue: "RPE 6-7 — never grind a rep"
      },
      {
        phase: "Strengthen",
        weeks: "5-8",
        loadingScheme: "Add 5 lb to lower body, 2.5 lb to upper when ROM stays clean",
        intensityCue: "RPE 7 — controlled tempo always"
      },
      {
        phase: "Sustain",
        weeks: "9-12",
        loadingScheme: "Hold loads, add a 4th set on key movements",
        intensityCue: "RPE 7 — build the long-term habit"
      }
    ],
    warmup: [
      "5 min easy bike or treadmill walk",
      "Hip circles · 8 per side, both directions",
      "Shoulder rolls · 10 per direction",
      "Cat-cow · 10 reps",
      "1 light warm-up set on each main movement"
    ],
    cooldown: [
      "5 min walk",
      "Standing hamstring stretch · 30s per leg",
      "Doorway pec stretch · 30s per side",
      "Neck stretches · 20s per direction"
    ],
    equipment: [
      "Leg press machine (gym)",
      "Cable stack with row attachment",
      "Adjustable bench",
      "Dumbbells (light → moderate)",
      "Resistance band",
      "Sturdy step or box"
    ],
    recipes: [REC_GREEK_OATS, REC_EGG_SCRAMBLE, REC_CHICKEN_RICE_BOWL, REC_SALMON_SWEET_POTATO, REC_COTTAGE_BERRIES, REC_TURKEY_LETTUCE_WRAPS],
    groceryList: [
      {
        category: "Proteins (spread across 4 meals)",
        items: [
          { item: "Chicken breast", quantity: "2.5 lb" },
          { item: "Salmon (omega-3)", quantity: "2 lb" },
          { item: "Eggs", quantity: "1.5 dozen" },
          { item: "Greek yogurt", quantity: "32 oz" },
          { item: "Cottage cheese", quantity: "24 oz" },
          { item: "Whey protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs",
        items: [
          { item: "Quinoa", quantity: "1 lb" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Sweet potatoes", quantity: "4" },
          { item: "Whole-grain bread", quantity: "1 loaf" },
          { item: "Berries (mixed)", quantity: "2 bags" }
        ]
      },
      {
        category: "Vegetables",
        items: [
          { item: "Leafy greens", quantity: "2 bags" },
          { item: "Broccoli", quantity: "1 lb" },
          { item: "Carrots", quantity: "1 lb" },
          { item: "Roasted root mix", quantity: "as needed" }
        ]
      },
      {
        category: "Healthy fats (vit D + omega-3)",
        items: [
          { item: "Walnuts", quantity: "8 oz" },
          { item: "Olive oil (extra virgin)", quantity: "1 bottle" },
          { item: "Avocado", quantity: "3" },
          { item: "Fish oil capsules", quantity: "1 bottle" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { item: "Vitamin D3 (2000 IU)", quantity: "1 bottle" },
          { item: "Honey", quantity: "1 small jar" },
          { item: "Basic spices", quantity: "as needed" }
        ]
      }
    ]
  },

  "cutting-peak": {
    weeklyTemplate: [
      {
        day: "Mon",
        sessionName: "Chest / Shoulders / Tri",
        focus: "Upper push hypertrophy",
        exercises: [
          { name: "Incline Smith Press", sets: "4 × 8" },
          { name: "Flat DB Press", sets: "4 × 10" },
          { name: "Cable Crossover", sets: "4 × 12", notes: "Drop set last" },
          { name: "Seated DB OHP", sets: "4 × 10" },
          { name: "Lateral Raise", sets: "5 × 15" },
          { name: "Rear Delt Fly", sets: "4 × 15" },
          { name: "Rope Pushdown", sets: "4 × 12", notes: "Drop last" },
          { name: "Steady-state Cardio", sets: "30 min post-lift" }
        ]
      },
      {
        day: "Tue",
        sessionName: "Back / Biceps",
        focus: "Back width + thickness",
        exercises: [
          { name: "Lat Pulldown (wide)", sets: "4 × 10" },
          { name: "Chest-supported Row", sets: "4 × 10" },
          { name: "Straight-arm Pulldown", sets: "3 × 12" },
          { name: "Cable Row (close grip)", sets: "3 × 12" },
          { name: "Face Pull", sets: "4 × 15" },
          { name: "Incline DB Curl", sets: "4 × 10" },
          { name: "Hammer Curl", sets: "3 × 12" }
        ]
      },
      {
        day: "Wed",
        sessionName: "Legs (Quad)",
        focus: "Quad volume + finisher",
        exercises: [
          { name: "Hack Squat", sets: "4 × 8" },
          { name: "Walking Lunge", sets: "3 × 12 per leg" },
          { name: "Leg Press (wide)", sets: "3 × 12" },
          { name: "Leg Extension", sets: "4 × 15", notes: "Drop last" },
          { name: "Standing Calf Raise", sets: "4 × 15" },
          { name: "Stairmaster", sets: "20 min" }
        ]
      },
      {
        day: "Thu",
        sessionName: "Shoulders / Arms",
        focus: "Detail work",
        exercises: [
          { name: "DB OHP", sets: "4 × 10" },
          { name: "Cable Lateral Raise", sets: "5 × 15" },
          { name: "EZ-bar Curl", sets: "4 × 10" },
          { name: "Cable Curl", sets: "3 × 12" },
          { name: "Skullcrusher", sets: "4 × 10" },
          { name: "Overhead Tri Extension", sets: "3 × 12" }
        ]
      },
      {
        day: "Fri",
        sessionName: "Legs (Posterior)",
        focus: "Glutes + hamstrings",
        exercises: [
          { name: "Romanian Deadlift", sets: "4 × 8" },
          { name: "Hip Thrust", sets: "4 × 10" },
          { name: "Hamstring Curl", sets: "4 × 12" },
          { name: "Cable Kickback", sets: "3 × 12 per side" },
          { name: "Standing Calf Raise", sets: "4 × 15" }
        ]
      },
      {
        day: "Sat",
        sessionName: "Conditioning + Posing",
        focus: "Steady-state + practice",
        exercises: [
          { name: "Incline Treadmill Walk", sets: "45 min @ 4-6% incline" },
          { name: "Posing Practice", sets: "20 min" }
        ]
      }
    ],
    progression: [
      {
        phase: "Lead-In",
        weeks: "1-4",
        loadingScheme: "Diet break first week, then -15% kcal, baseline lifts",
        intensityCue: "RPE 8 — preserve strength on mains"
      },
      {
        phase: "Strip",
        weeks: "5-8",
        loadingScheme: "-25% kcal, refeed every 7th day, +2 cardio sessions",
        intensityCue: "RPE 8 — lifts may dip 5%, conditioning rises"
      },
      {
        phase: "Peak",
        weeks: "9-12",
        loadingScheme: "Week 9-11 hold deficit, week 12 carb load + water cut protocol",
        intensityCue: "Volume drops week 12, posing rises"
      }
    ],
    warmup: GYM_WARMUP,
    cooldown: STD_COOLDOWN,
    equipment: FULL_GYM_EQUIPMENT,
    recipes: [REC_EGG_SCRAMBLE, REC_CHICKEN_RICE_BOWL, REC_TURKEY_LETTUCE_WRAPS, REC_SALMON_SWEET_POTATO, REC_COTTAGE_BERRIES, REC_GREEK_OATS],
    groceryList: [
      {
        category: "Proteins (priority)",
        items: [
          { item: "Chicken breast", quantity: "5 lb" },
          { item: "Tilapia / cod", quantity: "2 lb" },
          { item: "Lean sirloin", quantity: "1 lb" },
          { item: "Egg whites (carton)", quantity: "64 oz" },
          { item: "Whole eggs", quantity: "1 dozen" },
          { item: "Whey isolate", quantity: "1 tub" },
          { item: "Casein protein", quantity: "1 tub" }
        ]
      },
      {
        category: "Carbs (tracked)",
        items: [
          { item: "Jasmine rice", quantity: "2 lb" },
          { item: "Sweet potatoes", quantity: "4 medium" },
          { item: "Rolled oats", quantity: "18 oz" },
          { item: "Rice cakes", quantity: "1 pack" }
        ]
      },
      {
        category: "Vegetables (volume)",
        items: [
          { item: "Asparagus", quantity: "3 bunches" },
          { item: "Broccoli", quantity: "3 lb" },
          { item: "Mixed greens", quantity: "3 bags" },
          { item: "Cucumber", quantity: "4" },
          { item: "Bell peppers", quantity: "5" }
        ]
      },
      {
        category: "Healthy fats (minimal)",
        items: [
          { item: "Avocado", quantity: "2" },
          { item: "Almonds", quantity: "4 oz" },
          { item: "Olive oil spray", quantity: "1 can" },
          { item: "Chia seeds", quantity: "8 oz" }
        ]
      },
      {
        category: "Peak-week supplies",
        items: [
          { item: "Distilled water (peak week)", quantity: "3 gallons" },
          { item: "Sugar-free electrolytes", quantity: "1 box" },
          { item: "Pink Himalayan salt", quantity: "1 small jar" },
          { item: "Black coffee", quantity: "1 bag" }
        ]
      }
    ]
  }
};

/* ─── Audience layer ───────────────────────────────────────────────────
 * Difficulty, setting, fit, and FAQ per bundle — derived from the actual
 * programming above (sessions per week, equipment, exercise complexity,
 * diet aggressiveness). Merged into Bundle by getBundle() like content.
 */

export type BundleAudience = {
  difficulty: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: "beginner" | "intermediate" | "advanced";
  setting: "gym" | "home" | "hybrid";
  whoFor: string[];
  whoNotFor: string[];
  faq: Array<{ q: string; a: string }>;
};

export const BUNDLE_AUDIENCE: Record<string, BundleAudience> = {
  "fat-loss": {
    difficulty: 3,
    difficultyLabel: "intermediate",
    setting: "gym",
    whoFor: [
      "Lifters who want to cut without losing muscle",
      "People with gym access five days a week",
      "Anyone already comfortable with barbell basics"
    ],
    whoNotFor: [
      "Complete beginners — start with Beginner Foundations",
      "Home-only training — see the Home Starter Bundle"
    ],
    faq: [
      {
        q: "How many days a week do I train?",
        a: "Five: push, pull, and legs sessions, then a push/conditioning day and a posterior-chain day. Every session is written out in the weekly template."
      },
      {
        q: "Do I need a full gym?",
        a: "Yes. The plan uses a barbell, rack, dumbbells, a cable stack, and a pull-up bar."
      },
      {
        q: "What does the diet look like?",
        a: "A clean cut about 15% below maintenance at 1.0 g protein per lb, with two refeed weeks, six recipes, and a categorized grocery list."
      },
      {
        q: "Is this bundle really free?",
        a: "Yes. The full 12-week PDF dossier is free to download."
      }
    ]
  },

  "lean-bulk": {
    difficulty: 3,
    difficultyLabel: "intermediate",
    setting: "gym",
    whoFor: [
      "Lifters who want to add muscle with minimal fat",
      "People who can train five days a week",
      "Anyone comfortable with heavy compound lifts"
    ],
    whoNotFor: [
      "Anyone whose first priority is losing fat",
      "New lifters still learning the main barbell lifts"
    ],
    faq: [
      {
        q: "What split does it use?",
        a: "A five-day push/pull/legs structure: two push days, two pull-and-posterior days, and a quad-focused leg day."
      },
      {
        q: "How big is the calorie surplus?",
        a: "About 10% above maintenance, targeting 0.5-1 lb of gain per week, re-baselined every four weeks."
      },
      {
        q: "What equipment do I need?",
        a: "A full gym: barbell and plates, rack and bench, dumbbells, cable stack, and a pull-up bar."
      },
      {
        q: "Is this bundle really free?",
        a: "Yes. The full 12-week PDF dossier is free to download."
      }
    ]
  },

  "home-starter": {
    difficulty: 1,
    difficultyLabel: "beginner",
    setting: "home",
    whoFor: [
      "People starting their first structured plan",
      "Anyone training at home with no equipment",
      "Busy schedules — four short sessions a week"
    ],
    whoNotFor: [
      "Experienced lifters who want heavy barbell work",
      "Anyone who prefers training in a gym"
    ],
    faq: [
      {
        q: "Do I need any equipment?",
        a: "No weights. A mat, a sturdy chair or table, and a filled water bottle cover it; a doorway pull-up bar and band are optional."
      },
      {
        q: "What does a week look like?",
        a: "Three full-body bodyweight sessions plus one active-recovery day of walking and mobility."
      },
      {
        q: "Do I have to count calories?",
        a: "Not at first. The diet uses plate-based portions — no weighing required for the first four weeks."
      },
      {
        q: "How does it get harder over 12 weeks?",
        a: "Reps and tempo increase in weeks 5-8, then a fourth circuit round and unilateral variants arrive in weeks 9-12."
      }
    ]
  },

  definition: {
    difficulty: 4,
    difficultyLabel: "advanced",
    setting: "gym",
    whoFor: [
      "Lifters who already have muscle and want to see it",
      "People used to tracking macros",
      "Anyone who can commit to five gym days a week"
    ],
    whoNotFor: [
      "New lifters — the deficit and volume are aggressive",
      "Anyone unwilling to track food"
    ],
    faq: [
      {
        q: "How aggressive is the cut?",
        a: "About 20% below maintenance at 1.2 g protein per lb, with a weekly refeed day and carbs placed around training."
      },
      {
        q: "How much cardio is there?",
        a: "Steady-state blocks are built into two sessions (Zone 2 and Stairmaster); phase two adds one more cardio block."
      },
      {
        q: "What intensity techniques does it use?",
        a: "Drop sets from phase two onward, and supersets on arms and delts in the final phase."
      },
      {
        q: "What equipment do I need?",
        a: "A full gym with barbell, dumbbells, machines, and a cable stack."
      }
    ]
  },

  recomp: {
    difficulty: 4,
    difficultyLabel: "advanced",
    setting: "gym",
    whoFor: [
      "Lifters who want to gain muscle and lose fat slowly",
      "People willing to log every set and meal",
      "Anyone training five days a week at maintenance calories"
    ],
    whoNotFor: [
      "Anyone who wants fast visible results",
      "People not ready to track food consistently"
    ],
    faq: [
      {
        q: "How do the calories work?",
        a: "You eat at maintenance with carb cycling — higher carbs on lifting days, moderate on rest days — after calibrating your true maintenance in weeks 1-4."
      },
      {
        q: "What is the training split?",
        a: "Upper and lower strength days, upper and lower hypertrophy days, plus one Zone 2 conditioning and core day."
      },
      {
        q: "Why is recomp called the hardest plan?",
        a: "Progress is slower and depends on precision: strength must climb at maintenance calories, and weeks 9-11 run a small mini-cut before a retest."
      },
      {
        q: "What equipment do I need?",
        a: "A full gym: barbell, rack, dumbbells, machines, and a cable stack."
      }
    ]
  },

  powerbuilding: {
    difficulty: 4,
    difficultyLabel: "advanced",
    setting: "gym",
    whoFor: [
      "Lifters who want strength on the big four plus size",
      "People who prefer four focused sessions a week",
      "Anyone with access to a barbell and rack"
    ],
    whoNotFor: [
      "Beginners still learning squat, bench, and deadlift",
      "Home training without a barbell"
    ],
    faq: [
      {
        q: "How is the week organized?",
        a: "Four days, one per main lift: squat, bench, deadlift, and overhead press, each followed by hypertrophy accessories."
      },
      {
        q: "How does the strength progression work?",
        a: "5×5 at 70% in weeks 1-4, 5×5 at 80% in weeks 5-8, then triples and doubles up to 90% with heavy singles in week 12."
      },
      {
        q: "What does the diet look like?",
        a: "A slight surplus of about 5% above maintenance at 1.0 g protein per lb, with pre-workout carbs prioritized."
      }
    ]
  },

  calisthenics: {
    difficulty: 4,
    difficultyLabel: "advanced",
    setting: "hybrid",
    whoFor: [
      "People with solid pull-ups chasing the muscle-up",
      "Anyone who trains at a park, at home, or in a gym",
      "Lifters who value skill work as much as strength"
    ],
    whoNotFor: [
      "Anyone who cannot yet do strict pull-ups and dips",
      "People whose main goal is maximum muscle mass"
    ],
    faq: [
      {
        q: "Do I need a gym?",
        a: "No. A pull-up bar, parallel bars or sturdy chairs, resistance bands, and wall space cover it; rings are optional."
      },
      {
        q: "Which skills does it build toward?",
        a: "Muscle-up transitions, freestanding handstand work, and pistol squat progressions across three four-week phases."
      },
      {
        q: "How many sessions per week?",
        a: "Four: pull/push skill, push/core, lower/explosive, and a dedicated skill-practice day."
      },
      {
        q: "What does the diet look like?",
        a: "Maintenance calories at 0.9 g protein per lb — staying light matters for bodyweight skills."
      }
    ]
  },

  "athlete-conditioning": {
    difficulty: 3,
    difficultyLabel: "intermediate",
    setting: "hybrid",
    whoFor: [
      "In-season athletes who need engine and work capacity",
      "Runners and mixed-modal athletes",
      "Anyone who wants to keep strength while conditioning climbs"
    ],
    whoNotFor: [
      "People whose main goal is muscle size",
      "Anyone who cannot fit five sessions a week"
    ],
    faq: [
      {
        q: "What does a training week contain?",
        a: "Two Zone 2 aerobic days, one threshold interval day, one sprint and power day, and one strength maintenance day."
      },
      {
        q: "What equipment do I need?",
        a: "Running shoes, a bike or rower, a barbell for the strength day, a med ball, and ideally a HR monitor."
      },
      {
        q: "How is the diet different?",
        a: "Carb-forward fueling that scales with training load, at or slightly above maintenance, with a hydration plan included."
      }
    ]
  },

  "beginner-foundations": {
    difficulty: 1,
    difficultyLabel: "beginner",
    setting: "gym",
    whoFor: [
      "People who have never lifted seriously before",
      "Anyone who can train three days a week",
      "Those who want technique before load"
    ],
    whoNotFor: [
      "Experienced lifters — the loads start light on purpose",
      "Home-only training — see the Home Starter Bundle"
    ],
    faq: [
      {
        q: "Is three days a week enough?",
        a: "Yes for a first cycle. Three full-body sessions cover squat, hinge, push, pull, and core, with load added from week five when sets feel easy."
      },
      {
        q: "Do I have to track calories?",
        a: "No. The nutrition system uses a plate-based portion guide with no weighing or logging required."
      },
      {
        q: "What equipment do I need?",
        a: "Dumbbells, a bench, and basic gym machines like the lat pulldown; a pull-up bar is optional."
      },
      {
        q: "What happens after week 12?",
        a: "Week 11 is a deload and week 12 retests your lifts, so you finish with measured strength gains and a base for any other bundle."
      }
    ]
  },

  "womens-sculpt": {
    difficulty: 3,
    difficultyLabel: "intermediate",
    setting: "gym",
    whoFor: [
      "Women who want a glute and lower-body emphasis",
      "Lifters who still want balanced upper-body work",
      "Anyone who can train four days a week in a gym"
    ],
    whoNotFor: [
      "Home-only training — the plan leans on barbell and cables",
      "Anyone chasing a hard calorie deficit — this runs at maintenance"
    ],
    faq: [
      {
        q: "How is the week split?",
        a: "Two glute-focused lower days, one balanced upper day, and one quad-focused day, with cardio attached to the Saturday session."
      },
      {
        q: "What does the nutrition look like?",
        a: "Maintenance calories with a slight surplus on lifting days, 0.9 g protein per lb, and iron, calcium, and cycle-aware notes included."
      },
      {
        q: "What equipment do I need?",
        a: "Barbell and plates, a hip thrust bench or box, dumbbells, bands, and a cable stack; the Stairmaster is optional."
      }
    ]
  },

  "senior-strength": {
    difficulty: 2,
    difficultyLabel: "beginner",
    setting: "gym",
    whoFor: [
      "Lifters 50+ who want joint-friendly strength",
      "Anyone returning to training after time away",
      "People who prefer machines and dumbbells to barbells"
    ],
    whoNotFor: ["Lifters chasing heavy barbell maxes"],
    faq: [
      {
        q: "Is it barbell-heavy?",
        a: "No. Sessions are built on machines, cables, and dumbbells with controlled tempos; there are no barbell lifts."
      },
      {
        q: "Is mobility included?",
        a: "Yes. Mobility and balance work sit inside every session, plus a dedicated mobility-and-strength day each week."
      },
      {
        q: "How many days a week?",
        a: "Three full-body sessions, each with a joint-friendly warm-up and cool-down written out."
      },
      {
        q: "What does the diet emphasize?",
        a: "Protein spread across four meals at 1.0 g per lb, with vitamin D and omega-3 sources on the grocery list."
      }
    ]
  },

  "cutting-peak": {
    difficulty: 5,
    difficultyLabel: "advanced",
    setting: "gym",
    whoFor: [
      "Experienced lifters with a real muscle base",
      "Anyone who wants a contest-style finish",
      "People who can commit to six training days plus cardio"
    ],
    whoNotFor: [
      "Beginners — the deficit and volume are the most aggressive on TJFit",
      "Anyone unwilling to track macros strictly for 12 weeks"
    ],
    faq: [
      {
        q: "How aggressive is the diet?",
        a: "Up to 25% below maintenance at 1.3 g protein per lb, with weekly refeeds and a diet break in week one."
      },
      {
        q: "What is peak week?",
        a: "Week 12: a written carb-load and water-manipulation protocol with reduced training volume and extra posing practice."
      },
      {
        q: "How much training is there?",
        a: "Six days a week — five lifting sessions with drop sets, plus a conditioning and posing day, with cardio added through the middle phase."
      },
      {
        q: "Who should not run this?",
        a: "Anyone new to lifting or dieting. The plan itself says it: not for beginners."
      }
    ]
  }
};
