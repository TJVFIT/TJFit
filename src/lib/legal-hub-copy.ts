import { LEGAL_SERVICES } from "@/lib/legal-service-copy";
import type { Locale } from "@/lib/i18n";
import { getCoachTermsSections } from "@/lib/coach-terms-copy";

export type LegalHubCopy = {
  heroEyebrow: string;
  heroHeadlineBefore: string;
  heroHeadlineGradient: string;
  heroSub: string;
  pageTitle: string;
  pageIntro: string;
  navFaq: string;
  navUserTerms: string;
  navCoachTerms: string;
  navPrivacy: string;
  faqTitle: string;
  userTermsTitle: string;
  coachTermsTitle: string;
  coachTermsReadOnly: string;
  privacyTitle: string;
  linkTermsPage: string;
  linkPrivacyPage: string;
  faq: { id: string; q: string; a: string }[];
  userTermsParagraphs: string[];
  privacyParagraphs: string[];
};

const faqEn: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "What is TJFit?",
    a: "TJFit is a premium fitness transformation platform offering complete 12-week training programs and diet systems, structured like a real coach plan for both home and gym."
  },
  {
    id: "free-start",
    q: "How do I get started for free?",
    a: "Create a free account and instantly access two complete training programs and two full diet plans — no credit card required."
  },
  {
    id: "free-vs-paid",
    q: "What is the difference between free and paid programs?",
    a: "Free programs are 4-week foundation starters. Paid programs are full 12-week systems with advanced progression, more exercises, and complete weekly detail."
  },
  {
    id: "diets",
    q: "How do the diet plans work?",
    a: "Each plan provides daily meals with ingredients, calories, macros, and simple prep instructions. Weekly calorie adjustments are built in for progression."
  },
  {
    id: "switch",
    q: "Can I switch programs?",
    a: "Yes. Any program you have purchased is accessible from your dashboard at any time."
  },
  {
    id: "messaging",
    q: "How does messaging work?",
    a: "TJFit messaging is username-based — no phone numbers or emails shared. Message coaches or other users directly on the platform."
  },
  {
    id: "become-coach",
    q: "How do I become a coach?",
    a: "Apply through the Find a Coach section. Once approved by TJFit, you must accept the Coach Terms before accessing coach features."
  },
  {
    id: "payments",
    q: "What payment methods are accepted?",
    a: LEGAL_SERVICES.en.checkout + " " + LEGAL_SERVICES.en.historical
  },
  {
    id: "privacy-data",
    q: "Is my data private?",
    a: LEGAL_SERVICES.en.sharing
  },
  {
    id: "delete",
    q: "How do I delete my account?",
    a: "Go to Profile → Settings → Delete Account. All personal data is removed within 30 days."
  },
  {
    id: "support",
    q: "How do I contact support?",
    a: "Email support@tjfit.org or use the form at the bottom of this page."
  }
];

const faqTr: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "TJFit nedir?",
    a: "TJFit; ev ve salon için, gerçek bir antrenör planı gibi yapılandırılmış tam 12 haftalık antrenman programları ve diyet sistemleri sunan premium bir dönüşüm platformudur."
  },
  {
    id: "free-start",
    q: "Ücretsiz nasıl başlarım?",
    a: "Ücretsiz hesap oluşturun; iki tam antrenman programı ve iki tam diyet planına anında erişin — kredi kartı gerekmez."
  },
  {
    id: "free-vs-paid",
    q: "Ücretsiz ve ücretli programlar arasındaki fark nedir?",
    a: "Ücretsiz programlar 4 haftalık temel başlangıçlardır. Ücretliler; ileri ilerleme, daha fazla hareket ve tam haftalık detay içeren tam 12 haftalık sistemlerdir."
  },
  {
    id: "diets",
    q: "Diyet planları nasıl çalışır?",
    a: "Her plan; günlük öğünler, malzemeler, kalori, makrolar ve basit hazırlık notları sunar. Haftalık kalori ayarları ilerleme için yerleşiktir."
  },
  {
    id: "switch",
    q: "Program değiştirebilir miyim?",
    a: "Evet. Satın aldığınız her program, istediğiniz zaman kontrol panelinizden erişilebilir."
  },
  {
    id: "messaging",
    q: "Mesajlaşma nasıl çalışır?",
    a: "TJFit mesajlaşması kullanıcı adına dayalıdır — telefon veya e-posta paylaşılmaz. Koçlar veya diğer üyelerle doğrudan platform üzerinden yazışın."
  },
  {
    id: "become-coach",
    q: "Nasıl koç olurum?",
    a: "Koç Bul bölümünden başvurun. TJFit onayladıktan sonra koç özelliklerine erişmek için Koç Şartlarını kabul etmeniz gerekir."
  },
  {
    id: "payments",
    q: "Hangi ödeme yöntemleri kabul edilir?",
    a: LEGAL_SERVICES.tr.checkout + " " + LEGAL_SERVICES.tr.historical
  },
  {
    id: "privacy-data",
    q: "Verilerim gizli mi?",
    a: LEGAL_SERVICES.tr.sharing
  },
  {
    id: "delete",
    q: "Hesabımı nasıl silerim?",
    a: "Profil → Ayarlar → Hesabı Sil. Tüm kişisel veriler 30 gün içinde kaldırılır."
  },
  {
    id: "support",
    q: "Destek ile nasıl iletişime geçerim?",
    a: "support@tjfit.org adresine yazın veya bu sayfanın altındaki formu kullanın."
  }
];

