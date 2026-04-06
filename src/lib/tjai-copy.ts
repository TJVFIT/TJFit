import type { Locale } from "@/lib/i18n";
import type { QuizStep, TJAICopy } from "@/lib/tjai-types";

const SECTION_TITLES: Record<Locale, string[]> = {
  en: [
    "Basic Profile",
    "Main Goal",
    "Body Composition",
    "Daily Activity",
    "Training",
    "Cardio",
    "Metabolism",
    "Sleep",
    "Stress",
    "Diet History",
    "Eating Habits",
    "Food Preferences",
    "Restrictions",
    "Lifestyle",
    "Hydration",
    "Supplements",
    "Health",
    "Compliance",
    "Goals"
  ],
  tr: [
    "Temel Profil",
    "Ana Hedef",
    "Vucut Kompozisyonu",
    "Gunluk Aktivite",
    "Antrenman",
    "Kardiyo",
    "Metabolizma",
    "Uyku",
    "Stres",
    "Diyet Gecmisi",
    "Yeme Aliskanliklari",
    "Besin Tercihleri",
    "Kisitlamalar",
    "Yasam Tarzi",
    "Hidrasyon",
    "Takviyeler",
    "Saglik",
    "Uyum",
    "Hedefler"
  ],
  ar: [
    "الملف الاساسي",
    "الهدف الرئيسي",
    "تركيب الجسم",
    "النشاط اليومي",
    "التدريب",
    "الكارديو",
    "التمثيل الغذائي",
    "النوم",
    "الضغط",
    "سجل الدايت",
    "عادات الاكل",
    "تفضيلات الطعام",
    "القيود",
    "نمط الحياة",
    "الترطيب",
    "المكملات",
    "الصحة",
    "الالتزام",
    "الاهداف"
  ],
  es: [
    "Perfil Basico",
    "Objetivo Principal",
    "Composicion Corporal",
    "Actividad Diaria",
    "Entrenamiento",
    "Cardio",
    "Metabolismo",
    "Sueno",
    "Estres",
    "Historial de Dieta",
    "Habitos Alimentarios",
    "Preferencias de Comida",
    "Restricciones",
    "Estilo de Vida",
    "Hidratacion",
    "Suplementos",
    "Salud",
    "Cumplimiento",
    "Objetivos"
  ],
  fr: [
    "Profil de Base",
    "Objectif Principal",
    "Composition Corporelle",
    "Activite Quotidienne",
    "Entrainement",
    "Cardio",
    "Metabolisme",
    "Sommeil",
    "Stress",
    "Historique Alimentaire",
    "Habitudes Alimentaires",
    "Preferences Alimentaires",
    "Restrictions",
    "Mode de Vie",
    "Hydratation",
    "Supplements",
    "Sante",
    "Discipline",
    "Objectifs"
  ]
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

const BASE_STEPS: BaseStep[] = [
  { id: "s1_age", sectionIdx: 0, question: "How old are you?", type: "number", min: 13, max: 80, unit: "years", required: true },
  { id: "s1_gender", sectionIdx: 0, question: "What is your gender?", type: "single", options: ["Male", "Female", "Prefer not to say"], required: true },
  { id: "s1_height", sectionIdx: 0, question: "What is your height?", type: "slider", min: 140, max: 220, unit: "cm", step: 1, defaultValue: 170, required: true },
  { id: "s1_weight", sectionIdx: 0, question: "What is your current weight?", type: "slider", min: 40, max: 200, unit: "kg", step: 1, defaultValue: 70, required: true },
  { id: "s2_goal", sectionIdx: 1, question: "What is your main goal?", sub: "This determines your calorie direction and program structure.", type: "single", options: ["Lose fat", "Gain muscle", "Recomposition (lose fat + gain muscle)", "Maintain weight"], required: true },
  { id: "s2_pace", sectionIdx: 1, question: "How fast do you want results?", sub: "Faster results require more discipline.", type: "single", options: ["Slow and safe", "Moderate", "Aggressive"], required: true },
  { id: "s3_body_silhouette", sectionIdx: 2, question: "Select the silhouette closest to your current body shape.", sub: "This gives TJAI a practical body-fat estimate for macro precision.", type: "single", options: ["Very Lean", "Lean", "Average", "Overweight", "Obese"], required: true },
  { id: "s3_fat_storage", sectionIdx: 2, question: "Where do you store most of your fat?", type: "single", options: ["Belly / midsection", "Lower body (hips, thighs)", "Evenly distributed"], required: true },
  { id: "s4_daily_activity", sectionIdx: 3, question: "What is your daily activity level?", sub: "This is your activity OUTSIDE of training.", type: "single", options: ["Very low — mostly sitting (desk job, minimal movement)", "Low — light movement, mostly sedentary", "Moderate — walking, light movement throughout day", "Active — standing or walking job", "Very active — physical labor job"], required: true },
  { id: "s4_steps", sectionIdx: 3, question: "How many steps do you walk per day?", type: "single", options: ["Under 3,000", "3,000–7,000", "7,000–10,000", "Over 10,000"], required: true },
  { id: "s5_trains", sectionIdx: 4, question: "Do you currently train?", type: "single", options: ["Yes", "No"], required: true },
  { id: "s5_days", sectionIdx: 4, question: "How many days per week do you train?", type: "single", options: ["1–2 days", "3–4 days", "5–6 days", "7 days"], skipIf: { stepId: "s5_trains", value: "No" }, required: false },
  { id: "s5_type", sectionIdx: 4, question: "What type of training do you do?", sub: "Select all that apply.", type: "multi", options: ["Gym (weights)", "Home workout (bodyweight)", "Cardio / running", "Sports", "Martial arts / combat sports"], skipIf: { stepId: "s5_trains", value: "No" }, required: false },
  { id: "s5_duration", sectionIdx: 4, question: "How long is your average training session?", type: "single", options: ["Under 30 min", "30–45 min", "45–60 min", "60–90 min", "Over 90 min"], skipIf: { stepId: "s5_trains", value: "No" }, required: false },
  { id: "s6_cardio", sectionIdx: 5, question: "How often do you do cardio?", type: "single", options: ["Never", "1–2 times/week", "3–5 times/week", "Daily"], required: true },
  { id: "s6_cardio_type", sectionIdx: 5, question: "What type of cardio do you do?", type: "multi", options: ["Walking", "Running / jogging", "Cycling", "HIIT", "Swimming", "Rowing"], skipIf: { stepId: "s6_cardio", value: "Never" }, required: false },
  { id: "s7_gain_easy", sectionIdx: 6, question: "Do you gain weight easily?", type: "single", options: ["Yes — I gain weight fast", "No — I struggle to gain", "Not sure"], required: true },
  { id: "s7_lose_easy", sectionIdx: 6, question: "Do you lose weight easily?", type: "single", options: ["Yes — I drop weight fast", "No — I struggle to lose", "Not sure"], required: true },
  { id: "s7_appetite", sectionIdx: 6, question: "How is your appetite?", type: "single", options: ["Low — I forget to eat", "Normal", "High — I'm always hungry"], required: true },
  { id: "s8_hours", sectionIdx: 7, question: "How many hours do you sleep per night?", type: "slider", min: 4, max: 12, unit: "hrs", step: 1, defaultValue: 7, required: true },
  { id: "s8_quality", sectionIdx: 7, question: "How is your sleep quality?", type: "single", options: ["Poor — I wake up often", "Average", "Good — I sleep well"], required: true },
  { id: "s9_stress", sectionIdx: 8, question: "What is your current stress level?", sub: "Stress affects cortisol which directly impacts fat loss and muscle gain.", type: "single", options: ["Low", "Moderate", "High", "Very high"], required: true },
  { id: "s10_dieted", sectionIdx: 9, question: "Have you followed a structured diet before?", type: "single", options: ["Yes", "No"], required: true },
  { id: "s10_diet_result", sectionIdx: 9, question: "What was the result of your previous diet?", type: "single", options: ["Lost weight and kept it off", "Lost weight but gained it back", "Gained weight consistently", "Didn't see results"], skipIf: { stepId: "s10_dieted", value: "No" }, required: false },
  { id: "s11_meals", sectionIdx: 10, question: "How many meals per day do you prefer?", type: "single", options: ["2 meals", "3 meals", "4 meals", "5+ meals", "I prefer intermittent fasting"], required: true },
  { id: "s11_snacks", sectionIdx: 10, question: "Do you snack frequently?", type: "single", options: ["Rarely", "Sometimes", "Often — I snack between most meals"], required: true },
  { id: "s11_late_eating", sectionIdx: 10, question: "Do you eat late at night?", type: "single", options: ["Never", "Sometimes", "Often", "Almost every night"], required: true },
  { id: "s11_skip_meals", sectionIdx: 10, question: "Do you skip meals?", type: "single", options: ["Never", "Occasionally", "Often"], required: true },
  { id: "s12_diet_style", sectionIdx: 11, question: "Do you follow any specific diet style?", type: "single", options: ["No preference — I eat everything", "High protein focus", "Low carb / keto", "Balanced macros", "Vegetarian", "Vegan"], required: true },
  { id: "s12_foods_like", sectionIdx: 11, question: "Which foods do you enjoy eating?", sub: "List your favorites — the AI will include them in your meal plan.", type: "text", placeholder: "e.g. chicken, rice, eggs, pasta, Greek yogurt...", required: false },
  { id: "s12_foods_hate", sectionIdx: 11, question: "Which foods do you dislike or avoid?", sub: "The AI will not include these in your plan.", type: "text", placeholder: "e.g. fish, broccoli, mushrooms...", required: false },
  { id: "s13_allergies", sectionIdx: 12, question: "Do you have any food allergies?", type: "multi", options: ["None", "Gluten / wheat", "Dairy / lactose", "Nuts / tree nuts", "Eggs", "Shellfish", "Soy"], required: true },
  { id: "s13_cannot_eat", sectionIdx: 12, question: "Are there foods you cannot eat for any other reason?", type: "text", placeholder: "Any other restrictions or intolerances...", required: false },
  { id: "s13_religious", sectionIdx: 12, question: "Do you have any religious dietary restrictions?", type: "single", options: ["None", "Halal", "Kosher", "Hindu (no beef)", "Other"], required: true },
  { id: "s14_cooks", sectionIdx: 13, question: "Do you cook your own food?", type: "single", options: ["Yes — I cook daily", "Sometimes — mixed cooking and eating out", "Rarely — mostly eat out or ready meals"], required: true },
  { id: "s14_budget", sectionIdx: 13, question: "What is your food budget level?", type: "single", options: ["Low — I need budget-friendly meals", "Medium", "High — budget is not a concern"], required: true },
  { id: "s14_time", sectionIdx: 13, question: "How much time do you have to prepare meals?", type: "single", options: ["Very low — under 15 min per meal", "Medium — 15–30 min", "High — I enjoy cooking"], required: true },
  { id: "s15_water", sectionIdx: 14, question: "How much water do you drink daily?", type: "single", options: ["Under 1L", "1–2L", "2–3L", "Over 3L"], required: true },
  { id: "s16_uses_supps", sectionIdx: 15, question: "Do you currently use any supplements?", type: "single", options: ["Yes", "No"], required: true },
  { id: "s16_which_supps", sectionIdx: 15, question: "Which supplements do you take?", type: "multi", options: ["Protein powder / whey", "Creatine", "Pre-workout", "Multivitamin", "Omega-3 / fish oil", "Vitamin D", "BCAAs", "Fat burner", "Other"], skipIf: { stepId: "s16_uses_supps", value: "No" }, required: false },
  { id: "s17_injuries", sectionIdx: 16, question: "Do you have any injuries?", type: "text", placeholder: "e.g. bad knee, lower back pain, shoulder injury...", required: false },
  { id: "s17_conditions", sectionIdx: 16, question: "Do you have any medical conditions relevant to diet or exercise?", type: "text", placeholder: "e.g. diabetes, hypothyroidism, PCOS...", required: false },
  { id: "s17_medications", sectionIdx: 16, question: "Are you taking any medications that may affect weight or energy?", type: "text", placeholder: "e.g. antidepressants, steroids, thyroid medication...", required: false },
  { id: "s18_discipline", sectionIdx: 17, question: "How disciplined are you with your habits?", sub: "Be honest — this helps design a plan you will actually follow.", type: "single", options: ["Low — I struggle to stay consistent", "Medium — I'm fairly consistent", "High — I follow plans strictly"], required: true },
  { id: "s18_biggest_problem", sectionIdx: 17, question: "What is your biggest challenge with fitness?", type: "multi", options: ["Cravings and hunger", "Consistency over time", "Not enough time", "Lack of motivation", "Not knowing what to do", "Injuries or physical limitations"], required: true },
  { id: "s19_target_weight", sectionIdx: 18, question: "Do you have a target weight?", type: "slider", min: 40, max: 200, unit: "kg", step: 1, defaultValue: 70, sub: "Set to your current weight if you just want to recomp.", required: true },
  { id: "s19_timeframe", sectionIdx: 18, question: "What is your timeframe for this goal?", type: "single", options: ["4 weeks", "8 weeks", "12 weeks", "6 months", "1 year", "Ongoing / lifestyle"], required: true },
  { id: "s19_daily_routine", sectionIdx: 18, question: "Describe a typical day in your life.", sub: "Include: when you wake up, work schedule, when you train, how many meals, when you sleep. The more detail, the more accurate your plan.", type: "text", placeholder: "e.g. Wake at 7am, desk job 9-5, gym at 6pm for 1hr, eat 3 meals, sleep at 11pm...", required: true }
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
    totalSections: 19
  }));
}

