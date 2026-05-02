import type { Metadata } from "next";

import { MembershipPricing } from "@/components/membership/membership-pricing";
import { PremiumPageShell } from "@/components/premium";
import { TjaiUsageTierTable } from "@/components/pricing/tjai-usage-tier-table";
import { TJ_PALETTE } from "@/components/3d/palette";
import { TJHeroStage } from "@/components/3d/hero-stage";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

const HERO_COPY: Record<Locale, { eyebrow: string; title: string; sub: string }> = {
  en: {
    eyebrow: "TJFit Pro",
    title: "TJAI first. Coaching that compounds.",
    sub:
      "Generate your plan once for $8. Add Pro for unlimited chat, voice, and adaptive adjustments. Add Apex for cross-plan memory, reasoning mode, and a monthly coach review."
  },
  tr: {
    eyebrow: "TJFit Pro",
    title: "Önce TJAI. Birikerek büyüyen koçluk.",
    sub:
      "Planını bir kez 8$'a üret. Sınırsız sohbet, sesli giriş ve adaptif düzenlemeler için Pro al. Plan-arası hafıza, akıl yürütme modu ve aylık koç incelemesi için Apex al."
  },
  ar: {
    eyebrow: "TJFit Pro",
    title: "TJAI أولاً. تدريب يتراكم مع الوقت.",
    sub:
      "ولّد خطتك مرة واحدة بـ 8$. أضف Pro للحصول على دردشة غير محدودة وإدخال صوتي وتعديلات تكيفية. أضف Apex للذاكرة عبر الخطط ووضع التفكير ومراجعة مدرب شهرية."
  },
  es: {
    eyebrow: "TJFit Pro",
    title: "TJAI primero. Coaching que se acumula.",
    sub:
      "Genera tu plan una vez por $8. Añade Pro para chat ilimitado, voz y ajustes adaptativos. Añade Apex para memoria entre planes, modo de razonamiento y revisión mensual de un coach."
  },
  fr: {
    eyebrow: "TJFit Pro",
    title: "TJAI d'abord. Un coaching qui s'accumule.",
    sub:
      "Génère ton plan une fois pour 8 $. Ajoute Pro pour un chat illimité, la voix et des ajustements adaptatifs. Ajoute Apex pour la mémoire inter-plans, le mode raisonnement et une revue de coach mensuelle."
  }
};

const PAGE_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "TJFit Pro — TJAI Coaching, Plans, and Premium Tiers",
    description:
      "Pick how deep you want TJAI to coach you. $8 plans for everyone, Pro $10/mo for unlimited chat + voice + adaptive adjustments, Apex $19.99/mo for cross-plan memory + reasoning + monthly coach review."
  },
  tr: {
    title: "TJFit Pro — TJAI Koçluğu, Planlar ve Premium Seviyeler",
    description:
      "TJAI'nin sana ne kadar derin koçluk yapmasını istediğini seç. Herkes için 8$ plan, Pro 10$/ay sınırsız sohbet + ses + adaptif düzenlemeler, Apex 19.99$/ay plan-arası hafıza + akıl yürütme + aylık koç incelemesi."
  },
  ar: {
    title: "TJFit Pro — تدريب TJAI، الخطط، والمستويات المتميزة",
    description:
      "اختر مدى عمق تدريب TJAI لك. خطط بـ 8$ للجميع، Pro 10$/شهر لدردشة غير محدودة + صوت + تعديلات تكيفية، Apex 19.99$/شهر لذاكرة عبر الخطط + وضع التفكير + مراجعة مدرب شهرية."
  },
  es: {
    title: "TJFit Pro — Coaching TJAI, Planes y Niveles Premium",
    description:
      "Elige hasta dónde quieres que TJAI te entrene. Planes a $8 para todos, Pro $10/mes para chat ilimitado + voz + ajustes adaptativos, Apex $19.99/mes para memoria entre planes + razonamiento + revisión de coach mensual."
  },
  fr: {
    title: "TJFit Pro — Coaching TJAI, Plans et Niveaux Premium",
    description:
      "Choisis la profondeur du coaching TJAI. Plans à 8 $ pour tous, Pro 10 $/mois pour chat illimité + voix + ajustements adaptatifs, Apex 19,99 $/mois pour mémoire inter-plans + raisonnement + revue de coach mensuelle."
  }
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  const meta = PAGE_METADATA[locale] ?? PAGE_METADATA.en;
  return { title: meta.title, description: meta.description };
}

export default function ProPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const hero = HERO_COPY[locale] ?? HERO_COPY.en;

  return (
    <PremiumPageShell>
      <section
        className="relative overflow-hidden rounded-3xl border px-6 py-14 sm:px-10 sm:py-16"
        style={{
          borderColor: TJ_PALETTE.hairline,
          background: `radial-gradient(ellipse 80% 70% at 50% 0%, rgba(167,139,250,0.10), transparent 62%), ${TJ_PALETTE.obsidian}`
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          style={{ maskImage: "radial-gradient(ellipse 70% 55% at 50% 55%, black 30%, transparent 85%)" }}
          aria-hidden
        >
          <TJHeroStage variant="scarab" speed={0.6} intensity={0.75} />
        </div>
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{
              color: "#A78BFA",
              borderColor: "rgba(167,139,250,0.3)",
              background: "rgba(167,139,250,0.07)"
            }}
          >
            {hero.eyebrow}
          </span>
          <h1
            className="text-balance font-display font-extrabold leading-tight tracking-[-0.03em]"
            style={{ fontSize: "clamp(32px, 5vw, 56px)", color: TJ_PALETTE.textPrimary }}
          >
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: TJ_PALETTE.textMuted }}>
            {hero.sub}
          </p>
        </div>
      </section>

      {/* TJAI usage tier table — concrete numbers per tier (master prompt 1.3).
          Goes BEFORE the Pro/Apex comparison so users see what the AI does
          before they see what each subscription costs. */}
      <TjaiUsageTierTable locale={locale} />

      {/* Existing Pro/Apex comparison + Paddle checkout. Reused as-is so the
          /membership route keeps working in parallel during the transition. */}
      <MembershipPricing locale={locale} />
    </PremiumPageShell>
  );
}
