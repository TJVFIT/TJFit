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

export const coaches: Coach[] = [
  {
    slug: "layla-haddad",
    name: "Layla Haddad",
    specialty: "Fat loss and nutrition",
    goals: ["fat loss", "muscle"],
    experienceLevels: ["beginner", "intermediate"],
    trainingLocations: ["home", "gym"],
    languages: ["English", "Arabic"],
    rating: 4.9,
    price: 1200,
    country: "UAE",
    certifications: ["NASM CPT", "Precision Nutrition"],
    availability: "Today",
    availabilityScore: 95,
    successRate: 94,
    retentionRate: 92,
    clientSuccessRate: 91,
    conversionRate: 8.4,
    monthlyEarnings: 48500,
    points: 1240,
    rank: "Elite",
    businessBoosts: ["Homepage spotlight"],
    affiliateCode: "LAYLA10",
    referralCommissionRate: 10,
    bio: "Layla blends nutrition coaching, accountability, and online habit systems for busy professionals.",
    results: ["380 sessions completed", "92% retention", "4.9 average rating"],
    programs: ["home-fat-loss", "mobility-recovery"]
  },
  {
    slug: "emre-aksu",
    name: "Emre Aksu",
    specialty: "Performance and vertical jump",
    goals: ["sports", "muscle"],
    experienceLevels: ["intermediate", "advanced"],
    trainingLocations: ["gym", "field"],
    languages: ["English", "Turkish"],
    rating: 4.8,
    price: 1400,
    country: "Turkey",
    certifications: ["CSCS", "EXOS Performance"],
    availability: "Tomorrow",
    availabilityScore: 82,
    successRate: 89,
    retentionRate: 88,
    clientSuccessRate: 87,
    conversionRate: 6.8,
    monthlyEarnings: 39100,
    points: 930,
    rank: "Gold",
    businessBoosts: ["Top search placement"],
    affiliateCode: "EMRE10",
    referralCommissionRate: 9,
    bio: "Emre coaches athletes who want speed, vertical jump gains, and structured weekly performance tracking.",
    results: ["+8cm average vertical jump", "210 sessions completed", "88% client renewals"],
    programs: ["vertical-jump-training"]
  },
  {
    slug: "marta-rinaldi",
    name: "Marta Rinaldi",
    specialty: "Beginner bodybuilding",
    goals: ["muscle", "fat loss"],
    experienceLevels: ["beginner", "intermediate"],
    trainingLocations: ["gym", "home"],
    languages: ["English", "Italian"],
    rating: 4.7,
    price: 1100,
    country: "Italy",
    certifications: ["IFBB Coach", "ACE CPT"],
    availability: "This week",
    availabilityScore: 70,
    successRate: 84,
    retentionRate: 80,
    clientSuccessRate: 82,
    conversionRate: 5.7,
    monthlyEarnings: 27300,
    points: 640,
    rank: "Silver",
    businessBoosts: ["Featured coach"],
    affiliateCode: "MARTA10",
    referralCommissionRate: 8,
    bio: "Marta helps beginners build strength, muscle, and confidence through simple progressive plans.",
    results: ["170 active clients served", "High beginner adherence", "Trusted onboarding flow"],
    programs: ["beginner-bodybuilding"]
  },
  {
    slug: "yousef-karim",
    name: "Yousef Karim",
    specialty: "Physiotherapy and rehabilitation",
    goals: ["rehab", "sports"],
    experienceLevels: ["beginner", "intermediate", "advanced"],
    trainingLocations: ["home", "clinic", "gym"],
    languages: ["English", "Arabic", "Turkish"],
    rating: 5,
    price: 1500,
    country: "Qatar",
    certifications: ["DPT", "Sports Rehab Specialist"],
    availability: "Today",
    availabilityScore: 97,
    successRate: 96,
    retentionRate: 95,
    clientSuccessRate: 94,
    conversionRate: 9.1,
    monthlyEarnings: 51400,
    points: 1510,
    rank: "Elite",
    businessBoosts: ["Homepage spotlight", "Top search placement"],
    affiliateCode: "YOUSEF10",
    referralCommissionRate: 12,
    bio: "Yousef combines rehab protocols, movement screening, and post-injury return-to-performance plans.",
    results: ["126 rehab cases", "5.0 average rating", "Strong before/after mobility wins"],
    programs: ["mobility-recovery"]
  },
  {
    slug: "sarah-bennett",
    name: "Sarah Bennett",
    specialty: "Women's fat loss and strength",
    goals: ["fat loss", "muscle"],
    experienceLevels: ["beginner", "intermediate"],
    trainingLocations: ["home", "gym"],
    languages: ["English", "French"],
    rating: 4.9,
    price: 1300,
    country: "UK",
    certifications: ["CPT", "Strength Coach"],
    availability: "Today",
    availabilityScore: 90,
    successRate: 92,
    retentionRate: 89,
    clientSuccessRate: 90,
    conversionRate: 7.9,
    monthlyEarnings: 43200,
    points: 1180,
    rank: "Gold",
    businessBoosts: ["Featured coach"],
    affiliateCode: "SARAH10",
    referralCommissionRate: 10,
    bio: "Sarah helps women build strength, confidence, and sustainable body composition change.",
    results: ["305 sessions completed", "90% coach satisfaction", "Strong lifestyle adherence"],
    programs: ["home-fat-loss", "beginner-bodybuilding"]
  },
  {
    slug: "omar-benali",
    name: "Omar Benali",
    specialty: "Sports conditioning and speed",
    goals: ["sports", "fat loss"],
    experienceLevels: ["intermediate", "advanced"],
    trainingLocations: ["gym", "field"],
    languages: ["English", "Arabic", "French"],
    rating: 4.8,
    price: 1250,
    country: "Morocco",
    certifications: ["Speed Specialist", "Performance Coach"],
    availability: "Tomorrow",
    availabilityScore: 84,
    successRate: 88,
    retentionRate: 86,
    clientSuccessRate: 88,
    conversionRate: 6.2,
    monthlyEarnings: 31800,
    points: 860,
    rank: "Gold",
    businessBoosts: ["Top search placement"],
    affiliateCode: "OMAR10",
    referralCommissionRate: 9,
    bio: "Omar focuses on speed, conditioning, and athletic performance for serious athletes.",
    results: ["Sprint time improvement", "Strong athlete renewals", "High weekly adherence"],
    programs: ["vertical-jump-training"]
  }
];

