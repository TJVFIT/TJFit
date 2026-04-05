import { Program } from "@/lib/content";
import { Locale } from "@/lib/i18n";

const nutritionSlugs = new Set([
  "clean-bulk-diet-plan",
  "high-calorie-muscle-diet",
  "lean-bulk-nutrition-plan",
  "mass-gain-meal-plan",
  "hardcore-bulk-diet",
  "fat-loss-diet-plan",
  "cutting-shred-meal-plan",
  "low-calorie-lean-diet",
  "keto-cut-plan",
  "high-protein-cutting-diet",
  "keto-shred-diet-12w",
  "gut-health-fat-loss-diet-12w",
  "student-fat-loss-diet-12w",
  "lean-bulk-diet-12w",
  "clean-cutting-diet-12w",
  "hard-cut-athlete-diet-12w",
  "high-calorie-mass-diet-12w",
  "muscle-gain-athlete-diet-12w",
  "student-bulk-diet-12w",
  "clean-weight-gain-diet-12w",
  "clean-cut-starter",
  "lean-bulk-starter"
]);

const categoryTranslations: Record<Locale, Record<string, string>> = {
  en: {
    "Fat Loss": "Fat Loss",
    "Strength": "Strength",
    "Recomposition": "Recomposition",
    "Muscle Gain": "Muscle Gain",
    "Performance": "Performance",
    "Gym Training": "Gym Training",
    "Nutrition": "Nutrition"
  },
  tr: {
    "Fat Loss": "Yag Yakimi",
    "Strength": "Guc",
    "Recomposition": "Vucut Kompozisyonu",
    "Muscle Gain": "Kas Gelisimi",
    "Performance": "Performans",
    "Gym Training": "Salon Antrenmani",
    "Nutrition": "Beslenme"
  },
  ar: {
    "Fat Loss": "حرق الدهون",
    "Strength": "القوة",
    "Recomposition": "إعادة تركيب الجسم",
    "Muscle Gain": "بناء العضلات",
    "Performance": "الأداء",
    "Gym Training": "تدريب الجيم",
    "Nutrition": "التغذية"
  },
  es: {
    "Fat Loss": "Perdida de Grasa",
    "Strength": "Fuerza",
    "Recomposition": "Recomposicion Corporal",
    "Muscle Gain": "Ganancia Muscular",
    "Performance": "Rendimiento",
    "Gym Training": "Entrenamiento de Gimnasio",
    "Nutrition": "Nutricion"
  },
  fr: {
    "Fat Loss": "Perte de Graisse",
    "Strength": "Force",
    "Recomposition": "Recomposition Corporelle",
    "Muscle Gain": "Prise de Muscle",
    "Performance": "Performance",
    "Gym Training": "Entrainement en Salle",
    "Nutrition": "Nutrition"
  }
};

const difficultyTranslations: Record<Locale, Record<string, string>> = {
  en: { Beginner: "Beginner", Intermediate: "Intermediate", Advanced: "Advanced", "Beginner to Advanced": "Beginner to Advanced" },
  tr: {
    Beginner: "Baslangic",
    Intermediate: "Orta Seviye",
    Advanced: "Ileri Seviye",
    "Beginner to Advanced": "Baslangic - Ileri Seviye"
  },
  ar: { Beginner: "مبتدئ", Intermediate: "متوسط", Advanced: "متقدم", "Beginner to Advanced": "من مبتدئ الى متقدم" },
  es: { Beginner: "Principiante", Intermediate: "Intermedio", Advanced: "Avanzado", "Beginner to Advanced": "De principiante a avanzado" },
  fr: { Beginner: "Debutant", Intermediate: "Intermediaire", Advanced: "Avance", "Beginner to Advanced": "Debutant a avance" }
};