// OWNER REVIEW PENDING (2026-08-09): faqAr/faqEs/faqFr were literal English
// clones (`faqEn.map(...)`) — translated faithfully from faqEn, but they carry
// product and pricing claims (free-tier contents, 4- vs 12-week distinction,
// Provider status is shared with the full legal policies below.
const faqAr: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "ما هو TJFit؟",
    a: "TJFit منصة تحول لياقة مميزة تقدم برامج تدريب كاملة لمدة 12 أسبوعًا وأنظمة غذائية، مصممة كخطة مدرب حقيقي للمنزل والصالة معًا."
  },
  {
    id: "free-start",
    q: "كيف أبدأ مجانًا؟",
    a: "أنشئ حسابًا مجانيًا واحصل فورًا على برنامجين تدريبيين كاملين وخطتين غذائيتين كاملتين — دون الحاجة إلى بطاقة ائتمان."
  },
  {
    id: "free-vs-paid",
    q: "ما الفرق بين البرامج المجانية والمدفوعة؟",
    a: "البرامج المجانية هي برامج تأسيسية لمدة 4 أسابيع. أما المدفوعة فهي أنظمة كاملة لمدة 12 أسبوعًا مع تدرج متقدم وتمارين أكثر وتفاصيل أسبوعية كاملة."
  },
  {
    id: "diets",
    q: "كيف تعمل الخطط الغذائية؟",
    a: "توفر كل خطة وجبات يومية مع المكونات والسعرات والماكروز وتعليمات تحضير بسيطة، مع تعديلات أسبوعية للسعرات من أجل التقدم."
  },
  {
    id: "switch",
    q: "هل يمكنني تبديل البرامج؟",
    a: "نعم. أي برنامج اشتريته يبقى متاحًا من لوحة التحكم في أي وقت."
  },
  {
    id: "messaging",
    q: "كيف تعمل المراسلة؟",
    a: "تعتمد مراسلة TJFit على اسم المستخدم — دون مشاركة أرقام الهواتف أو البريد الإلكتروني. راسل المدربين أو المستخدمين الآخرين مباشرة داخل المنصة."
  },
  {
    id: "become-coach",
    q: "كيف أصبح مدربًا؟",
    a: "قدّم طلبك عبر قسم «ابحث عن مدرب». بعد موافقة TJFit، يجب قبول شروط المدرب قبل الوصول إلى ميزات المدرب."
  },
  {
    id: "payments",
    q: "ما وسائل الدفع المقبولة؟",
    a: LEGAL_SERVICES.ar.checkout + " " + LEGAL_SERVICES.ar.historical
  },
  {
    id: "privacy-data",
    q: "هل بياناتي خاصة؟",
    a: LEGAL_SERVICES.ar.sharing
  },
  {
    id: "delete",
    q: "كيف أحذف حسابي؟",
    a: "اذهب إلى الملف الشخصي ← الإعدادات ← حذف الحساب. تُحذف جميع البيانات الشخصية خلال 30 يومًا."
  },
  {
    id: "support",
    q: "كيف أتواصل مع الدعم؟",
    a: "راسل support@tjfit.org أو استخدم النموذج أسفل هذه الصفحة."
  }
];

