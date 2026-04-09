import type { Locale } from "@/lib/i18n";
import type { QuizStep, TJAICopy } from "@/lib/tjai-types";

const SECTION_TITLES: Record<Locale, string[]> = {
  en: ["The Basics", "Your Body", "Your Lifestyle", "Your Training", "Your Nutrition", "Finishing Up"],
  tr: ["Temel Bilgiler", "Vucut Olculeri", "Yasam Tarzi", "Antrenman", "Beslenme", "Son Detaylar"],
  ar: ["الأساسيات", "جسمك", "نمط حياتك", "تدريبك", "تغذيتك", "إنهاء"],
  es: ["Lo Basico", "Tu Cuerpo", "Tu Estilo de Vida", "Tu Entrenamiento", "Tu Nutricion", "Finalizando"],
  fr: ["Les Bases", "Votre Corps", "Votre Mode de Vie", "Votre Entrainement", "Votre Nutrition", "Finalisation"]
};

export const tjaiCopy: Record<Locale, TJAICopy> = {
  en: {
    nav: { back: "Back", continue: "Continue", generate: "Generate My Plan", stepOf: "Step", sectionOf: "Section" },
    validation: { required: "Please select an answer to continue." },
    quiz: {
      title: "TJAI Assessment",
      subtitle: "Answer each section so TJAI can build your personalized plan.",
      notAtAll: "Not at all",
      extremely: "Extremely",
      chars: "characters",
      unitYears: "years",
      unitCm: "cm",
      unitKg: "kg",
      unitPct: "%",
      unitHrs: "hrs"
    },
    calculating: {
      title: "Building your plan...",
      statuses: [
        "Calculating your BMR and TDEE...",
        "Analyzing your daily routine...",
        "Designing your 12-week diet...",
        "Building your training program...",
        "Personalizing your meal plan...",
        "Optimizing macros for your goal...",
        "Adding your food preferences...",
        "Applying calorie periodization...",
        "Finalizing your transformation plan..."
      ],
      calorieTarget: "Your calorie target",
      proteinTarget: "Protein target",
      progressTarget: "Estimated progress"
    },
    result: {
      eyebrow: "YOUR TJAI PLAN",
      yourDiet: "Your 12-Week Diet",
      yourProgram: "Your 12-Week Program",
      supplements: "Supplements",
      mindset: "Mindset",
      saveToDashboard: "Save to Dashboard",
      startOver: "Start Over",
      saving: "Saving...",
      saved: "Plan saved to your dashboard.",
      saveError: "Could not save plan.",
      generatedAt: "Plan generated",
      metrics: {
        calories: "Calories",
        protein: "Protein",
        fat: "Fat",
        carbs: "Carbs",
        water: "Water",
        weekly: "Weekly change",
        timeToGoal: "Time to goal"
      },
      labels: { warmup: "Warmup", cooldown: "Cooldown", duration: "Duration" }
    },
    sections: SECTION_TITLES.en
  },
  tr: {
    nav: { back: "Geri", continue: "Devam", generate: "Planimi Olustur", stepOf: "Adim", sectionOf: "Bolum" },
    validation: { required: "Devam etmek icin bir cevap secin." },
    quiz: {
      title: "TJAI Degerlendirmesi",
      subtitle: "Kisisel planinizi olusturmasi icin tum bolumleri yanitlayin.",
      notAtAll: "Hic",
      extremely: "Cok",
      chars: "karakter",
      unitYears: "yas",
      unitCm: "cm",
      unitKg: "kg",
      unitPct: "%",
      unitHrs: "saat"
    },
    calculating: {
      title: "Planiniz olusturuluyor...",
      statuses: [
        "BMR ve TDEE hesaplanıyor...",
        "Gunluk rutininiz analiz ediliyor...",
        "12 haftalik diyet tasarlaniyor...",
        "Antrenman programi olusturuluyor...",
        "Ogunleriniz kisisellestiriliyor...",
        "Makrolar hedefinize gore optimize ediliyor...",
        "Besin tercihleriniz ekleniyor...",
        "Kalori periodizasyonu uygulaniyor...",
        "Donusum plani son haline getiriliyor..."
      ],
      calorieTarget: "Kalori hedefiniz",
      proteinTarget: "Protein hedefiniz",
      progressTarget: "Tahmini ilerleme"
    },
    result: {
      eyebrow: "TJAI PLANINIZ",
      yourDiet: "12 Haftalik Diyetiniz",
      yourProgram: "12 Haftalik Programiniz",
      supplements: "Takviyeler",
      mindset: "Zihniyet",
      saveToDashboard: "Panele Kaydet",
      startOver: "Bastan Basla",
      saving: "Kaydediliyor...",
      saved: "Plan panelinize kaydedildi.",
      saveError: "Plan kaydedilemedi.",
      generatedAt: "Plan olusturma",
      metrics: {
        calories: "Kalori",
        protein: "Protein",
        fat: "Yag",
        carbs: "Karbonhidrat",
        water: "Su",
        weekly: "Haftalik degisim",
        timeToGoal: "Hedef suresi"
      },
      labels: { warmup: "Isinma", cooldown: "Soguma", duration: "Sure" }
    },
    sections: SECTION_TITLES.tr
  },
  ar: {
    nav: { back: "رجوع", continue: "متابعة", generate: "أنشئ خطتي", stepOf: "الخطوة", sectionOf: "القسم" },
    validation: { required: "يرجى اختيار إجابة للمتابعة." },
    quiz: {
      title: "تقييم TJAI",
      subtitle: "أجب على جميع الأقسام ليبني TJAI خطتك الشخصية.",
      notAtAll: "ابداً",
      extremely: "للغاية",
      chars: "حرف",
      unitYears: "سنة",
      unitCm: "سم",
      unitKg: "كغ",
      unitPct: "%",
      unitHrs: "ساعات"
    },
    calculating: {
      title: "جاري بناء خطتك...",
      statuses: [
        "يتم حساب BMR وTDEE...",
        "يتم تحليل روتينك اليومي...",
        "يتم تصميم نظامك الغذائي 12 اسبوع...",
        "يتم بناء برنامج التدريب...",
        "يتم تخصيص خطة الوجبات...",
        "يتم تحسين الماكروز لهدفك...",
        "يتم اضافة تفضيلات الطعام...",
        "يتم تطبيق توزيع السعرات...",
        "جاري إنهاء خطة التحول..."
      ],
      calorieTarget: "هدف السعرات",
      proteinTarget: "هدف البروتين",
      progressTarget: "التقدم المتوقع"
    },
    result: {
      eyebrow: "خطة TJAI الخاصة بك",
      yourDiet: "نظامك الغذائي 12 اسبوع",
      yourProgram: "برنامجك التدريبي 12 اسبوع",
      supplements: "المكملات",
      mindset: "العقلية",
      saveToDashboard: "حفظ في اللوحة",
      startOver: "ابدأ من جديد",
      saving: "جار الحفظ...",
      saved: "تم حفظ الخطة في لوحتك.",
      saveError: "تعذر حفظ الخطة.",
      generatedAt: "تاريخ الانشاء",
      metrics: {
        calories: "السعرات",
        protein: "بروتين",
        fat: "دهون",
        carbs: "كربوهيدرات",
        water: "الماء",
        weekly: "التغير الاسبوعي",
        timeToGoal: "الوقت للهدف"
      },
      labels: { warmup: "الاحماء", cooldown: "التهدئة", duration: "المدة" }
    },
    sections: SECTION_TITLES.ar
  },
  es: {
    nav: { back: "Atras", continue: "Continuar", generate: "Generar Mi Plan", stepOf: "Paso", sectionOf: "Seccion" },
    validation: { required: "Selecciona una respuesta para continuar." },
    quiz: {
      title: "Evaluacion TJAI",
      subtitle: "Responde todas las secciones para crear tu plan personalizado.",
      notAtAll: "Nada",
      extremely: "Mucho",
      chars: "caracteres",
      unitYears: "anos",
      unitCm: "cm",
      unitKg: "kg",
      unitPct: "%",
      unitHrs: "hrs"
    },
    calculating: {
      title: "Construyendo tu plan...",
      statuses: [
        "Calculando tu BMR y TDEE...",
        "Analizando tu rutina diaria...",
        "Disenando tu dieta de 12 semanas...",
        "Construyendo tu programa de entrenamiento...",
        "Personalizando tu plan de comidas...",
        "Optimizando macros para tu objetivo...",
        "Agregando tus preferencias de comida...",
        "Aplicando periodizacion calorica...",
        "Finalizando tu plan de transformacion..."
      ],
      calorieTarget: "Tu objetivo calorico",
      proteinTarget: "Objetivo de proteina",
      progressTarget: "Progreso estimado"
    },
    result: {
      eyebrow: "TU PLAN TJAI",
      yourDiet: "Tu Dieta de 12 Semanas",
      yourProgram: "Tu Programa de 12 Semanas",
      supplements: "Suplementos",
      mindset: "Mentalidad",
      saveToDashboard: "Guardar en Dashboard",
      startOver: "Empezar de Nuevo",
      saving: "Guardando...",
      saved: "Plan guardado en tu dashboard.",
      saveError: "No se pudo guardar el plan.",
      generatedAt: "Plan generado",
      metrics: {
        calories: "Calorias",
        protein: "Proteina",
        fat: "Grasa",
        carbs: "Carbohidratos",
        water: "Agua",
        weekly: "Cambio semanal",
        timeToGoal: "Tiempo al objetivo"
      },
      labels: { warmup: "Calentamiento", cooldown: "Enfriamiento", duration: "Duracion" }
    },
    sections: SECTION_TITLES.es
  },
  fr: {
    nav: { back: "Retour", continue: "Continuer", generate: "Generer Mon Plan", stepOf: "Etape", sectionOf: "Section" },
    validation: { required: "Veuillez selectionner une reponse pour continuer." },
    quiz: {
      title: "Evaluation TJAI",
      subtitle: "Repondez a toutes les sections pour creer votre plan personnalise.",
      notAtAll: "Pas du tout",
      extremely: "Extremement",
      chars: "caracteres",
      unitYears: "ans",
      unitCm: "cm",
      unitKg: "kg",
      unitPct: "%",
      unitHrs: "h"
    },
    calculating: {
      title: "Creation de votre plan...",
      statuses: [
        "Calcul de votre BMR et TDEE...",
        "Analyse de votre routine quotidienne...",
        "Conception de votre diete sur 12 semaines...",
        "Creation de votre programme d'entrainement...",
        "Personnalisation de votre plan repas...",
        "Optimisation des macros selon votre objectif...",
        "Ajout de vos preferences alimentaires...",
        "Application de la periodisation calorique...",
        "Finalisation de votre plan de transformation..."
      ],
      calorieTarget: "Votre objectif calorique",
      proteinTarget: "Objectif proteine",
      progressTarget: "Progression estimee"
    },
    result: {
      eyebrow: "VOTRE PLAN TJAI",
      yourDiet: "Votre Diete 12 Semaines",
      yourProgram: "Votre Programme 12 Semaines",
      supplements: "Supplements",
      mindset: "Mental",
      saveToDashboard: "Sauvegarder au Dashboard",
      startOver: "Recommencer",
      saving: "Sauvegarde...",
      saved: "Plan enregistre dans votre dashboard.",
      saveError: "Impossible d'enregistrer le plan.",
      generatedAt: "Plan genere le",
      metrics: {
        calories: "Calories",
        protein: "Proteines",
        fat: "Lipides",
        carbs: "Glucides",
        water: "Eau",
        weekly: "Changement hebdo",
        timeToGoal: "Temps vers objectif"
      },
      labels: { warmup: "Echauffement", cooldown: "Retour au calme", duration: "Duree" }
    },
    sections: SECTION_TITLES.fr
  }
};

