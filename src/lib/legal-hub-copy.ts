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
  privacyPlaceholder: string;
  linkTermsPage: string;
  linkPrivacyPage: string;
  faq: { id: string; q: string; a: string }[];
  userTermsParagraphs: string[];
};

const faqEn: { id: string; q: string; a: string }[] = [
  {
    id: "what",
    q: "What is TJFit?",
    a: "TJFit is a premium online fitness platform for structured training programs, nutrition plans, messaging, and progress tracking—built for serious transformation."
  },
  {
    id: "free-start",
    q: "How do I get started for free?",
    a: "Use Start Free to pick your goal, then create an account. Two free programs and two free diet starters unlock in your library—no card required."
  },
  {
    id: "free-vs-paid",
    q: "What is the difference between free and paid programs?",
    a: "Free starters are shorter, high-signal plans. Paid 12-week systems include full progression, deeper structure, and the complete transformation roadmap."
  },
  {
    id: "diets",
    q: "How do diet plans work?",
    a: "Nutrition items live alongside programs in the library. Starters show sample days and macros; full plans expand meals, swaps, and weekly adjustments."
  },
  {
    id: "switch",
    q: "Can I switch programs?",
    a: "Yes. Browse the marketplace anytime. If you purchased a program, it stays in your account; pick the plan that matches your current season."
  },
  {
    id: "messaging",
    q: "How does messaging work?",
    a: "Signed-in members can use the inbox when messaging is enabled for their account. Use it to coordinate with coaches you are linked with."
  },
  {
    id: "become-coach",
    q: "How do I become a coach on TJFit?",
    a: "Apply via Become a Coach. Admins review applications, promote approved accounts, and coaches must accept the Coach Terms before using coach tools."
  },
  {
    id: "payments",
    q: "What payment methods are accepted?",
    a: "Checkout uses the configured payment provider for your region. If checkout is in test mode, follow on-screen instructions."
  },
  {
    id: "privacy-data",
    q: "Is my data private?",
    a: "We use industry-standard practices and Supabase security. See the Privacy section below and the full Privacy Policy for details."
  },
  {
    id: "delete",
    q: "How do I delete my account?",
    a: "Contact support with your account email and we will process deletion requests in line with applicable law."
  },
  {
    id: "support",
    q: "How do I contact support?",
    a: "Email tjfit.org@gmail.com or use the Support page linked in navigation."
  }
];

const faqQuestionsTr = [
  "TJFit nedir?",
  "Ucretsiz nasil baslarim?",
  "Ucretli ile fark nedir?",
  "Diyet planlari nasil calisir?",
  "Program degistirebilir miyim?",
  "Mesajlasma nasil?",
  "Koç olmak icin?",
  "Odeme yontemleri?",
  "Verilerim gizli mi?",
  "Hesabi nasil silerim?",
  "Destek?"
];

function faqFor(locale: Locale) {
  if (locale === "tr") {
    return faqEn.map((item, i) => ({
      ...item,
      q: faqQuestionsTr[i] ?? item.q
    }));
  }
  return faqEn;
}

const meta: Record<
  Locale,
  Omit<LegalHubCopy, "faq" | "userTermsParagraphs">