const faqEs: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "¿Qué es TJFit?",
    a: "TJFit es una plataforma premium de transformación física que ofrece programas de entrenamiento completos de 12 semanas y sistemas de dieta, estructurados como el plan de un coach real, tanto para casa como para el gimnasio."
  },
  {
    id: "free-start",
    q: "¿Cómo empiezo gratis?",
    a: "Crea una cuenta gratuita y accede al instante a dos programas de entrenamiento completos y dos planes de dieta completos — sin tarjeta de crédito."
  },
  {
    id: "free-vs-paid",
    q: "¿Cuál es la diferencia entre los programas gratuitos y los de pago?",
    a: "Los programas gratuitos son iniciaciones de base de 4 semanas. Los de pago son sistemas completos de 12 semanas con progresión avanzada, más ejercicios y todo el detalle semanal."
  },
  {
    id: "diets",
    q: "¿Cómo funcionan los planes de dieta?",
    a: "Cada plan incluye comidas diarias con ingredientes, calorías, macros e instrucciones de preparación sencillas. Los ajustes semanales de calorías vienen integrados para progresar."
  },
  {
    id: "switch",
    q: "¿Puedo cambiar de programa?",
    a: "Sí. Cualquier programa que hayas comprado queda accesible desde tu panel en cualquier momento."
  },
  {
    id: "messaging",
    q: "¿Cómo funciona la mensajería?",
    a: "La mensajería de TJFit se basa en nombres de usuario — sin compartir teléfonos ni emails. Escribe a coaches u otros usuarios directamente en la plataforma."
  },
  {
    id: "become-coach",
    q: "¿Cómo me hago coach?",
    a: "Postúlate desde la sección Encuentra un Coach. Una vez aprobado por TJFit, debes aceptar los Términos de Coach antes de acceder a las herramientas de coach."
  },
  {
    id: "payments",
    q: "¿Qué métodos de pago se aceptan?",
    a: LEGAL_SERVICES.es.checkout + " " + LEGAL_SERVICES.es.historical
  },
  {
    id: "privacy-data",
    q: "¿Mis datos son privados?",
    a: LEGAL_SERVICES.es.sharing
  },
  {
    id: "delete",
    q: "¿Cómo elimino mi cuenta?",
    a: "Ve a Perfil → Ajustes → Eliminar cuenta. Todos los datos personales se eliminan en un plazo de 30 días."
  },
  {
    id: "support",
    q: "¿Cómo contacto con soporte?",
    a: "Escribe a support@tjfit.org o usa el formulario al final de esta página."
  }
];

const faqFr: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "Qu'est-ce que TJFit ?",
    a: "TJFit est une plateforme premium de transformation physique qui propose des programmes d'entraînement complets de 12 semaines et des systèmes de nutrition, structurés comme le plan d'un vrai coach, pour la maison comme pour la salle."
  },
  {
    id: "free-start",
    q: "Comment commencer gratuitement ?",
    a: "Créez un compte gratuit et accédez immédiatement à deux programmes d'entraînement complets et deux plans de nutrition complets — sans carte bancaire."
  },
  {
    id: "free-vs-paid",
    q: "Quelle est la différence entre les programmes gratuits et payants ?",
    a: "Les programmes gratuits sont des bases de démarrage de 4 semaines. Les payants sont des systèmes complets de 12 semaines avec progression avancée, plus d'exercices et tout le détail semaine par semaine."
  },
  {
    id: "diets",
    q: "Comment fonctionnent les plans de nutrition ?",
    a: "Chaque plan fournit des repas quotidiens avec ingrédients, calories, macros et des instructions de préparation simples. Les ajustements caloriques hebdomadaires sont intégrés pour progresser."
  },
  {
    id: "switch",
    q: "Puis-je changer de programme ?",
    a: "Oui. Tout programme acheté reste accessible depuis votre tableau de bord à tout moment."
  },
  {
    id: "messaging",
    q: "Comment fonctionne la messagerie ?",
    a: "La messagerie TJFit repose sur le nom d'utilisateur — aucun numéro de téléphone ni email partagé. Écrivez directement aux coachs ou aux autres membres sur la plateforme."
  },
  {
    id: "become-coach",
    q: "Comment devenir coach ?",
    a: "Postulez via la section Trouver un coach. Une fois approuvé par TJFit, vous devez accepter les Conditions des coachs avant d'accéder aux outils coach."
  },
  {
    id: "payments",
    q: "Quels moyens de paiement sont acceptés ?",
    a: LEGAL_SERVICES.fr.checkout + " " + LEGAL_SERVICES.fr.historical
  },
  {
    id: "privacy-data",
    q: "Mes données sont-elles privées ?",
    a: LEGAL_SERVICES.fr.sharing
  },
  {
    id: "delete",
    q: "Comment supprimer mon compte ?",
    a: "Allez dans Profil → Paramètres → Supprimer le compte. Toutes les données personnelles sont supprimées sous 30 jours."
  },
  {
    id: "support",
    q: "Comment contacter le support ?",
    a: "Écrivez à support@tjfit.org ou utilisez le formulaire en bas de cette page."
  }
];

