export type Goal = "fat loss" | "muscle" | "rehab" | "sports";

export type RankTier = "Bronze" | "Silver" | "Gold" | "Elite";

export type Coach = {
  slug: string;
  name: string;
  specialty: string;
  goals: Goal[];
  experienceLevels: string[];
  trainingLocations: string[];
  languages: string[];
  rating: number;
  price: number;
  country: string;
  certifications: string[];
  availability: string;
  availabilityScore: number;
  successRate: number;
  retentionRate: number;
  clientSuccessRate: number;
  conversionRate: number;
  monthlyEarnings: number;
  points: number;
  rank: RankTier;
  businessBoosts: string[];
  affiliateCode: string;
  referralCommissionRate: number;
  bio: string;
  results: string[];
  programs: string[];
};

export type ProgramAsset = {
  type: "exercise-video" | "workout-schedule" | "pdf-guide" | "nutrition-plan";
  label: string;
};

export type Program = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  price: number;
  description: string;
  coachSlug: string;
  requiredEquipment: string[];
  previewImages: string[];
  assets: ProgramAsset[];
  coachCommissionRate: number;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  recommendedFor: string[];
  coachCommissionRate: number;
};

export type Transformation = {
  slug: string;
  userName: string;
  coachSlug: string;
  category: "fat loss" | "muscle gain" | "athletic improvement" | "recovery";
  startingWeight: number;
  currentWeight: number;
  strengthStat: string;
  measurements: string[];
  votes: number;
  verified: boolean;
  story: string;
  timeline: { week: string; update: string }[];
};

export type Challenge = {
  slug: string;
  name: string;
  duration: string;
  reward: string;
  participants: number;
  category: string;
  description: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  role: "user" | "coach";
  content: string;
  likes: number;
  comments: number;
  coachReply?: string;
};

export type LiveSession = {
  id: string;
  title: string;
  coachSlug: string;
  schedule: string;
  capacity: number;
  spotsLeft: number;
  type: "group live session";
};

export type WalletTransaction = {
  id: string;
  type: "reward" | "refund" | "payment";
  label: string;
  amount: number;
};

export type MembershipPlan = {
  name: string;
  monthlyPrice: number;
  benefits: string[];
};

export const coachCategories = [
  "Fitness",
  "Bodybuilding",
  "Fat loss",
  "Speed / vertical jump",
  "Martial arts",
  "Nutrition",
  "Physiotherapy",
  "Rehabilitation"
];

export const coaches: Coach[] = [];

