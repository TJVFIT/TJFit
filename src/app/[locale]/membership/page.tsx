import { MembershipPricing } from "@/components/membership/membership-pricing";
import { PremiumPageShell } from "@/components/premium";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";
import { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

const HERO_COPY: Record<Locale, { title: string; sub: string }> = {
  en: { title: "Choose Your TJFit Plan", sub: "Unlock AI coaching, full programs, and expert support." },
  tr: { title: "TJFit Planini Sec", sub: "Yapay zeka kocluk, tam programlar ve uzman destegiyle hedeflerine ulas." },
  ar: { title: "اختر خطة TJFit", sub: "احصل على التدريب بالذكاء الاصطناعي والبرامج الكاملة والدعم المتخصص." },
  es: { title: "Elige Tu Plan TJFit", sub: "Desbloquea coaching con IA, programas completos y soporte experto." },
  fr: { title: "Choisissez Votre Plan TJFit", sub: "Debloquez le coaching IA, les programmes complets et le support expert." }
};

export default function MembershipPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const hero = HERO_COPY[locale] ?? HERO_COPY.en;

  return (
    <PremiumPageShell>
      <section
        className="relative overflow-hidden rounded-3xl border px-6 py-14 sm:px-10 sm:py-16"
        style={{
          borderColor: TJ_PALETTE.hairline,
          background: `radial-gradient(ellipse 80% 70% at 50% 0%, rgba(212,165,116,0.12), transparent 62%), ${TJ_PALETTE.obsidian}`
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          style={{ maskImage: "radial-gradient(ellipse 70% 55% at 50% 55%, black 30%, transparent 85%)" }}
          aria-hidden
        >
          <TJHeroStage variant="scarab" speed={0.75} intensity={0.85} />
        </div>
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{
              color: TJ_PALETTE.champagne,
              borderColor: "rgba(212,165,116,0.3)",
              background: "rgba(212,165,116,0.06)"
            }}
          >
            Membership
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

      <MembershipPricing locale={locale} />
    </PremiumPageShell>
  );
}
