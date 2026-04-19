import type { Program } from "@/lib/content";
import type { PublicCustomProgramRow } from "@/lib/custom-programs";
import { isCatalogDiet } from "@/lib/diet-catalog";
import type { Locale } from "@/lib/i18n";
import { getProgramBasePriceTry } from "@/lib/program-localization";

export type CatalogProgramKind = "program" | "diet";
export type CatalogGoalKey = "fat" | "muscle" | "recomp" | "performance" | "nutrition" | "general";
export type CatalogLocationKey = "home" | "gym" | "hybrid";
export type CatalogLevelKey = "beginner" | "intermediate" | "advanced" | "all_levels";
export type CatalogEquipmentKey = "bodyweight" | "minimal" | "full_gym" | "nutrition";
export type CatalogSortKey = "featured" | "price_low" | "price_high";
export type CatalogGoalFilter = "all" | "fat" | "muscle" | "recomp" | "performance";
export type CatalogLocationFilter = "all" | "home" | "gym" | "hybrid";
export type CatalogLevelFilter = "all" | "beginner" | "intermediate" | "advanced";

export type CatalogProgram = Program & {
  kind: CatalogProgramKind;
  goalKey: CatalogGoalKey;
  locationKey: CatalogLocationKey;
  levelKey: CatalogLevelKey;
  equipmentKey: CatalogEquipmentKey;
  weeklySessions: number;
  phaseCount: number;
  featuredRank: number | null;
  catalogRank: number;
  isCustomUpload?: boolean;
  createdAt?: string;
  display: {
    goalBadge: string;
    locationBadge: string;
    levelBadge: string;
    equipmentBadge: string;
    weeklyCommitmentBadge: string;
    metaLine: string;
    previewReason: string;
    tierLabel: string;
  };
};

type ProgramDisplayCopy = {
  goal: Record<CatalogGoalKey, string>;
  location: Record<CatalogLocationKey, string>;
  level: Record<CatalogLevelKey, string>;
  equipment: Record<CatalogEquipmentKey, string>;
  tier: {
    elite: string;
    popular: string;
    fresh: string;
    signature: string;
  };
  sessionsPerWeek: (count: number) => string;
  phases: (count: number) => string;
  previewReason: Record<CatalogGoalKey, Record<CatalogLocationKey, string>>;
};

const FEATURED_PROGRAM_RANKS: Record<string, number> = {
  "home-fat-loss-starter": 1,
  "gym-muscle-starter": 2,
  "bodyweight-shred-system-12w": 3,
  "hypertrophy-system-12w": 4,
  "home-muscle-builder-12w": 5,
  "gym-fat-loss-protocol-12w": 6,
  "strength-and-size-blueprint-12w": 7,
  "lean-machine-program-12w": 8
};

/**
 * Slim metadata extracted from the program blueprints so the client catalog
 * can show structured quality signals without importing the full blueprint body.
 */
const PROGRAM_STRUCTURE_OVERRIDES: Record<
  string,
  { weeklySessions?: number; phaseCount?: number; equipmentKey?: CatalogEquipmentKey }
> = {
  "home-fat-burn-accelerator-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "bodyweight-shred-system-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "home-cardio-melt-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "lean-at-home-program-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "sweat-and-burn-blueprint-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "home-muscle-builder-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "minimal" },
  "bodyweight-mass-plan-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "home-strength-gain-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "minimal" },
  "calisthenics-growth-system-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "bodyweight" },
  "lean-muscle-home-program-12w": { weeklySessions: 4, phaseCount: 6, equipmentKey: "minimal" },
  "gym-fat-loss-protocol-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "shred-and-sweat-gym-plan-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "cutting-system-gym-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "lean-machine-program-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "high-intensity-fat-burn-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "gym-mass-builder-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "hypertrophy-system-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "strength-and-size-blueprint-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "aesthetic-muscle-plan-12w": { weeklySessions: 5, phaseCount: 6, equipmentKey: "full_gym" },
  "home-fat-loss-starter": { weeklySessions: 3, phaseCount: 1, equipmentKey: "bodyweight" },
  "gym-muscle-starter": { weeklySessions: 4, phaseCount: 1, equipmentKey: "full_gym" },
  "clean-cut-starter": { weeklySessions: 7, phaseCount: 1, equipmentKey: "nutrition" },
  "lean-bulk-starter": { weeklySessions: 7, phaseCount: 1, equipmentKey: "nutrition" }
};

