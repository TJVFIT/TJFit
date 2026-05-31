import type { Locale } from "@/lib/i18n";

export type SignupGoalKey = "lose_fat" | "build_muscle" | "home_training" | "recomposition";

type GoalDef = { key: SignupGoalKey; emoji: string; title: string; sub: string };

const GOALS_EN: GoalDef[] = [
  { key: "lose_fat", emoji: "🔥", title: "Lose Fat", sub: "Burn calories, build endurance" },
  { key: "build_muscle", emoji: "💪", title: "Build Muscle", sub: "Gain strength and size" },
  { key: "home_training", emoji: "🏠", title: "Train at Home", sub: "No gym, no problem" },
  { key: "recomposition", emoji: "⚖️", title: "Recomposition", sub: "Lose fat, gain muscle simultaneously" }
];

const GOALS_TR: GoalDef[] = [
  { key: "lose_fat", emoji: "🔥", title: "Yağ Yak", sub: "Kalori yak, dayanıklılık kazan" },
  { key: "build_muscle", emoji: "💪", title: "Kas Yap", sub: "Güç ve hacim" },
  { key: "home_training", emoji: "🏠", title: "Evde Antrenman", sub: "Spor salonu şart değil" },
  { key: "recomposition", emoji: "⚖️", title: "Rekompozisyon", sub: "Yağ azalt, kas koru" }
];

const GOALS_AR: GoalDef[] = [
  { key: "lose_fat", emoji: "🔥", title: "خسارة دهون", sub: "حرق سعرات وبناء تحمل" },
  { key: "build_muscle", emoji: "💪", title: "بناء عضلات", sub: "قوة وحجم" },
  { key: "home_training", emoji: "🏠", title: "تمرين في البيت", sub: "بدون نادٍ" },
  { key: "recomposition", emoji: "⚖️", title: "إعادة تكوين", sub: "خسارة دهون مع الحفاظ على العضل" }
];

const GOALS_ES: GoalDef[] = [
  { key: "lose_fat", emoji: "🔥", title: "Perder grasa", sub: "Quema calorías y gana resistencia" },
  { key: "build_muscle", emoji: "💪", title: "Ganar músculo", sub: "Fuerza y volumen" },
  { key: "home_training", emoji: "🏠", title: "Entrenar en casa", sub: "Sin gimnasio" },
  { key: "recomposition", emoji: "⚖️", title: "Recomposición", sub: "Perder grasa y ganar músculo" }
];

const GOALS_FR: GoalDef[] = [
  { key: "lose_fat", emoji: "🔥", title: "Perdre du gras", sub: "Brûler des calories, gagner en endurance" },
  { key: "build_muscle", emoji: "💪", title: "Prendre du muscle", sub: "Force et volume" },
  { key: "home_training", emoji: "🏠", title: "À la maison", sub: "Pas besoin de salle" },
  { key: "recomposition", emoji: "⚖️", title: "Recomposition", sub: "Gras en moins, muscle préservé" }
];

const BY_LOCALE: Record<Locale, GoalDef[]> = {
  en: GOALS_EN,
  tr: GOALS_TR,
  ar: GOALS_AR,
  es: GOALS_ES,
  fr: GOALS_FR
};

export function getSignupGoals(locale: Locale): GoalDef[] {
  return BY_LOCALE[locale] ?? GOALS_EN;
}
