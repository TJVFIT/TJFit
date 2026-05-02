import type { Locale } from "@/lib/i18n";

// Concrete TJAI usage tiering — Apple-style pricing-page table.
// Master prompt 1.3: subs unlock more *usage* of TJAI chat after the
// user has paid for a $8 plan, never the plan itself. This makes the
// distinction visible at a glance so visitors don't think Pro/Apex
// "include" plan generation.
//
// Server component — no interactivity needed; numbers are static.

type Cell = string;

type Row = {
  label: string;
  oneTime: Cell; // "$8 plan only" column
  pro: Cell;
  apex: Cell;
};

type CopyShape = {
  eyebrow: string;
  title: string;
  intro: string;
  colOneTime: string;
  colPro: string;
  colApex: string;
  rows: Row[];
  footnote: string;
};

const COPY: Record<Locale, CopyShape> = {
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

export function TjaiUsageTierTable({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  return (
    <section className="mt-8 rounded-3xl border border-divider bg-surface p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-premium">
        {copy.eyebrow}
      </p>
      <h2 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight text-white sm:text-[32px]">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
        {copy.intro}
      </p>

      <div className="mt-7 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-divider">
              <th className="py-3 text-start text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                {/* spacer */}
              </th>
              <th className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-bright">
                {copy.colOneTime}
              </th>
              <th className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {copy.colPro}
              </th>
              <th className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-premium">
                {copy.colApex}
              </th>
            </tr>
          </thead>
          <tbody>
            {copy.rows.map((row, idx) => (
              <tr
                key={row.label}
                className={
                  idx % 2 === 0
                    ? "border-b border-divider/60"
                    : "border-b border-divider/60 bg-white/[0.012]"
                }
              >
                <td className="py-3 pe-4 text-[13px] text-muted">{row.label}</td>
                <td className="py-3 text-center text-[13px] tabular-nums text-bright">{row.oneTime}</td>
                <td className="py-3 text-center text-[13px] font-semibold tabular-nums text-white">{row.pro}</td>
                <td className="py-3 text-center text-[13px] font-semibold tabular-nums text-white">{row.apex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-faint">
        {copy.footnote}
      </p>
    </section>
  );
}
