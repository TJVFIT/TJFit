import type { Locale } from "@/lib/i18n";
import { COUNTRIES, getMarketsForCountry } from "@/lib/tjai/markets-by-country";
import type { QuizOption, QuizStage, QuizStep } from "@/lib/tjai-types";

/**
 * TJAI v2 — three-stage intake (Personal → Local → Health).
 *
 * This file owns the question set only. The renderer is the existing
 * `TJAIQuiz` component, which already handles `showIf` adaptive logic,
 * auto-save, and live calculation. v2 layers a `stage` field on top so
 * the UI can render a phase indicator.
 *
 * PR1 ships Stage 1 (persona + personal). Stages 2 + 3 land in
 * subsequent PRs to keep changes reviewable.
 */

const STAGE_LABELS: Record<Locale, Record<QuizStage, string>> = {
  en: {
    persona: "Coach style",
    personal: "About you",
    local: "Your area",
    health: "Health & safety"
  },
  tr: {
    persona: "Koç stili",
    personal: "Hakkında",
    local: "Bölgen",
    health: "Sağlık & güvenlik"
  },
  ar: {
    persona: "أسلوب المدرب",
    personal: "عنك",
    local: "منطقتك",
    health: "الصحة والسلامة"
  },
  es: {
    persona: "Estilo de coach",
    personal: "Sobre ti",
    local: "Tu zona",
    health: "Salud y seguridad"
  },
  fr: {
    persona: "Style de coach",
    personal: "À propos de toi",
    local: "Ta région",
    health: "Santé et sécurité"
  }
};

export function getStageLabel(locale: Locale, stage: QuizStage): string {
  return (STAGE_LABELS[locale] ?? STAGE_LABELS.en)[stage];
}

const PERSONA_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "drill", label: "Drill Sergeant", hint: "Intense. No excuses. Pushes you." },
    { value: "clinical", label: "Clinical", hint: "Evidence-driven, calm, precise." },
    { value: "mentor", label: "Mentor", hint: "Warm, patient, in your corner." }
  ],
  tr: [
    { value: "drill", label: "Çavuş", hint: "Yoğun. Mazeret yok. Seni iter." },
    { value: "clinical", label: "Klinik", hint: "Kanıt odaklı, sakin, kesin." },
    { value: "mentor", label: "Mentor", hint: "Sıcak, sabırlı, yanında." }
  ],
  ar: [
    { value: "drill", label: "صارم", hint: "مكثّف. لا أعذار. يدفعك للأمام." },
    { value: "clinical", label: "إكلينيكي", hint: "مبني على الأدلة، هادئ، دقيق." },
    { value: "mentor", label: "مرشد", hint: "دافئ، صبور، بجانبك." }
  ],
  es: [
    { value: "drill", label: "Sargento", hint: "Intenso. Sin excusas. Te empuja." },
    { value: "clinical", label: "Clínico", hint: "Basado en evidencia, calmado, preciso." },
    { value: "mentor", label: "Mentor", hint: "Cercano, paciente, contigo." }
  ],
  fr: [
    { value: "drill", label: "Sergent", hint: "Intense. Pas d'excuses. Te pousse." },
    { value: "clinical", label: "Clinique", hint: "Fondé sur les preuves, calme, précis." },
    { value: "mentor", label: "Mentor", hint: "Chaleureux, patient, à tes côtés." }
  ]
};

const SEX_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
  ],
  tr: [
    { value: "male", label: "Erkek" },
    { value: "female", label: "Kadın" }
  ],
  ar: [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" }
  ],
  es: [
    { value: "male", label: "Hombre" },
    { value: "female", label: "Mujer" }
  ],
  fr: [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" }
  ]
};

