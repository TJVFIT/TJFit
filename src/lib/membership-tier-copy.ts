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
    sub: "Standalone TJAI plan generation is a separate $10 unlock. Pro and Apex add ongoing coaching and premium member value.",
    monthly: "Monthly",
    annual: "Annual",
    saveBadge: "Save 17%",
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
        features: ["Everything in Core", "Unlimited TJAI chat", "Monthly discount code", "Early access to new features", "Daily meal-of-the-day email (early access)", "+30 TJCOIN monthly bonus"]
      },
      apex: {
        name: "Apex",
        badge: "Best Value",
        cta: "Get Apex",
        features: ["Everything in Pro", "Advanced meal swaps", "Full plan regeneration", "Priority adaptive updates", "Premium progress adaptation", "+75 TJCOIN monthly bonus + Apex badge"]
      }
    },
    tableTitle: "Feature comparison",
    tableRows: [
      { feature: "Community access", core: true, pro: true, apex: true },
      { feature: "TJCOIN earning", core: true, pro: true, apex: true },
      { feature: "Unlimited TJAI chat", core: false, pro: true, apex: true },
      { feature: "Monthly discount code", core: false, pro: true, apex: true },
      { feature: "Daily meal email", core: false, pro: true, apex: true },
      { feature: "Advanced meal swaps", core: false, pro: false, apex: true },
      { feature: "Plan regeneration", core: false, pro: false, apex: true },
      { feature: "Monthly bonus TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Subscription checkout is not configured yet."
  },
  tr: {
    title: "TJFit seviyeni sec",
    sub: "Tek seferlik TJAI plan uretimi ayri bir $10 kilididir. Pro ve Apex surekli koçluk ve premium uyelik degeri ekler.",
    monthly: "Aylik",
    annual: "Yillik",
    saveBadge: "%17 Tasarruf",
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
        features: ["Core'daki her sey", "Sinirsiz TJAI sohbeti", "Aylik indirim kodu", "Yeni ozelliklere erken erisim", "Gunluk meal-of-the-day emaili (erken erisim)", "Aylik +30 TJCOIN"]
      },
      apex: {
        name: "Apex",
        badge: "En Iyi Deger",
        cta: "Apex Al",
        features: ["Pro'daki her sey", "Gelişmis ogun degişimleri", "Tam plan yenileme", "Oncelikli uyarlanabilir guncellemeler", "Premium ilerleme adaptasyonu", "Aylik +75 TJCOIN + Apex rozeti"]
      }
    },
    tableTitle: "Ozellik karsilastirmasi",
    tableRows: [
      { feature: "Topluluk erisimi", core: true, pro: true, apex: true },
      { feature: "TJCOIN kazanimi", core: true, pro: true, apex: true },
      { feature: "Sinirsiz TJAI sohbeti", core: false, pro: true, apex: true },
      { feature: "Aylik indirim kodu", core: false, pro: true, apex: true },
      { feature: "Gunluk meal emaili", core: false, pro: true, apex: true },
      { feature: "Gelişmis ogun degişimi", core: false, pro: false, apex: true },
      { feature: "Plan yenileme", core: false, pro: false, apex: true },
      { feature: "Aylik bonus TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Abonelik odemesi henuz ayarlanmadi."
  },
  ar: {
    title: "اختر مستوى TJFit",
    sub: "فتح خطة TJAI الكاملة يتم بدفعة منفصلة قدرها 10$. أما Pro و Apex فيضيفان قيمة الاشتراك المستمرة.",
    monthly: "شهري",
    annual: "سنوي",
    saveBadge: "وفر 17%",
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
        features: ["كل ما في Core", "دردشة TJAI غير محدودة", "كود خصم شهري", "وصول مبكر للميزات الجديدة", "رسالة Meal of the Day يومية (وصول مبكر)", "+30 TJCOIN شهرياً"]
      },
      apex: {
        name: "Apex",
        badge: "أفضل قيمة",
        cta: "احصل على Apex",
        features: ["كل ما في Pro", "تبديل وجبات متقدم", "إعادة توليد كاملة للخطة", "تحديثات تكيفية ذات أولوية", "تكيف أعمق مع التقدم", "+75 TJCOIN شهرياً + شارة Apex"]
      }
    },
    tableTitle: "مقارنة المزايا",
    tableRows: [
      { feature: "الوصول للمجتمع", core: true, pro: true, apex: true },
      { feature: "كسب TJCOIN", core: true, pro: true, apex: true },
      { feature: "دردشة TJAI غير محدودة", core: false, pro: true, apex: true },
      { feature: "كود خصم شهري", core: false, pro: true, apex: true },
      { feature: "رسالة وجبة يومية", core: false, pro: true, apex: true },
      { feature: "تبديل وجبات متقدم", core: false, pro: false, apex: true },
      { feature: "إعادة توليد الخطة", core: false, pro: false, apex: true },
      { feature: "TJCOIN شهري إضافي", core: false, pro: true, apex: true }
    ],
    checkoutError: "الدفع للاشتراك غير مهيأ بعد."
  },
  es: {
    title: "Elige tu nivel TJFit",
    sub: "La generacion completa de TJAI es un desbloqueo separado de $10. Pro y Apex agregan valor continuo de coaching y membresia.",
    monthly: "Mensual",
    annual: "Anual",
    saveBadge: "Ahorra 17%",
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
        features: ["Todo en Core", "Chat TJAI ilimitado", "Codigo de descuento mensual", "Acceso anticipado a nuevas funciones", "Email diario de meal of the day (early access)", "+30 TJCOIN mensual"]
      },
      apex: {
        name: "Apex",
        badge: "Mejor valor",
        cta: "Obtener Apex",
        features: ["Todo en Pro", "Meal swaps avanzados", "Regeneracion completa del plan", "Actualizaciones adaptativas prioritarias", "Adaptacion premium del progreso", "+75 TJCOIN mensual + badge Apex"]
      }
    },
    tableTitle: "Comparacion de funciones",
    tableRows: [
      { feature: "Acceso comunidad", core: true, pro: true, apex: true },
      { feature: "Ganar TJCOIN", core: true, pro: true, apex: true },
      { feature: "Chat TJAI ilimitado", core: false, pro: true, apex: true },
      { feature: "Codigo mensual", core: false, pro: true, apex: true },
      { feature: "Email diario de comida", core: false, pro: true, apex: true },
      { feature: "Meal swaps avanzados", core: false, pro: false, apex: true },
      { feature: "Regeneracion del plan", core: false, pro: false, apex: true },
      { feature: "Bonus mensual TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "El checkout de suscripcion aun no esta configurado."
  },
  fr: {
    title: "Choisissez votre niveau TJFit",
    sub: "La generation complete TJAI est un unlock separe a $10. Pro et Apex ajoutent ensuite la valeur de coaching continu.",
    monthly: "Mensuel",
    annual: "Annuel",
    saveBadge: "Economisez 17%",
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
        features: ["Tout Core", "Chat TJAI illimite", "Code promo mensuel", "Acces anticipe aux nouvelles fonctions", "Email quotidien meal of the day (early access)", "+30 TJCOIN par mois"]
      },
      apex: {
        name: "Apex",
        badge: "Meilleure valeur",
        cta: "Prendre Apex",
        features: ["Tout Pro", "Meal swaps avances", "Regeneration complete du plan", "Mises a jour adaptatives prioritaires", "Adaptation premium du progres", "+75 TJCOIN par mois + badge Apex"]
      }
    },
    tableTitle: "Comparaison des fonctionnalites",
    tableRows: [
      { feature: "Acces communaute", core: true, pro: true, apex: true },
      { feature: "Gains TJCOIN", core: true, pro: true, apex: true },
      { feature: "Chat TJAI illimite", core: false, pro: true, apex: true },
      { feature: "Code promo mensuel", core: false, pro: true, apex: true },
      { feature: "Email repas du jour", core: false, pro: true, apex: true },
      { feature: "Meal swaps avances", core: false, pro: false, apex: true },
      { feature: "Regeneration du plan", core: false, pro: false, apex: true },
      { feature: "Bonus mensuel TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Le paiement abonnement n'est pas configure."
  }
};

export function getMembershipTierCopy(locale: Locale) {
  return copy[locale];
}

