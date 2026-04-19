import type { Locale } from "@/lib/i18n";

export type ProgramsMarketplaceCopy = {
  cinematicEyebrow: string;
  cinematicHeadlineBefore: string;
  cinematicHeadlineGradient: string;
  cinematicSub: string;
  filterLabel: string;
  filterGoal: string;
  filterLocation: string;
  filterLevel: string;
  sortLabel: string;
  all: string;
  goalFat: string;
  goalMuscle: string;
  goalRecomp: string;
  goalPerformance: string;
  locHome: string;
  locGym: string;
  locHybrid: string;
  levelBeginner: string;
  levelIntermediate: string;
  levelAdvanced: string;
  sortFeatured: string;
  sortPriceLow: string;
  sortPriceHigh: string;
  clearFilters: string;
  noMatches: string;
  browseDietsLink: string;
  emptyFilterTitle: string;
  emptyFilterSub: string;
  footerCta: string;
  tickerPrimary: string[];
  tickerSecondary: string[];
};

const c: Record<Locale, ProgramsMarketplaceCopy> = {
  en: {
    cinematicEyebrow: "TRANSFORMATION PROGRAMS",
    cinematicHeadlineBefore: "Find Your ",
    cinematicHeadlineGradient: "Program.",
    cinematicSub:
      "20 complete 12-week systems. Home or gym. Fat loss or muscle gain.",
    filterLabel: "Filters",
    filterGoal: "Goal",
    filterLocation: "Location",
    filterLevel: "Level",
    sortLabel: "Sort",
    all: "All",
    goalFat: "Fat Loss",
    goalMuscle: "Muscle Gain",
    goalRecomp: "Recomp",
    goalPerformance: "Performance",
    locHome: "Home",
    locGym: "Gym",
    locHybrid: "Hybrid",
    levelBeginner: "Beginner",
    levelIntermediate: "Intermediate",
    levelAdvanced: "Advanced",
    sortFeatured: "Featured",
    sortPriceLow: "Price: Low to High",
    sortPriceHigh: "Price: High to Low",
    clearFilters: "Clear",
    noMatches: "No programs match these filters.",
    browseDietsLink: "Browse diets",
    emptyFilterTitle: "No programs match your filter",
    emptyFilterSub: "Try adjusting your filters or browse all programs.",
    footerCta: "Not sure which program? Start with our free one →",
    tickerPrimary: ["FAT LOSS", "MUSCLE GAIN", "HOME SYSTEMS", "GYM SYSTEMS", "12 WEEKS", "PROGRESSIVE OVERLOAD"],
    tickerSecondary: ["BODYWEIGHT", "FULL GYM", "RECOVERY WEEKS", "COACH REVIEW", "SMART FILTERS", "CURATED RESULTS"]
  },
  tr: {
    cinematicEyebrow: "DONUSUM PROGRAMlari",
    cinematicHeadlineBefore: "Size uygun ",
    cinematicHeadlineGradient: "programi bulun.",
    cinematicSub:
      "20 adet 12 haftalik sistem. Ev veya salon. Yag yakimi veya kas gelisimi.",
    filterLabel: "Filtreler",
    filterGoal: "Hedef",
    filterLocation: "Konum",
    filterLevel: "Seviye",
    sortLabel: "Sirala",
    all: "Tumu",
    goalFat: "Yag yakimi",
    goalMuscle: "Kas gelisimi",
    goalRecomp: "Recomp",
    goalPerformance: "Performans",
    locHome: "Ev",
    locGym: "Salon",
    locHybrid: "Hibrit",
    levelBeginner: "Baslangic",
    levelIntermediate: "Orta",
    levelAdvanced: "Ileri",
    sortFeatured: "One Cikanlar",
    sortPriceLow: "Fiyat: Artan",
    sortPriceHigh: "Fiyat: Azalan",
    clearFilters: "Temizle",
    noMatches: "Bu filtrelere uyan program yok.",
    browseDietsLink: "Diyetlere git",
    emptyFilterTitle: "Filtreye uyan program yok",
    emptyFilterSub: "Filtreleri degistirin veya tum programlara goz atin.",
    footerCta: "Emin degil misiniz? Ucretsiz programla baslayin →",
    tickerPrimary: ["YAG YAKIMI", "KAS GELISIMI", "EV SISTEMLERI", "SALON SISTEMLERI", "12 HAFTA", "ASAMALI YUKLENME"],
    tickerSecondary: ["VUCUT AGIRLIGI", "TAM SALON", "DELOAD HAFTALARI", "KOC DEGERLENDIRMESI", "AKILLI FILTRELER", "SECILMIS SONUCLAR"]
  },
  ar: {
    cinematicEyebrow: "برامج التحويل",
    cinematicHeadlineBefore: "اعثر على ",
    cinematicHeadlineGradient: "برنامجك.",
    cinematicSub: "٢٠ نظاماً كاملاً لمدة ١٢ أسبوعاً. منزل أو صالة. حرق دهون أو بناء عضلات.",
    filterLabel: "عوامل التصفية",
    filterGoal: "الهدف",
    filterLocation: "المكان",
    filterLevel: "المستوى",
    sortLabel: "الترتيب",
    all: "الكل",
    goalFat: "خسارة دهون",
    goalMuscle: "بناء عضلات",
    goalRecomp: "إعادة تركيب",
    goalPerformance: "أداء",
    locHome: "منزل",
    locGym: "جيم",
    locHybrid: "هجين",
    levelBeginner: "مبتدئ",
    levelIntermediate: "متوسط",
    levelAdvanced: "متقدم",
    sortFeatured: "مميزة",
    sortPriceLow: "السعر: من الأقل",
    sortPriceHigh: "السعر: من الأعلى",
    clearFilters: "مسح",
    noMatches: "لا توجد نتائج.",
    browseDietsLink: "الأنظمة الغذائية",
    emptyFilterTitle: "لا توجد برامج مطابقة",
    emptyFilterSub: "جرّب تغيير الفلاتر أو تصفح كل البرامج.",
    footerCta: "لست متأكداً؟ ابدأ بالمجاني ←",
    tickerPrimary: ["خسارة دهون", "بناء عضلات", "أنظمة منزلية", "أنظمة جيم", "12 أسبوعاً", "تحميل تدريجي"],
    tickerSecondary: ["وزن الجسم", "جيم كامل", "أسابيع استشفاء", "مراجعة مدرب", "فلاتر ذكية", "نتائج مختارة"]
  },
  es: {
    cinematicEyebrow: "PROGRAMAS DE TRANSFORMACION",
    cinematicHeadlineBefore: "Encuentra tu ",
    cinematicHeadlineGradient: "programa.",
    cinematicSub: "20 sistemas completos de 12 semanas. Casa o gimnasio. Perder grasa o ganar musculo.",
    filterLabel: "Filtros",
    filterGoal: "Objetivo",
    filterLocation: "Lugar",
    filterLevel: "Nivel",
    sortLabel: "Ordenar",
    all: "Todos",
    goalFat: "Perder grasa",
    goalMuscle: "Ganar musculo",
    goalRecomp: "Recomp",
    goalPerformance: "Rendimiento",
    locHome: "Casa",
    locGym: "Gimnasio",
    locHybrid: "Hibrido",
    levelBeginner: "Principiante",
    levelIntermediate: "Intermedio",
    levelAdvanced: "Avanzado",
    sortFeatured: "Destacados",
    sortPriceLow: "Precio: Menor a mayor",
    sortPriceHigh: "Precio: Mayor a menor",
    clearFilters: "Limpiar",
    noMatches: "Sin resultados.",
    browseDietsLink: "Ver dietas",
    emptyFilterTitle: "Ningún programa coincide",
    emptyFilterSub: "Ajusta los filtros o mira todos los programas.",
    footerCta: "¿No sabes cuál? Empieza con el gratuito →",
    tickerPrimary: ["PERDIDA DE GRASA", "GANANCIA MUSCULAR", "SISTEMAS EN CASA", "SISTEMAS DE GIMNASIO", "12 SEMANAS", "SOBRECARGA PROGRESIVA"],
    tickerSecondary: ["PESO CORPORAL", "GIMNASIO COMPLETO", "SEMANAS DE RECUPERACION", "REVISION DE COACH", "FILTROS INTELIGENTES", "RESULTADOS CURADOS"]
  },
  fr: {
    cinematicEyebrow: "PROGRAMMES TRANSFORMATION",
    cinematicHeadlineBefore: "Trouvez votre ",
    cinematicHeadlineGradient: "programme.",
    cinematicSub:
      "20 systemes complets sur 12 semaines. Maison ou salle. Perte de graisse ou prise de muscle.",
    filterLabel: "Filtres",
    filterGoal: "Objectif",
    filterLocation: "Lieu",
    filterLevel: "Niveau",
    sortLabel: "Tri",
    all: "Tous",
    goalFat: "Perte de graisse",
    goalMuscle: "Prise de muscle",
    goalRecomp: "Recomposition",
    goalPerformance: "Performance",
    locHome: "Maison",
    locGym: "Salle",
    locHybrid: "Hybride",
    levelBeginner: "Debutant",
    levelIntermediate: "Intermediaire",
    levelAdvanced: "Avance",
    sortFeatured: "Mis en avant",
    sortPriceLow: "Prix croissant",
    sortPriceHigh: "Prix decroissant",
    clearFilters: "Reinitialiser",
    noMatches: "Aucun resultat.",
    browseDietsLink: "Voir les regimes",
    emptyFilterTitle: "Aucun programme ne correspond",
    emptyFilterSub: "Modifiez les filtres ou parcourez tous les programmes.",
    footerCta: "Pas sûr ? Commencez par le programme gratuit →",
    tickerPrimary: ["PERTE DE GRAISSE", "PRISE DE MUSCLE", "SYSTEMES MAISON", "SYSTEMES SALLE", "12 SEMAINES", "SURCHARGE PROGRESSIVE"],
    tickerSecondary: ["POIDS DU CORPS", "SALLE COMPLETE", "SEMAINES DE RECUPERATION", "REVUE COACH", "FILTRES INTELLIGENTS", "RESULTATS CURATES"]
  }
};

export function getProgramsMarketplaceCopy(locale: Locale): ProgramsMarketplaceCopy {
  return c[locale] ?? c.en;
}