const displayCopy: Record<Locale, ProgramDisplayCopy> = {
  en: {
    goal: {
      fat: "Fat Loss",
      muscle: "Muscle Gain",
      recomp: "Recomp",
      performance: "Performance",
      nutrition: "Nutrition",
      general: "Structured"
    },
    location: { home: "Home", gym: "Gym", hybrid: "Hybrid" },
    level: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      all_levels: "All Levels"
    },
    equipment: {
      bodyweight: "Bodyweight",
      minimal: "Minimal Gear",
      full_gym: "Full Gym",
      nutrition: "Meal System"
    },
    tier: { elite: "Elite", popular: "Popular", fresh: "New", signature: "Signature" },
    sessionsPerWeek: (count) => `${count} sessions/week`,
    phases: (count) => `${count} phases`,
    previewReason: {
      fat: { home: "Home cutting system", gym: "Gym cutting system", hybrid: "Lean transformation system" },
      muscle: { home: "Home muscle-building system", gym: "Gym hypertrophy system", hybrid: "Progressive growth system" },
      recomp: { home: "Lean recomposition system", gym: "Recomposition gym system", hybrid: "Body recomposition system" },
      performance: { home: "Athletic home system", gym: "Performance gym system", hybrid: "Performance training system" },
      nutrition: { home: "Structured nutrition system", gym: "Structured nutrition system", hybrid: "Structured nutrition system" },
      general: { home: "Structured home system", gym: "Structured gym system", hybrid: "Structured training system" }
    }
  },
  tr: {
    goal: {
      fat: "Yag Yakimi",
      muscle: "Kas Gelisimi",
      recomp: "Recomp",
      performance: "Performans",
      nutrition: "Beslenme",
      general: "Yapilandirilmis"
    },
    location: { home: "Ev", gym: "Salon", hybrid: "Hibrit" },
    level: {
      beginner: "Baslangic",
      intermediate: "Orta",
      advanced: "Ileri",
      all_levels: "Tum Seviyeler"
    },
    equipment: {
      bodyweight: "Vucut Agirligi",
      minimal: "Minimal Ekipman",
      full_gym: "Tam Salon",
      nutrition: "Beslenme Sistemi"
    },
    tier: { elite: "Elite", popular: "Populer", fresh: "Yeni", signature: "Ozel" },
    sessionsPerWeek: (count) => `Haftada ${count} seans`,
    phases: (count) => `${count} faz`,
    previewReason: {
      fat: { home: "Evde definasyon sistemi", gym: "Salonda definasyon sistemi", hybrid: "Lean donusum sistemi" },
      muscle: { home: "Evde kas gelisim sistemi", gym: "Salonda hipertrofi sistemi", hybrid: "Asamali gelisim sistemi" },
      recomp: { home: "Evde recomp sistemi", gym: "Salonda recomp sistemi", hybrid: "Vucut kompozisyon sistemi" },
      performance: { home: "Atletik ev sistemi", gym: "Performans salon sistemi", hybrid: "Performans antrenman sistemi" },
      nutrition: { home: "Yapilandirilmis beslenme sistemi", gym: "Yapilandirilmis beslenme sistemi", hybrid: "Yapilandirilmis beslenme sistemi" },
      general: { home: "Yapilandirilmis ev sistemi", gym: "Yapilandirilmis salon sistemi", hybrid: "Yapilandirilmis antrenman sistemi" }
    }
  },
  ar: {
    goal: {
      fat: "خسارة دهون",
      muscle: "بناء عضلات",
      recomp: "إعادة تركيب",
      performance: "أداء",
      nutrition: "تغذية",
      general: "منظم"
    },
    location: { home: "منزل", gym: "جيم", hybrid: "هجين" },
    level: {
      beginner: "مبتدئ",
      intermediate: "متوسط",
      advanced: "متقدم",
      all_levels: "كل المستويات"
    },
    equipment: {
      bodyweight: "وزن الجسم",
      minimal: "معدات خفيفة",
      full_gym: "جيم كامل",
      nutrition: "نظام غذائي"
    },
    tier: { elite: "نخبة", popular: "الاكثر طلبا", fresh: "جديد", signature: "مميز" },
    sessionsPerWeek: (count) => `${count} حصص اسبوعيا`,
    phases: (count) => `${count} مراحل`,
    previewReason: {
      fat: { home: "نظام تنشيف منزلي", gym: "نظام تنشيف في الجيم", hybrid: "نظام تحول رشيق" },
      muscle: { home: "نظام بناء عضلات منزلي", gym: "نظام تضخم في الجيم", hybrid: "نظام نمو تدريجي" },
      recomp: { home: "نظام إعادة تركيب منزلي", gym: "نظام إعادة تركيب في الجيم", hybrid: "نظام إعادة تركيب الجسم" },
      performance: { home: "نظام أداء منزلي", gym: "نظام أداء في الجيم", hybrid: "نظام تدريب للأداء" },
      nutrition: { home: "نظام تغذية منظم", gym: "نظام تغذية منظم", hybrid: "نظام تغذية منظم" },
      general: { home: "نظام منزلي منظم", gym: "نظام جيم منظم", hybrid: "نظام تدريب منظم" }
    }
  },
  es: {
    goal: {
      fat: "Perdida de Grasa",
      muscle: "Ganancia Muscular",
      recomp: "Recomposicion",
      performance: "Rendimiento",
      nutrition: "Nutricion",
      general: "Estructurado"
    },
    location: { home: "Casa", gym: "Gimnasio", hybrid: "Hibrido" },
    level: {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      all_levels: "Todos los niveles"
    },
    equipment: {
      bodyweight: "Peso corporal",
      minimal: "Equipo minimo",
      full_gym: "Gimnasio completo",
      nutrition: "Sistema de comidas"
    },
    tier: { elite: "Elite", popular: "Popular", fresh: "Nuevo", signature: "Signature" },
    sessionsPerWeek: (count) => `${count} sesiones/semana`,
    phases: (count) => `${count} fases`,
    previewReason: {
      fat: { home: "Sistema de definicion en casa", gym: "Sistema de definicion en gimnasio", hybrid: "Sistema de transformacion lean" },
      muscle: { home: "Sistema de musculo en casa", gym: "Sistema de hipertrofia en gimnasio", hybrid: "Sistema de crecimiento progresivo" },
      recomp: { home: "Sistema de recomposicion en casa", gym: "Sistema de recomposicion en gimnasio", hybrid: "Sistema de recomposicion corporal" },
      performance: { home: "Sistema atletico en casa", gym: "Sistema de rendimiento en gimnasio", hybrid: "Sistema de rendimiento" },
      nutrition: { home: "Sistema nutricional estructurado", gym: "Sistema nutricional estructurado", hybrid: "Sistema nutricional estructurado" },
      general: { home: "Sistema estructurado en casa", gym: "Sistema estructurado en gimnasio", hybrid: "Sistema estructurado" }
    }
  },
  fr: {
    goal: {
      fat: "Perte de Graisse",
      muscle: "Prise de Muscle",
      recomp: "Recomposition",
      performance: "Performance",
      nutrition: "Nutrition",
      general: "Structure"
    },
    location: { home: "Maison", gym: "Salle", hybrid: "Hybride" },
    level: {
      beginner: "Debutant",
      intermediate: "Intermediaire",
      advanced: "Avance",
      all_levels: "Tous niveaux"
    },
    equipment: {
      bodyweight: "Poids du corps",
      minimal: "Materiel leger",
      full_gym: "Salle complete",
      nutrition: "Systeme nutrition"
    },
    tier: { elite: "Elite", popular: "Populaire", fresh: "Nouveau", signature: "Signature" },
    sessionsPerWeek: (count) => `${count} seances/semaine`,
    phases: (count) => `${count} phases`,
    previewReason: {
      fat: { home: "Systeme de seche maison", gym: "Systeme de seche salle", hybrid: "Systeme de transformation lean" },
      muscle: { home: "Systeme muscle maison", gym: "Systeme hypertrophie salle", hybrid: "Systeme de progression" },
      recomp: { home: "Systeme recomposition maison", gym: "Systeme recomposition salle", hybrid: "Systeme de recomposition" },
      performance: { home: "Systeme performance maison", gym: "Systeme performance salle", hybrid: "Systeme performance" },
      nutrition: { home: "Systeme nutrition structure", gym: "Systeme nutrition structure", hybrid: "Systeme nutrition structure" },
      general: { home: "Systeme structure maison", gym: "Systeme structure salle", hybrid: "Systeme structure" }
    }
  }
};

