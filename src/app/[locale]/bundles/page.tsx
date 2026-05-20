import { BundleGrid } from "./bundle-grid";

import { BUNDLES } from "@/lib/bundles";
import { bundlesItemListJsonLd } from "@/lib/bundle-jsonld";
import { supportedLocales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";

export function generateMetadata({ params }: { params: { locale: string } }) {
  const site = getSiteUrl();
  const url = `${site}/${params.locale}/bundles`;
  const languages: Record<string, string> = {};
  for (const loc of supportedLocales) languages[loc] = `${site}/${loc}/bundles`;
  languages["x-default"] = `${site}/en/bundles`;
  return {
    title: "Program Bundles · TJFit",
    description:
      "Twelve 12-week training + diet bundles, delivered as branded PDF dossiers. Train smarter, eat sharper.",
    alternates: { canonical: url, languages },
    openGraph: {
      title: "Program Bundles · TJFit",
      description:
        "Twelve 12-week training + diet bundles, delivered as branded PDF dossiers.",
      url,
      type: "website"
    }
  };
}

export default function BundlesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundlesItemListJsonLd(locale)) }}
      />

      {/* Ambient cyan orb backdrop — sits behind the whole catalog, drifts on
          a long loop, motion-safe gated. Pure CSS keyframes, no canvas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute hidden motion-safe:block"
          style={{
            top: "8%",
            left: "-10%",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.16) 0%, rgba(34,211,238,0.04) 35%, transparent 70%)",
            filter: "blur(80px)",
            animation: "tj-orb-drift-a 38s ease-in-out infinite"
          }}
        />
        <div
          className="absolute hidden motion-safe:block"
          style={{
            top: "40%",
            right: "-10%",
            width: "640px",
            height: "640px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0.03) 40%, transparent 70%)",
            filter: "blur(90px)",
            animation: "tj-orb-drift-b 46s ease-in-out infinite"
          }}
        />
      </div>
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
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Bundles
        </p>
        <h1 className="relative mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          <span className="tj-title-shimmer">12 bundles. One way to train.</span>
        </h1>
        <p className="relative mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Each bundle pairs a 12-week training protocol with a matching diet
          system, delivered as a branded PDF dossier. Pick the goal — we built
          the rest.
        </p>
      </div>

      <BundleGrid bundles={BUNDLES} locale={locale} />

      <div className="mt-14 rounded-2xl border border-divider bg-surface/40 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          For coaches & affiliates
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Each PDF dossier is generated from the same blueprint that powers
          TJAI. Print it, mail it, white-label sections in your own coaching
          workflow — your TJFit purchase grants you a personal-use license.
        </p>
      </div>
    </section>
  );
}
