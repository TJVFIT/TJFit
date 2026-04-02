import type { Locale } from "@/lib/i18n";

export type ProgramsMarketplaceCopy = {
  filterLabel: string;
  filterGoal: string;
  filterLocation: string;
  all: string;
  goalFat: string;
  goalMuscle: string;
  locHome: string;
  locGym: string;
  clearFilters: string;
  noMatches: string;
  browseDietsLink: string;
};

const c: Record<Locale, ProgramsMarketplaceCopy> = {
  en: {
    filterLabel: "Filters",
    filterGoal: "Goal",
    filterLocation: "Location",
    all: "All",
    goalFat: "Fat Loss",
    goalMuscle: "Muscle Gain",
    locHome: "Home",
    locGym: "Gym",
    clearFilters: "Clear",
    noMatches: "No programs match these filters.",
    browseDietsLink: "Browse diets"
  },
  tr: {
    filterLabel: "Filtreler",
    filterGoal: "Hedef",
    filterLocation: "Konum",
    all: "Tumu",
    goalFat: "Yag yakimi",
    goalMuscle: "Kas gelisimi",
    locHome: "Ev",
    locGym: "Salon",
    clearFilters: "Temizle",
    noMatches: "Bu filtrelere uyan program yok.",
    browseDietsLink: "Diyetlere git"
  },
  ar: {
    filterLabel: "عوامل التصفية",
    filterGoal: "الهدف",
    filterLocation: "المكان",
    all: "الكل",
    goalFat: "خسارة دهون",
    goalMuscle: "بناء عضلات",
    locHome: "منزل",
    locGym: "جيم",
    clearFilters: "مسح",
    noMatches: "لا توجد نتائج.",
    browseDietsLink: "الأنظمة الغذائية"
  },
  es: {
    filterLabel: "Filtros",
    filterGoal: "Objetivo",
    filterLocation: "Lugar",
    all: "Todos",
    goalFat: "Perder grasa",
    goalMuscle: "Ganar musculo",
    locHome: "Casa",
    locGym: "Gimnasio",
    clearFilters: "Limpiar",
    noMatches: "Sin resultados.",
    browseDietsLink: "Ver dietas"
  },
  fr: {
    filterLabel: "Filtres",
    filterGoal: "Objectif",
    filterLocation: "Lieu",
    all: "Tous",
    goalFat: "Perte de graisse",
    goalMuscle: "Prise de muscle",
    locHome: "Maison",
    locGym: "Salle",
    clearFilters: "Reinitialiser",
    noMatches: "Aucun resultat.",
    browseDietsLink: "Voir les regimes"
  }
};

export function getProgramsMarketplaceCopy(locale: Locale): ProgramsMarketplaceCopy {
  return c[locale] ?? c.en;
}