function inferGoalKey(program: Program, kind: CatalogProgramKind): CatalogGoalKey {
  if (kind === "diet") return "nutrition";
  const slug = program.slug.toLowerCase();
  const category = program.category.toLowerCase();
  const haystack = `${slug} ${category}`;
  if (haystack.includes("recomp")) return "recomp";
  if (haystack.includes("performance") || haystack.includes("athlete") || haystack.includes("sport")) return "performance";
  if (haystack.includes("fat") || haystack.includes("cut") || haystack.includes("shred") || haystack.includes("lean")) return "fat";
  if (haystack.includes("muscle") || haystack.includes("mass") || haystack.includes("strength") || haystack.includes("bulk")) return "muscle";
  return "general";
}

function inferLocationKey(program: Program, kind: CatalogProgramKind): CatalogLocationKey {
  if (kind === "diet") return "hybrid";
  const slug = program.slug.toLowerCase();
  const category = program.category.toLowerCase();
  if (slug.startsWith("home") || category.includes("home")) return "home";
  if (slug.startsWith("gym") || category.includes("gym")) return "gym";
  return "hybrid";
}

function inferLevelKey(program: Program): CatalogLevelKey {
  const difficulty = program.difficulty.toLowerCase();
  if (difficulty.includes("advanced")) return "advanced";
  if (difficulty.includes("intermediate")) return "intermediate";
  if (difficulty.includes("beginner")) return "beginner";
  return "all_levels";
}

