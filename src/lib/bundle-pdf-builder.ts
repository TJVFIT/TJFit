import { jsPDF } from "jspdf";

import type { BundleCopy } from "@/lib/bundle-localization";
import type { Bundle } from "@/lib/bundles";
import {
  PAGE,
  PDF_THEME,
  drawAccentBar,
  drawCoverHeader,
  drawFooter,
  drawInteriorHeader,
  fillPage,
  setDraw,
  setText,
  wrapText
} from "@/lib/premium-pdf-theme";

export type BundlePdfArgs = {
  bundle: Bundle;
  copy?: BundleCopy;
  locale?: string;
  buyerName?: string;
  issuedAt?: string;
  localeLabel?: string;
};

type PdfStrings = {
  dossier: string;
  duration: string;
  sessions: string;
  goal: string;
  weeks: (n: number) => string;
  perWeek: (n: number) => string;
  licensedTo: (n: string, d: string) => string;
  overviewEy: string;
  overviewTitle: string;
  pairsWith: string;
  pairedWith: string;
  trainingEy: string;
  sessionLine: (s: number, w: number) => string;
  sampleEy: string;
  sampleTitle: string;
  sampleSub: string;
  sampleCont: string;
  nutritionEy: string;
  styleLabel: string;
  proteinLabel: string;
  calorieLabel: string;
  notesLabel: string;
  mealDayEy: string;
  mealDayTitle: string;
  mealDaySub: string;
  mealDayCont: string;
  weeklyTplEy: string;
  weeklyTplTitle: (s: number) => string;
  progressionEy: string;
  progressionTitle: string;
  loadingLabel: string;
  intensityLabel: string;
  prepEy: string;
  prepTitle: string;
  warmupLabel: string;
  cooldownLabel: string;
  equipmentLabel: string;
  recipeEy: string;
  ingredientsLabel: string;
  methodLabel: string;
  groceryEy: string;
  groceryTitle: string;
  groceryCont: string;
  howToEy: string;
  howToTitle: string;
  howToSteps: string[];
  recoveryEy: string;
  recoveryTitle: string;
  recoveryLines: string[];
  licenseLabel: string;
  licenseBody: string;
  bundleDossierFooter: string;
};

const STRINGS_EN: PdfStrings = {
  dossier: "Bundle Dossier",
  duration: "DURATION",
  sessions: "SESSIONS",
  goal: "GOAL",
  weeks: (n) => `${n} weeks`,
  perWeek: (n) => `${n}× per week`,
  licensedTo: (n, d) => `Licensed to ${n} · Issued ${d}`,
  overviewEy: "Overview",
  overviewTitle: "What you're signing up for",
  pairsWith: "THIS BUNDLE PAIRS",
  pairedWith: "paired with",
  trainingEy: "Training",
  sessionLine: (s, w) => `${s} sessions per week · ${w} weeks total`,
  sampleEy: "Sample session",
  sampleTitle: "Sample session",
  sampleSub: "A representative session from the program. Loads scale to your level.",
  sampleCont: "(continued)",
  nutritionEy: "Nutrition",
  styleLabel: "STYLE",
  proteinLabel: "PROTEIN TARGET",
  calorieLabel: "CALORIE BIAS",
  notesLabel: "NOTES",
  mealDayEy: "Sample day of eating",
  mealDayTitle: "What a real day looks like",
  mealDaySub: "Adjust portions to hit your targets. This is a template, not a prescription.",
  mealDayCont: "Anchor meals by slot (continued)",
  weeklyTplEy: "Weekly template",
  weeklyTplTitle: (s) => `${s}× per week · repeat across 12 weeks`,
  progressionEy: "Progression",
  progressionTitle: "How loads evolve across the 12 weeks",
  loadingLabel: "LOADING",
  intensityLabel: "INTENSITY CUE",
  prepEy: "Prep & equipment",
  prepTitle: "Warm-up, cool-down, and what you need",
  warmupLabel: "WARM-UP",
  cooldownLabel: "COOL-DOWN",
  equipmentLabel: "EQUIPMENT",
  recipeEy: "Recipe",
  ingredientsLabel: "INGREDIENTS",
  methodLabel: "METHOD",
  groceryEy: "Grocery list",
  groceryTitle: "One week of meals · scale to bodyweight",
  groceryCont: "Continued",
  howToEy: "Progression",
  howToTitle: "How to actually use this",
  howToSteps: [
    "Run the program 4 days a week (or as prescribed) without missing sessions in the first 4 weeks. Compliance beats optimization.",
    "Track main lifts week to week — small load or rep increases compound. If a week stalls, repeat it before progressing.",
    "Hit the protein target every day. Calories can flex by ±10% across the week; protein cannot.",
    "Use the phase boundaries as decision points: progress, repeat, or deload. Don't add work; sharpen what's there.",
    "At week 12, retest a benchmark (top set, body comp photo, conditioning piece) before deciding what's next."
  ],
  recoveryEy: "Recovery",
  recoveryTitle: "Sleep, stress, and the part most people skip",
  recoveryLines: [
    "Sleep is the first lever. Aim for 7-9 hours. Track it for 2 weeks if you've never measured.",
    "Walk daily. 6-8k steps minimum on training days, 8-10k on rest days. NEAT is half the body comp game.",
    "Mobility: 10 minutes of targeted work before lifts, 5 minutes post. Hips, shoulders, T-spine.",
    "One full rest day per week. No optional add-ons. The day is the work.",
    "Stress load is real. If life is loud, reduce training volume 20% — not intensity."
  ],
  licenseLabel: "LICENSE",
  licenseBody:
    "This bundle is licensed for personal use. Reselling, redistributing, or rebranding any part of this document is prohibited. Coaches and affiliates: ask about white-label terms at tjfit.org.",
  bundleDossierFooter: "Bundle dossier"
};

