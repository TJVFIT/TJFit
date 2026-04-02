import type { Locale } from "@/lib/i18n";

export type CoachTermsCopy = {
  badge: string;
  title: string;
  subtitle: string;
  checkboxLabel: string;
  acceptButton: string;
  accepting: string;
  mustCheck: string;
  successRedirect: string;
  errorGeneric: string;
  onlyCoaches: string;
  alreadyAccepted: string;
};

const copy: Record<Locale, CoachTermsCopy> = {
  en: {
    badge: "Coach agreement",
    title: "TJFit Coach Terms",
    subtitle: "Please read carefully. You must accept to access coach tools.",
    checkboxLabel: "I have read and accept the TJFit Coach Terms.",
    acceptButton: "Accept and continue",
    accepting: "Saving…",
    mustCheck: "Confirm the checkbox to continue.",
    successRedirect: "Redirecting…",
    errorGeneric: "Could not save acceptance. Try again.",
    onlyCoaches: "This page is for coaches only.",
    alreadyAccepted: "You are up to date. Redirecting…"
  },
  tr: {
    badge: "Koç sozlesmesi",
    title: "TJFit Koç Sartlari",
    subtitle: "Lutfen dikkatle okuyun. Koç araclarina erisim icin onay gereklidir.",
    checkboxLabel: "TJFit Koç Sartlarini okudum ve kabul ediyorum.",
    acceptButton: "Kabul et ve devam et",
    accepting: "Kaydediliyor…",
    mustCheck: "Devam etmek icin kutuyu isaretleyin.",
    successRedirect: "Yonlendiriliyor…",
    errorGeneric: "Kayit basarisiz. Tekrar deneyin.",
    onlyCoaches: "Bu sayfa yalnizca koçlar icindir.",
    alreadyAccepted: "Guncelsiniz. Yonlendiriliyor…"
  },
  ar: {
    badge: "اتفاق المدرب",
    title: "شروط مدرب تي جي فيت",
    subtitle: "يرجى القراءة بعناية. يجب الموافقة للوصول لأدوات المدرب.",
    checkboxLabel: "قرأت وأوافق على شروط مدرب تي جي فيت.",
    acceptButton: "موافقة ومتابعة",
    accepting: "جارٍ الحفظ…",
    mustCheck: "فعّل المربع للمتابعة.",
    successRedirect: "جارٍ التحويل…",
    errorGeneric: "تعذر الحفظ. حاول مرة أخرى.",
    onlyCoaches: "هذه الصفحة للمدربين فقط.",
    alreadyAccepted: "محتواك محدث. جارٍ التحويل…"
  },
  es: {
    badge: "Acuerdo coach",
    title: "Terminos para coaches TJFit",
    subtitle: "Leelo con atencion. Debes aceptar para usar herramientas de coach.",
    checkboxLabel: "He leido y acepto los Terminos para coaches de TJFit.",
    acceptButton: "Aceptar y continuar",
    accepting: "Guardando…",
    mustCheck: "Marca la casilla para continuar.",
    successRedirect: "Redirigiendo…",
    errorGeneric: "No se pudo guardar. Intenta de nuevo.",
    onlyCoaches: "Esta pagina es solo para coaches.",
    alreadyAccepted: "Estas al dia. Redirigiendo…"
  },
  fr: {
    badge: "Accord coach",
    title: "Conditions coach TJFit",
    subtitle: "Lisez attentivement. L'acceptation est requise pour les outils coach.",
    checkboxLabel: "J'ai lu et j'accepte les Conditions coach TJFit.",
    acceptButton: "Accepter et continuer",
    accepting: "Enregistrement…",
    mustCheck: "Cochez la case pour continuer.",
    successRedirect: "Redirection…",
    errorGeneric: "Enregistrement impossible. Reessayez.",
    onlyCoaches: "Cette page est reservee aux coaches.",
    alreadyAccepted: "A jour. Redirection…"
  }
};

export function getCoachTermsCopy(locale: Locale): CoachTermsCopy {
  return copy[locale] ?? copy.en;
}

/**
 * Coach terms body is English for legal clarity; headings are localized.
 * Mirrors the read-only /legal#coach-terms section.
 */
export function getCoachTermsSections(locale: Locale): { heading: string; paragraphs: string[] }[] {
  const headings: Record<Locale, string[]> = {
    en: [
      "Coach responsibilities",
      "Content quality standards",
      "Student communication",
      "Platform rules and conduct",
      "Consequences for violations",
      "Acceptance and updates"
    ],
    tr: [
      "Koç sorumluluklari",
      "Icerik kalite standartlari",
      "Danisan iletisimi",
      "Platform kurallari ve davranis",
      "Ihlal sonuclari",
      "Kabul ve guncellemeler"
    ],
    ar: [
      "مسؤوليات المدرب",
      "معايير جودة المحتوى",
      "التواصل مع المتدربين",
      "قواعد السلوك في المنصة",
      "عواقب المخالفات",
      "القبول والتحديثات"
    ],
    es: [
      "Responsabilidades del coach",
      "Calidad del contenido",
      "Comunicacion con alumnos",
      "Reglas y conducta",
      "Consecuencias por incumplimiento",
      "Aceptacion y cambios"
    ],
    fr: [
      "Responsabilites du coach",
      "Qualite du contenu",
      "Communication avec les clients",
      "Regles et conduite sur la plateforme",
      "Consequences en cas de violation",
      "Acceptation et mises a jour"
    ]
  };
  const h = headings[locale] ?? headings.en;
  const bodies: string[][] = [
    [
      "You confirm that you are qualified to provide fitness, nutrition, or related guidance in your jurisdiction, maintain any required certifications, and comply with applicable laws and professional standards.",
      "You are solely responsible for the safety and suitability of programming you prescribe; TJFit does not verify medical clearance or supervise live sessions."
    ],
    [
      "Programs, PDFs, and media you upload must be accurate, original, or properly licensed. Misleading claims, plagiarized material, or unsafe protocols are prohibited.",
      "You grant TJFit a non-exclusive license to host, process, translate where applicable, and display your content to end users who are entitled to access it through the platform."
    ],
    [
      "Communications with students must be professional, respectful, and appropriate. Do not solicit minors, send unsolicited marketing outside platform norms, or request payment off-platform to evade fees.",
      "Respond within a reasonable timeframe when using TJFit messaging. You remain the responsible party for coaching decisions; the platform provides tooling only."
    ],
    [
      "You will not harass, discriminate, doxx, spam, scrape, reverse engineer, or attempt to breach security. You will not circumvent billing, referrals, or access controls.",
      "You will follow community guidelines, respect intellectual property, and cooperate with lawful requests from TJFit operations."
    ],
    [
      "Violations may result in content removal, feature suspension, account termination, withholding of payouts where permitted, and referral to authorities if required.",
      "TJFit may audit activity patterns to protect members. Repeated or severe breaches can lead to permanent removal from the coach program."
    ],
    [
      "By accepting, you acknowledge that you have read these terms and agree to be bound by the current version.",
      "When COACH_TERMS_VERSION changes, you must accept again before coach tools remain available. Continued use after acceptance constitutes agreement to the new version."
    ]
  ];
  return h.map((heading, i) => ({
    heading,
    paragraphs: bodies[i] ?? bodies[bodies.length - 1]
  }));
}