const titleTranslations: Record<Exclude<Locale, "en">, Record<string, string>> = {
  tr: {
    "home-fat-burn-starter": "Evde Yag Yakimi Baslangic",
    "home-hiit-shred": "Evde HIIT Definasyon",
    "home-bodyweight-fat-loss": "Evde Vucut Agirligi ile Yag Yakimi",
    "home-cardio-burn-plan": "Evde Kardiyo Yag Yakim Plani",
    "home-lean-fit-program": "Evde Fit ve Siki Program",
    "home-muscle-builder": "Evde Kas Gelisimi Programi",
    "home-bodyweight-strength-plan": "Evde Vucut Agirligi Guc Programi",
    "home-lean-muscle-gain": "Evde Yagli Artis Olmadan Kas Gelisimi",
    "home-push-pull-builder": "Evde Push Pull Kas Programi",
    "home-full-body-growth": "Evde Tum Vucut Gelisim Programi",
    "gym-mass-builder": "Salonda Kutle Artisi Programi",
    "gym-hypertrophy-pro": "Salonda Hipertrofi Pro Programi",
    "gym-strength-size": "Salonda Guc ve Hacim Programi",
    "gym-push-pull-legs-mass": "Salonda Push Pull Legs Kutle Programi",
    "gym-advanced-muscle-gain": "Salonda Ileri Seviye Kas Gelisimi",
    "gym-fat-loss-shred": "Salonda Yag Yakim Definasyon",
    "gym-hiit-weights-cut": "Salonda HIIT + Agirlik Definasyon",
    "gym-lean-machine": "Salonda Lean Machine Programi",
    "gym-cardio-strength-burn": "Salonda Kardiyo + Guc Yag Yakim",
    "gym-shredded-physique": "Salonda Keskin Fizik Programi",
    "clean-bulk-diet-plan": "Temiz Bulk Beslenme Plani",
    "high-calorie-muscle-diet": "Yuksek Kalori Kas Beslenme Plani",
    "lean-bulk-nutrition-plan": "Lean Bulk Beslenme Plani",
    "mass-gain-meal-plan": "Kutle Artis Yemek Plani",
    "hardcore-bulk-diet": "Hardcore Bulk Diyeti",
    "fat-loss-diet-plan": "Yag Yakim Diyet Plani",
    "cutting-shred-meal-plan": "Cutting Definasyon Yemek Plani",
    "low-calorie-lean-diet": "Dusuk Kalori Lean Diyet",
    "keto-cut-plan": "Keto Definasyon Plani",
    "high-protein-cutting-diet": "Yuksek Proteinli Cutting Diyeti",
    "keto-shred-diet-12w": "Keto Definasyon Diyeti (12 Hafta)",
    "gut-health-fat-loss-diet-12w": "Bagirsak Sagligi Yag Yakim Diyeti (12 Hafta)",
    "student-fat-loss-diet-12w": "Ogrenci Yag Yakim Diyeti (12 Hafta)",
    "lean-bulk-diet-12w": "Lean Bulk Diyeti (12 Hafta)",
    "clean-cutting-diet-12w": "Temiz Cutting Diyeti (12 Hafta)",
    "hard-cut-athlete-diet-12w": "Sert Atlet Definasyon Diyeti (12 Hafta)",
    "high-calorie-mass-diet-12w": "Yuksek Kalori Kutle Diyeti (12 Hafta)",
    "muscle-gain-athlete-diet-12w": "Atlet Kas Gelisim Diyeti (12 Hafta)",
    "student-bulk-diet-12w": "Ogrenci Bulk Diyeti (12 Hafta)",
    "clean-weight-gain-diet-12w": "Temiz Kilo Alma Diyeti (12 Hafta)",
    "home-fat-burn-accelerator-12w": "Evde Yag Yakim Hizlandirici (12 Hafta)",
    "bodyweight-shred-system-12w": "Vucut Agirligi Definasyon Sistemi (12 Hafta)",
    "home-cardio-melt-12w": "Evde Kardiyo Eritme (12 Hafta)",
    "lean-at-home-program-12w": "Evde Lean Program (12 Hafta)",
    "sweat-and-burn-blueprint-12w": "Terle ve Yak Plani (12 Hafta)",
    "home-muscle-builder-12w": "Evde Kas Gelistirme (12 Hafta)",
    "bodyweight-mass-plan-12w": "Vucut Agirligi Kutle Plani (12 Hafta)",
    "home-strength-gain-12w": "Evde Guc Artisi (12 Hafta)",
    "calisthenics-growth-system-12w": "Kalistenik Gelisim Sistemi (12 Hafta)",
    "lean-muscle-home-program-12w": "Evde Lean Kas Programi (12 Hafta)",
    "gym-fat-loss-protocol-12w": "Salonda Yag Yakim Protokolu (12 Hafta)",
    "shred-and-sweat-gym-plan-12w": "Salonda Definasyon ve Ter Plani (12 Hafta)",
    "cutting-system-gym-12w": "Kesim Sistemi (Salon, 12 Hafta)",
    "lean-machine-program-12w": "Lean Machine Programi (12 Hafta)",
    "high-intensity-fat-burn-12w": "Yuksek Yogunluklu Yag Yakim (12 Hafta)",
    "gym-mass-builder-12w": "Salonda Kutle Artisi (12 Hafta)",
    "hypertrophy-system-12w": "Hipertrofi Sistemi (12 Hafta)",
    "strength-and-size-blueprint-12w": "Guc ve Hacim Plani (12 Hafta)",
    "aesthetic-muscle-plan-12w": "Estetik Kas Plani (12 Hafta)",
    "home-fat-loss-starter": "Evde Yag Yakim Baslangic",
    "gym-muscle-starter": "Salon Kas Gelisimi Baslangic",
    "clean-cut-starter": "Temiz Definisyon Baslangic",
    "lean-bulk-starter": "Lean Bulk Baslangic"
  },
  ar: {
    "home-fat-burn-starter": "خطة بداية حرق الدهون في المنزل",
    "home-hiit-shred": "خطة HIIT للتنشيف في المنزل",
    "home-bodyweight-fat-loss": "خطة خسارة الدهون بوزن الجسم في المنزل",
    "home-cardio-burn-plan": "خطة كارديو لحرق الدهون في المنزل",
    "home-lean-fit-program": "برنامج جسم رشيق ولياقة في المنزل",
    "home-muscle-builder": "برنامج بناء العضلات في المنزل",
    "home-bodyweight-strength-plan": "برنامج القوة بوزن الجسم في المنزل",
    "home-lean-muscle-gain": "خطة اكتساب العضلات الصافية في المنزل",
    "home-push-pull-builder": "برنامج بوش بول لبناء العضلات في المنزل",
    "home-full-body-growth": "برنامج تطوير الجسم الكامل في المنزل",
    "gym-mass-builder": "برنامج بناء الكتلة في الجيم",
    "gym-hypertrophy-pro": "برنامج التضخم العضلي الاحترافي في الجيم",
    "gym-strength-size": "برنامج القوة والحجم في الجيم",
    "gym-push-pull-legs-mass": "برنامج بوش بول ليجز للكتلة في الجيم",
    "gym-advanced-muscle-gain": "برنامج متقدم لبناء العضلات في الجيم",
    "gym-fat-loss-shred": "برنامج تنشيف وحرق الدهون في الجيم",
    "gym-hiit-weights-cut": "برنامج HIIT + أوزان للتنشيف في الجيم",
    "gym-lean-machine": "برنامج الجسم الرشيق في الجيم",
    "gym-cardio-strength-burn": "برنامج كارديو + قوة لحرق الدهون في الجيم",
    "gym-shredded-physique": "برنامج قوام ممزق في الجيم",
    "clean-bulk-diet-plan": "خطة تضخيم نظيف غذائية",
    "high-calorie-muscle-diet": "خطة غذائية عالية السعرات لبناء العضلات",
    "lean-bulk-nutrition-plan": "خطة تغذية تضخيم صافي",
    "mass-gain-meal-plan": "خطة وجبات زيادة الكتلة",
    "hardcore-bulk-diet": "نظام تضخيم مكثف",
    "fat-loss-diet-plan": "خطة غذائية لخسارة الدهون",
    "cutting-shred-meal-plan": "خطة وجبات التنشيف",
    "low-calorie-lean-diet": "نظام منخفض السعرات لجسم رشيق",
    "keto-cut-plan": "خطة كيتو للتنشيف",
    "high-protein-cutting-diet": "نظام تنشيف عالي البروتين",
    "keto-shred-diet-12w": "حمية كيتو للتنشيف (12 اسبوع)",
    "gut-health-fat-loss-diet-12w": "حمية صحة الامعاء وخسارة الدهون (12 اسبوع)",
    "student-fat-loss-diet-12w": "حمية خسارة الدهون للطلاب (12 اسبوع)",
    "lean-bulk-diet-12w": "حمية الزيادة النظيفة (12 اسبوع)",
    "clean-cutting-diet-12w": "حمية التنشيف النظيف (12 اسبوع)",
    "hard-cut-athlete-diet-12w": "حمية التنشيف الرياضي القاسي (12 اسبوع)",
    "high-calorie-mass-diet-12w": "حمية عالية السعرات لزيادة الكتلة (12 اسبوع)",
    "muscle-gain-athlete-diet-12w": "حمية رياضية لبناء العضلات (12 اسبوع)",
    "student-bulk-diet-12w": "حمية تضخيم للطلاب (12 اسبوع)",
    "clean-weight-gain-diet-12w": "حمية زيادة وزن نظيفة (12 اسبوع)",
    "home-fat-burn-accelerator-12w": "مسرع حرق الدهون المنزلي (12 اسبوع)",
    "bodyweight-shred-system-12w": "نظام التنشيف بوزن الجسم (12 اسبوع)",
    "home-cardio-melt-12w": "خطة الكارديو المنزلية المكثفة (12 اسبوع)",
    "lean-at-home-program-12w": "برنامج جسم رشيق في المنزل (12 اسبوع)",
    "sweat-and-burn-blueprint-12w": "مخطط التعرق والحرق (12 اسبوع)",
    "home-muscle-builder-12w": "بناء العضلات في المنزل (12 اسبوع)",
    "bodyweight-mass-plan-12w": "خطة زيادة الكتلة بوزن الجسم (12 اسبوع)",
    "home-strength-gain-12w": "زيادة القوة في المنزل (12 اسبوع)",
    "calisthenics-growth-system-12w": "نظام نمو الكاليستنكس (12 اسبوع)",
    "lean-muscle-home-program-12w": "برنامج العضلات الصافية في المنزل (12 اسبوع)",
    "gym-fat-loss-protocol-12w": "بروتوكول خسارة الدهون في الجيم (12 اسبوع)",
    "shred-and-sweat-gym-plan-12w": "خطة التنشيف والتعرق في الجيم (12 اسبوع)",
    "cutting-system-gym-12w": "نظام الكات للجيم (12 اسبوع)",
    "lean-machine-program-12w": "برنامج الجسم الرشيق (12 اسبوع)",
    "high-intensity-fat-burn-12w": "حرق الدهون عالي الشدة (12 اسبوع)",
    "gym-mass-builder-12w": "بناء الكتلة في الجيم (12 اسبوع)",
    "hypertrophy-system-12w": "نظام التضخم العضلي (12 اسبوع)",
    "strength-and-size-blueprint-12w": "خطة القوة والحجم (12 اسبوع)",
    "aesthetic-muscle-plan-12w": "خطة العضلات الجمالية (12 اسبوع)",
    "home-fat-loss-starter": "بداية حرق الدهون في المنزل",
    "gym-muscle-starter": "بداية بناء العضلات في الجيم",
    "clean-cut-starter": "بداية التنشيف النظيف",
    "lean-bulk-starter": "بداية الزيادة النظيفة"
  },
  es: {
    "home-fat-burn-starter": "Inicio Quema Grasa en Casa",
    "home-hiit-shred": "HIIT Definicion en Casa",
    "home-bodyweight-fat-loss": "Perdida de Grasa con Peso Corporal en Casa",
    "home-cardio-burn-plan": "Plan Cardio Quema Grasa en Casa",
    "home-lean-fit-program": "Programa Fitness y Definicion en Casa",
    "home-muscle-builder": "Constructor de Musculo en Casa",
    "home-bodyweight-strength-plan": "Plan de Fuerza con Peso Corporal en Casa",
    "home-lean-muscle-gain": "Ganancia Muscular Magra en Casa",
    "home-push-pull-builder": "Constructor Push Pull en Casa",
    "home-full-body-growth": "Crecimiento de Cuerpo Completo en Casa",
    "gym-mass-builder": "Constructor de Masa en Gimnasio",
    "gym-hypertrophy-pro": "Hipertrofia Pro en Gimnasio",
    "gym-strength-size": "Fuerza y Tamano en Gimnasio",
    "gym-push-pull-legs-mass": "Masa Push Pull Legs en Gimnasio",
    "gym-advanced-muscle-gain": "Ganancia Muscular Avanzada en Gimnasio",
    "gym-fat-loss-shred": "Definicion y Perdida de Grasa en Gimnasio",
    "gym-hiit-weights-cut": "HIIT + Pesas Definicion en Gimnasio",
    "gym-lean-machine": "Maquina Magra en Gimnasio",
    "gym-cardio-strength-burn": "Cardio + Fuerza Quema en Gimnasio",
    "gym-shredded-physique": "Fisico Definido en Gimnasio",
    "clean-bulk-diet-plan": "Plan de Dieta Volumen Limpio",
    "high-calorie-muscle-diet": "Dieta Alta en Calorias para Musculo",
    "lean-bulk-nutrition-plan": "Plan de Nutricion Volumen Magro",
    "mass-gain-meal-plan": "Plan de Comidas para Ganar Masa",
    "hardcore-bulk-diet": "Dieta de Volumen Hardcore",
    "fat-loss-diet-plan": "Plan de Dieta para Perder Grasa",
    "cutting-shred-meal-plan": "Plan de Comidas para Definicion",
    "low-calorie-lean-diet": "Dieta Magra Baja en Calorias",
    "keto-cut-plan": "Plan Keto de Definicion",
    "high-protein-cutting-diet": "Dieta de Definicion Alta en Proteina",
    "keto-shred-diet-12w": "Dieta Keto Shred (12 Semanas)",
    "gut-health-fat-loss-diet-12w": "Dieta de Salud Intestinal y Perdida de Grasa (12 Semanas)",
    "student-fat-loss-diet-12w": "Dieta de Perdida de Grasa para Estudiantes (12 Semanas)",
    "lean-bulk-diet-12w": "Dieta Lean Bulk (12 Semanas)",
    "clean-cutting-diet-12w": "Dieta de Corte Limpio (12 Semanas)",
    "hard-cut-athlete-diet-12w": "Dieta Hard Cut Atletica (12 Semanas)",
    "high-calorie-mass-diet-12w": "Dieta de Volumen Alta en Calorias (12 Semanas)",
    "muscle-gain-athlete-diet-12w": "Dieta Atletica para Ganancia Muscular (12 Semanas)",
    "student-bulk-diet-12w": "Dieta de Volumen para Estudiantes (12 Semanas)",
    "clean-weight-gain-diet-12w": "Dieta de Aumento de Peso Limpio (12 Semanas)",
    "home-fat-burn-accelerator-12w": "Acelerador de Quema de Grasa en Casa (12 Semanas)",
    "bodyweight-shred-system-12w": "Sistema de Definicion con Peso Corporal (12 Semanas)",
    "home-cardio-melt-12w": "Cardio Melt en Casa (12 Semanas)",
    "lean-at-home-program-12w": "Programa Lean en Casa (12 Semanas)",
    "sweat-and-burn-blueprint-12w": "Plan de Sudor y Quema (12 Semanas)",
    "home-muscle-builder-12w": "Constructor de Musculo en Casa (12 Semanas)",
    "bodyweight-mass-plan-12w": "Plan de Masa con Peso Corporal (12 Semanas)",
    "home-strength-gain-12w": "Ganancia de Fuerza en Casa (12 Semanas)",
    "calisthenics-growth-system-12w": "Sistema de Crecimiento Calistenico (12 Semanas)",
    "lean-muscle-home-program-12w": "Programa de Musculo Magro en Casa (12 Semanas)",
    "gym-fat-loss-protocol-12w": "Protocolo de Perdida de Grasa en Gimnasio (12 Semanas)",
    "shred-and-sweat-gym-plan-12w": "Plan Shred y Sweat en Gimnasio (12 Semanas)",
    "cutting-system-gym-12w": "Sistema de Cutting en Gimnasio (12 Semanas)",
    "lean-machine-program-12w": "Programa Lean Machine (12 Semanas)",
    "high-intensity-fat-burn-12w": "Quema de Grasa de Alta Intensidad (12 Semanas)",
    "gym-mass-builder-12w": "Constructor de Masa en Gimnasio (12 Semanas)",
    "hypertrophy-system-12w": "Sistema de Hipertrofia (12 Semanas)",
    "strength-and-size-blueprint-12w": "Plan de Fuerza y Tamano (12 Semanas)",
    "aesthetic-muscle-plan-12w": "Plan de Musculo Estetico (12 Semanas)",
    "home-fat-loss-starter": "Inicio Perdida de Grasa en Casa",
    "gym-muscle-starter": "Inicio Musculo en Gimnasio",
    "clean-cut-starter": "Inicio Definicion Limpia",
    "lean-bulk-starter": "Inicio Volumen Magro"
  },
  fr: {
    "home-fat-burn-starter": "Demarrage Brule-Graisse a Domicile",
    "home-hiit-shred": "HIIT Seche a Domicile",
    "home-bodyweight-fat-loss": "Perte de Graisse au Poids du Corps a Domicile",
    "home-cardio-burn-plan": "Plan Cardio Brule-Graisse a Domicile",
    "home-lean-fit-program": "Programme Minceur et Forme a Domicile",
    "home-muscle-builder": "Constructeur de Muscle a Domicile",
    "home-bodyweight-strength-plan": "Plan de Force au Poids du Corps a Domicile",
    "home-lean-muscle-gain": "Prise de Muscle Sec a Domicile",
    "home-push-pull-builder": "Constructeur Push Pull a Domicile",
    "home-full-body-growth": "Croissance Corps Complet a Domicile",
    "gym-mass-builder": "Constructeur de Masse en Salle",
    "gym-hypertrophy-pro": "Hypertrophie Pro en Salle",
    "gym-strength-size": "Force et Volume en Salle",
    "gym-push-pull-legs-mass": "Masse Push Pull Legs en Salle",
    "gym-advanced-muscle-gain": "Prise de Muscle Avancee en Salle",
    "gym-fat-loss-shred": "Seche et Perte de Graisse en Salle",
    "gym-hiit-weights-cut": "HIIT + Poids Seche en Salle",
    "gym-lean-machine": "Lean Machine en Salle",
    "gym-cardio-strength-burn": "Cardio + Force Brule en Salle",
    "gym-shredded-physique": "Physique Sculpte en Salle",
    "clean-bulk-diet-plan": "Plan Nutrition Prise de Masse Propre",
    "high-calorie-muscle-diet": "Diete Musculation Haute Calories",
    "lean-bulk-nutrition-plan": "Plan Nutrition Prise de Masse Seche",
    "mass-gain-meal-plan": "Plan Repas Gain de Masse",
    "hardcore-bulk-diet": "Diete Prise de Masse Hardcore",
    "fat-loss-diet-plan": "Plan Diete Perte de Graisse",
    "cutting-shred-meal-plan": "Plan Repas Seche",
    "low-calorie-lean-diet": "Diete Seche Basse Calories",
    "keto-cut-plan": "Plan Keto Seche",
    "high-protein-cutting-diet": "Diete Seche Haute Proteine",
    "keto-shred-diet-12w": "Diete Keto Seche (12 Semaines)",
    "gut-health-fat-loss-diet-12w": "Diete Sante Intestinale et Perte de Graisse (12 Semaines)",
    "student-fat-loss-diet-12w": "Diete Perte de Graisse Etudiant (12 Semaines)",
    "lean-bulk-diet-12w": "Diete Lean Bulk (12 Semaines)",
    "clean-cutting-diet-12w": "Diete Cutting Propre (12 Semaines)",
    "hard-cut-athlete-diet-12w": "Diete Hard Cut Athlete (12 Semaines)",
    "high-calorie-mass-diet-12w": "Diete Masse Haute Calories (12 Semaines)",
    "muscle-gain-athlete-diet-12w": "Diete Athlete Prise de Muscle (12 Semaines)",
    "student-bulk-diet-12w": "Diete Prise de Masse Etudiant (12 Semaines)",
    "clean-weight-gain-diet-12w": "Diete Prise de Poids Propre (12 Semaines)",
    "home-fat-burn-accelerator-12w": "Accelerateur Brule-Graisse Maison (12 Semaines)",
    "bodyweight-shred-system-12w": "Systeme Seche au Poids du Corps (12 Semaines)",
    "home-cardio-melt-12w": "Cardio Melt a Domicile (12 Semaines)",
    "lean-at-home-program-12w": "Programme Lean a Domicile (12 Semaines)",
    "sweat-and-burn-blueprint-12w": "Plan Transpiration et Brule (12 Semaines)",
    "home-muscle-builder-12w": "Constructeur de Muscle a Domicile (12 Semaines)",
    "bodyweight-mass-plan-12w": "Plan de Masse au Poids du Corps (12 Semaines)",
    "home-strength-gain-12w": "Gain de Force a Domicile (12 Semaines)",
    "calisthenics-growth-system-12w": "Systeme de Croissance Calisthenics (12 Semaines)",
    "lean-muscle-home-program-12w": "Programme Muscle Sec a Domicile (12 Semaines)",
    "gym-fat-loss-protocol-12w": "Protocole Perte de Graisse en Salle (12 Semaines)",
    "shred-and-sweat-gym-plan-12w": "Plan Seche et Sueur en Salle (12 Semaines)",
    "cutting-system-gym-12w": "Systeme Cutting en Salle (12 Semaines)",
    "lean-machine-program-12w": "Programme Lean Machine (12 Semaines)",
    "high-intensity-fat-burn-12w": "Brule-Graisse Haute Intensite (12 Semaines)",
    "gym-mass-builder-12w": "Constructeur de Masse en Salle (12 Semaines)",
    "hypertrophy-system-12w": "Systeme Hypertrophie (12 Semaines)",
    "strength-and-size-blueprint-12w": "Plan Force et Volume (12 Semaines)",
    "aesthetic-muscle-plan-12w": "Plan Muscle Esthetique (12 Semaines)",
    "home-fat-loss-starter": "Demarrage Perte de Graisse a Domicile",
    "gym-muscle-starter": "Demarrage Muscle en Salle",
    "clean-cut-starter": "Demarrage Seche Propre",
    "lean-bulk-starter": "Demarrage Prise de Masse Seche"
  }
};

