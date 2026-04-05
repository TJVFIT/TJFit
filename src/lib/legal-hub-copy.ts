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
    a: "All major credit and debit cards, via our secure payment partner Paddle."
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
    a: "Email support@tjfit.com or use the form at the bottom of this page."
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
    a: "Guvenli odeme ortagimiz Paddle uzerinden tum major kredi ve banka kartlari."
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
    a: "support@tjfit.com adresine yazin veya bu sayfanin altindaki formu kullanin."
  }
];

const faqAr: { id: string; q: string; a: string }[] = faqEn.map((item) => ({ ...item }));

const faqEs: { id: string; q: string; a: string }[] = faqEn.map((item) => ({ ...item }));

const faqFr: { id: string; q: string; a: string }[] = faqEn.map((item) => ({ ...item }));

function faqFor(locale: Locale) {
  if (locale === "tr") return faqTr;
  if (locale === "ar") return faqAr;
  if (locale === "es") return faqEs;
  if (locale === "fr") return faqFr;
  return faqEn;
}

const privacyEn = [
  "1. Data we collect: name, email, fitness preferences, and program usage. We do not collect payment card numbers (handled by Paddle).",
  "2. How we use your data: to provide and improve the TJFit platform; to send account-related notifications. We do not sell your data.",
  "3. Data storage: data is stored securely via Supabase on encrypted servers.",
  "4. Your rights: you can request data export or deletion at any time. Contact: support@tjfit.com.",
  "5. Cookies: we use cookies for authentication only. No advertising cookies."
];

const privacyTr = [
  "1. Toplanan veriler: ad, e-posta, fitness tercihleri ve program kullanimi. Odeme karti numaralari toplanmaz (Paddle isler).",
  "2. Kullanim: TJFit'i sunmak ve gelistirmek; hesap bildirimleri. Verilerinizi satmayiz.",
  "3. Saklama: veriler Supabase uzerinde sifreli sunucularda guvenle tutulur.",
  "4. Haklariniz: dilediginiz zaman veri aktarimi veya silme talep edebilirsiniz. Iletisim: support@tjfit.com.",
  "5. Cerezler: yalnizca kimlik dogrulama icin cerez kullaniriz. Reklam cerezi yoktur."
];

const privacyAr = [
  "1. البيانات: الاسم والبريد وتفضيلات اللياقة واستخدام البرامج. لا نجمع أرقام البطاقات (تتولى Paddle ذلك).",
  "2. الاستخدام: لتقديم TJFit وتحسينه وإشعارات الحساب. لا نبيع بياناتك.",
  "3. التخزين: عبر Supabase على خوادم مشفرة.",
  "4. الحقوق: يمكنك طلب تصدير أو حذف البيانات. support@tjfit.com",
  "5. ملفات تعريف الارتباط: للمصادقة فقط، دون إعلانات."
];

const privacyEs = [
  "1. Datos: nombre, email, preferencias de fitness y uso de programas. No recopilamos datos de tarjeta (Paddle).",
  "2. Uso: operar y mejorar TJFit; notificaciones de cuenta. No vendemos datos.",
  "3. Almacenamiento: Supabase en servidores cifrados.",
  "4. Derechos: exportacion o borrado bajo solicitud. support@tjfit.com",
  "5. Cookies: solo autenticacion; sin cookies publicitarias."
];

const privacyFr = [
  "1. Donnees : nom, email, preferences fitness, usage des programmes. Pas de numeros de carte (Paddle).",
  "2. Usage : fournir et ameliorer TJFit ; notifications de compte. Pas de revente de donnees.",
  "3. Stockage : Supabase sur serveurs chiffres.",
  "4. Droits : export ou suppression sur demande. support@tjfit.com",
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
    "4. Purchases — All program and diet purchases are non-refundable unless required by law. Access is granted immediately upon payment confirmation.",
    "5. Content — TJFit programs and diet plans are for informational purposes. Consult a medical professional before starting any fitness program.",
    "6. Termination — TJFit reserves the right to suspend accounts that violate these terms."
  ],
  tr: [
    "TJFit'i kullanarak asagidakileri kabul edersiniz:",
    "1. Uygunluk — TJFit 16 yas ve uzeri icindir.",
    "2. Hesap — Guvenlik sizin sorumlulugunuzdur; giris bilgilerini paylasmayin.",
    "3. Kullanim — Taciz, zararli icerik veya baskalarinin verilerine yetkisiz erisim yasaktir.",
    "4. Satinalmalar — Yasal zorunluluk disinda iade yoktur; odeme onayinda erisim acilir.",
    "5. Icerik — Programlar bilgilendiricidir; baslamadan once doktorunuza danisin.",
    "6. Sonlandirma — Ihlalde hesap askiya alinabilir."
  ],
  ar: [
    "باستخدام TJFit فإنك توافق على ما يلي:",
    "1. الأهلية — يجب أن يكون عمرك 16 عامًا فأكثر.",
    "2. الحساب — أنت مسؤول عن أمان حسابك.",
    "3. الاستخدام المقبول — ممنوع المضايقة أو المحتوى الضار أو الوصول غير المصرح به لبيانات الآخرين.",
    "4. المشتريات — غير قابلة للاسترداد إلا حيث يقتضي القانون؛ يُمنح الوصول فور تأكيد الدفع.",
    "5. المحتوى — لأغراض معلوماتية؛ استشر مختصًا صحيًا قبل البدء.",
    "6. الإيقاف — يجوز تعليق الحسابات المخالفة."
  ],
  es: [
    "Al usar TJFit aceptas lo siguiente:",
    "1. Elegibilidad — debes tener 16 años o más.",
    "2. Cuenta — eres responsable de la seguridad de tu cuenta.",
    "3. Uso aceptable — no acosar, no contenido dañino ni acceso no autorizado a datos ajenos.",
    "4. Compras — no reembolsables salvo ley; acceso al confirmar el pago.",
    "5. Contenido — informativo; consulta a un profesional de salud antes de empezar.",
    "6. Terminacion — TJFit puede suspender cuentas que incumplan."
  ],
  fr: [
    "En utilisant TJFit vous acceptez :",
    "1. Eligibilite — 16 ans minimum.",
    "2. Compte — vous assurez la securite de votre compte.",
    "3. Usage — pas de harcelement, contenu nuisible ou acces non autorise aux donnees d'autrui.",
    "4. Achats — non remboursables sauf obligation legale ; acces apres confirmation du paiement.",
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
