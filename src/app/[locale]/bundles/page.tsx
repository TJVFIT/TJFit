import Link from "next/link";
import { ArrowRight, FileDown } from "lucide-react";

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

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BUNDLES.map((bundle) => (
          <BundleCard key={bundle.slug} bundle={bundle} locale={locale} />
        ))}
      </div>

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

function BundleCard({
  bundle,
  locale
}: {
  bundle: (typeof BUNDLES)[number];
  locale: string;
}) {
  const detailHref = `/${locale}/bundles/${bundle.slug}`;
  const downloadHref = `/api/bundles/download/${bundle.slug}`;
  const isFree = bundle.save.toLowerCase() === "free";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,8,11,0.92),rgba(8,8,11,0.55))] shadow-[0_0_32px_rgba(34,211,238,0.06)] transition-[border-color,transform,box-shadow] duration-200 hover:border-cyan-300/45 hover:shadow-[0_0_48px_rgba(34,211,238,0.16)] motion-safe:hover:-translate-y-0.5">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(14,165,233,0.06)_45%,rgba(8,8,11,0.9))]"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{ backgroundImage: `url(${bundle.heroImage})` }}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span
            className="rounded-full border border-cyan-300/30 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur"
            aria-label={`Goal: ${bundle.goalLabel}`}
          >
            {bundle.goalLabel}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur ${
              isFree
                ? "border border-white/20 bg-white/[0.08] text-white/85"
                : "border border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-50"
            }`}
            aria-label={`Price: ${bundle.save}`}
          >
            {bundle.save}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(8,8,11,0)_0%,rgba(8,8,11,0.85)_100%)]" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold leading-tight text-white">
          {bundle.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-bright/85">
          {bundle.hook}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <dt className="text-faint">Duration</dt>
            <dd className="mt-0.5 font-semibold text-white">{bundle.weeks} weeks</dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <dt className="text-faint">Sessions</dt>
            <dd className="mt-0.5 font-semibold text-white">
              {bundle.sessionsPerWeek}×/wk
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-muted">
          {bundle.programTitle} <span className="text-faint">+</span>{" "}
          {bundle.dietTitle}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-5">
          <a
            href={downloadHref}
            aria-label={`Download ${bundle.name} PDF`}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-4 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.32)] motion-safe:active:scale-[0.97]"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Download PDF
          </a>
          <Link
            href={detailHref}
            aria-label={`Open ${bundle.name} details`}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-cyan-300/20 px-3.5 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-300/40 hover:text-cyan-100"
          >
            Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        {!isFree ? (
          <p className="mt-3 text-[10px] text-faint">
            Sign in required · branded dossier · A4 print-ready
          </p>
        ) : (
          <p className="mt-3 text-[10px] text-faint">
            Free with sign-in · branded dossier · A4 print-ready
          </p>
        )}
      </div>
    </article>
  );
}
