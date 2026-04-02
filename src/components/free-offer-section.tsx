import Link from "next/link";

import type { Program } from "@/lib/content";
import { getFreeOfferCopy } from "@/lib/free-offer-copy";
import type { Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";

export function FreeOfferSection({ locale, freePrograms }: { locale: Locale; freePrograms: Program[] }) {
  const copy = getFreeOfferCopy(locale);
  const cards = freePrograms.map((p) => localizeProgram(p, locale));

  return (
    <section className="border-b border-white/[0.06] bg-[#0A0A0B] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="badge border-cyan-400/30 bg-cyan-500/10 text-cyan-200">{copy.badge}</span>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.title}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{copy.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/start`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-2.5 text-sm font-semibold text-[#05080a]"
              >
                {copy.ctaStart}
              </Link>
              <Link
                href={`/${locale}/programs`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.04]"
              >
                {copy.ctaPrograms}
              </Link>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
            {cards.map((p) => (
              <Link
                key={p.slug}
                href={`/${locale}/programs/${p.slug}`}
                className="rounded-2xl border border-white/[0.08] bg-[#111215]/90 p-4 transition hover:border-cyan-400/25 hover:bg-[#111215]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300/90">FREE</p>
                <p className="mt-2 text-sm font-semibold text-white">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.category} · {p.duration}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