const STRINGS_TR: PdfStrings = {
  dossier: "Paket Dosyası",
  duration: "SÜRE",
  sessions: "ANTRENMAN",
  goal: "HEDEF",
  weeks: (n) => `${n} hafta`,
  perWeek: (n) => `haftada ${n}×`,
  licensedTo: (n, d) => `${n} adına lisanslandı · ${d} tarihinde verildi`,
  overviewEy: "Genel Bakış",
  overviewTitle: "Neye kayıt oluyorsun",
  pairsWith: "BU PAKET BİRLEŞTİRİR",
  pairedWith: "ile birlikte",
  trainingEy: "Antrenman",
  sessionLine: (s, w) => `Haftada ${s} antrenman · toplam ${w} hafta`,
  sampleEy: "Örnek Antrenman",
  sampleTitle: "Örnek Antrenman",
  sampleSub: "Programdan temsili bir antrenman. Yükler senin seviyene göre ölçeklenir.",
  sampleCont: "(devam)",
  nutritionEy: "Beslenme",
  styleLabel: "STİL",
  proteinLabel: "PROTEİN HEDEFİ",
  calorieLabel: "KALORİ EĞİLİMİ",
  notesLabel: "NOTLAR",
  mealDayEy: "Örnek Beslenme Günü",
  mealDayTitle: "Gerçek bir gün nasıl görünür",
  mealDaySub: "Porsiyonları hedeflerine göre ayarla. Bu bir şablon, reçete değil.",
  mealDayCont: "Öğünler (devam)",
  weeklyTplEy: "Haftalık Şablon",
  weeklyTplTitle: (s) => `Haftada ${s}× · 12 hafta boyunca tekrarla`,
  progressionEy: "İlerleme",
  progressionTitle: "Yükler 12 hafta boyunca nasıl değişir",
  loadingLabel: "YÜK",
  intensityLabel: "YOĞUNLUK İPUCU",
  prepEy: "Hazırlık & ekipman",
  prepTitle: "Isınma, soğuma ve ihtiyacın olan ekipman",
  warmupLabel: "ISINMA",
  cooldownLabel: "SOĞUMA",
  equipmentLabel: "EKİPMAN",
  recipeEy: "Tarif",
  ingredientsLabel: "MALZEMELER",
  methodLabel: "YÖNTEM",
  groceryEy: "Market listesi",
  groceryTitle: "Bir haftalık öğün · vücut ağırlığına göre ölçekle",
  groceryCont: "Devam",
  howToEy: "İlerleme",
  howToTitle: "Bunu gerçekten nasıl kullanırsın",
  howToSteps: [
    "İlk 4 hafta antrenman kaçırmadan programı haftada 4 gün (veya öngörüldüğü gibi) uygula. Uyum, optimizasyondan önce gelir.",
    "Ana hareketleri haftadan haftaya takip et — küçük yük veya tekrar artışları birikir. Bir hafta tıkanırsa, ilerlemeden önce tekrarla.",
    "Protein hedefini her gün tuttur. Kaloriler hafta boyunca ±%10 esneyebilir; protein esneyemez.",
    "Faz sınırlarını karar noktaları olarak kullan: ilerle, tekrarla veya yükü düşür. İş ekleme; var olanı keskinleştir.",
    "12. haftada bir referans testi yap (üst set, vücut kompozisyonu fotoğrafı, kondisyon çalışması) ve sonra ne yapacağına karar ver."
  ],
  recoveryEy: "Toparlanma",
  recoveryTitle: "Uyku, stres ve çoğu insanın atladığı kısım",
  recoveryLines: [
    "Uyku ilk kaldıraçtır. 7-9 saati hedefle. Hiç ölçmediysen 2 hafta takip et.",
    "Her gün yürü. Antrenman günlerinde en az 6-8 bin, dinlenme günlerinde 8-10 bin adım. NEAT vücut kompozisyonunun yarısıdır.",
    "Mobilite: kaldırmadan önce 10 dakika hedeflenmiş çalışma, sonra 5 dakika. Kalça, omuz, T-omurga.",
    "Haftada bir tam dinlenme günü. Opsiyonel eklenti yok. Gün, işin kendisidir.",
    "Stres yükü gerçek. Hayat gürültülüyse, antrenman hacmini %20 azalt — yoğunluğu değil."
  ],
  licenseLabel: "LİSANS",
  licenseBody:
    "Bu paket kişisel kullanım için lisanslanmıştır. Bu belgenin herhangi bir bölümünün yeniden satışı, dağıtımı veya markalanması yasaktır. Koçlar ve bağlı kuruluşlar: tjfit.org adresinden beyaz etiket koşullarını sorun.",
  bundleDossierFooter: "Paket dosyası"
};

