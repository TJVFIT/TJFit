import { resolveCopyLocale } from "@/lib/i18n";
import type { Bundle } from "@/lib/bundles";

/**
 * Localization overlay for the card-facing bundle fields — name, hook, and
 * goalLabel — the strings every visitor reads on the /bundles grid and the
 * detail-page hero. English is the source of truth in `bundles.ts`; this
 * layer carries only the four non-English locales.
 *
 * The long-form catalogue (description, phases, nutrition, sample days) is
 * still English and tracked as a separate queued task.
 */

export type BundleCardCopy = { name: string; hook: string; goalLabel: string };

type NonEnLocale = "tr" | "ar" | "es" | "fr";

const BUNDLE_CARD_COPY: Record<NonEnLocale, Record<string, BundleCardCopy>> = {
  tr: {
    "fat-loss": {
      name: "Yağ Yakım Paketi",
      hook: "12 haftalık spor salonu yağ yakım protokolü — kası koruyan direnç + kardiyo ilerlemesi.",
      goalLabel: "Kesim"
    },
    "lean-bulk": {
      name: "Temiz Hacim Paketi",
      hook: "Yağlanmadan kaliteli kas ekle — kontrollü kalori fazlası + ağır bileşik ilerleme.",
      goalLabel: "Hacim"
    },
    "home-starter": {
      name: "Evde Başlangıç Paketi",
      hook: "Sıfır ekipman, haftada dört seans, eksiksiz plan — ilk 12 haftan doğru şekilde.",
      goalLabel: "Başlangıç"
    },
    definition: {
      name: "Kas Tanımı Paketi",
      hook: "Daha keskin ve tanımlı bir fizik için hipertrofi bölünmesi + sıkı kesim makroları.",
      goalLabel: "Şekil"
    },
    recomp: {
      name: "Rekomp Paketi",
      hook: "Aynı anda kas yap ve yağ yak — disiplinli makrolar, sıkı antrenman.",
      goalLabel: "Rekomp"
    },
    powerbuilding: {
      name: "Powerbuilding Paketi",
      hook: "Powerlifter gibi güç, vücut geliştirmeci gibi kütle — iki dünyanın en iyisi.",
      goalLabel: "Güç"
    },
    calisthenics: {
      name: "Kalisteni Paketi",
      hook: "Barfiksten muscle-up'a — gerçek salonlar veya parklar için vücut ağırlığı güç ilerlemeleri.",
      goalLabel: "Vücut ağırlığı"
    },
    "athlete-conditioning": {
      name: "Atlet Kondisyon Paketi",
      hook: "Dayanıklılık, iş kapasitesi ve direnç — sezon içi sporcular için tasarlandı.",
      goalLabel: "Kondisyon"
    },
    "beginner-foundations": {
      name: "Yeni Başlayan Temelleri Paketi",
      hook: "Birinci günden üçüncü aya — teknik, alışkanlık ve ilk gerçek güç kazanımların.",
      goalLabel: "Yeni başlayan"
    },
    "womens-sculpt": {
      name: "Kadınlara Özel Şekillendirme Paketi",
      hook: "Alt vücut ağırlıklı, akıllı üst vücut çalışması, kadına göre ayarlı makrolar — güçlü ve şekilli.",
      goalLabel: "Şekil"
    },
    "senior-strength": {
      name: "Senior Güç Paketi",
      hook: "50+ için eklem dostu güç, mobilite ve bunu destekleyen protein protokolü.",
      goalLabel: "50+"
    },
    "cutting-peak": {
      name: "Zirve Kesim Paketi",
      hook: "İleri seviye yarışma tarzı kesim — refeed'ler, zirve haftası, hepsi. Temeli olan sporcular için.",
      goalLabel: "Zirve"
    }
  },
  ar: {
    "fat-loss": {
      name: "حزمة حرق الدهون",
      hook: "بروتوكول حرق دهون في الصالة لمدة 12 أسبوعاً — تدرّج مقاومة وكارديو يحافظ على العضلات.",
      goalLabel: "تنشيف"
    },
    "lean-bulk": {
      name: "حزمة التضخيم النظيف",
      hook: "اكتسب عضلات نوعية دون دهون — فائض محكوم وتدرّج تمارين مركّبة ثقيلة.",
      goalLabel: "تضخيم"
    },
    "home-starter": {
      name: "حزمة البداية المنزلية",
      hook: "بدون معدات، أربع حصص أسبوعياً، خطة كاملة — أول 12 أسبوعاً بشكل صحيح.",
      goalLabel: "بداية"
    },
    definition: {
      name: "حزمة تحديد العضلات",
      hook: "تقسيم تضخيم + ماكروز تنشيف صارمة لجسم أكثر حدّة وتحديداً.",
      goalLabel: "نحت"
    },
    recomp: {
      name: "حزمة الريكومب",
      hook: "ابنِ العضلات واحرق الدهون في آنٍ واحد — ماكروز منضبطة وتدريب صارم.",
      goalLabel: "ريكومب"
    },
    powerbuilding: {
      name: "حزمة باوربيلدينغ",
      hook: "قوة كرافع أثقال وحجم كلاعب كمال أجسام — أفضل ما في العالمين.",
      goalLabel: "قوة"
    },
    calisthenics: {
      name: "حزمة الكاليسثينيكس",
      hook: "من العقلة إلى المسل أب — تدرّجات قوة بوزن الجسم مصمّمة للصالات أو الحدائق الحقيقية.",
      goalLabel: "وزن الجسم"
    },
    "athlete-conditioning": {
      name: "حزمة لياقة الرياضيين",
      hook: "لياقة هوائية وقدرة على الجهد ومرونة — مصمّمة للرياضيين خلال الموسم.",
      goalLabel: "لياقة"
    },
    "beginner-foundations": {
      name: "حزمة أساسيات المبتدئين",
      hook: "من اليوم الأول إلى الشهر الثالث — التقنية والعادة وأول مكاسب قوة حقيقية لك.",
      goalLabel: "مبتدئ"
    },
    "womens-sculpt": {
      name: "حزمة النحت النسائي",
      hook: "تركيز على الجزء السفلي، عمل ذكي للجزء العلوي، ماكروز مضبوطة للنساء — قوة وتناسق.",
      goalLabel: "نحت"
    },
    "senior-strength": {
      name: "حزمة قوة كبار السن",
      hook: "قوة لطيفة على المفاصل لمن هم فوق الخمسين، ومرونة، وبروتوكول بروتين يدعمها.",
      goalLabel: "50+"
    },
    "cutting-peak": {
      name: "حزمة ذروة التنشيف",
      hook: "تنشيف متقدّم بأسلوب المسابقات — وجبات إعادة تغذية وأسبوع ذروة وكل التفاصيل. للرافعين ذوي القاعدة.",
      goalLabel: "ذروة"
    }
  },
  es: {
    "fat-loss": {
      name: "Paquete de Pérdida de Grasa",
      hook: "Protocolo de pérdida de grasa en gimnasio de 12 semanas — progresión de resistencia + cardio que preserva el músculo.",
      goalLabel: "Definición"
    },
    "lean-bulk": {
      name: "Paquete de Volumen Limpio",
      hook: "Gana músculo de calidad sin grasa — superávit controlado + progresión de compuestos pesados.",
      goalLabel: "Volumen"
    },
    "home-starter": {
      name: "Paquete Inicio en Casa",
      hook: "Cero equipo, cuatro sesiones por semana, plan completo — tus primeras 12 semanas bien hechas.",
      goalLabel: "Inicio"
    },
    definition: {
      name: "Paquete de Definición Muscular",
      hook: "Rutina dividida de hipertrofia + macros de definición estricta para un físico más marcado y definido.",
      goalLabel: "Modelado"
    },
    recomp: {
      name: "Paquete de Recomposición",
      hook: "Gana músculo y elimina grasa al mismo tiempo — macros disciplinadas, entrenamiento duro.",
      goalLabel: "Recomp"
    },
    powerbuilding: {
      name: "Paquete de Powerbuilding",
      hook: "Fuerza de powerlifter, tamaño de culturista — lo mejor de ambos mundos.",
      goalLabel: "Fuerza"
    },
    calisthenics: {
      name: "Paquete de Calistenia",
      hook: "De la dominada al muscle-up — progresiones de fuerza con peso corporal para gimnasios o parques reales.",
      goalLabel: "Peso corporal"
    },
    "athlete-conditioning": {
      name: "Paquete de Acondicionamiento Atlético",
      hook: "Motor, capacidad de trabajo y resiliencia — diseñado para atletas en temporada.",
      goalLabel: "Acondicionamiento"
    },
    "beginner-foundations": {
      name: "Paquete de Fundamentos para Principiantes",
      hook: "Del día uno al tercer mes — técnica, hábito y tus primeras ganancias reales de fuerza.",
      goalLabel: "Principiante"
    },
    "womens-sculpt": {
      name: "Paquete Sculpt para Mujeres",
      hook: "Énfasis en tren inferior, trabajo inteligente de tren superior, macros ajustadas para mujeres — fuerte y moldeada.",
      goalLabel: "Modelado"
    },
    "senior-strength": {
      name: "Paquete de Fuerza Senior",
      hook: "Fuerza amable con las articulaciones para 50+, movilidad y el protocolo de proteína que lo respalda.",
      goalLabel: "50+"
    },
    "cutting-peak": {
      name: "Paquete de Pico de Definición",
      hook: "Definición avanzada estilo competición — recargas, semana pico, todo. Para levantadores con base.",
      goalLabel: "Pico"
    }
  },
  fr: {
    "fat-loss": {
      name: "Pack Perte de Graisse",
      hook: "Protocole de perte de graisse en salle sur 12 semaines — progression résistance + cardio qui préserve le muscle.",
      goalLabel: "Sèche"
    },
    "lean-bulk": {
      name: "Pack Prise de Masse Propre",
      hook: "Prends du muscle de qualité sans le gras — surplus maîtrisé + progression sur les exercices lourds.",
      goalLabel: "Masse"
    },
    "home-starter": {
      name: "Pack Démarrage à la Maison",
      hook: "Zéro équipement, quatre séances par semaine, plan complet — tes 12 premières semaines réussies.",
      goalLabel: "Départ"
    },
    definition: {
      name: "Pack Définition Musculaire",
      hook: "Split d'hypertrophie + macros de sèche stricte pour un physique plus net et plus défini.",
      goalLabel: "Galbe"
    },
    recomp: {
      name: "Pack Recomposition",
      hook: "Construis du muscle et élimine le gras en même temps — macros disciplinées, entraînement intense.",
      goalLabel: "Recomp"
    },
    powerbuilding: {
      name: "Pack Powerbuilding",
      hook: "La force d'un powerlifter, le volume d'un bodybuilder — le meilleur des deux mondes.",
      goalLabel: "Force"
    },
    calisthenics: {
      name: "Pack Callisthénie",
      hook: "De la traction au muscle-up — progressions de force au poids du corps pour salles ou parcs.",
      goalLabel: "Poids du corps"
    },
    "athlete-conditioning": {
      name: "Pack Conditionnement Athlétique",
      hook: "Cardio, capacité de travail et résilience — conçu pour les athlètes en saison.",
      goalLabel: "Conditionnement"
    },
    "beginner-foundations": {
      name: "Pack Fondations Débutant",
      hook: "Du premier jour au troisième mois — technique, habitude et tes premiers vrais gains de force.",
      goalLabel: "Débutant"
    },
    "womens-sculpt": {
      name: "Pack Galbe Femme",
      hook: "Accent bas du corps, travail malin du haut, macros ajustées au féminin — forte et galbée.",
      goalLabel: "Galbe"
    },
    "senior-strength": {
      name: "Pack Force Senior",
      hook: "Force respectueuse des articulations pour les 50+, mobilité et le protocole protéine qui va avec.",
      goalLabel: "50+"
    },
    "cutting-peak": {
      name: "Pack Pic de Sèche",
      hook: "Sèche avancée façon compétition — recharges, semaine de pic, tout y est. Pour les pratiquants avec une base.",
      goalLabel: "Pic"
    }
  }
};

/**
 * Returns the card-facing copy (name, hook, goalLabel) for a bundle in the
 * given locale. English passes through from the bundle itself; any locale or
 * slug without an override also falls back to English so nothing breaks.
 */
export function localizeBundleCard(bundle: Bundle, locale: string): BundleCardCopy {
  const fallback: BundleCardCopy = {
    name: bundle.name,
    hook: bundle.hook,
    goalLabel: bundle.goalLabel
  };
  const loc = resolveCopyLocale(locale);
  if (loc === "en") return fallback;
  return BUNDLE_CARD_COPY[loc][bundle.slug] ?? fallback;
}
