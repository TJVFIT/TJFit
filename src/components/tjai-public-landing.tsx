import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_COPY, PUBLIC_OFFERS, tjaiIntakeHref } from "@/lib/public-offers-copy";

export function TjaiPublicLanding({ locale }: { locale: Locale }) {
  const c = PUBLIC_COPY[locale];
  const linkClass = "inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-violet-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300";
  return (
    <div className="bg-[#0c0b0f] text-[#f4f1f8]">
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-violet-300">TJAI</p>
          <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-6xl">{c.passTitle}</h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-[#b7b0c0]">{c.passIntro}</p>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#b7b0c0]">{c.tjai.description}</p>
        </div>
        <div className="rounded-xl border border-violet-300/20 bg-[#17121e] p-7 sm:p-9">
          <p className="text-sm font-medium text-violet-200">TJAI</p>
          <p className="mt-4 font-display text-6xl font-semibold tracking-tight tabular-nums" dir="ltr">${PUBLIC_OFFERS.tjaiUsd.toFixed(2)} <span className="text-sm font-normal text-[#b7b0c0]">USD</span></p>
          <p className="mt-3 text-sm text-[#c9c1d3]">{c.oneTime}</p>
          <ul className="mt-8 space-y-4 border-t border-white/10 pt-7">{c.features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-6"><Check className="mt-1 h-4 w-4 shrink-0 text-violet-300" aria-hidden /><span>{feature}</span></li>)}</ul>
          <Link href={tjaiIntakeHref(locale)} className="mt-8 flex min-h-12 items-center justify-center gap-3 rounded-md bg-violet-300 px-5 py-3 text-center text-sm font-semibold text-[#191120] transition-colors hover:bg-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-200">{c.tjai.cta}<ArrowUpRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden /></Link>
          <p className="mt-5 text-xs leading-6 text-[#aaa1b5]">{c.availability}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
        <h2 className="mb-8 max-w-2xl text-balance font-display text-3xl font-medium tracking-tight">{c.stepsTitle}</h2>
        <ol className="divide-y divide-white/10 border-y border-white/10">{c.steps.map((step, i) => <li key={step.title} className="grid gap-3 py-7 sm:grid-cols-12"><span className="font-mono text-xs text-violet-300 sm:col-span-1">0{i + 1}</span><h3 className="text-lg font-medium sm:col-span-4">{step.title}</h3><p className="max-w-lg text-sm leading-7 text-[#b7b0c0] sm:col-span-7">{step.body}</p></li>)}</ol>
        <p className="mt-7 max-w-3xl text-xs leading-6 text-[#aaa1b5]">{c.scope}</p>
      </section>
      <section className="border-t border-white/10 bg-[#121015]"><div className="mx-auto max-w-6xl px-6 py-12 sm:px-10"><h2 className="text-2xl font-medium">{c.existingTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#b7b0c0]">{c.existingBody}</p><div className="mt-4 flex flex-wrap gap-x-8"><Link className={linkClass} href={`/${locale}/ai`}>{c.openAccount}<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden /></Link><Link className={linkClass} href={`/${locale}/support`}>{c.support}</Link></div></div></section>
    </div>
  );
}
