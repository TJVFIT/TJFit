import Link from "next/link";
import { MembershipPricing } from "@/components/membership/membership-pricing";
import { Logo } from "@/components/ui/Logo";
import { PremiumPageShell } from "@/components/premium";
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
          <Link href={`/${locale}`} className="mt-6 text-sm text-zinc-400 transition-colors hover:text-white">
            <span className="rtl:rotate-180 inline-block">?</span> {hero.back}
          </Link>
        </div>
      </section>

      <MembershipPricing locale={locale} />
    </PremiumPageShell>
  );
}