/** Short catalog descriptions for free starters (all locales). */
const freeStarterDescriptions: Record<string, Record<Locale, string>> = {
  "home-fat-loss-starter": {
    en: "Three workouts per week. No equipment. Full progression from week 1 to 4.",
    tr: "Ucretsiz 4 haftalik evde yag yakim baslangici: haftada 3 gun (Pzt / Car / Cum), isinma, yapilandirilmis devreler ve net ilerleme. Tam plan icin giris yapin.",
    ar: "بداية مجانية لمدة 4 أسابيع لحرق الدهون في المنزل: 3 جلسات أسبوعياً مع إحماء ودوائر منظمة وتقدم واضح. سجّل الدخول لفتح الخطة كاملة.",
    es: "Inicio gratuito de 4 semanas para perder grasa en casa: 3 sesiones por semana con calentamiento, circuitos estructurados y progresion clara. Inicia sesion para ver el plan completo.",
    fr: "Demarrage gratuit de 4 semaines pour la perte de graisse a domicile : 3 seances par semaine avec echauffement, circuits structures et progression claire. Connectez-vous pour debloquer le plan complet."
  },
  "gym-muscle-starter": {
    en: "Three full-body days per week. Machines and free weights. Built to add size every week.",
    tr: "Kas gelisimi icin ucretsiz 4 haftalik salon baslangici: haftada 3 gun, makine ve serbest agirlik temelleri. Tam plan icin giris yapin.",
    ar: "بداية مجانية لمدة 4 أسابيع في الجيم لبناء العضلات: 3 انقسامات أسبوعياً مع الأجهزة والأوزان الحرة. سجّل الدخول لفتح الخطة كاملة.",
    es: "Inicio gratuito de 4 semanas en gimnasio para ganar musculo: 3 divisiones semanales con maquinas y pesas libres. Inicia sesion para ver el plan completo.",
    fr: "Demarrage gratuit de 4 semaines en salle pour la prise de muscle : 3 seances hebdomadaires avec machines et poids libres. Connectez-vous pour debloquer le plan complet."
  },
  "clean-cut-starter": {
    en: "Two weeks near 1800 kcal. Whole-food meals, clear macros, and a week-2 adjustment.",
    tr: "Yaklasik 1800 kcal ile 2 haftalik ucretsiz definisyon baslangici; 2. haftada ayarlama. Ogun detaylari ve makrolar icin giris yapin.",
    ar: "بداية مجانية لمدة أسبوعين للتنشيف حوالي 1800 سعرة مع وجبات بسيطة، ثم تعديل في الأسبوع الثاني. سجّل الدخول لعرض الوجبات والماكروس كاملة.",
    es: "Inicio gratuito de definicion de 2 semanas cerca de 1800 kcal con comidas simples y ajuste en la semana 2. Inicia sesion para ver comidas y macros completas.",
    fr: "Demarrage gratuit de 2 semaines vers 1800 kcal avec repas simples puis ajustement en semaine 2. Connectez-vous pour les details et macros complets."
  },
  "lean-bulk-starter": {
    en: "Two weeks near 2800 kcal. High protein, structured meals, and a simple week-2 bump.",
    tr: "Yaklasik 2800 kcal ile 2 haftalik ucretsiz lean bulk baslangici; yuksek protein ve 2. haftada hafif artis. Tam ogun detayi icin giris yapin.",
    ar: "بداية مجانية لمدة أسبوعين للزيادة النظيفة حوالي 2800 سعرة مع بروتين عالي وزيادة بسيطة في الأسبوع الثاني. سجّل الدخول لعرض الوجبات كاملة.",
    es: "Inicio gratuito de volumen magro de 2 semanas cerca de 2800 kcal con alto en proteina y subida en la semana 2. Inicia sesion para ver comidas completas.",
    fr: "Demarrage gratuit de 2 semaines de prise de masche seche vers 2800 kcal, proteines elevees et leger surplus en semaine 2. Connectez-vous pour le detail des repas."
  }
};