function inferEquipmentKey(program: Program, kind: CatalogProgramKind, locationKey: CatalogLocationKey): CatalogEquipmentKey {
  if (kind === "diet") return "nutrition";
  const override = PROGRAM_STRUCTURE_OVERRIDES[program.slug];
  if (override?.equipmentKey) return override.equipmentKey;
  const equipmentText = program.requiredEquipment.join(" ").toLowerCase();
  if (!equipmentText.trim() || equipmentText.includes("no equipment") || equipmentText.includes("bodyweight")) return "bodyweight";
  if (locationKey === "gym" || equipmentText.includes("barbell") || equipmentText.includes("machine")) return "full_gym";
  return "minimal";
}

function inferWeeklySessions(program: Program, kind: CatalogProgramKind): number {
  if (kind === "diet") return 7;
  const override = PROGRAM_STRUCTURE_OVERRIDES[program.slug];
  if (override?.weeklySessions) return override.weeklySessions;
  const slug = program.slug.toLowerCase();
  if (slug.includes("push-pull") || slug.includes("hypertrophy") || slug.includes("strength")) return 5;
  if (slug.includes("starter") || slug.includes("cardio")) return 4;
  return 4;
}

function inferPhaseCount(program: Program, kind: CatalogProgramKind): number {
  if (kind === "diet") return 3;
  const override = PROGRAM_STRUCTURE_OVERRIDES[program.slug];
  if (override?.phaseCount) return override.phaseCount;
  return program.slug.includes("12w") ? 6 : 1;
}

function getTier(program: Program, locale: Locale) {
  const slug = program.slug.toLowerCase();
  const copy = displayCopy[locale] ?? displayCopy.en;
  if (slug.includes("advanced") || slug.includes("hardcore") || slug.includes("athlete")) return copy.tier.elite;
  if (slug.includes("shred") || slug.includes("bulk") || slug.includes("cut") || slug.includes("hypertrophy")) return copy.tier.popular;
  if (slug.includes("starter") || slug.includes("beginner")) return copy.tier.fresh;
  return copy.tier.signature;
}

function getFeaturedRank(program: Program, isCustomUpload: boolean | undefined): number | null {
  if (isCustomUpload) return null;
  return FEATURED_PROGRAM_RANKS[program.slug] ?? null;
}

function getCatalogRank(program: Program, kind: CatalogProgramKind, isCustomUpload: boolean | undefined) {
  if (isCustomUpload) return 40;
  if (kind === "diet") return 300;
  const featured = FEATURED_PROGRAM_RANKS[program.slug];
  if (featured) return featured;
  if (program.is_free) return 120;
  return 200;
}

function compareDatesDescending(a?: string, b?: string) {
  const aValue = a ? Date.parse(a) : 0;
  const bValue = b ? Date.parse(b) : 0;
  return bValue - aValue;
}

