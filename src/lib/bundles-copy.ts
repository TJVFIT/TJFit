import { resolveCopyLocale } from "@/lib/i18n";
import type { BundleGoal } from "@/lib/bundles";

/**
 * Localized copy for the /bundles listing page + bundle grid.
 *
 * The bundle *content* (names, hooks, phases, sample days) still lives in
 * English inside src/lib/bundles.ts — translating that catalogue is a
 * separate queued task. This module covers the page chrome only:
 * headings, filter chips, card labels, CTAs, footnotes, and a11y strings.
 */

type FilterKey = "all" | BundleGoal;

export type BundleDetailCopy = {
  startProgram: string;
  startProgramAria: (name: string) => string;
  sectionNavAria: string;
  weekLabel: string;
  metaFallbackTitle: string;
  backToAll: string;
  askTjai: string;
  shareAria: (name: string) => string;
  atAGlance: string;
  rowTraining: string;
  rowDiet: string;
  sessionsValueLong: (n: number) => string;
  trainingFrameworkEyebrow: string;
  trainingFrameworkTitle: string;
  sampleSessionEyebrow: string;
  sampleSessionNote: string;
  nutritionEyebrow: string;
  nutritionStyle: string;
  nutritionProtein: string;
  nutritionCalorie: string;
  sampleDayEyebrow: string;
  sampleDayTitle: string;
  sampleDayNote: string;
  readyEyebrow: string;
  readyTitle: string;
  accessEyebrow: string;
  accessTitle: string;
  downloadDossierAria: string;
  shareIdle: string;
  shareShared: string;
  shareCopied: string;
  moreBundlesTitle: string;
  /* Newly-added rich-content sections */
  weeklyTemplateEyebrow: string;
  weeklyTemplateTitle: string;
  weeklyTemplateNote: string;
  progressionEyebrow: string;
  progressionTitle: string;
  progressionLoading: string;
  progressionIntensity: string;
  warmupTitle: string;
  cooldownTitle: string;
  equipmentEyebrow: string;
  equipmentTitle: string;
  recipesEyebrow: string;
  recipesTitle: string;
  recipesNote: string;
  recipeIngredients: string;
  recipeSteps: string;
  recipeKcal: string;
  recipeProtein: string;
  recipeCarbs: string;
  recipeFat: string;
  recipeTime: string;
  mealTypeLabels: Record<"breakfast" | "lunch" | "dinner" | "snack" | "shake", string>;
  groceryEyebrow: string;
  groceryTitle: string;
  groceryNote: string;
};

export type BundlesCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: (count: number) => string;
  lead: string;
  coachEyebrow: string;
  coachBody: string;
  filterAria: string;
  filterLabels: Record<FilterKey, string>;
  emptyFilter: string;
  duration: string;
  sessions: string;
  weeksValue: (n: number) => string;
  sessionsValue: (n: number) => string;
  download: string;
  details: string;
  buy: string;
  free: string;
  getFree: string;
  processing: string;
  footnoteFree: string;
  footnotePaid: string;
  goalAria: (label: string) => string;
  priceAria: (save: string) => string;
  downloadAria: (name: string) => string;
  detailsAria: (name: string) => string;
  detail: BundleDetailCopy;
  /** Copy for the bundles-catalog teaser section on the homepage. */
  homeTeaser: {
    eyebrow: string;
    body: string;
    cta: (count: number) => string;
  };
};