export const programs: Program[] = [
  {
    slug: "home-fat-burn-accelerator-12w",
    title: "Home Fat Burn Accelerator (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A progressive 12-week bodyweight fat loss system with cardio progression, HIIT phases, and clear weekly structure.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Foundation", "Week 7 HIIT Progression", "Week 12 Peak Structure"],
    assets: [
      { type: "workout-schedule", label: "12-week day-by-day workout schedule" },
      { type: "exercise-video", label: "Movement form and pacing guide" },
      { type: "pdf-guide", label: "Execution and recovery handbook" },
      { type: "nutrition-plan", label: "Fat-loss meal timing support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "bodyweight-shred-system-12w",
    title: "Bodyweight Shred System (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week bodyweight strength and cardio system built to reduce fat while improving muscle tone and conditioning.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Strength and Cardio Split", "Week 5 Superset Phase", "Week 12 Peak Week"],
    assets: [
      { type: "workout-schedule", label: "12-week strength and cardio schedule" },
      { type: "exercise-video", label: "Form standards for core bodyweight lifts" },
      { type: "pdf-guide", label: "Progression and pacing playbook" },
      { type: "nutrition-plan", label: "Fat-loss nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "home-cardio-melt-12w",
    title: "12-Week Home Cardio Melt",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A cardio-dominant 12-week plan focused on maximum calorie burn, endurance progression, and low-strength home conditioning.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Steady Cardio Base", "HIIT and Tabata Phase", "Peak Endurance Week"],
    assets: [
      { type: "workout-schedule", label: "12-week cardio-dominant schedule" },
      { type: "exercise-video", label: "Cardio form and breathing control guide" },
      { type: "pdf-guide", label: "Interval pacing and progression handbook" },
      { type: "nutrition-plan", label: "Endurance and fat-loss nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "lean-at-home-program-12w",
    title: "Lean at Home Program (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week cardio and bodyweight sculpting system to reduce fat and build a lean, toned physique at home.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Full Body Tone Base", "Week 5 Shaping Phase", "Week 12 Peak Sculpt"],
    assets: [
      { type: "workout-schedule", label: "12-week lean sculpting schedule" },
      { type: "exercise-video", label: "Technique guide for shaping movements" },
      { type: "pdf-guide", label: "Progression and execution handbook" },
      { type: "nutrition-plan", label: "Lean physique nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "sweat-and-burn-blueprint-12w",
    title: "Sweat & Burn Blueprint (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A short-session 12-week system designed to build a daily fat-burn habit and drive steady weight loss through consistent home training.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Short Burn Habit Phase", "Daily Upgrade Progression", "Peak Habit Week"],
    assets: [
      { type: "workout-schedule", label: "12-week short-session training schedule" },
      { type: "exercise-video", label: "Form guide for daily bodyweight drills" },
      { type: "pdf-guide", label: "Habit-building and progression handbook" },
      { type: "nutrition-plan", label: "Steady fat-loss nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "home-muscle-builder-12w",
    title: "Home Muscle Builder (12 Weeks)",
    category: "Strength",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week bodyweight muscle-building plan focused on slow reps, controlled tempo, and progressive volume.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Upper and Lower Split Base", "Slow Tempo Progression", "Peak Volume Week"],
    assets: [
      { type: "workout-schedule", label: "12-week bodyweight muscle schedule" },
      { type: "exercise-video", label: "Controlled tempo and form execution guide" },
      { type: "pdf-guide", label: "Volume progression and recovery playbook" },
      { type: "nutrition-plan", label: "Lean muscle support nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "bodyweight-mass-plan-12w",
    title: "Bodyweight Mass Plan (12 Weeks)",
    category: "Strength",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week high-volume bodyweight plan focused on near-failure sets and progressive overload to maximize muscle gain.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Chest and Legs Volume Split", "Failure Focus Block", "Peak Volume Week"],
    assets: [
      { type: "workout-schedule", label: "12-week bodyweight mass schedule" },
      { type: "exercise-video", label: "Near-failure form and tempo guide" },
      { type: "pdf-guide", label: "Volume progression and effort strategy handbook" },
      { type: "nutrition-plan", label: "Mass-building nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "home-strength-gain-12w",
    title: "12-Week Home Strength Gain",
    category: "Strength",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week bodyweight strength program built around slow tempo reps, pause holds, and high-control progression.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Tempo Strength Foundation", "Pause Phase Progression", "Peak Strength Week"],
    assets: [
      { type: "workout-schedule", label: "12-week home strength schedule" },
      { type: "exercise-video", label: "Tempo, pause, and control execution guide" },
      { type: "pdf-guide", label: "Strength progression and effort strategy handbook" },
      { type: "nutrition-plan", label: "Strength support nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "calisthenics-growth-system-12w",
    title: "Calisthenics Growth System (12 Weeks)",
    category: "Strength",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week strength and skill progression plan to build muscle and improve calisthenics control using bodyweight only.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Push and Control Foundation", "Skill Intro Phase", "Peak Calisthenics Week"],
    assets: [
      { type: "workout-schedule", label: "12-week calisthenics growth schedule" },
      { type: "exercise-video", label: "Skill mechanics and control guide" },
      { type: "pdf-guide", label: "Strength and skill progression handbook" },
      { type: "nutrition-plan", label: "Muscle and recovery nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "lean-muscle-home-program-12w",
    title: "Lean Muscle Home Program (12 Weeks)",
    category: "Strength",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week lean muscle bodyweight system focused on symmetry, moderate-rep volume, and high-quality execution.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Upper and Lower Shape Base", "Aesthetic Volume Block", "Peak Aesthetic Week"],
    assets: [
      { type: "workout-schedule", label: "12-week lean muscle schedule" },
      { type: "exercise-video", label: "Symmetry and tempo execution guide" },
      { type: "pdf-guide", label: "Aesthetic progression and form handbook" },
      { type: "nutrition-plan", label: "Lean growth nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "gym-fat-loss-protocol-12w",
    title: "Gym Fat Loss Protocol (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week gym fat-loss system combining resistance training and cardio progression to reduce fat while preserving muscle.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Weights and Cardio Base", "Superset Fat Burn Phase", "Peak Cut Week"],
    assets: [
      { type: "workout-schedule", label: "12-week gym fat-loss schedule" },
      { type: "exercise-video", label: "Gym movement mechanics and pacing guide" },
      { type: "pdf-guide", label: "Cardio and lifting progression handbook" },
      { type: "nutrition-plan", label: "Fat-loss with muscle-retention nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "shred-and-sweat-gym-plan-12w",
    title: "Shred & Sweat Gym Plan (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week high-density gym shredding plan using supersets, circuits, and cardio progression for rapid fat loss and conditioning.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Circuit Foundation Phase", "Superset Density Block", "Peak Sweat Week"],
    assets: [
      { type: "workout-schedule", label: "12-week shred and sweat gym schedule" },
      { type: "exercise-video", label: "Circuit pacing and superset execution guide" },
      { type: "pdf-guide", label: "Conditioning and density progression handbook" },
      { type: "nutrition-plan", label: "Cutting and conditioning nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "cutting-system-gym-12w",
    title: "12-Week Cutting System (Gym)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A structured 12-week gym cutting protocol focused on fat loss, muscle retention, and progressive conditioning.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Structured Split Base", "Cut Phase Superset Block", "Peak Cut Week"],
    assets: [
      { type: "workout-schedule", label: "12-week gym cutting schedule" },
      { type: "exercise-video", label: "Lifting form and cardio pacing guide" },
      { type: "pdf-guide", label: "Cutting progression and recovery handbook" },
      { type: "nutrition-plan", label: "Lean-cut nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "lean-machine-program-12w",
    title: "Lean Machine Program (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week gym shaping system built to reduce fat and develop a lean, aesthetic physique with structured volume.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Shaping Split Foundation", "Superset Shaping Block", "Peak Aesthetic Conditioning"],
    assets: [
      { type: "workout-schedule", label: "12-week lean machine schedule" },
      { type: "exercise-video", label: "Gym shaping form and tempo guide" },
      { type: "pdf-guide", label: "Aesthetic progression and conditioning handbook" },
      { type: "nutrition-plan", label: "Lean physique nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "high-intensity-fat-burn-12w",
    title: "High Intensity Fat Burn (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week extreme gym conditioning protocol using HIIT, dense circuits, and minimal rest for maximum fat loss.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Circuit and HIIT Base", "High Burn Superset Phase", "Peak Intensity Week"],
    assets: [
      { type: "workout-schedule", label: "12-week high-intensity fat-burn schedule" },
      { type: "exercise-video", label: "High-density form and pacing guide" },
      { type: "pdf-guide", label: "HIIT progression and recovery handbook" },
      { type: "nutrition-plan", label: "Aggressive cut nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "gym-mass-builder-12w",
    title: "Gym Mass Builder (12 Weeks)",
    category: "Strength",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week gym mass-building system focused on heavy compounds, hypertrophy progression, and controlled high-volume growth.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Compound Strength Base", "Growth Phase Progression", "Peak Bulk Week"],
    assets: [
      { type: "workout-schedule", label: "12-week gym mass-building schedule" },
      { type: "exercise-video", label: "Heavy lifting mechanics and control guide" },
      { type: "pdf-guide", label: "Hypertrophy and strength progression handbook" },
      { type: "nutrition-plan", label: "Mass gain nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "hypertrophy-system-12w",
    title: "12-Week Hypertrophy System",
    category: "Strength",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A high-volume 12-week hypertrophy program designed for maximum muscle fullness, pump, and growth.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Pump Foundation Split", "High-Volume Pump Phase", "Peak Pump Week"],
    assets: [
      { type: "workout-schedule", label: "12-week hypertrophy pump schedule" },
      { type: "exercise-video", label: "Hypertrophy form and tempo control guide" },
      { type: "pdf-guide", label: "Volume progression and pump strategy handbook" },
      { type: "nutrition-plan", label: "Muscle fullness nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "strength-and-size-blueprint-12w",
    title: "Strength & Size Blueprint (12 Weeks)",
    category: "Strength",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week gym blueprint combining heavy compound strength work with hypertrophy volume for size gains.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Strength and Size Foundation", "Heavy Strength Push Phase", "Peak Strength and Size Week"],
    assets: [
      { type: "workout-schedule", label: "12-week strength and size schedule" },
      { type: "exercise-video", label: "Heavy lifting form and control guide" },
      { type: "pdf-guide", label: "Strength and hypertrophy progression handbook" },
      { type: "nutrition-plan", label: "Strength and mass nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "aesthetic-muscle-plan-12w",
    title: "Aesthetic Muscle Plan (12 Weeks)",
    category: "Strength",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 400,
    description:
      "A 12-week gym aesthetics program focused on balanced symmetry, detail work, and high-quality hypertrophy volume.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Aesthetic Foundation Split", "Detail Phase Progression", "Peak Physique Week"],
    assets: [
      { type: "workout-schedule", label: "12-week aesthetic muscle schedule" },
      { type: "exercise-video", label: "Symmetry-focused form and tempo guide" },
      { type: "pdf-guide", label: "Aesthetic detail and volume progression handbook" },
      { type: "nutrition-plan", label: "Lean muscle aesthetics nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "keto-shred-diet-12w",
    title: "Keto Shred Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A structured 12-week keto shredding nutrition plan focused on fat loss, muscle retention, and sustainable meal discipline.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Recipe Foundation", "Keto Adaptation Timeline", "12-Week Lean Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week keto meal and macro protocol" },
      { type: "pdf-guide", label: "Recipe execution and prep handbook" },
      { type: "workout-schedule", label: "Training and meal timing alignment notes" },
      { type: "exercise-video", label: "Optional activity and recovery guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "gut-health-fat-loss-diet-12w",
    title: "Gut Health Fat Loss Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A 12-week gut-focused fat-loss nutrition plan built to improve digestion, reduce bloating, and drive steady body-fat reduction.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Digestion Foundation", "Bloat Reduction Protocol", "Lean and Healthy Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week gut-health fat-loss meal protocol" },
      { type: "pdf-guide", label: "Digestive support recipe and prep handbook" },
      { type: "workout-schedule", label: "Meal timing and activity alignment notes" },
      { type: "exercise-video", label: "Optional low-stress cardio guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "student-fat-loss-diet-12w",
    title: "Student Fat Loss Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A budget-focused 12-week fat-loss plan using low-cost staples while keeping protein high enough for sustainable results.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Budget Meal Foundation", "Low-Cost Fat-Loss System", "12-Week Student Cut Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week budget fat-loss meal protocol" },
      { type: "pdf-guide", label: "Cheap meal prep and consistency handbook" },
      { type: "workout-schedule", label: "Simple training and meal timing notes" },
      { type: "exercise-video", label: "No-cost movement and routine guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "lean-bulk-diet-12w",
    title: "Lean Bulk Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A 12-week lean bulk nutrition system for muscle gain with controlled fat gain, high protein intake, and performance-focused carbs.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Lean Bulk Base", "Performance Nutrition Progression", "Lean Growth Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week lean bulk meal and macro protocol" },
      { type: "pdf-guide", label: "Bulk recipe execution and prep handbook" },
      { type: "workout-schedule", label: "Meal timing for gym performance notes" },
      { type: "exercise-video", label: "Optional training support guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "clean-cutting-diet-12w",
    title: "Clean Cutting Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A 12-week clean cutting nutrition plan designed to reduce fat, preserve muscle, and build a lean defined physique.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Clean Cut Base", "High-Protein Retention Protocol", "12-Week Defined Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week clean cutting meal and macro protocol" },
      { type: "pdf-guide", label: "Lean meal prep and execution handbook" },
      { type: "workout-schedule", label: "Cutting meal timing and training notes" },
      { type: "exercise-video", label: "Optional activity and recovery support guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "hard-cut-athlete-diet-12w",
    title: "Hard Cut Athlete Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "An aggressive 12-week athlete cutting nutrition system for low body-fat outcomes while preserving muscle with high protein.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Athlete Cut Base", "Aggressive Deficit Protocol", "Peak Athletic Definition"],
    assets: [
      { type: "nutrition-plan", label: "12-week hard cut athlete meal and macro protocol" },
      { type: "pdf-guide", label: "Aggressive cut execution and prep handbook" },
      { type: "workout-schedule", label: "Training fuel timing and fatigue-management notes" },
      { type: "exercise-video", label: "Optional conditioning and recovery support guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "high-calorie-mass-diet-12w",
    title: "High Calorie Mass Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A high-calorie 12-week mass-gain nutrition system built for fast weight gain, maximum muscle growth, and strength progression.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Mass Foundation", "High-Calorie Growth Protocol", "12-Week Size Increase Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week high-calorie mass meal and macro protocol" },
      { type: "pdf-guide", label: "Mass meal prep and execution handbook" },
      { type: "workout-schedule", label: "Training fuel timing and surplus management notes" },
      { type: "exercise-video", label: "Optional performance and recovery guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "muscle-gain-athlete-diet-12w",
    title: "Muscle Gain Athlete Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A performance-focused 12-week athlete nutrition plan built to grow lean muscle, improve output, and support recovery.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Athlete Fuel Base", "Performance Lean Gain Protocol", "12-Week Athletic Growth Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week athlete muscle-gain meal and macro protocol" },
      { type: "pdf-guide", label: "Performance nutrition prep and execution handbook" },
      { type: "workout-schedule", label: "Fuel timing and training-performance alignment notes" },
      { type: "exercise-video", label: "Optional recovery and conditioning support guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "student-bulk-diet-12w",
    title: "Student Bulk Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A budget-friendly 12-week bulk nutrition plan designed to gain muscle and size using simple low-cost foods.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Budget Bulk Base", "Low-Cost Surplus Protocol", "12-Week Student Size Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week student bulk meal and macro protocol" },
      { type: "pdf-guide", label: "Budget bulk prep and execution handbook" },
      { type: "workout-schedule", label: "Cheap fuel timing and consistency notes" },
      { type: "exercise-video", label: "Optional training and recovery support guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "clean-weight-gain-diet-12w",
    title: "Clean Weight Gain Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Advanced",
    duration: "12 weeks",
    price: 350,
    description:
      "A clean 12-week weight-gain nutrition system to build muscle with minimal fat gain and strong performance support.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Clean Gain Base", "Controlled Surplus Protocol", "12-Week Aesthetic Growth Outcome"],
    assets: [
      { type: "nutrition-plan", label: "12-week clean weight-gain meal and macro protocol" },
      { type: "pdf-guide", label: "Clean bulk prep and execution handbook" },
      { type: "workout-schedule", label: "Performance fuel timing and lean-gain notes" },
      { type: "exercise-video", label: "Optional recovery and conditioning support guidance" }
    ],
    coachCommissionRate: 0
  }
];

export const products: Product[] = [];

export const testimonials: { name: string; quote: string }[] = [];

export const liveActivity: string[] = [];

export const rankingTiers = [
  { name: "Bronze", detail: "New coach, strong onboarding and first reviews." },
  { name: "Silver", detail: "Consistent quality with repeat clients." },
  { name: "Gold", detail: "High retention, high ratings, priority visibility." },
  { name: "Elite", detail: "Best conversion, premium trust, top placement." }
];

export const transformations: Transformation[] = [];

export const transformationLeaderboards: { category: string; leader: string; score: string }[] = [];

export const communityPosts: CommunityPost[] = [];

export const challenges: Challenge[] = [];

export const liveSessions: LiveSession[] = [];

export const walletTransactions: WalletTransaction[] = [];

export const membershipPlans: MembershipPlan[] = [
  {
    name: "Premium Membership",
    monthlyPrice: 399,
    benefits: ["Lower session fees", "Exclusive programs", "Challenge entry", "Priority booking"]
  }
];

export const coachBoostOptions = [
  { name: "Featured coach", price: "1,500 TRY / week", benefit: "Highlighted in discovery results" },
  { name: "Top search placement", price: "2,200 TRY / week", benefit: "Pinned near the top of smart discovery" },
  { name: "Homepage spotlight", price: "3,500 TRY / week", benefit: "Premium homepage placement" }
];

export const dashboardStats = [
  { label: "Upcoming sessions", value: "0" },
  { label: "Active programs", value: "0" },
  { label: "Training videos uploaded", value: "0" },
  { label: "Referral credit", value: "0 TRY" }
];

export const coachDashboardStats = [
  { label: "Bookings this week", value: "0" },
  { label: "Client retention", value: "0%" },
  { label: "Earnings this month", value: "0 TRY" },
  { label: "Referral code uses", value: "0" }
];

export const adminStats = [
  { label: "Pending coach approvals", value: "0" },
  { label: "Gross volume", value: "0 TRY" },
  { label: "Refund requests", value: "0" },
  { label: "Conversion rate", value: "0%" }
];

export const adminAdvancedStats = [
  { label: "Total users", value: "0" },
  { label: "Active coaches", value: "0" },
  { label: "Top program", value: "—" },
  { label: "Membership MRR", value: "0 TRY" },
  { label: "Wallet credits issued", value: "0 TRY" },
  { label: "Challenge participation", value: "0 users" }
];

export const liveProofNotifications: string[] = [];