const descriptionTemplates = {
  en: {
    training: (kind: string) =>
      `A structured ${kind} plan with progressive weekly sessions to improve results, consistency, and long-term performance.`,
    nutrition: (goal: string) =>
      `A structured nutrition plan designed for ${goal} with practical daily meal guidance, sustainable habits, and consistent progress.`
  },
  tr: {
    training: (kind: string) =>
      `${kind} icin tasarlanmis, haftalik ilerleme odakli yapilandirilmis bir program. Sonuc, duzen ve uzun vadeli gelisim icin hazirlandi.`,
    nutrition: (goal: string) =>
      `${goal} odakli, gunluk uygulanabilir ve surdurulebilir aliskanliklarla ilerleme saglayan yapilandirilmis bir beslenme plani.`
  },
  ar: {
    training: (kind: string) =>
      `برنامج ${kind} منظم بتقدم اسبوعي لتحسين النتائج والالتزام والاداء على المدى الطويل.`,
    nutrition: (goal: string) =>
      `خطة تغذية منظمة لهدف ${goal} مع ارشادات يومية عملية وعادات مستدامة وتقدم ثابت.`
  },
  es: {
    training: (kind: string) =>
      `Programa estructurado de ${kind} con progresion semanal para mejorar resultados, constancia y rendimiento a largo plazo.`,
    nutrition: (goal: string) =>
      `Plan de nutricion estructurado para ${goal} con guia diaria practica, habitos sostenibles y progreso constante.`
  },
  fr: {
    training: (kind: string) =>
      `Programme structure de ${kind} avec progression hebdomadaire pour ameliorer les resultats, la regularite et la performance durable.`,
    nutrition: (goal: string) =>
      `Plan nutrition structure pour ${goal} avec des reperes quotidiens pratiques, des habitudes durables et une progression constante.`
  }
};

