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
const opt = (label: string, value: string | number | boolean) => ({ label, value });

const BASE_STEPS: BaseStep[] = [
  {
    id: "s2_goal", sectionIdx: 0,
    question: "What's your primary goal?",
    sub: "This shapes the entire TJAI plan.",
    type: "single",
    options: [
      opt("🔥 Lose Fat — Burn fat, get lean", "fat_loss"),
      opt("💪 Build Muscle — Get bigger and stronger", "muscle_gain"),
      opt("⚖️ Body Recomposition — Lose fat AND gain muscle", "recomposition"),
      opt("🏃 Improve Fitness — Endurance, health, energy", "fitness"),
      opt("🏠 Stay Active — Move more, feel better", "stay_active")
    ],
    required: true
  },
  {
    id: "s2_goal_detail", sectionIdx: 0,
    question: "What kind of result matters most to you first?",
    sub: "TJAI will bias the plan toward the outcome you care about most.",
    type: "single",
    options: [
      opt("Sustainable fat loss I can keep", "sustainable_cut"),
      opt("Aggressive cut and visible drop", "aggressive_cut"),
      opt("More size and fullness", "size"),
      opt("More strength and athleticism", "strength"),
      opt("More aesthetic and balanced physique", "aesthetic"),
      opt("More energy and better health", "energy"),
      opt("Build a routine I can actually stick to", "consistency")
    ],
    required: true
  },
  {
    id: "s1_gender", sectionIdx: 0,
    question: "What's your biological sex?",
    sub: "Used for more accurate energy and recovery estimates.",
    type: "single",
    options: [opt("Male", "male"), opt("Female", "female")],
    required: true
  },
  {
    id: "s1_age", sectionIdx: 0,
    question: "What is your age range?",
    sub: "Age directly affects recovery, training tolerance, and metabolic rate.",
    type: "single",
    options: [
      opt("16–24 years", 20),
      opt("25–34 years", 30),
      opt("35–44 years", 40),
      opt("45–54 years", 50),
      opt("55+ years", 58)
    ],
    required: true
  },
  {
    id: "s1_weight", sectionIdx: 0,
    question: "What is your current weight?",
    sub: "Used for calories, protein targets, and projected progress.",
    type: "single",
    options: [
      opt("Under 50 kg", 48),
      opt("50–65 kg", 58),
      opt("65–80 kg", 72),
      opt("80–100 kg", 90),
      opt("100–120 kg", 110),
      opt("Over 120 kg", 125)
    ],
    required: true
  },
  {
    id: "s1_height", sectionIdx: 0,
    question: "What is your height?",
    sub: "Used with weight to estimate energy needs and exercise scaling.",
    type: "single",
    options: [
      opt("Under 155 cm", 152),
      opt("155–165 cm", 160),
      opt("165–175 cm", 170),
      opt("175–185 cm", 180),
      opt("185–195 cm", 190),
      opt("Over 195 cm", 198)
    ],
    required: true
  },

  {
    id: "s2_pace", sectionIdx: 1,
    question: "How fast do you want results?",
    sub: "Be honest — this directly affects training demand, recovery, and calories.",
    type: "single",
    options: [
      opt("🐢 Slow & Sustainable — I want lasting results, no rush", "slow"),
      opt("⚡ Moderate Pace — Steady progress, good balance", "moderate"),
      opt("🚀 Fast Results — I'm fully committed to pushing hard", "aggressive")
    ],
    required: true
  },
  {
    id: "s3_body_silhouette", sectionIdx: 1,
    question: "Which body type best describes you?",
    sub: "This helps TJAI estimate body fat and how aggressively to push the plan.",
    type: "single",
    options: [
      opt("Very Lean", "very_lean"),
      opt("Lean", "lean"),
      opt("Average", "average"),
      opt("Overweight", "overweight"),
      opt("Obese", "obese")
    ],
    required: true
  },
  {
    id: "s17_injuries", sectionIdx: 1,
    question: "Do you have any injuries or physical limitations?",
    sub: "Select all that apply. TJAI will adjust exercises and recovery rules around this.",
    type: "multi",
    options: [
      opt("None", "none"),
      opt("Knee pain", "knee"),
      opt("Lower back pain", "lower_back"),
      opt("Shoulder pain", "shoulder"),
      opt("Hip pain", "hip"),
      opt("Wrist / elbow pain", "wrist_elbow"),
      opt("Recent surgery", "recent_surgery"),
      opt("Chronic condition", "chronic_condition")
    ],
    required: true
  },
  {
    id: "s17_conditions", sectionIdx: 1,
    question: "Anything TJAI should know about those limitations?",
    sub: "Optional note: movement restrictions, medical guidance, or exercises you know you should avoid.",
    type: "text",
    placeholder: "Example: No overhead pressing for now. Walking and lower body are cleared.",
    required: false,
    showIf: {
      mode: "any",
      conditions: [
        { stepId: "s17_injuries", operator: "includes", value: "recent_surgery" },
        { stepId: "s17_injuries", operator: "includes", value: "chronic_condition" }
      ]
    }
  },
  {
    id: "s19_target_weight", sectionIdx: 1,
    question: "If you know it, what target body weight are you aiming for?",
    sub: "Optional, but useful if you already have a realistic target in mind.",
    type: "number",
    placeholder: "e.g. 78",
    unit: "kg",
    min: 35,
    max: 220,
    required: false
  },

  {
    id: "s4_daily_activity", sectionIdx: 2,
    question: "How active are you outside of your workouts?",
    sub: "This is your daily movement level, not including planned training.",
    type: "single",
    options: [
      opt("Very low — Desk job, mostly sitting all day", "very_low"),
      opt("Low — Some walking, mostly sedentary", "low"),
      opt("Moderate — Regular movement, active lifestyle", "moderate"),
      opt("Active — Physical job or very active daily routine", "active")
    ],
    required: true
  },
  {
    id: "s8_hours", sectionIdx: 2,
    question: "How many hours do you sleep per night on average?",
    sub: "Sleep affects cortisol, recovery, fat loss, and performance.",
    type: "single",
    options: [
      opt("4–5 hours — Chronically sleep-deprived", 5),
      opt("6 hours — Below average", 6),
      opt("7 hours — Average", 7),
      opt("8 hours — Good", 8),
      opt("9+ hours — Very well-rested", 9)
    ],
    required: true
  },
  {
    id: "s9_stress", sectionIdx: 2,
    question: "What is your current overall stress level?",
    sub: "High stress changes recovery, appetite, and how aggressive TJAI should be.",
    type: "single",
    options: [
      opt("😌 Very Low — Life is calm and manageable", "very_low"),
      opt("😐 Low — Occasional minor stress", "low"),
      opt("😤 Moderate — Regular work or life pressure", "moderate"),
      opt("😰 High — Frequently stressed", "high"),
      opt("🤯 Very High — Overwhelmed regularly", "very_high")
    ],
    required: true
  },
  {
    id: "s18_schedule_constraint", sectionIdx: 2,
    question: "What is most likely to limit your consistency?",
    sub: "TJAI will build around the constraint instead of pretending it doesn't exist.",
    type: "single",
    options: [
      opt("None — my schedule is stable", "none"),
      opt("I need short sessions most days", "short_sessions"),
      opt("My work schedule changes often", "shift_work"),
      opt("Family or caregiving demands", "family_load"),
      opt("Travel or unpredictable weeks", "travel")
    ],
    required: true
  },
  {
    id: "s18_schedule_notes", sectionIdx: 2,
    question: "What does that scheduling issue actually look like week to week?",
    sub: "Optional detail — this helps TJAI place training days and recovery more realistically.",
    type: "text",
    placeholder: "Example: Two late shifts each week. Sundays are easiest. Travel every other Friday.",
    required: false,
    showIf: {
      mode: "all",
      conditions: [{ stepId: "s18_schedule_constraint", operator: "not_equals", value: "none" }]
    }
  },
  {
    id: "s14_budget", sectionIdx: 2,
    question: "What is your monthly food budget for this plan?",
    sub: "TJAI will choose foods and supplement tiers that match this budget.",
    type: "single",
    options: [
      opt("💰 Budget-Conscious — Keep meals affordable", "budget"),
      opt("💵 Moderate — Balanced quality and cost", "moderate"),
      opt("💎 Flexible — Performance quality matters most", "premium")
    ],
    required: true
  },
  {
    id: "s19_daily_routine", sectionIdx: 2,
    question: "What does a normal weekday look like for you?",
    sub: "Mention wake time, work/school, commute, meal timing, and when you can realistically train.",
    type: "text",
    placeholder: "Example: Wake at 6:30, desk job 9-6, lunch at 1, home by 7, best time to train is 7:30 pm.",
    required: true
  },

  {
    id: "s5_trains", sectionIdx: 3,
    question: "What is your current training level?",
    sub: "Be honest — TJAI should match your real level, not your ambition.",
    type: "single",
    options: [
      opt("🌱 Beginner — Less than 6 months of consistent training", "beginner"),
      opt("📈 Intermediate — 6 to 24 months of real training", "intermediate"),
      opt("🏆 Advanced — 2+ years of serious structured training", "advanced")
    ],
    required: true
  },
  {
    id: "s5_type", sectionIdx: 3,
    question: "Where will you train most of the time?",
    sub: "This determines exercise selection and plan structure.",
    type: "single",
    options: [
      opt("🏠 Home — Mostly training at home", "home"),
      opt("🏋️ Gym — Full gym access", "gym"),
      opt("🔀 Hybrid — Mix of home and gym", "hybrid")
    ],
    required: true
  },
  {
    id: "s5_equipment", sectionIdx: 3,
    question: "What equipment do you actually have access to?",
    sub: "Only choose what you genuinely have available outside a full gym.",
    type: "multi",
    options: [
      opt("Bodyweight only", "bodyweight"),
      opt("Resistance bands", "bands"),
      opt("Dumbbells", "dumbbells"),
      opt("Bench", "bench"),
      opt("Barbell / rack", "barbell_rack"),
      opt("Machines / cables", "machines")
    ],
    required: false,
    showIf: {
      mode: "any",
      conditions: [
        { stepId: "s5_type", value: "home" },
        { stepId: "s5_type", value: "hybrid" }
      ]
    }
  },
  {
    id: "s5_days", sectionIdx: 3,
    question: "How many days per week can you realistically train?",
    sub: "Choose what you can sustain consistently.",
    type: "single",
    options: [
      opt("3 days", 3),
      opt("4 days", 4),
      opt("5 days", 5),
      opt("6 days", 6)
    ],
    required: true
  },
  {
    id: "s5_duration", sectionIdx: 3,
    question: "How long can each training session be?",
    sub: "TJAI will fit volume and exercise density to this.",
    type: "single",
    options: [
      opt("20–30 minutes — Very efficient sessions", 30),
      opt("35–45 minutes — Standard efficient sessions", 45),
      opt("50–60 minutes — Plenty of time", 60),
      opt("75+ minutes — Long sessions are fine", 75)
    ],
    required: true
  },
  {
    id: "s5_training_preference", sectionIdx: 3,
    question: "What kind of training keeps you most engaged?",
    sub: "TJAI can bias the plan toward what motivates you while still serving your goal.",
    type: "single",
    options: [
      opt("Strength-focused lifting", "strength"),
      opt("Muscle-building / pump work", "hypertrophy"),
      opt("Conditioning / calorie-burn work", "conditioning"),
      opt("Balanced mix of everything", "mixed")
    ],
    required: true
  },

  {
    id: "s12_diet_style", sectionIdx: 4,
    question: "Which nutrition style fits you best right now?",
    sub: "TJAI will use this to choose a structure you can actually stick to.",
    type: "single",
    options: [
      opt("Balanced and flexible", "balanced"),
      opt("High-protein focus", "high_protein"),
      opt("Lower-carb preference", "low_carb"),
      opt("Halal-friendly structure", "halal"),
      opt("Vegetarian", "vegetarian"),
      opt("Vegan", "vegan")
    ],
    required: true
  },
  {
    id: "s13_allergies", sectionIdx: 4,
    question: "Any dietary restrictions TJAI must respect?",
    sub: "Select all that apply.",
    type: "multi",
    options: [
      opt("None", "none"),
      opt("Halal", "halal"),
      opt("Vegetarian", "vegetarian"),
      opt("Vegan", "vegan"),
      opt("Dairy-free", "dairy_free"),
      opt("Gluten-free", "gluten_free"),
      opt("Nut-free", "nut_free")
    ],
    required: true
  },
  {
    id: "s13_restriction_notes", sectionIdx: 4,
    question: "Anything specific TJAI should know about those food restrictions?",
    sub: "Optional note — for example hard exclusions, cultural preferences, or foods that must always stay in.",
    type: "text",
    placeholder: "Example: Halal only, but eggs and dairy are fine. Avoid whey and shellfish completely.",
    required: false,
    showIf: {
      mode: "all",
      conditions: [{ stepId: "s13_allergies", operator: "not_equals", value: "none" }]
    }
  },
  {
    id: "s12_foods_like", sectionIdx: 4,
    question: "Which foods would you be happy eating often?",
    sub: "Select all that apply.",
    type: "multi",
    options: [
      opt("Chicken", "chicken"),
      opt("Beef", "beef"),
      opt("Fish", "fish"),
      opt("Eggs", "eggs"),
      opt("Rice", "rice"),
      opt("Oats", "oats"),
      opt("Fruit", "fruit"),
      opt("Greek yogurt", "greek_yogurt"),
      opt("Potatoes", "potatoes"),
      opt("Legumes", "legumes")
    ],
    required: true
  },
  {
    id: "s12_foods_avoid", sectionIdx: 4,
    question: "What foods do you prefer to avoid?",
    sub: "Select all that apply.",
    type: "multi",
    options: [
      opt("Seafood", "seafood"),
      opt("Red meat", "red_meat"),
      opt("Dairy", "dairy"),
      opt("Eggs", "eggs"),
      opt("Spicy food", "spicy_food"),
      opt("Nothing specific", "nothing_specific")
    ],
    required: true
  },
  {
    id: "s14_time", sectionIdx: 4,
    question: "How should TJAI handle meal prep?",
    sub: "Choose the cooking style you can realistically follow.",
    type: "single",
    options: [
      opt("Minimal effort — very quick meals", "minimal"),
      opt("Simple cooking most days", "simple"),
      opt("Batch cook and meal prep", "batch")
    ],
    required: true
  },
  {
    id: "s11_meals", sectionIdx: 4,
    question: "How many meals per day do you prefer?",
    sub: "TJAI will use this to structure your calories and macros.",
    type: "single",
    options: [opt("3 meals", 3), opt("4 meals", 4), opt("5 meals", 5)],
    required: true
  },
  {
    id: "s16_which_supps", sectionIdx: 4,
    question: "What supplements are you already taking, if any?",
    sub: "Select all that apply. TJAI will avoid duplicating what you already use.",
    type: "multi",
    options: [
      opt("None", "none"),
      opt("Protein powder", "protein"),
      opt("Creatine", "creatine"),
      opt("Omega-3", "omega3"),
      opt("Vitamin D", "vitamin_d"),
      opt("Magnesium", "magnesium"),
      opt("Pre-workout", "preworkout")
    ],
    required: true
  },

  {
    id: "s18_biggest_problem", sectionIdx: 5,
    question: "What usually knocks you off track?",
    sub: "Select all that apply so TJAI can build around your real obstacles.",
    type: "multi",
    options: [
      opt("Motivation dips", "motivation"),
      opt("Consistency / discipline", "consistency"),
      opt("Not enough time", "time"),
      opt("Food cravings or appetite", "food_cravings"),
      opt("Not knowing what to do", "training_knowledge"),
      opt("Stress and overwhelm", "stress"),
      opt("Poor recovery", "recovery")
    ],
    required: true
  },
  {
    id: "s19_success_vision", sectionIdx: 5,
    question: "What does success look like to you in 12 weeks?",
    sub: "Pick the one that resonates most.",
    type: "single",
    options: [
      opt("I look noticeably different in the mirror", "look_different"),
      opt("I feel energetic and strong every day", "feel_energetic"),
      opt("I fit into clothes I couldn't wear before", "fit_clothes_better"),
      opt("I'm lifting heavier than I ever have", "lift_heavier"),
      opt("I've built a sustainable healthy routine", "build_routine")
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

