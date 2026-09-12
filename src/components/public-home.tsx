import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_COPY, tjaiIntakeHref } from "@/lib/public-offers-copy";

const linkClass = "inline-flex min-h-11 items-center gap-3 rounded-md text-sm font-semibold text-violet-200 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300";

export function PublicHome({ locale }: { locale: Locale }) {
  const c = PUBLIC_COPY[locale];
  const offers = [
    { id: "bundles", copy: c.bundles, href: `/${locale}/bundles` },
    { id: "tjai", copy: c.tjai, href: tjaiIntakeHref(locale) },
    { id: "equipment", copy: c.equipment, href: `/${locale}/store` }
  ];
  return (
    <div className="bg-[#0c0b0f] text-[#f4f1f8]">
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-14 pt-14 sm:px-10 sm:pt-20 lg:grid-cols-12 lg:gap-0 lg:pb-20 lg:pt-24">
        <div className="relative z-10 lg:col-span-7">
          <p className="text-xs font-medium tracking-[0.12em] text-violet-300">{c.eyebrow}</p>
          <h1 className="mt-6 whitespace-pre-line text-balance font-display text-[clamp(2.8rem,6.3vw,5.7rem)] font-semibold leading-[1.04] tracking-[-0.045em] rtl:leading-[1.25] rtl:tracking-normal">{c.title}</h1>
          <p className="mt-7 max-w-lg text-base leading-8 text-[#b7b0c0]">{c.intro}</p>
          <a href="#offers" className={`${linkClass} mt-7`}>{c.explore}<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden /></a>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-sm border border-white/[0.06] bg-[#101014] lg:col-span-5 lg:aspect-[4/5]">
          <Image src="/assets/hero/hero-bicep-curl-clean.png" alt="" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover object-center opacity-75 grayscale" />
          <div className="absolute inset-0 bg-violet-500/10 mix-blend-color" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#0c0b0f]/80 px-6 py-5 backdrop-blur-sm"><p className="text-sm text-[#c9c1d3]">TJFit <span className="mx-2 text-violet-400" aria-hidden>/</span> {c.eyebrow}</p></div>
        </div>
      </section>
      <section id="offers" aria-labelledby="offers-title" className="mx-auto max-w-7xl scroll-mt-32 px-6 pb-16 sm:px-10 lg:pb-24">
        <h2 id="offers-title" className="mb-8 text-balance font-display text-2xl font-medium tracking-tight sm:text-3xl">{c.choose}</h2>
        <div className="border-t border-white/15">
          {offers.map((offer, index) => (
            <article key={offer.id} data-offer={offer.id} className="grid gap-6 border-b border-white/15 py-9 sm:grid-cols-12 sm:gap-8 sm:py-11">
              <div className="sm:col-span-5"><p className="mb-3 font-mono text-xs text-violet-300">0{index + 1} <span className="mx-2 text-white/25" aria-hidden>/</span> {offer.copy.label}</p><h3 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">{offer.copy.title}</h3></div>
              <div className="sm:col-span-7 lg:col-span-6 lg:col-start-7">
                <p className="max-w-xl text-sm leading-7 text-[#b7b0c0] sm:text-base">{offer.copy.description}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1"><span className="text-xs font-medium text-[#d0c9d8]">{offer.copy.detail}</span><Link href={offer.href} className={linkClass}>{offer.copy.cta}<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden /></Link></div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-white/[0.07] bg-[#121015]"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-10 lg:grid-cols-2 lg:py-20"><h2 className="text-balance font-display text-3xl font-medium tracking-tight">{c.toolsTitle}</h2><div><p className="max-w-lg text-sm leading-7 text-[#b7b0c0]">{c.toolsBody}</p><div className="mt-5 flex flex-wrap gap-x-8"><Link href={`/${locale}/calculator`} className={linkClass}>{c.calculator}<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden /></Link><Link href={`/${locale}/support`} className={linkClass}>{c.support}</Link></div></div></div></section>
    </div>
  );
}