const currencyConfig: Record<Locale, { locale: string; currency: string; rate: number }> = {
  en: { locale: "en-US", currency: "USD", rate: 0.031 },
  tr: { locale: "tr-TR", currency: "TRY", rate: 1 },
  ar: { locale: "ar-SA", currency: "SAR", rate: 0.12 },
  es: { locale: "es-ES", currency: "EUR", rate: 0.029 },
  fr: { locale: "fr-FR", currency: "EUR", rate: 0.029 }
};

function normalizeDuration(duration: string, locale: Locale) {
  const weekCount = Number.parseInt(duration, 10);
  if (Number.isNaN(weekCount)) return duration;
  if (locale === "tr") return `${weekCount} hafta`;
  if (locale === "ar") return `${weekCount} اسابيع`;
  if (locale === "es") return `${weekCount} semanas`;
  if (locale === "fr") return `${weekCount} semaines`;
  return `${weekCount} weeks`;
}

function getGoalLabel(program: Program, locale: Locale) {
  const base = program.category.toLowerCase();
  if (base.includes("nutrition")) {
    if (program.slug.includes("fat-loss") || program.slug.includes("cut") || program.slug.includes("keto")) {
      return locale === "tr"
        ? "yag yakimi"
        : locale === "ar"
          ? "حرق الدهون"
          : locale === "es"
            ? "perdida de grasa"
            : locale === "fr"
              ? "perte de graisse"
              : "fat loss";
    }
    return locale === "tr"
      ? "kas gelisimi"
      : locale === "ar"
        ? "بناء العضلات"
        : locale === "es"
          ? "ganancia muscular"
          : locale === "fr"
            ? "prise de muscle"
            : "muscle gain";
  }

  if (program.slug.startsWith("home")) {
    return locale === "tr"
      ? "ev antrenmani"
      : locale === "ar"
        ? "التدريب المنزلي"
        : locale === "es"
          ? "entrenamiento en casa"
          : locale === "fr"
            ? "entrainement a domicile"
            : "home training";
  }
  return locale === "tr"
    ? "salon antrenmani"
    : locale === "ar"
      ? "تدريب الجيم"
      : locale === "es"
        ? "entrenamiento de gimnasio"
        : locale === "fr"
          ? "entrainement en salle"
          : "gym training";
}

export function getProgramBasePriceTry(program: Program) {
  if (program.is_free) return 0;
  return nutritionSlugs.has(program.slug) ? 350 : 400;
}

export function formatProgramPrice(tryAmount: number, locale: Locale) {
  const config = currencyConfig[locale];
  const localizedAmount = tryAmount * config.rate;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 2
  }).format(localizedAmount);
}

