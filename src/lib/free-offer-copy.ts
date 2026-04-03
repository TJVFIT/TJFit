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
  trustLine1: string;
  trustLine2: string;
  trustLine3: string;
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
    dietKind: "Diet system",
    trustLine1: "Structured 12-week system",
    trustLine2: "Daily meals, macros, and recipes",
    trustLine3: "Free to join. No credit card."
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
    dietKind: "Diyet sistemi",
    trustLine1: "Yapilandirilmis 12 haftalik sistem",
    trustLine2: "Gunluk ogunler, makrolar ve tarifler",
    trustLine3: "Katilim ucretsiz. Kredi karti yok."
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
    dietKind: "نظام غذائي",
    trustLine1: "نظام منظم لمدة 12 أسبوعًا",
    trustLine2: "وجبات يومية وماكروس ووصفات",
    trustLine3: "مجاني. دون بطاقة ائتمان."
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
    dietKind: "Plan de comidas",
    trustLine1: "Sistema estructurado de 12 semanas",
    trustLine2: "Comidas diarias, macros y recetas",
    trustLine3: "Gratis. Sin tarjeta."
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
    dietKind: "Système repas",
    trustLine1: "Systeme structure sur 12 semaines",
    trustLine2: "Repas quotidiens, macros et recettes",
    trustLine3: "Gratuit. Sans carte bancaire."
  }
};

export function getFreeOfferCopy(locale: Locale): FreeOfferCopy {
  return c[locale] ?? c.en;
}
