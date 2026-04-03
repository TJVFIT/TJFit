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
  emptyFilterTitle: string;
  emptyFilterSub: string;
  footerCta: string;
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
    browseDietsLink: "Browse diets",
    emptyFilterTitle: "No programs match your filter",
    emptyFilterSub: "Try adjusting your filters or browse all programs.",
    footerCta: "Not sure which program? Start with our free one →"
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
    browseDietsLink: "Diyetlere git",
    emptyFilterTitle: "Filtreye uyan program yok",
    emptyFilterSub: "Filtreleri degistirin veya tum programlara goz atin.",
    footerCta: "Emin degil misiniz? Ucretsiz programla baslayin →"
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
    browseDietsLink: "الأنظمة الغذائية",
    emptyFilterTitle: "لا توجد برامج مطابقة",
    emptyFilterSub: "جرّب تغيير الفلاتر أو تصفح كل البرامج.",
    footerCta: "لست متأكداً؟ ابدأ بالمجاني ←"
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
    browseDietsLink: "Ver dietas",
    emptyFilterTitle: "Ningún programa coincide",
    emptyFilterSub: "Ajusta los filtros o mira todos los programas.",
    footerCta: "¿No sabes cuál? Empieza con el gratuito →"
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
    browseDietsLink: "Voir les regimes",
    emptyFilterTitle: "Aucun programme ne correspond",
    emptyFilterSub: "Modifiez les filtres ou parcourez tous les programmes.",
    footerCta: "Pas sûr ? Commencez par le programme gratuit →"
  }
};

export function getProgramsMarketplaceCopy(locale: Locale): ProgramsMarketplaceCopy {
  return c[locale] ?? c.en;
}
