import type { Locale } from "@/lib/i18n";

export type FreeOfferCopy = {
  badge: string;
  title: string;
  subtitle: string;
  /** @deprecated kept for older layouts */
  ctaStart: string;
  /** @deprecated kept for older layouts */
  ctaPrograms: string;
  getFreeAccess: string;
  signInHint: string;
  signIn: string;
  programKind: string;
  dietKind: string;
};

const c: Record<Locale, FreeOfferCopy> = {
  en: {
    badge: "Free starters",
    title: "Start Free. Upgrade When Ready.",
    subtitle: "Two full programs and two diet plans — yours at no cost.",
    ctaStart: "Start free",
    ctaPrograms: "Browse programs",
    getFreeAccess: "Get Free Access →",
    signInHint: "Already have an account?",
    signIn: "Sign in →",
    programKind: "Training program",
    dietKind: "Diet system"
  },
  tr: {
    badge: "Ucretsiz baslangic",
    title: "Ucretsiz basla. Hazir olunca yukselt.",
    subtitle: "Iki tam program ve iki diyet plani — ucretsiz.",
    ctaStart: "Ucretsiz basla",
    ctaPrograms: "Programlara git",
    getFreeAccess: "Ucretsiz erisim →",
    signInHint: "Zaten hesabin var mi?",
    signIn: "Giris yap →",
    programKind: "Antrenman programi",
    dietKind: "Diyet sistemi"
  },
  ar: {
    badge: "بداية مجانية",
    title: "ابدأ مجاناً. ترقّ عند الجاهزية.",
    subtitle: "برنامجان تدريبيان كاملان ونظاما غذاء — دون تكلفة.",
    ctaStart: "ابدأ مجاناً",
    ctaPrograms: "تصفح البرامج",
    getFreeAccess: "احصل على وصول مجاني ←",
    signInHint: "لديك حساب؟",
    signIn: "تسجيل الدخول ←",
    programKind: "برنامج تدريب",
    dietKind: "نظام غذائي"
  },
  es: {
    badge: "Gratis",
    title: "Empieza gratis. Mejora cuando quieras.",
    subtitle: "Dos programas completos y dos dietas — sin coste.",
    ctaStart: "Empezar gratis",
    ctaPrograms: "Ver programas",
    getFreeAccess: "Acceso gratis →",
    signInHint: "¿Ya tienes cuenta?",
    signIn: "Iniciar sesión →",
    programKind: "Programa de entreno",
    dietKind: "Plan de comidas"
  },
  fr: {
    badge: "Gratuit",
    title: "Commencez gratuitement. Passez au complet quand vous voulez.",
    subtitle: "Deux programmes complets et deux plans repas — sans frais.",
    ctaStart: "Commencer",
    ctaPrograms: "Voir les programmes",
    getFreeAccess: "Accès gratuit →",
    signInHint: "Déjà un compte ?",
    signIn: "Connexion →",
    programKind: "Programme training",
    dietKind: "Système repas"
  }
};

export function getFreeOfferCopy(locale: Locale): FreeOfferCopy {
  return c[locale] ?? c.en;
}