type BaseStep = Omit<QuizStep, "section" | "sectionNumber" | "totalSections"> & { sectionIdx: number };

// 25 questions across 6 sections. Field IDs preserved for science/API compatibility.
const BASE_STEPS: BaseStep[] = [
  // ── SECTION 0: The Basics ─────────────────────────────────────────────────
  {
    id: "s2_goal", sectionIdx: 0,
    question: "What's your primary goal?",
    sub: "This shapes your entire 12-week plan.",
    type: "single",
    options: [
      "🔥 Lose Fat — Burn fat, get lean",
      "💪 Build Muscle — Get bigger and stronger",
      "⚖️ Body Recomposition — Lose fat AND gain muscle",
      "🏃 Improve Fitness — Endurance, health, energy",
      "🏠 Stay Active — Move more, feel better"
    ],
    required: true
  },
  {
    id: "s2_pace", sectionIdx: 0,
    question: "How fast do you want results?",
    sub: "Be honest — this affects your calorie deficit and training intensity.",
    type: "single",
    options: ["🐢 Slow & Sustainable — I want lasting results, no rush", "⚡ Moderate Pace — Steady progress, good balance", "🚀 Fast Results — I'm committed to pushing hard"],
    required: true
  },
  {
    id: "s1_gender", sectionIdx: 0,
    question: "What's your sex?",
    sub: "Used for accurate BMR and hormonal adjustments.",
    type: "single",
    options: ["Male", "Female"],
    required: true
  },
  {
    id: "s1_age", sectionIdx: 0,
    question: "How old are you?",
    type: "number", min: 16, max: 80, unit: "years", required: true
  },

  // ── SECTION 1: Your Body ──────────────────────────────────────────────────
  {
    id: "s1_weight", sectionIdx: 1,
    question: "What's your current weight?",
    type: "number", min: 30, max: 250, unit: "kg", required: true
  },
  {
    id: "s1_height", sectionIdx: 1,
    question: "What's your height?",
    type: "slider", min: 140, max: 220, unit: "cm", step: 1, defaultValue: 170, required: true
  },
  {
    id: "s3_body_silhouette", sectionIdx: 1,
    question: "Which body type best describes you?",
    sub: "This helps TJAI estimate body fat for macro precision.",
    type: "single",
    options: ["Ectomorph — Naturally Slim (hard to gain weight, fast metabolism)", "Mesomorph — Athletic Build (gain and lose weight relatively easily)", "Endomorph — Naturally Bigger (gain weight easily, slower metabolism)"],
    required: true
  },
  {
    id: "s17_injuries", sectionIdx: 1,
    question: "Do you have any injuries or physical limitations?",
    sub: "Select all that apply. TJAI will modify exercises accordingly.",
    type: "multi",
    options: ["None", "Knee pain", "Lower back pain", "Shoulder pain", "Hip pain", "Wrist / elbow pain", "Recent surgery", "Chronic condition"],
    required: true
  },

  // ── SECTION 2: Your Lifestyle ─────────────────────────────────────────────
  {
    id: "s4_daily_activity", sectionIdx: 2,
    question: "How active are you outside of training?",
    sub: "This is your daily movement — NOT your workouts.",
    type: "single",
    options: [
      "Very low — Desk job, mostly sitting",
      "Low — Some walking, mostly sedentary",
      "Moderate — Regular movement, active job",
      "Active — Physical job or very active lifestyle"
    ],
    required: true
  },
  {
    id: "s8_hours", sectionIdx: 2,
    question: "How many hours do you sleep per night on average?",
    type: "slider", min: 4, max: 10, unit: "hrs", step: 1, defaultValue: 7, required: true
  },
  {
    id: "s9_stress", sectionIdx: 2,
    question: "What is your current stress level?",
    sub: "Stress affects cortisol — which directly impacts fat loss and muscle gain.",
    type: "single",
    options: ["😌 Very Low", "😐 Low", "😤 Moderate", "😰 High", "🤯 Very High"],
    required: true
  },
  {
    id: "s14_budget", sectionIdx: 2,
    question: "What is your food budget?",
    type: "single",
    options: ["💰 Budget-Conscious — Keep meals affordable", "💵 Moderate — Normal grocery spending", "💎 No Limit — Best foods for results"],
    required: true
  },
  {
    id: "s13_allergies", sectionIdx: 2,
    question: "Do you have any dietary restrictions?",
    sub: "Select all that apply.",
    type: "multi",
    options: ["None", "Vegetarian", "Vegan", "Halal", "Kosher", "No dairy", "No gluten", "No pork", "No nuts", "Other"],
    required: true
  },

  // ── SECTION 3: Your Training ──────────────────────────────────────────────
  {
    id: "s5_trains", sectionIdx: 3,
    question: "What is your current fitness level?",
    type: "single",
    options: [
      "🌱 Complete Beginner — Never trained consistently",
      "📈 Some Experience — Trained on and off (less than 1 year)",
      "💪 Intermediate — Training consistently (1–3 years)",
      "🏆 Advanced — Serious training (3+ years)"
    ],
    required: true
  },
  {
    id: "s5_type", sectionIdx: 3,
    question: "Where will you train?",
    type: "single",
    options: ["🏠 Home — No equipment or minimal equipment", "🏋️ Gym — Full gym access", "🔀 Both — Mix of home and gym"],
    required: true
  },
  {
    id: "s5_days", sectionIdx: 3,
    question: "How many days per week can you train?",
    type: "single",
    options: ["1–2 days", "3–4 days", "4–5 days", "5–6 days"],
    required: true
  },
  {
    id: "s5_duration", sectionIdx: 3,
    question: "How long can each session be?",
    sub: "TJAI will structure workouts around this time.",
    type: "slider", min: 20, max: 90, unit: "min", step: 5, defaultValue: 45, required: true
  },
  {
    id: "s5_equipment", sectionIdx: 3,
    question: "What equipment do you have access to?",
    sub: "Select all that apply.",
    type: "multi",
    options: ["No equipment (bodyweight only)", "Dumbbells", "Resistance bands", "Pull-up bar", "Barbell + weights", "Kettlebells", "Cables / machines", "Full home gym"],
    skipIf: { stepId: "s5_type", value: "🏋️ Gym — Full gym access" },
    required: false
  },

  // ── SECTION 4: Your Nutrition ─────────────────────────────────────────────
  {
    id: "s12_diet_style", sectionIdx: 4,
    question: "How would you describe your current eating habits?",
    type: "single",
    options: [
      "🍕 Mostly Unhealthy — Fast food, irregular meals",
      "🥗 Mixed — Sometimes healthy, sometimes not",
      "🥩 Mostly Healthy — I try to eat well",
      "🥦 Very Healthy — I track and plan my meals"
    ],
    required: true
  },
  {
    id: "s11_meals", sectionIdx: 4,
    question: "How many meals do you prefer per day?",
    sub: "TJAI will structure your plan around this.",
    type: "single",
    options: ["2 meals", "3 meals", "4 meals", "5+ meals", "Intermittent fasting"],
    required: true
  },
  {
    id: "s14_time", sectionIdx: 4,
    question: "How comfortable are you with cooking?",
    type: "single",
    options: ["🍳 Beginner — Simple, quick meals only", "👨‍🍳 Moderate — I can follow a recipe", "🎯 Advanced — I enjoy cooking, no limits"],
    required: true
  },
  {
    id: "s12_foods_like", sectionIdx: 4,
    question: "Which foods do you enjoy? (optional)",
    sub: "TJAI will include these in your meal plan where possible.",
    type: "text", placeholder: "e.g. chicken, rice, eggs, Greek yogurt, oats...", required: false
  },

  // ── SECTION 5: Finishing Up ───────────────────────────────────────────────
  {
    id: "s10_dieted", sectionIdx: 5,
    question: "Have you tried fitness programs before?",
    type: "single",
    options: [
      "🚫 Never tried — First time doing a structured program",
      "😕 Tried but quit — Couldn't stick to it",
      "📉 Tried, some results — Worked partially",
      "💪 Yes, successfully — Done programs before"
    ],
    required: true
  },
  {
    id: "s18_biggest_problem", sectionIdx: 5,
    question: "What is your biggest obstacle to getting results?",
    sub: "Select all that apply. TJAI will address these in your plan.",
    type: "multi",
    options: ["Lack of time", "Lack of motivation", "Not knowing what to do", "Diet is the hard part", "Injuries holding me back", "Past failed attempts", "Busy schedule", "Budget constraints"],
    required: true
  },
  {
    id: "s19_success_vision", sectionIdx: 5,
    question: "What does success look like to you in 12 weeks?",
    sub: "Pick the one that resonates most.",
    type: "single",
    options: [
      "🪞 I look noticeably different in the mirror",
      "⚡ I feel energetic and strong every day",
      "👗 I fit into clothes I couldn't wear before",
      "🏋️ I'm lifting heavier than I ever have",
      "🧘 I've built a sustainable healthy routine"
    ],
    required: true
  }
];

export function getTjaiCopy(locale: Locale): TJAICopy {
  return tjaiCopy[locale] ?? tjaiCopy.en;
}

export function getTjaiSteps(locale: Locale): QuizStep[] {
  const sections = SECTION_TITLES[locale] ?? SECTION_TITLES.en;
  return BASE_STEPS.map((step) => ({
    ...step,
    section: sections[step.sectionIdx] ?? SECTION_TITLES.en[step.sectionIdx],
    sectionNumber: step.sectionIdx + 1,
    totalSections: 6
  }));
}

