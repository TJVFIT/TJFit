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
  tableFeatureHeader: string;
  tableRows: Array<{ feature: string; core: boolean; pro: boolean; apex: boolean }>;
  checkoutError: string;
  standalone: { eyebrow: string; oneTimeSuffix: string; body: string; cta: string };
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
    tableFeatureHeader: "Feature",
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
    checkoutError: "Subscription checkout is not configured yet.",
    standalone: {
      eyebrow: "Standalone TJAI",
      oneTimeSuffix: "one time",
      body: "One adaptive TJAI assessment, one personalized plan, and PDF export. Subscriptions are optional add-ons for ongoing coaching.",
      cta: "Unlock TJAI"
    }
  },
  tr: {
    title: "TJFit seviyeni seç",
    sub: "Tek seferlik TJAI plan üretimi ayrı bir $10 kilididir. Pro ve Apex sürekli koçluk ve premium üyelik değeri ekler.",
    monthly: "Aylık",
    annual: "Yıllık",
    saveBadge: "%17 Tasarruf",
    perMonthSuffix: "/ay",
    perYearSuffix: "/yıl",
    cards: {
      core: {
        name: "Core",
        priceFree: "Ücretsiz",
        cta: "Mevcut ücretsiz seviye",
        features: ["2 ücretsiz program", "2 ücretsiz diyet başlangıcı", "Topluluk + mesajlaşma", "TJCOIN + sıralamalar", "TDEE hesaplayıcı", "TJAI quiz + metrik önizleme"]
      },
      pro: {
        name: "Pro",
        badge: "En Popüler",
        cta: "Pro Al",
        features: ["Core'daki her şey", "Sınırsız TJAI sohbeti", "Aylık indirim kodu", "Yeni özelliklere erken erişim", "Günlük meal-of-the-day e-postası (erken erişim)", "Aylık +30 TJCOIN"]
      },
      apex: {
        name: "Apex",
        badge: "En İyi Değer",
        cta: "Apex Al",
        features: ["Pro'daki her şey", "Gelişmiş öğün değişimleri", "Tam plan yenileme", "Öncelikli uyarlanabilir güncellemeler", "Premium ilerleme adaptasyonu", "Aylık +75 TJCOIN + Apex rozeti"]
      }
    },
    tableTitle: "Özellik karşılaştırması",
    tableFeatureHeader: "Özellik",
    tableRows: [
      { feature: "Topluluk erişimi", core: true, pro: true, apex: true },
      { feature: "TJCOIN kazanımı", core: true, pro: true, apex: true },
      { feature: "Sınırsız TJAI sohbeti", core: false, pro: true, apex: true },
      { feature: "Aylık indirim kodu", core: false, pro: true, apex: true },
      { feature: "Günlük meal e-postası", core: false, pro: true, apex: true },
      { feature: "Gelişmiş öğün değişimi", core: false, pro: false, apex: true },
      { feature: "Plan yenileme", core: false, pro: false, apex: true },
      { feature: "Aylık bonus TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Abonelik ödemesi henüz ayarlanmadı.",
    standalone: {
      eyebrow: "Tek Başına TJAI",
      oneTimeSuffix: "tek seferlik",
      body: "Bir adaptif TJAI değerlendirmesi, bir kişiselleştirilmiş plan ve PDF dışa aktarımı. Abonelikler sürekli koçluk için isteğe bağlı eklentilerdir.",
      cta: "TJAI'yi aç"
    }
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
        features: ["برنامجان مجانيان", "خطتان غذائيتان مجانيتان", "المجتمع + الرسائل", "TJCOIN + المتصدرون", "حاسبة TDEE", "اختبار TJAI + عرض المقاييس"]
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
    tableFeatureHeader: "الميزة",
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
    checkoutError: "الدفع للاشتراك غير مهيأ بعد.",
    standalone: {
      eyebrow: "TJAI المستقل",
      oneTimeSuffix: "دفعة واحدة",
      body: "تقييم TJAI تكيفي واحد، وخطة مخصصة واحدة، وتصدير PDF. الاشتراكات إضافات اختيارية للتدريب المستمر.",
      cta: "افتح TJAI"
    }
  },
  es: {
    title: "Elige tu nivel TJFit",
    sub: "La generación completa de TJAI es un desbloqueo separado de $10. Pro y Apex agregan valor continuo de coaching y membresía.",
    monthly: "Mensual",
    annual: "Anual",
    saveBadge: "Ahorra 17%",
    perMonthSuffix: "/mes",
    perYearSuffix: "/año",
    cards: {
      core: {
        name: "Core",
        priceFree: "Gratis",
        cta: "Plan gratis actual",
        features: ["2 programas gratis", "2 dietas iniciales gratis", "Comunidad + mensajes", "TJCOIN + rankings", "Calculadora TDEE", "Quiz TJAI + vista de métricas"]
      },
      pro: {
        name: "Pro",
        badge: "Más popular",
        cta: "Obtener Pro",
        features: ["Todo en Core", "Chat TJAI ilimitado", "Código de descuento mensual", "Acceso anticipado a nuevas funciones", "Email diario de meal of the day (acceso anticipado)", "+30 TJCOIN mensual"]
      },
      apex: {
        name: "Apex",
        badge: "Mejor valor",
        cta: "Obtener Apex",
        features: ["Todo en Pro", "Meal swaps avanzados", "Regeneración completa del plan", "Actualizaciones adaptativas prioritarias", "Adaptación premium del progreso", "+75 TJCOIN mensual + insignia Apex"]
      }
    },
    tableTitle: "Comparación de funciones",
    tableFeatureHeader: "Función",
    tableRows: [
      { feature: "Acceso comunidad", core: true, pro: true, apex: true },
      { feature: "Ganar TJCOIN", core: true, pro: true, apex: true },
      { feature: "Chat TJAI ilimitado", core: false, pro: true, apex: true },
      { feature: "Código mensual", core: false, pro: true, apex: true },
      { feature: "Email diario de comida", core: false, pro: true, apex: true },
      { feature: "Meal swaps avanzados", core: false, pro: false, apex: true },
      { feature: "Regeneración del plan", core: false, pro: false, apex: true },
      { feature: "Bonus mensual TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "El checkout de suscripción aún no está configurado.",
    standalone: {
      eyebrow: "TJAI independiente",
      oneTimeSuffix: "pago único",
      body: "Una evaluación TJAI adaptativa, un plan personalizado y exportación a PDF. Las suscripciones son complementos opcionales para coaching continuo.",
      cta: "Desbloquear TJAI"
    }
  },
  fr: {
    title: "Choisissez votre niveau TJFit",
    sub: "La génération complète TJAI est un déblocage séparé à $10. Pro et Apex ajoutent ensuite la valeur de coaching continu.",
    monthly: "Mensuel",
    annual: "Annuel",
    saveBadge: "Économisez 17%",
    perMonthSuffix: "/mois",
    perYearSuffix: "/an",
    cards: {
      core: {
        name: "Core",
        priceFree: "Gratuit",
        cta: "Niveau gratuit actuel",
        features: ["2 programmes gratuits", "2 plans diète gratuits", "Communauté + messages", "TJCOIN + classements", "Calculateur TDEE", "Quiz TJAI + aperçu métriques"]
      },
      pro: {
        name: "Pro",
        badge: "Le plus populaire",
        cta: "Prendre Pro",
        features: ["Tout Core", "Chat TJAI illimité", "Code promo mensuel", "Accès anticipé aux nouvelles fonctions", "Email quotidien meal of the day (accès anticipé)", "+30 TJCOIN par mois"]
      },
      apex: {
        name: "Apex",
        badge: "Meilleure valeur",
        cta: "Prendre Apex",
        features: ["Tout Pro", "Meal swaps avancés", "Régénération complète du plan", "Mises à jour adaptatives prioritaires", "Adaptation premium du progrès", "+75 TJCOIN par mois + badge Apex"]
      }
    },
    tableTitle: "Comparaison des fonctionnalités",
    tableFeatureHeader: "Fonctionnalité",
    tableRows: [
      { feature: "Accès communauté", core: true, pro: true, apex: true },
      { feature: "Gains TJCOIN", core: true, pro: true, apex: true },
      { feature: "Chat TJAI illimité", core: false, pro: true, apex: true },
      { feature: "Code promo mensuel", core: false, pro: true, apex: true },
      { feature: "Email repas du jour", core: false, pro: true, apex: true },
      { feature: "Meal swaps avancés", core: false, pro: false, apex: true },
      { feature: "Régénération du plan", core: false, pro: false, apex: true },
      { feature: "Bonus mensuel TJCOIN", core: false, pro: true, apex: true }
    ],
    checkoutError: "Le paiement de l'abonnement n'est pas configuré.",
    standalone: {
      eyebrow: "TJAI autonome",
      oneTimeSuffix: "paiement unique",
      body: "Une évaluation TJAI adaptative, un plan personnalisé et un export PDF. Les abonnements sont des options pour un coaching continu.",
      cta: "Débloquer TJAI"
    }
  }
};

export function getMembershipTierCopy(locale: Locale) {
  return copy[locale];
}
