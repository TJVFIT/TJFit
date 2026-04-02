import type { Locale } from "@/lib/i18n";

export type FreeOfferCopy = {
  badge: string;
  title: string;
  subtitle: string;
  ctaStart: string;
  ctaPrograms: string;
};

const c: Record<Locale, FreeOfferCopy> = {
  en: {
    badge: "Free starters",
    title: "2 free programs + 2 free diets",
    subtitle: "Professional starter plans. Sign in to unlock full workouts and meals—upgrade when you are ready for the 12-week system.",
    ctaStart: "Start free quiz",
    ctaPrograms: "Browse library"
  },
  tr: {
    badge: "Ucretsiz baslangic",
    title: "2 ucretsiz program + 2 diyet",
    subtitle: "Profesyonel baslangic planlari. Tam icerik icin giris yapin — 12 haftalik sistem icin yukseltin.",
    ctaStart: "Ucretsiz basla",
    ctaPrograms: "Kutuphane"
  },
  ar: {
    badge: "بداية مجانية",
    title: "برنامجان + نظاما غذاء مجاناً",
    subtitle: "خطط احترافية للبداية. سجّل الدخول للمحتوى الكامل.",
    ctaStart: "ابدأ مجاناً",
    ctaPrograms: "المكتبة"
  },
  es: {
    badge: "Gratis",
    title: "2 programas + 2 dietas gratis",
    subtitle: "Planes profesionales de inicio. Crea cuenta para desbloquear.",
    ctaStart: "Empezar gratis",
    ctaPrograms: "Biblioteca"
  },
  fr: {
    badge: "Gratuit",
    title: "2 programmes + 2 regimes gratuits",
    subtitle: "Plans pro pour demarrer. Connectez-vous pour le detail.",
    ctaStart: "Commencer",
    ctaPrograms: "Bibliotheque"
  }
};

export function getFreeOfferCopy(locale: Locale): FreeOfferCopy {
  return c[locale] ?? c.en;
}