const STRINGS_AR: PdfStrings = {
  dossier: "ملف الباقة",
  duration: "المدة",
  sessions: "الجلسات",
  goal: "الهدف",
  weeks: (n) => `${n} أسبوع`,
  perWeek: (n) => `${n}× أسبوعياً`,
  licensedTo: (n, d) => `مرخّص لـ ${n} · صدر بتاريخ ${d}`,
  overviewEy: "نظرة عامة",
  overviewTitle: "ما الذي ستلتزم به",
  pairsWith: "هذه الباقة تجمع بين",
  pairedWith: "مع",
  trainingEy: "التدريب",
  sessionLine: (s, w) => `${s} جلسات أسبوعياً · ${w} أسبوع إجمالاً`,
  sampleEy: "جلسة نموذجية",
  sampleTitle: "جلسة نموذجية",
  sampleSub: "جلسة تمثيلية من البرنامج. الأحمال تتدرج بمستواك.",
  sampleCont: "(تابع)",
  nutritionEy: "التغذية",
  styleLabel: "الأسلوب",
  proteinLabel: "هدف البروتين",
  calorieLabel: "اتجاه السعرات",
  notesLabel: "ملاحظات",
  mealDayEy: "يوم أكل نموذجي",
  mealDayTitle: "كيف يبدو يوم حقيقي",
  mealDaySub: "اضبط الحصص للوصول إلى أهدافك. هذا قالب، وليس وصفة.",
  mealDayCont: "الوجبات (تابع)",
  weeklyTplEy: "القالب الأسبوعي",
  weeklyTplTitle: (s) => `${s}× أسبوعياً · كرر على مدى 12 أسبوعاً`,
  progressionEy: "التدرّج",
  progressionTitle: "كيف تتطور الأحمال خلال 12 أسبوعاً",
  loadingLabel: "التحميل",
  intensityLabel: "إشارة الكثافة",
  prepEy: "التحضير والمعدات",
  prepTitle: "الإحماء، التهدئة، وما تحتاجه",
  warmupLabel: "الإحماء",
  cooldownLabel: "التهدئة",
  equipmentLabel: "المعدات",
  recipeEy: "وصفة",
  ingredientsLabel: "المكونات",
  methodLabel: "الطريقة",
  groceryEy: "قائمة التسوق",
  groceryTitle: "أسبوع من الوجبات · اضبط حسب وزن الجسم",
  groceryCont: "تابع",
  howToEy: "التدرّج",
  howToTitle: "كيف تستخدمه فعلاً",
  howToSteps: [
    "نفّذ البرنامج 4 أيام أسبوعياً (أو كما هو موصوف) دون تفويت جلسات في أول 4 أسابيع. الالتزام يسبق التحسين.",
    "تتبّع التمارين الأساسية أسبوعياً — زيادات صغيرة في الحمل أو التكرارات تتراكم. إن توقف أسبوع، كرّره قبل التقدم.",
    "حقّق هدف البروتين يومياً. السعرات يمكن أن تتغير ±10% خلال الأسبوع؛ البروتين لا.",
    "استخدم حدود المراحل كنقاط قرار: تقدّم، كرّر، أو خفّف. لا تضف عملاً؛ اشحذ الموجود.",
    "في الأسبوع 12 أعد اختبار معيار (أعلى مجموعة، صورة تركيب جسم، قطعة لياقة) قبل تقرير الخطوة التالية."
  ],
  recoveryEy: "التعافي",
  recoveryTitle: "النوم والضغط والجزء الذي يتجاهله الأغلب",
  recoveryLines: [
    "النوم هو الرافعة الأولى. استهدف 7-9 ساعات. تتبّعه أسبوعين إن لم تقسه من قبل.",
    "امشِ يومياً. 6-8 آلاف خطوة على الأقل في أيام التدريب، و8-10 آلاف في أيام الراحة. النشاط العفوي نصف معادلة التركيب.",
    "المرونة: 10 دقائق عمل مستهدف قبل الرفع، و5 دقائق بعد. الورك والكتف والعمود الصدري.",
    "يوم راحة كامل أسبوعياً. لا إضافات اختيارية. اليوم نفسه هو العمل.",
    "حمل التوتر حقيقي. إن كانت الحياة صاخبة، خفّض حجم التدريب 20% — لا الكثافة."
  ],
  licenseLabel: "الترخيص",
  licenseBody:
    "هذه الباقة مرخّصة للاستخدام الشخصي. يُحظر إعادة بيع أو توزيع أو إعادة توسيم أي جزء من هذا المستند. للمدربين والشركاء: اسأل عن شروط العلامة البيضاء على tjfit.org.",
  bundleDossierFooter: "ملف الباقة"
};