const GOAL_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "fat_loss", label: "Lose fat", hint: "Drop body fat, keep muscle." },
    { value: "muscle_gain", label: "Build muscle", hint: "Gain size with quality." },
    { value: "recomposition", label: "Recomp", hint: "Lose fat + build muscle together." },
    { value: "performance", label: "Performance", hint: "Strength or athletic capacity." },
    { value: "recovery", label: "Recovery / health", hint: "Move better, feel better." }
  ],
  tr: [
    { value: "fat_loss", label: "Yağ yak", hint: "Yağ at, kası koru." },
    { value: "muscle_gain", label: "Kas yap", hint: "Temiz kas alımı." },
    { value: "recomposition", label: "Rekompozisyon", hint: "Aynı anda yağ yak + kas yap." },
    { value: "performance", label: "Performans", hint: "Kuvvet veya atletik kapasite." },
    { value: "recovery", label: "İyileşme / sağlık", hint: "Daha iyi hareket et, daha iyi hisset." }
  ],
  ar: [
    { value: "fat_loss", label: "خسارة دهون", hint: "نزّل الدهون مع الحفاظ على العضل." },
    { value: "muscle_gain", label: "بناء عضل", hint: "زيادة حجم نظيفة." },
    { value: "recomposition", label: "إعادة تركيب", hint: "نزّل دهون وارفع عضل معاً." },
    { value: "performance", label: "أداء", hint: "قوة أو قدرة رياضية." },
    { value: "recovery", label: "تعافٍ / صحة", hint: "حركة أفضل، شعور أفضل." }
  ],
  es: [
    { value: "fat_loss", label: "Perder grasa", hint: "Bajar grasa, mantener músculo." },
    { value: "muscle_gain", label: "Ganar músculo", hint: "Crecimiento limpio." },
    { value: "recomposition", label: "Recomposición", hint: "Perder grasa y ganar músculo a la vez." },
    { value: "performance", label: "Rendimiento", hint: "Fuerza o capacidad atlética." },
    { value: "recovery", label: "Recuperación / salud", hint: "Moverte mejor, sentirte mejor." }
  ],
  fr: [
    { value: "fat_loss", label: "Perdre du gras", hint: "Réduire le gras, garder le muscle." },
    { value: "muscle_gain", label: "Prendre du muscle", hint: "Croissance propre." },
    { value: "recomposition", label: "Recomposition", hint: "Perdre du gras + prendre du muscle." },
    { value: "performance", label: "Performance", hint: "Force ou capacité athlétique." },
    { value: "recovery", label: "Récupération / santé", hint: "Mieux bouger, mieux te sentir." }
  ]
};

const STRESS_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "very_low", label: "Very low" },
    { value: "low", label: "Low" },
    { value: "moderate", label: "Moderate" },
    { value: "high", label: "High" },
    { value: "very_high", label: "Very high" }
  ],
  tr: [
    { value: "very_low", label: "Çok düşük" },
    { value: "low", label: "Düşük" },
    { value: "moderate", label: "Orta" },
    { value: "high", label: "Yüksek" },
    { value: "very_high", label: "Çok yüksek" }
  ],
  ar: [
    { value: "very_low", label: "منخفض جداً" },
    { value: "low", label: "منخفض" },
    { value: "moderate", label: "متوسط" },
    { value: "high", label: "مرتفع" },
    { value: "very_high", label: "مرتفع جداً" }
  ],
  es: [
    { value: "very_low", label: "Muy bajo" },
    { value: "low", label: "Bajo" },
    { value: "moderate", label: "Medio" },
    { value: "high", label: "Alto" },
    { value: "very_high", label: "Muy alto" }
  ],
  fr: [
    { value: "very_low", label: "Très bas" },
    { value: "low", label: "Bas" },
    { value: "moderate", label: "Moyen" },
    { value: "high", label: "Élevé" },
    { value: "very_high", label: "Très élevé" }
  ]
};

const JOB_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "desk", label: "Desk job", hint: "Mostly seated." },
    { value: "active", label: "Active job", hint: "On your feet some of the day." },
    { value: "physical", label: "Physical job", hint: "Manual labor most of the day." }
  ],
  tr: [
    { value: "desk", label: "Masa başı", hint: "Çoğunlukla oturuyorsun." },
    { value: "active", label: "Aktif iş", hint: "Günün bir kısmı ayakta." },
    { value: "physical", label: "Fiziksel iş", hint: "Çoğu gün el işi." }
  ],
  ar: [
    { value: "desk", label: "مكتب", hint: "غالباً جالس." },
    { value: "active", label: "نشط", hint: "تتحرك جزء من اليوم." },
    { value: "physical", label: "بدني", hint: "عمل يدوي معظم اليوم." }
  ],
  es: [
    { value: "desk", label: "Oficina", hint: "Mayormente sentado." },
    { value: "active", label: "Activo", hint: "De pie parte del día." },
    { value: "physical", label: "Físico", hint: "Trabajo manual la mayoría del día." }
  ],
  fr: [
    { value: "desk", label: "Bureau", hint: "Surtout assis." },
    { value: "active", label: "Actif", hint: "Debout une partie de la journée." },
    { value: "physical", label: "Physique", hint: "Travail manuel la majeure partie." }
  ]
};

