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
    a: "All major credit and debit cards, via our secure payment partner Gumroad."
  },
  {
    id: "privacy-data",
    q: "Is my data private?",
    a: "Yes. Your personal data is never sold or shared. See our Privacy Policy below for full details."
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
    a: "TJFit; ev ve salon icin, gercek bir antrenor plani gibi yapilandirilmis tam 12 haftalik antrenman programlari ve diyet sistemleri sunan premium bir donusum platformudur."
  },
  {
    id: "free-start",
    q: "Ucretsiz nasil baslarim?",
    a: "Ucretsiz hesap olusturun; iki tam antrenman programi ve iki tam diyet planina aninda erisin — kredi karti gerekmez."
  },
  {
    id: "free-vs-paid",
    q: "Ucretsiz ve ucretli programlar arasindaki fark nedir?",
    a: "Ucretsiz programlar 4 haftalik temel baslangiclardir. Ucretliler; ileri ilerleme, daha fazla hareket ve tam haftalik detay iceren tam 12 haftalik sistemlerdir."
  },
  {
    id: "diets",
    q: "Diyet planlari nasil calisir?",
    a: "Her plan; gunluk ogunler, malzemeler, kalori, makrolar ve basit hazirlik notlari sunar. Haftalik kalori ayarlari ilerleme icin yerlesiktir."
  },
  {
    id: "switch",
    q: "Program degistirebilir miyim?",
    a: "Evet. Satin aldiginiz her program, istediginiz zaman kontrol panelinizden erisilebilir."
  },
  {
    id: "messaging",
    q: "Mesajlasma nasil calisir?",
    a: "TJFit mesajlasmasi kullanici adina dayalidir — telefon veya e-posta paylasilmaz. Koçlar veya diger uyelerle dogrudan platform uzerinden yazisin."
  },
  {
    id: "become-coach",
    q: "Nasil koç olurum?",
    a: "Koç Bul bolumunden basvurun. TJFit onayladiktan sonra koç ozelliklerine erismek icin Koç Sartlarini kabul etmeniz gerekir."
  },
  {
    id: "payments",
    q: "Hangi odeme yontemleri kabul edilir?",
    a: "Guvenli odeme ortagimiz Gumroad uzerinden tum major kredi ve banka kartlari."
  },
  {
    id: "privacy-data",
    q: "Verilerim gizli mi?",
    a: "Evet. Kisisel verileriniz satilmaz ve paylasilmaz. Ayrintilar icin asagidaki Gizlilik Politikasina bakin."
  },
  {
    id: "delete",
    q: "Hesabimi nasil silerim?",
    a: "Profil → Ayarlar → Hesabi Sil. Tum kisisel veriler 30 gun icinde kaldirilir."
  },
  {
    id: "support",
    q: "Destek ile nasil iletisime gecerim?",
    a: "support@tjfit.org adresine yazin veya bu sayfanin altindaki formu kullanin."
  }
];

// OWNER REVIEW PENDING (2026-08-09): faqAr/faqEs/faqFr were literal English
// clones (`faqEn.map(...)`) — translated faithfully from faqEn, but they carry
// product and pricing claims (free-tier contents, 4- vs 12-week distinction,
// Gumroad, 30-day deletion). Owner signs off before these ship.
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
    a: "جميع بطاقات الائتمان والخصم الرئيسية، عبر شريك الدفع الآمن Gumroad."
  },
  {
    id: "privacy-data",
    q: "هل بياناتي خاصة؟",
    a: "نعم. بياناتك الشخصية لا تُباع ولا تُشارك أبدًا. راجع سياسة الخصوصية أدناه للتفاصيل الكاملة."
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
    a: "Todas las principales tarjetas de crédito y débito, a través de nuestro socio de pagos seguro Gumroad."
  },
  {
    id: "privacy-data",
    q: "¿Mis datos son privados?",
    a: "Sí. Tus datos personales nunca se venden ni se comparten. Consulta la Política de Privacidad más abajo para el detalle completo."
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
    a: "Toutes les principales cartes de crédit et de débit, via notre partenaire de paiement sécurisé Gumroad."
  },
  {
    id: "privacy-data",
    q: "Mes données sont-elles privées ?",
    a: "Oui. Vos données personnelles ne sont jamais vendues ni partagées. Consultez la Politique de confidentialité ci-dessous pour tous les détails."
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
  "1. Data we collect: name, email, fitness preferences, and program usage. We do not collect payment card numbers (handled by Gumroad).",
  "2. How we use your data: to provide and improve the TJFit platform; to send account-related notifications. We do not sell your data.",
  "3. Data storage: data is stored securely via Supabase on encrypted servers.",
  "4. Your rights: you can request data export or deletion at any time. Contact: support@tjfit.org.",
  "5. Cookies: we use cookies for authentication only. No advertising cookies."
];

