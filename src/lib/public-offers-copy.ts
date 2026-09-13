import type { Locale } from "@/lib/i18n";

/** Public offer copy. Entitlements and checkout remain server-owned. */
export const PUBLIC_OFFERS = { tjaiUsd: 19.99, bundleUsd: 10, chatRepliesPerDay: 5, regenerationsPerMonth: 1 } as const;
export function tjaiIntakeHref(locale: Locale) { return `/${locale}/ai?tab=my-plan&start=1`; }

type Offer = { title: string; label: string; description: string; detail: string; cta: string };
type PublicCopy = {
  home: string; navigation: string; account: string; signIn: string; skip: string;
  eyebrow: string; title: string; intro: string; explore: string; choose: string;
  bundles: Offer; tjai: Offer; equipment: Offer;
  passTitle: string; passIntro: string; oneTime: string; features: string[];
  stepsTitle: string; steps: { title: string; body: string }[];
  availability: string; existingTitle: string; existingBody: string; openAccount: string;
  scope: string; toolsTitle: string; toolsBody: string; calculator: string; support: string;
};

export const PUBLIC_COPY: Record<Locale, PublicCopy> = {
  en: {
    home: "Home", navigation: "Explore TJFit", account: "Account", signIn: "Sign in", skip: "Skip to content",
    eyebrow: "Training. Nutrition. Equipment.", title: "Build your next\nstronger day.",
    intro: "Choose a training bundle, build a personal plan with TJAI, or find equipment for your space. Your next step starts here.",
    explore: "Explore your options", choose: "Three ways to get started.",
    bundles: { title: "Bundles", label: "A plan you can follow", description: "Training and nutrition, together in a structured program. Browse the contents and choose the bundle that fits your goal.", detail: "$10 per paid bundle", cta: "Browse bundles" },
    tjai: { title: "TJAI", label: "Built around your routine", description: "Tell TJAI about your goal, schedule, equipment, and food preferences. Complete the assessment before payment.", detail: "$19.99 one-time pass", cta: "Start your assessment" },
    equipment: { title: "Equipment", label: "Make space for training", description: "Explore equipment for home and gym training. Check product details and availability before you decide.", detail: "Explore the equipment catalog", cta: "Browse equipment" },
    passTitle: "Your plan. Your daily practice.", passIntro: "One TJAI pass brings your training plan, nutrition targets, and coaching conversations into one place.", oneTime: "One payment · no recurring subscription",
    features: ["Your initial training and nutrition plan", "Up to 5 AI chat replies per day", "1 plan regeneration per month", "Workout, bodyweight, and nutrition logging"],
    stepsTitle: "Start with the details that matter.",
    steps: [{ title: "Tell us about you", body: "Complete the assessment with your goals, routine, equipment, and food preferences." }, { title: "Review your access", body: "Review the pass and price after the assessment, before paying." }, { title: "Follow and record", body: "Open your saved plan, log your training and meals, and return to your coaching conversation." }],
    availability: "AI replies and generation depend on service availability. Daily and monthly limits apply; unused allowances do not accumulate.",
    existingTitle: "Already a TJFit customer?", existingBody: "Sign in to view your saved plans and existing access. Contact support if a previous purchase is missing.", openAccount: "Open your account",
    scope: "For adults 18+ pursuing general fitness. TJAI provides guidance, not medical care or a guaranteed result.",
    toolsTitle: "Start with your numbers.", toolsBody: "Use the calorie calculator to estimate your daily energy needs, or contact us for help finding your way.", calculator: "Open calculator", support: "Contact support"
  },
  tr: {
    home: "Ana sayfa", navigation: "TJFit’i keşfet", account: "Hesap", signIn: "Giriş yap", skip: "İçeriğe geç",
    eyebrow: "Antrenman. Beslenme. Ekipman.", title: "Daha güçlü bir\ngüne hazırlan.",
    intro: "Bir antrenman paketi seç, TJAI ile kişisel planını oluştur veya alanına uygun ekipmanı bul. Bir sonraki adımın burada başlıyor.",
    explore: "Seçeneklerini keşfet", choose: "Başlamak için üç yol.",
    bundles: { title: "Paketler", label: "Takip edebileceğin bir plan", description: "Antrenman ve beslenme, düzenli bir programda bir arada. İçeriği incele ve hedefine uygun paketi seç.", detail: "Ücretli paket başına $10", cta: "Paketleri incele" },
    tjai: { title: "TJAI", label: "Rutinine göre hazırlanır", description: "Hedefini, programını, ekipmanını ve yemek tercihlerini TJAI’ye anlat. Değerlendirmeyi ödemeden önce tamamla.", detail: "Tek seferlik $19.99 erişim", cta: "Değerlendirmeye başla" },
    equipment: { title: "Ekipman", label: "Antrenmana yer aç", description: "Ev ve spor salonu için ekipmanları keşfet. Karar vermeden önce ürün ayrıntılarını ve bulunabilirliğini kontrol et.", detail: "Ekipman kataloğunu keşfet", cta: "Ekipmanları incele" },
    passTitle: "Senin planın. Günlük rutinin.", passIntro: "TJAI erişimi; antrenman planını, beslenme hedeflerini ve koçluk sohbetlerini tek yerde toplar.", oneTime: "Tek ödeme · tekrarlayan abonelik yok",
    features: ["İlk antrenman ve beslenme planın", "Günde en fazla 5 yapay zekâ sohbet yanıtı", "Ayda 1 plan yenileme", "Antrenman, vücut ağırlığı ve beslenme kaydı"],
    stepsTitle: "Önemli ayrıntılarla başla.",
    steps: [{ title: "Kendini anlat", body: "Hedeflerin, rutinin, ekipmanın ve yemek tercihlerinle değerlendirmeyi tamamla." }, { title: "Erişimini gözden geçir", body: "Değerlendirmeden sonra, ödeme yapmadan önce erişim kapsamını ve fiyatı incele." }, { title: "Takip et ve kaydet", body: "Kayıtlı planını aç, antrenmanlarını ve öğünlerini kaydet, koçluk sohbetine geri dön." }],
    availability: "Yapay zekâ yanıtları ve plan üretimi hizmetin kullanılabilirliğine bağlıdır. Günlük ve aylık sınırlar geçerlidir; kullanılmayan haklar birikmez.",
    existingTitle: "Zaten TJFit müşterisi misin?", existingBody: "Kayıtlı planlarını ve mevcut erişimini görmek için giriş yap. Önceki satın alımın görünmüyorsa destekle iletişime geç.", openAccount: "Hesabını aç",
    scope: "Genel fitness amaçlayan 18 yaş ve üzeri yetişkinler içindir. TJAI rehberlik sunar; tıbbi bakım veya sonuç garantisi sunmaz.",
    toolsTitle: "Kendi değerlerinle başla.", toolsBody: "Günlük enerji ihtiyacını tahmin etmek için kalori hesaplayıcıyı kullan veya yardım için bize ulaş.", calculator: "Hesaplayıcıyı aç", support: "Destek al"
  },
  ar: {
    home: "الرئيسية", navigation: "استكشف TJFit", account: "الحساب", signIn: "تسجيل الدخول", skip: "انتقل إلى المحتوى",
    eyebrow: "تدريب. تغذية. معدات.", title: "ابدأ يومك القادم\nبقوة أكبر.",
    intro: "اختر حزمة تدريب، أو أنشئ خطتك الشخصية مع TJAI، أو اعثر على معدات تناسب مساحتك. خطوتك التالية تبدأ هنا.",
    explore: "استكشف خياراتك", choose: "ثلاث طرق للبدء.",
    bundles: { title: "الحزم", label: "خطة يمكنك اتباعها", description: "التدريب والتغذية معاً في برنامج منظم. تصفح المحتوى واختر الحزمة المناسبة لهدفك.", detail: "$10 لكل حزمة مدفوعة", cta: "تصفح الحزم" },
    tjai: { title: "TJAI", label: "يناسب روتينك", description: "أخبر TJAI بهدفك وجدولك ومعداتك وتفضيلاتك الغذائية. أكمل التقييم قبل الدفع.", detail: "$19.99 دفعة واحدة", cta: "ابدأ تقييمك" },
    equipment: { title: "المعدات", label: "خصص مساحة للتدريب", description: "استكشف معدات التدريب للمنزل والنادي. تحقق من تفاصيل المنتجات وتوفرها قبل اتخاذ القرار.", detail: "استكشف كتالوج المعدات", cta: "تصفح المعدات" },
    passTitle: "خطتك. ممارستك اليومية.", passIntro: "يجمع الوصول إلى TJAI خطة التدريب وأهداف التغذية ومحادثات الإرشاد في مكان واحد.", oneTime: "دفعة واحدة · دون اشتراك متجدد",
    features: ["خطة التدريب والتغذية الأولى", "حتى 5 ردود محادثة بالذكاء الاصطناعي يومياً", "إعادة إنشاء الخطة مرة واحدة شهرياً", "تسجيل التمارين ووزن الجسم والتغذية"],
    stepsTitle: "ابدأ بالتفاصيل المهمة.",
    steps: [{ title: "أخبرنا عن نفسك", body: "أكمل التقييم بأهدافك وروتينك ومعداتك وتفضيلاتك الغذائية." }, { title: "راجع وصولك", body: "راجع تفاصيل الوصول والسعر بعد التقييم وقبل الدفع." }, { title: "اتبع وسجل", body: "افتح خطتك المحفوظة وسجل تمارينك ووجباتك وعُد إلى محادثة الإرشاد." }],
    availability: "تعتمد الردود وإنشاء الخطط على توفر الخدمة. تسري الحدود اليومية والشهرية ولا تتراكم الحصص غير المستخدمة.",
    existingTitle: "هل أنت عميل TJFit بالفعل؟", existingBody: "سجل الدخول لعرض خططك المحفوظة ووصولك الحالي. تواصل مع الدعم إذا لم يظهر شراء سابق.", openAccount: "افتح حسابك",
    scope: "للبالغين بعمر 18 عاماً فأكثر لأغراض اللياقة العامة. يقدم TJAI إرشادات ولا يقدم رعاية طبية أو نتيجة مضمونة.",
    toolsTitle: "ابدأ بأرقامك.", toolsBody: "استخدم حاسبة السعرات لتقدير احتياجاتك اليومية من الطاقة، أو تواصل معنا للمساعدة.", calculator: "افتح الحاسبة", support: "تواصل مع الدعم"
  },
  es: {
    home: "Inicio", navigation: "Explora TJFit", account: "Cuenta", signIn: "Iniciar sesión", skip: "Ir al contenido",
    eyebrow: "Entrenamiento. Nutrición. Equipo.", title: "Haz más fuerte\ntu día a día.",
    intro: "Elige un paquete de entrenamiento, crea un plan personal con TJAI o encuentra equipo para tu espacio. Tu próximo paso empieza aquí.",
    explore: "Explora tus opciones", choose: "Tres formas de empezar.",
    bundles: { title: "Paquetes", label: "Un plan que puedes seguir", description: "Entrenamiento y nutrición en un programa organizado. Revisa el contenido y elige el paquete que se adapte a tu objetivo.", detail: "$10 por paquete de pago", cta: "Ver paquetes" },
    tjai: { title: "TJAI", label: "Pensado para tu rutina", description: "Cuéntale a TJAI tu objetivo, horario, equipo y preferencias alimentarias. Completa la evaluación antes de pagar.", detail: "Pase de $19.99, pago único", cta: "Empezar la evaluación" },
    equipment: { title: "Equipo", label: "Haz espacio para entrenar", description: "Explora equipo para entrenar en casa y en el gimnasio. Consulta los detalles y la disponibilidad antes de decidir.", detail: "Explora el catálogo de equipo", cta: "Ver equipo" },
    passTitle: "Tu plan. Tu práctica diaria.", passIntro: "Un pase TJAI reúne tu plan de entrenamiento, objetivos de nutrición y conversaciones de orientación en un solo lugar.", oneTime: "Un pago · sin suscripción recurrente",
    features: ["Tu plan inicial de entrenamiento y nutrición", "Hasta 5 respuestas de chat con IA al día", "1 regeneración del plan al mes", "Registro de entrenamiento, peso corporal y nutrición"],
    stepsTitle: "Empieza por los detalles que importan.",
    steps: [{ title: "Cuéntanos sobre ti", body: "Completa la evaluación con tus objetivos, rutina, equipo y preferencias alimentarias." }, { title: "Revisa tu acceso", body: "Consulta el pase y su precio después de la evaluación, antes de pagar." }, { title: "Sigue y registra", body: "Abre tu plan guardado, registra entrenamientos y comidas y retoma tu conversación." }],
    availability: "Las respuestas y la generación dependen de la disponibilidad del servicio. Se aplican límites diarios y mensuales; las cuotas no utilizadas no se acumulan.",
    existingTitle: "¿Ya eres cliente de TJFit?", existingBody: "Inicia sesión para ver tus planes guardados y tu acceso actual. Contacta con soporte si falta una compra anterior.", openAccount: "Abrir tu cuenta",
    scope: "Para adultos de 18 años o más que buscan mejorar su condición física general. TJAI ofrece orientación, no atención médica ni resultados garantizados.",
    toolsTitle: "Empieza con tus cifras.", toolsBody: "Usa la calculadora de calorías para estimar tu energía diaria o contáctanos si necesitas ayuda.", calculator: "Abrir calculadora", support: "Contactar con soporte"
  },
  fr: {
    home: "Accueil", navigation: "Explorer TJFit", account: "Compte", signIn: "Se connecter", skip: "Aller au contenu",
    eyebrow: "Entraînement. Nutrition. Équipement.", title: "Donne de la force\nà ton quotidien.",
    intro: "Choisis un pack d’entraînement, crée un plan personnel avec TJAI ou trouve du matériel pour ton espace. Ta prochaine étape commence ici.",
    explore: "Explorer tes options", choose: "Trois façons de commencer.",
    bundles: { title: "Packs", label: "Un plan à suivre", description: "L’entraînement et la nutrition dans un programme structuré. Consulte le contenu et choisis le pack adapté à ton objectif.", detail: "$10 par pack payant", cta: "Voir les packs" },
    tjai: { title: "TJAI", label: "Pensé pour ton quotidien", description: "Indique à TJAI ton objectif, ton emploi du temps, ton matériel et tes préférences alimentaires. Termine l’évaluation avant de payer.", detail: "Pass à $19.99, paiement unique", cta: "Commencer l’évaluation" },
    equipment: { title: "Équipement", label: "Fais place à l’entraînement", description: "Explore le matériel pour la maison et la salle. Vérifie les détails et la disponibilité des produits avant de choisir.", detail: "Explorer le catalogue d’équipement", cta: "Voir l’équipement" },
    passTitle: "Ton plan. Ta pratique quotidienne.", passIntro: "Un pass TJAI réunit ton plan d’entraînement, tes objectifs nutritionnels et tes conversations de coaching au même endroit.", oneTime: "Un paiement · sans abonnement récurrent",
    features: ["Ton premier plan d’entraînement et de nutrition", "Jusqu’à 5 réponses de chat IA par jour", "1 nouvelle génération du plan par mois", "Suivi des entraînements, du poids et de la nutrition"],
    stepsTitle: "Commence par les détails qui comptent.",
    steps: [{ title: "Parle-nous de toi", body: "Complète l’évaluation avec tes objectifs, ta routine, ton matériel et tes préférences alimentaires." }, { title: "Vérifie ton accès", body: "Consulte le pass et son prix après l’évaluation, avant de payer." }, { title: "Suis et enregistre", body: "Ouvre ton plan sauvegardé, note tes entraînements et tes repas, puis reprends ta conversation." }],
    availability: "Les réponses et la génération dépendent de la disponibilité du service. Les limites quotidiennes et mensuelles s’appliquent ; les quotas inutilisés ne se cumulent pas.",
    existingTitle: "Déjà client TJFit ?", existingBody: "Connecte-toi pour retrouver tes plans et ton accès actuel. Contacte le support si un achat précédent manque.", openAccount: "Ouvrir ton compte",
    scope: "Pour les adultes de 18 ans et plus souhaitant améliorer leur forme générale. TJAI fournit des conseils, pas de soins médicaux ni de résultats garantis.",
    toolsTitle: "Commence par tes chiffres.", toolsBody: "Utilise le calculateur de calories pour estimer tes besoins énergétiques quotidiens ou contacte-nous pour obtenir de l’aide.", calculator: "Ouvrir le calculateur", support: "Contacter le support"
  }
};

export function publicPrimaryLinks(locale: Locale) {
  const copy = PUBLIC_COPY[locale];
  return [
    { key: "bundles", label: copy.bundles.title, href: `/${locale}/bundles` },
    { key: "tjai", label: copy.tjai.title, href: `/${locale}/tjai` },
    { key: "equipment", label: copy.equipment.title, href: `/${locale}/store` }
  ];
}
