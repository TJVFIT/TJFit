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

export type LiveSession = {
  id: string;
  title: string;
  coachSlug: string;
  schedule: string;
  capacity: number;
  spotsLeft: number;
  type: "group live session";
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

export const programs: Program[] = [];

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

export const challenges: Challenge[] = [];

export const liveSessions: LiveSession[] = [];

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

export const liveProofNotifications: string[] = [];