const privacyTr = [
  "1. Toplanan veriler: ad, e-posta, fitness tercihleri ve program kullanimi. Odeme karti numaralari toplanmaz (Gumroad isler).",
  "2. Kullanim: TJFit'i sunmak ve gelistirmek; hesap bildirimleri. Verilerinizi satmayiz.",
  "3. Saklama: veriler Supabase uzerinde sifreli sunucularda guvenle tutulur.",
  "4. Haklariniz: dilediginiz zaman veri aktarimi veya silme talep edebilirsiniz. Iletisim: support@tjfit.org.",
  "5. Cerezler: yalnizca kimlik dogrulama icin cerez kullaniriz. Reklam cerezi yoktur."
];

const privacyAr = [
  "1. البيانات: الاسم والبريد وتفضيلات اللياقة واستخدام البرامج. لا نجمع أرقام البطاقات (تتولى Gumroad ذلك).",
  "2. الاستخدام: لتقديم TJFit وتحسينه وإشعارات الحساب. لا نبيع بياناتك.",
  "3. التخزين: عبر Supabase على خوادم مشفرة.",
  "4. الحقوق: يمكنك طلب تصدير أو حذف البيانات. support@tjfit.org",
  "5. ملفات تعريف الارتباط: للمصادقة فقط، دون إعلانات."
];

const privacyEs = [
  "1. Datos: nombre, email, preferencias de fitness y uso de programas. No recopilamos datos de tarjeta (Gumroad).",
  "2. Uso: operar y mejorar TJFit; notificaciones de cuenta. No vendemos datos.",
  "3. Almacenamiento: Supabase en servidores cifrados.",
  "4. Derechos: exportacion o borrado bajo solicitud. support@tjfit.org",
  "5. Cookies: solo autenticacion; sin cookies publicitarias."
];

