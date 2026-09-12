import type { Locale } from "@/lib/i18n";

type ResultViewCopy = {
  overview: string; calorieNote: string; planNote: string; logNote: string;
  forecast: string; projected: string; baseline: string; week: string; kgWeek: string; duration: string;
  macroSplit: string; startingFat: string; projectedFat: string; checkpoints: string; checkins: string[];
  review: string; reviewNote: string; groceryLoading: string; groceryGenerate: string; generating: string;
  mealPrepGenerate: string; pdfLoading: string; pdfDownload: string; refeed: string; breaker: string;
  swap: string; hideRecipe: string; viewRecipe: string; prep: string; cook: string; fundamentals: string;
  seconds: string; groups: [string, string, string]; hide: string; show: string; alreadyUsing: string;
  flexibleMeal: string; when: string; grocery: string; quantities: string; chooseMeal: string; keepMeal: string;
  shareTitle: string; stories: string; square: string; downloadCard: string; copyImage: string;
  planTitle: string; shareTagline: string; createAt: string; perDay: string;
};

export const RESULT_VIEW_COPY: Record<Locale, ResultViewCopy> = {
  en: {
    overview: "Plan overview", calorieNote: "Your current energy target is {value} kcal. Treat this as an estimate and review your logged trends.", planNote: "Review the training days, meal portions and preparation notes in your plan.", logNote: "Record what you actually do and eat so future reviews reflect your routine.",
    forecast: "Estimated weight trajectory", projected: "Estimate", baseline: "Starting weight reference", week: "Week", kgWeek: "kg/week", duration: "approximately {value} weeks",
    macroSplit: "Macro split", startingFat: "Starting body fat estimate", projectedFat: "Projected body fat estimate", checkpoints: "Progress check-ins", checkins: ["Week 2: Review how the routine fits your schedule.", "Week 6: Review your workout, food and bodyweight logs.", "Week 12: Review your progress and choose your next steps."],
    review: "Review your progress", reviewNote: "Weight and performance can vary from week to week. Use several weeks of logged trends to review your plan; the chart is an estimate, not a promised outcome.",
    groceryLoading: "Building your grocery list…", groceryGenerate: "Generate grocery list", generating: "Generating…", mealPrepGenerate: "Generate meal prep guide", pdfLoading: "Generating PDF…", pdfDownload: "Download my plan (PDF)", refeed: "Refeed", breaker: "Plateau adjustment", swap: "Swap", hideRecipe: "Hide recipe", viewRecipe: "View recipe", prep: "Prep", cook: "Cook", fundamentals: "Fitness fundamentals — start here", seconds: "s", groups: ["Group 1", "Group 2", "Group 3"], hide: "Hide", show: "Show", alreadyUsing: "Already using", flexibleMeal: "Flexible meal strategy", when: "When", grocery: "Grocery list", quantities: "Quantities are for one person. Adjust for additional servings.", chooseMeal: "Choose this meal", keepMeal: "Keep original meal",
    shareTitle: "Share your plan", stories: "Stories", square: "Square", downloadCard: "Download card", copyImage: "Copy image", planTitle: "My TJAI plan", shareTagline: "Fitness planning with TJAI", createAt: "Create your plan at", perDay: "kcal/day"
  },
  tr: {
    overview: "Plana genel bakış", calorieNote: "Mevcut enerji hedefin {value} kcal. Bunu tahmin olarak değerlendir ve kayıtlarındaki eğilimleri incele.", planNote: "Planındaki antrenman günlerini, öğün porsiyonlarını ve hazırlık notlarını incele.", logNote: "Gelecekteki değerlendirmelerin rutinini yansıtması için gerçekten yaptıklarını ve yediklerini kaydet.",
    forecast: "Tahmini ağırlık seyri", projected: "Tahmin", baseline: "Başlangıç ağırlığı referansı", week: "Hafta", kgWeek: "kg/hafta", duration: "yaklaşık {value} hafta",
    macroSplit: "Makro dağılımı", startingFat: "Başlangıç yağ oranı tahmini", projectedFat: "Öngörülen yağ oranı tahmini", checkpoints: "İlerleme kontrolleri", checkins: ["2. hafta: Rutinin programına nasıl uyduğunu değerlendir.", "6. hafta: Antrenman, beslenme ve vücut ağırlığı kayıtlarını incele.", "12. hafta: İlerlemeni değerlendir ve sonraki adımlarını seç."],
    review: "İlerlemeni değerlendir", reviewNote: "Ağırlık ve performans haftadan haftaya değişebilir. Planını birkaç haftalık kayıt eğilimine göre değerlendir; grafik bir tahmindir, sonuç sözü değildir.",
    groceryLoading: "Alışveriş listen hazırlanıyor…", groceryGenerate: "Alışveriş listesi oluştur", generating: "Oluşturuluyor…", mealPrepGenerate: "Öğün hazırlık rehberi oluştur", pdfLoading: "PDF oluşturuluyor…", pdfDownload: "Planımı indir (PDF)", refeed: "Enerji artırma günü", breaker: "Duraklama düzenlemesi", swap: "Değiştir", hideRecipe: "Tarifi gizle", viewRecipe: "Tarifi görüntüle", prep: "Hazırlık", cook: "Pişirme", fundamentals: "Fitness temelleri — buradan başla", seconds: "sn", groups: ["Grup 1", "Grup 2", "Grup 3"], hide: "Gizle", show: "Göster", alreadyUsing: "Zaten kullanılıyor", flexibleMeal: "Esnek öğün stratejisi", when: "Zaman", grocery: "Alışveriş listesi", quantities: "Miktarlar bir kişiliktir. Ek porsiyonlar için ayarla.", chooseMeal: "Bu öğünü seç", keepMeal: "Mevcut öğünü koru",
    shareTitle: "Planını paylaş", stories: "Hikâye", square: "Kare", downloadCard: "Kartı indir", copyImage: "Görseli kopyala", planTitle: "TJAI planım", shareTagline: "TJAI ile fitness planlama", createAt: "Planını oluştur:", perDay: "kcal/gün"
  },
  ar: {
    overview: "نظرة عامة على الخطة", calorieNote: "هدف الطاقة الحالي هو {value} kcal. اعتبره تقديراً وراجع الاتجاهات في سجلاتك.", planNote: "راجع أيام التدريب وحصص الوجبات وملاحظات التحضير في خطتك.", logNote: "سجّل ما تفعله وتأكله فعلاً حتى تعكس المراجعات اللاحقة روتينك.",
    forecast: "المسار التقديري للوزن", projected: "تقدير", baseline: "الوزن الابتدائي المرجعي", week: "الأسبوع", kgWeek: "kg/أسبوع", duration: "نحو {value} أسبوعاً",
    macroSplit: "توزيع المغذيات الكبرى", startingFat: "تقدير نسبة الدهون الابتدائية", projectedFat: "تقدير نسبة الدهون المستقبلية", checkpoints: "مراجعات التقدم", checkins: ["الأسبوع 2: راجع مدى ملاءمة الروتين لجدولك.", "الأسبوع 6: راجع سجلات التدريب والطعام ووزن الجسم.", "الأسبوع 12: راجع تقدمك واختر خطواتك التالية."],
    review: "راجع تقدمك", reviewNote: "قد يختلف الوزن والأداء من أسبوع إلى آخر. راجع خطتك باستخدام اتجاهات سجّلتها لعدة أسابيع؛ الرسم تقديري ولا يضمن نتيجة.",
    groceryLoading: "جارٍ إعداد قائمة التسوق…", groceryGenerate: "إنشاء قائمة تسوق", generating: "جارٍ الإنشاء…", mealPrepGenerate: "إنشاء دليل تحضير الوجبات", pdfLoading: "جارٍ إنشاء PDF…", pdfDownload: "تنزيل خطتي (PDF)", refeed: "زيادة الطاقة", breaker: "تعديل عند ثبات التقدم", swap: "استبدال", hideRecipe: "إخفاء الوصفة", viewRecipe: "عرض الوصفة", prep: "التحضير", cook: "الطهي", fundamentals: "أساسيات اللياقة — ابدأ هنا", seconds: "ث", groups: ["المجموعة 1", "المجموعة 2", "المجموعة 3"], hide: "إخفاء", show: "عرض", alreadyUsing: "مستخدم بالفعل", flexibleMeal: "استراتيجية الوجبة المرنة", when: "الموعد", grocery: "قائمة التسوق", quantities: "الكميات لشخص واحد. عدّلها للحصص الإضافية.", chooseMeal: "اختيار هذه الوجبة", keepMeal: "الإبقاء على الوجبة الأصلية",
    shareTitle: "شارك خطتك", stories: "قصة", square: "مربع", downloadCard: "تنزيل البطاقة", copyImage: "نسخ الصورة", planTitle: "خطتي من TJAI", shareTagline: "تخطيط اللياقة مع TJAI", createAt: "أنشئ خطتك على", perDay: "kcal/يوم"
  },
  es: {
    overview: "Resumen del plan", calorieNote: "Tu objetivo energético actual es de {value} kcal. Trátalo como una estimación y revisa las tendencias registradas.", planNote: "Revisa los días de entrenamiento, las porciones y las notas de preparación de tu plan.", logNote: "Registra lo que realmente haces y comes para que las próximas revisiones reflejen tu rutina.",
    forecast: "Trayectoria de peso estimada", projected: "Estimación", baseline: "Referencia del peso inicial", week: "Semana", kgWeek: "kg/semana", duration: "aproximadamente {value} semanas",
    macroSplit: "Distribución de macros", startingFat: "Grasa corporal inicial estimada", projectedFat: "Grasa corporal futura estimada", checkpoints: "Revisiones de progreso", checkins: ["Semana 2: Revisa cómo encaja la rutina en tu horario.", "Semana 6: Revisa tus registros de entrenamiento, comida y peso.", "Semana 12: Revisa tu progreso y elige los siguientes pasos."],
    review: "Revisa tu progreso", reviewNote: "El peso y el rendimiento pueden variar entre semanas. Revisa tu plan con varias semanas de registros; el gráfico es una estimación, no un resultado prometido.",
    groceryLoading: "Preparando tu lista de compra…", groceryGenerate: "Generar lista de compra", generating: "Generando…", mealPrepGenerate: "Generar guía de preparación", pdfLoading: "Generando PDF…", pdfDownload: "Descargar mi plan (PDF)", refeed: "Aumento de energía", breaker: "Ajuste de estancamiento", swap: "Cambiar", hideRecipe: "Ocultar receta", viewRecipe: "Ver receta", prep: "Preparación", cook: "Cocción", fundamentals: "Fundamentos de fitness — empieza aquí", seconds: "s", groups: ["Grupo 1", "Grupo 2", "Grupo 3"], hide: "Ocultar", show: "Mostrar", alreadyUsing: "Ya en uso", flexibleMeal: "Estrategia de comida flexible", when: "Cuándo", grocery: "Lista de compra", quantities: "Cantidades para una persona. Ajusta para más raciones.", chooseMeal: "Elegir esta comida", keepMeal: "Mantener la comida original",
    shareTitle: "Comparte tu plan", stories: "Historia", square: "Cuadrado", downloadCard: "Descargar tarjeta", copyImage: "Copiar imagen", planTitle: "Mi plan TJAI", shareTagline: "Planificación de fitness con TJAI", createAt: "Crea tu plan en", perDay: "kcal/día"
  },
  fr: {
    overview: "Aperçu du plan", calorieNote: "Ton objectif énergétique actuel est de {value} kcal. Considère-le comme une estimation et examine tes tendances enregistrées.", planNote: "Consulte les jours d’entraînement, les portions et les notes de préparation de ton plan.", logNote: "Note ce que tu fais et manges réellement pour que les prochaines révisions reflètent ta routine.",
    forecast: "Trajectoire de poids estimée", projected: "Estimation", baseline: "Référence du poids initial", week: "Semaine", kgWeek: "kg/semaine", duration: "environ {value} semaines",
    macroSplit: "Répartition des macros", startingFat: "Masse grasse initiale estimée", projectedFat: "Masse grasse future estimée", checkpoints: "Bilans de progression", checkins: ["Semaine 2 : vérifie si la routine s’adapte à ton emploi du temps.", "Semaine 6 : consulte tes journaux d’entraînement, de repas et de poids.", "Semaine 12 : fais le bilan et choisis les prochaines étapes."],
    review: "Évalue ta progression", reviewNote: "Le poids et les performances peuvent varier selon les semaines. Évalue ton plan avec plusieurs semaines de données ; le graphique est une estimation, pas un résultat promis.",
    groceryLoading: "Préparation de ta liste de courses…", groceryGenerate: "Créer une liste de courses", generating: "Création…", mealPrepGenerate: "Créer un guide de préparation", pdfLoading: "Création du PDF…", pdfDownload: "Télécharger mon plan (PDF)", refeed: "Apport énergétique accru", breaker: "Ajustement de stagnation", swap: "Remplacer", hideRecipe: "Masquer la recette", viewRecipe: "Voir la recette", prep: "Préparation", cook: "Cuisson", fundamentals: "Bases du fitness — commence ici", seconds: "s", groups: ["Groupe 1", "Groupe 2", "Groupe 3"], hide: "Masquer", show: "Afficher", alreadyUsing: "Déjà utilisé", flexibleMeal: "Stratégie de repas flexible", when: "Quand", grocery: "Liste de courses", quantities: "Quantités pour une personne. Ajuste pour des portions supplémentaires.", chooseMeal: "Choisir ce repas", keepMeal: "Garder le repas initial",
    shareTitle: "Partage ton plan", stories: "Story", square: "Carré", downloadCard: "Télécharger la carte", copyImage: "Copier l’image", planTitle: "Mon plan TJAI", shareTagline: "Planification de fitness avec TJAI", createAt: "Crée ton plan sur", perDay: "kcal/jour"
  }
};