export function localizeProgram(program: Program, locale: Locale): Program {
  const translatedTitle = locale === "en" ? program.title : titleTranslations[locale][program.slug] ?? program.title;
  const translatedCategory = categoryTranslations[locale][program.category] ?? program.category;
  const translatedDifficulty = difficultyTranslations[locale][program.difficulty] ?? program.difficulty;
  const translatedDuration = normalizeDuration(program.duration, locale);
  const starter = freeStarterDescriptions[program.slug];
  const translatedDescription = starter
    ? starter[locale]
    : locale === "en"
      ? program.description
      : program.category === "Nutrition"
        ? descriptionTemplates[locale].nutrition(getGoalLabel(program, locale))
        : descriptionTemplates[locale].training(getGoalLabel(program, locale));

  return {
    ...program,
    title: translatedTitle,
    category: translatedCategory,
    difficulty: translatedDifficulty,
    duration: translatedDuration,
    description: translatedDescription
  };
}

export function getProgramUiCopy(locale: Locale) {
  return {
    viewProgram:
      locale === "tr"
        ? "Ucretsiz erisim"
        : locale === "ar"
          ? "وصول مجاني"
          : locale === "es"
            ? "Acceso gratis"
            : locale === "fr"
              ? "Accès gratuit"
              : "Get Free Access",
    viewDiet:
      locale === "tr"
        ? "Ucretsiz erisim"
        : locale === "ar"
          ? "وصول مجاني"
          : locale === "es"
            ? "Acceso gratis"
            : locale === "fr"
              ? "Accès gratuit"
              : "Get Free Access",
    buyProgram:
      locale === "tr"
        ? "Programi Satin Al"
        : locale === "ar"
          ? "شراء البرنامج"
          : locale === "es"
            ? "Comprar Programa"
            : locale === "fr"
              ? "Acheter le Programme"
              : "Buy program",
    getFullAccess:
      locale === "tr"
        ? "Tam erisim"
        : locale === "ar"
          ? "وصول كامل"
          : locale === "es"
            ? "Acceso completo"
            : locale === "fr"
              ? "Acces complet"
              : "Get Full Access",
    trainingLocationHome:
      locale === "tr"
        ? "Ev"
        : locale === "ar"
          ? "منزل"
          : locale === "es"
            ? "Casa"
            : locale === "fr"
              ? "Maison"
              : "Home",
    trainingLocationGym:
      locale === "tr"
        ? "Salon"
        : locale === "ar"
          ? "جيم"
          : locale === "es"
            ? "Gimnasio"
            : locale === "fr"
              ? "Salle"
              : "Gym",
    trainingLocationAny:
      locale === "tr"
        ? "Ev / salon"
        : locale === "ar"
          ? "مرن"
          : locale === "es"
            ? "Flexible"
            : locale === "fr"
              ? "Flexible"
              : "Home or gym",
    whatYouGetTitle:
      locale === "tr"
        ? "Neler var"
        : locale === "ar"
          ? "ماذا تحصل"
          : locale === "es"
            ? "Que incluye"
            : locale === "fr"
              ? "Contenu"
              : "What you get",
    dietPlanBadge:
      locale === "tr"
        ? "Beslenme plani"
        : locale === "ar"
          ? "خطة وجبات"
          : locale === "es"
            ? "Plan de comidas"
            : locale === "fr"
              ? "Plan repas"
              : "Meal plan",
    coachLabel:
      locale === "tr"
        ? "Koç"
        : locale === "ar"
          ? "المدرب"
          : locale === "es"
            ? "Coach"
            : locale === "fr"
              ? "Coach"
              : "Coach",
    teamFallback:
      locale === "tr"
        ? "Sadece Program Lansmani"
        : locale === "ar"
          ? "اطلاق البرامج فقط"
          : locale === "es"
            ? "Lanzamiento solo de programas"
            : locale === "fr"
              ? "Lancement programmes uniquement"
              : "Program-Only Launch",
    difficultyLabel:
      locale === "tr"
        ? "Seviye"
        : locale === "ar"
          ? "المستوى"
          : locale === "es"
            ? "Nivel"
            : locale === "fr"
              ? "Niveau"
              : "Difficulty",
    durationLabel:
      locale === "tr"
        ? "Sure"
        : locale === "ar"
          ? "المدة"
          : locale === "es"
            ? "Duracion"
            : locale === "fr"
              ? "Duree"
              : "Duration",
    priceLabel:
      locale === "tr"
        ? "Fiyat"
        : locale === "ar"
          ? "السعر"
          : locale === "es"
            ? "Precio"
            : locale === "fr"
              ? "Prix"
              : "Price",
    assetsLabel:
      locale === "tr"
        ? "Program Icerikleri"
        : locale === "ar"
          ? "محتويات البرنامج"
          : locale === "es"
            ? "Contenido del programa"
            : locale === "fr"
              ? "Contenu du programme"
              : "Program builder assets",
    previewLabel:
      locale === "tr"
        ? "Onizleme"
        : locale === "ar"
          ? "معاينة"
          : locale === "es"
            ? "Vista previa"
            : locale === "fr"
              ? "Apercu"
              : "Preview",
    recommendedEquipment:
      locale === "tr"
        ? "Onerilen Ekipman"
        : locale === "ar"
          ? "معدات مقترحة"
          : locale === "es"
            ? "Equipo recomendado"
            : locale === "fr"
              ? "Equipement recommande"
              : "Recommended equipment",
    noEquipment:
      locale === "tr"
        ? "Bu program icin ekipman gerekmiyor."
        : locale === "ar"
          ? "لا توجد معدات مطلوبة لهذا البرنامج."
          : locale === "es"
            ? "No se requiere equipo para este programa."
            : locale === "fr"
              ? "Aucun equipement requis pour ce programme."
              : "No equipment required for this program.",
    freePriceLabel:
      locale === "tr"
        ? "Ucretsiz"
        : locale === "ar"
          ? "مجاني"
          : locale === "es"
            ? "Gratis"
            : locale === "fr"
              ? "Gratuit"
              : "Free",
    freeBadge:
      locale === "tr"
        ? "UCRETSIZ"
        : locale === "ar"
          ? "مجاني"
          : locale === "es"
            ? "GRATIS"
            : locale === "fr"
              ? "GRATUIT"
              : "FREE",
    premiumLockedHint:
      locale === "tr"
        ? "Premium"
        : locale === "ar"
          ? "بريميوم"
          : locale === "es"
            ? "Premium"
            : locale === "fr"
              ? "Premium"
              : "Premium",
    signUpToUnlockFree:
      locale === "tr"
        ? "Ucretsiz hesap olustur"
        : locale === "ar"
          ? "انشئ حساباً مجانياً"
          : locale === "es"
            ? "Crear cuenta gratis"
            : locale === "fr"
              ? "Créer un compte gratuit"
              : "Create Free Account",
    logInToUnlockFree:
      locale === "tr"
        ? "Giris yap ve ac"
        : locale === "ar"
          ? "سجّل الدخول لفتح المحتوى"
          : locale === "es"
            ? "Inicia sesion para desbloquear"
            : locale === "fr"
              ? "Connectez-vous pour debloquer"
              : "Sign in to unlock",
    freeContentTeaserTitle:
      locale === "tr"
        ? "Tam plan hesabinizla acilir"
        : locale === "ar"
          ? "الخطة الكاملة متاحة بعد تسجيل الدخول"
          : locale === "es"
            ? "El plan completo se desbloquea con tu cuenta"
            : locale === "fr"
              ? "Le plan complet est debloque avec votre compte"
              : "Full plan unlocks with your free account",
    freeContentTeaserBody:
      locale === "tr"
        ? "Asagidaki tam antrenman ve diyet detaylarini gormek icin ucretsiz kayit olun."
        : locale === "ar"
          ? "سجّل مجاناً لعرض تفاصيل التمارين والوجبات الكاملة أدناه."
          : locale === "es"
            ? "Registrate gratis para ver los detalles completos de entrenamiento y comidas."
            : locale === "fr"
              ? "Inscrivez-vous gratuitement pour voir le detail complet des entrainements et repas."
              : "Create a free TJFit account to view the full workouts and meal plans below.",
    paidPreviewTitle:
      locale === "tr"
        ? "Tam icerik satin alindiginda acilir"
        : locale === "ar"
          ? "المحتوى الكامل بعد الشراء"
          : locale === "es"
            ? "Contenido completo al comprar"
            : locale === "fr"
              ? "Contenu complet apres achat"
              : "Unlock the full program",
    paidPreviewSubtitle:
      locale === "tr"
        ? "Odemeyi tamamlayarak tum haftalari, ilerlemeyi ve varliklari acin."
        : locale === "ar"
          ? "أكمل الدفع لفتح كل الأسابيع والتقدم والمواد."
          : locale === "es"
            ? "Completa el pago para desbloquear todas las semanas y materiales."
            : locale === "fr"
              ? "Finalisez le paiement pour debloquer toutes les semaines et ressources."
              : "Complete checkout to unlock every week, progression block, and asset.",
    goToCheckout:
      locale === "tr"
        ? "Odemeye git"
        : locale === "ar"
          ? "الانتقال للدفع"
          : locale === "es"
            ? "Ir al pago"
            : locale === "fr"
              ? "Aller au paiement"
              : "Go to checkout",
    youHaveFullAccess:
      locale === "tr"
        ? "Tam erisim aktif"
        : locale === "ar"
          ? "وصول كامل مفعّل"
          : locale === "es"
            ? "Acceso completo activo"
            : locale === "fr"
              ? "Acces complet actif"
              : "You have full access",
    paymentSuccessBanner:
      locale === "tr"
        ? "Odeme basarili — tam erisim acildi."
        : locale === "ar"
          ? "تم الدفع بنجاح — يمكنك الآن الوصول الكامل."
          : locale === "es"
            ? "Pago correcto — ya tienes acceso completo."
            : locale === "fr"
              ? "Paiement reussi — acces complet debloque."
              : "Payment successful — you now have full access.",
    dismissNotice:
      locale === "tr"
        ? "Kapat"
        : locale === "ar"
          ? "اغلاق"
          : locale === "es"
            ? "Cerrar"
            : locale === "fr"
              ? "Fermer"
              : "Dismiss",
    languageOptionsLabel:
      locale === "tr"
        ? "Dil secenekleri"
        : locale === "ar"
          ? "خيارات اللغة"
          : locale === "es"
            ? "Opciones de idioma"
            : locale === "fr"
              ? "Options de langue"
              : "Language options",
    programKindPremium:
      locale === "tr"
        ? "TJFit Premium Program"
        : locale === "ar"
          ? "برنامج تي جي فيت بريميوم"
          : locale === "es"
            ? "Programa Premium TJFit"
            : locale === "fr"
              ? "Programme Premium TJFit"
              : "TJFit Premium Program",
    programKindFree:
      locale === "tr"
        ? "TJFit Ucretsiz Baslangic"
        : locale === "ar"
          ? "بداية مجانية من تي جي فيت"
          : locale === "es"
            ? "Inicio gratuito TJFit"
            : locale === "fr"
              ? "Demarrage gratuit TJFit"
              : "TJFit Free Starter",
    brandedModule:
      locale === "tr"
        ? "TJFit modulu"
        : locale === "ar"
          ? "وحدة تي جي فيت"
          : locale === "es"
            ? "Modulo TJFit"
            : locale === "fr"
              ? "Module TJFit"
              : "TJFit branded module",
    upgradeSectionTitle:
      locale === "tr"
        ? "Tam surume yukselt"
        : locale === "ar"
          ? "ترقية إلى النسخة الكاملة"
          : locale === "es"
            ? "Pasar al plan completo"
            : locale === "fr"
              ? "Passer au programme complet"
              : "Upgrade to the full experience",
    previewSectionNotice:
      locale === "tr"
        ? "Onizleme — tam icerik asagida"
        : locale === "ar"
          ? "معاينة — المحتوى الكامل أدناه"
          : locale === "es"
            ? "Vista previa — el contenido completo esta abajo"
            : locale === "fr"
              ? "Apercu — contenu complet ci-dessous"
              : "Preview — full content below",
    blueprintTitle:
      locale === "tr"
        ? "Program plani"
        : locale === "ar"
          ? "مخطط البرنامج"
          : locale === "es"
            ? "Plan del programa"
            : locale === "fr"
              ? "Plan du programme"
              : "Program Blueprint",
    blueprintGoal:
      locale === "tr"
        ? "Hedef"
        : locale === "ar"
          ? "الهدف"
          : locale === "es"
            ? "Objetivo"
            : locale === "fr"
              ? "Objectif"
              : "Goal",
    blueprintLevel:
      locale === "tr"
        ? "Seviye"
        : locale === "ar"
          ? "المستوى"
          : locale === "es"
            ? "Nivel"
            : locale === "fr"
              ? "Niveau"
              : "Level",
    blueprintEquipment:
      locale === "tr"
        ? "Ekipman"
        : locale === "ar"
          ? "المعدات"
          : locale === "es"
            ? "Equipo"
            : locale === "fr"
              ? "Equipement"
              : "Equipment",
    blueprintTrainingDays:
      locale === "tr"
        ? "Antrenman gunleri"
        : locale === "ar"
          ? "ايام التدريب"
          : locale === "es"
            ? "Dias de entrenamiento"
            : locale === "fr"
              ? "Jours d'entrainement"
              : "Training Days",
    blueprintConditioning:
      locale === "tr"
        ? "Kondisyon ve toparlanma"
        : locale === "ar"
          ? "اللياقة والتعافي"
          : locale === "es"
            ? "Condicion y recuperacion"
            : locale === "fr"
              ? "Conditionnement et recuperation"
              : "Conditioning and Recovery",
    blueprintSafety:
      locale === "tr"
        ? "Guvenlik"
        : locale === "ar"
          ? "السلامة"
          : locale === "es"
            ? "Seguridad"
            : locale === "fr"
              ? "Securite"
              : "Safety",
    autoTranslatedPdf:
      locale === "tr"
        ? "Otomatik cevrilmis PDF icerigi"
        : locale === "ar"
          ? "محتوى PDF مترجم تلقائياً"
          : locale === "es"
            ? "Contenido PDF traducido automaticamente"
            : locale === "fr"
              ? "Contenu PDF traduit automatiquement"
              : "Auto-Translated PDF Content",
    downloadUploadedPdf:
      locale === "tr"
        ? "Yuklenen PDF'i indir"
        : locale === "ar"
          ? "تنزيل PDF المرفوع"
          : locale === "es"
            ? "Descargar PDF subido"
            : locale === "fr"
              ? "Telecharger le PDF televerse"
              : "Download Uploaded PDF",
    workoutWarmupLabel:
      locale === "tr"
        ? "Isinma"
        : locale === "ar"
          ? "احماء"
          : locale === "es"
            ? "Calentamiento"
            : locale === "fr"
              ? "Echauffement"
              : "Warm-up",
    workoutMainLabel:
      locale === "tr"
        ? "Ana bolum"
        : locale === "ar"
          ? "الجزء الرئيسي"
          : locale === "es"
            ? "Bloque principal"
            : locale === "fr"
              ? "Bloc principal"
              : "Main",
    workoutCooldownLabel:
      locale === "tr"
        ? "Soguma"
        : locale === "ar"
          ? "تبريد"
          : locale === "es"
            ? "Enfriamiento"
            : locale === "fr"
              ? "Retour au calme"
              : "Cool-down",
    upgradeFullSystemTitle:
      locale === "tr"
        ? "Tam sisteme hazir misin?"
        : locale === "ar"
          ? "جاهز للنظام الكامل؟"
          : locale === "es"
            ? "¿Listo para el sistema completo?"
            : locale === "fr"
              ? "Prêt pour le système complet ?"
              : "Ready for the Full System?",
    upgradeViewAllPrograms:
      locale === "tr"
        ? "Tum programlari gor →"
        : locale === "ar"
          ? "عرض كل البرامج ←"
          : locale === "es"
            ? "Ver todos los programas →"
            : locale === "fr"
              ? "Voir tous les programmes →"
              : "View All Programs →",
    breadcrumbHome:
      locale === "tr"
        ? "Ana sayfa"
        : locale === "ar"
          ? "الرئيسية"
          : locale === "es"
            ? "Inicio"
            : locale === "fr"
              ? "Accueil"
              : "Home",
    breadcrumbPrograms:
      locale === "tr"
        ? "Programlar"
        : locale === "ar"
          ? "البرامج"
          : locale === "es"
            ? "Programas"
            : locale === "fr"
              ? "Programmes"
              : "Programs",
    breadcrumbDiets:
      locale === "tr"
        ? "Diyetler"
        : locale === "ar"
          ? "الأنظمة الغذائية"
          : locale === "es"
            ? "Dietas"
            : locale === "fr"
              ? "Régimes"
              : "Diets",
    backToPrograms:
      locale === "tr"
        ? "← Programlara don"
        : locale === "ar"
          ? "← العودة إلى البرامج"
          : locale === "es"
            ? "← Volver a programas"
            : locale === "fr"
              ? "← Retour aux programmes"
              : "← Back to Programs",
    backToDiets:
      locale === "tr"
        ? "← Diyetlere don"
        : locale === "ar"
          ? "← العودة إلى الأنظمة الغذائية"
          : locale === "es"
            ? "← Volver a dietas"
            : locale === "fr"
              ? "← Retour aux régimes"
              : "← Back to Diets",
    trustProgramsGrid:
      locale === "tr"
        ? "12 haftalik yapili sistem. Tahmin yok."
        : locale === "ar"
          ? "نظام 12 أسبوعاً منظم. بلا تخمين."
          : locale === "es"
            ? "Sistema estructurado de 12 semanas. Sin adivinar."
            : locale === "fr"
              ? "Système structuré sur 12 semaines. Sans improvisation."
              : "Structured 12-week system. No guesswork.",
    trustDietsGrid:
      locale === "tr"
        ? "Gunluk ogunler, makrolar ve tarifler dahil."
        : locale === "ar"
          ? "وجبات يومية وماكروس ووصفات مضمّنة."
          : locale === "es"
            ? "Comidas diarias, macros y recetas incluidas."
            : locale === "fr"
              ? "Repas quotidiens, macros et recettes inclus."
              : "Daily meals, macros, and recipes included.",
    programPageTrust:
      locale === "tr"
        ? "Yapilandirilmis 12 haftalik sistem. Tahmine yer yok."
        : locale === "ar"
          ? "نظام منظم لمدة 12 أسبوعًا. بلا تخمين."
          : locale === "es"
            ? "Sistema estructurado de 12 semanas. Sin adivinar."
            : locale === "fr"
              ? "Systeme structure sur 12 semaines. Sans improvisation."
              : "Structured 12-week system. No guesswork.",
    dietPageTrust:
      locale === "tr"
        ? "Gunluk ogunler, makrolar ve tarifler dahil."
        : locale === "ar"
          ? "وجبات يومية وماكروس ووصفات مضمّنة."
          : locale === "es"
            ? "Comidas diarias, macros y recetas incluidas."
            : locale === "fr"
              ? "Repas quotidiens, macros et recettes inclus."
              : "Daily meals, macros, and recipes included.",
    upgradeNoFluff:
      locale === "tr"
        ? "Gereksiz soz yok. Sadece sistem."
        : locale === "ar"
          ? "بلا فلسفة زائدة. النظام فقط."
          : locale === "es"
            ? "Sin relleno. Solo el sistema."
            : locale === "fr"
              ? "Pas de blabla. Juste le système."
              : "No fluff. Just the system."
  };
}

