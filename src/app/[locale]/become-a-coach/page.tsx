import Link from "next/link";
import { BecomeCoachApplicationForm } from "@/components/become-coach-application-form";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

export default function BecomeCoachPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const dict = getDictionary(locale);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#09090B] px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.10)_0%,transparent_72%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="mb-6 flex justify-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} />
        </div>
        <div className="rounded-3xl border border-[#1E2028] bg-[#111215]/80 p-6 sm:p-8">
          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            {dict.becomeCoach.badge}
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {dict.nav.becomeCoach}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{dict.becomeCoach.subtitle}</p>
          <div className="mt-7">
            <BecomeCoachApplicationForm locale={locale} />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/programs`}
              className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-2.5 text-center text-sm font-medium text-cyan-100 transition hover:border-cyan-400/50"
            >
              {dict.nav.programs}
            </Link>
            <Link
              href={`/${locale}/coaches`}
              className="rounded-full border border-white/15 px-6 py-2.5 text-center text-sm font-medium text-zinc-200 transition hover:border-white/25"
            >
              {dict.nav.coaches}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