const TRAINING_HISTORY_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "none", label: "Brand new", hint: "Less than 3 months of consistent training." },
    { value: "novice", label: "Some experience", hint: "3–12 months total." },
    { value: "intermediate", label: "Intermediate", hint: "1–3 years consistent." },
    { value: "advanced", label: "Advanced", hint: "3+ years consistent." }
  ],
  tr: [
    { value: "none", label: "Yeni başlayan", hint: "3 aydan az tutarlı antrenman." },
    { value: "novice", label: "Az deneyim", hint: "3–12 ay toplam." },
    { value: "intermediate", label: "Orta", hint: "1–3 yıl tutarlı." },
    { value: "advanced", label: "İleri", hint: "3+ yıl tutarlı." }
  ],
  ar: [
    { value: "none", label: "جديد", hint: "أقل من 3 أشهر من التدريب المنتظم." },
    { value: "novice", label: "خبرة بسيطة", hint: "3–12 شهراً إجمالاً." },
    { value: "intermediate", label: "متوسط", hint: "1–3 سنوات منتظمة." },
    { value: "advanced", label: "متقدم", hint: "3+ سنوات منتظمة." }
  ],
  es: [
    { value: "none", label: "Principiante", hint: "Menos de 3 meses constante." },
    { value: "novice", label: "Algo de experiencia", hint: "3–12 meses en total." },
    { value: "intermediate", label: "Intermedio", hint: "1–3 años constante." },
    { value: "advanced", label: "Avanzado", hint: "3+ años constante." }
  ],
  fr: [
    { value: "none", label: "Débutant", hint: "Moins de 3 mois régulier." },
    { value: "novice", label: "Un peu d'expérience", hint: "3–12 mois au total." },
    { value: "intermediate", label: "Intermédiaire", hint: "1–3 ans régulier." },
    { value: "advanced", label: "Avancé", hint: "3+ ans régulier." }
  ]
};

const SESSION_LENGTH_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "short", label: "30 min" },
    { value: "standard", label: "45–60 min" },
    { value: "long", label: "75–90 min" }
  ],
  tr: [
    { value: "short", label: "30 dk" },
    { value: "standard", label: "45–60 dk" },
    { value: "long", label: "75–90 dk" }
  ],
  ar: [
    { value: "short", label: "30 د" },
    { value: "standard", label: "45–60 د" },
    { value: "long", label: "75–90 د" }
  ],
  es: [
    { value: "short", label: "30 min" },
    { value: "standard", label: "45–60 min" },
    { value: "long", label: "75–90 min" }
  ],
  fr: [
    { value: "short", label: "30 min" },
    { value: "standard", label: "45–60 min" },
    { value: "long", label: "75–90 min" }
  ]
};

type Section = "persona" | "personal" | "lifestyle" | "schedule";

const SECTION_LABEL: Record<Locale, Record<Section, string>> = {
  en: {
    persona: "Coach style",
    personal: "About you",
    lifestyle: "Lifestyle",
    schedule: "Schedule"
  },
  tr: {
    persona: "Koç stili",
    personal: "Hakkında",
    lifestyle: "Yaşam tarzı",
    schedule: "Program"
  },
  ar: {
    persona: "أسلوب المدرب",
    personal: "عنك",
    lifestyle: "نمط الحياة",
    schedule: "الجدول"
  },
  es: {
    persona: "Estilo de coach",
    personal: "Sobre ti",
    lifestyle: "Estilo de vida",
    schedule: "Horario"
  },
  fr: {
    persona: "Style de coach",
    personal: "À propos",
    lifestyle: "Mode de vie",
    schedule: "Emploi du temps"
  }
};

/**
 * Stage-1 question set. ~14 questions, all adaptive via showIf.
 *
 * Stages 2 (local) and 3 (health) come in PR2 and PR3.
 */