const STRINGS_ES: PdfStrings = {
  dossier: "Dossier del Pack",
  duration: "DURACIÓN",
  sessions: "SESIONES",
  goal: "OBJETIVO",
  weeks: (n) => `${n} semanas`,
  perWeek: (n) => `${n}× por semana`,
  licensedTo: (n, d) => `Licencia para ${n} · Emitido ${d}`,
  overviewEy: "Resumen",
  overviewTitle: "A qué te estás apuntando",
  pairsWith: "ESTE PACK COMBINA",
  pairedWith: "junto con",
  trainingEy: "Entrenamiento",
  sessionLine: (s, w) => `${s} sesiones por semana · ${w} semanas en total`,
  sampleEy: "Sesión de muestra",
  sampleTitle: "Sesión de muestra",
  sampleSub: "Una sesión representativa del programa. Las cargas se escalan a tu nivel.",
  sampleCont: "(continuación)",
  nutritionEy: "Nutrición",
  styleLabel: "ESTILO",
  proteinLabel: "OBJETIVO DE PROTEÍNA",
  calorieLabel: "SESGO CALÓRICO",
  notesLabel: "NOTAS",
  mealDayEy: "Día de comida de muestra",
  mealDayTitle: "Cómo es un día real",
  mealDaySub: "Ajusta las porciones para alcanzar tus objetivos. Es una plantilla, no una receta.",
  mealDayCont: "Comidas (continuación)",
  weeklyTplEy: "Plantilla semanal",
  weeklyTplTitle: (s) => `${s}× por semana · repite durante 12 semanas`,
  progressionEy: "Progresión",
  progressionTitle: "Cómo evolucionan las cargas durante 12 semanas",
  loadingLabel: "CARGA",
  intensityLabel: "SEÑAL DE INTENSIDAD",
  prepEy: "Preparación y equipo",
  prepTitle: "Calentamiento, vuelta a la calma y lo que necesitas",
  warmupLabel: "CALENTAMIENTO",
  cooldownLabel: "VUELTA A LA CALMA",
  equipmentLabel: "EQUIPO",
  recipeEy: "Receta",
  ingredientsLabel: "INGREDIENTES",
  methodLabel: "MÉTODO",
  groceryEy: "Lista de compras",
  groceryTitle: "Una semana de comidas · ajusta al peso corporal",
  groceryCont: "Continuación",
  howToEy: "Progresión",
  howToTitle: "Cómo usarlo de verdad",
  howToSteps: [
    "Sigue el programa 4 días por semana (o lo prescrito) sin saltarte sesiones en las primeras 4 semanas. La constancia supera a la optimización.",
    "Anota los levantamientos principales cada semana — pequeños aumentos de carga o reps se acumulan. Si una semana se estanca, repítela antes de avanzar.",
    "Cumple el objetivo de proteína cada día. Las calorías pueden flexibilizar ±10% en la semana; la proteína no.",
    "Usa los límites de fase como puntos de decisión: avanzar, repetir o descargar. No añadas trabajo; afina el existente.",
    "En la semana 12, vuelve a medir un referente (serie tope, foto de composición, pieza de acondicionamiento) antes de decidir lo siguiente."
  ],
  recoveryEy: "Recuperación",
  recoveryTitle: "Sueño, estrés y la parte que la mayoría salta",
  recoveryLines: [
    "El sueño es la primera palanca. Apunta a 7-9 horas. Si nunca lo has medido, mídelo durante 2 semanas.",
    "Camina cada día. Mínimo 6-8 mil pasos en días de entrenamiento, 8-10 mil en descanso. El NEAT es la mitad del juego de composición.",
    "Movilidad: 10 minutos dirigidos antes de levantar, 5 minutos después. Caderas, hombros, columna torácica.",
    "Un día completo de descanso por semana. Sin extras opcionales. El descanso es el trabajo.",
    "La carga de estrés es real. Si la vida está ruidosa, reduce el volumen de entrenamiento un 20% — no la intensidad."
  ],
  licenseLabel: "LICENCIA",
  licenseBody:
    "Este pack tiene licencia para uso personal. Está prohibido revender, redistribuir o reetiquetar cualquier parte de este documento. Coaches y afiliados: consulta los términos de marca blanca en tjfit.org.",
  bundleDossierFooter: "Dossier del pack"
};