const privacyFr = [
  "1. Donnees : nom, email, preferences fitness, usage des programmes. Pas de numeros de carte (Gumroad).",
  "2. Usage : fournir et ameliorer TJFit ; notifications de compte. Pas de revente de donnees.",
  "3. Stockage : Supabase sur serveurs chiffres.",
  "4. Droits : export ou suppression sur demande. support@tjfit.org",
  "5. Cookies : authentification uniquement ; pas de pub."
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
    heroHeadlineGradient: "sartlar.",
    heroSub: "TJFit hakkinda bilmeniz gereken her sey.",
    pageTitle: "Yasal ve Destek",
    pageIntro: "SSS, uye sartlari, koç sartlari ozeti ve gizlilik.",
    navFaq: "SSS",
    navUserTerms: "Uye sartlari",
    navCoachTerms: "Koç sartlari",
    navPrivacy: "Gizlilik",
    faqTitle: "Sik sorulan sorular",
    userTermsTitle: "Kullanici Hizmet Sartlari",
    coachTermsTitle: "Koç Hizmet Sartlari",
    coachTermsReadOnly: "Koç ozelliklerine erismek icin bu sartlar uygulama icinde kabul edilmelidir.",
    privacyTitle: "Gizlilik Politikasi",
    linkTermsPage: "Tam sartlar",
    linkPrivacyPage: "Gizlilik politikasi",
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
    "1. Eligibility — You must be 16 years or older to use TJFit.",
    "2. Account responsibility — You are responsible for maintaining the security of your account. Do not share your login credentials.",
    "3. Acceptable use — You may not use TJFit to harass other users, distribute harmful content, or attempt to access other users' data.",
    "4. Purchases — Payments are processed by Gumroad, our Merchant of Record. You are entitled to a full refund if requested within 14 days of purchase. Refund requests are handled directly by Gumroad in accordance with their refund policy at gumroad.com/refunds.",
    "5. Content — TJFit programs and diet plans are for informational purposes. Consult a medical professional before starting any fitness program.",
    "6. Termination — TJFit reserves the right to suspend accounts that violate these terms."
  ],
  tr: [
    "TJFit'i kullanarak asagidakileri kabul edersiniz:",
    "1. Uygunluk — TJFit 16 yas ve uzeri icindir.",
    "2. Hesap — Guvenlik sizin sorumlulugunuzdur; giris bilgilerini paylasmayin.",
    "3. Kullanim — Taciz, zararli icerik veya baskalarinin verilerine yetkisiz erisim yasaktir.",
    "4. Satinalmalar — Odemeler, Kayitli Satici olarak Gumroad tarafindan islenir. Satin alma tarihinden itibaren 14 gun icerisinde yapilan iade talepleri Gumroad tarafindan gumroad.com/refunds uzerinden karsilanir.",
    "5. Icerik — Programlar bilgilendiricidir; baslamadan once doktorunuza danisin.",
    "6. Sonlandirma — Ihlalde hesap askiya alinabilir."
  ],
  ar: [
    "باستخدام TJFit فإنك توافق على ما يلي:",
    "1. الأهلية — يجب أن يكون عمرك 16 عامًا فأكثر.",
    "2. الحساب — أنت مسؤول عن أمان حسابك.",
    "3. الاستخدام المقبول — ممنوع المضايقة أو المحتوى الضار أو الوصول غير المصرح به لبيانات الآخرين.",
    "4. المشتريات — تُعالَج المدفوعات عبر Gumroad بصفتها التاجر الرسمي. يحق لك استرداد كامل المبلغ إذا طلبت ذلك خلال 14 يومًا من تاريخ الشراء عبر gumroad.com/refunds.",
    "5. المحتوى — لأغراض معلوماتية؛ استشر مختصًا صحيًا قبل البدء.",
    "6. الإيقاف — يجوز تعليق الحسابات المخالفة."
  ],
  es: [
    "Al usar TJFit aceptas lo siguiente:",
    "1. Elegibilidad — debes tener 16 años o más.",
    "2. Cuenta — eres responsable de la seguridad de tu cuenta.",
    "3. Uso aceptable — no acosar, no contenido dañino ni acceso no autorizado a datos ajenos.",
    "4. Compras — Los pagos son procesados por Gumroad como Merchant of Record. Tienes derecho a un reembolso completo si lo solicitas dentro de los 14 días de la compra a través de gumroad.com/refunds.",
    "5. Contenido — informativo; consulta a un profesional de salud antes de empezar.",
    "6. Terminacion — TJFit puede suspender cuentas que incumplan."
  ],
  fr: [
    "En utilisant TJFit vous acceptez :",
    "1. Eligibilite — 16 ans minimum.",
    "2. Compte — vous assurez la securite de votre compte.",
    "3. Usage — pas de harcelement, contenu nuisible ou acces non autorise aux donnees d'autrui.",
    "4. Achats — Les paiements sont traités par Gumroad en tant que Merchant of Record. Vous avez droit à un remboursement complet si vous en faites la demande dans les 14 jours suivant l'achat via gumroad.com/refunds.",
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
