import type { Locale } from "@/lib/i18n";

export type MembershipTierCopy = {
  title: string;
  sub: string;
  monthly: string;
  annual: string;
  saveBadge: string;
  perMonthSuffix: string;
  perYearSuffix: string;
  cards: {
    core: { name: string; badge?: string; priceFree: string; cta: string; features: string[] };
    pro: { name: string; badge: string; cta: string; features: string[] };
    apex: { name: string; badge: string; cta: string; features: string[] };
  };
  tableTitle: string;
  tableRows: Array<{ feature: string; core: boolean; pro: boolean; apex: boolean }>;
  checkoutError: string;
};

const copy: Record<Locale, MembershipTierCopy> = {
  en: {
    title: "Choose your TJFit tier",
    sub: "Core is free forever. Pro and Apex unlock deeper coaching and premium AI.",
    monthly: "Monthly",
    annual: "Annual",
    saveBadge: "Save 25%",
    perMonthSuffix: "/month",
    perYearSuffix: "/year",
    cards: {
      core: {
        name: "Core",
        priceFree: "Free",
        cta: "Current free tier",
        features: ["2 free programs", "2 free diet starters", "Community + messaging", "TJCOIN earning + leaderboards", "TDEE calculator", "TJAI quiz + metrics preview"]
      },
      pro: {
        name: "Pro",
        badge: "Most Popular",
        cta: "Get Pro",
        features: ["Everything in Core", "Monthly 4-week program email", "50% off existing programs", "10% monthly discount code", "+30 TJCOIN monthly bonus", "Priority support + Pro badge"]
      },
      apex: {
        name: "Apex",
        badge: "Best Value",
        cta: "Get Apex",
        features: ["Everything in Pro", "Full TJAI plan generation", "TJAI chat + regeneration", "On-demand 12-week program + diet", "20% monthly discount code", "+75 TJCOIN monthly bonus + Apex badge"]
      }
    },
    tableTitle: "Feature comparison",
    tableRows: [
      { feature: "Community access", core: true, pro: true, apex: true },
      { feature: "TJCOIN earning", core: true, pro: true, apex: true },
      { feature: "Monthly program email", core: false, pro: true, apex: true },
      { feature: "Full TJAI generation", core: false, pro: false, apex: true },
      { feature: "TJAI chat", core: false, pro: false, apex: true },
      { feature: "Monthly bonus TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Subscription checkout is not configured yet."
  },
  tr: {
    title: "TJFit seviyeni sec",
    sub: "Core her zaman ucretsiz. Pro ve Apex daha derin kocluk ve premium AI acar.",
    monthly: "Aylik",
    annual: "Yillik",
    saveBadge: "%25 Tasarruf",
    perMonthSuffix: "/ay",
    perYearSuffix: "/yil",
    cards: {
      core: {
        name: "Core",
        priceFree: "Ucretsiz",
        cta: "Mevcut ucretsiz seviye",
        features: ["2 ucretsiz program", "2 ucretsiz diyet baslangic", "Topluluk + mesajlasma", "TJCOIN + siralamalar", "TDEE hesaplayici", "TJAI quiz + metrik onizleme"]
      },
      pro: {
        name: "Pro",
        badge: "En Populer",
        cta: "Pro Al",
        features: ["Core'daki her sey", "Aylik 4 haftalik program emaili", "Programlarda %50 indirim", "Aylik %10 indirim kodu", "Aylik +30 TJCOIN", "Oncelikli destek + Pro rozeti"]
      },
      apex: {
        name: "Apex",
        badge: "En Iyi Deger",
        cta: "Apex Al",
        features: ["Pro'daki her sey", "Tam TJAI plan uretimi", "TJAI chat + yeniden uretim", "Istek uzerine 12 haftalik plan + diyet", "Aylik %20 indirim kodu", "Aylik +75 TJCOIN + Apex rozeti"]
      }
    },
    tableTitle: "Ozellik karsilastirmasi",
    tableRows: [
      { feature: "Topluluk erisimi", core: true, pro: true, apex: true },
      { feature: "TJCOIN kazanimi", core: true, pro: true, apex: true },
      { feature: "Aylik program emaili", core: false, pro: true, apex: true },
      { feature: "Tam TJAI plan uretimi", core: false, pro: false, apex: true },
      { feature: "TJAI chat", core: false, pro: false, apex: true },
      { feature: "Aylik bonus TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Abonelik odemesi henuz ayarlanmadi."
  },
  ar: {
    title: "اختر مستوى TJFit",
    sub: "Core مجاني دائماً. Pro و Apex يفتحان مزايا أعمق.",
    monthly: "شهري",
    annual: "سنوي",
    saveBadge: "وفر 25%",
    perMonthSuffix: "/شهر",
    perYearSuffix: "/سنة",
    cards: {
      core: {
        name: "Core",
        priceFree: "مجاني",
        cta: "الخطة المجانية الحالية",
        features: ["برنامجان مجانيان", "خطان غذائيتان مجانيتان", "المجتمع + الرسائل", "TJCOIN + المتصدرون", "حاسبة TDEE", "اختبار TJAI + عرض المقاييس"]
      },
      pro: {
        name: "Pro",
        badge: "الأكثر شيوعاً",
        cta: "احصل على Pro",
        features: ["كل ما في Core", "برنامج شهري 4 أسابيع عبر البريد", "خصم 50% على البرامج", "كود خصم شهري 10%", "+30 TJCOIN شهرياً", "دعم أولوية + شارة Pro"]
      },
      apex: {
        name: "Apex",
        badge: "أفضل قيمة",
        cta: "احصل على Apex",
        features: ["كل ما في Pro", "توليد خطة TJAI كاملة", "دردشة TJAI + إعادة التوليد", "برنامج + نظام 12 أسبوع عند الطلب", "كود خصم شهري 20%", "+75 TJCOIN شهرياً + شارة Apex"]
      }
    },
    tableTitle: "مقارنة المزايا",
    tableRows: [
      { feature: "الوصول للمجتمع", core: true, pro: true, apex: true },
      { feature: "كسب TJCOIN", core: true, pro: true, apex: true },
      { feature: "برنامج شهري عبر البريد", core: false, pro: true, apex: true },
      { feature: "توليد TJAI كامل", core: false, pro: false, apex: true },
      { feature: "دردشة TJAI", core: false, pro: false, apex: true },
      { feature: "TJCOIN شهري إضافي", core: false, pro: true, apex: true }
    ],
    checkoutError: "الدفع للاشتراك غير مهيأ بعد."
  },
  es: {
    title: "Elige tu nivel TJFit",
    sub: "Core es gratis para siempre. Pro y Apex desbloquean mas valor.",
    monthly: "Mensual",
    annual: "Anual",
    saveBadge: "Ahorra 25%",
    perMonthSuffix: "/mes",
    perYearSuffix: "/ano",
    cards: {
      core: {
        name: "Core",
        priceFree: "Gratis",
        cta: "Plan gratis actual",
        features: ["2 programas gratis", "2 dietas iniciales gratis", "Comunidad + mensajes", "TJCOIN + rankings", "Calculadora TDEE", "Quiz TJAI + vista de metricas"]
      },
      pro: {
        name: "Pro",
        badge: "Mas popular",
        cta: "Obtener Pro",
        features: ["Todo en Core", "Programa mensual de 4 semanas por email", "50% en programas", "Codigo mensual 10%", "+30 TJCOIN mensual", "Soporte prioritario + badge Pro"]
      },
      apex: {
        name: "Apex",
        badge: "Mejor valor",
        cta: "Obtener Apex",
        features: ["Todo en Pro", "Generacion completa TJAI", "Chat TJAI + regeneracion", "Plan + dieta de 12 semanas on demand", "Codigo mensual 20%", "+75 TJCOIN mensual + badge Apex"]
      }
    },
    tableTitle: "Comparacion de funciones",
    tableRows: [
      { feature: "Acceso comunidad", core: true, pro: true, apex: true },
      { feature: "Ganar TJCOIN", core: true, pro: true, apex: true },
      { feature: "Programa mensual por email", core: false, pro: true, apex: true },
      { feature: "Generacion TJAI completa", core: false, pro: false, apex: true },
      { feature: "Chat TJAI", core: false, pro: false, apex: true },
      { feature: "Bonus mensual TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "El checkout de suscripcion aun no esta configurado."
  },
  fr: {
    title: "Choisissez votre niveau TJFit",
    sub: "Core reste gratuit. Pro et Apex debloquent plus de valeur.",
    monthly: "Mensuel",
    annual: "Annuel",
    saveBadge: "Economisez 25%",
    perMonthSuffix: "/mois",
    perYearSuffix: "/an",
    cards: {
      core: {
        name: "Core",
        priceFree: "Gratuit",
        cta: "Niveau gratuit actuel",
        features: ["2 programmes gratuits", "2 plans dietes gratuits", "Communaute + messages", "TJCOIN + classements", "Calculateur TDEE", "Quiz TJAI + apercu metriques"]
      },
      pro: {
        name: "Pro",
        badge: "Le plus populaire",
        cta: "Prendre Pro",
        features: ["Tout Core", "Programme mensuel 4 semaines par email", "50% sur les programmes", "Code mensuel 10%", "+30 TJCOIN par mois", "Support prioritaire + badge Pro"]
      },
      apex: {
        name: "Apex",
        badge: "Meilleure valeur",
        cta: "Prendre Apex",
        features: ["Tout Pro", "Generation complete TJAI", "Chat TJAI + regeneration", "Programme + diete 12 semaines a la demande", "Code mensuel 20%", "+75 TJCOIN par mois + badge Apex"]
      }
    },
    tableTitle: "Comparaison des fonctionnalites",
    tableRows: [
      { feature: "Acces communaute", core: true, pro: true, apex: true },
      { feature: "Gains TJCOIN", core: true, pro: true, apex: true },
      { feature: "Programme mensuel email", core: false, pro: true, apex: true },
      { feature: "Generation TJAI complete", core: false, pro: false, apex: true },
      { feature: "Chat TJAI", core: false, pro: false, apex: true },
      { feature: "Bonus mensuel TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Le paiement abonnement n'est pas configure."
  }
};

export function getMembershipTierCopy(locale: Locale) {
  return copy[locale];
}