function faqFor(locale: Locale) {
  if (locale === "tr") return faqTr;
  if (locale === "ar") return faqAr;
  if (locale === "es") return faqEs;
  if (locale === "fr") return faqFr;
  return faqEn;
}

const privacyEn = [
  LEGAL_SERVICES.en.paymentData,
  "2. How we use your data: to provide and improve the TJFit platform; to send account-related notifications. We do not sell your data.",
  "3. Data storage: data is stored securely via Supabase on encrypted servers.",
  "4. Your rights: you can request data export or deletion at any time. Contact: support@tjfit.org.",
  LEGAL_SERVICES.en.cookies
];

const privacyTr = [
  LEGAL_SERVICES.tr.paymentData,
  "2. Kullanım: TJFit'i sunmak ve geliştirmek; hesap bildirimleri. Verilerinizi satmayız.",
  "3. Saklama: veriler Supabase üzerinde şifreli sunucularda güvenle tutulur.",
  "4. Haklarınız: dilediğiniz zaman veri aktarımı veya silme talep edebilirsiniz. İletişim: support@tjfit.org.",
  LEGAL_SERVICES.tr.cookies
];

const privacyAr = [
  LEGAL_SERVICES.ar.paymentData,
  "2. الاستخدام: لتقديم TJFit وتحسينه وإشعارات الحساب. لا نبيع بياناتك.",
  "3. التخزين: عبر Supabase على خوادم مشفرة.",
  "4. الحقوق: يمكنك طلب تصدير أو حذف البيانات. support@tjfit.org",
  LEGAL_SERVICES.ar.cookies
];

const privacyEs = [
  LEGAL_SERVICES.es.paymentData,
  "2. Uso: operar y mejorar TJFit; notificaciones de cuenta. No vendemos datos.",
  "3. Almacenamiento: Supabase en servidores cifrados.",
  "4. Derechos: exportacion o borrado bajo solicitud. support@tjfit.org",
  LEGAL_SERVICES.es.cookies
];

const privacyFr = [
  LEGAL_SERVICES.fr.paymentData,
  "2. Usage : fournir et ameliorer TJFit ; notifications de compte. Pas de revente de donnees.",
  "3. Stockage : Supabase sur serveurs chiffres.",
  "4. Droits : export ou suppression sur demande. support@tjfit.org",
  LEGAL_SERVICES.fr.cookies
];

type LegalHubMeta = Omit<LegalHubCopy, "faq" | "userTermsParagraphs">;

