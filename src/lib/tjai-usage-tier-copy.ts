import type { Locale } from "@/lib/i18n";

type Cell = string;

type TjaiUsageTierRow = {
  label: string;
  oneTime: Cell; // "$8 plan only" column
  pro: Cell;
  apex: Cell;
};

export type TjaiUsageTierCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  colOneTime: string;
  colPro: string;
  colApex: string;
  rows: TjaiUsageTierRow[];
  footnote: string;
};

const TJAI_USAGE_TIER_COPY: Record<Locale, TjaiUsageTierCopy> = {
  en: {
    eyebrow: "TJAI usage tiers",
    title: "Same plan generation. Different coaching depth.",
    intro:
      "TJAI plan generation is always $8 — flat rate, no subscription required. Pro and Apex unlock unlimited chat usage of your generated plan plus deeper coaching modes.",
    colOneTime: "$8 plan only",
    colPro: "Pro $10/mo",
    colApex: "Apex $19.99/mo",
    rows: [
      { label: "Plan generation cost", oneTime: "$8 each", pro: "$8 each", apex: "$8 each" },
      { label: "Chat messages per plan", oneTime: "10", pro: "Unlimited", apex: "Unlimited" },
      { label: "Response priority", oneTime: "Standard", pro: "Fast", apex: "Priority" },
      { label: "Voice input", oneTime: "—", pro: "✓", apex: "✓" },
      { label: "Voice output (TJAI talks back)", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Cross-plan memory", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Reasoning mode", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Form-check video upload", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Auto adaptive adjustments", oneTime: "—", pro: "✓", apex: "✓" }
    ],
    footnote:
      "Why this split? Plan generation costs the same compute regardless of who you are — we charge it flat. Subscriptions add ongoing usage value, not gated content."
  },
  tr: {
    eyebrow: "TJAI kullanım seviyeleri",
    title: "Aynı plan üretimi. Farklı koçluk derinliği.",
    intro:
      "TJAI plan üretimi her zaman 8$'dır — sabit ücret, abonelik gerekmez. Pro ve Apex; üretilen planınla sınırsız sohbet kullanımı ve daha derin koçluk modlarını açar.",
    colOneTime: "Sadece 8$ plan",
    colPro: "Pro 10$/ay",
    colApex: "Apex 19.99$/ay",
    rows: [
      { label: "Plan üretim ücreti", oneTime: "Adet 8$", pro: "Adet 8$", apex: "Adet 8$" },
      { label: "Plan başına sohbet mesajı", oneTime: "10", pro: "Sınırsız", apex: "Sınırsız" },
      { label: "Yanıt önceliği", oneTime: "Standart", pro: "Hızlı", apex: "Öncelikli" },
      { label: "Sesli giriş", oneTime: "—", pro: "✓", apex: "✓" },
      { label: "Sesli çıkış (TJAI yanıt verir)", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Plan-arası hafıza", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Akıl yürütme modu", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Form kontrolü için video yükleme", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Otomatik adaptif düzenlemeler", oneTime: "—", pro: "✓", apex: "✓" }
    ],
    footnote:
      "Neden bu ayrım? Plan üretimi kim olursanız olun aynı işlemci maliyetine sahiptir — sabit fiyatlandırıyoruz. Abonelikler kapatılmış içerik değil, sürekli kullanım değeri ekler."
  },
  ar: {
    eyebrow: "مستويات استخدام TJAI",
    title: "نفس توليد الخطة. عمق تدريب مختلف.",
    intro:
      "توليد خطة TJAI دائماً 8$ — سعر ثابت، لا حاجة لاشتراك. Pro و Apex يفتحان استخداماً غير محدود للدردشة مع خطتك المُولَّدة بالإضافة إلى أوضاع تدريب أعمق.",
    colOneTime: "خطة 8$ فقط",
    colPro: "Pro 10$/شهر",
    colApex: "Apex 19.99$/شهر",
    rows: [
      { label: "تكلفة توليد الخطة", oneTime: "8$ لكل خطة", pro: "8$ لكل خطة", apex: "8$ لكل خطة" },
      { label: "رسائل الدردشة لكل خطة", oneTime: "10", pro: "غير محدود", apex: "غير محدود" },
      { label: "أولوية الاستجابة", oneTime: "قياسية", pro: "سريعة", apex: "ذات أولوية" },
      { label: "إدخال صوتي", oneTime: "—", pro: "✓", apex: "✓" },
      { label: "خرج صوتي (TJAI يرد بصوته)", oneTime: "—", pro: "—", apex: "✓" },
      { label: "ذاكرة عبر الخطط", oneTime: "—", pro: "—", apex: "✓" },
      { label: "وضع التفكير", oneTime: "—", pro: "—", apex: "✓" },
      { label: "رفع فيديو لفحص الوضعية", oneTime: "—", pro: "—", apex: "✓" },
      { label: "تعديلات تكيفية تلقائية", oneTime: "—", pro: "✓", apex: "✓" }
    ],
    footnote:
      "لماذا هذا التقسيم؟ توليد الخطة يكلف نفس قدرة المعالج بغض النظر عمن أنت — نتقاضى رسوماً ثابتة. الاشتراكات تضيف قيمة استخدام مستمرة، وليس محتوى محجوباً."
  },
  es: {
    eyebrow: "Niveles de uso de TJAI",
    title: "La misma generación de plan. Distinta profundidad de coaching.",
    intro:
      "La generación de plan TJAI siempre cuesta $8 — tarifa plana, sin suscripción necesaria. Pro y Apex desbloquean uso ilimitado del chat con tu plan generado y modos de coaching más profundos.",
    colOneTime: "Solo plan $8",
    colPro: "Pro $10/mes",
    colApex: "Apex $19.99/mes",
    rows: [
      { label: "Coste de generación de plan", oneTime: "$8 c/u", pro: "$8 c/u", apex: "$8 c/u" },
      { label: "Mensajes de chat por plan", oneTime: "10", pro: "Ilimitados", apex: "Ilimitados" },
      { label: "Prioridad de respuesta", oneTime: "Estándar", pro: "Rápida", apex: "Prioritaria" },
      { label: "Entrada de voz", oneTime: "—", pro: "✓", apex: "✓" },
      { label: "Salida de voz (TJAI te habla)", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Memoria entre planes", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Modo de razonamiento", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Subida de vídeo para revisión de técnica", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Ajustes adaptativos automáticos", oneTime: "—", pro: "✓", apex: "✓" }
    ],
    footnote:
      "¿Por qué esta separación? Generar el plan cuesta el mismo cómputo seas quien seas — cobramos tarifa plana. Las suscripciones añaden valor de uso continuado, no contenido bloqueado."
  },
  fr: {
    eyebrow: "Niveaux d'usage TJAI",
    title: "Même génération de plan. Profondeur de coaching différente.",
    intro:
      "La génération de plan TJAI coûte toujours 8 $ — tarif unique, aucun abonnement requis. Pro et Apex débloquent un usage illimité du chat avec ton plan généré ainsi que des modes de coaching plus profonds.",
    colOneTime: "Plan 8 $ seul",
    colPro: "Pro 10 $/mois",
    colApex: "Apex 19,99 $/mois",
    rows: [
      { label: "Coût de génération du plan", oneTime: "8 $ chacun", pro: "8 $ chacun", apex: "8 $ chacun" },
      { label: "Messages de chat par plan", oneTime: "10", pro: "Illimités", apex: "Illimités" },
      { label: "Priorité de réponse", oneTime: "Standard", pro: "Rapide", apex: "Prioritaire" },
      { label: "Entrée vocale", oneTime: "—", pro: "✓", apex: "✓" },
      { label: "Sortie vocale (TJAI te parle)", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Mémoire inter-plans", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Mode raisonnement", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Téléversement vidéo pour vérification technique", oneTime: "—", pro: "—", apex: "✓" },
      { label: "Ajustements adaptatifs automatiques", oneTime: "—", pro: "✓", apex: "✓" }
    ],
    footnote:
      "Pourquoi cette séparation ? Générer un plan coûte le même calcul peu importe qui tu es — on facture en tarif fixe. Les abonnements ajoutent une valeur d'usage continue, pas du contenu bloqué."
  }
};


export function getTjaiUsageTierCopy(locale: Locale): TjaiUsageTierCopy {
  return TJAI_USAGE_TIER_COPY[locale] ?? TJAI_USAGE_TIER_COPY.en;
}
