import type { Locale } from "@/lib/i18n";
import type { QuizStep, TJAICopy } from "@/lib/tjai-types";
import { GENERIC_MARKETS, TJAI_COUNTRY_OPTIONS } from "@/lib/tjai/market-data";

const SECTION_TITLES: Record<Locale, string[]> = {
  en: ["The Basics", "Your Body", "Your Lifestyle", "Your Training", "Your Nutrition", "Finishing Up"],
  tr: ["Temel Bilgiler", "Vücut Ölçüleri", "Yaşam Tarzı", "Antrenman", "Beslenme", "Son Detaylar"],
  ar: ["الأساسيات", "جسمك", "نمط حياتك", "تدريبك", "تغذيتك", "إنهاء"],
  es: ["Lo Básico", "Tu Cuerpo", "Tu Estilo de Vida", "Tu Entrenamiento", "Tu Nutrición", "Finalizando"],
  fr: ["Les Bases", "Votre Corps", "Votre Mode de Vie", "Votre Entraînement", "Votre Nutrition", "Finalisation"]
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
      labels: { warmup: "Warmup", cooldown: "Cooldown", duration: "Duration" },
      mealPrep: {
        title: "Your Sunday Meal Prep Plan",
        summaryPrefix: "Prep once. Eat all week. Total time:",
        totalTimeFallback: "~120 min",
        equipmentPrefix: "You will need:"
      },
      alternatives: {
        title: "Choose an alternative meal",
        subtitle: "Same calories and macros as your original",
        loading: "Loading alternatives..."
      }
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
      labels: { warmup: "Isinma", cooldown: "Soguma", duration: "Sure" },
      mealPrep: {
        title: "Pazar meal prep planiniz",
        summaryPrefix: "Bir kez hazirlayin. Tum hafta uygulayin. Toplam sure:",
        totalTimeFallback: "~120 dk",
        equipmentPrefix: "Ihtiyaciniz olacak:"
      },
      alternatives: {
        title: "Alternatif ogun secin",
        subtitle: "Orijinal ogununuzle ayni kalori ve macros",
        loading: "Alternatifler yukleniyor..."
      }
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
      labels: { warmup: "الاحماء", cooldown: "التهدئة", duration: "المدة" },
      mealPrep: {
        title: "خطة تحضير وجبات يوم الأحد",
        summaryPrefix: "حضّر مرة واحدة. تناول طوال الأسبوع. الوقت الإجمالي:",
        totalTimeFallback: "~120 دقيقة",
        equipmentPrefix: "ستحتاج إلى:"
      },
      alternatives: {
        title: "اختر وجبة بديلة",
        subtitle: "بنفس السعرات وmacros مثل وجبتك الأصلية",
        loading: "جار تحميل البدائل..."
      }
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
      labels: { warmup: "Calentamiento", cooldown: "Enfriamiento", duration: "Duracion" },
      mealPrep: {
        title: "Tu plan de meal prep del domingo",
        summaryPrefix: "Prepara una vez. Come toda la semana. Tiempo total:",
        totalTimeFallback: "~120 min",
        equipmentPrefix: "Necesitaras:"
      },
      alternatives: {
        title: "Elige una comida alternativa",
        subtitle: "Mismas calorias y macros que tu opcion original",
        loading: "Cargando alternativas..."
      }
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
      labels: { warmup: "Echauffement", cooldown: "Retour au calme", duration: "Duree" },
      mealPrep: {
        title: "Votre plan meal prep du dimanche",
        summaryPrefix: "Preparez une fois. Mangez toute la semaine. Temps total :",
        totalTimeFallback: "~120 min",
        equipmentPrefix: "Vous aurez besoin de :"
      },
      alternatives: {
        title: "Choisissez un repas alternatif",
        subtitle: "Memes calories et macros que votre option originale",
        loading: "Chargement des alternatives..."
      }
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
      opt("Lose Fat — Burn fat, get lean", "fat_loss"),
      opt("Build Muscle — Get bigger and stronger", "muscle_gain"),
      opt("Body Recomposition — Lose fat AND gain muscle", "recomposition"),
      opt("Improve Fitness — Endurance, health, energy", "fitness"),
      opt("Stay Active — Move more, feel better", "stay_active")
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
      opt("Slow & Sustainable — I want lasting results, no rush", "slow"),
      opt("Moderate Pace — Steady progress, good balance", "moderate"),
      opt("Fast Results — I'm fully committed to pushing hard", "aggressive")
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
    id: "s7_diet_history", sectionIdx: 1,
    question: "Have you tried structured dieting before?",
    sub: "Your dieting history changes how aggressive TJAI should be with calories.",
    type: "single",
    options: [
      opt("No — this is my first structured plan", "first_plan"),
      opt("Yes — and I mostly kept the results", "kept_results"),
      opt("Yes — but I regained the weight after", "regained"),
      opt("Many times — I lose and regain in cycles", "yo_yo")
    ],
    required: true
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
    id: "s4_job_type", sectionIdx: 2,
    question: "What kind of work do you do most days?",
    sub: "Your job is the biggest driver of calories burned outside training.",
    type: "single",
    options: [
      opt("Desk work — sitting most of the day", "desk"),
      opt("Mixed — on my feet part of the day", "mixed"),
      opt("Physical — manual labor or constantly moving", "physical")
    ],
    required: true
  },
  {
    id: "s4_daily_steps", sectionIdx: 2,
    question: "Roughly how many steps do you take on a normal day?",
    sub: "Check your phone if you're not sure — daily steps sharpen your calorie math.",
    type: "single",
    options: [
      opt("Under 4,000 — mostly sedentary", "under_4k"),
      opt("4,000–8,000 — light movement", "4k_8k"),
      opt("8,000–12,000 — solidly active", "8k_12k"),
      opt("Over 12,000 — always on the move", "over_12k")
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
    id: "s8_sleep_quality", sectionIdx: 2,
    question: "How would you describe the quality of that sleep?",
    sub: "Hours matter, but restless sleep changes recovery just as much.",
    type: "single",
    options: [
      opt("Restorative — I fall asleep easily and wake up rested", "restorative"),
      opt("Restless — I wake up during the night or wake up tired", "restless"),
      opt("Poor — trouble falling asleep, staying asleep, or both", "poor")
    ],
    required: true
  },
  {
    id: "s9_stress", sectionIdx: 2,
    question: "What is your current overall stress level?",
    sub: "High stress changes recovery, appetite, and how aggressive TJAI should be.",
    type: "single",
    options: [
      opt("Very Low — Life is calm and manageable", "very_low"),
      opt("Low — Occasional minor stress", "low"),
      opt("Moderate — Regular work or life pressure", "moderate"),
      opt("High — Frequently stressed", "high"),
      opt("Very High — Overwhelmed regularly", "very_high")
    ],
    required: true
  },
  {
    id: "s10_drinks", sectionIdx: 2,
    question: "What do you drink on a typical day besides water?",
    sub: "Select all that apply — liquid calories are the most common hidden progress killer.",
    type: "multi",
    options: [
      opt("Mostly water, tea, or black coffee", "mostly_water"),
      opt("Sugary drinks — soda, juice, sweetened coffee", "sugary_drinks"),
      opt("Diet / zero-sugar drinks", "diet_soda"),
      opt("Alcohol most weeks", "alcohol"),
      opt("Energy drinks", "energy_drinks")
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
      opt("Budget-Conscious — Keep meals affordable", "budget"),
      opt("Moderate — Balanced quality and cost", "moderate"),
      opt("Flexible — Performance quality matters most", "premium")
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
      opt("Beginner — Less than 6 months of consistent training", "beginner"),
      opt("Intermediate — 6 to 24 months of real training", "intermediate"),
      opt("Advanced — 2+ years of serious structured training", "advanced")
    ],
    required: true
  },
  {
    id: "s5_type", sectionIdx: 3,
    question: "Where will you train most of the time?",
    sub: "This determines exercise selection and plan structure.",
    type: "single",
    options: [
      opt("Home — Mostly training at home", "home"),
      opt("Gym — Full gym access", "gym"),
      opt("Hybrid — Mix of home and gym", "hybrid")
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
    // Adaptive: only for users whose plan will actually contain cardio. The
    // modality matters more than the dose — prescribing running to someone who
    // hates running is how fat-loss plans die in week 2.
    id: "s6_cardio_preference", sectionIdx: 3,
    question: "Which kinds of cardio would you actually do?",
    sub: "Pick everything you don't hate. TJAI only prescribes cardio you'll realistically keep doing.",
    type: "multi",
    options: [
      opt("Walking / incline walking", "walking"),
      opt("Running / jogging", "running"),
      opt("Cycling / spin", "cycling"),
      opt("Swimming", "swimming"),
      opt("Rowing or cardio machines", "rowing_machines"),
      opt("Jump rope", "jump_rope"),
      opt("Honestly — as little cardio as possible", "none")
    ],
    required: false,
    showIf: {
      mode: "any",
      conditions: [
        { stepId: "s2_goal", value: "fat_loss" },
        { stepId: "s2_goal", value: "fitness" },
        { stepId: "s2_goal", value: "stay_active" },
        { stepId: "s5_training_preference", value: "conditioning" },
        { stepId: "s5_training_preference", value: "mixed" }
      ]
    }
  },

  {
    id: "s20_country", sectionIdx: 4,
    question: "Which country do you live in?",
    sub: "TJAI localizes your meals and grocery list to what's actually sold near you.",
    type: "single",
    options: TJAI_COUNTRY_OPTIONS,
    required: true
  },
  {
    id: "s20_market", sectionIdx: 4,
    question: "Where do you usually buy your groceries?",
    sub: "Pick the store closest to you — your grocery list will be built for it.",
    type: "single",
    dynamicOptions: "markets_by_country",
    options: GENERIC_MARKETS,
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
    // Adaptive: vegetarian/vegan only. Hitting a 150g+ protein target on
    // plants is a sourcing problem — a plan built on tofu for someone who
    // won't eat tofu is generic advice, not coaching.
    id: "s12_plant_protein", sectionIdx: 4,
    question: "Which protein sources are you happy to eat regularly?",
    sub: "Your protein target has to come from somewhere — TJAI builds meals only from sources you accept.",
    type: "multi",
    options: [
      opt("Tofu / tempeh", "tofu_tempeh"),
      opt("Seitan", "seitan"),
      opt("Lentils, beans and chickpeas", "legumes"),
      opt("Plant protein powder", "protein_powder"),
      opt("Dairy and eggs (if vegetarian)", "dairy_eggs"),
      opt("Nuts and seeds", "nuts_seeds")
    ],
    required: false,
    showIf: {
      mode: "any",
      conditions: [
        { stepId: "s12_diet_style", value: "vegetarian" },
        { stepId: "s12_diet_style", value: "vegan" }
      ]
    }
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
    id: "s11_eating_out", sectionIdx: 4,
    question: "How often do you eat out or order delivery?",
    sub: "TJAI plans around your real life instead of pretending every meal is home-cooked.",
    type: "single",
    options: [
      opt("Rarely — almost everything is home-made", "rarely"),
      opt("Once or twice a week", "weekly"),
      opt("3–5 times a week", "several_weekly"),
      opt("Most days", "daily")
    ],
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
    id: "s15_weekend_consistency", sectionIdx: 5,
    question: "What happens to your eating on weekends?",
    sub: "Weekends decide most diets — two loose days can erase five careful ones.",
    type: "single",
    options: [
      opt("Same as weekdays — I stay consistent", "consistent"),
      opt("Slightly looser, but roughly on track", "slightly_off"),
      opt("Weekends usually undo my week", "derails")
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

/**
 * Per-locale overrides for individual quiz steps.
 *
 * BASE_STEPS is authored in English only; until now every locale rendered the
 * 43 questions in English with localized section titles — the biggest single
 * localization gap in the product. This map lets locales be filled in
 * incrementally: a missing locale, step, or field falls back to the English
 * base, so partial coverage is a strict improvement and never a crash.
 *
 * `optionLabels` is keyed by the option VALUE (stringified), never by the
 * English label — labels are display-only and free to change.
 */
type StepOverride = {
  question?: string;
  sub?: string;
  placeholder?: string;
  optionLabels?: Record<string, string>;
};

const STEP_I18N: Partial<Record<Locale, Record<string, StepOverride>>> = {
  // Turkish: complete coverage of all base steps (owner-approved 2026-08-09).
  // Register matches the product's existing TR copy: informal "sen", direct,
  // coach-voiced, full diacritics.
  tr: {
    s2_goal: {
      question: "Birincil hedefin ne?",
      sub: "Bu, tüm TJAI planını şekillendirir.",
      optionLabels: {
        fat_loss: "Yağ Yak — Yağları erit, fit görün",
        muscle_gain: "Kas Yap — Daha büyük ve güçlü ol",
        recomposition: "Vücut Kompozisyonu — Aynı anda yağ yak VE kas kazan",
        fitness: "Kondisyonu Geliştir — Dayanıklılık, sağlık, enerji",
        stay_active: "Aktif Kal — Daha çok hareket et, daha iyi hisset"
      }
    },
    s2_goal_detail: {
      question: "Önce hangi sonuç senin için en önemli?",
      sub: "TJAI planı, en çok önem verdiğin sonuca göre eğer.",
      optionLabels: {
        sustainable_cut: "Koruyabileceğim kalıcı yağ kaybı",
        aggressive_cut: "Agresif ve gözle görülür bir düşüş",
        size: "Daha fazla hacim ve dolgunluk",
        strength: "Daha fazla güç ve atletiklik",
        aesthetic: "Daha estetik ve dengeli bir fizik",
        energy: "Daha fazla enerji ve daha iyi sağlık",
        consistency: "Gerçekten sürdürebileceğim bir rutin"
      }
    },
    s1_gender: {
      question: "Biyolojik cinsiyetin nedir?",
      sub: "Daha doğru enerji ve toparlanma hesapları için kullanılır.",
      optionLabels: { male: "Erkek", female: "Kadın" }
    },
    s1_age: {
      question: "Yaş aralığın nedir?",
      sub: "Yaş; toparlanmayı, antrenman toleransını ve metabolizma hızını doğrudan etkiler.",
      optionLabels: {
        "20": "16–24 yaş",
        "30": "25–34 yaş",
        "40": "35–44 yaş",
        "50": "45–54 yaş",
        "58": "55 yaş ve üzeri"
      }
    },
    s1_weight: {
      question: "Şu anki kilon nedir?",
      sub: "Kalori, protein hedefleri ve öngörülen ilerleme için kullanılır.",
      optionLabels: {
        "48": "50 kg altı",
        "58": "50–65 kg",
        "72": "65–80 kg",
        "90": "80–100 kg",
        "110": "100–120 kg",
        "125": "120 kg üzeri"
      }
    },
    s1_height: {
      question: "Boyun kaç?",
      sub: "Enerji ihtiyacını ve egzersiz ölçeklemesini hesaplamak için kiloyla birlikte kullanılır.",
      optionLabels: {
        "152": "155 cm altı",
        "160": "155–165 cm",
        "170": "165–175 cm",
        "180": "175–185 cm",
        "190": "185–195 cm",
        "198": "195 cm üzeri"
      }
    },
    s2_pace: {
      question: "Sonuçları ne kadar hızlı istiyorsun?",
      sub: "Dürüst ol — bu; antrenman yükünü, toparlanmayı ve kalorileri doğrudan etkiler.",
      optionLabels: {
        slow: "Yavaş ve Sürdürülebilir — Kalıcı sonuç istiyorum, acelem yok",
        moderate: "Orta Tempo — İstikrarlı ilerleme, iyi denge",
        aggressive: "Hızlı Sonuç — Sonuna kadar yüklenmeye hazırım"
      }
    },
    s3_body_silhouette: {
      question: "Hangi vücut tipi seni en iyi tanımlıyor?",
      sub: "TJAI'nin yağ oranını tahmin etmesine ve planı ne kadar zorlayacağına yardımcı olur.",
      optionLabels: {
        very_lean: "Çok Zayıf",
        lean: "Zayıf / Fit",
        average: "Ortalama",
        overweight: "Fazla Kilolu",
        obese: "Obez"
      }
    },
    s17_injuries: {
      question: "Herhangi bir sakatlığın veya fiziksel kısıtlaman var mı?",
      sub: "Uyanların hepsini seç. TJAI egzersizleri ve toparlanma kurallarını buna göre ayarlar.",
      optionLabels: {
        none: "Yok",
        knee: "Diz ağrısı",
        lower_back: "Bel ağrısı",
        shoulder: "Omuz ağrısı",
        hip: "Kalça ağrısı",
        wrist_elbow: "Bilek / dirsek ağrısı",
        recent_surgery: "Yakın zamanda ameliyat",
        chronic_condition: "Kronik rahatsızlık"
      }
    },
    s17_conditions: {
      question: "Bu kısıtlamalarla ilgili TJAI'nin bilmesi gereken bir şey var mı?",
      sub: "İsteğe bağlı not: hareket kısıtlamaları, doktor tavsiyesi veya kaçınman gerektiğini bildiğin egzersizler.",
      placeholder: "Örnek: Şimdilik omuz üstü itiş yok. Yürüyüş ve alt vücut serbest."
    },
    s19_target_weight: {
      question: "Biliyorsan, hedeflediğin vücut ağırlığı nedir?",
      sub: "İsteğe bağlı — ama aklında gerçekçi bir hedef varsa işe yarar.",
      placeholder: "örn. 78"
    },
    s7_diet_history: {
      question: "Daha önce programlı bir diyet denedin mi?",
      sub: "Diyet geçmişin, TJAI'nin kalorilerde ne kadar agresif olacağını değiştirir.",
      optionLabels: {
        first_plan: "Hayır — bu ilk programlı planım",
        kept_results: "Evet — ve sonuçları büyük ölçüde korudum",
        regained: "Evet — ama sonrasında kilo geri geldi",
        yo_yo: "Defalarca — verip geri alıyorum"
      }
    },
    s4_daily_activity: {
      question: "Antrenman dışında ne kadar aktifsin?",
      sub: "Bu, planlı antrenman hariç günlük hareket seviyen.",
      optionLabels: {
        very_low: "Çok düşük — Masa başı iş, gün boyu oturuyorum",
        low: "Düşük — Biraz yürüyüş, çoğunlukla hareketsiz",
        moderate: "Orta — Düzenli hareket, aktif yaşam",
        active: "Aktif — Fiziksel iş veya çok hareketli bir gün"
      }
    },
    s4_job_type: {
      question: "Çoğu gün ne tür bir işte çalışıyorsun?",
      sub: "İşin, antrenman dışında yakılan kalorinin en büyük belirleyicisi.",
      optionLabels: {
        desk: "Masa başı — günün çoğu oturarak",
        mixed: "Karışık — günün bir kısmı ayakta",
        physical: "Fiziksel — beden gücü veya sürekli hareket"
      }
    },
    s4_daily_steps: {
      question: "Normal bir günde yaklaşık kaç adım atıyorsun?",
      sub: "Emin değilsen telefonuna bak — günlük adımlar kalori hesabını netleştirir.",
      optionLabels: {
        under_4k: "4.000 altı — çoğunlukla hareketsiz",
        "4k_8k": "4.000–8.000 — hafif hareket",
        "8k_12k": "8.000–12.000 — hayli aktif",
        over_12k: "12.000 üzeri — sürekli hareket halinde"
      }
    },
    s8_hours: {
      question: "Ortalama gecelik kaç saat uyuyorsun?",
      sub: "Uyku; kortizolü, toparlanmayı, yağ kaybını ve performansı etkiler.",
      optionLabels: {
        "5": "4–5 saat — Kronik uykusuz",
        "6": "6 saat — Ortalamanın altı",
        "7": "7 saat — Ortalama",
        "8": "8 saat — İyi",
        "9": "9+ saat — Çok dinlenmiş"
      }
    },
    s8_sleep_quality: {
      question: "O uykunun kalitesini nasıl tanımlarsın?",
      sub: "Saat önemli, ama huzursuz uyku toparlanmayı en az onun kadar değiştirir.",
      optionLabels: {
        restorative: "Dinlendirici — kolay uyurum, dinlenmiş uyanırım",
        restless: "Huzursuz — gece uyanıyorum veya yorgun kalkıyorum",
        poor: "Kötü — uykuya dalmakta, sürdürmekte ya da ikisinde birden zorlanıyorum"
      }
    },
    s9_stress: {
      question: "Şu anki genel stres seviyen nedir?",
      sub: "Yüksek stres; toparlanmayı, iştahı ve TJAI'nin ne kadar agresif olacağını değiştirir.",
      optionLabels: {
        very_low: "Çok Düşük — Hayat sakin ve yönetilebilir",
        low: "Düşük — Ara sıra ufak stres",
        moderate: "Orta — Düzenli iş veya hayat baskısı",
        high: "Yüksek — Sık sık stresliyim",
        very_high: "Çok Yüksek — Düzenli olarak bunalmış hissediyorum"
      }
    },
    s10_drinks: {
      question: "Tipik bir günde su dışında ne içersin?",
      sub: "Uyanları seç — sıvı kaloriler, ilerlemeyi bitiren en yaygın gizli etken.",
      optionLabels: {
        mostly_water: "Çoğunlukla su, çay veya sade kahve",
        sugary_drinks: "Şekerli içecekler — gazlı içecek, meyve suyu, şekerli kahve",
        diet_soda: "Diyet / şekersiz içecekler",
        alcohol: "Çoğu hafta alkol",
        energy_drinks: "Enerji içecekleri"
      }
    },
    s18_schedule_constraint: {
      question: "İstikrarını en çok ne sınırlayabilir?",
      sub: "TJAI yokmuş gibi davranmak yerine planı bu kısıtın etrafına kurar.",
      optionLabels: {
        none: "Hiçbiri — programım düzenli",
        short_sessions: "Çoğu gün kısa antrenmanlara ihtiyacım var",
        shift_work: "Çalışma saatlerim sık değişiyor",
        family_load: "Aile veya bakım yükümlülükleri",
        travel: "Seyahat veya öngörülemeyen haftalar"
      }
    },
    s18_schedule_notes: {
      question: "Bu program sorunu haftadan haftaya gerçekte neye benziyor?",
      sub: "İsteğe bağlı detay — antrenman günlerini ve toparlanmayı daha gerçekçi yerleştirmeye yarar.",
      placeholder: "Örnek: Haftada iki gece vardiyası. Pazar en uygun günüm. İki haftada bir cuma seyahat."
    },
    s14_budget: {
      question: "Bu plan için aylık gıda bütçen nedir?",
      sub: "TJAI bu bütçeye uygun yiyecekler ve takviye seviyeleri seçer.",
      optionLabels: {
        budget: "Bütçe Dostu — Öğünler ekonomik kalsın",
        moderate: "Orta — Kalite ve maliyet dengede",
        premium: "Esnek — Önce performans kalitesi"
      }
    },
    s19_daily_routine: {
      question: "Senin için normal bir hafta içi günü nasıl geçiyor?",
      sub: "Uyanma saatini, iş/okulu, yolu, öğün saatlerini ve gerçekçi antrenman zamanını yaz.",
      placeholder: "Örnek: 6:30 kalkış, 9-6 masa başı iş, 13:00 öğle yemeği, 19:00 evdeyim, antrenman için en iyi saat 19:30."
    },
    s5_trains: {
      question: "Şu anki antrenman seviyen nedir?",
      sub: "Dürüst ol — TJAI hedefinle değil, gerçek seviyenle eşleşmeli.",
      optionLabels: {
        beginner: "Başlangıç — 6 aydan az düzenli antrenman",
        intermediate: "Orta — 6 ila 24 ay gerçek antrenman",
        advanced: "İleri — 2+ yıl ciddi, programlı antrenman"
      }
    },
    s5_type: {
      question: "Çoğunlukla nerede antrenman yapacaksın?",
      sub: "Bu; egzersiz seçimini ve plan yapısını belirler.",
      optionLabels: {
        home: "Ev — Çoğunlukla evde",
        gym: "Salon — Tam donanımlı salon erişimi",
        hybrid: "Karma — Ev ve salon karışık"
      }
    },
    s5_equipment: {
      question: "Gerçekte hangi ekipmanlara erişimin var?",
      sub: "Yalnızca tam donanımlı salon dışında gerçekten sahip olduklarını seç.",
      optionLabels: {
        bodyweight: "Sadece vücut ağırlığı",
        bands: "Direnç bandı",
        dumbbells: "Dambıl",
        bench: "Sehpa (bench)",
        barbell_rack: "Halter / rack",
        machines: "Makineler / kablolar"
      }
    },
    s5_days: {
      question: "Haftada gerçekçi olarak kaç gün antrenman yapabilirsin?",
      sub: "Sürekli koruyabileceğin sayıyı seç.",
      optionLabels: { "3": "3 gün", "4": "4 gün", "5": "5 gün", "6": "6 gün" }
    },
    s5_duration: {
      question: "Her antrenman ne kadar sürebilir?",
      sub: "TJAI hacmi ve egzersiz yoğunluğunu buna göre ayarlar.",
      optionLabels: {
        "30": "20–30 dakika — Çok verimli seanslar",
        "45": "35–45 dakika — Standart verimli seanslar",
        "60": "50–60 dakika — Yeterince zaman var",
        "75": "75+ dakika — Uzun seans sorun değil"
      }
    },
    s5_training_preference: {
      question: "Hangi antrenman türü seni en çok motive ediyor?",
      sub: "TJAI hedefine hizmet etmeye devam ederken planı seni motive edene doğru eğebilir.",
      optionLabels: {
        strength: "Güç odaklı kaldırışlar",
        hypertrophy: "Kas geliştirme / pump işi",
        conditioning: "Kondisyon / kalori yakımı",
        mixed: "Hepsinden dengeli bir karışım"
      }
    },
    s6_cardio_preference: {
      question: "Hangi kardiyo türlerini gerçekten yaparsın?",
      sub: "Nefret etmediğin her şeyi seç. TJAI yalnızca gerçekçi biçimde sürdüreceğin kardiyoyu programa koyar.",
      optionLabels: {
        walking: "Yürüyüş / eğimli yürüyüş",
        running: "Koşu / hafif tempo koşu",
        cycling: "Bisiklet / spin",
        swimming: "Yüzme",
        rowing_machines: "Kürek veya kardiyo makineleri",
        jump_rope: "İp atlama",
        none: "Açıkçası — mümkün olduğunca az kardiyo"
      }
    },
    s20_country: {
      question: "Hangi ülkede yaşıyorsun?",
      sub: "TJAI öğünlerini ve alışveriş listeni çevrende gerçekten satılanlara göre yerelleştirir.",
      optionLabels: {
        us: "Amerika Birleşik Devletleri",
        uk: "Birleşik Krallık",
        canada: "Kanada",
        australia: "Avustralya",
        ireland: "İrlanda",
        turkey: "Türkiye",
        saudi_arabia: "Suudi Arabistan",
        uae: "Birleşik Arap Emirlikleri",
        egypt: "Mısır",
        iraq: "Irak",
        jordan: "Ürdün",
        kuwait: "Kuveyt",
        qatar: "Katar",
        morocco: "Fas",
        spain: "İspanya",
        mexico: "Meksika",
        argentina: "Arjantin",
        colombia: "Kolombiya",
        chile: "Şili",
        france: "Fransa",
        belgium: "Belçika",
        germany: "Almanya",
        netherlands: "Hollanda",
        india: "Hindistan",
        pakistan: "Pakistan",
        nigeria: "Nijerya",
        philippines: "Filipinler",
        other: "Başka bir yer"
      }
    },
    s20_market: {
      question: "Market alışverişini genelde nereden yaparsın?",
      sub: "Sana en yakın olanı seç — alışveriş listen ona göre hazırlanır.",
      optionLabels: {
        local_supermarket: "Büyük bir süpermarket",
        discount_chain: "İndirim market zinciri",
        local_market: "Semt pazarı",
        online_groceries: "Online market",
        other_market: "Başka bir yer / değişiyor"
      }
    },
    s12_diet_style: {
      question: "Şu an sana en uygun beslenme tarzı hangisi?",
      sub: "TJAI bunu, gerçekten sürdürebileceğin bir yapı seçmek için kullanır.",
      optionLabels: {
        balanced: "Dengeli ve esnek",
        high_protein: "Yüksek protein odaklı",
        low_carb: "Düşük karbonhidrat tercihi",
        halal: "Helal uyumlu yapı",
        vegetarian: "Vejetaryen",
        vegan: "Vegan"
      }
    },
    s12_plant_protein: {
      question: "Hangi protein kaynaklarını düzenli olarak yemekten memnun olursun?",
      sub: "Protein hedefin bir yerden gelmek zorunda — TJAI öğünleri yalnızca kabul ettiğin kaynaklardan kurar.",
      optionLabels: {
        tofu_tempeh: "Tofu / tempeh",
        seitan: "Seitan",
        legumes: "Mercimek, fasulye ve nohut",
        protein_powder: "Bitkisel protein tozu",
        dairy_eggs: "Süt ürünleri ve yumurta (vejetaryen ise)",
        nuts_seeds: "Kuruyemiş ve tohumlar"
      }
    },
    s13_allergies: {
      question: "TJAI'nin uyması gereken beslenme kısıtları var mı?",
      sub: "Uyanların hepsini seç.",
      optionLabels: {
        none: "Yok",
        halal: "Helal",
        vegetarian: "Vejetaryen",
        vegan: "Vegan",
        dairy_free: "Süt ürünsüz",
        gluten_free: "Glutensiz",
        nut_free: "Kuruyemişsiz"
      }
    },
    s13_restriction_notes: {
      question: "Bu yiyecek kısıtlarıyla ilgili TJAI'nin bilmesi gereken özel bir şey var mı?",
      sub: "İsteğe bağlı not — örneğin kesin hariç tutmalar, kültürel tercihler veya mutlaka kalması gereken yiyecekler.",
      placeholder: "Örnek: Sadece helal; yumurta ve süt ürünleri uygun. Whey ve kabuklu deniz ürünlerinden tamamen kaçın."
    },
    s12_foods_like: {
      question: "Hangi yiyecekleri sık sık yemekten memnun olursun?",
      sub: "Uyanların hepsini seç.",
      optionLabels: {
        chicken: "Tavuk",
        beef: "Dana eti",
        fish: "Balık",
        eggs: "Yumurta",
        rice: "Pirinç",
        oats: "Yulaf",
        fruit: "Meyve",
        greek_yogurt: "Süzme yoğurt",
        potatoes: "Patates",
        legumes: "Baklagiller"
      }
    },
    s12_foods_avoid: {
      question: "Hangi yiyeceklerden kaçınmayı tercih edersin?",
      sub: "Uyanların hepsini seç.",
      optionLabels: {
        seafood: "Deniz ürünleri",
        red_meat: "Kırmızı et",
        dairy: "Süt ürünleri",
        eggs: "Yumurta",
        spicy_food: "Acılı yemek",
        nothing_specific: "Belirli bir şey yok"
      }
    },
    s14_time: {
      question: "TJAI yemek hazırlığını nasıl ele almalı?",
      sub: "Gerçekçi olarak uygulayabileceğin pişirme tarzını seç.",
      optionLabels: {
        minimal: "Minimum çaba — çok hızlı öğünler",
        simple: "Çoğu gün basit yemekler",
        batch: "Toplu pişirme ve meal prep"
      }
    },
    s11_meals: {
      question: "Günde kaç öğün tercih edersin?",
      sub: "TJAI kalorini ve makrolarını buna göre yapılandırır.",
      optionLabels: { "3": "3 öğün", "4": "4 öğün", "5": "5 öğün" }
    },
    s11_eating_out: {
      question: "Ne sıklıkla dışarıda yer veya sipariş verirsin?",
      sub: "TJAI her öğün evde pişiyormuş gibi davranmak yerine gerçek hayatına göre planlar.",
      optionLabels: {
        rarely: "Nadiren — neredeyse her şey ev yapımı",
        weekly: "Haftada bir veya iki kez",
        several_weekly: "Haftada 3–5 kez",
        daily: "Çoğu gün"
      }
    },
    s16_which_supps: {
      question: "Halihazırda kullandığın takviyeler var mı?",
      sub: "Uyanları seç. TJAI zaten kullandıklarını tekrarlamaz.",
      optionLabels: {
        none: "Yok",
        protein: "Protein tozu",
        creatine: "Kreatin",
        omega3: "Omega-3",
        vitamin_d: "D Vitamini",
        magnesium: "Magnezyum",
        preworkout: "Pre-workout"
      }
    },
    s15_weekend_consistency: {
      question: "Hafta sonları beslenmene ne oluyor?",
      sub: "Diyetlerin kaderini hafta sonları belirler — iki gevşek gün, beş dikkatli günü silebilir.",
      optionLabels: {
        consistent: "Hafta içiyle aynı — istikrarlıyım",
        slightly_off: "Biraz daha gevşek ama rotada",
        derails: "Hafta sonları genelde haftamı mahvediyor"
      }
    },
    s18_biggest_problem: {
      question: "Seni genelde ne raydan çıkarır?",
      sub: "Uyanları seç ki TJAI planı gerçek engellerinin etrafına kursun.",
      optionLabels: {
        motivation: "Motivasyon düşüşleri",
        consistency: "İstikrar / disiplin",
        time: "Zaman yetersizliği",
        food_cravings: "Yeme isteği ve iştah",
        training_knowledge: "Ne yapacağımı bilmemek",
        stress: "Stres ve bunalmışlık",
        recovery: "Kötü toparlanma"
      }
    },
    s19_success_vision: {
      question: "12 hafta sonunda başarı senin için neye benziyor?",
      sub: "Sana en çok hitap edeni seç.",
      optionLabels: {
        look_different: "Aynada gözle görülür şekilde farklı görünüyorum",
        feel_energetic: "Her gün enerjik ve güçlü hissediyorum",
        fit_clothes_better: "Önceden giremediğim kıyafetlere sığıyorum",
        lift_heavier: "Hiç olmadığım kadar ağır kaldırıyorum",
        build_routine: "Sürdürülebilir, sağlıklı bir rutin kurdum"
      }
    }
  }
};

export function getTjaiSteps(locale: Locale): QuizStep[] {
  const sections = SECTION_TITLES[locale] ?? SECTION_TITLES.en;
  const overrides = STEP_I18N[locale];
  return BASE_STEPS.map((step) => {
    const o = overrides?.[step.id];
    return {
      ...step,
      question: o?.question ?? step.question,
      sub: o?.sub ?? step.sub,
      placeholder: o?.placeholder ?? step.placeholder,
      options: o?.optionLabels
        ? step.options?.map((option) => ({
            ...option,
            label: o.optionLabels?.[String(option.value)] ?? option.label
          }))
        : step.options,
      section: sections[step.sectionIdx] ?? SECTION_TITLES.en[step.sectionIdx],
      sectionNumber: step.sectionIdx + 1,
      totalSections: 6
    };
  });
}

