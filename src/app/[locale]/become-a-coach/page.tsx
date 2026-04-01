import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

export default function BecomeCoachPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8 text-center">
        <span className="badge">{dict.comingSoon.title}</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">{dict.nav.becomeCoach}</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">{dict.becomeCoachPage.description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/programs`}
            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-400/50"
          >
            {dict.nav.programs}
          </Link>
          <Link
            href={`/${locale}/coaches`}
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/25"
          >
            {dict.nav.coaches}
          </Link>
        </div>
      </div>
    </div>
  );
}
