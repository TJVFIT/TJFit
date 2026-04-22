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
  /** When true, catalog item is free after sign-in; stored in DB via program_catalog_flags. */
  is_free?: boolean;
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    slug: "express-30-min-fat-loss-12w",
    title: "Express 30-Minute Fat Loss (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A time-crunched 12-week fat loss system built around efficient 30-minute sessions for busy schedules.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Express Foundation", "Week 6 Density Phase", "Week 12 Peak Efficiency"],
    assets: [
      { type: "workout-schedule", label: "12-week 30-minute session schedule" },
      { type: "exercise-video", label: "Efficient movement pacing and form" },
      { type: "pdf-guide", label: "Time-under-tension and density progression" },
      { type: "nutrition-plan", label: "Busy-schedule fat loss eating notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "hiit-metabolic-finisher-12w",
    title: "HIIT Metabolic Finisher (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week HIIT-led fat loss program stacking metabolic intervals onto strength days for a compounding burn.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Interval Foundation", "Week 6 VO2 Peak", "Week 12 Metabolic Finish"],
    assets: [
      { type: "workout-schedule", label: "12-week HIIT-interval schedule" },
      { type: "exercise-video", label: "Interval form and cadence guide" },
      { type: "pdf-guide", label: "Metabolic conditioning playbook" },
      { type: "nutrition-plan", label: "Post-interval recovery nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "low-impact-fat-loss-12w",
    title: "Low-Impact Fat Loss (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A joint-friendly 12-week fat loss plan using low-impact strength and steady-state conditioning for sustainable progress.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Low-Impact Foundation", "Steady-State Progression", "Peak Conditioning Week"],
    assets: [
      { type: "workout-schedule", label: "12-week low-impact schedule" },
      { type: "exercise-video", label: "Joint-safe movement technique guide" },
      { type: "pdf-guide", label: "Load and progression handbook" },
      { type: "nutrition-plan", label: "Sustainable fat loss nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "treadmill-transformation-12w",
    title: "Treadmill Transformation (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week cardio-led transformation program centered on treadmill progression, incline blocks, and structured walking.",
    coachSlug: "tjfit-team",
    requiredEquipment: ["Treadmill"],
    previewImages: ["Walking Base Build", "Incline Progression", "Peak Cardio Week"],
    assets: [
      { type: "workout-schedule", label: "12-week treadmill progression schedule" },
      { type: "exercise-video", label: "Treadmill cadence and incline pacing" },
      { type: "pdf-guide", label: "Walk, incline, and interval handbook" },
      { type: "nutrition-plan", label: "Cardio-aligned fat loss nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "full-body-circuit-cutter-12w",
    title: "Full-Body Circuit Cutter (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week full-body circuit program balancing resistance and conditioning for a lean athletic cut.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Circuit Foundation", "Density Week 6", "Peak Conditioning Week"],
    assets: [
      { type: "workout-schedule", label: "12-week full-body circuit schedule" },
      { type: "exercise-video", label: "Circuit tempo and transition guide" },
      { type: "pdf-guide", label: "Density and circuit progression handbook" },
      { type: "nutrition-plan", label: "Lean athletic nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "old-school-hypertrophy-12w",
    title: "Old-School Hypertrophy (12 Weeks)",
    category: "Muscle Gain",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week classic volume hypertrophy program rooted in proven bodybuilding splits and honest progression.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Volume Foundation", "Week 7 Intensity Block", "Peak Physique Week"],
    assets: [
      { type: "workout-schedule", label: "12-week classic hypertrophy schedule" },
      { type: "exercise-video", label: "Volume tempo and technique guide" },
      { type: "pdf-guide", label: "Progressive overload handbook" },
      { type: "nutrition-plan", label: "Lean mass nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "push-pull-legs-blueprint-12w",
    title: "Push Pull Legs Blueprint (12 Weeks)",
    category: "Muscle Gain",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week push/pull/legs split designed for balanced hypertrophy across every major muscle pattern.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["PPL Foundation Split", "Week 6 Intensity Phase", "Peak Hypertrophy Week"],
    assets: [
      { type: "workout-schedule", label: "12-week PPL schedule" },
      { type: "exercise-video", label: "Split execution and recovery guide" },
      { type: "pdf-guide", label: "PPL progression and deload handbook" },
      { type: "nutrition-plan", label: "Hypertrophy-supporting nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "upper-lower-split-system-12w",
    title: "Upper Lower Split System (12 Weeks)",
    category: "Muscle Gain",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week 4-day upper/lower split balancing strength-biased and hypertrophy-biased sessions each week.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Upper/Lower Foundation", "Week 6 Strength Block", "Peak Hypertrophy Week"],
    assets: [
      { type: "workout-schedule", label: "12-week upper/lower schedule" },
      { type: "exercise-video", label: "Upper and lower execution guide" },
      { type: "pdf-guide", label: "Split progression and deload handbook" },
      { type: "nutrition-plan", label: "Balanced muscle-gain nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "arm-specialization-surge-12w",
    title: "Arm Specialization Surge (12 Weeks)",
    category: "Muscle Gain",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week arm-focused hypertrophy specialization program with high-frequency bicep and tricep progression.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Arm Foundation Block", "Week 6 Frequency Surge", "Peak Arm Detail Week"],
    assets: [
      { type: "workout-schedule", label: "12-week arm specialization schedule" },
      { type: "exercise-video", label: "Arm execution and angle variation guide" },
      { type: "pdf-guide", label: "Specialization and recovery handbook" },
      { type: "nutrition-plan", label: "Lean arm-focused nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "back-shoulders-builder-12w",
    title: "Back and Shoulders Builder (12 Weeks)",
    category: "Muscle Gain",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week upper-body specialization program driving back width, shoulder caps, and posterior chain strength.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Upper Foundation Block", "Week 6 Volume Surge", "Peak V-Taper Week"],
    assets: [
      { type: "workout-schedule", label: "12-week back and shoulders schedule" },
      { type: "exercise-video", label: "Pulling and pressing angle guide" },
      { type: "pdf-guide", label: "V-taper progression handbook" },
      { type: "nutrition-plan", label: "Upper-body hypertrophy nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "powerlifting-foundations-12w",
    title: "Powerlifting Foundations (12 Weeks)",
    category: "Strength",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week powerlifting foundation program progressing squat, bench, and deadlift on a structured intensity wave.",
    coachSlug: "tjfit-team",
    requiredEquipment: ["Barbell", "Power rack"],
    previewImages: ["Technique Foundation Block", "Week 6 Intensity Wave", "Peak Strength Week"],
    assets: [
      { type: "workout-schedule", label: "12-week powerlifting schedule" },
      { type: "exercise-video", label: "Squat, bench, deadlift technique" },
      { type: "pdf-guide", label: "Intensity and accessory handbook" },
      { type: "nutrition-plan", label: "Strength-supporting nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "5x5-strength-protocol-12w",
    title: "5x5 Strength Protocol (12 Weeks)",
    category: "Strength",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week classic 5x5 linear progression program building compound strength on a repeatable base.",
    coachSlug: "tjfit-team",
    requiredEquipment: ["Barbell", "Squat rack"],
    previewImages: ["5x5 Foundation", "Week 6 Load Progression", "Peak Load Week"],
    assets: [
      { type: "workout-schedule", label: "12-week 5x5 schedule" },
      { type: "exercise-video", label: "Compound lift technique guide" },
      { type: "pdf-guide", label: "Linear progression and reset handbook" },
      { type: "nutrition-plan", label: "Strength-supporting nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "deadlift-mastery-12w",
    title: "Deadlift Mastery Program (12 Weeks)",
    category: "Strength",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week deadlift-focused strength program with block periodization and posterior chain support work.",
    coachSlug: "tjfit-team",
    requiredEquipment: ["Barbell", "Plates"],
    previewImages: ["Deadlift Technique Block", "Week 6 Strength Wave", "Peak Pull Week"],
    assets: [
      { type: "workout-schedule", label: "12-week deadlift specialization schedule" },
      { type: "exercise-video", label: "Deadlift setup and execution guide" },
      { type: "pdf-guide", label: "Posterior chain progression handbook" },
      { type: "nutrition-plan", label: "Pull-strength nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "bench-press-breakthrough-12w",
    title: "Bench Press Breakthrough (12 Weeks)",
    category: "Strength",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week bench press specialization program increasing press strength with accessory stability work.",
    coachSlug: "tjfit-team",
    requiredEquipment: ["Barbell", "Bench"],
    previewImages: ["Bench Technique Block", "Week 6 Intensity Wave", "Peak Press Week"],
    assets: [
      { type: "workout-schedule", label: "12-week bench specialization schedule" },
      { type: "exercise-video", label: "Bench setup and bar path guide" },
      { type: "pdf-guide", label: "Press intensity and accessory handbook" },
      { type: "nutrition-plan", label: "Press-supporting nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "squat-strength-ladder-12w",
    title: "Squat Strength Ladder (12 Weeks)",
    category: "Strength",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week squat specialization program laddering intensity across front, back, and pause squat variants.",
    coachSlug: "tjfit-team",
    requiredEquipment: ["Barbell", "Squat rack"],
    previewImages: ["Squat Technique Block", "Week 6 Intensity Ladder", "Peak Squat Week"],
    assets: [
      { type: "workout-schedule", label: "12-week squat ladder schedule" },
      { type: "exercise-video", label: "Squat variant technique guide" },
      { type: "pdf-guide", label: "Intensity ladder and recovery handbook" },
      { type: "nutrition-plan", label: "Leg-strength nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "athletic-conditioning-12w",
    title: "Athletic Conditioning System (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week conditioning program combining strength, agility, and energy-system work for athletic performance.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Conditioning Foundation", "Week 6 Energy Systems", "Peak Performance Week"],
    assets: [
      { type: "workout-schedule", label: "12-week athletic conditioning schedule" },
      { type: "exercise-video", label: "Agility and energy-system guide" },
      { type: "pdf-guide", label: "Conditioning progression handbook" },
      { type: "nutrition-plan", label: "Athletic fuel timing notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "explosive-power-development-12w",
    title: "Explosive Power Development (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week plyometric and power-biased program developing explosive force across the full kinetic chain.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Power Foundation", "Week 6 Plyometric Surge", "Peak Power Week"],
    assets: [
      { type: "workout-schedule", label: "12-week power schedule" },
      { type: "exercise-video", label: "Plyometric and power technique guide" },
      { type: "pdf-guide", label: "Power progression and recovery handbook" },
      { type: "nutrition-plan", label: "Power-performance nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "functional-athlete-plan-12w",
    title: "Functional Athlete Plan (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week functional movement program integrating compound strength, mobility, and conditioning for all-around athleticism.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Functional Foundation", "Week 6 Integration Block", "Peak Athleticism Week"],
    assets: [
      { type: "workout-schedule", label: "12-week functional schedule" },
      { type: "exercise-video", label: "Functional pattern execution guide" },
      { type: "pdf-guide", label: "Integration and progression handbook" },
      { type: "nutrition-plan", label: "Functional athlete nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "sprint-agility-protocol-12w",
    title: "Sprint and Agility Protocol (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week speed and agility program blending acceleration work, change-of-direction drills, and support strength.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Sprint Foundation", "Week 6 Agility Surge", "Peak Speed Week"],
    assets: [
      { type: "workout-schedule", label: "12-week sprint/agility schedule" },
      { type: "exercise-video", label: "Acceleration and cut technique guide" },
      { type: "pdf-guide", label: "Speed progression handbook" },
      { type: "nutrition-plan", label: "Speed-performance nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "endurance-athlete-builder-12w",
    title: "Endurance Athlete Builder (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week endurance-biased program building aerobic base, zone 2 capacity, and supportive strength.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Aerobic Base Build", "Week 6 Threshold Work", "Peak Endurance Week"],
    assets: [
      { type: "workout-schedule", label: "12-week endurance schedule" },
      { type: "exercise-video", label: "Zone and pacing guide" },
      { type: "pdf-guide", label: "Endurance progression handbook" },
      { type: "nutrition-plan", label: "Endurance nutrition and hydration notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "womens-strength-sculpt-12w",
    title: "Women's Strength and Sculpt (12 Weeks)",
    category: "Muscle Gain",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week strength and sculpt program designed to build confident lean muscle with a lower-body emphasis.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Foundation Strength", "Week 6 Sculpt Block", "Peak Sculpt Week"],
    assets: [
      { type: "workout-schedule", label: "12-week sculpt schedule" },
      { type: "exercise-video", label: "Movement execution guide" },
      { type: "pdf-guide", label: "Progression and recovery handbook" },
      { type: "nutrition-plan", label: "Lean-muscle nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "postpartum-return-plan-12w",
    title: "Postpartum Return Plan (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A gentle 12-week postpartum return program rebuilding core, pelvic floor, and full-body strength in progressive stages.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Reconnect Phase", "Rebuild Phase", "Restore Strength Phase"],
    assets: [
      { type: "workout-schedule", label: "12-week postpartum schedule" },
      { type: "exercise-video", label: "Core and pelvic floor technique guide" },
      { type: "pdf-guide", label: "Staged return progression handbook" },
      { type: "nutrition-plan", label: "Postpartum nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "senior-strength-mobility-12w",
    title: "Senior Strength and Mobility (12 Weeks)",
    category: "Performance",
    difficulty: "Beginner",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week strength and mobility program for active seniors preserving muscle, balance, and joint health.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Mobility Foundation", "Week 6 Strength Block", "Peak Function Week"],
    assets: [
      { type: "workout-schedule", label: "12-week senior schedule" },
      { type: "exercise-video", label: "Safe technique and pacing guide" },
      { type: "pdf-guide", label: "Balance and joint-health handbook" },
      { type: "nutrition-plan", label: "Senior nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "youth-athlete-development-12w",
    title: "Youth Athlete Development (12 Weeks)",
    category: "Performance",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week development program for youth athletes focused on foundational movement, strength, and coordination.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Movement Foundation", "Week 6 Coordination Block", "Peak Development Week"],
    assets: [
      { type: "workout-schedule", label: "12-week youth schedule" },
      { type: "exercise-video", label: "Movement pattern guide" },
      { type: "pdf-guide", label: "Youth progression handbook" },
      { type: "nutrition-plan", label: "Youth athlete nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "busy-parent-home-system-12w",
    title: "Busy Parent Home System (12 Weeks)",
    category: "Fat Loss",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week at-home program built for busy parents: short, effective sessions that fit into real schedules.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Foundation Block", "Week 6 Density Phase", "Peak Schedule Week"],
    assets: [
      { type: "workout-schedule", label: "12-week parent-friendly schedule" },
      { type: "exercise-video", label: "Fast-execution movement guide" },
      { type: "pdf-guide", label: "Micro-session and recovery handbook" },
      { type: "nutrition-plan", label: "Family-friendly nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "mobility-recovery-system-12w",
    title: "Mobility and Recovery System (12 Weeks)",
    category: "Performance",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week mobility and recovery program designed to restore range, reduce stiffness, and build sustainable joint resilience.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Mobility Foundation", "Week 6 Range Expansion", "Peak Recovery Week"],
    assets: [
      { type: "workout-schedule", label: "12-week mobility schedule" },
      { type: "exercise-video", label: "Mobility drill execution guide" },
      { type: "pdf-guide", label: "Range and resilience handbook" },
      { type: "nutrition-plan", label: "Recovery-supporting nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "desk-worker-reset-12w",
    title: "Desk Worker Reset (12 Weeks)",
    category: "Performance",
    difficulty: "Beginner",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week posture, mobility, and strength reset for desk workers — targeting neck, hips, and core.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Posture Foundation", "Week 6 Mobility Surge", "Peak Reset Week"],
    assets: [
      { type: "workout-schedule", label: "12-week desk-worker schedule" },
      { type: "exercise-video", label: "Posture and mobility drill guide" },
      { type: "pdf-guide", label: "Desk-reset progression handbook" },
      { type: "nutrition-plan", label: "Energy and posture nutrition notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "runners-strength-support-12w",
    title: "Runner's Strength Support (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week strength program designed to support runners: posterior chain, hip stability, and injury resilience.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Runner Foundation", "Week 6 Stability Block", "Peak Support Week"],
    assets: [
      { type: "workout-schedule", label: "12-week runner strength schedule" },
      { type: "exercise-video", label: "Runner-specific technique guide" },
      { type: "pdf-guide", label: "Stability and injury prevention handbook" },
      { type: "nutrition-plan", label: "Runner fueling support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "boxers-conditioning-12w",
    title: "Boxer's Conditioning System (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week conditioning program for boxers — rotational power, anaerobic capacity, and round endurance.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Boxing Foundation", "Week 6 Round Capacity", "Peak Fight Week"],
    assets: [
      { type: "workout-schedule", label: "12-week boxing conditioning schedule" },
      { type: "exercise-video", label: "Rotational power and footwork guide" },
      { type: "pdf-guide", label: "Round-capacity progression handbook" },
      { type: "nutrition-plan", label: "Fight-camp nutrition support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "cyclist-power-base-12w",
    title: "Cyclist Power Base (12 Weeks)",
    category: "Performance",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week strength and power base program for cyclists — leg drive, hip stability, and core bracing.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Cyclist Foundation", "Week 6 Power Surge", "Peak Base Week"],
    assets: [
      { type: "workout-schedule", label: "12-week cyclist strength schedule" },
      { type: "exercise-video", label: "Leg drive and bracing technique guide" },
      { type: "pdf-guide", label: "Cyclist progression handbook" },
      { type: "nutrition-plan", label: "Cyclist fueling support notes" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "keto-shred-diet-12w",
    title: "Keto Shred Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
    price: 0,
    is_free: true,
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
  },
  {
    slug: "mediterranean-lean-protocol-12w",
    title: "Mediterranean Lean Protocol (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week Mediterranean-style lean nutrition plan with olive oil, fish, legumes, and vegetables.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Mediterranean Foundation", "Lean Macro Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week Mediterranean macro protocol" },
      { type: "pdf-guide", label: "Mediterranean recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and meal alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "high-protein-fat-loss-12w",
    title: "High-Protein Fat Loss (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week high-protein fat loss plan protecting lean mass with elevated protein across every meal.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Protein Foundation", "Week 6 Macro Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week high-protein macro protocol" },
      { type: "pdf-guide", label: "High-protein recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and protein timing notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "intermittent-fasting-cut-12w",
    title: "Intermittent Fasting Cut (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week intermittent fasting fat loss plan built around a 16/8 eating window and disciplined macro targets.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["16/8 Foundation", "Week 6 Macro Phase", "Peak Fasted Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week IF macro protocol" },
      { type: "pdf-guide", label: "Fasting execution and refeed handbook" },
      { type: "workout-schedule", label: "Fasted training alignment notes" },
      { type: "exercise-video", label: "Optional fasted activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "plant-based-muscle-gain-12w",
    title: "Plant-Based Muscle Gain (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week vegan muscle gain nutrition plan covering protein stacking, calorie surplus, and micronutrient coverage.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Vegan Foundation", "Surplus Phase", "Peak Lean Mass Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week vegan muscle-gain macro protocol" },
      { type: "pdf-guide", label: "Plant-protein stacking handbook" },
      { type: "workout-schedule", label: "Training and surplus alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "vegetarian-lean-bulk-12w",
    title: "Vegetarian Lean Bulk (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week vegetarian lean bulk plan centered on eggs, dairy, legumes, and smart calorie surplus.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Vegetarian Foundation", "Surplus Phase", "Peak Mass Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week vegetarian bulk macro protocol" },
      { type: "pdf-guide", label: "Vegetarian recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and surplus alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "carb-cycling-system-12w",
    title: "Carb Cycling System (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week carb cycling plan alternating high, medium, and low carb days to drive fat loss while preserving performance.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Cycle Foundation", "Week 6 Carb Wave", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week carb-cycling macro protocol" },
      { type: "pdf-guide", label: "Carb-day execution handbook" },
      { type: "workout-schedule", label: "Training and carb-day alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "flexible-dieting-framework-12w",
    title: "Flexible Dieting Framework (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week flexible dieting (IIFYM) framework giving macro targets with full food flexibility for sustainable fat loss.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Macro Foundation", "Week 6 Flex Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week flexible dieting macro protocol" },
      { type: "pdf-guide", label: "Tracking and adherence handbook" },
      { type: "workout-schedule", label: "Training and macro alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "anti-inflammatory-reset-12w",
    title: "Anti-Inflammatory Reset (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week anti-inflammatory reset plan removing common irritants and rebuilding around omega-3, fibre, and polyphenols.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Reset Foundation", "Week 6 Rebuild Phase", "Peak Reset Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week anti-inflammatory macro protocol" },
      { type: "pdf-guide", label: "Reset recipe and elimination handbook" },
      { type: "workout-schedule", label: "Training and recovery alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "hormone-balance-nutrition-12w",
    title: "Hormone Balance Nutrition (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week nutrition plan supporting hormone balance through steady macros, micronutrient density, and cycle-aware structure.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Balance Foundation", "Week 6 Micronutrient Phase", "Peak Balance Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week hormone-balance macro protocol" },
      { type: "pdf-guide", label: "Balance recipe and cycle-aware handbook" },
      { type: "workout-schedule", label: "Training and recovery alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "low-fodmap-fat-loss-12w",
    title: "Low-FODMAP Fat Loss (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week low-FODMAP fat loss plan easing digestive stress while keeping macros and calorie targets tight.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["FODMAP Foundation", "Week 6 Macro Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week low-FODMAP macro protocol" },
      { type: "pdf-guide", label: "Low-FODMAP recipe handbook" },
      { type: "workout-schedule", label: "Training and digestion alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "gluten-free-performance-12w",
    title: "Gluten-Free Performance (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week gluten-free performance nutrition plan supporting lean mass and training output without wheat.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["GF Foundation", "Surplus Phase", "Peak Performance Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week gluten-free macro protocol" },
      { type: "pdf-guide", label: "Gluten-free recipe handbook" },
      { type: "workout-schedule", label: "Training and fuel alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "dairy-free-muscle-plan-12w",
    title: "Dairy-Free Muscle Plan (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week dairy-free muscle-gain plan hitting protein and surplus targets without whey or casein.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Dairy-Free Foundation", "Surplus Phase", "Peak Mass Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week dairy-free macro protocol" },
      { type: "pdf-guide", label: "Dairy-free recipe handbook" },
      { type: "workout-schedule", label: "Training and surplus alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "halal-high-protein-cut-12w",
    title: "Halal High-Protein Cut (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Advanced",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week halal-compliant high-protein fat loss plan built around lean meats, legumes, and dairy.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Halal Foundation", "Week 6 Macro Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week halal cutting macro protocol" },
      { type: "pdf-guide", label: "Halal recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and meal alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "kosher-clean-bulk-12w",
    title: "Kosher Clean Bulk (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week kosher-compliant lean bulk plan centered on clean proteins, whole grains, and steady surplus.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Kosher Foundation", "Surplus Phase", "Peak Lean Mass Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week kosher bulk macro protocol" },
      { type: "pdf-guide", label: "Kosher recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and surplus alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "mediterranean-maintenance-12w",
    title: "Mediterranean Maintenance (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner to Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week Mediterranean maintenance plan holding a lean body composition with balanced macros and whole foods.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Maintenance Foundation", "Week 6 Steady Phase", "Peak Maintenance Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week Mediterranean maintenance macro protocol" },
      { type: "pdf-guide", label: "Maintenance recipe handbook" },
      { type: "workout-schedule", label: "Training and maintenance alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "high-volume-low-calorie-cut-12w",
    title: "High-Volume Low-Calorie Cut (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week high-volume low-calorie cut emphasizing fibre-dense foods for satiety on an aggressive deficit.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Volume Foundation", "Week 6 Deficit Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week volume-cut macro protocol" },
      { type: "pdf-guide", label: "Volume eating recipe handbook" },
      { type: "workout-schedule", label: "Training and deficit alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "post-workout-recovery-nutrition-12w",
    title: "Post-Workout Recovery Nutrition (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week recovery-focused nutrition plan optimizing post-training protein, carbs, and micronutrient timing for muscle gain.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Recovery Foundation", "Week 6 Timing Phase", "Peak Mass Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week recovery-nutrition macro protocol" },
      { type: "pdf-guide", label: "Post-workout timing handbook" },
      { type: "workout-schedule", label: "Training and recovery alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "budget-cutting-meal-plan-12w",
    title: "Budget Cutting Meal Plan (12 Weeks)",
    category: "Nutrition",
    difficulty: "Beginner",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week budget-friendly cutting plan hitting macro targets with low-cost staples and smart prep.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Budget Foundation", "Week 6 Prep Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week budget-cut macro protocol" },
      { type: "pdf-guide", label: "Budget recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and meal alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "travel-and-restaurant-diet-12w",
    title: "Travel and Restaurant Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week travel- and restaurant-friendly cutting plan keeping macros on target across hotels, airports, and dining out.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Travel Foundation", "Week 6 Dining Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week travel-friendly macro protocol" },
      { type: "pdf-guide", label: "Restaurant ordering handbook" },
      { type: "workout-schedule", label: "Travel training and meal alignment notes" },
      { type: "exercise-video", label: "Optional travel activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "endomorph-fat-loss-diet-12w",
    title: "Endomorph Fat Loss Diet (12 Weeks)",
    category: "Nutrition",
    difficulty: "Intermediate",
    duration: "12 weeks",
    price: 0,
    is_free: true,
    description: "A 12-week fat loss plan tuned for endomorph body types — moderate protein, controlled carbs, and steady fibre.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Endomorph Foundation", "Week 6 Macro Phase", "Peak Lean Week"],
    assets: [
      { type: "nutrition-plan", label: "12-week endomorph macro protocol" },
      { type: "pdf-guide", label: "Endomorph recipe and prep handbook" },
      { type: "workout-schedule", label: "Training and macro alignment notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "home-fat-loss-starter",
    title: "Home Fat Loss Starter",
    category: "Fat Loss",
    difficulty: "Beginner",
    duration: "4 weeks",
    price: 0,
    is_free: true,
    description:
      "A free 4-week home fat-loss starter: 3 sessions per week (Mon / Wed / Fri) with warm-ups, structured circuits, and clear progression. Sign in to unlock the full plan.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Weeks 1-2 Foundation", "Weeks 3-4 Progression", "Upgrade to 12-Week System"],
    assets: [
      { type: "workout-schedule", label: "4-week starter schedule" },
      { type: "pdf-guide", label: "Movement and recovery notes" },
      { type: "exercise-video", label: "Form cues for key exercises" },
      { type: "nutrition-plan", label: "Fat-loss nutrition primer" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "gym-muscle-starter",
    title: "Gym Muscle Starter",
    category: "Muscle Gain",
    difficulty: "Beginner",
    duration: "4 weeks",
    price: 0,
    is_free: true,
    description:
      "A free 4-week gym starter for muscle gain: 3 full-body style splits per week with machine and free-weight staples. Sign in to unlock the full plan.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Chest + Triceps", "Back + Biceps", "Legs + Shoulders"],
    assets: [
      { type: "workout-schedule", label: "4-week gym starter split" },
      { type: "exercise-video", label: "Compound lift execution cues" },
      { type: "pdf-guide", label: "Progression basics" },
      { type: "nutrition-plan", label: "Muscle-gain eating overview" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "clean-cut-starter",
    title: "Clean Cut Starter",
    category: "Nutrition",
    difficulty: "Beginner",
    duration: "2 weeks",
    price: 0,
    is_free: true,
    description:
      "A free 2-week cutting starter near 1800 kcal with simple whole-food meals, then a week-2 adjustment. Sign in to unlock full meal details and macros.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Base Phase", "Week 2 Adjustment", "Upgrade to 12-Week Plan"],
    assets: [
      { type: "nutrition-plan", label: "2-week starter meals and macros" },
      { type: "pdf-guide", label: "Prep and consistency checklist" },
      { type: "workout-schedule", label: "Training fueling notes" },
      { type: "exercise-video", label: "Optional activity guidance" }
    ],
    coachCommissionRate: 0
  },
  {
    slug: "lean-bulk-starter",
    title: "Lean Bulk Starter",
    category: "Nutrition",
    difficulty: "Beginner",
    duration: "2 weeks",
    price: 0,
    is_free: true,
    description:
      "A free 2-week lean-bulk starter near 2800 kcal with high-protein meals and a simple week-2 bump. Sign in to unlock full meal breakdowns.",
    coachSlug: "tjfit-team",
    requiredEquipment: [],
    previewImages: ["Week 1 Base Intake", "Week 2 Calorie Bump", "Upgrade to 12-Week Plan"],
    assets: [
      { type: "nutrition-plan", label: "2-week lean bulk meals" },
      { type: "pdf-guide", label: "Shopping and prep outline" },
      { type: "workout-schedule", label: "Gym fueling alignment" },
      { type: "exercise-video", label: "Optional training support" }
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
