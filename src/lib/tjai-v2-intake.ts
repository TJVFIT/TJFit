import type { Locale } from "@/lib/i18n";
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