const meta: Record<Locale, LegalHubMeta> = {
  en: {
    heroEyebrow: "SUPPORT & LEGAL",
    heroHeadlineBefore: "Questions & ",
    heroHeadlineGradient: "Terms.",
    heroSub: "Everything you need to know about TJFit.",
    pageTitle: "Legal & Support Center",
    pageIntro: "FAQ, member terms, coach terms (reference), and privacy—all in one place.",
    navFaq: "FAQ",
    navUserTerms: "User terms",
    navCoachTerms: "Coach terms",
    navPrivacy: "Privacy",
    faqTitle: "Frequently Asked Questions",
    userTermsTitle: "User Terms of Service",
    coachTermsTitle: "Coach Terms of Service",
    coachTermsReadOnly: "Coaches must accept these terms before accessing coach features.",
    privacyTitle: "Privacy Policy",
    linkTermsPage: "Open full Terms page",
    linkPrivacyPage: "Open full Privacy Policy",
    privacyParagraphs: privacyEn
  },
  tr: {
    heroEyebrow: "DESTEK VE YASAL",
    heroHeadlineBefore: "Sorular ve ",
    heroHeadlineGradient: "şartlar.",
    heroSub: "TJFit hakkında bilmeniz gereken her şey.",
    pageTitle: "Yasal ve Destek",
    pageIntro: "SSS, üye şartları, koç şartları özeti ve gizlilik.",
    navFaq: "SSS",
    navUserTerms: "Üye şartları",
    navCoachTerms: "Koç şartları",
    navPrivacy: "Gizlilik",
    faqTitle: "Sık sorulan sorular",
    userTermsTitle: "Kullanıcı Hizmet Şartları",
    coachTermsTitle: "Koç Hizmet Şartları",
    coachTermsReadOnly: "Koç özelliklerine erişmek için bu şartlar uygulama içinde kabul edilmelidir.",
    privacyTitle: "Gizlilik Politikası",
    linkTermsPage: "Tam şartlar",
    linkPrivacyPage: "Gizlilik politikası",
    privacyParagraphs: privacyTr
  },
  ar: {
    heroEyebrow: "الدعم والقانونية",
    heroHeadlineBefore: "أسئلة و",
    heroHeadlineGradient: "شروط.",
    heroSub: "كل ما تحتاج معرفته عن TJFit.",
    pageTitle: "القانونية والدعم",
    pageIntro: "أسئلة، شروط الأعضاء، شروط المدرب، والخصوصية.",
    navFaq: "الأسئلة",
    navUserTerms: "شروط المستخدم",
    navCoachTerms: "شروط المدرب",
    navPrivacy: "الخصوصية",
    faqTitle: "الأسئلة الشائعة",
    userTermsTitle: "شروط خدمة المستخدم",
    coachTermsTitle: "شروط خدمة المدرب",
    coachTermsReadOnly: "يجب على المدربين قبول هذه الشروط قبل استخدام ميزات المدرب.",
    privacyTitle: "سياسة الخصوصية",
    linkTermsPage: "الشروط الكاملة",
    linkPrivacyPage: "سياسة الخصوصية",
    privacyParagraphs: privacyAr
  },
  es: {
    heroEyebrow: "SOPORTE Y LEGAL",
    heroHeadlineBefore: "Preguntas y ",
    heroHeadlineGradient: "terminos.",
    heroSub: "Todo lo que necesitas saber sobre TJFit.",
    pageTitle: "Legal y soporte",
    pageIntro: "FAQ, terminos de usuario, coach y privacidad.",
    navFaq: "FAQ",
    navUserTerms: "Terminos de usuario",
    navCoachTerms: "Terminos coach",
    navPrivacy: "Privacidad",
    faqTitle: "Preguntas frecuentes",
    userTermsTitle: "Terminos de servicio del usuario",
    coachTermsTitle: "Terminos de servicio para coaches",
    coachTermsReadOnly: "Los coaches deben aceptar estos terminos antes de usar las herramientas.",
    privacyTitle: "Politica de privacidad",
    linkTermsPage: "Terminos completos",
    linkPrivacyPage: "Politica de privacidad",
    privacyParagraphs: privacyEs
  },
  fr: {
    heroEyebrow: "SUPPORT ET LEGAL",
    heroHeadlineBefore: "Questions et ",
    heroHeadlineGradient: "conditions.",
    heroSub: "Tout ce qu'il faut savoir sur TJFit.",
    pageTitle: "Infos legales",
    pageIntro: "FAQ, conditions utilisateur, coach et confidentialite.",
    navFaq: "FAQ",
    navUserTerms: "Conditions utilisateur",
    navCoachTerms: "Conditions coach",
    navPrivacy: "Confidentialite",
    faqTitle: "Questions frequentes",
    userTermsTitle: "Conditions d'utilisation",
    coachTermsTitle: "Conditions des coachs",
    coachTermsReadOnly: "Les coachs doivent accepter ces conditions avant d'acceder aux outils.",
    privacyTitle: "Politique de confidentialite",
    linkTermsPage: "Conditions completes",
    linkPrivacyPage: "Politique de confidentialite",
    privacyParagraphs: privacyFr
  }
};

