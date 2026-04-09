import { MembershipPricing } from "@/components/membership/membership-pricing";
import { PremiumPageShell } from "@/components/premium";
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
      <section className="relative overflow-hidden rounded-3xl border border-[#1E2028] bg-[#09090B] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[18rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_72%)]"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-balance font-display text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-4xl">
            {hero.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">{hero.sub}</p>
        </div>
      </section>

      <MembershipPricing locale={locale} />
    </PremiumPageShell>
  );
}
