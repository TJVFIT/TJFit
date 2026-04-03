import type { Locale } from "@/lib/i18n";

export type DietsMarketplaceCopy = {
  filterLabel: string;
  filterType: string;
  all: string;
  cutting: string;
  bulking: string;
  clearFilters: string;
  noMatches: string;
  emptyFilterTitle: string;
  emptyFilterSub: string;
  footerCta: string;
  eyebrow: string;
  title: string;
  body: string;
  typeTagCutting: string;
  typeTagBulking: string;
  macroFocused: string;
  /** Link to training programs catalog */
  browseProgramsLink: string;
  formatTargetKcal: (kcal: number) => string;
  formatRangeKcal: (min: number, max: number) => string;
};

const copy: Record<Locale, DietsMarketplaceCopy> = {
  en: {
    filterLabel: "Filters",
    filterType: "Plan type",
    all: "All",
    cutting: "Cutting",
    bulking: "Bulking",
    clearFilters: "Clear",
    noMatches: "No diets match these filters.",
    emptyFilterTitle: "No diets match your filter",
    emptyFilterSub: "Try adjusting your filters or browse all diets.",
    footerCta: "Not sure which diet? Start with our free one →",
    eyebrow: "Nutrition Lab",
    title: "10 Full Diet Systems",
    body: "Cutting or bulking. Daily meals, macros, recipes, and progression.",
    typeTagCutting: "Cutting",
    typeTagBulking: "Bulking",
    macroFocused: "Macro-focused plan",
    browseProgramsLink: "Browse training programs",
    formatTargetKcal: (kcal) => `~${kcal} kcal / day`,
    formatRangeKcal: (min, max) => `~${min}–${max} kcal / day`
  },
  tr: {
    filterLabel: "Filtreler",
    filterType: "Plan tipi",
    all: "Tumu",
    cutting: "Kesim",
    bulking: "Bulk",
    clearFilters: "Temizle",
    noMatches: "Bu filtrelere uyan plan yok.",
    emptyFilterTitle: "Filtreye uyan diyet yok",
    emptyFilterSub: "Filtreleri degistirin veya tum diyetlere bakin.",
    footerCta: "Emin degil misiniz? Ucretsiz diyetle baslayin →",
    eyebrow: "Beslenme",
    title: "Kesim, kontrollu kas ve duzen icin yapilandirilmis ogun sistemleri.",
    body: "Kesim veya bulk ile filtrele. Ucretsiz baslangiclar giris sonrasi acilir; 12 haftalik sistemler tam protokol ve yukseltme yolu sunar.",
    typeTagCutting: "Kesim",
    typeTagBulking: "Bulk",
    macroFocused: "Makro odakli plan",
    browseProgramsLink: "Antrenman programlarina git",
    formatTargetKcal: (kcal) => `~${kcal} kcal / gun`,
    formatRangeKcal: (min, max) => `~${min}–${max} kcal / gun`
  },
  ar: {
    filterLabel: "عوامل التصفية",
    filterType: "نوع الخطة",
    all: "الكل",
    cutting: "تنشيف",
    bulking: "كتلة",
    clearFilters: "مسح",
    noMatches: "لا توجد أنظمة غذائية مطابقة.",
    emptyFilterTitle: "لا توجد أنظمة مطابقة",
    emptyFilterSub: "جرّب تغيير الفلاتر أو تصفح كل الأنظمة.",
    footerCta: "لست متأكداً؟ ابدأ بالمجاني ←",
    eyebrow: "التغذية",
    title: "أنظمة وجبات منظمة للتنشيف والزيادة الخالية والانتظام.",
    body: "صفِّ حسب التنشيف أو الكتلة. البدايات المجانية بعد تسجيل الدخول؛ أنظمة 12 أسبوعًا كاملة مع مسار ترقية.",
    typeTagCutting: "تنشيف",
    typeTagBulking: "كتلة",
    macroFocused: "خطة ماكرو",
    browseProgramsLink: "برامج التمارين",
    formatTargetKcal: (kcal) => `~${kcal} سعرة / يوم`,
    formatRangeKcal: (min, max) => `~${min}–${max} سعرة / يوم`
  },
  es: {
    filterLabel: "Filtros",
    filterType: "Tipo",
    all: "Todos",
    cutting: "Definicion",
    bulking: "Volumen",
    clearFilters: "Limpiar",
    noMatches: "Ninguna dieta coincide.",
    emptyFilterTitle: "Ninguna dieta coincide",
    emptyFilterSub: "Ajusta los filtros o mira todas las dietas.",
    footerCta: "¿No sabes cuál? Empieza con la gratuita →",
    eyebrow: "Nutricion",
    title: "Sistemas de comidas para definicion, ganancia limpia y constancia.",
    body: "Filtra por definicion o volumen. Los starters gratis tras iniciar sesion; los sistemas de 12 semanas incluyen protocolo completo.",
    typeTagCutting: "Definicion",
    typeTagBulking: "Volumen",
    macroFocused: "Plan de macros",
    browseProgramsLink: "Ver programas de entrenamiento",
    formatTargetKcal: (kcal) => `~${kcal} kcal / dia`,
    formatRangeKcal: (min, max) => `~${min}–${max} kcal / dia`
  },
  fr: {
    filterLabel: "Filtres",
    filterType: "Type",
    all: "Tous",
    cutting: "Seche",
    bulking: "Prise de masse",
    clearFilters: "Reinitialiser",
    noMatches: "Aucun regime ne correspond.",
    emptyFilterTitle: "Aucun régime ne correspond",
    emptyFilterSub: "Modifiez les filtres ou parcourez tous les régimes.",
    footerCta: "Pas sûr ? Commencez par le gratuit →",
    eyebrow: "Nutrition",
    title: "Systemes de repas structures pour seche, prise maigre et regularite.",
    body: "Filtrez seche ou prise de masse. Starters gratuits apres connexion; parcours 12 semaines complets avec montee de gamme.",
    typeTagCutting: "Seche",
    typeTagBulking: "Masse",
    macroFocused: "Plan macros",
    browseProgramsLink: "Voir les programmes d'entrainement",
    formatTargetKcal: (kcal) => `~${kcal} kcal / jour`,
    formatRangeKcal: (min, max) => `~${min}–${max} kcal / jour`
  }
};

export function getDietsMarketplaceCopy(locale: Locale): DietsMarketplaceCopy {
  return copy[locale] ?? copy.en;
}