const STRINGS_FR: PdfStrings = {
  dossier: "Dossier du Pack",
  duration: "DURÉE",
  sessions: "SÉANCES",
  goal: "OBJECTIF",
  weeks: (n) => `${n} semaines`,
  perWeek: (n) => `${n}× par semaine`,
  licensedTo: (n, d) => `Licence pour ${n} · Émis le ${d}`,
  overviewEy: "Aperçu",
  overviewTitle: "Ce à quoi tu t'engages",
  pairsWith: "CE PACK ASSOCIE",
  pairedWith: "avec",
  trainingEy: "Entraînement",
  sessionLine: (s, w) => `${s} séances par semaine · ${w} semaines au total`,
  sampleEy: "Séance type",
  sampleTitle: "Séance type",
  sampleSub: "Une séance représentative du programme. Les charges s'adaptent à ton niveau.",
  sampleCont: "(suite)",
  nutritionEy: "Nutrition",
  styleLabel: "STYLE",
  proteinLabel: "OBJECTIF PROTÉINE",
  calorieLabel: "ORIENTATION CALORIQUE",
  notesLabel: "NOTES",
  mealDayEy: "Journée de repas type",
  mealDayTitle: "À quoi ressemble une vraie journée",
  mealDaySub: "Ajuste les portions pour atteindre tes objectifs. C'est un modèle, pas une prescription.",
  mealDayCont: "Repas (suite)",
  weeklyTplEy: "Modèle hebdomadaire",
  weeklyTplTitle: (s) => `${s}× par semaine · répéter sur 12 semaines`,
  progressionEy: "Progression",
  progressionTitle: "Comment les charges évoluent sur 12 semaines",
  loadingLabel: "CHARGE",
  intensityLabel: "INDICE D'INTENSITÉ",
  prepEy: "Préparation & équipement",
  prepTitle: "Échauffement, retour au calme et ce qu'il te faut",
  warmupLabel: "ÉCHAUFFEMENT",
  cooldownLabel: "RETOUR AU CALME",
  equipmentLabel: "ÉQUIPEMENT",
  recipeEy: "Recette",
  ingredientsLabel: "INGRÉDIENTS",
  methodLabel: "MÉTHODE",
  groceryEy: "Liste de courses",
  groceryTitle: "Une semaine de repas · adapter au poids corporel",
  groceryCont: "Suite",
  howToEy: "Progression",
  howToTitle: "Comment l'utiliser vraiment",
  howToSteps: [
    "Suis le programme 4 jours par semaine (ou comme prescrit) sans manquer de séance les 4 premières semaines. La régularité prime sur l'optimisation.",
    "Suis les mouvements principaux semaine après semaine — de petites hausses de charge ou de reps s'accumulent. Si une semaine stagne, refais-la avant de progresser.",
    "Atteins l'objectif protéine chaque jour. Les calories peuvent fluctuer de ±10% sur la semaine ; la protéine non.",
    "Utilise les fins de phase comme points de décision : progresser, répéter ou décharger. N'ajoute pas de travail ; affine l'existant.",
    "Semaine 12, retest un repère (top set, photo de composition, pièce de condition) avant de décider la suite."
  ],
  recoveryEy: "Récupération",
  recoveryTitle: "Sommeil, stress et la partie que la plupart négligent",
  recoveryLines: [
    "Le sommeil est le premier levier. Vise 7-9 heures. Mesure-le 2 semaines si tu ne l'as jamais fait.",
    "Marche chaque jour. 6-8 k pas minimum les jours d'entraînement, 8-10 k les jours de repos. Le NEAT, c'est la moitié du jeu.",
    "Mobilité : 10 minutes ciblées avant la séance, 5 minutes après. Hanches, épaules, colonne thoracique.",
    "Un jour complet de repos par semaine. Pas d'ajouts. Le repos, c'est le travail.",
    "Le stress compte. Si la vie est bruyante, réduis le volume d'entraînement de 20 % — pas l'intensité."
  ],
  licenseLabel: "LICENCE",
  licenseBody:
    "Ce pack est sous licence pour un usage personnel. Toute revente, redistribution ou réutilisation sous une autre marque d'une partie de ce document est interdite. Coachs et affiliés : demandez les conditions en marque blanche sur tjfit.org.",
  bundleDossierFooter: "Dossier du pack"
};

const STRINGS: Record<string, PdfStrings> = {
  en: STRINGS_EN,
  tr: STRINGS_TR,
  ar: STRINGS_AR,
  es: STRINGS_ES,
  fr: STRINGS_FR
};

function getStrings(locale?: string): PdfStrings {
  return STRINGS[locale ?? "en"] ?? STRINGS_EN;
}

/**
 * Builds a branded multi-page PDF dossier for a bundle.
 * Sections: Cover · Overview · Training Framework · Nutrition Framework ·
 * Progression · Recovery & Habits · License.
 *
 * Generic builder — does not require a full program blueprint. Pulls everything
 * it needs from the Bundle record so all 12 bundles are downloadable today.
 */
