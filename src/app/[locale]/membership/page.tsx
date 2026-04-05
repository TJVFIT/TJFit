import Link from "next/link";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { Logo } from "@/components/ui/Logo";
import { PremiumPageShell, PremiumPanel, PremiumSectionTitle } from "@/components/premium";
import { getMembershipCopy } from "@/lib/premium-public-copy";
import { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

const HERO_COPY: Record<Locale, { badge: string; title: string; sub: string; back: string }> = {
  en: {
    badge: "COMING SOON",
    title: "TJFit Membership. Coming Soon.",
    sub: "Premium plans, AI coaching, and exclusive content. Be the first to know when we launch.",
    back: "Back to TJFit"
  },
  tr: {
    badge: "YAKINDA",
    title: "TJFit Uyelik. Yakinda.",
    sub: "Premium planlar, yapay zeka kocluk ve ozel icerikler yolda. Ilk sen haberdar ol.",
    back: "TJFit'e don"
  },
  ar: {
    badge: "??????",
    title: "????? TJFit. ??????.",
    sub: "??? ????? ?????? ??? ?????? ????. ?? ??? ?? ???? ??? ???????.",
    back: "?????? ??? TJFit"
  },
  es: {
    badge: "PROXIMAMENTE",
    title: "Membresia TJFit. Proximamente.",
    sub: "Planes premium, coaching con IA y contenido exclusivo. Se el primero en enterarte.",
    back: "Volver a TJFit"
  },
  fr: {
    badge: "BIENTOT",
    title: "Abonnement TJFit. Bientot.",
    sub: "Offres premium, coaching IA et contenu exclusif. Soyez informe des l'ouverture.",
    back: "Retour a TJFit"
  }
};

export default function MembershipPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = getMembershipCopy(locale);
  const hero = HERO_COPY[locale] ?? HERO_COPY.en;

  return (
    <PremiumPageShell>
      <section className="relative overflow-hidden rounded-3xl border border-[#1E2028] bg-[#09090B] px-6 py-12 sm:px-10">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.10)_0%,transparent_72%)]"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="animate-[tj-fade-up_400ms_ease-out_forwards]" style={{ animationDelay: "100ms", opacity: 0 }}>
            <Logo variant="icon" size="auth" href={`/${locale}`} />
          </div>
          <span
            className="mt-6 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 animate-[tj-fade-up_420ms_ease-out_forwards]"
            style={{ animationDelay: "200ms", opacity: 0 }}
          >
            {hero.badge}
          </span>
          <h1
            className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-4xl animate-[tj-fade-up_440ms_ease-out_forwards]"
            style={{ animationDelay: "350ms", opacity: 0 }}
          >
            {hero.title}
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base animate-[tj-fade-up_420ms_ease-out_forwards]"
            style={{ animationDelay: "500ms", opacity: 0 }}
          >
            {hero.sub}
          </p>
          <div
            className="mt-7 w-full max-w-xl animate-[tj-fade-up_420ms_ease-out_forwards]"
            style={{ animationDelay: "650ms", opacity: 0 }}
          >
            <LeadCaptureForm locale={locale} source="membership-coming-soon" variant="panel" />
          </div>
          <Link href={`/${locale}`} className="mt-6 text-sm text-zinc-400 transition-colors hover:text-white">
            <span className="rtl:rotate-180 inline-block">?</span> {hero.back}
          </Link>
        </div>
      </section>

      <div className="mt-12">
        <PremiumSectionTitle eyebrow={copy.badge} title={copy.title} subtitle={copy.body} />
      </div>

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{copy.pricingTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 sm:text-[15px]">{copy.pricingSub}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-8 ring-1 ring-white/[0.04]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{copy.tierStatus}</p>
              <p className="mt-4 font-display text-xl font-semibold text-white">{t.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{t.teaser}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-xs text-zinc-600 sm:text-sm">{copy.pricingFootnote}</p>
      </section>

      <div className="mt-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 sm:px-10">
        <h2 className="font-display text-lg font-semibold text-white sm:text-xl">{copy.waitlistTitle}</h2>
        <p className="mt-2 text-sm text-zinc-500">{copy.waitlistSub}</p>
        <div className="mt-8 max-w-xl">
          <LeadCaptureForm locale={locale} source="membership-waitlist-page" variant="panel" />
        </div>
      </div>

      <PremiumPanel className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/${locale}/programs`}
          className="lux-btn-primary inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[#05080a]"
        >
          {copy.ctaExplore}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="lux-btn-secondary inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
        >
          {copy.ctaAccount}
        </Link>
      </PremiumPanel>
    </PremiumPageShell>
  );
}
