import { resolveCopyLocale } from "@/lib/i18n";

/**
 * Localized chrome for the new bundle catalog surfaces: difficulty and
 * setting labels, audience/FAQ section headings, filter labels, the
 * weekly split strip, inside-stats labels, quiz UI, and the sticky bar.
 *
 * Same pattern as bundles-copy.ts — English is the source of truth,
 * bundle *content* stays English in the catalogue itself.
 */

export type BundleExtrasCopy = {
  difficultyLabels: Record<"beginner" | "intermediate" | "advanced", string>;
  settingLabels: Record<"gym" | "home" | "hybrid", string>;
  headings: {
    whoFor: string;
    whoNotFor: string;
    whatsInside: string;
    faq: string;
    compare: string;
    findYourBundle: string;
  };
  /** H2 under the faq eyebrow on the detail page. */
  faqTitle: string;
  filters: {
    goal: string;
    difficulty: string;
    equipment: string;
  };
  /** Split-strip label for a non-training day. */
  rest: string;
  /** Heading/aria label for the 7-day split strip. */
  weeklySplit: string;
  /** Short day-of-week labels keyed by the English abbreviations in weeklyTemplate. */
  dayLabels: Record<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun", string>;
  /** Labels for the computed bundleInsideStats counts. */
  statLabels: {
    recipes: string;
    trainingDays: string;
    weeks: string;
    groceryItems: string;
    phases: string;
  };
  quiz: {
    goalQuestion: string;
    experienceQuestion: string;
    equipmentQuestion: string;
    daysQuestion: string;
    goalOptions: {
      loseFat: string;
      buildMuscle: string;
      both: string;
      strength: string;
      conditioning: string;
      justStarting: string;
    };
    /** Equipment chip for "gym or home, both fine". */
    eitherOption: string;
    daysValue: (n: number) => string;
    stepOf: (step: number, total: number) => string;
    back: string;
    startOver: string;
    seeMatch: string;
    bestMatch: string;
    alsoConsider: string;
    tjaiPrompt: string;
    tjaiCta: string;
  };
  /** Price label when priceUsd === 0. */
  free: string;
  /** Comparison-table headers not covered by filters/statLabels. */
  compareTable: {
    bundle: string;
    goal: string;
    price: string;
  };
  /** Sticky-bar CTA. */
  viewOptions: string;
};