export function getTjaiV2Stage1Steps(locale: Locale): QuizStep[] {
  const t = (en: string, tr: string, ar: string, es: string, fr: string) =>
    ({ en, tr, ar, es, fr }[locale] ?? en);
  const sec = SECTION_LABEL[locale] ?? SECTION_LABEL.en;
  const totalStages = 3;

  return [
    // ─── PERSONA ─────────────────────────────────────────────
    {
      id: "persona",
      stage: "persona",
      section: sec.persona,
      sectionNumber: 1,
      totalSections: totalStages,
      question: t(
        "Pick a coaching style.",
        "Bir koçluk stili seç.",
        "اختر أسلوب التدريب.",
        "Elige un estilo de coach.",
        "Choisis un style de coach."
      ),
      sub: t(
        "You can change this anytime in settings.",
        "Bunu istediğin zaman ayarlardan değiştirebilirsin.",
        "يمكنك تغييره في أي وقت من الإعدادات.",
        "Puedes cambiarlo cuando quieras en ajustes.",
        "Tu peux le changer à tout moment dans les réglages."
      ),
      type: "single",
      options: PERSONA_OPTIONS[locale] ?? PERSONA_OPTIONS.en,
      required: true
    },

    // ─── PERSONAL: NAME ─────────────────────────────────────
    {
      id: "first_name",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "What should we call you?",
        "Sana nasıl hitap edelim?",
        "كيف نناديك؟",
        "¿Cómo te llamamos?",
        "Comment t'appeler ?"
      ),
      type: "text",
      placeholder: t("First name", "Ad", "الاسم الأول", "Nombre", "Prénom"),
      required: true
    },

    // ─── PERSONAL: SEX ─────────────────────────────────────
    {
      id: "sex",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "Biological sex?",
        "Biyolojik cinsiyet?",
        "الجنس البيولوجي؟",
        "¿Sexo biológico?",
        "Sexe biologique ?"
      ),
      sub: t(
        "Used only for accurate calorie + macro math.",
        "Sadece kalori + makro hesabı için kullanılır.",
        "تُستخدم فقط لحسابات السعرات والماكروز.",
        "Solo para cálculos de calorías y macros.",
        "Utilisé uniquement pour les calculs caloriques."
      ),
      type: "single",
      options: SEX_OPTIONS[locale] ?? SEX_OPTIONS.en,
      required: true
    },

    // ─── PERSONAL: AGE ─────────────────────────────────────
    {
      id: "age",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t("Age?", "Yaş?", "العمر؟", "¿Edad?", "Âge ?"),
      type: "number",
      unit: t("years", "yaş", "سنة", "años", "ans"),
      min: 13,
      max: 90,
      defaultValue: 25,
      required: true
    },

    // ─── PERSONAL: HEIGHT ─────────────────────────────────────
    {
      id: "height_cm",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t("Height?", "Boy?", "الطول؟", "¿Estatura?", "Taille ?"),
      type: "number",
      unit: "cm",
      min: 130,
      max: 220,
      defaultValue: 175,
      required: true
    },

    // ─── PERSONAL: WEIGHT ─────────────────────────────────────
    {
      id: "weight_kg",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t("Current weight?", "Mevcut kilo?", "الوزن الحالي؟", "¿Peso actual?", "Poids actuel ?"),
      type: "number",
      unit: "kg",
      min: 35,
      max: 250,
      defaultValue: 75,
      required: true
    },

    // ─── PERSONAL: BODY TYPE ─────────────────────────────────
    // Visual silhouette renderer is gated to a specific legacy step ID
    // in the existing quiz component. PR2 will wire a v2-aware renderer;
    // for now we ship a labeled single-select that maps to the same
    // downstream profile values.
    {
      id: "body_type",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "Which body type is closest?",
        "Hangi vücut tipi sana en yakın?",
        "أي نوع جسم أقرب لك؟",
        "¿Qué tipo de cuerpo es más cercano?",
        "Quel type de corps est le plus proche ?"
      ),
      sub: t(
        "Helps estimate body fat without a scale.",
        "Tartısız vücut yağını tahmin etmemize yardım eder.",
        "يساعد على تقدير دهون الجسم دون ميزان.",
        "Ayuda a estimar grasa corporal sin báscula.",
        "Aide à estimer la masse grasse sans balance."
      ),
      type: "single",
      options: [
        {
          value: "very_lean",
          label: t("Very lean", "Çok ince", "نحيف جداً", "Muy delgado", "Très mince"),
          hint: t("~8–12% BF", "~%8–12 yağ", "~8–12٪ دهون", "~8–12% grasa", "~8–12% MG")
        },
        {
          value: "lean",
          label: t("Lean", "İnce", "نحيف", "Delgado", "Mince"),
          hint: t("~12–17% BF", "~%12–17 yağ", "~12–17٪ دهون", "~12–17% grasa", "~12–17% MG")
        },
        {
          value: "average",
          label: t("Average", "Ortalama", "متوسط", "Promedio", "Moyen"),
          hint: t("~17–25% BF", "~%17–25 yağ", "~17–25٪ دهون", "~17–25% grasa", "~17–25% MG")
        },
        {
          value: "overweight",
          label: t("Overweight", "Kilolu", "زائد الوزن", "Con sobrepeso", "En surpoids"),
          hint: t("~25–32% BF", "~%25–32 yağ", "~25–32٪ دهون", "~25–32% grasa", "~25–32% MG")
        },
        {
          value: "obese",
          label: t("Obese", "Obez", "سمنة", "Obeso", "Obèse"),
          hint: t("~32%+ BF", "~%32+ yağ", "~32٪+ دهون", "~32%+ grasa", "~32%+ MG")
        }
      ],
      required: true
    },

    // ─── PERSONAL: GOAL ─────────────────────────────────────
    {
      id: "goal",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "What's your main goal?",
        "Ana hedefin ne?",
        "ما هدفك الأساسي؟",
        "¿Cuál es tu objetivo principal?",
        "Quel est ton objectif principal ?"
      ),
      type: "single",
      options: GOAL_OPTIONS[locale] ?? GOAL_OPTIONS.en,
      required: true
    },

    // ─── PERSONAL: TRAINING HISTORY ──────────────────────────
    {
      id: "training_history",
      stage: "personal",
      section: sec.personal,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "Training experience?",
        "Antrenman tecrüben?",
        "خبرتك التدريبية؟",
        "¿Experiencia entrenando?",
        "Expérience d'entraînement ?"
      ),
      type: "single",
      options: TRAINING_HISTORY_OPTIONS[locale] ?? TRAINING_HISTORY_OPTIONS.en,
      required: true
    },

    // ─── SCHEDULE: DAYS / WEEK ──────────────────────────────
    {
      id: "days_per_week",
      stage: "personal",
      section: sec.schedule,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "How many days a week can you train?",
        "Haftada kaç gün antrenman yapabilirsin?",
        "كم يوماً في الأسبوع يمكنك التدريب؟",
        "¿Cuántos días por semana puedes entrenar?",
        "Combien de jours par semaine ?"
      ),
      sub: t(
        "Be honest — we'll build around what you can actually commit.",
        "Dürüst ol — gerçekten ayırabileceğin zamana göre kurarız.",
        "كن صادقاً — سنبني حسب ما تستطيع فعلاً.",
        "Sé honesto — construimos según lo que puedas cumplir.",
        "Sois honnête — on construira selon ce que tu peux tenir."
      ),
      type: "number",
      unit: t("days", "gün", "أيام", "días", "jours"),
      min: 0,
      max: 7,
      defaultValue: 4,
      required: true
    },

    // ─── SCHEDULE: SESSION LENGTH ───────────────────────────
    {
      id: "session_length",
      stage: "personal",
      section: sec.schedule,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "How long can each session be?",
        "Her seans ne kadar sürebilir?",
        "ما طول كل جلسة؟",
        "¿Cuánto puede durar cada sesión?",
        "Combien de temps par séance ?"
      ),
      type: "single",
      options: SESSION_LENGTH_OPTIONS[locale] ?? SESSION_LENGTH_OPTIONS.en,
      required: true,
      showIf: {
        mode: "all",
        conditions: [{ stepId: "days_per_week", value: 0, operator: "not_equals" }]
      }
    },

    // ─── LIFESTYLE: SLEEP ───────────────────────────────────
    {
      id: "sleep_hours",
      stage: "personal",
      section: sec.lifestyle,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "Average sleep per night?",
        "Gecede ortalama uyku?",
        "متوسط النوم في الليلة؟",
        "¿Promedio de sueño por noche?",
        "Sommeil moyen par nuit ?"
      ),
      type: "number",
      unit: t("hours", "saat", "ساعات", "horas", "heures"),
      min: 3,
      max: 12,
      step: 0.5,
      defaultValue: 7,
      required: true
    },

    // ─── LIFESTYLE: STRESS ──────────────────────────────────
    {
      id: "stress_level",
      stage: "personal",
      section: sec.lifestyle,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "Daily stress level?",
        "Günlük stres seviyesi?",
        "مستوى التوتر اليومي؟",
        "¿Nivel de estrés diario?",
        "Niveau de stress quotidien ?"
      ),
      type: "single",
      options: STRESS_OPTIONS[locale] ?? STRESS_OPTIONS.en,
      required: true
    },

    // ─── LIFESTYLE: JOB ─────────────────────────────────────
    {
      id: "job_type",
      stage: "personal",
      section: sec.lifestyle,
      sectionNumber: 2,
      totalSections: totalStages,
      question: t(
        "What's your job like, day to day?",
        "İşin günden güne nasıl?",
        "كيف هو عملك يومياً؟",
        "¿Cómo es tu día laboral?",
        "À quoi ressemble ta journée de travail ?"
      ),
      type: "single",
      options: JOB_OPTIONS[locale] ?? JOB_OPTIONS.en,
      required: true
    }
  ];
}