export function localizedPlanDuration(value: string, locale: Locale): string {
  const match = /^approximately (\d+(?:[-–]\d+)?) weeks$/i.exec(value.trim());
  return match ? RESULT_VIEW_COPY[locale].duration.replace("{value}", match[1]) : value;
}

type ProgressViewCopy = {
  weight: string; fat: string; weightTrend: string; fatTrend: string; waist: string; chest: string; hips: string;
  sets: string; reps: string; minutes: string; metricsSaved: string; workoutSaved: string; milestoneAdded: string; milestoneDone: string;
};
export const PROGRESS_VIEW_COPY: Record<Locale, ProgressViewCopy> = {
  en: { weight: "Weight", fat: "Body fat", weightTrend: "Weight trend", fatTrend: "Body fat trend", waist: "Waist", chest: "Chest", hips: "Hips", sets: "sets", reps: "reps", minutes: "min", metricsSaved: "Measurements saved", workoutSaved: "Workout logged", milestoneAdded: "Milestone added", milestoneDone: "Milestone completed" },
  tr: { weight: "Ağırlık", fat: "Vücut yağı", weightTrend: "Ağırlık eğilimi", fatTrend: "Vücut yağı eğilimi", waist: "Bel", chest: "Göğüs", hips: "Kalça", sets: "set", reps: "tekrar", minutes: "dk", metricsSaved: "Ölçümler kaydedildi", workoutSaved: "Antrenman kaydedildi", milestoneAdded: "Hedef eklendi", milestoneDone: "Hedef tamamlandı" },
  ar: { weight: "الوزن", fat: "دهون الجسم", weightTrend: "اتجاه الوزن", fatTrend: "اتجاه دهون الجسم", waist: "الخصر", chest: "الصدر", hips: "الوركين", sets: "مجموعات", reps: "تكرارات", minutes: "دقيقة", metricsSaved: "تم حفظ القياسات", workoutSaved: "تم تسجيل التدريب", milestoneAdded: "تمت إضافة هدف", milestoneDone: "تم إكمال الهدف" },
  es: { weight: "Peso", fat: "Grasa corporal", weightTrend: "Tendencia del peso", fatTrend: "Tendencia de grasa corporal", waist: "Cintura", chest: "Pecho", hips: "Caderas", sets: "series", reps: "repeticiones", minutes: "min", metricsSaved: "Medidas guardadas", workoutSaved: "Entrenamiento registrado", milestoneAdded: "Hito añadido", milestoneDone: "Hito completado" },
  fr: { weight: "Poids", fat: "Masse grasse", weightTrend: "Évolution du poids", fatTrend: "Évolution de la masse grasse", waist: "Taille", chest: "Poitrine", hips: "Hanches", sets: "séries", reps: "répétitions", minutes: "min", metricsSaved: "Mesures enregistrées", workoutSaved: "Entraînement enregistré", milestoneAdded: "Étape ajoutée", milestoneDone: "Étape terminée" }
};

/** Date-only logs retain their calendar day regardless of browser timezone. */
export function localizedLogDate(value: string, locale: Locale, now = new Date()): string {
  const day = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (!Number.isFinite(day.getTime())) return value;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const logged = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
  const days = Math.round((logged - today) / 86_400_000);
  if (Math.abs(days) < 7) return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(day);
}