export function normalizeCatalogProgram(
  program: Program,
  locale: Locale,
  options?: { isCustomUpload?: boolean; createdAt?: string; kindOverride?: CatalogProgramKind }
): CatalogProgram {
  const copy = displayCopy[locale] ?? displayCopy.en;
  const kind = options?.kindOverride ?? (isCatalogDiet(program) ? "diet" : "program");
  const goalKey = inferGoalKey(program, kind);
  const locationKey = inferLocationKey(program, kind);
  const levelKey = inferLevelKey(program);
  const equipmentKey = inferEquipmentKey(program, kind, locationKey);
  const weeklySessions = inferWeeklySessions(program, kind);
  const phaseCount = inferPhaseCount(program, kind);
  const featuredRank = getFeaturedRank(program, options?.isCustomUpload);
  const catalogRank = getCatalogRank(program, kind, options?.isCustomUpload);
  const normalizedPrice = options?.isCustomUpload ? program.price : getProgramBasePriceTry(program);

  return {
    ...program,
    price: normalizedPrice,
    kind,
    goalKey,
    locationKey,
    levelKey,
    equipmentKey,
    weeklySessions,
    phaseCount,
    featuredRank,
    catalogRank,
    isCustomUpload: options?.isCustomUpload,
    createdAt: options?.createdAt,
    display: {
      goalBadge: copy.goal[goalKey],
      locationBadge: copy.location[locationKey],
      levelBadge: copy.level[levelKey],
      equipmentBadge: copy.equipment[equipmentKey],
      weeklyCommitmentBadge: copy.sessionsPerWeek(weeklySessions),
      metaLine: [copy.sessionsPerWeek(weeklySessions), copy.phases(phaseCount), copy.equipment[equipmentKey]].join(" • "),
      previewReason: copy.previewReason[goalKey][locationKey],
      tierLabel: getTier(program, locale)
    }
  };
}

export function normalizePublicCustomProgramRow(row: PublicCustomProgramRow, locale: Locale): CatalogProgram {
  return normalizeCatalogProgram(
    {
      slug: row.slug,
      title: row.title,
      category: row.category,
      difficulty: row.difficulty ?? "Beginner to Advanced",
      duration: row.duration ?? "12 weeks",
      price: row.price_try,
      description: row.description,
      coachSlug: "tjfit-team",
      requiredEquipment: [],
      previewImages: [],
      assets: [{ type: "pdf-guide", label: "Uploaded PDF" }],
      coachCommissionRate: 0
    },
    locale,
    {
      isCustomUpload: true,
      createdAt: row.created_at,
      kindOverride: row.kind
    }
  );
}

export function getFeaturedCatalogPrograms(programs: CatalogProgram[], count: number) {
  return [...programs]
    .sort((a, b) => {
      const aRank = a.featuredRank ?? Number.POSITIVE_INFINITY;
      const bRank = b.featuredRank ?? Number.POSITIVE_INFINITY;
      if (aRank !== bRank) return aRank - bRank;
      if (a.is_free !== b.is_free) return a.is_free ? 1 : -1;
      return a.catalogRank - b.catalogRank;
    })
    .slice(0, count);
}

export function sortCatalogPrograms(programs: CatalogProgram[], sortKey: CatalogSortKey) {
  return [...programs].sort((a, b) => {
    if (sortKey === "price_low") {
      if (a.price !== b.price) return a.price - b.price;
    } else if (sortKey === "price_high") {
      if (a.price !== b.price) return b.price - a.price;
    } else {
      if (a.featuredRank !== b.featuredRank) {
        const aRank = a.featuredRank ?? Number.POSITIVE_INFINITY;
        const bRank = b.featuredRank ?? Number.POSITIVE_INFINITY;
        if (aRank !== bRank) return aRank - bRank;
      }
      if (a.catalogRank !== b.catalogRank) return a.catalogRank - b.catalogRank;
      if (a.isCustomUpload || b.isCustomUpload) {
        const dateDelta = compareDatesDescending(a.createdAt, b.createdAt);
        if (dateDelta !== 0) return dateDelta;
      }
    }

    if (a.title !== b.title) return a.title.localeCompare(b.title);
    return a.slug.localeCompare(b.slug);
  });
}

export function matchesCatalogFilters(
  program: CatalogProgram,
  filters: {
    goal: CatalogGoalFilter;
    location: CatalogLocationFilter;
    level: CatalogLevelFilter;
    freeOnly: boolean;
  }
) {
  if (filters.goal !== "all" && program.goalKey !== filters.goal) return false;
  if (filters.location !== "all" && program.locationKey !== filters.location) return false;
  if (filters.level !== "all" && program.levelKey !== filters.level) return false;
  if (filters.freeOnly && (program.isCustomUpload || !program.is_free)) return false;
  return true;
}
