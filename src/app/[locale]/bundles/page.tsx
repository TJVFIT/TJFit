import { BundleGrid } from "./bundle-grid";

import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { BUNDLES } from "@/lib/bundles";
import { bundlesItemListJsonLd } from "@/lib/bundle-jsonld";
import { getBundlesCopy } from "@/lib/bundles-copy";
import { supportedLocales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";

export function generateMetadata({ params }: { params: { locale: string } }) {
  const site = getSiteUrl();
  const url = `${site}/${params.locale}/bundles`;
  const copy = getBundlesCopy(params.locale);
  const languages: Record<string, string> = {};
  for (const loc of supportedLocales) languages[loc] = `${site}/${loc}/bundles`;
  languages["x-default"] = `${site}/en/bundles`;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: url, languages },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url,
      type: "website"
    }
  };
}

export default function BundlesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = getBundlesCopy(locale);
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundlesItemListJsonLd(locale)) }}
      />

      <AmbientOrbs />
      <div className="relative max-w-2xl">
        {/* Slow-drifting conic-gradient halo behind the title — pure CSS, motion-safe gated via Tailwind variant */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 hidden h-72 w-72 motion-safe:block"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(34,211,238,0.18), rgba(14,165,233,0.04) 30%, transparent 60%, rgba(34,211,238,0.14) 100%)",
            filter: "blur(56px)",
            opacity: 0.7,
            animation: "tj-halo-spin 22s linear infinite"
          }}
        />
        <p
          className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80 motion-safe:animate-[tj-fade-up_520ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: "80ms" }}
        >
          {copy.eyebrow}
        </p>
        <h1
          className="relative mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: "180ms" }}
        >
          <span className="tj-title-shimmer">{copy.title(BUNDLES.length)}</span>
        </h1>
        <p
          className="relative mt-4 text-sm leading-relaxed text-muted sm:text-base motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: "320ms" }}
        >
          {copy.lead}
        </p>
      </div>

      <BundleGrid bundles={BUNDLES} locale={locale} />

      <div className="relative mt-14 overflow-hidden rounded-2xl border border-divider bg-surface/40 p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan-300/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.10)] sm:p-8">
        {/* Top hairline — drawn cyan accent that signals "this is brand-tier content" */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(34,211,238,0.45) 30%, rgba(165,243,252,0.75) 50%, rgba(34,211,238,0.45) 70%, transparent)"
          }}
        />
        {/* Top-right corner glow — same vocabulary as the cards */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-40 w-64"
          style={{
            background:
              "radial-gradient(60% 70% at 80% 20%, rgba(34,211,238,0.12), transparent 70%)"
          }}
        />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          {copy.coachEyebrow}
        </p>
        <p className="relative mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          {copy.coachBody}
        </p>
      </div>
    </section>
  );
}