const COPY: Record<"en" | "tr" | "ar" | "es" | "fr", BundleExtrasCopy> = {
  en: {
    difficultyLabels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    },
    settingLabels: {
      gym: "Gym",
      home: "Home",
      hybrid: "Hybrid"
    },
    headings: {
      whoFor: "Who this is for",
      whoNotFor: "Not for you if",
      whatsInside: "What's inside",
      faq: "Frequently asked",
      compare: "Compare bundles",
      findYourBundle: "Find your bundle"
    },
    faqTitle: "Answers before you start",
    filters: {
      goal: "Goal",
      difficulty: "Difficulty",
      equipment: "Equipment"
    },
    rest: "Rest",
    weeklySplit: "Weekly split",
    dayLabels: {
      Mon: "Mon",
      Tue: "Tue",
      Wed: "Wed",
      Thu: "Thu",
      Fri: "Fri",
      Sat: "Sat",
      Sun: "Sun"
    },
    statLabels: {
      recipes: "Recipes",
      trainingDays: "Training days",
      weeks: "Weeks",
      groceryItems: "Grocery items",
      phases: "Phases"
    },
    quiz: {
      goalQuestion: "What is your main goal?",
      experienceQuestion: "How much training experience do you have?",
      equipmentQuestion: "What can you train with?",
      daysQuestion: "How many days a week can you train?",
      goalOptions: {
        loseFat: "Lose fat",
        buildMuscle: "Build muscle",
        both: "Both at once",
        strength: "Get stronger",
        conditioning: "Conditioning",
        justStarting: "Just starting out"
      },
      eitherOption: "Either works",
      daysValue: (n) => `${n} days`,
      stepOf: (step, total) => `Step ${step} of ${total}`,
      back: "Back",
      startOver: "Start over",
      seeMatch: "See my match",
      bestMatch: "Best match",
      alsoConsider: "Also consider",
      tjaiPrompt: "Want a fully personal AI plan?",
      tjaiCta: "Ask TJAI"
    },
    free: "Free",
    compareTable: {
      bundle: "Bundle",
      goal: "Goal",
      price: "Price"
    },
    viewOptions: "View options"
  },

  tr: {
    difficultyLabels: {
      beginner: "Başlangıç",
      intermediate: "Orta seviye",
      advanced: "İleri seviye"
    },
    settingLabels: {
      gym: "Spor salonu",
      home: "Ev",
      hybrid: "Karma"
    },
    headings: {
      whoFor: "Bu paket kimin için",
      whoNotFor: "Şu durumda sana göre değil",
      whatsInside: "Pakette neler var",
      faq: "Sık sorulan sorular",
      compare: "Paketleri karşılaştır",
      findYourBundle: "Paketini bul"
    },
    faqTitle: "Başlamadan önce yanıtlar",
    filters: {
      goal: "Hedef",
      difficulty: "Zorluk",
      equipment: "Ekipman"
    },
    rest: "Dinlenme",
    weeklySplit: "Haftalık düzen",
    dayLabels: {
      Mon: "Pzt",
      Tue: "Sal",
      Wed: "Çar",
      Thu: "Per",
      Fri: "Cum",
      Sat: "Cmt",
      Sun: "Paz"
    },
    statLabels: {
      recipes: "Tarif",
      trainingDays: "Antrenman günü",
      weeks: "Hafta",
      groceryItems: "Market kalemi",
      phases: "Evre"
    },
    quiz: {
      goalQuestion: "Ana hedefin ne?",
      experienceQuestion: "Ne kadar antrenman deneyimin var?",
      equipmentQuestion: "Hangi ekipmanla çalışabilirsin?",
      daysQuestion: "Haftada kaç gün antrenman yapabilirsin?",
      goalOptions: {
        loseFat: "Yağ yakmak",
        buildMuscle: "Kas yapmak",
        both: "İkisi birden",
        strength: "Güçlenmek",
        conditioning: "Kondisyon",
        justStarting: "Yeni başlıyorum"
      },
      eitherOption: "İkisi de olur",
      daysValue: (n) => `${n} gün`,
      stepOf: (step, total) => `Adım ${step} / ${total}`,
      back: "Geri",
      startOver: "Baştan başla",
      seeMatch: "Eşleşmemi gör",
      bestMatch: "En iyi eşleşme",
      alsoConsider: "Şunu da düşün",
      tjaiPrompt: "Tamamen kişisel bir yapay zeka planı ister misin?",
      tjaiCta: "TJAI'ye sor"
    },
    free: "Ücretsiz",
    compareTable: {
      bundle: "Paket",
      goal: "Hedef",
      price: "Fiyat"
    },
    viewOptions: "Seçenekleri gör"
  },

  ar: {
    difficultyLabels: {
      beginner: "مبتدئ",
      intermediate: "متوسط",
      advanced: "متقدم"
    },
    settingLabels: {
      gym: "صالة رياضية",
      home: "المنزل",
      hybrid: "مختلط"
    },
    headings: {
      whoFor: "لمن هذه الحزمة",
      whoNotFor: "ليست لك إذا",
      whatsInside: "ماذا تتضمن الحزمة",
      faq: "أسئلة شائعة",
      compare: "قارن الحزم",
      findYourBundle: "اعثر على حزمتك"
    },
    faqTitle: "إجابات قبل أن تبدأ",
    filters: {
      goal: "الهدف",
      difficulty: "الصعوبة",
      equipment: "المعدات"
    },
    rest: "راحة",
    weeklySplit: "الخطة الأسبوعية",
    dayLabels: {
      Mon: "الاثنين",
      Tue: "الثلاثاء",
      Wed: "الأربعاء",
      Thu: "الخميس",
      Fri: "الجمعة",
      Sat: "السبت",
      Sun: "الأحد"
    },
    statLabels: {
      recipes: "وصفات",
      trainingDays: "أيام تدريب",
      weeks: "أسابيع",
      groceryItems: "مواد تسوق",
      phases: "مراحل"
    },
    quiz: {
      goalQuestion: "ما هدفك الأساسي؟",
      experienceQuestion: "ما مقدار خبرتك في التدريب؟",
      equipmentQuestion: "ما المعدات المتاحة لديك؟",
      daysQuestion: "كم يوماً في الأسبوع يمكنك التدريب؟",
      goalOptions: {
        loseFat: "خسارة الدهون",
        buildMuscle: "بناء العضلات",
        both: "الاثنان معاً",
        strength: "زيادة القوة",
        conditioning: "لياقة وتحمّل",
        justStarting: "أبدأ من الصفر"
      },
      eitherOption: "كلاهما مناسب",
      daysValue: (n) => `${n} أيام`,
      stepOf: (step, total) => `الخطوة ${step} من ${total}`,
      back: "رجوع",
      startOver: "ابدأ من جديد",
      seeMatch: "اعرض ترشيحي",
      bestMatch: "أفضل تطابق",
      alsoConsider: "خيار آخر مناسب",
      tjaiPrompt: "هل تريد خطة ذكاء اصطناعي شخصية بالكامل؟",
      tjaiCta: "اسأل TJAI"
    },
    free: "مجاني",
    compareTable: {
      bundle: "الحزمة",
      goal: "الهدف",
      price: "السعر"
    },
    viewOptions: "عرض الخيارات"
  },

  es: {
    difficultyLabels: {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado"
    },
    settingLabels: {
      gym: "Gimnasio",
      home: "Casa",
      hybrid: "Mixto"
    },
    headings: {
      whoFor: "Para quién es",
      whoNotFor: "No es para ti si",
      whatsInside: "Qué incluye",
      faq: "Preguntas frecuentes",
      compare: "Compara los paquetes",
      findYourBundle: "Encuentra tu paquete"
    },
    faqTitle: "Respuestas antes de empezar",
    filters: {
      goal: "Objetivo",
      difficulty: "Dificultad",
      equipment: "Equipamiento"
    },
    rest: "Descanso",
    weeklySplit: "Plan semanal",
    dayLabels: {
      Mon: "Lun",
      Tue: "Mar",
      Wed: "Mié",
      Thu: "Jue",
      Fri: "Vie",
      Sat: "Sáb",
      Sun: "Dom"
    },
    statLabels: {
      recipes: "Recetas",
      trainingDays: "Días de entrenamiento",
      weeks: "Semanas",
      groceryItems: "Artículos de compra",
      phases: "Fases"
    },
    quiz: {
      goalQuestion: "¿Cuál es tu objetivo principal?",
      experienceQuestion: "¿Cuánta experiencia de entrenamiento tienes?",
      equipmentQuestion: "¿Con qué equipamiento cuentas?",
      daysQuestion: "¿Cuántos días a la semana puedes entrenar?",
      goalOptions: {
        loseFat: "Perder grasa",
        buildMuscle: "Ganar músculo",
        both: "Ambos a la vez",
        strength: "Ganar fuerza",
        conditioning: "Resistencia",
        justStarting: "Estoy empezando"
      },
      eitherOption: "Cualquiera de los dos",
      daysValue: (n) => `${n} días`,
      stepOf: (step, total) => `Paso ${step} de ${total}`,
      back: "Atrás",
      startOver: "Empezar de nuevo",
      seeMatch: "Ver mi paquete ideal",
      bestMatch: "Mejor opción",
      alsoConsider: "También considera",
      tjaiPrompt: "¿Quieres un plan de IA totalmente personal?",
      tjaiCta: "Pregunta a TJAI"
    },
    free: "Gratis",
    compareTable: {
      bundle: "Paquete",
      goal: "Objetivo",
      price: "Precio"
    },
    viewOptions: "Ver opciones"
  },

  fr: {
    difficultyLabels: {
      beginner: "Débutant",
      intermediate: "Intermédiaire",
      advanced: "Avancé"
    },
    settingLabels: {
      gym: "Salle de sport",
      home: "Maison",
      hybrid: "Mixte"
    },
    headings: {
      whoFor: "Pour qui est ce pack",
      whoNotFor: "Pas pour vous si",
      whatsInside: "Ce que contient le pack",
      faq: "Questions fréquentes",
      compare: "Comparer les packs",
      findYourBundle: "Trouvez votre pack"
    },
    faqTitle: "Des réponses avant de commencer",
    filters: {
      goal: "Objectif",
      difficulty: "Difficulté",
      equipment: "Équipement"
    },
    rest: "Repos",
    weeklySplit: "Semaine type",
    dayLabels: {
      Mon: "Lun",
      Tue: "Mar",
      Wed: "Mer",
      Thu: "Jeu",
      Fri: "Ven",
      Sat: "Sam",
      Sun: "Dim"
    },
    statLabels: {
      recipes: "Recettes",
      trainingDays: "Jours d'entraînement",
      weeks: "Semaines",
      groceryItems: "Articles de courses",
      phases: "Phases"
    },
    quiz: {
      goalQuestion: "Quel est votre objectif principal ?",
      experienceQuestion: "Quelle est votre expérience d'entraînement ?",
      equipmentQuestion: "Avec quel équipement pouvez-vous vous entraîner ?",
      daysQuestion: "Combien de jours par semaine pouvez-vous vous entraîner ?",
      goalOptions: {
        loseFat: "Perdre du gras",
        buildMuscle: "Prendre du muscle",
        both: "Les deux à la fois",
        strength: "Gagner en force",
        conditioning: "Endurance",
        justStarting: "Je débute"
      },
      eitherOption: "Les deux me vont",
      daysValue: (n) => `${n} jours`,
      stepOf: (step, total) => `Étape ${step} sur ${total}`,
      back: "Retour",
      startOver: "Recommencer",
      seeMatch: "Voir mon pack idéal",
      bestMatch: "Meilleur choix",
      alsoConsider: "À considérer aussi",
      tjaiPrompt: "Envie d'un plan IA entièrement personnel ?",
      tjaiCta: "Demander à TJAI"
    },
    free: "Gratuit",
    compareTable: {
      bundle: "Pack",
      goal: "Objectif",
      price: "Prix"
    },
    viewOptions: "Voir les options"
  }
};

export function getBundleExtrasCopy(locale: string): BundleExtrasCopy {
  return COPY[resolveCopyLocale(locale)];
}