// ───────────────────────────────────────────────────────────────────
// STAGE 2 — LOCAL (PR2)
// ───────────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS: QuizOption[] = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  hint: c.currencySymbol
}));

const UNITS_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "metric", label: "Metric", hint: "kg / cm" },
    { value: "imperial", label: "Imperial", hint: "lb / ft" }
  ],
  tr: [
    { value: "metric", label: "Metrik", hint: "kg / cm" },
    { value: "imperial", label: "İmperyal", hint: "lb / ft" }
  ],
  ar: [
    { value: "metric", label: "متري", hint: "كجم / سم" },
    { value: "imperial", label: "إمبراطوري", hint: "رطل / قدم" }
  ],
  es: [
    { value: "metric", label: "Métrico", hint: "kg / cm" },
    { value: "imperial", label: "Imperial", hint: "lb / ft" }
  ],
  fr: [
    { value: "metric", label: "Métrique", hint: "kg / cm" },
    { value: "imperial", label: "Impérial", hint: "lb / ft" }
  ]
};

const COOK_TIME_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "15", label: "≤ 15 min", hint: "Fast meals only." },
    { value: "30", label: "≤ 30 min", hint: "Standard prep." },
    { value: "60", label: "≤ 60 min", hint: "Comfortable cooking." },
    { value: "any", label: "I love cooking", hint: "Any time works." }
  ],
  tr: [
    { value: "15", label: "≤ 15 dk", hint: "Sadece hızlı yemekler." },
    { value: "30", label: "≤ 30 dk", hint: "Standart hazırlık." },
    { value: "60", label: "≤ 60 dk", hint: "Rahat yemek pişirme." },
    { value: "any", label: "Yemek yapmayı seviyorum", hint: "Süre fark etmez." }
  ],
  ar: [
    { value: "15", label: "≤ 15 د", hint: "وجبات سريعة فقط." },
    { value: "30", label: "≤ 30 د", hint: "تحضير عادي." },
    { value: "60", label: "≤ 60 د", hint: "طبخ مريح." },
    { value: "any", label: "أحب الطبخ", hint: "أي مدة تناسبني." }
  ],
  es: [
    { value: "15", label: "≤ 15 min", hint: "Solo comidas rápidas." },
    { value: "30", label: "≤ 30 min", hint: "Preparación estándar." },
    { value: "60", label: "≤ 60 min", hint: "Cocinar con calma." },
    { value: "any", label: "Me encanta cocinar", hint: "Cualquier tiempo." }
  ],
  fr: [
    { value: "15", label: "≤ 15 min", hint: "Repas rapides uniquement." },
    { value: "30", label: "≤ 30 min", hint: "Préparation standard." },
    { value: "60", label: "≤ 60 min", hint: "Cuisiner posé." },
    { value: "any", label: "J'adore cuisiner", hint: "Peu importe le temps." }
  ]
};