export const programs: Program[] = [
  {
    slug: "home-fat-loss",
    title: "Home Fat Loss",
    category: "Transformation",
    difficulty: "Beginner",
    duration: "8 weeks",
    price: 900,
    description: "Simple fat loss training with home workouts, weekly check-ins, and meal guidance.",
    coachSlug: "layla-haddad",
    requiredEquipment: ["resistance-bands", "jump-rope"],
    previewImages: ["day-1-plan", "meal-preview", "coach-checkin"],
    assets: [
      { type: "exercise-video", label: "Home cardio circuit" },
      { type: "workout-schedule", label: "8-week progressive schedule" },
      { type: "pdf-guide", label: "Fat loss habits guide" },
      { type: "nutrition-plan", label: "Simple calorie control template" }
    ],
    coachCommissionRate: 15
  },
  {
    slug: "vertical-jump-training",
    title: "Vertical Jump Training",
    category: "Performance",
    difficulty: "Intermediate",
    duration: "6 weeks",
    price: 1100,
    description: "Explosive lower-body work, landing mechanics, sprint support, and jump tracking.",
    coachSlug: "emre-aksu",
    requiredEquipment: ["adjustable-dumbbells", "resistance-bands"],
    previewImages: ["jump-protocol", "plyo-session", "performance-test"],
    assets: [
      { type: "exercise-video", label: "Plyometric circuit walkthrough" },
      { type: "workout-schedule", label: "Jump progression calendar" },
      { type: "pdf-guide", label: "Landing mechanics notes" }
    ],
    coachCommissionRate: 18
  },
  {
    slug: "beginner-bodybuilding",
    title: "Beginner Bodybuilding",
    category: "Muscle Building",
    difficulty: "Beginner",
    duration: "12 weeks",
    price: 950,
    description: "Strength and hypertrophy basics with technique cues, recovery structure, and progression.",
    coachSlug: "marta-rinaldi",
    requiredEquipment: ["adjustable-dumbbells", "foam-roller"],
    previewImages: ["upper-day", "lower-day", "program-overview"],
    assets: [
      { type: "exercise-video", label: "Technique library" },
      { type: "workout-schedule", label: "12-week split" },
      { type: "pdf-guide", label: "Recovery and sleep guide" },
      { type: "nutrition-plan", label: "Beginner muscle gain meal plan" }
    ],
    coachCommissionRate: 14
  },
  {
    slug: "mobility-recovery",
    title: "Mobility Recovery",
    category: "Rehab",
    difficulty: "All levels",
    duration: "4 weeks",
    price: 850,
    description: "Daily mobility sessions, movement resets, rehab notes, and weekly recovery reviews.",
    coachSlug: "yousef-karim",
    requiredEquipment: ["foam-roller", "massage-gun", "resistance-bands"],
    previewImages: ["mobility-sequence", "recovery-assessment", "coach-feedback"],
    assets: [
      { type: "exercise-video", label: "Daily mobility flow" },
      { type: "workout-schedule", label: "4-week recovery calendar" },
      { type: "pdf-guide", label: "Return to training checklist" }
    ],
    coachCommissionRate: 20
  }
];

