import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { AtAGlance, DetailHero, DownloadButton, PhaseStrip, RevealSection, ShareButton, StickyBuyBar } from "./detail-effects";
import { BUNDLES, getBundle, listBundleSlugs } from "@/lib/bundles";
import { bundleProductJsonLd } from "@/lib/bundle-jsonld";
import { getBundlesCopy } from "@/lib/bundles-copy";
import { localizeBundle } from "@/lib/bundle-localization";
import { supportedLocales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return listBundleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const bundle = getBundle(params.slug);
  if (!bundle) return { title: getBundlesCopy(params.locale).detail.metaFallbackTitle };
  const site = getSiteUrl();
  const url = `${site}/${params.locale}/bundles/${bundle.slug}`;
  const card = localizeBundle(bundle, params.locale);
  const languages: Record<string, string> = {};
  for (const loc of supportedLocales) {
    languages[loc] = `${site}/${loc}/bundles/${bundle.slug}`;
  }
  languages["x-default"] = `${site}/en/bundles/${bundle.slug}`;
  return {
    title: `${card.name} · TJFit`,
    description: card.hook,
    alternates: { canonical: url, languages },
    openGraph: {
      title: `${card.name} · TJFit`,
      description: card.hook,
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

  const copy = getBundlesCopy(locale);
  const d = copy.detail;
  const card = localizeBundle(bundle, locale);
  const downloadHref = `/api/bundles/download/${bundle.slug}`;
  const isFree = bundle.save.toLowerCase() === "free";

  // Related bundles — same goal first, then fill with others, capped at 3.
  const related = [
    ...BUNDLES.filter((x) => x.slug !== bundle.slug && x.goal === bundle.goal),
    ...BUNDLES.filter((x) => x.slug !== bundle.slug && x.goal !== bundle.goal)
  ].slice(0, 3);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleProductJsonLd(bundle, locale)) }}
      />
      <Link
        href={`/${locale}/bundles`}
        className="group/back inline-flex min-h-[44px] items-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform rtl:rotate-180 motion-safe:group-hover/back:-translate-x-1 rtl:motion-safe:group-hover/back:translate-x-1"
          aria-hidden
        />
        {d.backToAll}
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
              aria-label={copy.goalAria(card.goalLabel)}
            >
              {card.goalLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isFree
                  ? "border border-white/15 bg-white/[0.04] text-white/85"
                  : "border border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-50"
              }`}
              aria-label={copy.priceAria(bundle.save)}
            >
              {bundle.save}
            </span>
          </div>

          <h1
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "180ms" }}
          >
            <span className="tj-title-shimmer">{card.name}</span>
          </h1>
          <p
            className="mt-4 text-base leading-relaxed text-muted sm:text-lg motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "280ms" }}
          >
            {card.hook}
          </p>
          <p
            className="mt-6 text-sm leading-relaxed text-bright/85 sm:text-base motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "380ms" }}
          >
            {card.description}
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3 motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "480ms" }}
          >
            <DownloadButton
              href={downloadHref}
              label={copy.download}
              ariaLabel={copy.downloadAria(card.name)}
              className="flex-1 sm:flex-none"
            />
            <Link
              href={`/${locale}/tjai`}
              className="group/tjai tj-cta-sheen inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full border border-cyan-300/25 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-[border-color,color,box-shadow] hover:border-cyan-300/55 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:flex-none"
            >
              {d.askTjai}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform rtl:rotate-180 motion-safe:group-hover/tjai:translate-x-1 rtl:motion-safe:group-hover/tjai:-translate-x-1"
                aria-hidden
              />
            </Link>
            <ShareButton
              title={card.name}
              ariaLabel={d.shareAria(card.name)}
              labels={{ idle: d.shareIdle, shared: d.shareShared, copied: d.shareCopied }}
            />
          </div>
        </div>

        <AtAGlance
          title={d.atAGlance}
          rows={[
            { label: copy.duration, value: copy.weeksValue(bundle.weeks) },
            { label: copy.sessions, value: d.sessionsValueLong(bundle.sessionsPerWeek) },
            { label: d.rowTraining, value: card.programTitle },
            { label: d.rowDiet, value: card.dietTitle }
          ]}
        />
      </div>

      <div className="mt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          {d.trainingFrameworkEyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          {d.trainingFrameworkTitle}
        </h2>
        <PhaseStrip phases={bundle.phases} />
      </div>

      <RevealSection>
        <div className="mt-14 rounded-2xl border border-divider bg-surface/40 p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            {d.sampleSessionEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            {bundle.sampleTrainingDay.name}
          </h2>
          <p className="mt-3 text-sm text-muted">{d.sampleSessionNote}</p>
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
            {d.nutritionEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            {card.dietTitle}
          </h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: d.nutritionStyle, value: bundle.nutrition.style },
              { label: d.nutritionProtein, value: bundle.nutrition.proteinTarget },
              { label: d.nutritionCalorie, value: bundle.nutrition.calorieBias }
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
            {d.sampleDayEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            {d.sampleDayTitle}
          </h2>
          <p className="mt-3 text-sm text-muted">{d.sampleDayNote}</p>
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
              {d.readyEyebrow}
            </p>
            <p className="mt-1 text-base font-semibold text-white sm:text-lg">
              {d.readyTitle}
            </p>
          </div>
          <DownloadButton
            href={downloadHref}
            label={copy.download}
            ariaLabel={d.downloadDossierAria}
            full
          />
        </div>
      </RevealSection>

      {related.length > 0 ? (
        <RevealSection delay={200}>
          <div className="mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
              {d.moreBundlesTitle}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {related.map((rb) => {
                const rc = localizeBundle(rb, locale);
                return (
                  <Link
                    key={rb.slug}
                    href={`/${locale}/bundles/${rb.slug}`}
                    className="group/rel flex flex-col rounded-xl border border-white/[0.07] bg-surface/40 p-4 transition-[border-color,box-shadow,transform] duration-200 hover:border-cyan-300/35 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)] motion-safe:hover:-translate-y-0.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
                      {rc.goalLabel}
                    </span>
                    <span className="mt-1.5 text-sm font-semibold leading-snug text-white transition-colors duration-200 group-hover/rel:text-cyan-50">
                      {rc.name}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">
                      {copy.details}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform rtl:rotate-180 motion-safe:group-hover/rel:translate-x-0.5 rtl:motion-safe:group-hover/rel:-translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </RevealSection>
      ) : null}

      <StickyBuyBar
        name={card.name}
        href={downloadHref}
        label={copy.download}
        ariaLabel={copy.downloadAria(card.name)}
      />
    </section>
  );
}