const FAMILY_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "solo", label: "Just me", hint: "Single portion math." },
    { value: "couple", label: "Two of us", hint: "Double portions or shared." },
    { value: "family", label: "Family of 3+", hint: "Family-style cooking." }
  ],
  tr: [
    { value: "solo", label: "Sadece ben", hint: "Tek porsiyon." },
    { value: "couple", label: "İki kişiyiz", hint: "Çift porsiyon ya da paylaşımlı." },
    { value: "family", label: "Aile (3+)", hint: "Aile yemekleri." }
  ],
  ar: [
    { value: "solo", label: "أنا فقط", hint: "حصة واحدة." },
    { value: "couple", label: "اثنان", hint: "حصتان أو مشتركة." },
    { value: "family", label: "عائلة 3+", hint: "طبخ عائلي." }
  ],
  es: [
    { value: "solo", label: "Solo yo", hint: "Una porción." },
    { value: "couple", label: "Dos personas", hint: "Doble porción o compartido." },
    { value: "family", label: "Familia 3+", hint: "Cocina familiar." }
  ],
  fr: [
    { value: "solo", label: "Juste moi", hint: "Une portion." },
    { value: "couple", label: "À deux", hint: "Double portion ou partagé." },
    { value: "family", label: "Famille 3+", hint: "Cuisine familiale." }
  ]
};

const RAMADAN_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "no", label: "No, normal eating", hint: "Standard meal timing." },
    { value: "ramadan", label: "Yes, currently in Ramadan", hint: "Suhoor + iftar structured plan." },
    { value: "intermittent", label: "Yes, regular intermittent fasting", hint: "16:8 or similar." }
  ],
  tr: [
    { value: "no", label: "Hayır, normal yemek", hint: "Standart yemek saatleri." },
    { value: "ramadan", label: "Evet, Ramazan'dayım", hint: "Sahur + iftar planı." },
    { value: "intermittent", label: "Evet, aralıklı oruç", hint: "16:8 veya benzeri." }
  ],
  ar: [
    { value: "no", label: "لا، أكل عادي", hint: "أوقات وجبات اعتيادية." },
    { value: "ramadan", label: "نعم، في رمضان", hint: "خطة سحور + إفطار." },
    { value: "intermittent", label: "نعم، صيام متقطع منتظم", hint: "16:8 أو مشابه." }
  ],
  es: [
    { value: "no", label: "No, alimentación normal", hint: "Horarios estándar." },
    { value: "ramadan", label: "Sí, en Ramadán", hint: "Plan suhoor + iftar." },
    { value: "intermittent", label: "Sí, ayuno intermitente", hint: "16:8 o similar." }
  ],
  fr: [
    { value: "no", label: "Non, alimentation normale", hint: "Horaires standards." },
    { value: "ramadan", label: "Oui, en Ramadan", hint: "Plan suhoor + iftar." },
    { value: "intermittent", label: "Oui, jeûne intermittent", hint: "16:8 ou similaire." }
  ]
};

