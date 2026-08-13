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
    nav: { back: "Geri", continue: "Devam", generate: "Planımı Oluştur", stepOf: "Adım", sectionOf: "Bölüm" },
    validation: { required: "Devam etmek için bir cevap seçin." },
    quiz: {
      title: "TJAI Değerlendirmesi",
      subtitle: "Kişisel planınızı oluşturması için tüm bölümleri yanıtlayın.",
      notAtAll: "Hiç",
      extremely: "Çok",
      chars: "karakter",
      unitYears: "yaş",
      unitCm: "cm",
      unitKg: "kg",
      unitPct: "%",
      unitHrs: "saat"
    },
    calculating: {
      title: "Planınız oluşturuluyor...",
      statuses: [
        "BMR ve TDEE hesaplanıyor...",
        "Günlük rutininiz analiz ediliyor...",
        "12 haftalık diyet tasarlanıyor...",
        "Antrenman programı oluşturuluyor...",
        "Öğünleriniz kişiselleştiriliyor...",
        "Makrolar hedefinize göre optimize ediliyor...",
        "Besin tercihleriniz ekleniyor...",
        "Kalori periodizasyonu uygulanıyor...",
        "Dönüşüm planı son haline getiriliyor..."
      ],
      calorieTarget: "Kalori hedefiniz",
      proteinTarget: "Protein hedefiniz",
      progressTarget: "Tahmini ilerleme"
    },
    result: {
      eyebrow: "TJAI PLANINIZ",
      yourDiet: "12 Haftalık Diyetiniz",
      yourProgram: "12 Haftalık Programınız",
      supplements: "Takviyeler",
      mindset: "Zihniyet",
      saveToDashboard: "Panele Kaydet",
      startOver: "Baştan Başla",
      saving: "Kaydediliyor...",
      saved: "Plan panelinize kaydedildi.",
      saveError: "Plan kaydedilemedi.",
      generatedAt: "Plan oluşturma",
      metrics: {
        calories: "Kalori",
        protein: "Protein",
        fat: "Yağ",
        carbs: "Karbonhidrat",
        water: "Su",
        weekly: "Haftalık değişim",
        timeToGoal: "Hedef süresi"
      },
      labels: { warmup: "Isınma", cooldown: "Soğuma", duration: "Süre" },
      mealPrep: {
        title: "Pazar meal prep planınız",
        summaryPrefix: "Bir kez hazırlayın. Tüm hafta uygulayın. Toplam süre:",
        totalTimeFallback: "~120 dk",
        equipmentPrefix: "İhtiyacınız olacak:"
      },
      alternatives: {
        title: "Alternatif öğün seçin",
        subtitle: "Orijinal öğününüzle aynı kalori ve macros",
        loading: "Alternatifler yükleniyor..."
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
  },
  // Arabic: complete coverage matching the Turkish reference set (2026-08-09).
  // MSA, direct coach voice, masculine-singular default, Western numerals.
  // Independently native-reviewed; all flagged issues fixed pre-integration.
  ar: {
    s2_goal: {
      question: "ما هو هدفك الأساسي؟",
      sub: "هذا يشكّل خطة TJAI بأكملها.",
      optionLabels: {
        fat_loss: "خسارة الدهون — احرق الدهون واحصل على جسم مشدود",
        muscle_gain: "بناء العضلات — كبّر حجمك وزد قوتك",
        recomposition: "إعادة تشكيل الجسم — اخسر الدهون واكسب العضلات في آن واحد",
        fitness: "تحسين اللياقة — التحمّل والصحة والطاقة",
        stay_active: "البقاء نشيطاً — تحرّك أكثر واشعر بتحسن"
      }
    },
    s2_goal_detail: {
      question: "أي نتيجة تهمك أكثر في البداية؟",
      sub: "سيوجّه TJAI الخطة نحو النتيجة التي تهمك أكثر.",
      optionLabels: {
        sustainable_cut: "خسارة دهون مستدامة أستطيع الحفاظ عليها",
        aggressive_cut: "تنشيف قوي وانخفاض واضح في الوزن",
        size: "حجم عضلي أكبر وامتلاء أكثر",
        strength: "قوة أكبر ولياقة رياضية أعلى",
        aesthetic: "قوام أكثر جمالاً وتوازناً",
        energy: "طاقة أكبر وصحة أفضل",
        consistency: "بناء روتين أستطيع الالتزام به فعلاً"
      }
    },
    s1_gender: {
      question: "ما هو جنسك البيولوجي؟",
      sub: "يُستخدم لحساب أدق للطاقة والتعافي.",
      optionLabels: { male: "ذكر", female: "أنثى" }
    },
    s1_age: {
      question: "ما هي فئتك العمرية؟",
      sub: "العمر يؤثر مباشرة على التعافي وتحمّل التدريب ومعدل الأيض.",
      optionLabels: {
        "20": "16–24 سنة",
        "30": "25–34 سنة",
        "40": "35–44 سنة",
        "50": "45–54 سنة",
        "58": "55 سنة فما فوق"
      }
    },
    s1_weight: {
      question: "ما هو وزنك الحالي؟",
      sub: "يُستخدم لحساب السعرات وأهداف البروتين والتقدم المتوقع.",
      optionLabels: {
        "48": "أقل من 50 كغ",
        "58": "50–65 كغ",
        "72": "65–80 كغ",
        "90": "80–100 كغ",
        "110": "100–120 كغ",
        "125": "أكثر من 120 كغ"
      }
    },
    s1_height: {
      question: "ما هو طولك؟",
      sub: "يُستخدم مع الوزن لتقدير احتياجات الطاقة وضبط شدة التمارين.",
      optionLabels: {
        "152": "أقل من 155 سم",
        "160": "155–165 سم",
        "170": "165–175 سم",
        "180": "175–185 سم",
        "190": "185–195 سم",
        "198": "أكثر من 195 سم"
      }
    },
    s2_pace: {
      question: "بأي سرعة تريد أن تحصل على نتائج؟",
      sub: "كن صادقاً — هذا يؤثر مباشرة على شدة التدريب والتعافي والسعرات.",
      optionLabels: {
        slow: "بطيء ومستدام — أريد نتائج دائمة، بلا استعجال",
        moderate: "وتيرة متوسطة — تقدّم ثابت وتوازن جيد",
        aggressive: "نتائج سريعة — ملتزم تماماً بالدفع بأقصى جهد"
      }
    },
    s3_body_silhouette: {
      question: "أي شكل جسم يصفك أكثر؟",
      sub: "يساعد هذا TJAI على تقدير نسبة الدهون في جسمك ومدى قوة دفع الخطة.",
      optionLabels: {
        very_lean: "نحيف جداً",
        lean: "رشيق",
        average: "متوسط",
        overweight: "وزن زائد",
        obese: "بدين"
      }
    },
    s17_injuries: {
      question: "هل لديك أي إصابات أو قيود جسدية؟",
      sub: "اختر كل ما ينطبق عليك. سيعدّل TJAI التمارين وقواعد التعافي بناءً على ذلك.",
      optionLabels: {
        none: "لا شيء",
        knee: "ألم في الركبة",
        lower_back: "ألم أسفل الظهر",
        shoulder: "ألم في الكتف",
        hip: "ألم في الورك",
        wrist_elbow: "ألم في الرسغ / المرفق",
        recent_surgery: "عملية جراحية حديثة",
        chronic_condition: "حالة مزمنة"
      }
    },
    s17_conditions: {
      question: "هل هناك ما يجب أن يعرفه TJAI عن هذه القيود؟",
      sub: "ملاحظة اختيارية: قيود الحركة أو إرشادات طبية أو تمارين تعرف أنك يجب أن تتجنبها.",
      placeholder: "مثال: لا ضغط فوق الرأس حالياً. المشي وتمارين الجزء السفلي مسموحة."
    },
    s19_target_weight: {
      question: "إن كنت تعرفه، ما هو وزن الجسم المستهدف الذي تسعى إليه؟",
      sub: "اختياري، لكنه مفيد إن كان لديك بالفعل هدف واقعي في ذهنك.",
      placeholder: "مثال: 78"
    },
    s7_diet_history: {
      question: "هل جرّبت نظاماً غذائياً منظماً من قبل؟",
      sub: "تاريخك مع الحميات الغذائية يغيّر مدى صرامة TJAI في تحديد السعرات.",
      optionLabels: {
        first_plan: "لا — هذه أول خطة منظمة لي",
        kept_results: "نعم — وحافظت على النتائج في الغالب",
        regained: "نعم — لكنني استعدت الوزن بعد ذلك",
        yo_yo: "مرات عديدة — أخسر الوزن ثم أستعيده بشكل دوري"
      }
    },
    s4_daily_activity: {
      question: "ما مدى نشاطك خارج أوقات تمرينك؟",
      sub: "هذا مستوى حركتك اليومية، دون احتساب التدريب المخطط له.",
      optionLabels: {
        very_low: "منخفض جداً — عمل مكتبي، جالس معظم اليوم",
        low: "منخفض — بعض المشي، خامل في الغالب",
        moderate: "متوسط — حركة منتظمة، نمط حياة نشط",
        active: "نشط — عمل بدني أو روتين يومي نشط جداً"
      }
    },
    s4_job_type: {
      question: "ما نوع العمل الذي تقوم به معظم الأيام؟",
      sub: "عملك هو أكبر عامل في حرق السعرات خارج التدريب.",
      optionLabels: {
        desk: "عمل مكتبي — جالس معظم اليوم",
        mixed: "مختلط — واقف جزءاً من اليوم",
        physical: "بدني — عمل يدوي أو حركة مستمرة"
      }
    },
    s4_daily_steps: {
      question: "كم خطوة تقريباً تمشيها في يوم عادي؟",
      sub: "تحقق من هاتفك إن لم تكن متأكداً — عدد الخطوات اليومية يجعل حساب السعرات أدق.",
      optionLabels: {
        under_4k: "أقل من 4,000 — خامل في الغالب",
        "4k_8k": "4,000–8,000 — حركة خفيفة",
        "8k_12k": "8,000–12,000 — نشيط بوضوح",
        over_12k: "أكثر من 12,000 — دائم الحركة"
      }
    },
    s8_hours: {
      question: "كم ساعة تنام في المتوسط كل ليلة؟",
      sub: "النوم يؤثر على الكورتيزول والتعافي وخسارة الدهون والأداء.",
      optionLabels: {
        "5": "4–5 ساعات — حرمان نوم مزمن",
        "6": "6 ساعات — أقل من المتوسط",
        "7": "7 ساعات — متوسط",
        "8": "8 ساعات — جيد",
        "9": "9+ ساعات — راحة كاملة"
      }
    },
    s8_sleep_quality: {
      question: "كيف تصف جودة نومك؟",
      sub: "عدد الساعات مهم، لكن النوم المضطرب يغيّر التعافي بالقدر نفسه.",
      optionLabels: {
        restorative: "مريح — أنام بسهولة وأستيقظ نشيطاً",
        restless: "مضطرب — أستيقظ أثناء الليل أو أنهض متعباً",
        poor: "سيئ — صعوبة في النوم أو الاستمرار فيه أو كلاهما"
      }
    },
    s9_stress: {
      question: "ما هو مستوى توترك العام حالياً؟",
      sub: "التوتر المرتفع يغيّر التعافي والشهية ومدى صرامة TJAI.",
      optionLabels: {
        very_low: "منخفض جداً — الحياة هادئة ويمكن التحكم بها",
        low: "منخفض — توتر بسيط بين الحين والآخر",
        moderate: "متوسط — ضغط عمل أو حياة منتظم",
        high: "مرتفع — متوتر باستمرار",
        very_high: "مرتفع جداً — أشعر بالإرهاق النفسي بانتظام"
      }
    },
    s10_drinks: {
      question: "ماذا تشرب في يوم عادي غير الماء؟",
      sub: "اختر كل ما ينطبق — السعرات السائلة من أكثر الأسباب الخفية شيوعاً لتوقف التقدم.",
      optionLabels: {
        mostly_water: "ماء أو شاي أو قهوة سادة في الغالب",
        sugary_drinks: "مشروبات سكرية — مشروبات غازية، عصير، قهوة محلاة",
        diet_soda: "مشروبات دايت / خالية من السكر",
        alcohol: "كحول في معظم الأسابيع",
        energy_drinks: "مشروبات طاقة"
      }
    },
    s18_schedule_constraint: {
      question: "ما الذي يُحتمل أن يحد من استمراريتك؟",
      sub: "سيبني TJAI الخطة حول هذا القيد بدل تجاهله وكأنه غير موجود.",
      optionLabels: {
        none: "لا شيء — جدولي ثابت",
        short_sessions: "أحتاج حصصاً قصيرة معظم الأيام",
        shift_work: "جدول عملي يتغير كثيراً",
        family_load: "التزامات عائلية أو رعاية",
        travel: "سفر أو أسابيع غير متوقعة"
      }
    },
    s18_schedule_notes: {
      question: "كيف تبدو مشكلة الجدول هذه فعلياً من أسبوع لآخر؟",
      sub: "تفصيل اختياري — يساعد هذا TJAI على توزيع أيام التدريب والتعافي بواقعية أكبر.",
      placeholder: "مثال: نوبتان متأخرتان كل أسبوع. الأحد هو الأسهل. سفر كل جمعة ثانية."
    },
    s14_budget: {
      question: "ما هي ميزانيتك الشهرية للطعام في هذه الخطة؟",
      sub: "سيختار TJAI الأطعمة ومستويات المكملات التي تناسب هذه الميزانية.",
      optionLabels: {
        budget: "اقتصادي — إبقاء الوجبات في متناول اليد",
        moderate: "متوسط — توازن بين الجودة والتكلفة",
        premium: "مرن — جودة الأداء هي الأهم"
      }
    },
    s19_daily_routine: {
      question: "كيف يبدو يومك العادي في أيام الأسبوع؟",
      sub: "اذكر وقت استيقاظك، عملك أو دراستك، تنقلاتك، مواعيد وجباتك، والوقت الواقعي الذي يمكنك التدرب فيه.",
      placeholder: "مثال: أستيقظ الساعة 6:30، عمل مكتبي من 9 إلى 6، غداء الساعة 1، أعود للمنزل الساعة 7، أفضل وقت للتمرين هو 7:30 مساءً."
    },
    s5_trains: {
      question: "ما هو مستواك الحالي في التدريب؟",
      sub: "كن صادقاً — يجب أن يطابق TJAI مستواك الحقيقي، لا طموحك.",
      optionLabels: {
        beginner: "مبتدئ — أقل من 6 أشهر من التدريب المنتظم",
        intermediate: "متوسط — من 6 إلى 24 شهراً من التدريب الحقيقي",
        advanced: "متقدم — أكثر من سنتين من التدريب الجاد والمنظم"
      }
    },
    s5_type: {
      question: "أين ستتدرب في معظم الأوقات؟",
      sub: "هذا يحدد اختيار التمارين وبنية الخطة.",
      optionLabels: {
        home: "المنزل — أتدرب في المنزل غالباً",
        gym: "النادي — إمكانية وصول كاملة للنادي",
        hybrid: "مختلط — مزيج بين المنزل والنادي"
      }
    },
    s5_equipment: {
      question: "ما هي المعدات المتوفرة لديك فعلياً؟",
      sub: "اختر فقط ما هو متوفر لديك حقاً خارج نادٍ مجهز بالكامل.",
      optionLabels: {
        bodyweight: "وزن الجسم فقط",
        bands: "أشرطة مقاومة",
        dumbbells: "دمبل",
        bench: "مقعد تمرين",
        barbell_rack: "بار / رف القرفصاء",
        machines: "أجهزة / كابلات"
      }
    },
    s5_days: {
      question: "كم يوماً في الأسبوع يمكنك التدرب فيه بشكل واقعي؟",
      sub: "اختر ما يمكنك الاستمرار عليه بثبات.",
      optionLabels: { "3": "3 أيام", "4": "4 أيام", "5": "5 أيام", "6": "6 أيام" }
    },
    s5_duration: {
      question: "كم يمكن أن تستغرق كل حصة تدريب؟",
      sub: "سيوائم TJAI الحجم التدريبي وكثافة التمارين مع ذلك.",
      optionLabels: {
        "30": "20–30 دقيقة — حصص عالية الكفاءة",
        "45": "35–45 دقيقة — حصص قياسية وفعالة",
        "60": "50–60 دقيقة — وقت وافر",
        "75": "75+ دقيقة — الحصص الطويلة مناسبة"
      }
    },
    s5_training_preference: {
      question: "أي نوع تدريب يبقيك متحمساً أكثر؟",
      sub: "يمكن لـTJAI أن يوجّه الخطة نحو ما يحفزك مع خدمة هدفك في الوقت نفسه.",
      optionLabels: {
        strength: "رفع يركّز على القوة",
        hypertrophy: "بناء العضلات / تدريبات الضخ",
        conditioning: "تدريبات لياقة / حرق سعرات",
        mixed: "مزيج متوازن من كل شيء"
      }
    },
    s6_cardio_preference: {
      question: "ما أنواع الكارديو التي ستمارسها فعلاً؟",
      sub: "اختر كل ما لا تكرهه. يصف TJAI فقط الكارديو الذي ستستمر عليه بشكل واقعي.",
      optionLabels: {
        walking: "المشي / المشي على انحدار",
        running: "الجري / الهرولة",
        cycling: "ركوب الدراجة / السبينينغ",
        swimming: "السباحة",
        rowing_machines: "التجديف أو أجهزة الكارديو",
        jump_rope: "نط الحبل",
        none: "بصراحة — أقل قدر ممكن من الكارديو"
      }
    },
    s20_country: {
      question: "في أي بلد تعيش؟",
      sub: "يُخصص TJAI وجباتك وقائمة تسوقك بما هو متوفر فعلاً بالقرب منك.",
      optionLabels: {
        us: "الولايات المتحدة الأمريكية",
        uk: "المملكة المتحدة",
        canada: "كندا",
        australia: "أستراليا",
        ireland: "أيرلندا",
        turkey: "تركيا",
        saudi_arabia: "المملكة العربية السعودية",
        uae: "الإمارات العربية المتحدة",
        egypt: "مصر",
        iraq: "العراق",
        jordan: "الأردن",
        kuwait: "الكويت",
        qatar: "قطر",
        morocco: "المغرب",
        spain: "إسبانيا",
        mexico: "المكسيك",
        argentina: "الأرجنتين",
        colombia: "كولومبيا",
        chile: "تشيلي",
        france: "فرنسا",
        belgium: "بلجيكا",
        germany: "ألمانيا",
        netherlands: "هولندا",
        india: "الهند",
        pakistan: "باكستان",
        nigeria: "نيجيريا",
        philippines: "الفلبين",
        other: "بلد آخر"
      }
    },
    s20_market: {
      question: "من أين تشتري احتياجاتك الغذائية عادةً؟",
      sub: "اختر المتجر الأقرب إليك — ستُبنى قائمة تسوقك بناءً عليه.",
      optionLabels: {
        local_supermarket: "سوبر ماركت كبير",
        discount_chain: "سلسلة متاجر مخفضة الأسعار",
        local_market: "سوق محلي / بازار",
        online_groceries: "تسوق بقالة عبر الإنترنت",
        other_market: "مكان آخر / يختلف"
      }
    },
    s12_diet_style: {
      question: "أي نمط تغذية يناسبك أكثر الآن؟",
      sub: "سيستخدم TJAI هذا لاختيار بنية يمكنك الالتزام بها فعلاً.",
      optionLabels: {
        balanced: "متوازن ومرن",
        high_protein: "التركيز على البروتين المرتفع",
        low_carb: "تفضيل الكربوهيدرات المنخفضة",
        halal: "بنية متوافقة مع الحلال",
        vegetarian: "نباتي",
        vegan: "نباتي صرف"
      }
    },
    s12_plant_protein: {
      question: "ما مصادر البروتين التي ترتاح لتناولها بانتظام؟",
      sub: "هدفك من البروتين يجب أن يأتي من مكان ما — يبني TJAI الوجبات فقط من المصادر التي تقبلها.",
      optionLabels: {
        tofu_tempeh: "توفو / تمبيه",
        seitan: "سيتان",
        legumes: "العدس والفول والحمص",
        protein_powder: "بروتين نباتي (بودرة)",
        dairy_eggs: "الألبان والبيض (إن كنت نباتياً)",
        nuts_seeds: "المكسرات والبذور"
      }
    },
    s13_allergies: {
      question: "هل هناك قيود غذائية يجب أن يراعيها TJAI؟",
      sub: "اختر كل ما ينطبق.",
      optionLabels: {
        none: "لا شيء",
        halal: "حلال",
        vegetarian: "نباتي",
        vegan: "نباتي صرف",
        dairy_free: "خالٍ من الألبان",
        gluten_free: "خالٍ من الغلوتين",
        nut_free: "خالٍ من المكسرات"
      }
    },
    s13_restriction_notes: {
      question: "هل هناك أمر محدد يجب أن يعرفه TJAI عن هذه القيود الغذائية؟",
      sub: "ملاحظة اختيارية — مثل استثناءات صارمة أو تفضيلات ثقافية أو أطعمة يجب أن تبقى دائماً.",
      placeholder: "مثال: حلال فقط، لكن البيض والألبان مقبولان. تجنب الواي والمحاريات والقشريات تماماً."
    },
    s12_foods_like: {
      question: "ما هي الأطعمة التي تسعد بتناولها بشكل متكرر؟",
      sub: "اختر كل ما ينطبق.",
      optionLabels: {
        chicken: "دجاج",
        beef: "لحم بقري",
        fish: "سمك",
        eggs: "بيض",
        rice: "أرز",
        oats: "شوفان",
        fruit: "فواكه",
        greek_yogurt: "زبادي يوناني",
        potatoes: "بطاطا",
        legumes: "بقوليات"
      }
    },
    s12_foods_avoid: {
      question: "ما هي الأطعمة التي تفضل تجنبها؟",
      sub: "اختر كل ما ينطبق.",
      optionLabels: {
        seafood: "مأكولات بحرية",
        red_meat: "لحوم حمراء",
        dairy: "ألبان",
        eggs: "بيض",
        spicy_food: "طعام حار",
        nothing_specific: "لا شيء محدد"
      }
    },
    s14_time: {
      question: "كيف يجب أن يتعامل TJAI مع تحضير الوجبات؟",
      sub: "اختر أسلوب الطهي الذي يمكنك اتباعه بشكل واقعي.",
      optionLabels: {
        minimal: "أقل جهد — وجبات سريعة جداً",
        simple: "طهي بسيط معظم الأيام",
        batch: "طهي بكميات كبيرة وتحضير مسبق للوجبات"
      }
    },
    s11_meals: {
      question: "كم وجبة يومياً تفضل؟",
      sub: "سيستخدم TJAI هذا لتوزيع سعراتك وعناصرك الغذائية الكبرى.",
      optionLabels: { "3": "3 وجبات", "4": "4 وجبات", "5": "5 وجبات" }
    },
    s11_eating_out: {
      question: "كم مرة تأكل خارج المنزل أو تطلب توصيلاً؟",
      sub: "يخطط TJAI بناءً على حياتك الواقعية بدلاً من افتراض أن كل وجبة مطبوخة في المنزل.",
      optionLabels: {
        rarely: "نادراً — كل شيء تقريباً منزلي الصنع",
        weekly: "مرة أو مرتين في الأسبوع",
        several_weekly: "3–5 مرات في الأسبوع",
        daily: "معظم الأيام"
      }
    },
    s16_which_supps: {
      question: "ما هي المكملات التي تتناولها حالياً، إن وجدت؟",
      sub: "اختر كل ما ينطبق. سيتجنب TJAI تكرار ما تستخدمه بالفعل.",
      optionLabels: {
        none: "لا شيء",
        protein: "بروتين بودرة",
        creatine: "كرياتين",
        omega3: "أوميغا-3",
        vitamin_d: "فيتامين د",
        magnesium: "مغنيسيوم",
        preworkout: "مكمل ما قبل التمرين"
      }
    },
    s15_weekend_consistency: {
      question: "ماذا يحدث لنظامك الغذائي في عطلة نهاية الأسبوع؟",
      sub: "عطلة نهاية الأسبوع تحدد مصير معظم الأنظمة الغذائية — يومان متساهلان قد يمحوان خمسة أيام منضبطة.",
      optionLabels: {
        consistent: "مثل أيام الأسبوع — أبقى منضبطاً",
        slightly_off: "أكثر تساهلاً قليلاً، لكن على المسار تقريباً",
        derails: "عطلة نهاية الأسبوع عادة تفسد أسبوعي"
      }
    },
    s18_biggest_problem: {
      question: "ما الذي يخرجك عن مسارك عادةً؟",
      sub: "اختر كل ما ينطبق حتى يبني TJAI الخطة حول عوائقك الحقيقية.",
      optionLabels: {
        motivation: "انخفاض الحافز",
        consistency: "الاستمرارية / الانضباط",
        time: "نقص الوقت",
        food_cravings: "الرغبة الشديدة في الطعام أو الشهية",
        training_knowledge: "عدم معرفة ما يجب فعله",
        stress: "التوتر والإرهاق النفسي",
        recovery: "ضعف التعافي"
      }
    },
    s19_success_vision: {
      question: "كيف يبدو النجاح بالنسبة لك بعد 12 أسبوعاً؟",
      sub: "اختر ما يعبّر عنك أكثر.",
      optionLabels: {
        look_different: "أبدو مختلفاً بوضوح في المرآة",
        feel_energetic: "أشعر بالنشاط والقوة كل يوم",
        fit_clothes_better: "أرتدي ملابس لم أستطع ارتداءها من قبل",
        lift_heavier: "أرفع أوزاناً أثقل من أي وقت مضى",
        build_routine: "بنيت روتيناً صحياً مستداماً"
      }
    }
  },
  // Spanish: complete coverage (2026-08-09). Informal tú, LatAm-neutral,
  // established loanwords (deload, pump) kept. Independently reviewed.
  es: {
    s2_goal: {
      question: "¿Cuál es tu objetivo principal?",
      sub: "Esto define todo el plan de TJAI.",
      optionLabels: {
        fat_loss: "Perder Grasa — Quema grasa, ponte más definido",
        muscle_gain: "Ganar Músculo — Hazte más grande y fuerte",
        recomposition: "Recomposición Corporal — Pierde grasa Y gana músculo",
        fitness: "Mejorar tu Condición — Resistencia, salud, energía",
        stay_active: "Mantenerte Activo — Muévete más, siéntete mejor"
      }
    },
    s2_goal_detail: {
      question: "¿Qué resultado te importa más al principio?",
      sub: "TJAI orientará el plan hacia el resultado que más te importa.",
      optionLabels: {
        sustainable_cut: "Pérdida de grasa sostenible que pueda mantener",
        aggressive_cut: "Corte agresivo y bajada visible",
        size: "Más volumen y plenitud muscular",
        strength: "Más fuerza y capacidad atlética",
        aesthetic: "Un físico más estético y equilibrado",
        energy: "Más energía y mejor salud",
        consistency: "Crear una rutina que realmente pueda mantener"
      }
    },
    s1_gender: {
      question: "¿Cuál es tu sexo biológico?",
      sub: "Se usa para calcular con más precisión tu energía y recuperación.",
      optionLabels: { male: "Hombre", female: "Mujer" }
    },
    s1_age: {
      question: "¿Cuál es tu rango de edad?",
      sub: "La edad afecta directamente tu recuperación, tolerancia al entrenamiento y metabolismo.",
      optionLabels: {
        "20": "16–24 años",
        "30": "25–34 años",
        "40": "35–44 años",
        "50": "45–54 años",
        "58": "55 años o más"
      }
    },
    s1_weight: {
      question: "¿Cuál es tu peso actual?",
      sub: "Se usa para calcular calorías, objetivos de proteína y tu progreso proyectado.",
      optionLabels: {
        "48": "Menos de 50 kg",
        "58": "50–65 kg",
        "72": "65–80 kg",
        "90": "80–100 kg",
        "110": "100–120 kg",
        "125": "Más de 120 kg"
      }
    },
    s1_height: {
      question: "¿Cuál es tu estatura?",
      sub: "Se usa junto con tu peso para calcular tus necesidades energéticas y ajustar los ejercicios.",
      optionLabels: {
        "152": "Menos de 155 cm",
        "160": "155–165 cm",
        "170": "165–175 cm",
        "180": "175–185 cm",
        "190": "185–195 cm",
        "198": "Más de 195 cm"
      }
    },
    s2_pace: {
      question: "¿Con qué rapidez quieres ver resultados?",
      sub: "Sé honesto — esto afecta directamente la exigencia del entrenamiento, la recuperación y las calorías.",
      optionLabels: {
        slow: "Lento y Sostenible — Quiero resultados duraderos, sin prisa",
        moderate: "Ritmo Moderado — Progreso constante, buen equilibrio",
        aggressive: "Resultados Rápidos — Estoy totalmente comprometido a exigirme al máximo"
      }
    },
    s3_body_silhouette: {
      question: "¿Qué tipo de cuerpo te describe mejor?",
      sub: "Esto ayuda a TJAI a estimar tu grasa corporal y qué tan agresivo debe ser el plan.",
      optionLabels: {
        very_lean: "Muy Delgado",
        lean: "Delgado",
        average: "Promedio",
        overweight: "Sobrepeso",
        obese: "Obeso"
      }
    },
    s17_injuries: {
      question: "¿Tienes alguna lesión o limitación física?",
      sub: "Selecciona todas las que apliquen. TJAI ajustará los ejercicios y las reglas de recuperación según esto.",
      optionLabels: {
        none: "Ninguna",
        knee: "Dolor de rodilla",
        lower_back: "Dolor lumbar",
        shoulder: "Dolor de hombro",
        hip: "Dolor de cadera",
        wrist_elbow: "Dolor de muñeca / codo",
        recent_surgery: "Cirugía reciente",
        chronic_condition: "Condición crónica"
      }
    },
    s17_conditions: {
      question: "¿Algo que TJAI deba saber sobre esas limitaciones?",
      sub: "Nota opcional: restricciones de movimiento, indicaciones médicas o ejercicios que sabes que debes evitar.",
      placeholder: "Ejemplo: Por ahora nada de press por encima de la cabeza. Caminar y tren inferior están permitidos."
    },
    s19_target_weight: {
      question: "Si lo sabes, ¿cuál es tu peso corporal objetivo?",
      sub: "Opcional, pero útil si ya tienes una meta realista en mente.",
      placeholder: "ej. 78"
    },
    s7_diet_history: {
      question: "¿Has probado una dieta estructurada antes?",
      sub: "Tu historial con dietas cambia qué tan agresivo debe ser TJAI con las calorías.",
      optionLabels: {
        first_plan: "No — este es mi primer plan estructurado",
        kept_results: "Sí — y mantuve casi todos los resultados",
        regained: "Sí — pero después recuperé el peso",
        yo_yo: "Muchas veces — bajo y subo en ciclos"
      }
    },
    s4_daily_activity: {
      question: "¿Qué tan activo eres fuera de tus entrenamientos?",
      sub: "Este es tu nivel de movimiento diario, sin contar el entrenamiento planificado.",
      optionLabels: {
        very_low: "Muy bajo — Trabajo de oficina, sentado casi todo el día",
        low: "Bajo — Algo de caminata, mayormente sedentario",
        moderate: "Moderado — Movimiento regular, estilo de vida activo",
        active: "Activo — Trabajo físico o rutina diaria muy activa"
      }
    },
    s4_job_type: {
      question: "¿Qué tipo de trabajo haces la mayoría de los días?",
      sub: "Tu trabajo es el mayor factor de calorías quemadas fuera del entrenamiento.",
      optionLabels: {
        desk: "Trabajo de oficina — sentado la mayor parte del día",
        mixed: "Mixto — de pie parte del día",
        physical: "Físico — trabajo manual o en movimiento constante"
      }
    },
    s4_daily_steps: {
      question: "¿Aproximadamente cuántos pasos das en un día normal?",
      sub: "Revisa tu teléfono si no estás seguro — tus pasos diarios afinan el cálculo de calorías.",
      optionLabels: {
        under_4k: "Menos de 4.000 — mayormente sedentario",
        "4k_8k": "4.000–8.000 — movimiento ligero",
        "8k_12k": "8.000–12.000 — sólidamente activo",
        over_12k: "Más de 12.000 — siempre en movimiento"
      }
    },
    s8_hours: {
      question: "¿Cuántas horas duermes en promedio por noche?",
      sub: "El sueño afecta el cortisol, la recuperación, la pérdida de grasa y el rendimiento.",
      optionLabels: {
        "5": "4–5 horas — Con falta crónica de sueño",
        "6": "6 horas — Por debajo del promedio",
        "7": "7 horas — Promedio",
        "8": "8 horas — Bueno",
        "9": "9+ horas — Muy bien descansado"
      }
    },
    s8_sleep_quality: {
      question: "¿Cómo describirías la calidad de ese sueño?",
      sub: "Las horas importan, pero un sueño inquieto afecta la recuperación casi igual.",
      optionLabels: {
        restorative: "Reparador — me duermo fácil y despierto descansado",
        restless: "Inquieto — me despierto en la noche o amanezco cansado",
        poor: "Malo — me cuesta conciliar el sueño, mantenerlo, o ambos"
      }
    },
    s9_stress: {
      question: "¿Cuál es tu nivel de estrés general actual?",
      sub: "El estrés alto cambia la recuperación, el apetito y qué tan agresivo debe ser TJAI.",
      optionLabels: {
        very_low: "Muy Bajo — La vida está tranquila y manejable",
        low: "Bajo — Estrés leve ocasional",
        moderate: "Moderado — Presión regular del trabajo o la vida",
        high: "Alto — Estresado con frecuencia",
        very_high: "Muy Alto — Me siento abrumado regularmente"
      }
    },
    s10_drinks: {
      question: "¿Qué tomas en un día típico además de agua?",
      sub: "Selecciona todas las que apliquen — las calorías líquidas son el asesino silencioso más común del progreso.",
      optionLabels: {
        mostly_water: "Mayormente agua, té o café negro",
        sugary_drinks: "Bebidas azucaradas — refresco, jugo, café con azúcar",
        diet_soda: "Bebidas dietéticas / sin azúcar",
        alcohol: "Alcohol casi todas las semanas",
        energy_drinks: "Bebidas energéticas"
      }
    },
    s18_schedule_constraint: {
      question: "¿Qué es lo más probable que limite tu constancia?",
      sub: "TJAI construirá el plan alrededor de esa limitación en lugar de ignorarla.",
      optionLabels: {
        none: "Ninguna — mi horario es estable",
        short_sessions: "Necesito sesiones cortas la mayoría de los días",
        shift_work: "Mi horario de trabajo cambia seguido",
        family_load: "Responsabilidades familiares o de cuidado",
        travel: "Viajes o semanas impredecibles"
      }
    },
    s18_schedule_notes: {
      question: "¿Cómo se ve realmente ese problema de horario semana a semana?",
      sub: "Detalle opcional — esto ayuda a TJAI a ubicar tus días de entrenamiento y recuperación de forma más realista.",
      placeholder: "Ejemplo: Dos turnos de cierre por semana. Los domingos son los más fáciles. Viajo cada dos viernes."
    },
    s14_budget: {
      question: "¿Cuál es tu presupuesto mensual de comida para este plan?",
      sub: "TJAI elegirá alimentos y niveles de suplementos acordes a este presupuesto.",
      optionLabels: {
        budget: "Ajustado — Mantener las comidas económicas",
        moderate: "Moderado — Equilibrio entre calidad y costo",
        premium: "Flexible — La calidad de rendimiento es lo prioritario"
      }
    },
    s19_daily_routine: {
      question: "¿Cómo es un día entre semana normal para ti?",
      sub: "Menciona a qué hora te levantas, tu trabajo/estudio, el traslado, los horarios de comida y cuándo puedes entrenar realmente.",
      placeholder: "Ejemplo: Me levanto a las 6:30, trabajo de oficina de 9 a 6, almuerzo a la 1, llego a casa a las 7, la mejor hora para entrenar es a las 7:30 pm."
    },
    s5_trains: {
      question: "¿Cuál es tu nivel de entrenamiento actual?",
      sub: "Sé honesto — TJAI debe ajustarse a tu nivel real, no a tu ambición.",
      optionLabels: {
        beginner: "Principiante — Menos de 6 meses de entrenamiento constante",
        intermediate: "Intermedio — De 6 a 24 meses de entrenamiento real",
        advanced: "Avanzado — 2+ años de entrenamiento serio y estructurado"
      }
    },
    s5_type: {
      question: "¿Dónde entrenarás la mayor parte del tiempo?",
      sub: "Esto determina la selección de ejercicios y la estructura del plan.",
      optionLabels: {
        home: "Casa — Entreno mayormente en casa",
        gym: "Gimnasio — Acceso completo a gimnasio",
        hybrid: "Híbrido — Combinación de casa y gimnasio"
      }
    },
    s5_equipment: {
      question: "¿A qué equipo tienes acceso realmente?",
      sub: "Elige solo lo que realmente tienes disponible fuera de un gimnasio completo.",
      optionLabels: {
        bodyweight: "Solo peso corporal",
        bands: "Bandas de resistencia",
        dumbbells: "Mancuernas",
        bench: "Banco",
        barbell_rack: "Barra / rack",
        machines: "Máquinas / poleas"
      }
    },
    s5_days: {
      question: "¿Cuántos días por semana puedes entrenar de forma realista?",
      sub: "Elige lo que puedas mantener de forma constante.",
      optionLabels: { "3": "3 días", "4": "4 días", "5": "5 días", "6": "6 días" }
    },
    s5_duration: {
      question: "¿Cuánto puede durar cada sesión de entrenamiento?",
      sub: "TJAI ajustará el volumen y la densidad de ejercicios a esto.",
      optionLabels: {
        "30": "20–30 minutos — Sesiones muy eficientes",
        "45": "35–45 minutos — Sesiones eficientes estándar",
        "60": "50–60 minutos — Tiempo de sobra",
        "75": "75+ minutos — Las sesiones largas están bien"
      }
    },
    s5_training_preference: {
      question: "¿Qué tipo de entrenamiento te mantiene más motivado?",
      sub: "TJAI puede orientar el plan hacia lo que te motiva sin dejar de servir a tu objetivo.",
      optionLabels: {
        strength: "Levantamiento enfocado en fuerza",
        hypertrophy: "Trabajo de construcción muscular / pump",
        conditioning: "Trabajo de acondicionamiento / quema de calorías",
        mixed: "Una mezcla equilibrada de todo"
      }
    },
    s6_cardio_preference: {
      question: "¿Qué tipos de cardio harías realmente?",
      sub: "Elige todo lo que no odies. TJAI solo prescribe el cardio que realmente vas a seguir haciendo.",
      optionLabels: {
        walking: "Caminar / caminata inclinada",
        running: "Correr / trotar",
        cycling: "Ciclismo / spinning",
        swimming: "Natación",
        rowing_machines: "Remo o máquinas de cardio",
        jump_rope: "Saltar la cuerda",
        none: "Honestamente — lo menos posible de cardio"
      }
    },
    s20_country: {
      question: "¿En qué país vives?",
      sub: "TJAI localiza tus comidas y tu lista de compras según lo que realmente se vende cerca de ti.",
      optionLabels: {
        us: "Estados Unidos",
        uk: "Reino Unido",
        canada: "Canadá",
        australia: "Australia",
        ireland: "Irlanda",
        turkey: "Turquía",
        saudi_arabia: "Arabia Saudita",
        uae: "Emiratos Árabes Unidos",
        egypt: "Egipto",
        iraq: "Irak",
        jordan: "Jordania",
        kuwait: "Kuwait",
        qatar: "Catar",
        morocco: "Marruecos",
        spain: "España",
        mexico: "México",
        argentina: "Argentina",
        colombia: "Colombia",
        chile: "Chile",
        france: "Francia",
        belgium: "Bélgica",
        germany: "Alemania",
        netherlands: "Países Bajos",
        india: "India",
        pakistan: "Pakistán",
        nigeria: "Nigeria",
        philippines: "Filipinas",
        other: "Otro lugar"
      }
    },
    s20_market: {
      question: "¿Dónde sueles comprar tus víveres?",
      sub: "Elige la tienda más cercana a ti — tu lista de compras se armará según esa opción.",
      optionLabels: {
        local_supermarket: "Un supermercado grande",
        discount_chain: "Una cadena de descuento",
        local_market: "Un mercado local",
        online_groceries: "Compra de víveres en línea",
        other_market: "Otro lugar / varía"
      }
    },
    s12_diet_style: {
      question: "¿Qué estilo de alimentación te queda mejor ahora mismo?",
      sub: "TJAI usará esto para elegir una estructura que realmente puedas mantener.",
      optionLabels: {
        balanced: "Equilibrado y flexible",
        high_protein: "Enfoque alto en proteína",
        low_carb: "Preferencia baja en carbohidratos",
        halal: "Estructura apta para halal",
        vegetarian: "Vegetariano",
        vegan: "Vegano"
      }
    },
    s12_plant_protein: {
      question: "¿Qué fuentes de proteína comerías con gusto de forma regular?",
      sub: "Tu objetivo de proteína tiene que venir de algún lado — TJAI arma las comidas solo con fuentes que aceptes.",
      optionLabels: {
        tofu_tempeh: "Tofu / tempeh",
        seitan: "Seitán",
        legumes: "Lentejas, frijoles y garbanzos",
        protein_powder: "Proteína vegetal en polvo",
        dairy_eggs: "Lácteos y huevo (si eres vegetariano)",
        nuts_seeds: "Frutos secos y semillas"
      }
    },
    s13_allergies: {
      question: "¿Alguna restricción alimentaria que TJAI deba respetar?",
      sub: "Selecciona todas las que apliquen.",
      optionLabels: {
        none: "Ninguna",
        halal: "Halal",
        vegetarian: "Vegetariano",
        vegan: "Vegano",
        dairy_free: "Sin lácteos",
        gluten_free: "Sin gluten",
        nut_free: "Sin frutos secos"
      }
    },
    s13_restriction_notes: {
      question: "¿Algo específico que TJAI deba saber sobre esas restricciones alimentarias?",
      sub: "Nota opcional — por ejemplo exclusiones estrictas, preferencias culturales o alimentos que siempre deben incluirse.",
      placeholder: "Ejemplo: Solo halal, pero el huevo y los lácteos están bien. Evita por completo el suero de leche y los mariscos."
    },
    s12_foods_like: {
      question: "¿Qué alimentos comerías con gusto seguido?",
      sub: "Selecciona todos los que apliquen.",
      optionLabels: {
        chicken: "Pollo",
        beef: "Carne de res",
        fish: "Pescado",
        eggs: "Huevo",
        rice: "Arroz",
        oats: "Avena",
        fruit: "Fruta",
        greek_yogurt: "Yogur griego",
        potatoes: "Papas",
        legumes: "Legumbres"
      }
    },
    s12_foods_avoid: {
      question: "¿Qué alimentos prefieres evitar?",
      sub: "Selecciona todos los que apliquen.",
      optionLabels: {
        seafood: "Pescados y mariscos",
        red_meat: "Carne roja",
        dairy: "Lácteos",
        eggs: "Huevo",
        spicy_food: "Comida picante",
        nothing_specific: "Nada en particular"
      }
    },
    s14_time: {
      question: "¿Cómo debería manejar TJAI la preparación de comidas?",
      sub: "Elige el estilo de cocina que realmente puedas seguir.",
      optionLabels: {
        minimal: "Esfuerzo mínimo — comidas muy rápidas",
        simple: "Cocina sencilla la mayoría de los días",
        batch: "Cocinar en lote y meal prep"
      }
    },
    s11_meals: {
      question: "¿Cuántas comidas al día prefieres?",
      sub: "TJAI usará esto para estructurar tus calorías y macros.",
      optionLabels: { "3": "3 comidas", "4": "4 comidas", "5": "5 comidas" }
    },
    s11_eating_out: {
      question: "¿Con qué frecuencia comes fuera o pides a domicilio?",
      sub: "TJAI planea según tu vida real, no como si cada comida fuera casera.",
      optionLabels: {
        rarely: "Casi nunca — casi todo es hecho en casa",
        weekly: "Una o dos veces por semana",
        several_weekly: "3–5 veces por semana",
        daily: "Casi todos los días"
      }
    },
    s16_which_supps: {
      question: "¿Qué suplementos ya estás tomando, si es que tomas alguno?",
      sub: "Selecciona todos los que apliquen. TJAI evitará duplicar lo que ya usas.",
      optionLabels: {
        none: "Ninguno",
        protein: "Proteína en polvo",
        creatine: "Creatina",
        omega3: "Omega-3",
        vitamin_d: "Vitamina D",
        magnesium: "Magnesio",
        preworkout: "Pre-workout"
      }
    },
    s15_weekend_consistency: {
      question: "¿Qué pasa con tu alimentación los fines de semana?",
      sub: "Los fines de semana definen la mayoría de las dietas — dos días sueltos pueden borrar cinco días cuidados.",
      optionLabels: {
        consistent: "Igual que entre semana — me mantengo constante",
        slightly_off: "Un poco más relajado, pero más o menos en línea",
        derails: "Los fines de semana suelen arruinar mi semana"
      }
    },
    s18_biggest_problem: {
      question: "¿Qué es lo que normalmente te saca de rumbo?",
      sub: "Selecciona todas las que apliquen para que TJAI construya el plan alrededor de tus obstáculos reales.",
      optionLabels: {
        motivation: "Bajones de motivación",
        consistency: "Constancia / disciplina",
        time: "Falta de tiempo",
        food_cravings: "Antojos o apetito",
        training_knowledge: "No saber qué hacer",
        stress: "Estrés y sensación de agobio",
        recovery: "Mala recuperación"
      }
    },
    s19_success_vision: {
      question: "¿Cómo se ve el éxito para ti en 12 semanas?",
      sub: "Elige la opción que más resuene contigo.",
      optionLabels: {
        look_different: "Me veo notablemente diferente en el espejo",
        feel_energetic: "Me siento con energía y fuerte todos los días",
        fit_clothes_better: "Me queda ropa que antes no podía usar",
        lift_heavier: "Estoy levantando más peso del que nunca he levantado",
        build_routine: "He creado una rutina saludable y sostenible"
      }
    }
  },
  // French: complete coverage (2026-08-09). Informal tu, French spacing
  // before ?, established loanwords kept. Independently reviewed.
  fr: {
    s2_goal: {
      question: "Quel est ton objectif principal ?",
      sub: "Cela façonne tout le plan TJAI.",
      optionLabels: {
        fat_loss: "Perdre du gras — Brûle les graisses, affine-toi",
        muscle_gain: "Prendre du muscle — Deviens plus fort et plus imposant",
        recomposition: "Recomposition corporelle — Perds du gras ET prends du muscle",
        fitness: "Améliorer ta forme — Endurance, santé, énergie",
        stay_active: "Rester actif — Bouge plus, sens-toi mieux"
      }
    },
    s2_goal_detail: {
      question: "Quel résultat compte le plus pour toi en premier ?",
      sub: "TJAI orientera le plan vers ce qui compte le plus pour toi.",
      optionLabels: {
        sustainable_cut: "Une perte de gras durable que je peux maintenir",
        aggressive_cut: "Une sèche intensive avec une perte visible",
        size: "Plus de volume et de plénitude musculaire",
        strength: "Plus de force et d'athlétisme",
        aesthetic: "Un physique plus esthétique et équilibré",
        energy: "Plus d'énergie et une meilleure santé",
        consistency: "Construire une routine que je peux vraiment tenir"
      }
    },
    s1_gender: {
      question: "Quel est ton sexe biologique ?",
      sub: "Utilisé pour des estimations d'énergie et de récupération plus précises.",
      optionLabels: { male: "Homme", female: "Femme" }
    },
    s1_age: {
      question: "Quelle est ta tranche d'âge ?",
      sub: "L'âge influence directement la récupération, la tolérance à l'entraînement et le métabolisme.",
      optionLabels: {
        "20": "16–24 ans",
        "30": "25–34 ans",
        "40": "35–44 ans",
        "50": "45–54 ans",
        "58": "55 ans et plus"
      }
    },
    s1_weight: {
      question: "Quel est ton poids actuel ?",
      sub: "Utilisé pour les calories, les objectifs de protéines et la progression prévue.",
      optionLabels: {
        "48": "Moins de 50 kg",
        "58": "50–65 kg",
        "72": "65–80 kg",
        "90": "80–100 kg",
        "110": "100–120 kg",
        "125": "Plus de 120 kg"
      }
    },
    s1_height: {
      question: "Quelle est ta taille ?",
      sub: "Utilisée avec le poids pour estimer les besoins énergétiques et adapter les exercices.",
      optionLabels: {
        "152": "Moins de 155 cm",
        "160": "155–165 cm",
        "170": "165–175 cm",
        "180": "175–185 cm",
        "190": "185–195 cm",
        "198": "Plus de 195 cm"
      }
    },
    s2_pace: {
      question: "À quelle vitesse veux-tu des résultats ?",
      sub: "Sois honnête — cela influence directement la charge d'entraînement, la récupération et les calories.",
      optionLabels: {
        slow: "Lent et durable — Je veux des résultats qui durent, sans précipitation",
        moderate: "Rythme modéré — Progression régulière, bon équilibre",
        aggressive: "Résultats rapides — Je suis prêt à tout donner"
      }
    },
    s3_body_silhouette: {
      question: "Quel type de silhouette te décrit le mieux ?",
      sub: "Cela aide TJAI à estimer ton taux de graisse et l'intensité à donner au plan.",
      optionLabels: {
        very_lean: "Très mince",
        lean: "Mince",
        average: "Moyenne",
        overweight: "En surpoids",
        obese: "Obèse"
      }
    },
    s17_injuries: {
      question: "As-tu des blessures ou des limitations physiques ?",
      sub: "Sélectionne tout ce qui s'applique. TJAI adaptera les exercices et les règles de récupération en conséquence.",
      optionLabels: {
        none: "Aucune",
        knee: "Douleur au genou",
        lower_back: "Douleur au bas du dos",
        shoulder: "Douleur à l'épaule",
        hip: "Douleur à la hanche",
        wrist_elbow: "Douleur au poignet / coude",
        recent_surgery: "Chirurgie récente",
        chronic_condition: "Maladie chronique"
      }
    },
    s17_conditions: {
      question: "Y a-t-il autre chose que TJAI devrait savoir sur ces limitations ?",
      sub: "Note facultative : restrictions de mouvement, avis médical, ou exercices que tu sais devoir éviter.",
      placeholder: "Exemple : Pas de développé au-dessus de la tête pour l'instant. La marche et le bas du corps sont autorisés."
    },
    s19_target_weight: {
      question: "Si tu le sais, quel poids cible vises-tu ?",
      sub: "Facultatif, mais utile si tu as déjà un objectif réaliste en tête.",
      placeholder: "ex. 78"
    },
    s7_diet_history: {
      question: "As-tu déjà suivi un régime structuré ?",
      sub: "Ton historique de régimes détermine à quel point TJAI doit être agressif avec les calories.",
      optionLabels: {
        first_plan: "Non — c'est mon premier plan structuré",
        kept_results: "Oui — et j'ai globalement gardé les résultats",
        regained: "Oui — mais j'ai repris le poids après",
        yo_yo: "Plusieurs fois — je fais du yo-yo avec mon poids"
      }
    },
    s4_daily_activity: {
      question: "À quel point es-tu actif en dehors de tes séances ?",
      sub: "C'est ton niveau de mouvement quotidien, hors entraînement planifié.",
      optionLabels: {
        very_low: "Très faible — Travail de bureau, assis presque toute la journée",
        low: "Faible — Un peu de marche, plutôt sédentaire",
        moderate: "Modéré — Mouvement régulier, mode de vie actif",
        active: "Actif — Travail physique ou journée très active"
      }
    },
    s4_job_type: {
      question: "Quel type de travail fais-tu la plupart des jours ?",
      sub: "Ton travail est le principal facteur de calories brûlées en dehors de l'entraînement.",
      optionLabels: {
        desk: "Bureau — assis la majeure partie de la journée",
        mixed: "Mixte — debout une partie de la journée",
        physical: "Physique — travail manuel ou en mouvement constant"
      }
    },
    s4_daily_steps: {
      question: "Environ combien de pas fais-tu par jour normalement ?",
      sub: "Regarde ton téléphone si tu n'es pas sûr — les pas quotidiens affinent le calcul des calories.",
      optionLabels: {
        under_4k: "Moins de 4 000 — plutôt sédentaire",
        "4k_8k": "4 000–8 000 — mouvement léger",
        "8k_12k": "8 000–12 000 — bien actif",
        over_12k: "Plus de 12 000 — toujours en mouvement"
      }
    },
    s8_hours: {
      question: "Combien d'heures dors-tu par nuit en moyenne ?",
      sub: "Le sommeil influence le cortisol, la récupération, la perte de gras et la performance.",
      optionLabels: {
        "5": "4–5 heures — En manque de sommeil chronique",
        "6": "6 heures — En dessous de la moyenne",
        "7": "7 heures — Moyenne",
        "8": "8 heures — Bon",
        "9": "9 heures ou plus — Très bien reposé"
      }
    },
    s8_sleep_quality: {
      question: "Comment décrirais-tu la qualité de ce sommeil ?",
      sub: "Les heures comptent, mais un sommeil agité change tout autant la récupération.",
      optionLabels: {
        restorative: "Réparateur — je m'endors facilement et me réveille reposé",
        restless: "Agité — je me réveille pendant la nuit ou je me lève fatigué",
        poor: "Mauvais — j'ai du mal à m'endormir, à rester endormi, ou les deux"
      }
    },
    s9_stress: {
      question: "Quel est ton niveau de stress général actuellement ?",
      sub: "Un stress élevé change la récupération, l'appétit et l'intensité que TJAI doit adopter.",
      optionLabels: {
        very_low: "Très faible — La vie est calme et gérable",
        low: "Faible — Stress mineur occasionnel",
        moderate: "Modéré — Pression régulière au travail ou dans la vie",
        high: "Élevé — Souvent stressé",
        very_high: "Très élevé — Régulièrement débordé"
      }
    },
    s10_drinks: {
      question: "Que bois-tu la plupart du temps en dehors de l'eau ?",
      sub: "Sélectionne tout ce qui s'applique — les calories liquides sont le tueur de progrès caché le plus courant.",
      optionLabels: {
        mostly_water: "Surtout de l'eau, du thé ou du café noir",
        sugary_drinks: "Boissons sucrées — soda, jus, café sucré",
        diet_soda: "Boissons light / sans sucre",
        alcohol: "De l'alcool la plupart des semaines",
        energy_drinks: "Boissons énergisantes"
      }
    },
    s18_schedule_constraint: {
      question: "Qu'est-ce qui risque le plus de limiter ta régularité ?",
      sub: "TJAI construira le plan autour de cette contrainte plutôt que de faire comme si elle n'existait pas.",
      optionLabels: {
        none: "Aucune — mon emploi du temps est stable",
        short_sessions: "J'ai besoin de séances courtes la plupart des jours",
        shift_work: "Mes horaires de travail changent souvent",
        family_load: "Obligations familiales ou de soins à un proche",
        travel: "Déplacements ou semaines imprévisibles"
      }
    },
    s18_schedule_notes: {
      question: "À quoi ressemble concrètement ce problème d'emploi du temps, semaine après semaine ?",
      sub: "Détail facultatif — cela aide TJAI à placer les jours d'entraînement et de récupération plus concrètement.",
      placeholder: "Exemple : Deux services tardifs par semaine. Le dimanche est le plus simple. Déplacement un vendredi sur deux."
    },
    s14_budget: {
      question: "Quel est ton budget alimentaire mensuel pour ce plan ?",
      sub: "TJAI choisira des aliments et des niveaux de compléments adaptés à ce budget.",
      optionLabels: {
        budget: "Économe — Garder les repas abordables",
        moderate: "Modéré — Équilibre entre qualité et coût",
        premium: "Flexible — La qualité et la performance priment avant tout"
      }
    },
    s19_daily_routine: {
      question: "À quoi ressemble une journée de semaine normale pour toi ?",
      sub: "Mentionne l'heure de réveil, le travail/les études, le trajet, les horaires de repas et le moment où tu peux réellement t'entraîner.",
      placeholder: "Exemple : Réveil à 6h30, bureau de 9h à 18h, déjeuner à 13h, de retour à 19h, meilleur moment pour m'entraîner : 19h30."
    },
    s5_trains: {
      question: "Quel est ton niveau d'entraînement actuel ?",
      sub: "Sois honnête — TJAI doit correspondre à ton vrai niveau, pas à ton ambition.",
      optionLabels: {
        beginner: "Débutant — Moins de 6 mois d'entraînement régulier",
        intermediate: "Intermédiaire — 6 à 24 mois d'entraînement régulier",
        advanced: "Avancé — 2 ans ou plus d'entraînement structuré et sérieux"
      }
    },
    s5_type: {
      question: "Où vas-tu t'entraîner la plupart du temps ?",
      sub: "Cela détermine le choix des exercices et la structure du plan.",
      optionLabels: {
        home: "Maison — Principalement à la maison",
        gym: "Salle — Accès complet à une salle",
        hybrid: "Hybride — Mélange de maison et de salle"
      }
    },
    s5_equipment: {
      question: "À quel équipement as-tu réellement accès ?",
      sub: "Ne choisis que ce que tu as vraiment à disposition en dehors d'une salle complète.",
      optionLabels: {
        bodyweight: "Poids du corps uniquement",
        bands: "Élastiques de résistance",
        dumbbells: "Haltères",
        bench: "Banc",
        barbell_rack: "Barre / rack",
        machines: "Machines / poulies"
      }
    },
    s5_days: {
      question: "Combien de jours par semaine peux-tu t'entraîner de façon réaliste ?",
      sub: "Choisis ce que tu peux tenir de façon régulière.",
      optionLabels: { "3": "3 jours", "4": "4 jours", "5": "5 jours", "6": "6 jours" }
    },
    s5_duration: {
      question: "Combien de temps peut durer chaque séance ?",
      sub: "TJAI adaptera le volume et la densité des exercices en conséquence.",
      optionLabels: {
        "30": "20–30 minutes — Séances très efficaces",
        "45": "35–45 minutes — Séances efficaces standards",
        "60": "50–60 minutes — Largement le temps qu'il faut",
        "75": "75 minutes ou plus — Les longues séances me conviennent"
      }
    },
    s5_training_preference: {
      question: "Quel type d'entraînement te motive le plus ?",
      sub: "TJAI peut orienter le plan vers ce qui te motive, tout en servant ton objectif.",
      optionLabels: {
        strength: "Musculation axée sur la force",
        hypertrophy: "Prise de muscle / travail du pump",
        conditioning: "Conditionnement / travail brûle-calories",
        mixed: "Un mélange équilibré de tout"
      }
    },
    s6_cardio_preference: {
      question: "Quels types de cardio ferais-tu vraiment ?",
      sub: "Sélectionne tout ce que tu ne détestes pas. TJAI ne prescrit que du cardio que tu vas réellement tenir.",
      optionLabels: {
        walking: "Marche / marche inclinée",
        running: "Course à pied / jogging",
        cycling: "Vélo / spinning",
        swimming: "Natation",
        rowing_machines: "Rameur ou machines de cardio",
        jump_rope: "Corde à sauter",
        none: "Honnêtement — le moins de cardio possible"
      }
    },
    s20_country: {
      question: "Dans quel pays vis-tu ?",
      sub: "TJAI adapte tes repas et ta liste de courses à ce qui est réellement vendu près de chez toi.",
      optionLabels: {
        us: "États-Unis",
        uk: "Royaume-Uni",
        canada: "Canada",
        australia: "Australie",
        ireland: "Irlande",
        turkey: "Turquie",
        saudi_arabia: "Arabie saoudite",
        uae: "Émirats arabes unis",
        egypt: "Égypte",
        iraq: "Irak",
        jordan: "Jordanie",
        kuwait: "Koweït",
        qatar: "Qatar",
        morocco: "Maroc",
        spain: "Espagne",
        mexico: "Mexique",
        argentina: "Argentine",
        colombia: "Colombie",
        chile: "Chili",
        france: "France",
        belgium: "Belgique",
        germany: "Allemagne",
        netherlands: "Pays-Bas",
        india: "Inde",
        pakistan: "Pakistan",
        nigeria: "Nigeria",
        philippines: "Philippines",
        other: "Ailleurs"
      }
    },
    s20_market: {
      question: "Où fais-tu habituellement tes courses ?",
      sub: "Choisis le magasin le plus proche de chez toi — ta liste de courses sera construite en fonction.",
      optionLabels: {
        local_supermarket: "Un grand supermarché",
        discount_chain: "Une chaîne de hard-discount",
        local_market: "Un marché local / bazar",
        online_groceries: "Courses en ligne",
        other_market: "Ailleurs / ça varie"
      }
    },
    s12_diet_style: {
      question: "Quel style alimentaire te correspond le mieux en ce moment ?",
      sub: "TJAI s'en sert pour choisir une structure que tu peux vraiment tenir.",
      optionLabels: {
        balanced: "Équilibré et flexible",
        high_protein: "Axé sur les protéines",
        low_carb: "Préférence pauvre en glucides",
        halal: "Structure adaptée au halal",
        vegetarian: "Végétarien",
        vegan: "Vegan"
      }
    },
    s12_plant_protein: {
      question: "Quelles sources de protéines es-tu prêt à manger régulièrement ?",
      sub: "Ton objectif de protéines doit venir de quelque part — TJAI construit tes repas uniquement à partir des sources que tu acceptes.",
      optionLabels: {
        tofu_tempeh: "Tofu / tempeh",
        seitan: "Seitan",
        legumes: "Lentilles, haricots et pois chiches",
        protein_powder: "Protéine végétale en poudre",
        dairy_eggs: "Produits laitiers et œufs (si végétarien)",
        nuts_seeds: "Noix et graines"
      }
    },
    s13_allergies: {
      question: "As-tu des restrictions alimentaires que TJAI doit respecter ?",
      sub: "Sélectionne tout ce qui s'applique.",
      optionLabels: {
        none: "Aucune",
        halal: "Halal",
        vegetarian: "Végétarien",
        vegan: "Vegan",
        dairy_free: "Sans produits laitiers",
        gluten_free: "Sans gluten",
        nut_free: "Sans fruits à coque"
      }
    },
    s13_restriction_notes: {
      question: "Y a-t-il quelque chose de spécifique que TJAI devrait savoir sur ces restrictions alimentaires ?",
      sub: "Note facultative — par exemple des exclusions strictes, des préférences culturelles, ou des aliments à toujours garder.",
      placeholder: "Exemple : Halal uniquement, mais les œufs et les produits laitiers passent. Éviter complètement la whey et les fruits de mer."
    },
    s12_foods_like: {
      question: "Quels aliments serais-tu content de manger souvent ?",
      sub: "Sélectionne tout ce qui s'applique.",
      optionLabels: {
        chicken: "Poulet",
        beef: "Bœuf",
        fish: "Poisson",
        eggs: "Œufs",
        rice: "Riz",
        oats: "Flocons d'avoine",
        fruit: "Fruits",
        greek_yogurt: "Yaourt grec",
        potatoes: "Pommes de terre",
        legumes: "Légumineuses"
      }
    },
    s12_foods_avoid: {
      question: "Quels aliments préfères-tu éviter ?",
      sub: "Sélectionne tout ce qui s'applique.",
      optionLabels: {
        seafood: "Fruits de mer",
        red_meat: "Viande rouge",
        dairy: "Produits laitiers",
        eggs: "Œufs",
        spicy_food: "Nourriture épicée",
        nothing_specific: "Rien de particulier"
      }
    },
    s14_time: {
      question: "Comment TJAI doit-il gérer la préparation des repas ?",
      sub: "Choisis le style de cuisine que tu peux réellement suivre.",
      optionLabels: {
        minimal: "Effort minimal — repas très rapides",
        simple: "Cuisine simple la plupart des jours",
        batch: "Cuisine en gros volumes et meal prep"
      }
    },
    s11_meals: {
      question: "Combien de repas par jour préfères-tu ?",
      sub: "TJAI s'en sert pour structurer tes calories et tes macros.",
      optionLabels: { "3": "3 repas", "4": "4 repas", "5": "5 repas" }
    },
    s11_eating_out: {
      question: "À quelle fréquence manges-tu dehors ou te fais-tu livrer ?",
      sub: "TJAI planifie en fonction de ta vraie vie, au lieu de faire comme si chaque repas était fait maison.",
      optionLabels: {
        rarely: "Rarement — presque tout est fait maison",
        weekly: "Une ou deux fois par semaine",
        several_weekly: "3 à 5 fois par semaine",
        daily: "La plupart des jours"
      }
    },
    s16_which_supps: {
      question: "Quels compléments prends-tu déjà, le cas échéant ?",
      sub: "Sélectionne tout ce qui s'applique. TJAI évitera de dupliquer ce que tu utilises déjà.",
      optionLabels: {
        none: "Aucun",
        protein: "Protéine en poudre",
        creatine: "Créatine",
        omega3: "Oméga-3",
        vitamin_d: "Vitamine D",
        magnesium: "Magnésium",
        preworkout: "Pre-workout"
      }
    },
    s15_weekend_consistency: {
      question: "Que se passe-t-il avec ton alimentation le week-end ?",
      sub: "Les week-ends déterminent la plupart des régimes — deux jours relâchés peuvent effacer cinq jours de rigueur.",
      optionLabels: {
        consistent: "Pareil qu'en semaine — je reste régulier",
        slightly_off: "Un peu plus relâché, mais globalement sur la bonne voie",
        derails: "Le week-end anéantit généralement ma semaine"
      }
    },
    s18_biggest_problem: {
      question: "Qu'est-ce qui te fait généralement dérailler ?",
      sub: "Sélectionne tout ce qui s'applique pour que TJAI construise le plan autour de tes vrais obstacles.",
      optionLabels: {
        motivation: "Baisses de motivation",
        consistency: "Régularité / discipline",
        time: "Manque de temps",
        food_cravings: "Envies alimentaires ou appétit",
        training_knowledge: "Ne pas savoir quoi faire",
        stress: "Stress et surcharge",
        recovery: "Mauvaise récupération"
      }
    },
    s19_success_vision: {
      question: "À quoi ressemble la réussite pour toi dans 12 semaines ?",
      sub: "Choisis celle qui te parle le plus.",
      optionLabels: {
        look_different: "Je me vois nettement différent dans le miroir",
        feel_energetic: "Je me sens énergique et fort chaque jour",
        fit_clothes_better: "Je rentre dans des vêtements que je ne pouvais pas porter avant",
        lift_heavier: "Je soulève plus lourd que jamais",
        build_routine: "J'ai construit une routine saine et durable"
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