const COPY: Record<"en" | "tr" | "ar" | "es" | "fr", BundlesCopy> = {
  en: {
    metaTitle: "Program Bundles · TJFit",
    metaDescription:
      "Twelve 12-week training + diet bundles, delivered as branded PDF dossiers. Train smarter, eat sharper.",
    eyebrow: "Bundles",
    title: (count) => `${count} bundles. One way to train.`,
    lead: "Each bundle pairs a 12-week training protocol with a matching diet system, delivered as a branded PDF dossier. Pick the goal — we built the rest.",
    coachEyebrow: "Using your bundle",
    coachBody:
      "Your bundle includes training and nutrition PDFs for your personal use. You may download and print your copy. Resale, redistribution and rebranding are not included in the personal-use license.",
    filterAria: "Filter bundles by goal",
    filterLabels: {
      all: "All",
      "fat-loss": "Cut",
      "muscle-gain": "Build",
      recomp: "Recomp",
      strength: "Strength",
      conditioning: "Conditioning",
      foundation: "Start"
    },
    emptyFilter: "No bundles match this filter yet.",
    duration: "Duration",
    sessions: "Sessions",
    weeksValue: (n) => `${n} weeks`,
    sessionsValue: (n) => `${n}×/wk`,
    download: "Download PDF",
    details: "Details",
    buy: "Buy",
    free: "Free",
    getFree: "Get free",
    processing: "Processing…",
    footnoteFree: "Free with sign-in · branded dossier · A4 print-ready",
    footnotePaid: "Sign in required · branded dossier · A4 print-ready",
    goalAria: (label) => `Goal: ${label}`,
    priceAria: (save) => `Price: ${save}`,
    downloadAria: (name) => `Download ${name} PDF`,
    detailsAria: (name) => `Open ${name} details`,
    detail: {
      startProgram: "Start Program",
      startProgramAria: (name) => `Start ${name}`,
      sectionNavAria: "On this page",
      weekLabel: "Week",
      metaFallbackTitle: "Bundle · TJFit",
      backToAll: "All bundles",
      askTjai: "Ask TJAI which to pick",
      shareAria: (name) => `Share ${name}`,
      atAGlance: "At a glance",
      rowTraining: "Training",
      rowDiet: "Diet",
      sessionsValueLong: (n) => `${n} per week`,
      trainingFrameworkEyebrow: "Training framework",
      trainingFrameworkTitle: "Three phases, twelve weeks.",
      sampleSessionEyebrow: "Sample session",
      sampleSessionNote:
        "A representative session from the program. Loads scale to your level.",
      nutritionEyebrow: "Nutrition framework",
      nutritionStyle: "Style",
      nutritionProtein: "Protein target",
      nutritionCalorie: "Calorie bias",
      sampleDayEyebrow: "Sample day of eating",
      sampleDayTitle: "What a real day looks like",
      sampleDayNote:
        "Adjust portions to hit your targets. A template, not a prescription.",
      readyEyebrow: "Ready to start",
      readyTitle: "Download the dossier and run it today.",
      accessEyebrow: "Bundle access",
      accessTitle: "Review availability and sign-in options.",
      downloadDossierAria: "Download bundle PDF",
      shareIdle: "Share",
      shareShared: "Shared",
      shareCopied: "Link copied!",
      moreBundlesTitle: "More bundles",
      weeklyTemplateEyebrow: "Weekly template",
      weeklyTemplateTitle: "Your training week, mapped",
      weeklyTemplateNote: "One row per training day. Repeat across the 12 weeks; the loading scheme below evolves.",
      progressionEyebrow: "Progression",
      progressionTitle: "How loads evolve over 12 weeks",
      progressionLoading: "Loading",
      progressionIntensity: "Intensity cue",
      warmupTitle: "Warm-up",
      cooldownTitle: "Cool-down",
      equipmentEyebrow: "Equipment",
      equipmentTitle: "What you'll need",
      recipesEyebrow: "Recipe library",
      recipesTitle: "Six meals that match this diet",
      recipesNote: "Picked to hit the macros above without spending all day in the kitchen.",
      recipeIngredients: "Ingredients",
      recipeSteps: "Method",
      recipeKcal: "kcal",
      recipeProtein: "P",
      recipeCarbs: "C",
      recipeFat: "F",
      recipeTime: "Time",
      mealTypeLabels: {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack",
        shake: "Shake"
      },
      groceryEyebrow: "Weekly grocery list",
      groceryTitle: "One trip, one cart",
      groceryNote: "Built to cover the recipes above for a single training week. Scale 0.75-1.25× to your bodyweight."
    },
    homeTeaser: {
      eyebrow: "Catalog",
      body: "Each bundle pairs a 12-week training protocol with a matching diet system, delivered as a branded PDF dossier. Free with sign-in.",
      cta: (count) => `Browse ${count} bundles`
    }
  },
  tr: {
    metaTitle: "Program Paketleri · TJFit",
    metaDescription:
      "On iki adet 12 haftalık antrenman + diyet paketi, markalı PDF dosyaları olarak. Daha akıllı antrenman, daha net beslenme.",
    eyebrow: "Paketler",
    title: (count) => `${count} paket. Tek bir antrenman yolu.`,
    lead: "Her paket, 12 haftalık bir antrenman protokolünü uyumlu bir diyet sistemiyle eşleştirir ve markalı bir PDF dosyası olarak sunulur. Hedefi seç — gerisini biz kurduk.",
    coachEyebrow: "Paketini kullanma",
    coachBody:
      "Paketin, kişisel kullanımın için antrenman ve beslenme PDF’leri içerir. Kopyanı indirebilir ve yazdırabilirsin. Kişisel kullanım lisansı yeniden satış, yeniden dağıtım veya yeniden markalamayı kapsamaz.",
    filterAria: "Paketleri hedefe göre filtrele",
    filterLabels: {
      all: "Tümü",
      "fat-loss": "Yağ yak",
      "muscle-gain": "Kas yap",
      recomp: "Rekomp",
      strength: "Güç",
      conditioning: "Kondisyon",
      foundation: "Başlangıç"
    },
    emptyFilter: "Bu filtreye uyan paket henüz yok.",
    duration: "Süre",
    sessions: "Seans",
    weeksValue: (n) => `${n} hafta`,
    sessionsValue: (n) => `${n}×/hafta`,
    download: "PDF indir",
    details: "Detaylar",
    buy: "Satın al",
    free: "Ücretsiz",
    getFree: "Ücretsiz al",
    processing: "İşleniyor…",
    footnoteFree: "Girişle ücretsiz · markalı dosya · A4 baskıya hazır",
    footnotePaid: "Giriş gerekli · markalı dosya · A4 baskıya hazır",
    goalAria: (label) => `Hedef: ${label}`,
    priceAria: (save) => `Fiyat: ${save}`,
    downloadAria: (name) => `${name} PDF dosyasını indir`,
    detailsAria: (name) => `${name} detaylarını aç`,
    detail: {
      startProgram: "Programı başlat",
      startProgramAria: (name) => `${name} programını başlat`,
      sectionNavAria: "Bu sayfada",
      weekLabel: "Hafta",
      metaFallbackTitle: "Paket · TJFit",
      backToAll: "Tüm paketler",
      askTjai: "Hangisini seçeceğini TJAI'ye sor",
      shareAria: (name) => `${name} paketini paylaş`,
      atAGlance: "Bir bakışta",
      rowTraining: "Antrenman",
      rowDiet: "Diyet",
      sessionsValueLong: (n) => `Haftada ${n}`,
      trainingFrameworkEyebrow: "Antrenman çerçevesi",
      trainingFrameworkTitle: "Üç faz, on iki hafta.",
      sampleSessionEyebrow: "Örnek seans",
      sampleSessionNote:
        "Programdan temsili bir seans. Yükler seviyene göre ölçeklenir.",
      nutritionEyebrow: "Beslenme çerçevesi",
      nutritionStyle: "Tarz",
      nutritionProtein: "Protein hedefi",
      nutritionCalorie: "Kalori eğilimi",
      sampleDayEyebrow: "Örnek beslenme günü",
      sampleDayTitle: "Gerçek bir gün nasıl görünür",
      sampleDayNote:
        "Porsiyonları hedeflerine göre ayarla. Bir reçete değil, bir şablon.",
      readyEyebrow: "Başlamaya hazır",
      readyTitle: "Dosyayı indir ve bugün uygulamaya başla.",
      accessEyebrow: "Pakete erişim",
      accessTitle: "Erişim durumunu ve giriş seçeneklerini incele.",
      downloadDossierAria: "Paket PDF'sini indir",
      shareIdle: "Paylaş",
      shareShared: "Paylaşıldı",
      shareCopied: "Bağlantı kopyalandı!",
      moreBundlesTitle: "Daha fazla paket",
      weeklyTemplateEyebrow: "Haftalık şablon",
      weeklyTemplateTitle: "Antrenman haftan, eksiksiz",
      weeklyTemplateNote: "Her antrenman günü için bir satır. 12 hafta boyunca tekrarla; aşağıdaki yükleme şeması ilerler.",
      progressionEyebrow: "İlerleme",
      progressionTitle: "Yükler 12 hafta boyunca nasıl değişir",
      progressionLoading: "Yükleme",
      progressionIntensity: "Yoğunluk ipucu",
      warmupTitle: "Isınma",
      cooldownTitle: "Soğuma",
      equipmentEyebrow: "Ekipman",
      equipmentTitle: "İhtiyacın olacaklar",
      recipesEyebrow: "Tarif kütüphanesi",
      recipesTitle: "Bu diyete uyan altı öğün",
      recipesNote: "Mutfakta tüm gününü harcamadan yukarıdaki makroları tutturmak için seçildi.",
      recipeIngredients: "Malzemeler",
      recipeSteps: "Yapılışı",
      recipeKcal: "kcal",
      recipeProtein: "P",
      recipeCarbs: "K",
      recipeFat: "Y",
      recipeTime: "Süre",
      mealTypeLabels: {
        breakfast: "Kahvaltı",
        lunch: "Öğle",
        dinner: "Akşam",
        snack: "Ara öğün",
        shake: "Shake"
      },
      groceryEyebrow: "Haftalık market listesi",
      groceryTitle: "Tek alışveriş, tek sepet",
      groceryNote: "Bir antrenman haftası için yukarıdaki tarifleri karşılayacak şekilde hazırlandı. Vücut ağırlığına göre 0,75-1,25× ölçekle."
    },
    homeTeaser: {
      eyebrow: "Katalog",
      body: "Her paket, 12 haftalık bir antrenman protokolünü uyumlu bir diyet sistemiyle eşleştirir ve markalı bir PDF dosyası olarak sunulur. Girişle ücretsiz.",
      cta: (count) => `${count} paketi incele`
    }
  },
  ar: {
    metaTitle: "حزم البرامج · TJFit",
    metaDescription:
      "اثنتا عشرة حزمة تدريب وتغذية لمدة 12 أسبوعاً، تُسلَّم كملفات PDF تحمل العلامة. تدرّب بذكاء، وتغذَّ بدقة.",
    eyebrow: "الحزم",
    title: (count) => `${count} حزمة. طريق واحد للتدريب.`,
    lead: "تجمع كل حزمة بروتوكول تدريب لمدة 12 أسبوعاً مع نظام غذائي متوافق، وتُسلَّم كملف PDF يحمل العلامة. اختر الهدف — وقد بنينا الباقي.",
    coachEyebrow: "استخدام باقتك",
    coachBody:
      "تتضمن باقتك ملفات PDF للتدريب والتغذية لاستخدامك الشخصي. يمكنك تنزيل نسختك وطباعتها. لا يشمل ترخيص الاستخدام الشخصي إعادة البيع أو إعادة التوزيع أو تغيير العلامة التجارية.",
    filterAria: "تصفية الحزم حسب الهدف",
    filterLabels: {
      all: "الكل",
      "fat-loss": "تنشيف",
      "muscle-gain": "تضخيم",
      recomp: "ريكومب",
      strength: "قوة",
      conditioning: "لياقة",
      foundation: "بداية"
    },
    emptyFilter: "لا توجد حزم تطابق هذا التصفية بعد.",
    duration: "المدة",
    sessions: "الجلسات",
    weeksValue: (n) => `${n} أسبوعاً`,
    sessionsValue: (n) => `${n}×/أسبوع`,
    download: "تنزيل PDF",
    details: "التفاصيل",
    buy: "اشترِ",
    free: "مجاني",
    getFree: "احصل عليه مجاناً",
    processing: "جارٍ المعالجة…",
    footnoteFree: "مجاني مع تسجيل الدخول · ملف بالعلامة · جاهز للطباعة A4",
    footnotePaid: "يتطلب تسجيل الدخول · ملف بالعلامة · جاهز للطباعة A4",
    goalAria: (label) => `الهدف: ${label}`,
    priceAria: (save) => `السعر: ${save}`,
    downloadAria: (name) => `تنزيل ملف ${name} بصيغة PDF`,
    detailsAria: (name) => `فتح تفاصيل ${name}`,
    detail: {
      startProgram: "ابدأ البرنامج",
      startProgramAria: (name) => `ابدأ برنامج ${name}`,
      sectionNavAria: "في هذه الصفحة",
      weekLabel: "الأسبوع",
      metaFallbackTitle: "حزمة · TJFit",
      backToAll: "كل الحزم",
      askTjai: "اسأل TJAI أيها تختار",
      shareAria: (name) => `مشاركة ${name}`,
      atAGlance: "لمحة سريعة",
      rowTraining: "التدريب",
      rowDiet: "النظام الغذائي",
      sessionsValueLong: (n) => `${n} في الأسبوع`,
      trainingFrameworkEyebrow: "إطار التدريب",
      trainingFrameworkTitle: "ثلاث مراحل، اثنا عشر أسبوعاً.",
      sampleSessionEyebrow: "جلسة نموذجية",
      sampleSessionNote:
        "جلسة تمثيلية من البرنامج. تتكيّف الأحمال مع مستواك.",
      nutritionEyebrow: "إطار التغذية",
      nutritionStyle: "النمط",
      nutritionProtein: "هدف البروتين",
      nutritionCalorie: "ميل السعرات",
      sampleDayEyebrow: "يوم نموذجي من الطعام",
      sampleDayTitle: "كيف يبدو يوم حقيقي",
      sampleDayNote:
        "اضبط الحصص لتحقيق أهدافك. قالب، وليس وصفة.",
      readyEyebrow: "جاهز للبدء",
      readyTitle: "نزّل الملف وابدأ تطبيقه اليوم.",
      accessEyebrow: "الوصول إلى الحزمة",
      accessTitle: "راجع حالة التوفر وخيارات تسجيل الدخول.",
      downloadDossierAria: "تنزيل ملف الحزمة بصيغة PDF",
      shareIdle: "مشاركة",
      shareShared: "تمت المشاركة",
      shareCopied: "تم نسخ الرابط!",
      moreBundlesTitle: "حزم أخرى",
      weeklyTemplateEyebrow: "القالب الأسبوعي",
      weeklyTemplateTitle: "أسبوع تدريبك، مرسوماً",
      weeklyTemplateNote: "صف لكل يوم تدريب. كرّر خلال 12 أسبوعاً؛ يتطوّر مخطط الأحمال أدناه.",
      progressionEyebrow: "التقدّم",
      progressionTitle: "كيف تتطوّر الأحمال على مدى 12 أسبوعاً",
      progressionLoading: "التحميل",
      progressionIntensity: "ملاحظة الشدة",
      warmupTitle: "الإحماء",
      cooldownTitle: "التهدئة",
      equipmentEyebrow: "المعدات",
      equipmentTitle: "ما ستحتاج إليه",
      recipesEyebrow: "مكتبة الوصفات",
      recipesTitle: "ست وجبات تناسب هذا النظام",
      recipesNote: "اخترناها لتحقيق الماكروز أعلاه دون قضاء يومك في المطبخ.",
      recipeIngredients: "المكوّنات",
      recipeSteps: "الطريقة",
      recipeKcal: "سعرة",
      recipeProtein: "ب",
      recipeCarbs: "ك",
      recipeFat: "د",
      recipeTime: "الوقت",
      mealTypeLabels: {
        breakfast: "فطور",
        lunch: "غداء",
        dinner: "عشاء",
        snack: "وجبة خفيفة",
        shake: "شيك"
      },
      groceryEyebrow: "قائمة التسوق الأسبوعية",
      groceryTitle: "زيارة واحدة، عربة واحدة",
      groceryNote: "مُعَدّة لتغطية الوصفات أعلاه لأسبوع تدريب واحد. عدّل 0.75-1.25× حسب وزن جسمك."
    },
    homeTeaser: {
      eyebrow: "الكتالوج",
      body: "تجمع كل حزمة بروتوكول تدريب لمدة 12 أسبوعاً مع نظام غذائي متوافق، وتُسلَّم كملف PDF يحمل العلامة. مجاني مع تسجيل الدخول.",
      cta: (count) => `تصفّح ${count} حزمة`
    }
  },
  es: {
    metaTitle: "Paquetes de programas · TJFit",
    metaDescription:
      "Doce paquetes de entrenamiento y dieta de 12 semanas, entregados como dossiers PDF de marca. Entrena con cabeza, come con precisión.",
    eyebrow: "Paquetes",
    title: (count) => `${count} paquetes. Una sola forma de entrenar.`,
    lead: "Cada paquete combina un protocolo de entrenamiento de 12 semanas con un sistema de dieta a juego, entregado como un dossier PDF de marca. Elige el objetivo — el resto ya lo construimos.",
    coachEyebrow: "Usar tu paquete",
    coachBody:
      "Tu paquete incluye PDF de entrenamiento y nutrición para uso personal. Puedes descargar e imprimir tu copia. La licencia de uso personal no incluye reventa, redistribución ni cambio de marca.",
    filterAria: "Filtrar paquetes por objetivo",
    filterLabels: {
      all: "Todos",
      "fat-loss": "Definición",
      "muscle-gain": "Volumen",
      recomp: "Recomp",
      strength: "Fuerza",
      conditioning: "Acondicionamiento",
      foundation: "Inicio"
    },
    emptyFilter: "Ningún paquete coincide con este filtro todavía.",
    duration: "Duración",
    sessions: "Sesiones",
    weeksValue: (n) => `${n} semanas`,
    sessionsValue: (n) => `${n}×/sem`,
    download: "Descargar PDF",
    details: "Detalles",
    buy: "Comprar",
    free: "Gratis",
    getFree: "Obtener gratis",
    processing: "Procesando…",
    footnoteFree: "Gratis con inicio de sesión · dossier de marca · listo para imprimir A4",
    footnotePaid: "Requiere inicio de sesión · dossier de marca · listo para imprimir A4",
    goalAria: (label) => `Objetivo: ${label}`,
    priceAria: (save) => `Precio: ${save}`,
    downloadAria: (name) => `Descargar el PDF de ${name}`,
    detailsAria: (name) => `Abrir los detalles de ${name}`,
    detail: {
      startProgram: "Iniciar programa",
      startProgramAria: (name) => `Iniciar ${name}`,
      sectionNavAria: "En esta página",
      weekLabel: "Semana",
      metaFallbackTitle: "Paquete · TJFit",
      backToAll: "Todos los paquetes",
      askTjai: "Pregunta a TJAI cuál elegir",
      shareAria: (name) => `Compartir ${name}`,
      atAGlance: "De un vistazo",
      rowTraining: "Entrenamiento",
      rowDiet: "Dieta",
      sessionsValueLong: (n) => `${n} por semana`,
      trainingFrameworkEyebrow: "Marco de entrenamiento",
      trainingFrameworkTitle: "Tres fases, doce semanas.",
      sampleSessionEyebrow: "Sesión de ejemplo",
      sampleSessionNote:
        "Una sesión representativa del programa. Las cargas se ajustan a tu nivel.",
      nutritionEyebrow: "Marco de nutrición",
      nutritionStyle: "Estilo",
      nutritionProtein: "Objetivo de proteína",
      nutritionCalorie: "Sesgo calórico",
      sampleDayEyebrow: "Día de comidas de ejemplo",
      sampleDayTitle: "Cómo es un día real",
      sampleDayNote:
        "Ajusta las porciones para alcanzar tus objetivos. Una plantilla, no una receta.",
      readyEyebrow: "Listo para empezar",
      readyTitle: "Descarga el dossier y empiézalo hoy.",
      accessEyebrow: "Acceso al paquete",
      accessTitle: "Consulta la disponibilidad y las opciones de inicio de sesión.",
      downloadDossierAria: "Descargar el PDF del paquete",
      shareIdle: "Compartir",
      shareShared: "Compartido",
      shareCopied: "¡Enlace copiado!",
      moreBundlesTitle: "Más paquetes",
      weeklyTemplateEyebrow: "Plantilla semanal",
      weeklyTemplateTitle: "Tu semana de entrenamiento, mapeada",
      weeklyTemplateNote: "Una fila por día de entrenamiento. Repítela durante 12 semanas; el esquema de cargas abajo evoluciona.",
      progressionEyebrow: "Progresión",
      progressionTitle: "Cómo evolucionan las cargas en 12 semanas",
      progressionLoading: "Carga",
      progressionIntensity: "Indicación de intensidad",
      warmupTitle: "Calentamiento",
      cooldownTitle: "Enfriamiento",
      equipmentEyebrow: "Equipo",
      equipmentTitle: "Lo que necesitarás",
      recipesEyebrow: "Biblioteca de recetas",
      recipesTitle: "Seis comidas alineadas con esta dieta",
      recipesNote: "Elegidas para alcanzar los macros de arriba sin pasar todo el día en la cocina.",
      recipeIngredients: "Ingredientes",
      recipeSteps: "Preparación",
      recipeKcal: "kcal",
      recipeProtein: "P",
      recipeCarbs: "C",
      recipeFat: "G",
      recipeTime: "Tiempo",
      mealTypeLabels: {
        breakfast: "Desayuno",
        lunch: "Almuerzo",
        dinner: "Cena",
        snack: "Snack",
        shake: "Batido"
      },
      groceryEyebrow: "Lista de compras semanal",
      groceryTitle: "Una sola compra",
      groceryNote: "Cubre las recetas anteriores para una semana de entrenamiento. Escala 0,75-1,25× según tu peso corporal."
    },
    homeTeaser: {
      eyebrow: "Catálogo",
      body: "Cada paquete combina un protocolo de entrenamiento de 12 semanas con un sistema de dieta a juego, entregado como un dossier PDF de marca. Gratis con inicio de sesión.",
      cta: (count) => `Ver ${count} paquetes`
    }
  },
  fr: {
    metaTitle: "Packs de programmes · TJFit",
    metaDescription:
      "Douze packs entraînement et diète de 12 semaines, livrés en dossiers PDF de marque. Entraîne-toi mieux, mange plus juste.",
    eyebrow: "Packs",
    title: (count) => `${count} packs. Une seule façon de s'entraîner.`,
    lead: "Chaque pack associe un protocole d'entraînement de 12 semaines à un système de diète assorti, livré en dossier PDF de marque. Choisis l'objectif — on a construit le reste.",
    coachEyebrow: "Utiliser ton pack",
    coachBody:
      "Ton pack comprend des PDF d’entraînement et de nutrition pour ton usage personnel. Tu peux télécharger et imprimer ta copie. La licence personnelle n’inclut ni revente, ni redistribution, ni changement de marque.",
    filterAria: "Filtrer les packs par objectif",
    filterLabels: {
      all: "Tous",
      "fat-loss": "Sèche",
      "muscle-gain": "Prise de masse",
      recomp: "Recomp",
      strength: "Force",
      conditioning: "Conditionnement",
      foundation: "Débuter"
    },
    emptyFilter: "Aucun pack ne correspond à ce filtre pour l'instant.",
    duration: "Durée",
    sessions: "Séances",
    weeksValue: (n) => `${n} semaines`,
    sessionsValue: (n) => `${n}×/sem`,
    download: "Télécharger le PDF",
    details: "Détails",
    buy: "Acheter",
    free: "Gratuit",
    getFree: "Obtenir gratuitement",
    processing: "Traitement…",
    footnoteFree: "Gratuit avec connexion · dossier de marque · prêt à imprimer A4",
    footnotePaid: "Connexion requise · dossier de marque · prêt à imprimer A4",
    goalAria: (label) => `Objectif : ${label}`,
    priceAria: (save) => `Prix : ${save}`,
    downloadAria: (name) => `Télécharger le PDF de ${name}`,
    detailsAria: (name) => `Ouvrir les détails de ${name}`,
    detail: {
      startProgram: "Commencer le programme",
      startProgramAria: (name) => `Commencer ${name}`,
      sectionNavAria: "Sur cette page",
      weekLabel: "Semaine",
      metaFallbackTitle: "Pack · TJFit",
      backToAll: "Tous les packs",
      askTjai: "Demande à TJAI lequel choisir",
      shareAria: (name) => `Partager ${name}`,
      atAGlance: "En un coup d'œil",
      rowTraining: "Entraînement",
      rowDiet: "Diète",
      sessionsValueLong: (n) => `${n} par semaine`,
      trainingFrameworkEyebrow: "Cadre d'entraînement",
      trainingFrameworkTitle: "Trois phases, douze semaines.",
      sampleSessionEyebrow: "Séance type",
      sampleSessionNote:
        "Une séance représentative du programme. Les charges s'adaptent à ton niveau.",
      nutritionEyebrow: "Cadre nutritionnel",
      nutritionStyle: "Style",
      nutritionProtein: "Objectif protéines",
      nutritionCalorie: "Tendance calorique",
      sampleDayEyebrow: "Journée de repas type",
      sampleDayTitle: "À quoi ressemble une vraie journée",
      sampleDayNote:
        "Ajuste les portions pour atteindre tes objectifs. Un modèle, pas une prescription.",
      readyEyebrow: "Prêt à commencer",
      readyTitle: "Télécharge le dossier et lance-le dès aujourd'hui.",
      accessEyebrow: "Accès au pack",
      accessTitle: "Consulte la disponibilité et les options de connexion.",
      downloadDossierAria: "Télécharger le PDF du pack",
      shareIdle: "Partager",
      shareShared: "Partagé",
      shareCopied: "Lien copié !",
      moreBundlesTitle: "Plus de packs",
      weeklyTemplateEyebrow: "Modèle hebdomadaire",
      weeklyTemplateTitle: "Ta semaine d'entraînement, cartographiée",
      weeklyTemplateNote: "Une ligne par jour d'entraînement. À répéter sur 12 semaines ; le schéma de charges ci-dessous évolue.",
      progressionEyebrow: "Progression",
      progressionTitle: "Comment les charges évoluent sur 12 semaines",
      progressionLoading: "Charge",
      progressionIntensity: "Indice d'intensité",
      warmupTitle: "Échauffement",
      cooldownTitle: "Retour au calme",
      equipmentEyebrow: "Équipement",
      equipmentTitle: "Ce dont tu auras besoin",
      recipesEyebrow: "Bibliothèque de recettes",
      recipesTitle: "Six repas alignés à cette diète",
      recipesNote: "Choisis pour atteindre les macros ci-dessus sans passer ta journée en cuisine.",
      recipeIngredients: "Ingrédients",
      recipeSteps: "Préparation",
      recipeKcal: "kcal",
      recipeProtein: "P",
      recipeCarbs: "G",
      recipeFat: "L",
      recipeTime: "Temps",
      mealTypeLabels: {
        breakfast: "Petit-déjeuner",
        lunch: "Déjeuner",
        dinner: "Dîner",
        snack: "Collation",
        shake: "Shake"
      },
      groceryEyebrow: "Liste de courses hebdo",
      groceryTitle: "Une seule course",
      groceryNote: "Couvre les recettes ci-dessus pour une semaine d'entraînement. Adapte 0,75-1,25× selon ton poids de corps."
    },
    homeTeaser: {
      eyebrow: "Catalogue",
      body: "Chaque pack associe un protocole d'entraînement de 12 semaines à un système de diète assorti, livré en dossier PDF de marque. Gratuit avec connexion.",
      cta: (count) => `Voir les ${count} packs`
    }
  }
};

export function getBundlesCopy(locale: string): BundlesCopy {
  return COPY[resolveCopyLocale(locale)];
}