export function formatCoachCommissionLine(locale: Locale, percent: number) {
  if (locale === "tr") return `Koç %${percent} komisyon kazanir`;
  if (locale === "ar") return `المدرب يكسب ${percent}% عمولة`;
  if (locale === "es") return `El coach gana ${percent}% de comision`;
  if (locale === "fr") return `Le coach gagne ${percent}% de commission`;
  return `Coach earns ${percent}% commission`;
}

export function localizeAssetType(assetType: Program["assets"][number]["type"], locale: Locale) {
  if (locale === "tr") {
    if (assetType === "exercise-video") return "Egzersiz Videosu";
    if (assetType === "workout-schedule") return "Antrenman Plani";
    if (assetType === "pdf-guide") return "PDF Rehber";
    return "Beslenme Plani";
  }
  if (locale === "ar") {
    if (assetType === "exercise-video") return "فيديو التمارين";
    if (assetType === "workout-schedule") return "جدول التدريب";
    if (assetType === "pdf-guide") return "دليل PDF";
    return "خطة التغذية";
  }
  if (locale === "es") {
    if (assetType === "exercise-video") return "Video de Ejercicios";
    if (assetType === "workout-schedule") return "Calendario de Entrenamiento";
    if (assetType === "pdf-guide") return "Guia PDF";
    return "Plan de Nutricion";
  }
  if (locale === "fr") {
    if (assetType === "exercise-video") return "Video d'Exercices";
    if (assetType === "workout-schedule") return "Planning d'Entrainement";
    if (assetType === "pdf-guide") return "Guide PDF";
    return "Plan Nutrition";
  }

  if (assetType === "exercise-video") return "Exercise Video";
  if (assetType === "workout-schedule") return "Workout Schedule";
  if (assetType === "pdf-guide") return "PDF Guide";
  return "Nutrition Plan";
}
