import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileDown } from "lucide-react";

import { getBundle, listBundleSlugs, type Bundle } from "@/lib/bundles";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return listBundleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const bundle = getBundle(params.slug);
  if (!bundle) return { title: "Bundle · TJFit" };
  const url = `${getSiteUrl()}/${params.locale}/bundles/${bundle.slug}`;
  return {
    title: `${bundle.name} · TJFit`,
    description: bundle.hook,
    alternates: { canonical: url },
    openGraph: {
      title: `${bundle.name} · TJFit`,
      description: bundle.hook,
      url,
      type: "article"
    }
  };
}

function bundleJsonLd(bundle: Bundle, locale: string) {
  const url = `${getSiteUrl()}/${locale}/bundles/${bundle.slug}`;
  const image = `${getSiteUrl()}${bundle.heroImage}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.name,
    description: bundle.description,
    image,
    url,
    brand: { "@type": "Brand", name: "TJFit" },
    category: bundle.goalLabel,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: "0.00",
      availability: "https://schema.org/InStock"
    }
  };
}

export default function BundleDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const bundle = getBundle(params.slug);
  if (!bundle) notFound();

  const downloadHref = `/api/bundles/download/${bundle.slug}`;
  const isFree = bundle.save.toLowerCase() === "free";

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleJsonLd(bundle, locale)) }}
      />
      <Link
        href={`/${locale}/bundles`}
        className="inline-flex min-h-[44px] items-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        All bundles
      </Link>

      <div
        className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-cyan-400/20 bg-cover bg-center shadow-[0_0_44px_rgba(34,211,238,0.08)]"
        style={{ backgroundImage: `url(${bundle.heroImage})` }}
        aria-hidden
      >
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(8,8,11,0)_0%,rgba(8,8,11,0.85)_100%)]" />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-cyan-300/30 bg-cyan-300/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100"
              aria-label={`Goal: ${bundle.goalLabel}`}
            >
              {bundle.goalLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isFree
                  ? "border border-white/15 bg-white/[0.04] text-white/85"
                  : "border border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-50"
              }`}
              aria-label={`Price: ${bundle.save}`}
            >
              {bundle.save}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {bundle.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {bundle.hook}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-bright/85 sm:text-base">
            {bundle.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={downloadHref}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.32)] motion-safe:active:scale-[0.97] sm:flex-none"
            >
              <FileDown className="h-4 w-4" aria-hidden />
              Download PDF
            </a>
            <Link
              href={`/${locale}/tjai`}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full border border-cyan-300/25 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-300/45 hover:text-cyan-100 sm:flex-none"
            >
              Ask TJAI which to pick
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.05),rgba(34,211,238,0.01))] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">
            At a glance
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-3">
              <dt className="text-faint">Duration</dt>
              <dd className="font-semibold text-white">{bundle.weeks} weeks</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-3">
              <dt className="text-faint">Sessions</dt>
              <dd className="font-semibold text-white">
                {bundle.sessionsPerWeek} per week
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-3">
              <dt className="text-faint">Training</dt>
              <dd className="text-right font-semibold text-white">
                {bundle.programTitle}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-faint">Diet</dt>
              <dd className="text-right font-semibold text-white">
                {bundle.dietTitle}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Training framework
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          Three phases, twelve weeks.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {bundle.phases.map((phase) => (
            <div
              key={phase.name}
              className="rounded-2xl border border-divider bg-surface/40 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
                {phase.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-bright/85">
                {phase.focus}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-2xl border border-divider bg-surface/40 p-5 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Sample session
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          {bundle.sampleTrainingDay.name}
        </h2>
        <p className="mt-3 text-sm text-muted">
          A representative session from the program. Loads scale to your level.
        </p>
        <ol className="mt-6 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-black/20">
          {bundle.sampleTrainingDay.exercises.map((ex, i) => (
            <li
              key={`${ex.name}-${i}`}
              className="flex items-start justify-between gap-3 px-4 py-3.5"
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="shrink-0 text-[10px] font-bold tabular-nums text-cyan-300/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{ex.name}</p>
                  {ex.notes ? (
                    <p className="mt-0.5 text-[11px] italic leading-snug text-faint">{ex.notes}</p>
                  ) : null}
                </div>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-cyan-100">{ex.sets}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-14 rounded-2xl border border-divider bg-surface/40 p-5 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Nutrition framework
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          {bundle.dietTitle}
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
              Style
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-white">
              {bundle.nutrition.style}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
              Protein target
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-white">
              {bundle.nutrition.proteinTarget}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
              Calorie bias
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-white">
              {bundle.nutrition.calorieBias}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          {bundle.nutrition.notes}
        </p>
      </div>

      <div className="mt-14 rounded-2xl border border-divider bg-surface/40 p-5 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Sample day of eating
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          What a real day looks like
        </h2>
        <p className="mt-3 text-sm text-muted">
          Adjust portions to hit your targets. A template, not a prescription.
        </p>
        <ul className="mt-6 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-black/20">
          {bundle.sampleMealDay.map((meal, i) => (
            <li key={`${meal.meal}-${i}`} className="px-4 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
                  {meal.meal}
                </p>
                {meal.macros ? (
                  <p className="text-[11px] font-semibold text-cyan-100">{meal.macros}</p>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-bright/85">
                {meal.items}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 flex flex-col items-stretch gap-4 rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.06),rgba(34,211,238,0.01))] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            Ready to start
          </p>
          <p className="mt-1 text-base font-semibold text-white sm:text-lg">
            Download the dossier and run it today.
          </p>
        </div>
        <a
          href={downloadHref}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.32)] motion-safe:active:scale-[0.97] sm:w-auto"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          Download PDF
        </a>
      </div>
    </section>
  );
}
