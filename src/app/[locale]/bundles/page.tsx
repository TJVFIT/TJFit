import { BundleGrid } from "./bundle-grid";

import { BUNDLES } from "@/lib/bundles";
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

function bundlesItemListJsonLd(locale: string) {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TJFit Program Bundles",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: BUNDLES.length,
    itemListElement: BUNDLES.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site}/${locale}/bundles/${b.slug}`,
      name: b.name
    }))
  };
}

export default function BundlesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundlesItemListJsonLd(locale)) }}
      />
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Bundles
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          12 bundles. One way to train.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
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
