import { resolveCopyLocale } from "@/lib/i18n";
import type { Bundle } from "@/lib/bundles";

/**
 * Localization overlay for the prose bundle fields — name, hook, goalLabel,
 * programTitle, dietTitle, and description — everything a visitor reads on
 * the /bundles grid and the detail page outside the structured data tables.
 * English is the source of truth in `bundles.ts`; this layer carries the
 * four non-English locales.
 *
 * The structured catalogue (phases, nutrition, sampleTrainingDay,
 * sampleMealDay) is still English and tracked as a separate queued task.
 */

export type BundleNutrition = {
  style: string;
  proteinTarget: string;
  calorieBias: string;
  notes: string;
};

export type BundlePhase = { name: string; focus: string };

export type BundleCopy = {
  name: string;
  hook: string;
  goalLabel: string;
  programTitle: string;
  dietTitle: string;
  description: string;
  nutrition: BundleNutrition;
  phases: BundlePhase[];
};

type NonEnLocale = "tr" | "ar" | "es" | "fr";

/** Prose fields only — `nutrition` + `phases` live in their own maps below. */
type BundleProseCopy = Omit<BundleCopy, "nutrition" | "phases">;

const BUNDLE_COPY: Record<NonEnLocale, Record<string, BundleProseCopy>> = {
  tr: {
    "fat-loss": {
      name: "Yağ Yakım Paketi",
      hook: "12 haftalık spor salonu yağ yakım protokolü — kası koruyan direnç + kardiyo ilerlemesi.",
      goalLabel: "Kesim",
      programTitle: "Salonda Yağ Yakım Protokolü",
      dietTitle: "Temiz Kesim Diyeti",
      description:
        "Direnç odaklı 12 haftalık bir kesim. Bileşik hareketler kası korur, kondisyon blokları günlük enerji harcamasını artırır ve diyet kontrollü bir açıkta proteini yüksek tutar."
    },
    "lean-bulk": {
      name: "Temiz Hacim Paketi",
      hook: "Yağlanmadan kaliteli kas ekle — kontrollü kalori fazlası + ağır bileşik ilerleme.",
      goalLabel: "Hacim",
      programTitle: "Salonda Kütle Geliştirici",
      dietTitle: "Temiz Hacim Diyeti",
      description:
        "Küçük bir kalori fazlası üzerine kurulu it-çek-bacak hipertrofi bölünmesi. Ağır bileşik hareketler gücü, yardımcı hacim ise kütleyi artırır; diyet kazanç oranını temiz tutar."
    },
    "home-starter": {
      name: "Evde Başlangıç Paketi",
      hook: "Sıfır ekipman, haftada dört seans, eksiksiz plan — ilk 12 haftan doğru şekilde.",
      goalLabel: "Başlangıç",
      programTitle: "Evde Yağ Yakım Başlangıcı",
      dietTitle: "Temiz Kesim Başlangıcı",
      description:
        "Giriş rampası. Haftada dört kısa vücut ağırlığı seansı, gerçekten uygulayabileceğin bir kalori çerçevesi ve 3. ayı 1. aydan farklı hissettiren bir ilerleme modeli."
    },
    definition: {
      name: "Kas Tanımı Paketi",
      hook: "Daha keskin ve tanımlı bir fizik için hipertrofi bölünmesi + sıkı kesim makroları.",
      goalLabel: "Şekil",
      programTitle: "Hipertrofi Sistemi",
      dietTitle: "Sıkı Kesim Atlet Diyeti",
      description:
        "Hacim açısından zengin hipertrofi antrenmanı, agresif bir kesimle birleşiyor. Halihazırda kası olan ve onu görmek isteyen sporcular için. Yüksek protein, yapılandırılmış kardiyo, haftalık refeed'ler."
    },
    recomp: {
      name: "Rekomp Paketi",
      hook: "Aynı anda kas yap ve yağ yak — disiplinli makrolar, sıkı antrenman.",
      goalLabel: "Rekomp",
      programTitle: "Rekompozisyon Protokolü",
      dietTitle: "Rekomp Makro Sistemi",
      description:
        "İyi uygulanması en zor plan. Koruma kalorileri, cerrahi hassasiyette makro zamanlaması ve uzun vadede vücut kompozisyonunu değiştiren progresif aşırı yükleme."
    },
    powerbuilding: {
      name: "Powerbuilding Paketi",
      hook: "Powerlifter gibi güç, vücut geliştirmeci gibi kütle — iki dünyanın en iyisi.",
      goalLabel: "Güç",
      programTitle: "Powerbuilding Sistemi",
      dietTitle: "Güç Atleti Diyeti",
      description:
        "Ağır ana hareketler (squat, bench, deadlift, OHP) hipertrofi yardımcılarıyla eşleştirildi. Büyük dörtlüde doğrusal güç ilerlemesi, geri kalan her şeyde hacim odaklı kütle."
    },
    calisthenics: {
      name: "Kalisteni Paketi",
      hook: "Barfiksten muscle-up'a — gerçek salonlar veya parklar için vücut ağırlığı güç ilerlemeleri.",
      goalLabel: "Vücut ağırlığı",
      programTitle: "Kalisteni İlerlemesi",
      dietTitle: "Atlet Koruma Diyeti",
      description:
        "Sağlam barfikslerden temiz muscle-up'lara, amuda kalkışlara ve tek bacak squatlara uzanan, yalnızca vücut ağırlığıyla bir yol. Beceri çalışması, güç çalışması ve ikisini de destekleyen beslenme."
    },
    "athlete-conditioning": {
      name: "Atlet Kondisyon Paketi",
      hook: "Dayanıklılık, iş kapasitesi ve direnç — sezon içi sporcular için tasarlandı.",
      goalLabel: "Kondisyon",
      programTitle: "Atlet GPP Protokolü",
      dietTitle: "Performans Beslenme Diyeti",
      description:
        "Spor için genel fiziksel hazırlık. Karma modlu kondisyon, sprint çalışması, güç koruma ve bunu sürdürecek karbonhidrat ağırlıklı beslenme stratejisi."
    },
    "beginner-foundations": {
      name: "Yeni Başlayan Temelleri Paketi",
      hook: "Birinci günden üçüncü aya — teknik, alışkanlık ve ilk gerçek güç kazanımların.",
      goalLabel: "Yeni başlayan",
      programTitle: "Temel Güç",
      dietTitle: "Yeni Başlayan Beslenme Sistemi",
      description:
        "Haftada üç seans, önemli olan altı hareket ve yiyecek tartmadan sürdürebileceğin bir beslenme çerçevesi. Daha önce hiç ciddi şekilde antrenman yapmamış biri için tasarlandı."
    },
    "womens-sculpt": {
      name: "Kadınlara Özel Şekillendirme Paketi",
      hook: "Alt vücut ağırlıklı, akıllı üst vücut çalışması, kadına göre ayarlı makrolar — güçlü ve şekilli.",
      goalLabel: "Şekil",
      programTitle: "Kadınlar İçin Güç ve Şekillendirme",
      dietTitle: "Kadın Performans Diyeti",
      description:
        "Kalça odaklı alt vücut günleri, dengeli üst vücut çalışması ve bir kadının antrenman haftasına göre ayarlanmış bir beslenme planı. Önce güç, sonuç olarak şekil."
    },
    "senior-strength": {
      name: "Senior Güç Paketi",
      hook: "50+ için eklem dostu güç, mobilite ve bunu destekleyen protein protokolü.",
      goalLabel: "50+",
      programTitle: "Ömür Boyu Güç Protokolü",
      dietTitle: "Uzun Ömür Beslenme Sistemi",
      description:
        "Eklem uzun ömürlülüğü etrafında kurulu güç antrenmanı. Gerektiğinde halter yerine makineler ve dambıllar, her seansa entegre edilmiş mobilite ve 50 yaş üstü sporcu için protein ağırlıklı bir diyet."
    },
    "cutting-peak": {
      name: "Zirve Kesim Paketi",
      hook: "İleri seviye yarışma tarzı kesim — refeed'ler, zirve haftası, hepsi. Temeli olan sporcular için.",
      goalLabel: "Zirve",
      programTitle: "Zirve Kesim Protokolü",
      dietTitle: "Yarışma Hazırlık Makro Sistemi",
      description:
        "İleri seviye kesim. Halihazırda kası olan ve zirveye ulaşmak isteyen sporcular için tasarlandı. Yapılandırılmış refeed'ler, haftalık kontroller, zirve haftası protokolü ve buna uygun disiplin."
    }
  },
  ar: {
    "fat-loss": {
      name: "حزمة حرق الدهون",
      hook: "بروتوكول حرق دهون في الصالة لمدة 12 أسبوعاً — تدرّج مقاومة وكارديو يحافظ على العضلات.",
      goalLabel: "تنشيف",
      programTitle: "بروتوكول حرق الدهون في الصالة",
      dietTitle: "حمية التنشيف النظيفة",
      description:
        "تنشيف بقيادة تمارين المقاومة لمدة 12 أسبوعاً. تحافظ التمارين المركّبة على العضلات، وترفع كتل اللياقة إنفاق الطاقة اليومي، وتُبقي الحمية البروتين مرتفعاً ضمن عجز محكوم."
    },
    "lean-bulk": {
      name: "حزمة التضخيم النظيف",
      hook: "اكتسب عضلات نوعية دون دهون — فائض محكوم وتدرّج تمارين مركّبة ثقيلة.",
      goalLabel: "تضخيم",
      programTitle: "باني الكتلة في الصالة",
      dietTitle: "حمية التضخيم النظيف",
      description:
        "تقسيم تضخيم دفع-سحب-أرجل مبني على فائض صغير. تقود التمارين المركّبة الثقيلة القوة، ويقود الحجم المساعد الكتلة، وتُبقي الحمية نسبة الاكتساب نظيفة."
    },
    "home-starter": {
      name: "حزمة البداية المنزلية",
      hook: "بدون معدات، أربع حصص أسبوعياً، خطة كاملة — أول 12 أسبوعاً بشكل صحيح.",
      goalLabel: "بداية",
      programTitle: "بداية حرق الدهون المنزلية",
      dietTitle: "بداية التنشيف النظيف",
      description:
        "نقطة الانطلاق. أربع حصص قصيرة بوزن الجسم أسبوعياً، وإطار سعرات يمكنك الالتزام به فعلاً، ونموذج تدرّج يجعل الشهر الثالث مختلفاً عن الشهر الأول."
    },
    definition: {
      name: "حزمة تحديد العضلات",
      hook: "تقسيم تضخيم + ماكروز تنشيف صارمة لجسم أكثر حدّة وتحديداً.",
      goalLabel: "نحت",
      programTitle: "نظام التضخيم العضلي",
      dietTitle: "حمية التنشيف الصارمة للرياضيين",
      description:
        "تدريب تضخيم غني بالحجم مقترن بتنشيف قوي. لمن لديهم عضلات بالفعل ويريدون إظهارها. بروتين عالٍ، وكارديو منظّم، ووجبات إعادة تغذية أسبوعية."
    },
    recomp: {
      name: "حزمة الريكومب",
      hook: "ابنِ العضلات واحرق الدهون في آنٍ واحد — ماكروز منضبطة وتدريب صارم.",
      goalLabel: "ريكومب",
      programTitle: "بروتوكول إعادة التكوين",
      dietTitle: "نظام ماكروز الريكومب",
      description:
        "أصعب خطة لإتقانها. سعرات الحفاظ، وتوقيت ماكروز دقيق، وحمل تصاعدي يغيّر تكوين الجسم على المدى الطويل."
    },
    powerbuilding: {
      name: "حزمة باوربيلدينغ",
      hook: "قوة كرافع أثقال وحجم كلاعب كمال أجسام — أفضل ما في العالمين.",
      goalLabel: "قوة",
      programTitle: "نظام الباوربيلدينغ",
      dietTitle: "حمية رياضيي القوة",
      description:
        "تمارين رئيسية ثقيلة (سكوات، بنش، ديدليفت، ضغط كتف) مقترنة بتمارين تضخيم مساعدة. تقدّم قوة خطّي في الأربعة الكبار، وحجم مدفوع بالأحمال في كل ما عداها."
    },
    calisthenics: {
      name: "حزمة الكاليسثينيكس",
      hook: "من العقلة إلى المسل أب — تدرّجات قوة بوزن الجسم مصمّمة للصالات أو الحدائق الحقيقية.",
      goalLabel: "وزن الجسم",
      programTitle: "تدرّج الكاليسثينيكس",
      dietTitle: "حمية الحفاظ للرياضيين",
      description:
        "مسار بوزن الجسم فقط من العقلات المتينة إلى المسل أب النظيف والوقوف على اليدين وسكوات المسدس. عمل على المهارة، وعمل على القوة، والتغذية التي تدعم كليهما."
    },
    "athlete-conditioning": {
      name: "حزمة لياقة الرياضيين",
      hook: "لياقة هوائية وقدرة على الجهد ومرونة — مصمّمة للرياضيين خلال الموسم.",
      goalLabel: "لياقة",
      programTitle: "بروتوكول الإعداد البدني العام للرياضيين",
      dietTitle: "حمية تغذية الأداء",
      description:
        "إعداد بدني عام للرياضة. لياقة متعددة الأنماط، وعمل على السرعة، والحفاظ على القوة، واستراتيجية تغذية غنية بالكربوهيدرات لاستدامتها."
    },
    "beginner-foundations": {
      name: "حزمة أساسيات المبتدئين",
      hook: "من اليوم الأول إلى الشهر الثالث — التقنية والعادة وأول مكاسب قوة حقيقية لك.",
      goalLabel: "مبتدئ",
      programTitle: "قوة الأساسيات",
      dietTitle: "نظام تغذية المبتدئين",
      description:
        "ثلاث حصص أسبوعياً، والتمارين الستة المهمة، وإطار تغذية يمكنك الاستمرار عليه دون وزن الطعام. مصمّم لمن لم يتدرّب بجدية من قبل."
    },
    "womens-sculpt": {
      name: "حزمة النحت النسائي",
      hook: "تركيز على الجزء السفلي، عمل ذكي للجزء العلوي، ماكروز مضبوطة للنساء — قوة وتناسق.",
      goalLabel: "نحت",
      programTitle: "قوة ونحت للنساء",
      dietTitle: "حمية الأداء النسائية",
      description:
        "أيام سفلية تركّز على عضلات المؤخرة، وعمل علوي متوازن، وخطة تغذية مضبوطة على أسبوع تدريب المرأة. القوة أولاً، والتناسق نتيجةً لها."
    },
    "senior-strength": {
      name: "حزمة قوة كبار السن",
      hook: "50+ للقوة اللطيفة على المفاصل والمرونة وبروتوكول البروتين الداعم.",
      goalLabel: "50+",
      programTitle: "بروتوكول القوة مدى الحياة",
      dietTitle: "نظام تغذية طول العمر",
      description:
        "تدريب قوة مبني حول طول عمر المفاصل. أجهزة ودمبلز بدلاً من البار حيث يهمّ ذلك، ومرونة مدمجة في كل حصة، وحمية غنية بالبروتين للرياضي فوق الخمسين."
    },
    "cutting-peak": {
      name: "حزمة ذروة التنشيف",
      hook: "تنشيف متقدّم بأسلوب المسابقات — وجبات إعادة تغذية وأسبوع ذروة وكل التفاصيل. للرافعين ذوي القاعدة.",
      goalLabel: "ذروة",
      programTitle: "بروتوكول التنشيف للذروة",
      dietTitle: "نظام ماكروز التحضير للمسابقات",
      description:
        "التنشيف المتقدّم. مصمّم للرافعين الذين لديهم عضلات بالفعل ويريدون الوصول إلى الذروة. وجبات إعادة تغذية منظّمة، ومتابعات أسبوعية، وبروتوكول أسبوع الذروة، والانضباط المطابق."
    }
  },
  es: {
    "fat-loss": {
      name: "Paquete de Pérdida de Grasa",
      hook: "Protocolo de pérdida de grasa en gimnasio de 12 semanas — progresión de resistencia + cardio que preserva el músculo.",
      goalLabel: "Definición",
      programTitle: "Protocolo de Pérdida de Grasa en Gimnasio",
      dietTitle: "Dieta de Definición Limpia",
      description:
        "Un corte de 12 semanas guiado por la resistencia. Los levantamientos compuestos mantienen el músculo, los bloques de acondicionamiento elevan el gasto energético diario y la dieta mantiene la proteína alta a través de un déficit controlado."
    },
    "lean-bulk": {
      name: "Paquete de Volumen Limpio",
      hook: "Gana músculo de calidad sin grasa — superávit controlado + progresión de compuestos pesados.",
      goalLabel: "Volumen",
      programTitle: "Constructor de Masa en Gimnasio",
      dietTitle: "Dieta de Volumen Limpio",
      description:
        "Rutina dividida de hipertrofia empuje-tirón-piernas sobre un pequeño superávit. Los compuestos pesados impulsan la fuerza, el volumen accesorio impulsa el tamaño y la dieta mantiene limpia la proporción de ganancia."
    },
    "home-starter": {
      name: "Paquete Inicio en Casa",
      hook: "Cero equipo, cuatro sesiones por semana, plan completo — tus primeras 12 semanas bien hechas.",
      goalLabel: "Inicio",
      programTitle: "Inicio de Pérdida de Grasa en Casa",
      dietTitle: "Inicio de Definición Limpia",
      description:
        "La rampa de entrada. Cuatro sesiones cortas con peso corporal por semana, un marco de calorías que realmente puedes seguir y un modelo de progresión que hace que el mes 3 se sienta diferente del mes 1."
    },
    definition: {
      name: "Paquete de Definición Muscular",
      hook: "Rutina dividida de hipertrofia + macros de definición estricta para un físico más marcado y definido.",
      goalLabel: "Modelado",
      programTitle: "Sistema de Hipertrofia",
      dietTitle: "Dieta de Definición Estricta para Atletas",
      description:
        "Entrenamiento de hipertrofia rico en volumen unido a un corte agresivo. Para levantadores que ya tienen músculo y quieren verlo. Proteína alta, cardio estructurado, recargas semanales."
    },
    recomp: {
      name: "Paquete de Recomposición",
      hook: "Gana músculo y elimina grasa al mismo tiempo — macros disciplinadas, entrenamiento duro.",
      goalLabel: "Recomp",
      programTitle: "Protocolo de Recomposición",
      dietTitle: "Sistema de Macros Recomp",
      description:
        "El plan más difícil de hacer bien. Calorías de mantenimiento, sincronización quirúrgica de macros y sobrecarga progresiva que transforma la composición corporal en el largo plazo."
    },
    powerbuilding: {
      name: "Paquete de Powerbuilding",
      hook: "Fuerza de powerlifter, tamaño de culturista — lo mejor de ambos mundos.",
      goalLabel: "Fuerza",
      programTitle: "Sistema de Powerbuilding",
      dietTitle: "Dieta de Atleta de Fuerza",
      description:
        "Levantamientos principales pesados (sentadilla, press de banca, peso muerto, press militar) combinados con accesorios de hipertrofia. Progresión lineal de fuerza en los cuatro grandes, tamaño impulsado por volumen en todo lo demás."
    },
    calisthenics: {
      name: "Paquete de Calistenia",
      hook: "De la dominada al muscle-up — progresiones de fuerza con peso corporal para gimnasios o parques reales.",
      goalLabel: "Peso corporal",
      programTitle: "Progresión de Calistenia",
      dietTitle: "Dieta de Mantenimiento para Atletas",
      description:
        "Un camino solo con peso corporal desde dominadas sólidas hasta muscle-ups limpios, paradas de manos y sentadillas a una pierna. Trabajo de habilidad, trabajo de fuerza y la nutrición para sostener ambos."
    },
    "athlete-conditioning": {
      name: "Paquete de Acondicionamiento Atlético",
      hook: "Motor, capacidad de trabajo y resiliencia — diseñado para atletas en temporada.",
      goalLabel: "Acondicionamiento",
      programTitle: "Protocolo GPP para Atletas",
      dietTitle: "Dieta de Combustible para el Rendimiento",
      description:
        "Preparación física general para el deporte. Acondicionamiento multimodal, trabajo de sprint, mantenimiento de fuerza y la estrategia de combustible rica en carbohidratos para sostenerlo."
    },
    "beginner-foundations": {
      name: "Paquete de Fundamentos para Principiantes",
      hook: "Del día uno al tercer mes — técnica, hábito y tus primeras ganancias reales de fuerza.",
      goalLabel: "Principiante",
      programTitle: "Fuerza de Fundamentos",
      dietTitle: "Sistema de Nutrición para Principiantes",
      description:
        "Tres sesiones por semana, los seis levantamientos que importan y un marco de nutrición que puedes sostener sin pesar la comida. Creado para alguien que nunca ha entrenado en serio."
    },
    "womens-sculpt": {
      name: "Paquete Sculpt para Mujeres",
      hook: "Énfasis en tren inferior, trabajo inteligente de tren superior, macros ajustadas para mujeres — fuerte y moldeada.",
      goalLabel: "Modelado",
      programTitle: "Fuerza y Modelado para Mujeres",
      dietTitle: "Dieta de Rendimiento para Mujeres",
      description:
        "Días de tren inferior centrados en glúteos, trabajo de tren superior equilibrado y un plan de nutrición ajustado a la semana de entrenamiento de una mujer. Primero la fuerza, la forma como resultado."
    },
    "senior-strength": {
      name: "Paquete de Fuerza Senior",
      hook: "Fuerza amable con las articulaciones para 50+, movilidad y el protocolo de proteína que lo respalda.",
      goalLabel: "50+",
      programTitle: "Protocolo de Fuerza para Toda la Vida",
      dietTitle: "Sistema de Nutrición de Longevidad",
      description:
        "Entrenamiento de fuerza construido en torno a la longevidad de las articulaciones. Máquinas y mancuernas en lugar de barras donde importa, movilidad integrada en cada sesión y una dieta rica en proteína para el atleta mayor de 50."
    },
    "cutting-peak": {
      name: "Paquete de Pico de Definición",
      hook: "Definición avanzada estilo competición — recargas, semana pico, todo. Para levantadores con base.",
      goalLabel: "Pico",
      programTitle: "Protocolo de Definición de Pico",
      dietTitle: "Sistema de Macros de Preparación para Competición",
      description:
        "El corte avanzado. Diseñado para levantadores que ya tienen músculo y quieren llegar al pico. Recargas estructuradas, controles semanales, protocolo de semana pico y la disciplina a la altura."
    }
  },
  fr: {
    "fat-loss": {
      name: "Pack Perte de Graisse",
      hook: "Protocole de perte de graisse en salle sur 12 semaines — progression résistance + cardio qui préserve le muscle.",
      goalLabel: "Sèche",
      programTitle: "Protocole Perte de Graisse en Salle",
      dietTitle: "Diète de Sèche Propre",
      description:
        "Une sèche de 12 semaines menée par la résistance. Les exercices composés préservent le muscle, les blocs de conditionnement augmentent la dépense énergétique quotidienne, et la diète maintient les protéines élevées dans un déficit maîtrisé."
    },
    "lean-bulk": {
      name: "Pack Prise de Masse Propre",
      hook: "Prends du muscle de qualité sans le gras — surplus maîtrisé + progression sur les exercices lourds.",
      goalLabel: "Masse",
      programTitle: "Constructeur de Masse en Salle",
      dietTitle: "Diète Prise de Masse Propre",
      description:
        "Split d'hypertrophie poussé-tiré-jambes sur un léger surplus. Les exercices composés lourds développent la force, le volume accessoire développe le gabarit, et la diète garde un ratio de gain propre."
    },
    "home-starter": {
      name: "Pack Démarrage à la Maison",
      hook: "Zéro équipement, quatre séances par semaine, plan complet — tes 12 premières semaines réussies.",
      goalLabel: "Départ",
      programTitle: "Démarrage Perte de Graisse à la Maison",
      dietTitle: "Démarrage Sèche Propre",
      description:
        "La rampe d'accès. Quatre courtes séances au poids du corps par semaine, un cadre calorique que tu peux vraiment suivre, et un modèle de progression qui rend le mois 3 différent du mois 1."
    },
    definition: {
      name: "Pack Définition Musculaire",
      hook: "Split d'hypertrophie + macros de sèche stricte pour un physique plus net et plus défini.",
      goalLabel: "Galbe",
      programTitle: "Système d'Hypertrophie",
      dietTitle: "Diète de Sèche Stricte pour Athlètes",
      description:
        "Entraînement d'hypertrophie riche en volume associé à une sèche agressive. Pour les pratiquants qui ont déjà du muscle et veulent le voir. Protéines élevées, cardio structuré, recharges hebdomadaires."
    },
    recomp: {
      name: "Pack Recomposition",
      hook: "Construis du muscle et élimine le gras en même temps — macros disciplinées, entraînement intense.",
      goalLabel: "Recomp",
      programTitle: "Protocole de Recomposition",
      dietTitle: "Système de Macros Recomp",
      description:
        "Le plan le plus difficile à bien mener. Calories de maintien, timing chirurgical des macros, et surcharge progressive qui transforme la composition corporelle sur le long terme."
    },
    powerbuilding: {
      name: "Pack Powerbuilding",
      hook: "La force d'un powerlifter, le volume d'un bodybuilder — le meilleur des deux mondes.",
      goalLabel: "Force",
      programTitle: "Système de Powerbuilding",
      dietTitle: "Diète Athlète de Force",
      description:
        "Mouvements principaux lourds (squat, développé couché, soulevé de terre, développé militaire) associés à des accessoires d'hypertrophie. Progression linéaire de force sur les quatre grands, volume pour le reste."
    },
    calisthenics: {
      name: "Pack Callisthénie",
      hook: "De la traction au muscle-up — progressions de force au poids du corps pour salles ou parcs.",
      goalLabel: "Poids du corps",
      programTitle: "Progression Callisthénie",
      dietTitle: "Diète de Maintien Athlète",
      description:
        "Un parcours uniquement au poids du corps, des tractions solides aux muscle-ups propres, équilibres et squats sur une jambe. Travail technique, travail de force, et la nutrition pour soutenir les deux."
    },
    "athlete-conditioning": {
      name: "Pack Conditionnement Athlétique",
      hook: "Cardio, capacité de travail et résilience — conçu pour les athlètes en saison.",
      goalLabel: "Conditionnement",
      programTitle: "Protocole GPP Athlète",
      dietTitle: "Diète de Carburant Performance",
      description:
        "Préparation physique générale pour le sport. Conditionnement multimodal, travail de sprint, maintien de la force, et la stratégie d'alimentation riche en glucides pour tenir."
    },
    "beginner-foundations": {
      name: "Pack Fondations Débutant",
      hook: "Du premier jour au troisième mois — technique, habitude et tes premiers vrais gains de force.",
      goalLabel: "Débutant",
      programTitle: "Force Fondations",
      dietTitle: "Système de Nutrition Débutant",
      description:
        "Trois séances par semaine, les six mouvements qui comptent, et un cadre nutritionnel que tu peux tenir sans peser tes aliments. Conçu pour quelqu'un qui n'a jamais vraiment soulevé de fonte."
    },
    "womens-sculpt": {
      name: "Pack Galbe Femme",
      hook: "Accent bas du corps, travail malin du haut, macros ajustées au féminin — forte et galbée.",
      goalLabel: "Galbe",
      programTitle: "Force et Galbe Femme",
      dietTitle: "Diète Performance Femme",
      description:
        "Jours du bas du corps axés sur les fessiers, travail du haut équilibré, et un plan nutritionnel ajusté à la semaine d'entraînement d'une femme. La force d'abord, la forme comme résultat."
    },
    "senior-strength": {
      name: "Pack Force Senior",
      hook: "Force respectueuse des articulations pour les 50+, mobilité et le protocole protéine qui va avec.",
      goalLabel: "50+",
      programTitle: "Protocole Force pour la Vie",
      dietTitle: "Système de Nutrition Longévité",
      description:
        "Entraînement de force construit autour de la longévité des articulations. Machines et haltères plutôt que barres là où ça compte, mobilité intégrée à chaque séance, et une diète riche en protéines pour l'athlète de plus de 50 ans."
    },
    "cutting-peak": {
      name: "Pack Pic de Sèche",
      hook: "Sèche avancée façon compétition — recharges, semaine de pic, tout y est. Pour les pratiquants avec une base.",
      goalLabel: "Pic",
      programTitle: "Protocole Sèche de Pic",
      dietTitle: "Système de Macros Prépa Compétition",
      description:
        "La sèche avancée. Conçue pour les pratiquants qui ont déjà du muscle et veulent atteindre leur pic. Recharges structurées, suivis hebdomadaires, protocole de semaine de pic, et la discipline qui va avec."
    }
  }
};

