import type { Locale } from "@/lib/i18n";

export type SignupGoalKey = "lose_fat" | "build_muscle" | "home_training" | "recomposition";

type GoalDef = { key: SignupGoalKey; title: string; sub: string };

const GOALS_EN: GoalDef[] = [
  { key: "lose_fat", title: "Lose Fat", sub: "Burn calories, build endurance" },
  { key: "build_muscle", title: "Build Muscle", sub: "Gain strength and size" },
  { key: "home_training", title: "Train at Home", sub: "No gym, no problem" },
  { key: "recomposition", title: "Recomposition", sub: "Lose fat, gain muscle simultaneously" }
];

const GOALS_TR: GoalDef[] = [
  { key: "lose_fat", title: "Yağ Yak", sub: "Kalori yak, dayanıklılık kazan" },
  { key: "build_muscle", title: "Kas Yap", sub: "Güç ve hacim" },
  { key: "home_training", title: "Evde Antrenman", sub: "Spor salonu şart değil" },
  { key: "recomposition", title: "Rekompozisyon", sub: "Yağ azalt, kas koru" }
];

const GOALS_AR: GoalDef[] = [
  { key: "lose_fat", title: "خسارة دهون", sub: "حرق سعرات وبناء تحمل" },
  { key: "build_muscle", title: "بناء عضلات", sub: "قوة وحجم" },
  { key: "home_training", title: "تمرين في البيت", sub: "بدون نادٍ" },
  { key: "recomposition", title: "إعادة تكوين", sub: "خسارة دهون مع الحفاظ على العضل" }
];

const GOALS_ES: GoalDef[] = [
  { key: "lose_fat", title: "Perder grasa", sub: "Quema calorías y gana resistencia" },
  { key: "build_muscle", title: "Ganar músculo", sub: "Fuerza y volumen" },
  { key: "home_training", title: "Entrenar en casa", sub: "Sin gimnasio" },
  { key: "recomposition", title: "Recomposición", sub: "Perder grasa y ganar músculo" }
];

const GOALS_FR: GoalDef[] = [
  { key: "lose_fat", title: "Perdre du gras", sub: "Brûler des calories, gagner en endurance" },
  { key: "build_muscle", title: "Prendre du muscle", sub: "Force et volume" },
  { key: "home_training", title: "À la maison", sub: "Pas besoin de salle" },
  { key: "recomposition", title: "Recomposition", sub: "Gras en moins, muscle préservé" }
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