const RELIGION_DIET_OPTIONS: Record<Locale, QuizOption[]> = {
  en: [
    { value: "none", label: "No restriction", hint: "Eat anything." },
    { value: "halal", label: "Halal only", hint: "No pork, only halal meat." },
    { value: "kosher", label: "Kosher", hint: "Kosher rules." },
    { value: "vegetarian", label: "Vegetarian", hint: "No meat or fish." }
  ],
  tr: [
    { value: "none", label: "Kısıtlama yok", hint: "Her şey yiyebilirim." },
    { value: "halal", label: "Sadece helal", hint: "Domuz yok, sadece helal et." },
    { value: "kosher", label: "Koşer", hint: "Koşer kuralları." },
    { value: "vegetarian", label: "Vejetaryen", hint: "Et veya balık yok." }
  ],
  ar: [
    { value: "none", label: "بدون قيود", hint: "آكل أي شيء." },
    { value: "halal", label: "حلال فقط", hint: "بدون لحم خنزير، لحم حلال." },
    { value: "kosher", label: "كوشير", hint: "قواعد الكوشير." },
    { value: "vegetarian", label: "نباتي", hint: "بدون لحم أو سمك." }
  ],
  es: [
    { value: "none", label: "Sin restricción", hint: "Como de todo." },
    { value: "halal", label: "Solo halal", hint: "Sin cerdo, solo carne halal." },
    { value: "kosher", label: "Kosher", hint: "Reglas kosher." },
    { value: "vegetarian", label: "Vegetariano", hint: "Sin carne ni pescado." }
  ],
  fr: [
    { value: "none", label: "Pas de restriction", hint: "Je mange de tout." },
    { value: "halal", label: "Halal uniquement", hint: "Pas de porc, viande halal." },
    { value: "kosher", label: "Casher", hint: "Règles casher." },
    { value: "vegetarian", label: "Végétarien", hint: "Pas de viande ni poisson." }
  ]
};

const STAGE2_SECTIONS: Record<Locale, { region: string; market: string; food: string }> = {
  en: { region: "Where you live", market: "Where you shop", food: "How you eat" },
  tr: { region: "Nerede yaşıyorsun", market: "Nereden alışveriş", food: "Nasıl yiyorsun" },
  ar: { region: "أين تعيش", market: "من أين تتسوق", food: "كيف تأكل" },
  es: { region: "Dónde vives", market: "Dónde compras", food: "Cómo comes" },
  fr: { region: "Où tu vis", market: "Où tu achètes", food: "Comment tu manges" }
};

/**
 * Stage-2 question set. ~8 questions covering region, market, and
 * food cultural context. Adaptive: market picker shows country-specific
 * options; Ramadan question only shows for halal users.
 *
 * Note: market options are stage-determined by the user's earlier
 * `country` answer, but `QuizStep.options` is static. We surface the
 * full union of markets across all supported countries here; the UI
 * filter is enforced via `showIf` on each market entry's country
 * predicate. This keeps the existing renderer untouched. PR12's UI
 * polish pass can swap in a dedicated country-aware single-select.
 */