export const products: Product[] = [
  {
    slug: "resistance-bands",
    name: "Resistance Bands",
    category: "Recovery",
    price: 399,
    description: "Portable bands for activation, warmup work, and full-body home sessions.",
    recommendedFor: ["home-fat-loss", "vertical-jump-training", "mobility-recovery"],
    coachCommissionRate: 8
  },
  {
    slug: "adjustable-dumbbells",
    name: "Adjustable Dumbbells",
    category: "Strength",
    price: 2899,
    description: "Compact strength setup for premium home programs.",
    recommendedFor: ["vertical-jump-training", "beginner-bodybuilding"],
    coachCommissionRate: 10
  },
  {
    slug: "jump-rope",
    name: "Jump Rope",
    category: "Conditioning",
    price: 249,
    description: "Lightweight rope for conditioning blocks and warmups.",
    recommendedFor: ["home-fat-loss"],
    coachCommissionRate: 7
  },
  {
    slug: "foam-roller",
    name: "Foam Roller",
    category: "Recovery",
    price: 349,
    description: "Dense recovery roller for mobility and cooldown work.",
    recommendedFor: ["beginner-bodybuilding", "mobility-recovery"],
    coachCommissionRate: 8
  },
  {
    slug: "massage-gun",
    name: "Massage Gun",
    category: "Recovery",
    price: 1499,
    description: "Compact recovery support for soreness and tissue work.",
    recommendedFor: ["mobility-recovery"],
    coachCommissionRate: 9
  }
];

export const testimonials = [
  {
    name: "Ali, Istanbul",
    quote: "TJFit felt premium from day one. I booked fast, matched with the right coach, and stayed consistent."
  },
  {
    name: "Sara, Dubai",
    quote: "The multilingual experience made the platform feel global and trustworthy."
  },
  {
    name: "Mona, Doha",
    quote: "The mix of coaching, programs, and accountability is what finally made me stick to training."
  }
];

export const liveActivity = [
  "Ali from Istanbul just booked a mobility session.",
  "Sara from Dubai bought the Home Fat Loss program.",
  "Omar from Riyadh joined with a referral code.",
  "Yasmine from Ankara booked an Arabic nutrition call."
];

export const rankingTiers = [
  { name: "Bronze", detail: "New coach, strong onboarding and first reviews." },
  { name: "Silver", detail: "Consistent quality with repeat clients." },
  { name: "Gold", detail: "High retention, high ratings, priority visibility." },
  { name: "Elite", detail: "Best conversion, premium trust, top placement." }
];

export const transformations: Transformation[] = [
  {
    slug: "ali-fat-loss-12-weeks",
    userName: "Ali",
    coachSlug: "layla-haddad",
    category: "fat loss",
    startingWeight: 102,
    currentWeight: 87,
    strengthStat: "Deadlift +20kg",
    measurements: ["Waist -14cm", "Body fat -9%"],
    votes: 312,
    verified: true,
    story: "Ali rebuilt consistency through home sessions, structured check-ins, and simple nutrition habits.",
    timeline: [
      { week: "Week 1", update: "Set calorie target and daily steps baseline." },
      { week: "Week 6", update: "Down 8kg and training 4x weekly." },
      { week: "Week 12", update: "Completed transformation with visible body recomposition." }
    ]
  },
  {
    slug: "sara-strength-reset",
    userName: "Sara",
    coachSlug: "sarah-bennett",
    category: "muscle gain",
    startingWeight: 56,
    currentWeight: 61,
    strengthStat: "Hip thrust +35kg",
    measurements: ["Lean mass up", "Strength up across all lifts"],
    votes: 221,
    verified: true,
    story: "Sara followed a strength-focused beginner plan and documented weekly progress photos.",
    timeline: [
      { week: "Week 1", update: "Technique onboarding and baseline photos." },
      { week: "Week 8", update: "Visible muscle gain and stronger routine adherence." },
      { week: "Week 12", update: "Major strength improvements with consistent nutrition." }
    ]
  },
  {
    slug: "omar-recovery-return",
    userName: "Omar",
    coachSlug: "yousef-karim",
    category: "recovery",
    startingWeight: 78,
    currentWeight: 78,
    strengthStat: "Pain-free squat return",
    measurements: ["Mobility +28%", "Return to sport complete"],
    votes: 187,
    verified: true,
    story: "Omar came back from injury with guided rehab, mobility work, and gradual return-to-play planning.",
    timeline: [
      { week: "Week 1", update: "Movement screening and rehab protocol started." },
      { week: "Week 4", update: "Improved mobility and reduced pain." },
      { week: "Week 10", update: "Returned to training with coach verification." }
    ]
  }
];