export function buildBundlePdf(args: BundlePdfArgs): jsPDF {
  const { bundle, buyerName, issuedAt, localeLabel, locale } = args;
  const t = getStrings(locale);
  const c = args.copy ?? {
    name: bundle.name,
    hook: bundle.hook,
    goalLabel: bundle.goalLabel,
    programTitle: bundle.programTitle,
    dietTitle: bundle.dietTitle,
    description: bundle.description,
    nutrition: bundle.nutrition,
    phases: bundle.phases
  };
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const contentWidth = PAGE.width - PAGE.margin * 2;
  const issued = issuedAt ? new Date(issuedAt) : new Date();

  // ─── Cover ─────────────────────────────────────────────────────────
  fillPage(pdf, PDF_THEME.obsidian);
  drawCoverHeader(pdf, `${localeLabel ?? (locale ?? "EN").toUpperCase()} · ${t.dossier}`);

  drawAccentBar(pdf, PAGE.margin, 180, 140, 4);

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(c.goalLabel.toUpperCase(), PAGE.margin, 210);

  setText(pdf, PDF_THEME.textPrimary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(38);
  const titleLines = wrapText(pdf, c.name, contentWidth);
  let titleY = 260;
  titleLines.slice(0, 3).forEach((line) => {
    pdf.text(line, PAGE.margin, titleY);
    titleY += 44;
  });

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const hookLines = wrapText(pdf, c.hook, contentWidth - 40);
  let hookY = titleY + 20;
  hookLines.slice(0, 6).forEach((line) => {
    pdf.text(line, PAGE.margin, hookY);
    hookY += 16;
  });

  // Meta strip
  const metaY = PAGE.height - 140;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, metaY - 28, PAGE.width - PAGE.margin, metaY - 28);

  const metaItems: Array<[string, string]> = [
    [t.duration, t.weeks(bundle.weeks)],
    [t.sessions, t.perWeek(bundle.sessionsPerWeek)],
    [t.goal, c.goalLabel]
  ];
  const colW = contentWidth / metaItems.length;
  metaItems.forEach(([label, value], i) => {
    const x = PAGE.margin + colW * i;
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text(label, x, metaY - 12);
    setText(pdf, PDF_THEME.textPrimary);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(value, x, metaY + 6);
  });

  if (buyerName) {
    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(
      t.licensedTo(buyerName, issued.toISOString().slice(0, 10)),
      PAGE.margin,
      PAGE.height - 60
    );
  }

  drawFooter(pdf, 1, t.bundleDossierFooter);

  // ─── Page 2: Overview ──────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.overviewEy, t.overviewTitle);

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const descLines = wrapText(pdf, c.description, contentWidth);
  let y = 130;
  descLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  // Pairing card
  y += 24;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 24;

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(t.pairsWith, PAGE.margin, y);
  y += 18;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(c.programTitle, PAGE.margin, y);
  y += 20;

  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text(t.pairedWith, PAGE.margin, y);
  y += 18;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(c.dietTitle, PAGE.margin, y);

  drawFooter(pdf, 2, c.name);

  // ─── Page 3: Training Framework ────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.trainingEy, c.programTitle);

  y = 130;
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(t.sessionLine(bundle.sessionsPerWeek, bundle.weeks), PAGE.margin, y);
  y += 28;

  c.phases.forEach((phase) => {
    drawAccentBar(pdf, PAGE.margin, y, 32, 3);
    y += 14;

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(phase.name, PAGE.margin, y);
    y += 18;

    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const focusLines = wrapText(pdf, phase.focus, contentWidth);
    focusLines.forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 14;
    });
    y += 16;
  });

  drawFooter(pdf, 3, c.name);

  // ─── Page 4: Sample Training Day ───────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.sampleEy, bundle.sampleTrainingDay.name);

  y = 130;
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text(t.sampleSub, PAGE.margin, y);
  y += 24;

  const continueTrainingPage = () => {
    drawFooter(pdf, 4, c.name);
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, t.sampleEy, `${bundle.sampleTrainingDay.name} ${t.sampleCont}`);
    y = 130;
  };
  bundle.sampleTrainingDay.exercises.forEach((ex, i) => {
    // Estimate this item's footprint before drawing.
    const noteLineCount = ex.notes ? wrapText(pdf, ex.notes, contentWidth - 60).length : 0;
    const itemHeight = 14 + noteLineCount * 12 + 16;
    if (y + itemHeight > PAGE.height - 80) {
      continueTrainingPage();
    }

    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(String(i + 1).padStart(2, "0"), PAGE.margin, y);

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    const nameLines = wrapText(pdf, ex.name, contentWidth - 200);
    pdf.text(nameLines[0] ?? ex.name, PAGE.margin + 28, y);

    setText(pdf, PDF_THEME.textMuted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(ex.sets, PAGE.width - PAGE.margin, y, { align: "right" });

    y += 14;
    if (ex.notes) {
      setText(pdf, PDF_THEME.textMuted);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      const noteLines = wrapText(pdf, ex.notes, contentWidth - 60);
      noteLines.forEach((line) => {
        pdf.text(line, PAGE.margin + 28, y);
        y += 12;
      });
    }
    setDraw(pdf, PDF_THEME.paperMuted);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.margin, y + 4, PAGE.width - PAGE.margin, y + 4);
    y += 16;
  });

  drawFooter(pdf, 4, c.name);

  // ─── Page 5: Nutrition Framework ───────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.nutritionEy, c.dietTitle);

  y = 130;
  const nutritionItems: Array<[string, string]> = [
    [t.styleLabel, c.nutrition.style],
    [t.proteinLabel, c.nutrition.proteinTarget],
    [t.calorieLabel, c.nutrition.calorieBias]
  ];

  nutritionItems.forEach(([label, value]) => {
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(label, PAGE.margin, y);
    y += 16;

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    const valueLines = wrapText(pdf, value, contentWidth);
    valueLines.forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 18;
    });
    y += 12;
  });

  y += 8;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 24;

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(t.notesLabel, PAGE.margin, y);
  y += 16;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const noteLines = wrapText(pdf, c.nutrition.notes, contentWidth);
  noteLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 16;
  });

  drawFooter(pdf, 5, c.name);

  // ─── Page 6: Sample Meal Day ──────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.mealDayEy, t.mealDayTitle);

  y = 130;
  setText(pdf, PDF_THEME.textMuted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.text(t.mealDaySub, PAGE.margin, y);
  y += 24;

  const continueMealPage = () => {
    drawFooter(pdf, 6, c.name);
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, t.mealDayEy, t.mealDayCont);
    y = 130;
  };
  bundle.sampleMealDay.forEach((meal) => {
    const itemLineCount = wrapText(pdf, meal.items, contentWidth).length;
    const itemHeight = 16 + itemLineCount * 15 + 18;
    if (y + itemHeight > PAGE.height - 80) {
      continueMealPage();
    }

    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(meal.meal.toUpperCase(), PAGE.margin, y);

    if (meal.macros) {
      setText(pdf, PDF_THEME.textMuted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(meal.macros, PAGE.width - PAGE.margin, y, { align: "right" });
    }
    y += 16;

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const itemLines = wrapText(pdf, meal.items, contentWidth);
    itemLines.forEach((line) => {
      pdf.text(line, PAGE.margin, y);
      y += 15;
    });

    setDraw(pdf, PDF_THEME.paperMuted);
    pdf.setLineWidth(0.3);
    pdf.line(PAGE.margin, y + 4, PAGE.width - PAGE.margin, y + 4);
    y += 18;
  });

  drawFooter(pdf, 6, c.name);

  // ─── New rich content sections (weekly template, progression, equipment, recipes, grocery)
  let nextPage = 7;
  const newSection = (title: string, eyebrow: string) => {
    pdf.addPage();
    fillPage(pdf, PDF_THEME.paper);
    drawInteriorHeader(pdf, title, eyebrow);
    y = 130;
  };
  const closeSection = () => {
    drawFooter(pdf, nextPage, c.name);
    nextPage += 1;
  };

  // Weekly training template
  if (bundle.weeklyTemplate?.length) {
    newSection(t.weeklyTplEy, t.weeklyTplTitle(bundle.sessionsPerWeek));
    bundle.weeklyTemplate.forEach((day) => {
      const exCount = day.exercises.length;
      const blockHeight = 70 + exCount * 14;
      if (y + blockHeight > PAGE.height - 80) {
        closeSection();
        newSection(t.weeklyTplEy, `${t.weeklyTplTitle(bundle.sessionsPerWeek)} ${t.sampleCont}`);
      }
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(`${day.day.toUpperCase()} · ${day.sessionName.toUpperCase()}`, PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.textMuted);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.text(day.focus, PAGE.margin, y);
      y += 16;
      day.exercises.forEach((ex) => {
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(`· ${ex.name}`, PAGE.margin + 4, y);
        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "bold");
        pdf.text(ex.sets, PAGE.width - PAGE.margin, y, { align: "right" });
        y += 13;
      });
      y += 12;
    });
    closeSection();
  }

  // Progression phases
  if (bundle.progression?.length) {
    newSection(t.progressionEy, t.progressionTitle);
    bundle.progression.forEach((p) => {
      drawAccentBar(pdf, PAGE.margin, y, 28, 3);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(`${p.phase} · Weeks ${p.weeks}`, PAGE.margin, y);
      y += 18;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text(t.loadingLabel, PAGE.margin, y);
      y += 12;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      wrapText(pdf, p.loadingScheme, contentWidth).forEach((line) => {
        pdf.text(line, PAGE.margin, y);
        y += 13;
      });
      y += 4;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text(t.intensityLabel, PAGE.margin, y);
      y += 12;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      wrapText(pdf, p.intensityCue, contentWidth).forEach((line) => {
        pdf.text(line, PAGE.margin, y);
        y += 13;
      });
      y += 16;
    });
    closeSection();
  }

  // Warmup / Cooldown / Equipment
  if (bundle.warmup?.length || bundle.cooldown?.length || bundle.equipment?.length) {
    newSection(t.prepEy, t.prepTitle);

    const drawList = (heading: string, items: string[]) => {
      if (!items?.length) return;
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(heading, PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      items.forEach((line) => {
        wrapText(pdf, `· ${line}`, contentWidth).forEach((l) => {
          pdf.text(l, PAGE.margin, y);
          y += 13;
        });
      });
      y += 12;
    };

    if (bundle.warmup?.length) drawList(t.warmupLabel, bundle.warmup);
    if (bundle.cooldown?.length) drawList(t.cooldownLabel, bundle.cooldown);
    if (bundle.equipment?.length) drawList(t.equipmentLabel, bundle.equipment);

    closeSection();
  }

  // Recipes — one page per recipe to keep them readable
  if (bundle.recipes?.length) {
    bundle.recipes.forEach((recipe) => {
      newSection(t.recipeEy, recipe.name);

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(`${recipe.mealType.toUpperCase()} · ${recipe.time}`, PAGE.margin, y);
      y += 20;

      // Macro strip
      const macros: Array<[string, string]> = [
        ["KCAL", String(recipe.kcal)],
        ["PROTEIN", `${recipe.protein}g`],
        ["CARBS", `${recipe.carbs}g`],
        ["FAT", `${recipe.fat}g`]
      ];
      const macW = contentWidth / macros.length;
      macros.forEach(([label, value], i) => {
        const x = PAGE.margin + macW * i;
        setText(pdf, PDF_THEME.accent);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text(label, x, y);
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(value, x, y + 16);
      });
      y += 40;

      setDraw(pdf, PDF_THEME.hairline);
      pdf.setLineWidth(0.3);
      pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
      y += 24;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(t.ingredientsLabel, PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      recipe.ingredients.forEach((ing) => {
        wrapText(pdf, `· ${ing}`, contentWidth).forEach((line) => {
          pdf.text(line, PAGE.margin, y);
          y += 13;
        });
      });
      y += 12;

      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(t.methodLabel, PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      recipe.steps.forEach((step, i) => {
        const prefix = String(i + 1).padStart(2, "0");
        wrapText(pdf, `${prefix}  ${step}`, contentWidth).forEach((line) => {
          pdf.text(line, PAGE.margin, y);
          y += 13;
        });
        y += 4;
      });

      closeSection();
    });
  }

  // Grocery list — categorized
  if (bundle.groceryList?.length) {
    newSection(t.groceryEy, t.groceryTitle);
    bundle.groceryList.forEach((group) => {
      const blockHeight = 24 + group.items.length * 13;
      if (y + blockHeight > PAGE.height - 80) {
        closeSection();
        newSection(t.groceryEy, t.groceryCont);
      }
      setText(pdf, PDF_THEME.accent);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(group.category.toUpperCase(), PAGE.margin, y);
      y += 14;
      setText(pdf, PDF_THEME.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      group.items.forEach((it) => {
        pdf.text(`☐  ${it.item}`, PAGE.margin + 4, y);
        setText(pdf, PDF_THEME.textMuted);
        pdf.setFont("helvetica", "bold");
        pdf.text(it.quantity, PAGE.width - PAGE.margin, y, { align: "right" });
        setText(pdf, PDF_THEME.ink);
        pdf.setFont("helvetica", "normal");
        y += 13;
      });
      y += 10;
    });
    closeSection();
  }

  // ─── Page N: Progression & How To Use (kept) ───────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.howToEy, t.howToTitle);

  const steps: Array<[string, string]> = t.howToSteps.map((line, i) => [
    String(i + 1).padStart(2, "0"),
    line
  ]);

  y = 130;
  steps.forEach(([num, text]) => {
    setText(pdf, PDF_THEME.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(num, PAGE.margin, y);

    setText(pdf, PDF_THEME.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const lines = wrapText(pdf, text, contentWidth - 50);
    let stepY = y - 4;
    lines.forEach((line) => {
      pdf.text(line, PAGE.margin + 44, stepY);
      stepY += 14;
    });
    y = Math.max(y + 26, stepY + 16);
  });

  drawFooter(pdf, nextPage, c.name);
  nextPage += 1;

  // ─── Recovery & License ────────────────────────────────────────────
  pdf.addPage();
  fillPage(pdf, PDF_THEME.paper);
  drawInteriorHeader(pdf, t.recoveryEy, t.recoveryTitle);

  const recovery = t.recoveryLines;

  y = 130;
  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  recovery.forEach((line) => {
    const lines = wrapText(pdf, `· ${line}`, contentWidth);
    lines.forEach((l) => {
      pdf.text(l, PAGE.margin, y);
      y += 16;
    });
    y += 6;
  });

  // License block
  y = PAGE.height - 180;
  setDraw(pdf, PDF_THEME.hairline);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 24;

  setText(pdf, PDF_THEME.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(t.licenseLabel, PAGE.margin, y);
  y += 16;

  setText(pdf, PDF_THEME.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const licenseLines = wrapText(pdf, t.licenseBody, contentWidth);
  licenseLines.forEach((line) => {
    pdf.text(line, PAGE.margin, y);
    y += 13;
  });

  drawFooter(pdf, nextPage, c.name);

  return pdf;
}
