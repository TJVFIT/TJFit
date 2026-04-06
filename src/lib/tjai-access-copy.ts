import type { Locale } from "@/lib/i18n";

type TjaiAccessCopy = {
  approachTitle: string;
  approachSub: string;
  moderateTitle: string;
  moderateBody: string;
  aggressiveTitle: string;
  aggressiveBody: string;
  moderateCta: string;
  aggressiveCta: string;
  compareCta: string;
  metricsTitle: string;
  metrics: { bmr: string; tdee: string; protein: string; carbs: string; fat: string };
  upgrade: { title: string; body: string; pro: string; apex: string; close: string };
  chatLimitBody: string;
};

const copy: Record<Locale, TjaiAccessCopy> = {
  en: {
    approachTitle: "How do you want to approach this?",
    approachSub: "Choose your pace, then generate your full plan.",
    moderateTitle: "Moderate Pace",
    moderateBody: "Safer and sustainable progress.",
    aggressiveTitle: "Aggressive Pace",
    aggressiveBody: "Faster progress with higher discipline.",
    moderateCta: "View Moderate Plan",
    aggressiveCta: "View Aggressive Plan",
    compareCta: "Compare Both",
    metricsTitle: "Your calculated metrics",
    metrics: { bmr: "BMR", tdee: "TDEE", protein: "Protein", carbs: "Carbs", fat: "Fat" },
    upgrade: {
      title: "Your plan is ready to generate",
      body: "Upgrade to Apex to unlock your complete 12-week system.",
      pro: "Get Pro - EUR20/mo",
      apex: "Get Apex - EUR35/mo",
      close: "Maybe later"
    },
    chatLimitBody: "You reached 10 messages. Upgrade to continue with TJAI chat."
  },
  tr: {
    approachTitle: "Bunu nasil ilerletmek istersin?",
    approachSub: "Temponu sec, sonra tam plani olustur.",
    moderateTitle: "Orta Tempo",
    moderateBody: "Daha guvenli ve surdurulebilir ilerleme.",
    aggressiveTitle: "Agresif Tempo",
    aggressiveBody: "Daha hizli sonuc, daha yuksek disiplin.",
    moderateCta: "Orta Plani Gor",
    aggressiveCta: "Agresif Plani Gor",
    compareCta: "Ikisini Karsilastir",
    metricsTitle: "Hesaplanan metriklerin",
    metrics: { bmr: "BMR", tdee: "TDEE", protein: "Protein", carbs: "Karbonhidrat", fat: "Yag" },
    upgrade: {
      title: "Planin olusturulmaya hazir",
      body: "Tam 12 haftalik sistemi acmak icin Apex'e gec.",
      pro: "Pro Al - EUR20/ay",
      apex: "Apex Al - EUR35/ay",
      close: "Daha sonra"
    },
    chatLimitBody: "10 mesaj limitine ulastin. TJAI chat icin yukselt."
  },
  ar: {
    approachTitle: "كيف تريد تنفيذ الخطة؟",
    approachSub: "اختر السرعة ثم أنشئ الخطة الكاملة.",
    moderateTitle: "وتيرة معتدلة",
    moderateBody: "تقدم آمن ومستدام.",
    aggressiveTitle: "وتيرة سريعة",
    aggressiveBody: "نتيجة أسرع مع انضباط أعلى.",
    moderateCta: "عرض الخطة المعتدلة",
    aggressiveCta: "عرض الخطة السريعة",
    compareCta: "قارن الخطتين",
    metricsTitle: "مقاييسك المحسوبة",
    metrics: { bmr: "BMR", tdee: "TDEE", protein: "بروتين", carbs: "كربوهيدرات", fat: "دهون" },
    upgrade: {
      title: "خطتك جاهزة للتوليد",
      body: "قم بالترقية إلى Apex لفتح نظام 12 أسبوع الكامل.",
      pro: "احصل على Pro - 20 يورو/شهر",
      apex: "احصل على Apex - 35 يورو/شهر",
      close: "لاحقاً"
    },
    chatLimitBody: "وصلت إلى 10 رسائل. قم بالترقية لمتابعة دردشة TJAI."
  },
  es: {
    approachTitle: "Como quieres hacerlo?",
    approachSub: "Elige ritmo y luego genera el plan completo.",
    moderateTitle: "Ritmo moderado",
    moderateBody: "Progreso seguro y sostenible.",
    aggressiveTitle: "Ritmo agresivo",
    aggressiveBody: "Resultados mas rapidos con mayor disciplina.",
    moderateCta: "Ver plan moderado",
    aggressiveCta: "Ver plan agresivo",
    compareCta: "Comparar ambos",
    metricsTitle: "Tus metricas calculadas",
    metrics: { bmr: "BMR", tdee: "TDEE", protein: "Proteina", carbs: "Carbos", fat: "Grasas" },
    upgrade: {
      title: "Tu plan esta listo para generarse",
      body: "Mejora a Apex para desbloquear tu sistema completo de 12 semanas.",
      pro: "Obtener Pro - EUR20/mes",
      apex: "Obtener Apex - EUR35/mes",
      close: "Luego"
    },
    chatLimitBody: "Llegaste a 10 mensajes. Mejora para seguir en chat TJAI."
  },
  fr: {
    approachTitle: "Comment souhaitez-vous avancer ?",
    approachSub: "Choisissez le rythme puis generez le plan complet.",
    moderateTitle: "Rythme modere",
    moderateBody: "Progression sure et durable.",
    aggressiveTitle: "Rythme agressif",
    aggressiveBody: "Resultats plus rapides avec plus de discipline.",
    moderateCta: "Voir le plan modere",
    aggressiveCta: "Voir le plan agressif",
    compareCta: "Comparer les deux",
    metricsTitle: "Vos metriques calculees",
    metrics: { bmr: "BMR", tdee: "TDEE", protein: "Proteines", carbs: "Glucides", fat: "Lipides" },
    upgrade: {
      title: "Votre plan est pret a etre genere",
      body: "Passez a Apex pour debloquer votre systeme complet 12 semaines.",
      pro: "Prendre Pro - EUR20/mois",
      apex: "Prendre Apex - EUR35/mois",
      close: "Plus tard"
    },
    chatLimitBody: "Vous avez atteint 10 messages. Passez a un niveau superieur pour continuer."
  }
};

export function getTjaiAccessCopy(locale: Locale) {
  return copy[locale];
}