const userTermsBody: Record<Locale, string[]> = {
  en: [
    "By using TJFit, you agree to the following:",
    LEGAL_SERVICES.en.adult,
    "2. Account responsibility — You are responsible for maintaining the security of your account. Do not share your login credentials.",
    "3. Acceptable use — You may not use TJFit to harass other users, distribute harmful content, or attempt to access other users' data.",
    LEGAL_SERVICES.en.checkout + " " + LEGAL_SERVICES.en.historical + " " + LEGAL_SERVICES.en.refunds,
    "5. Content — TJFit programs and diet plans are for informational purposes. Consult a medical professional before starting any fitness program.",
    "6. Termination — TJFit reserves the right to suspend accounts that violate these terms."
  ],
  tr: [
    "TJFit'i kullanarak aşağıdakileri kabul edersiniz:",
    LEGAL_SERVICES.tr.adult,
    "2. Hesap — Güvenlik sizin sorumluluğunuzdur; giriş bilgilerini paylaşmayın.",
    "3. Kullanım — Taciz, zararlı içerik veya başkalarının verilerine yetkisiz erişim yasaktır.",
    LEGAL_SERVICES.tr.checkout + " " + LEGAL_SERVICES.tr.historical + " " + LEGAL_SERVICES.tr.refunds,
    "5. İçerik — Programlar bilgilendiricidir; başlamadan önce doktorunuza danışın.",
    "6. Sonlandırma — İhlalde hesap askıya alınabilir."
  ],
  ar: [
    "باستخدام TJFit فإنك توافق على ما يلي:",
    LEGAL_SERVICES.ar.adult,
    "2. الحساب — أنت مسؤول عن أمان حسابك.",
    "3. الاستخدام المقبول — ممنوع المضايقة أو المحتوى الضار أو الوصول غير المصرح به لبيانات الآخرين.",
    LEGAL_SERVICES.ar.checkout + " " + LEGAL_SERVICES.ar.historical + " " + LEGAL_SERVICES.ar.refunds,
    "5. المحتوى — لأغراض معلوماتية؛ استشر مختصًا صحيًا قبل البدء.",
    "6. الإيقاف — يجوز تعليق الحسابات المخالفة."
  ],
  es: [
    "Al usar TJFit aceptas lo siguiente:",
    LEGAL_SERVICES.es.adult,
    "2. Cuenta — eres responsable de la seguridad de tu cuenta.",
    "3. Uso aceptable — no acosar, no contenido dañino ni acceso no autorizado a datos ajenos.",
    LEGAL_SERVICES.es.checkout + " " + LEGAL_SERVICES.es.historical + " " + LEGAL_SERVICES.es.refunds,
    "5. Contenido — informativo; consulta a un profesional de salud antes de empezar.",
    "6. Terminacion — TJFit puede suspender cuentas que incumplan."
  ],
  fr: [
    "En utilisant TJFit vous acceptez :",
    LEGAL_SERVICES.fr.adult,
    "2. Compte — vous assurez la securite de votre compte.",
    "3. Usage — pas de harcelement, contenu nuisible ou acces non autorise aux donnees d'autrui.",
    LEGAL_SERVICES.fr.checkout + " " + LEGAL_SERVICES.fr.historical + " " + LEGAL_SERVICES.fr.refunds,
    "5. Contenu — a titre informatif ; consultez un professionnel de sante avant de commencer.",
    "6. Resiliation — suspension possible en cas de violation."
  ]
};

export function getLegalHubCopy(locale: Locale): LegalHubCopy {
  const m = meta[locale] ?? meta.en;
  return {
    ...m,
    faq: faqFor(locale),
    userTermsParagraphs: userTermsBody[locale] ?? userTermsBody.en
  };
}

export function getLegalHubCoachSections(locale: Locale) {
  return getCoachTermsSections(locale);
}
