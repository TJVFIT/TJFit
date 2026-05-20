import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { AtAGlance, DetailHero, DownloadButton, PhaseStrip, RevealSection, ScrollProgressBar, ShareButton } from "./detail-effects";
import { getBundle, listBundleSlugs } from "@/lib/bundles";
import { bundleProductJsonLd } from "@/lib/bundle-jsonld";
import { supportedLocales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return listBundleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const bundle = getBundle(params.slug);
  if (!bundle) return { title: "Bundle · TJFit" };
  const site = getSiteUrl();
  const url = `${site}/${params.locale}/bundles/${bundle.slug}`;
  const languages: Record<string, string> = {};
  for (const loc of supportedLocales) {
    languages[loc] = `${site}/${loc}/bundles/${bundle.slug}`;
  }
  languages["x-default"] = `${site}/en/bundles/${bundle.slug}`;
  return {
    title: `${bundle.name} · TJFit`,
    description: bundle.hook,
    alternates: { canonical: url, languages },
    openGraph: {
      title: `${bundle.name} · TJFit`,
      description: bundle.hook,
      url,
      type: "article"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleProductJsonLd(bundle, locale)) }}
      />
      <ScrollProgressBar />
      <Link
        href={`/${locale}/bundles`}
        className="group/back inline-flex min-h-[44px] items-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform motion-safe:group-hover/back:-translate-x-1"
          aria-hidden
        />
        All bundles
      </Link>

      <DetailHero image={bundle.heroImage} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div
            className="flex flex-wrap items-center gap-2 motion-safe:animate-[tj-fade-up_520ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "80ms" }}
          >
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

          <h1
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "180ms" }}
          >
            <span className="tj-title-shimmer">{bundle.name}</span>
          </h1>
          <p
            className="mt-4 text-base leading-relaxed text-muted sm:text-lg motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "280ms" }}
          >
            {bundle.hook}
          </p>
          <p
            className="mt-6 text-sm leading-relaxed text-bright/85 sm:text-base motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "380ms" }}
          >
            {bundle.description}
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3 motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "480ms" }}
          >
            <DownloadButton
              href={downloadHref}
              ariaLabel={`Download ${bundle.name} PDF`}
              className="flex-1 sm:flex-none"
            />
            <Link
              href={`/${locale}/tjai`}
              className="group/tjai tj-cta-sheen inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full border border-cyan-300/25 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-[border-color,color,box-shadow] hover:border-cyan-300/55 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:flex-none"
            >
              Ask TJAI which to pick
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform motion-safe:group-hover/tjai:translate-x-1"
                aria-hidden
              />
            </Link>
            <ShareButton title={bundle.name} ariaLabel={`Share ${bundle.name}`} />
          </div>
        </div>

        <AtAGlance
          rows={[
            { label: "Duration", value: `${bundle.weeks} weeks` },
            { label: "Sessions", value: `${bundle.sessionsPerWeek} per week` },
            { label: "Training", value: bundle.programTitle },
            { label: "Diet", value: bundle.dietTitle }
          ]}
        />
      </div>

      <div className="mt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Training framework
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          Three phases, twelve weeks.
        </h2>
        <PhaseStrip phases={bundle.phases} />
      </div>

      <RevealSection>
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
                className="tj-list-row flex items-start justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
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
      </RevealSection>

      <RevealSection delay={80}>
        <div className="mt-14 rounded-2xl border border-divider bg-surface/40 p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            Nutrition framework
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            {bundle.dietTitle}
          </h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Style", value: bundle.nutrition.style },
              { label: "Protein target", value: bundle.nutrition.proteinTarget },
              { label: "Calorie bias", value: bundle.nutrition.calorieBias }
            ].map((stat) => (
              <div
                key={stat.label}
                className="group/stat relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20 p-4 transition-[border-color,background-color,box-shadow] duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/[0.04] hover:shadow-[0_0_28px_rgba(34,211,238,0.10)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60 transition-opacity duration-300 group-hover/stat:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(34,211,238,0.55) 30%, rgba(165,243,252,0.9) 50%, rgba(34,211,238,0.55) 70%, transparent)"
                  }}
                />
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold leading-snug text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            {bundle.nutrition.notes}
          </p>
        </div>
      </RevealSection>

      <RevealSection delay={120}>
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
              <li
                key={`${meal.meal}-${i}`}
                className="tj-list-row px-4 py-4 transition-colors hover:bg-white/[0.02]"
              >
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
      </RevealSection>

      <RevealSection delay={160}>
        <div className="mt-14 flex flex-col items-stretch gap-4 rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.06),rgba(34,211,238,0.01))] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
              Ready to start
            </p>
            <p className="mt-1 text-base font-semibold text-white sm:text-lg">
              Download the dossier and run it today.
            </p>
          </div>
          <DownloadButton href={downloadHref} ariaLabel="Download bundle PDF" full />
        </div>
      </RevealSection>
    </section>
  );
}
