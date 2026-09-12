import Link from "next/link";

import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { PremiumPageShell } from "@/components/premium";
import { requireLocaleParam } from "@/lib/require-locale";
import { PRESS_COPY } from "@/lib/press-copy";

export default async function PressPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  const copy = PRESS_COPY[locale];

  return (
    <PremiumPageShell className="relative max-w-6xl">
      <AmbientOrbs />
      <section className="relative rounded-2xl border border-divider bg-surface p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          <span className="tj-title-shimmer">{copy.title}</span>
        </h1>
        <p className="mt-2 text-sm text-muted">{copy.intro}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">{copy.assets}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            [copy.assetNames[0], "/brand/logo-main.png"],
            [copy.assetNames[1], "/brand/logo-source.png"],
            [copy.assetNames[2], "/brand/logo-mark.png"],
            [copy.assetNames[3], "/og-image.jpg"]
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="group/dl inline-flex min-h-[44px] items-center justify-between rounded-xl border border-divider bg-[#0D1015] px-4 py-2 text-sm text-bright transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-purple-300/40 hover:bg-purple-300/[0.04] hover:text-purple-50 hover:shadow-[0_0_18px_rgba(168,85,247,0.14)]"
            >
              <span>{label}</span>
              <span className="text-purple-300 transition-[transform,color] duration-200 motion-safe:group-hover/dl:translate-x-0.5 group-hover/dl:text-purple-100">{copy.download} →</span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs text-dim">{copy.logoTerms}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">{copy.colors}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [copy.colorNames[0], "#A855F7"],
            [copy.colorNames[1], "#7C3AED"],
            [copy.colorNames[2], "#09090B"],
            [copy.colorNames[3], "#FFFFFF"]
          ].map(([name, value]) => (
            <div key={name} className="rounded-xl border border-divider bg-[#0D1015] p-3">
              <div className="h-10 rounded-lg border border-white/10" style={{ backgroundColor: value }} />
              <p className="mt-2 text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-muted">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">{copy.about}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{copy.aboutText}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">{copy.contact}</h2>
        <p className="mt-2 text-sm text-muted">{copy.contactText}</p>
        <a href="mailto:tjfit.org@gmail.com" className="mt-2 inline-flex min-h-11 items-center text-sm text-purple-300 underline underline-offset-4" dir="ltr">tjfit.org@gmail.com</a>
      </section>

      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">{copy.coverage}</h2>
        <p className="mt-2 text-sm text-muted">{copy.noCoverage}</p>
        <Link href={`/${locale}`} className="mt-4 inline-flex text-sm font-semibold text-purple-300">
          {copy.back} →
        </Link>
      </section>
    </PremiumPageShell>
  );
}