export function getTjaiV2Stage2Steps(locale: Locale): QuizStep[] {
  const t = (en: string, tr: string, ar: string, es: string, fr: string) =>
    ({ en, tr, ar, es, fr }[locale] ?? en);
  const sec = STAGE2_SECTIONS[locale] ?? STAGE2_SECTIONS.en;
  const totalStages = 3;

  return [
    {
      id: "country",
      stage: "local",
      section: sec.region,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Which country do you live in?",
        "Hangi ülkede yaşıyorsun?",
        "في أي بلد تعيش؟",
        "¿En qué país vives?",
        "Dans quel pays vis-tu ?"
      ),
      type: "single",
      options: COUNTRY_OPTIONS,
      required: true
    },
    {
      id: "city",
      stage: "local",
      section: sec.region,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Which city?",
        "Hangi şehir?",
        "أي مدينة؟",
        "¿Qué ciudad?",
        "Quelle ville ?"
      ),
      sub: t(
        "Used to suggest local markets and prices.",
        "Yerel marketleri ve fiyatları önermek için.",
        "لاقتراح متاجر محلية وأسعار.",
        "Para sugerir mercados y precios locales.",
        "Pour suggérer des marchés et prix locaux."
      ),
      type: "text",
      placeholder: t("e.g. Istanbul", "ör. İstanbul", "مثال: الرياض", "ej. Madrid", "ex. Paris"),
      required: true
    },
    {
      id: "units",
      stage: "local",
      section: sec.region,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Metric or imperial?",
        "Metrik mi imperyal mı?",
        "متري أم إمبراطوري؟",
        "¿Métrico o imperial?",
        "Métrique ou impérial ?"
      ),
      type: "single",
      options: UNITS_OPTIONS[locale] ?? UNITS_OPTIONS.en,
      required: true
    },
    {
      id: "market",
      stage: "local",
      section: sec.market,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Where do you usually grocery shop?",
        "Genelde nereden alışveriş yapıyorsun?",
        "من أين تتسوق عادةً؟",
        "¿Dónde compras normalmente?",
        "Où achètes-tu d'habitude ?"
      ),
      sub: t(
        "Pick your main store. We'll tailor the grocery list to it.",
        "Ana mağazanı seç. Listeni ona göre yapıyoruz.",
        "اختر متجرك الأساسي. سنفصّل القائمة بناءً عليه.",
        "Elige tu tienda principal. Adaptamos la lista a ella.",
        "Choisis ton magasin principal. On adapte la liste."
      ),
      type: "single",
      options: aggregateMarketOptions(locale),
      required: true,
      showIf: {
        mode: "all",
        // The renderer doesn't filter market options by country — we
        // rely on the fact that the user only picks one market and
        // can manually pick "Other" + write-in if their country isn't
        // listed.
        conditions: [{ stepId: "country", value: "", operator: "not_equals" }]
      }
    },
    {
      id: "market_writein",
      stage: "local",
      section: sec.market,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Which store?",
        "Hangi mağaza?",
        "أي متجر؟",
        "¿Qué tienda?",
        "Quel magasin ?"
      ),
      type: "text",
      placeholder: t("Store name", "Mağaza adı", "اسم المتجر", "Nombre de la tienda", "Nom du magasin"),
      required: false,
      showIf: {
        mode: "all",
        conditions: [{ stepId: "market", value: "other", operator: "equals" }]
      }
    },
    {
      id: "cook_time",
      stage: "local",
      section: sec.food,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "How much time can you cook each day?",
        "Her gün yemek için ne kadar vaktin var?",
        "كم من الوقت تستطيع الطبخ يومياً؟",
        "¿Cuánto tiempo puedes cocinar al día?",
        "Combien de temps de cuisine par jour ?"
      ),
      type: "single",
      options: COOK_TIME_OPTIONS[locale] ?? COOK_TIME_OPTIONS.en,
      required: true
    },
    {
      id: "family_size",
      stage: "local",
      section: sec.food,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Are you cooking just for yourself?",
        "Sadece kendin için mi yemek yapıyorsun?",
        "هل تطبخ لنفسك فقط؟",
        "¿Cocinas solo para ti?",
        "Tu cuisines juste pour toi ?"
      ),
      type: "single",
      options: FAMILY_OPTIONS[locale] ?? FAMILY_OPTIONS.en,
      required: true
    },
    {
      id: "religion_diet",
      stage: "local",
      section: sec.food,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Any dietary or religious restrictions?",
        "Beslenme veya dini kısıtlama var mı?",
        "أي قيود غذائية أو دينية؟",
        "¿Restricciones dietéticas o religiosas?",
        "Restrictions alimentaires ou religieuses ?"
      ),
      type: "single",
      options: RELIGION_DIET_OPTIONS[locale] ?? RELIGION_DIET_OPTIONS.en,
      required: true
    },
    {
      id: "fasting_pattern",
      stage: "local",
      section: sec.food,
      sectionNumber: 3,
      totalSections: totalStages,
      question: t(
        "Are you fasting?",
        "Oruç tutuyor musun?",
        "هل تصوم؟",
        "¿Estás ayunando?",
        "Tu jeûnes ?"
      ),
      sub: t(
        "We'll structure meals around suhoor / iftar or your fasting window.",
        "Yemekleri sahur / iftar veya oruç pencerene göre yaparız.",
        "سنرتّب الوجبات حول السحور / الإفطار أو نافذة صيامك.",
        "Estructuramos comidas en torno a tu ventana de ayuno.",
        "On structure les repas selon ta fenêtre de jeûne."
      ),
      type: "single",
      options: RAMADAN_OPTIONS[locale] ?? RAMADAN_OPTIONS.en,
      required: false,
      showIf: {
        mode: "any",
        conditions: [
          { stepId: "religion_diet", value: "halal", operator: "equals" },
          { stepId: "country", value: "TR", operator: "equals" },
          { stepId: "country", value: "AE", operator: "equals" },
          { stepId: "country", value: "SA", operator: "equals" },
          { stepId: "country", value: "EG", operator: "equals" },
          { stepId: "country", value: "MA", operator: "equals" },
          { stepId: "country", value: "JO", operator: "equals" },
          { stepId: "country", value: "QA", operator: "equals" },
          { stepId: "country", value: "KW", operator: "equals" },
          { stepId: "country", value: "OM", operator: "equals" },
          { stepId: "country", value: "BH", operator: "equals" }
        ]
      }
    }
  ];
}

/**
 * Concatenate every supported country's markets into one list, plus an
 * "Other" option. The renderer doesn't dynamically filter by country
 * yet (PR12), but the answer captures a stable market id so downstream
 * grocery generation works.
 */
function aggregateMarketOptions(locale: Locale): QuizOption[] {
  const all: QuizOption[] = [];
  const seen = new Set<string>();
  for (const country of COUNTRIES) {
    for (const market of getMarketsForCountry(country.code)) {
      if (seen.has(market.id)) continue;
      seen.add(market.id);
      all.push({ value: market.id, label: market.label, hint: country.name });
    }
  }
  all.push({
    value: "other",
    label: ({ en: "Other", tr: "Diğer", ar: "أخرى", es: "Otro", fr: "Autre" })[locale] ?? "Other",
    hint: ({
      en: "Type your store next",
      tr: "Sonraki adımda mağaza adı",
      ar: "اكتب اسم متجرك بعدها",
      es: "Escribe la tienda después",
      fr: "Écris le magasin ensuite"
    })[locale]
  });
  return all;
}

