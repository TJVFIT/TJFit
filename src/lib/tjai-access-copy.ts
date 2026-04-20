import type { Locale } from "@/lib/i18n";
import { TJAI_ONE_TIME_PRICE_USD, TJAI_SUBSCRIPTION_PRICES_USD } from "@/lib/tjai-pricing";

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
  upgrade: { title: string; body: string; oneTime: string; pro: string; apex: string; close: string };
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
      title: "Your adaptive plan is ready",
      body: "Unlock one full TJAI plan for a one-time payment, then add Pro or Apex if you want ongoing coaching perks.",
      oneTime: `Unlock TJAI Plan - $${TJAI_ONE_TIME_PRICE_USD}`,
      pro: `Get Pro - $${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/mo`,
      apex: `Get Apex - $${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/mo`,
      close: "Maybe later"
    },
    chatLimitBody: "You reached your preview chat limit. Upgrade to Pro or Apex for unlimited TJAI chat."
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
      title: "Uyarlanabilir planin hazir",
      body: "Tek seferlik TJAI plan kilidini ac, sonra istersen surekli koçluk icin Pro veya Apex ekle.",
      oneTime: `TJAI Plani Ac - $${TJAI_ONE_TIME_PRICE_USD}`,
      pro: `Pro Al - $${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/ay`,
      apex: `Apex Al - $${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/ay`,
      close: "Daha sonra"
    },
    chatLimitBody: "On izleme sohbet limitine ulastin. Sinirsiz TJAI sohbeti icin Pro veya Apex'e gec."
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
      title: "خطتك التكيفية جاهزة",
      body: "افتح خطة TJAI الكاملة بدفعة واحدة، ثم أضف Pro أو Apex إذا أردت مزايا التدريب المستمر.",
      oneTime: `افتح خطة TJAI - $${TJAI_ONE_TIME_PRICE_USD}`,
      pro: `احصل على Pro - $${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/شهرياً`,
      apex: `احصل على Apex - $${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/شهرياً`,
      close: "لاحقاً"
    },
    chatLimitBody: "وصلت إلى حد المعاينة في الدردشة. قم بالترقية إلى Pro أو Apex لمحادثات TJAI غير المحدودة."
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
      title: "Tu plan adaptativo esta listo",
      body: "Desbloquea un plan TJAI completo con un pago unico y luego añade Pro o Apex si quieres continuidad de coaching.",
      oneTime: `Desbloquear plan TJAI - $${TJAI_ONE_TIME_PRICE_USD}`,
      pro: `Obtener Pro - $${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/mes`,
      apex: `Obtener Apex - $${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/mes`,
      close: "Luego"
    },
    chatLimitBody: "Llegaste al limite de chat preview. Mejora a Pro o Apex para chat TJAI ilimitado."
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
      title: "Votre plan adaptatif est pret",
      body: "Debloquez un plan TJAI complet avec un paiement unique, puis ajoutez Pro ou Apex pour le coaching continu.",
      oneTime: `Debloquer le plan TJAI - $${TJAI_ONE_TIME_PRICE_USD}`,
      pro: `Prendre Pro - $${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/mois`,
      apex: `Prendre Apex - $${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/mois`,
      close: "Plus tard"
    },
    chatLimitBody: "Vous avez atteint la limite du chat preview. Passez a Pro ou Apex pour le chat TJAI illimite."
  }
};

export function getTjaiAccessCopy(locale: Locale) {
  return copy[locale];
}