> = {
  en: {
    heroEyebrow: "SUPPORT & LEGAL",
    heroHeadlineBefore: "Questions & ",
    heroHeadlineGradient: "Terms.",
    heroSub: "Everything you need to know about TJFit.",
    pageTitle: "Legal & Support Center",
    pageIntro: "FAQ, member terms, coach terms (reference), and privacy—all in one place.",
    navFaq: "FAQ",
    navUserTerms: "Member terms",
    navCoachTerms: "Coach terms",
    navPrivacy: "Privacy",
    faqTitle: "Frequently asked questions",
    userTermsTitle: "Member terms of use",
    coachTermsTitle: "Coach terms (reference)",
    coachTermsReadOnly: "Active coaches accept the latest version inside the app. Below is a readable reference.",
    privacyTitle: "Privacy policy (summary)",
    privacyPlaceholder:
      "TJFit processes account, training, and messaging data to run the service. We do not sell personal data. See the dedicated Privacy Policy page for the full text.",
    linkTermsPage: "Open full Terms page",
    linkPrivacyPage: "Open full Privacy Policy"
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
    faqTitle: "Sik sorulanlar",
    userTermsTitle: "Uye kullanim sartlari",
    coachTermsTitle: "Koç sartlari (referans)",
    coachTermsReadOnly: "Koçlar guncel surumu uygulama icinde kabul eder.",
    privacyTitle: "Gizlilik (ozet)",
    privacyPlaceholder:
      "Hesap ve antrenman verileri hizmet icin islenir. Tam metin icin Gizlilik Politikasi sayfasina bakin.",
    linkTermsPage: "Tam sartlar",
    linkPrivacyPage: "Gizlilik politikasi"
  },
  ar: {
    heroEyebrow: "الدعم والقانونية",
    heroHeadlineBefore: "أسئلة و",
    heroHeadlineGradient: "شروط.",
    heroSub: "كل ما تحتاج معرفته عن TJFit.",
    pageTitle: "القانونية والدعم",
    pageIntro: "أسئلة، شروط الأعضاء، شروط المدرب، والخصوصية.",
    navFaq: "الأسئلة",
    navUserTerms: "شروط العضو",
    navCoachTerms: "شروط المدرب",
    navPrivacy: "الخصوصية",
    faqTitle: "الأسئلة الشائعة",
    userTermsTitle: "شروط الاستخدام",
    coachTermsTitle: "شروط المدرب (مرجع)",
    coachTermsReadOnly: "يقبل المدربون النسخة الحالية داخل التطبيق.",
    privacyTitle: "الخصوصية (ملخص)",
    privacyPlaceholder: "نعالج البيانات اللازمة للخدمة. راجع سياسة الخصوصية الكاملة.",
    linkTermsPage: "الشروط الكاملة",
    linkPrivacyPage: "سياسة الخصوصية"
  },
  es: {
    heroEyebrow: "SOPORTE Y LEGAL",
    heroHeadlineBefore: "Preguntas y ",
    heroHeadlineGradient: "terminos.",
    heroSub: "Todo lo que necesitas saber sobre TJFit.",
    pageTitle: "Legal y soporte",
    pageIntro: "FAQ, terminos, coach y privacidad.",
    navFaq: "FAQ",
    navUserTerms: "Terminos miembro",
    navCoachTerms: "Terminos coach",
    navPrivacy: "Privacidad",
    faqTitle: "Preguntas frecuentes",
    userTermsTitle: "Terminos de uso",
    coachTermsTitle: "Terminos coach (referencia)",
    coachTermsReadOnly: "Los coaches aceptan la version en la app.",
    privacyTitle: "Privacidad (resumen)",
    privacyPlaceholder: "Tratamos datos para el servicio. Ve la politica completa.",
    linkTermsPage: "Terminos completos",
    linkPrivacyPage: "Privacidad"
  },
  fr: {
    heroEyebrow: "SUPPORT ET LEGAL",
    heroHeadlineBefore: "Questions et ",
    heroHeadlineGradient: "conditions.",
    heroSub: "Tout ce qu'il faut savoir sur TJFit.",
    pageTitle: "Infos legales",
    pageIntro: "FAQ, conditions membre et coach, confidentialite.",
    navFaq: "FAQ",
    navUserTerms: "Conditions membre",
    navCoachTerms: "Conditions coach",
    navPrivacy: "Confidentialite",
    faqTitle: "Questions frequentes",
    userTermsTitle: "Conditions d'utilisation",
    coachTermsTitle: "Conditions coach (reference)",
    coachTermsReadOnly: "Les coaches acceptent la version dans l'app.",
    privacyTitle: "Confidentialite (resume)",
    privacyPlaceholder: "Donnees traitees pour le service. Voir la politique complete.",
    linkTermsPage: "Conditions completes",
    linkPrivacyPage: "Politique de confidentialite"
  }
};

const userTermsBody: Record<Locale, string[]> = {
  en: [
    "By using TJFit you agree to follow community guidelines, provide accurate account information, and use programs for personal educational purposes unless licensed otherwise.",
    "Coaching relationships facilitated through TJFit are between members and coaches; the platform provides tooling and is not a medical provider.",
    "We may update these terms; continued use after changes constitutes acceptance."
  ],
  tr: [
    "TJFit'i kullanarak dogru bilgi vermeyi ve kurallara uymayi kabul edersiniz.",
    "Koç-uye iliskisi taraflar arasindadir; platform tipi hizmet degildir.",
    "Sartlar guncellenebilir; kullanimla kabul sayilir."
  ],
  ar: [
    "باستخدام TJFit توافق على إرشادات المجتمع وتقديم معلومات دقيقة.",
    "العلاقة التدريبية بين الأطراف؛ المنصة توفر الأدوات فقط.",
    "قد تُحدَّث الشروط؛ الاستمرار يعني الموافقة."
  ],
  es: [
    "Al usar TJFit aceptas las normas y datos veraces.",
    "La relacion coach-cliente es entre ustedes; la plataforma es herramienta.",
    "Los terminos pueden actualizarse."
  ],
  fr: [
    "En utilisant TJFit vous acceptez les regles et des informations exactes.",
    "La relation coach-client reste entre les parties.",
    "Les conditions peuvent evoluer."
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