/**
 * Localized `nutrition` block per bundle slug. Kept as a separate map so the
 * prose overlay above stays untouched. English comes from `bundles.ts`.
 */
const BUNDLE_NUTRITION: Record<NonEnLocale, Record<string, BundleNutrition>> = {
  tr: {
    "fat-loss": {
      style: "Temiz kesim · önce tam gıda",
      proteinTarget: "1.0 g / lb vücut ağırlığı",
      calorieBias: "İdameden -%15",
      notes: "İki refeed haftası dahil. Karbonhidratlar antrenman günlerine göre döngülenir."
    },
    "lean-bulk": {
      style: "Temiz hacim · %80/20 tam gıda",
      proteinTarget: "1.0 g / lb vücut ağırlığı",
      calorieBias: "İdamenin +%10 üzeri",
      notes: "Yavaş kazanç hedefi: haftada 0.5-1 lb. Her 4 haftada yeniden temel al."
    },
    "home-starter": {
      style: "Yeni başlayana uygun kesim",
      proteinTarget: "0.8 g / lb vücut ağırlığı",
      calorieBias: "İdameden -%10",
      notes: "Tabak temelli porsiyon — ilk 4 hafta tartım gerekmez."
    },
    definition: {
      style: "Sıkı kesim · makro takipli",
      proteinTarget: "1.2 g / lb vücut ağırlığı",
      calorieBias: "İdameden -%20",
      notes: "Haftalık refeed günü. Karbonhidratlar antrenman çevresinde öne yüklenir."
    },
    recomp: {
      style: "İdame · yüksek protein",
      proteinTarget: "1.1 g / lb vücut ağırlığı",
      calorieBias: "İdamede",
      notes: "Karbonhidrat döngüsü: antrenman günlerinde yüksek, dinlenme günlerinde orta."
    },
    powerbuilding: {
      style: "Güç odaklı · hafif fazlalık",
      proteinTarget: "1.0 g / lb vücut ağırlığı",
      calorieBias: "İdamenin +%5 üzeri",
      notes: "Antrenman öncesi karbonhidratlar önceliklidir. Kreatin önerilir."
    },
    calisthenics: {
      style: "Yalın performans",
      proteinTarget: "0.9 g / lb vücut ağırlığı",
      calorieBias: "İdamede",
      notes: "Antrenman öncesi hafif öğün tercih edilir. Vücut ağırlığı önemlidir."
    },
    "athlete-conditioning": {
      style: "Karbonhidrat ağırlıklı · sporcu",
      proteinTarget: "0.9 g / lb vücut ağırlığı",
      calorieBias: "İdamede veya hafif üzerinde",
      notes: "Karbonhidratlar antrenman yüküyle ölçeklenir. Hidrasyon planı dahildir."
    },
    "beginner-foundations": {
      style: "Önce alışkanlık beslenmesi",
      proteinTarget: "0.8 g / lb vücut ağırlığı",
      calorieBias: "İdamede",
      notes: "Takip gerekmez. Tabak temelli porsiyon rehberi."
    },
    "womens-sculpt": {
      style: "Kadınlar için yalın performans",
      proteinTarget: "0.9 g / lb vücut ağırlığı",
      calorieBias: "İdamede · antrenman günlerinde hafif fazlalık",
      notes: "Demir ve kalsiyum vurgulanır. Döngüye duyarlı notlar dahildir."
    },
    "senior-strength": {
      style: "Uzun ömür · protein ağırlıklı",
      proteinTarget: "1.0 g / lb vücut ağırlığı",
      calorieBias: "İdamede",
      notes: "Protein 4 öğüne yayılır. D vitamini ve omega-3 vurgulanır."
    },
    "cutting-peak": {
      style: "Yarışma hazırlığı · takipli",
      proteinTarget: "1.3 g / lb vücut ağırlığı",
      calorieBias: "İdameden -%25",
      notes: "Haftalık refeed'ler. Zirve haftası protokolü ayrıntılı. Yeni başlayanlar için değil."
    }
  },
  ar: {
    "fat-loss": {
      style: "تنشيف نظيف · الأطعمة الكاملة أولاً",
      proteinTarget: "1.0 غ لكل رطل من وزن الجسم",
      calorieBias: "-15% من سعرات الثبات",
      notes: "أسبوعا إعادة تغذية مضمّنان. تُدوّر الكربوهيدرات حول أيام التدريب."
    },
    "lean-bulk": {
      style: "تضخيم نظيف · 80/20 أطعمة كاملة",
      proteinTarget: "1.0 غ لكل رطل من وزن الجسم",
      calorieBias: "+10% فوق سعرات الثبات",
      notes: "هدف اكتساب بطيء: 0.5-1 رطل أسبوعياً. أعد ضبط الأساس كل 4 أسابيع."
    },
    "home-starter": {
      style: "تنشيف مناسب للمبتدئين",
      proteinTarget: "0.8 غ لكل رطل من وزن الجسم",
      calorieBias: "-10% من سعرات الثبات",
      notes: "تقسيم الحصص حسب الطبق — لا حاجة للوزن في أول 4 أسابيع."
    },
    definition: {
      style: "تنشيف صارم · بتتبّع الماكروز",
      proteinTarget: "1.2 غ لكل رطل من وزن الجسم",
      calorieBias: "-20% من سعرات الثبات",
      notes: "يوم إعادة تغذية أسبوعي. تُقدّم الكربوهيدرات حول التدريب."
    },
    recomp: {
      style: "ثبات · بروتين عالٍ",
      proteinTarget: "1.1 غ لكل رطل من وزن الجسم",
      calorieBias: "عند الثبات",
      notes: "تدوير الكربوهيدرات: مرتفع في أيام الرفع، معتدل في أيام الراحة."
    },
    powerbuilding: {
      style: "موجّه للقوة · فائض طفيف",
      proteinTarget: "1.0 غ لكل رطل من وزن الجسم",
      calorieBias: "+5% فوق سعرات الثبات",
      notes: "تُعطى الأولوية لكربوهيدرات ما قبل التمرين. يُنصح بالكرياتين."
    },
    calisthenics: {
      style: "أداء رشيق",
      proteinTarget: "0.9 غ لكل رطل من وزن الجسم",
      calorieBias: "عند الثبات",
      notes: "يُفضّل وجبة خفيفة قبل التدريب. وزن الجسم مهم."
    },
    "athlete-conditioning": {
      style: "غني بالكربوهيدرات · للرياضيين",
      proteinTarget: "0.9 غ لكل رطل من وزن الجسم",
      calorieBias: "عند الثبات أو أعلى قليلاً",
      notes: "تتدرّج الكربوهيدرات مع حمل التدريب. خطة الترطيب مضمّنة."
    },
    "beginner-foundations": {
      style: "تغذية تبدأ بالعادة",
      proteinTarget: "0.8 غ لكل رطل من وزن الجسم",
      calorieBias: "عند الثبات",
      notes: "لا حاجة للتتبّع. دليل حصص حسب الطبق."
    },
    "womens-sculpt": {
      style: "أداء رشيق للنساء",
      proteinTarget: "0.9 غ لكل رطل من وزن الجسم",
      calorieBias: "عند الثبات · فائض طفيف في أيام الرفع",
      notes: "تركيز على الحديد والكالسيوم. ملاحظات واعية بالدورة الشهرية مضمّنة."
    },
    "senior-strength": {
      style: "طول العمر · غني بالبروتين",
      proteinTarget: "1.0 غ لكل رطل من وزن الجسم",
      calorieBias: "عند الثبات",
      notes: "البروتين موزّع على 4 وجبات. تركيز على فيتامين د وأوميغا-3."
    },
    "cutting-peak": {
      style: "تحضير للمسابقات · بالتتبّع",
      proteinTarget: "1.3 غ لكل رطل من وزن الجسم",
      calorieBias: "-25% من سعرات الثبات",
      notes: "وجبات إعادة تغذية أسبوعية. بروتوكول أسبوع الذروة مفصّل. ليس للمبتدئين."
    }
  },
  es: {
    "fat-loss": {
      style: "Definición limpia · alimentos integrales primero",
      proteinTarget: "1.0 g por lb de peso corporal",
      calorieBias: "-15% del mantenimiento",
      notes: "Dos semanas de recarga incluidas. Carbohidratos ciclados en torno a los días de entrenamiento."
    },
    "lean-bulk": {
      style: "Volumen limpio · 80/20 alimentos integrales",
      proteinTarget: "1.0 g por lb de peso corporal",
      calorieBias: "+10% por encima del mantenimiento",
      notes: "Objetivo de ganancia lenta: 0.5-1 lb por semana. Recalibra cada 4 semanas."
    },
    "home-starter": {
      style: "Definición apta para principiantes",
      proteinTarget: "0.8 g por lb de peso corporal",
      calorieBias: "-10% del mantenimiento",
      notes: "Porciones basadas en el plato — sin pesar durante las primeras 4 semanas."
    },
    definition: {
      style: "Definición estricta · con macros monitoreadas",
      proteinTarget: "1.2 g por lb de peso corporal",
      calorieBias: "-20% del mantenimiento",
      notes: "Día de recarga semanal. Carbohidratos concentrados en torno al entrenamiento."
    },
    recomp: {
      style: "Mantenimiento · alta proteína",
      proteinTarget: "1.1 g por lb de peso corporal",
      calorieBias: "En mantenimiento",
      notes: "Ciclado de carbohidratos: alto en días de entrenamiento, moderado en días de descanso."
    },
    powerbuilding: {
      style: "Impulsado por la fuerza · ligero superávit",
      proteinTarget: "1.0 g por lb de peso corporal",
      calorieBias: "+5% por encima del mantenimiento",
      notes: "Carbohidratos pre-entreno priorizados. Se recomienda creatina."
    },
    calisthenics: {
      style: "Rendimiento magro",
      proteinTarget: "0.9 g por lb de peso corporal",
      calorieBias: "En mantenimiento",
      notes: "Se prefiere una comida ligera antes de entrenar. El peso corporal importa."
    },
    "athlete-conditioning": {
      style: "Rico en carbohidratos · atleta",
      proteinTarget: "0.9 g por lb de peso corporal",
      calorieBias: "En mantenimiento o ligeramente por encima",
      notes: "Los carbohidratos escalan con la carga de entrenamiento. Plan de hidratación incluido."
    },
    "beginner-foundations": {
      style: "Nutrición centrada en el hábito",
      proteinTarget: "0.8 g por lb de peso corporal",
      calorieBias: "En mantenimiento",
      notes: "Sin seguimiento requerido. Guía de porciones basada en el plato."
    },
    "womens-sculpt": {
      style: "Rendimiento magro para mujeres",
      proteinTarget: "0.9 g por lb de peso corporal",
      calorieBias: "En mantenimiento · ligero superávit en días de entrenamiento",
      notes: "Se enfatizan el hierro y el calcio. Notas conscientes del ciclo incluidas."
    },
    "senior-strength": {
      style: "Longevidad · rica en proteína",
      proteinTarget: "1.0 g por lb de peso corporal",
      calorieBias: "En mantenimiento",
      notes: "Proteína repartida en 4 comidas. Se enfatizan la vitamina D y el omega-3."
    },
    "cutting-peak": {
      style: "Preparación para competición · monitoreada",
      proteinTarget: "1.3 g por lb de peso corporal",
      calorieBias: "-25% del mantenimiento",
      notes: "Recargas semanales. Protocolo de semana pico detallado. No apto para principiantes."
    }
  },
  fr: {
    "fat-loss": {
      style: "Sèche propre · aliments bruts d'abord",
      proteinTarget: "1.0 g par lb de poids de corps",
      calorieBias: "-15% du maintien",
      notes: "Deux semaines de recharge intégrées. Glucides cyclés autour des jours d'entraînement."
    },
    "lean-bulk": {
      style: "Prise de masse propre · 80/20 aliments bruts",
      proteinTarget: "1.0 g par lb de poids de corps",
      calorieBias: "+10% au-dessus du maintien",
      notes: "Objectif de gain lent : 0,5-1 lb par semaine. Recalibre toutes les 4 semaines."
    },
    "home-starter": {
      style: "Sèche adaptée aux débutants",
      proteinTarget: "0.8 g par lb de poids de corps",
      calorieBias: "-10% du maintien",
      notes: "Portions basées sur l'assiette — aucune pesée requise les 4 premières semaines."
    },
    definition: {
      style: "Sèche stricte · macros suivies",
      proteinTarget: "1.2 g par lb de poids de corps",
      calorieBias: "-20% du maintien",
      notes: "Jour de recharge hebdomadaire. Glucides concentrés autour de l'entraînement."
    },
    recomp: {
      style: "Maintien · protéines élevées",
      proteinTarget: "1.1 g par lb de poids de corps",
      calorieBias: "Au maintien",
      notes: "Cyclage des glucides : élevé les jours de levée, modéré les jours de repos."
    },
    powerbuilding: {
      style: "Axé force · léger surplus",
      proteinTarget: "1.0 g par lb de poids de corps",
      calorieBias: "+5% au-dessus du maintien",
      notes: "Glucides pré-entraînement priorisés. Créatine recommandée."
    },
    calisthenics: {
      style: "Performance sèche",
      proteinTarget: "0.9 g par lb de poids de corps",
      calorieBias: "Au maintien",
      notes: "Repas léger avant l'entraînement recommandé. Le poids de corps compte."
    },
    "athlete-conditioning": {
      style: "Riche en glucides · athlète",
      proteinTarget: "0.9 g par lb de poids de corps",
      calorieBias: "Au maintien ou légèrement au-dessus",
      notes: "Les glucides s'ajustent à la charge d'entraînement. Plan d'hydratation inclus."
    },
    "beginner-foundations": {
      style: "Nutrition axée sur l'habitude",
      proteinTarget: "0.8 g par lb de poids de corps",
      calorieBias: "Au maintien",
      notes: "Aucun suivi requis. Guide de portions basé sur l'assiette."
    },
    "womens-sculpt": {
      style: "Performance sèche au féminin",
      proteinTarget: "0.9 g par lb de poids de corps",
      calorieBias: "Au maintien · léger surplus les jours de levée",
      notes: "Fer et calcium mis en avant. Notes adaptées au cycle incluses."
    },
    "senior-strength": {
      style: "Longévité · riche en protéines",
      proteinTarget: "1.0 g par lb de poids de corps",
      calorieBias: "Au maintien",
      notes: "Protéines réparties sur 4 repas. Vitamine D et oméga-3 mis en avant."
    },
    "cutting-peak": {
      style: "Prépa compétition · suivie",
      proteinTarget: "1.3 g par lb de poids de corps",
      calorieBias: "-25% du maintien",
      notes: "Recharges hebdomadaires. Protocole de semaine de pic détaillé. Pas pour les débutants."
    }
  }
};