export const transformationLeaderboards = [
  { category: "largest fat loss", leader: "Ali", score: "14.7% bodyweight change" },
  { category: "largest muscle gain", leader: "Sara", score: "+5kg lean progress" },
  { category: "best athletic improvement", leader: "Yazan", score: "+10cm vertical jump" },
  { category: "fastest recovery", leader: "Omar", score: "Pain-free return in 10 weeks" }
];

export const communityPosts: CommunityPost[] = [
  {
    id: "post-1",
    author: "Nour",
    role: "user",
    content: "Just finished week 3 of the 30 Day Fat Loss challenge and my energy is much better.",
    likes: 44,
    comments: 8,
    coachReply: "Strong consistency. Keep the walking target high this week."
  },
  {
    id: "post-2",
    author: "Coach Ahmed",
    role: "coach",
    content: "Quick tip: if your knees collapse during landing, slow down and rebuild control before adding more jumps.",
    likes: 73,
    comments: 12
  },
  {
    id: "post-3",
    author: "Mina",
    role: "user",
    content: "Posted my week 6 progress photos today. The challenge made me way more accountable.",
    likes: 61,
    comments: 10,
    coachReply: "Visible change already. Great momentum."
  }
];

export const challenges: Challenge[] = [
  {
    slug: "30-day-fat-loss",
    name: "30 Day Fat Loss",
    duration: "30 days",
    reward: "Wallet credit + homepage feature",
    participants: 240,
    category: "fat loss",
    description: "A public challenge with weekly progress posts, coach feedback, and leaderboard momentum."
  },
  {
    slug: "90-day-transformation",
    name: "90 Day Transformation",
    duration: "90 days",
    reward: "Premium membership + spotlight",
    participants: 128,
    category: "transformation",
    description: "Full before and after challenge focused on body composition, consistency, and inspiring transformation stories."
  },
  {
    slug: "vertical-jump-challenge",
    name: "Vertical Jump Challenge",
    duration: "6 weeks",
    reward: "Performance program discount",
    participants: 82,
    category: "sports",
    description: "Athletes share jump tests, weekly updates, and coach-verified improvements."
  }
];

export const liveSessions: LiveSession[] = [
  {
    id: "live-1",
    title: "Global Fat Loss Bootcamp",
    coachSlug: "layla-haddad",
    schedule: "Thursday 19:00",
    capacity: 40,
    spotsLeft: 11,
    type: "group live session"
  },
  {
    id: "live-2",
    title: "Vertical Jump Mechanics Lab",
    coachSlug: "emre-aksu",
    schedule: "Saturday 17:00",
    capacity: 24,
    spotsLeft: 6,
    type: "group live session"
  }
];

export const walletTransactions: WalletTransaction[] = [
  { id: "wallet-1", type: "reward", label: "Referral reward", amount: 20 },
  { id: "wallet-2", type: "refund", label: "Cancelled session refund", amount: 120 },
  { id: "wallet-3", type: "payment", label: "Applied to next booking", amount: -40 }
];

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
  { label: "Upcoming sessions", value: "04" },
  { label: "Active programs", value: "03" },
  { label: "Training videos uploaded", value: "12" },
  { label: "Referral credit", value: "80 TRY" }
];

export const coachDashboardStats = [
  { label: "Bookings this week", value: "18" },
  { label: "Client retention", value: "91%" },
  { label: "Earnings this month", value: "24,500 TRY" },
  { label: "Referral code uses", value: "14" }
];

export const adminStats = [
  { label: "Pending coach approvals", value: "09" },
  { label: "Gross volume", value: "184,000 TRY" },
  { label: "Refund requests", value: "03" },
  { label: "Conversion rate", value: "5.8%" }
];

export const adminAdvancedStats = [
  { label: "Total users", value: "12,480" },
  { label: "Active coaches", value: "146" },
  { label: "Top program", value: "Home Fat Loss" },
  { label: "Membership MRR", value: "94,000 TRY" },
  { label: "Wallet credits issued", value: "6,720 TRY" },
  { label: "Challenge participation", value: "450 users" }
];

export const liveProofNotifications = [
  "Ali from Ankara just booked a session.",
  "Sarah completed a 12 week transformation.",
  "Coach Ahmed joined the platform.",
  "Mina earned 20 TRY from a referral.",
  "Omar entered the Vertical Jump Challenge."
];