/**
 * Localized three-phase outline per bundle slug. Phase names keep their
 * "(Weeks X-Y)" span (the word translated, the week range localized).
 */
const BUNDLE_PHASES: Record<NonEnLocale, Record<string, BundlePhase[]>> = {
  tr: {
    "fat-loss": [
      { name: "Hazırlık (1.-4. Hafta)", focus: "Güç temeli, ölçülü açık, temel kondisyon" },
      { name: "Sıyrılma (5.-8. Hafta)", focus: "Daha yoğun çalışma, daha keskin açık, kardiyo bloğu" },
      { name: "Rötuş (9.-12. Hafta)", focus: "Refeed haftaları, zirve kondisyon, tanım bitişi" }
    ],
    "lean-bulk": [
      { name: "Temel (1.-4. Hafta)", focus: "Hacim biriktirme, teknik inceltme" },
      { name: "İnşa (5.-8. Hafta)", focus: "Yoğunlaştırma, progresif aşırı yükleme" },
      { name: "Zirve (9.-12. Hafta)", focus: "Ağır güç haftaları, top-set çalışması" }
    ],
    "home-starter": [
      { name: "Alışkanlık (1.-4. Hafta)", focus: "Hareket kalitesi, kalori farkındalığı" },
      { name: "İnşa (5.-8. Hafta)", focus: "Tempo ilerlemeleri, kondisyon aralıkları" },
      { name: "İtiş (9.-12. Hafta)", focus: "Yoğunluk devreleri, tek taraflı çalışma" }
    ],
    definition: [
      { name: "Biriktirme (1.-4. Hafta)", focus: "Yüksek tekrar hacmi, kas-zihin bağlantısı odağı" },
      { name: "Tanımlama (5.-8. Hafta)", focus: "Drop setler, süper setler, kondisyon rampası" },
      { name: "Zirve (9.-12. Hafta)", focus: "Refeed döngüsü, zirve haftası" }
    ],
    recomp: [
      { name: "Kalibrasyon (1.-4. Hafta)", focus: "Gerçek idameyi bul, proteini ayarla" },
      { name: "İtki (5.-8. Hafta)", focus: "İdamede progresif aşırı yükleme" },
      { name: "Doğrulama (9.-12. Hafta)", focus: "Mini-kesim + yalın sıfırlama" }
    ],
    powerbuilding: [
      { name: "Hacim (1.-4. Hafta)", focus: "Daha yüksek tekrar aralıkları, yardımcı temel" },
      { name: "Yoğunluk (5.-8. Hafta)", focus: "5×5 ana çalışma, yardımcı inceltme" },
      { name: "Zirve (9.-12. Hafta)", focus: "Üçlüler, ikililer, üst düzey güç" }
    ],
    calisthenics: [
      { name: "Temel (1.-4. Hafta)", focus: "Barfiks hacmi, duvarda amuda kalkış tutuşları" },
      { name: "Beceri (5.-8. Hafta)", focus: "Patlayıcı çekişler, desteksiz beceriler" },
      { name: "Ustalık (9.-12. Hafta)", focus: "Muscle-up ilerlemeleri, tek bacak squat çalışması" }
    ],
    "athlete-conditioning": [
      { name: "Aerobik Temel (1.-4. Hafta)", focus: "Bölge 2 hacmi, güç koruma" },
      { name: "Eşik (5.-8. Hafta)", focus: "Tempo aralıkları, karma devreler" },
      { name: "Zirve (9.-12. Hafta)", focus: "VO2 maks çalışması, yarış temposu eforları" }
    ],
    "beginner-foundations": [
      { name: "Öğren (1.-4. Hafta)", focus: "Hareket kalıpları, hafif yükler, teknik" },
      { name: "Uygula (5.-8. Hafta)", focus: "Doğrusal ilerleme, hacme giriş" },
      { name: "Doğrula (9.-12. Hafta)", focus: "Daha ağır setler, deload, yeniden test" }
    ],
    "womens-sculpt": [
      { name: "Etkinleştir (1.-4. Hafta)", focus: "Kas-zihin, kalça hazırlama, temel hacim" },
      { name: "İnşa (5.-8. Hafta)", focus: "Ağır kalça menteşesi ve squatlar, üst vücut hipertrofisi" },
      { name: "Tanımla (9.-12. Hafta)", focus: "Yoğunluk blokları, kondisyon eklentisi" }
    ],
    "senior-strength": [
      { name: "Hareketlendir (1.-4. Hafta)", focus: "Hareket açıklığı, temel kaldırışlar" },
      { name: "Güçlendir (5.-8. Hafta)", focus: "Progresif yük, eklem dostu varyasyonlar" },
      { name: "Sürdür (9.-12. Hafta)", focus: "Koruma şablonu, uzun vadeli plan" }
    ],
    "cutting-peak": [
      { name: "Giriş (1.-4. Hafta)", focus: "Diyet molası, temel kaldırışlar, kardiyo başlangıcı" },
      { name: "Sıyrılma (5.-8. Hafta)", focus: "Agresif açık, refeed döngüsü, antrenman yoğunluğu" },
      { name: "Zirve (9.-12. Hafta)", focus: "Karbonhidrat tüketimi, su atımı, zirve haftası protokolü" }
    ]
  },
  ar: {
    "fat-loss": [
      { name: "التهيئة (الأسابيع 1-4)", focus: "قاعدة قوة، عجز معتدل، لياقة أساسية" },
      { name: "التجريد (الأسابيع 5-8)", focus: "عمل أكثف، عجز أحدّ، كتلة كارديو" },
      { name: "الصقل (الأسابيع 9-12)", focus: "أسابيع إعادة تغذية، ذروة لياقة، لمسة تحديد أخيرة" }
    ],
    "lean-bulk": [
      { name: "الأساس (الأسابيع 1-4)", focus: "تراكم الحجم، صقل التقنية" },
      { name: "البناء (الأسابيع 5-8)", focus: "تكثيف، حمل تصاعدي" },
      { name: "الذروة (الأسابيع 9-12)", focus: "أسابيع قوة ثقيلة، عمل المجموعات القصوى" }
    ],
    "home-starter": [
      { name: "العادة (الأسابيع 1-4)", focus: "جودة الحركة، الوعي بالسعرات" },
      { name: "البناء (الأسابيع 5-8)", focus: "تدرّجات إيقاع، فترات لياقة" },
      { name: "الدفع (الأسابيع 9-12)", focus: "دوائر كثافة، عمل أحادي الجانب" }
    ],
    definition: [
      { name: "التراكم (الأسابيع 1-4)", focus: "حجم بتكرارات عالية، تركيز على الاتصال بين العقل والعضلة" },
      { name: "التحديد (الأسابيع 5-8)", focus: "مجموعات هابطة، مجموعات مركّبة، تصاعد لياقة" },
      { name: "الذروة (الأسابيع 9-12)", focus: "تدوير إعادة التغذية، أسبوع الذروة" }
    ],
    recomp: [
      { name: "المعايرة (الأسابيع 1-4)", focus: "حدّد سعرات الثبات الحقيقية، اضبط البروتين" },
      { name: "الدفع (الأسابيع 5-8)", focus: "حمل تصاعدي عند الثبات" },
      { name: "التأكيد (الأسابيع 9-12)", focus: "تنشيف مصغّر + إعادة ضبط رشيقة" }
    ],
    powerbuilding: [
      { name: "الحجم (الأسابيع 1-4)", focus: "نطاقات تكرار أعلى، قاعدة تمارين مساعدة" },
      { name: "الشدّة (الأسابيع 5-8)", focus: "عمل رئيسي 5×5، صقل التمارين المساعدة" },
      { name: "الذروة (الأسابيع 9-12)", focus: "ثلاثيات، ثنائيات، قوة قصوى" }
    ],
    calisthenics: [
      { name: "الأساس (الأسابيع 1-4)", focus: "حجم العقلات، ثبات الوقوف على اليدين على الحائط" },
      { name: "المهارة (الأسابيع 5-8)", focus: "سحبات متفجّرة، مهارات حرة" },
      { name: "الإتقان (الأسابيع 9-12)", focus: "تدرّجات المسل أب، عمل سكوات المسدس" }
    ],
    "athlete-conditioning": [
      { name: "القاعدة الهوائية (الأسابيع 1-4)", focus: "حجم المنطقة 2، الحفاظ على القوة" },
      { name: "العتبة (الأسابيع 5-8)", focus: "فترات إيقاع، دوائر مختلطة" },
      { name: "الذروة (الأسابيع 9-12)", focus: "عمل أقصى استهلاك للأكسجين، جهود بوتيرة السباق" }
    ],
    "beginner-foundations": [
      { name: "التعلّم (الأسابيع 1-4)", focus: "أنماط الحركة، أحمال خفيفة، التقنية" },
      { name: "التطبيق (الأسابيع 5-8)", focus: "تقدّم خطّي، مقدّمة للحجم" },
      { name: "التأكيد (الأسابيع 9-12)", focus: "مجموعات أثقل، تخفيف حمل، إعادة اختبار" }
    ],
    "womens-sculpt": [
      { name: "التنشيط (الأسابيع 1-4)", focus: "اتصال العقل بالعضلة، تهيئة المؤخرة، حجم أساسي" },
      { name: "البناء (الأسابيع 5-8)", focus: "حركات مفصلية وسكوات ثقيلة، تضخيم علوي" },
      { name: "التحديد (الأسابيع 9-12)", focus: "كتل كثافة، إضافة لياقة" }
    ],
    "senior-strength": [
      { name: "التحريك (الأسابيع 1-4)", focus: "مدى الحركة، رفعات أساسية" },
      { name: "التقوية (الأسابيع 5-8)", focus: "حمل تصاعدي، بدائل لطيفة على المفاصل" },
      { name: "الاستدامة (الأسابيع 9-12)", focus: "قالب الحفاظ، خطة طويلة المدى" }
    ],
    "cutting-peak": [
      { name: "التمهيد (الأسابيع 1-4)", focus: "استراحة حمية، رفعات أساسية، بداية كارديو" },
      { name: "التجريد (الأسابيع 5-8)", focus: "عجز قوي، تدوير إعادة التغذية، شدّة تدريب" },
      { name: "الذروة (الأسابيع 9-12)", focus: "استنزاف الكربوهيدرات، خفض الماء، بروتوكول أسبوع الذروة" }
    ]
  },
  es: {
    "fat-loss": [
      { name: "Preparar (Semanas 1-4)", focus: "Base de fuerza, déficit moderado, acondicionamiento básico" },
      { name: "Despojar (Semanas 5-8)", focus: "Trabajo más denso, déficit más marcado, bloque de cardio" },
      { name: "Pulir (Semanas 9-12)", focus: "Semanas de recarga, acondicionamiento pico, acabado de definición" }
    ],
    "lean-bulk": [
      { name: "Base (Semanas 1-4)", focus: "Acumulación de volumen, refinamiento técnico" },
      { name: "Construir (Semanas 5-8)", focus: "Intensificación, sobrecarga progresiva" },
      { name: "Pico (Semanas 9-12)", focus: "Semanas de fuerza pesada, trabajo de series tope" }
    ],
    "home-starter": [
      { name: "Hábito (Semanas 1-4)", focus: "Calidad de movimiento, conciencia calórica" },
      { name: "Construir (Semanas 5-8)", focus: "Progresiones de tempo, intervalos de acondicionamiento" },
      { name: "Empujar (Semanas 9-12)", focus: "Circuitos de densidad, trabajo unilateral" }
    ],
    definition: [
      { name: "Acumular (Semanas 1-4)", focus: "Volumen de altas repeticiones, enfoque en conexión mente-músculo" },
      { name: "Definir (Semanas 5-8)", focus: "Series descendentes, superseries, rampa de acondicionamiento" },
      { name: "Pico (Semanas 9-12)", focus: "Ciclado de recargas, semana pico" }
    ],
    recomp: [
      { name: "Calibrar (Semanas 1-4)", focus: "Encuentra el mantenimiento real, ajusta la proteína" },
      { name: "Impulsar (Semanas 5-8)", focus: "Sobrecarga progresiva en mantenimiento" },
      { name: "Confirmar (Semanas 9-12)", focus: "Mini-corte + reinicio magro" }
    ],
    powerbuilding: [
      { name: "Volumen (Semanas 1-4)", focus: "Rangos de repeticiones más altos, base de accesorios" },
      { name: "Intensidad (Semanas 5-8)", focus: "Trabajo principal 5×5, refinamiento de accesorios" },
      { name: "Pico (Semanas 9-12)", focus: "Triples, dobles, fuerza máxima" }
    ],
    calisthenics: [
      { name: "Fundamento (Semanas 1-4)", focus: "Volumen de dominadas, sostenes de pino en pared" },
      { name: "Habilidad (Semanas 5-8)", focus: "Tracciones explosivas, habilidades sin apoyo" },
      { name: "Maestría (Semanas 9-12)", focus: "Progresiones de muscle-up, trabajo de sentadilla a una pierna" }
    ],
    "athlete-conditioning": [
      { name: "Base Aeróbica (Semanas 1-4)", focus: "Volumen en Zona 2, mantenimiento de fuerza" },
      { name: "Umbral (Semanas 5-8)", focus: "Intervalos de tempo, circuitos mixtos" },
      { name: "Pico (Semanas 9-12)", focus: "Trabajo de VO2 máx, esfuerzos a ritmo de carrera" }
    ],
    "beginner-foundations": [
      { name: "Aprender (Semanas 1-4)", focus: "Patrones de movimiento, cargas ligeras, técnica" },
      { name: "Aplicar (Semanas 5-8)", focus: "Progresión lineal, introducción al volumen" },
      { name: "Confirmar (Semanas 9-12)", focus: "Series más pesadas, descarga, reevaluación" }
    ],
    "womens-sculpt": [
      { name: "Activar (Semanas 1-4)", focus: "Conexión mente-músculo, activación de glúteos, volumen base" },
      { name: "Construir (Semanas 5-8)", focus: "Hip thrust y sentadillas pesadas, hipertrofia superior" },
      { name: "Definir (Semanas 9-12)", focus: "Bloques de densidad, complemento de acondicionamiento" }
    ],
    "senior-strength": [
      { name: "Movilizar (Semanas 1-4)", focus: "Rango de movimiento, levantamientos fundamentales" },
      { name: "Fortalecer (Semanas 5-8)", focus: "Carga progresiva, variantes amables con las articulaciones" },
      { name: "Sostener (Semanas 9-12)", focus: "Plantilla de mantenimiento, plan a largo plazo" }
    ],
    "cutting-peak": [
      { name: "Entrada (Semanas 1-4)", focus: "Descanso de dieta, levantamientos de referencia, inicio de cardio" },
      { name: "Despojar (Semanas 5-8)", focus: "Déficit agresivo, ciclado de recargas, intensidad de entrenamiento" },
      { name: "Pico (Semanas 9-12)", focus: "Depleción de carbohidratos, cortes de agua, protocolo de semana pico" }
    ]
  },
  fr: {
    "fat-loss": [
      { name: "Amorçage (Semaines 1-4)", focus: "Base de force, déficit modéré, conditionnement de base" },
      { name: "Affûtage (Semaines 5-8)", focus: "Travail plus dense, déficit plus marqué, bloc de cardio" },
      { name: "Finition (Semaines 9-12)", focus: "Semaines de recharge, conditionnement de pointe, finition de définition" }
    ],
    "lean-bulk": [
      { name: "Base (Semaines 1-4)", focus: "Accumulation de volume, affinage technique" },
      { name: "Construction (Semaines 5-8)", focus: "Intensification, surcharge progressive" },
      { name: "Pic (Semaines 9-12)", focus: "Semaines de force lourde, travail en séries lourdes" }
    ],
    "home-starter": [
      { name: "Habitude (Semaines 1-4)", focus: "Qualité du mouvement, conscience calorique" },
      { name: "Construction (Semaines 5-8)", focus: "Progressions de tempo, intervalles de conditionnement" },
      { name: "Poussée (Semaines 9-12)", focus: "Circuits de densité, travail unilatéral" }
    ],
    definition: [
      { name: "Accumulation (Semaines 1-4)", focus: "Volume à hautes répétitions, focus connexion esprit-muscle" },
      { name: "Définition (Semaines 5-8)", focus: "Séries dégressives, supersets, montée en conditionnement" },
      { name: "Pic (Semaines 9-12)", focus: "Cyclage des recharges, semaine de pic" }
    ],
    recomp: [
      { name: "Calibrage (Semaines 1-4)", focus: "Trouve le vrai maintien, règle les protéines" },
      { name: "Impulsion (Semaines 5-8)", focus: "Surcharge progressive au maintien" },
      { name: "Confirmation (Semaines 9-12)", focus: "Mini-sèche + remise à zéro sèche" }
    ],
    powerbuilding: [
      { name: "Volume (Semaines 1-4)", focus: "Plages de répétitions plus hautes, base d'accessoires" },
      { name: "Intensité (Semaines 5-8)", focus: "Travail principal 5×5, affinage des accessoires" },
      { name: "Pic (Semaines 9-12)", focus: "Triples, doubles, force maximale" }
    ],
    calisthenics: [
      { name: "Fondation (Semaines 1-4)", focus: "Volume de tractions, maintiens en équilibre au mur" },
      { name: "Technique (Semaines 5-8)", focus: "Tractions explosives, figures en autonomie" },
      { name: "Maîtrise (Semaines 9-12)", focus: "Progressions de muscle-up, travail du squat sur une jambe" }
    ],
    "athlete-conditioning": [
      { name: "Base Aérobie (Semaines 1-4)", focus: "Volume en Zone 2, maintien de la force" },
      { name: "Seuil (Semaines 5-8)", focus: "Intervalles de tempo, circuits mixtes" },
      { name: "Pic (Semaines 9-12)", focus: "Travail VO2 max, efforts à allure de course" }
    ],
    "beginner-foundations": [
      { name: "Apprentissage (Semaines 1-4)", focus: "Schémas de mouvement, charges légères, technique" },
      { name: "Application (Semaines 5-8)", focus: "Progression linéaire, introduction au volume" },
      { name: "Confirmation (Semaines 9-12)", focus: "Séries plus lourdes, délestage, nouveau test" }
    ],
    "womens-sculpt": [
      { name: "Activation (Semaines 1-4)", focus: "Connexion esprit-muscle, préactivation des fessiers, volume de base" },
      { name: "Construction (Semaines 5-8)", focus: "Charnières et squats lourds, hypertrophie du haut" },
      { name: "Définition (Semaines 9-12)", focus: "Blocs de densité, ajout de conditionnement" }
    ],
    "senior-strength": [
      { name: "Mobilisation (Semaines 1-4)", focus: "Amplitude de mouvement, mouvements fondamentaux" },
      { name: "Renforcement (Semaines 5-8)", focus: "Charge progressive, variantes douces pour les articulations" },
      { name: "Maintien (Semaines 9-12)", focus: "Modèle d'entretien, plan à long terme" }
    ],
    "cutting-peak": [
      { name: "Entrée en matière (Semaines 1-4)", focus: "Pause diète, mouvements de référence, début du cardio" },
      { name: "Affûtage (Semaines 5-8)", focus: "Déficit agressif, cyclage des recharges, intensité d'entraînement" },
      { name: "Pic (Semaines 9-12)", focus: "Déplétion en glucides, coupe d'eau, protocole de semaine de pic" }
    ]
  }
};

/**
 * Returns the prose copy (name, hook, goalLabel, programTitle, dietTitle,
 * description, nutrition, phases) for a bundle in the given locale. English
 * passes through from the bundle itself; any locale or slug without an
 * override also falls back to English so nothing breaks.
 */
export function localizeBundle(bundle: Bundle, locale: string): BundleCopy {
  const fallback: BundleCopy = {
    name: bundle.name,
    hook: bundle.hook,
    goalLabel: bundle.goalLabel,
    programTitle: bundle.programTitle,
    dietTitle: bundle.dietTitle,
    description: bundle.description,
    nutrition: bundle.nutrition,
    phases: bundle.phases
  };
  const loc = resolveCopyLocale(locale);
  if (loc === "en") return fallback;
  const prose = BUNDLE_COPY[loc][bundle.slug];
  if (!prose) return fallback;
  return {
    ...prose,
    nutrition: BUNDLE_NUTRITION[loc][bundle.slug] ?? bundle.nutrition,
    phases: BUNDLE_PHASES[loc][bundle.slug] ?? bundle.phases
  };
}
