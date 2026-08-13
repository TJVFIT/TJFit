import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

import {
  AtAGlance,
  DetailHero,
  DetailSectionNav,
  FaqList,
  GroceryList,
  InsideStatTiles,
  PhaseStrip,
  PrepPanel,
  ProgressionTimeline,
  RecipeGrid,
  RevealSection,
  ShareButton,
  StickyBuyBar,
  StickyOfferBar,
  WeeklyTemplate
} from "./detail-effects";
import { BundleCta } from "@/components/bundles/bundle-cta";
import { BundleFigurePair } from "@/components/bundles/bundle-figures";
import { BUNDLES, getBundle, listBundleSlugs } from "@/lib/bundles";
import { bundleInsideStats } from "@/lib/bundle-insights";
import { bundleBreadcrumbJsonLd, bundleFaqJsonLd, bundleProductJsonLd } from "@/lib/bundle-jsonld";
import { getBundleExtrasCopy } from "@/lib/bundle-extras-copy";
import { getBundlesCopy } from "@/lib/bundles-copy";
import { localizeBundle } from "@/lib/bundle-localization";
import { supportedLocales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { hasPurchasedProgram } from "@/lib/purchases";
import { isAdminEmail } from "@/lib/auth-utils";

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


export default async function BundleDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const bundle = getBundle(params.slug);
  if (!bundle) notFound();

  const copy = getBundlesCopy(locale);
  const d = copy.detail;
  const xc = getBundleExtrasCopy(locale);
  const card = localizeBundle(bundle, locale);
  const programHref = `/${locale}/bundles/${bundle.slug}/program`;
  const isFree = bundle.save.toLowerCase() === "free";

  const stats = bundleInsideStats(bundle.slug);
  const statTiles = [
    { label: xc.statLabels.weeks, value: stats.weeks },
    { label: xc.statLabels.trainingDays, value: stats.trainingDays },
    { label: xc.statLabels.phases, value: stats.phases },
    { label: xc.statLabels.recipes, value: stats.recipes },
    { label: xc.statLabels.groceryItems, value: stats.groceryItems }
  ].filter((s) => s.value > 0);
  const hasAudience = Boolean(bundle.whoFor?.length || bundle.whoNotFor?.length);
  const difficulty = bundle.difficulty ?? 0;
  const faqJsonLd = bundleFaqJsonLd(bundle);

  // Ownership gate: "Start Program" only shows to users who actually own the
  // bundle (admins always). Everyone else sees the Buy/Get-free CTA only — the
  // program content is never reachable from the sales page without entitlement.
  let owns = false;
  {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      // Session client resolves the user; the entitlement read uses the
      // service client because program_orders is revoked from `authenticated`
      // (migration 20260723221731). user.id is session-verified. Without the
      // service client we cannot prove entitlement, so `owns` stays false.
      const db = getSupabaseServerClient();
      owns =
        (!!user.email && isAdminEmail(user.email)) ||
        (!!db && (await hasPurchasedProgram(db, user.id, bundle.slug)));
    }
  }

  // Related bundles — same goal first, then fill with others, capped at 3.
  const related = [
    ...BUNDLES.filter((x) => x.slug !== bundle.slug && x.goal === bundle.goal),
    ...BUNDLES.filter((x) => x.slug !== bundle.slug && x.goal !== bundle.goal)
  ].slice(0, 3);

  const navItems = [
    { id: "inside", label: xc.headings.whatsInside },
    { id: "audience", label: xc.headings.whoFor },
    { id: "training", label: d.trainingFrameworkEyebrow },
    { id: "weekly-template", label: d.weeklyTemplateEyebrow },
    { id: "progression", label: d.progressionEyebrow },
    { id: "nutrition", label: d.nutritionEyebrow },
    { id: "recipes", label: d.recipesEyebrow },
    { id: "grocery", label: d.groceryEyebrow },
    { id: "faq", label: xc.headings.faq },
    ...(related.length > 0 ? [{ id: "more", label: d.moreBundlesTitle }] : [])
  ].filter((item) => {
    if (item.id === "inside") return statTiles.length > 0;
    if (item.id === "audience") return hasAudience;
    if (item.id === "weekly-template") return Boolean(bundle.weeklyTemplate?.length);
    if (item.id === "progression") return Boolean(bundle.progression?.length);
    if (item.id === "recipes") return Boolean(bundle.recipes?.length);
    if (item.id === "grocery") return Boolean(bundle.groceryList?.length);
    if (item.id === "faq") return Boolean(bundle.faq?.length);
    return true;
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleProductJsonLd(bundle, locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleBreadcrumbJsonLd(bundle, locale)) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <Link
        href={`/${locale}/bundles`}
        className="group/back inline-flex min-h-[44px] items-center gap-1.5 py-2 text-xs font-semibold text-purple-300 transition-colors hover:text-purple-200"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform rtl:rotate-180 motion-safe:group-hover/back:-translate-x-1 rtl:motion-safe:group-hover/back:translate-x-1"
          aria-hidden
        />
        {d.backToAll}
      </Link>

      <div className="relative">
        <DetailHero image={bundle.heroImage} />
        <BundleFigurePair
          slug={bundle.slug}
          className="pointer-events-none absolute bottom-3 end-4 z-[2] hidden items-end gap-3 motion-safe:animate-[tj-fade-up_700ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0 sm:flex"
          size={72}
        />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div
            className="flex flex-wrap items-center gap-2 motion-safe:animate-[tj-fade-up_520ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "80ms" }}
          >
            <span
              className="rounded-full border border-purple-300/30 bg-purple-300/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-100"
              aria-label={copy.goalAria(card.goalLabel)}
            >
              {card.goalLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isFree
                  ? "border border-white/15 bg-white/[0.04] text-white/85"
                  : "border border-purple-300/30 bg-purple-300/[0.08] text-purple-50"
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
            id="cta"
            className="mt-8 flex scroll-mt-28 flex-wrap items-center gap-3 motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
            style={{ animationDelay: "480ms" }}
          >
            {owns ? (
              <Link
                href={programHref}
                className="tj-cta-sheen relative inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] px-5 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(168,85,247,0.22)] hover:brightness-110 hover:shadow-[0_0_36px_rgba(168,85,247,0.36)] motion-safe:active:scale-[0.97] sm:flex-none"
              >
                Start Program
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            ) : (
              <BundleCta
                slug={bundle.slug}
                locale={locale}
                isFree={isFree}
                priceLabel={bundle.save}
                labels={{ download: copy.download, buy: copy.buy, getFree: copy.getFree, processing: copy.processing }}
                className="flex-1 sm:flex-none"
              />
            )}
            <Link
              href={`/${locale}/tjai`}
              className="group/tjai tj-cta-sheen inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full border border-purple-300/25 px-4 py-2.5 text-sm font-semibold text-purple-200 transition-[border-color,color,box-shadow] hover:border-purple-300/55 hover:text-purple-100 hover:shadow-[0_0_24px_rgba(168,85,247,0.18)] sm:flex-none"
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

          <p className="mt-5 flex flex-wrap items-center gap-x-2 text-[11px] font-medium tracking-wide text-muted">
            <Check className="h-3.5 w-3.5 shrink-0 text-purple-300" aria-hidden />
            {bundle.isFree ? copy.footnoteFree : copy.footnotePaid}
          </p>
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

      {statTiles.length > 0 ? (
        <RevealSection>
          <div id="inside" className="mt-12 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {xc.headings.whatsInside}
            </p>
            <InsideStatTiles stats={statTiles} />
          </div>
        </RevealSection>
      ) : null}

      {hasAudience ? (
        <RevealSection delay={60}>
          <div
            id="audience"
            className="mt-14 scroll-mt-24 rounded-2xl border border-purple-400/20 bg-[linear-gradient(180deg,rgba(168,85,247,0.05),rgba(168,85,247,0.01))] p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {bundle.difficultyLabel ? (
                  <span className="rounded-full border border-purple-300/20 bg-purple-300/[0.05] px-3 py-1.5 text-xs font-semibold text-purple-100">
                    {xc.difficultyLabels[bundle.difficultyLabel]}
                  </span>
                ) : null}
                {bundle.setting ? (
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/85">
                    {xc.settingLabels[bundle.setting]}
                  </span>
                ) : null}
              </div>
              {difficulty > 0 ? (
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-purple-200/80">
                    {xc.filters.difficulty}
                  </span>
                  <span className="sr-only">{difficulty}/5</span>
                  <span className="flex items-center gap-1" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`h-1.5 w-5 rounded-full ${
                          n <= difficulty
                            ? "bg-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.45)]"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="mt-6 grid gap-6 border-t border-white/[0.06] pt-6 md:grid-cols-2">
              {bundle.whoFor?.length ? (
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-purple-200/80">
                    {xc.headings.whoFor}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {bundle.whoFor.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-bright/90"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-300" aria-hidden />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {bundle.whoNotFor?.length ? (
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-faint">
                    {xc.headings.whoNotFor}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {bundle.whoNotFor.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                      >
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35" aria-hidden />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </RevealSection>
      ) : null}

      <div id="training" className="mt-14 scroll-mt-24">
        <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
          {d.trainingFrameworkEyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          {d.trainingFrameworkTitle}
        </h2>
        <PhaseStrip phases={card.phases} />
      </div>

      {bundle.weeklyTemplate?.length ? (
        <RevealSection>
          <div id="weekly-template" className="mt-14 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.weeklyTemplateEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {d.weeklyTemplateTitle}
            </h2>
            <p className="mt-3 text-sm text-muted">{d.weeklyTemplateNote}</p>
            <WeeklyTemplate days={bundle.weeklyTemplate} weekLabel={copy.weeksValue(1).replace(/\s.*$/, "")} />
          </div>
        </RevealSection>
      ) : null}

      {bundle.progression?.length ? (
        <RevealSection delay={60}>
          <div id="progression" className="mt-14 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.progressionEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {d.progressionTitle}
            </h2>
            <ProgressionTimeline
              phases={bundle.progression}
              labels={{ loading: d.progressionLoading, intensity: d.progressionIntensity }}
            />
          </div>
        </RevealSection>
      ) : null}

      {bundle.warmup?.length || bundle.cooldown?.length || bundle.equipment?.length ? (
        <RevealSection delay={100}>
          <div className="mt-14">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.equipmentEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {d.equipmentTitle}
            </h2>
            <PrepPanel
              warmup={bundle.warmup ?? []}
              cooldown={bundle.cooldown ?? []}
              equipment={bundle.equipment ?? []}
              labels={{ warmup: d.warmupTitle, cooldown: d.cooldownTitle, equipment: d.equipmentEyebrow }}
            />
          </div>
        </RevealSection>
      ) : null}

      <RevealSection delay={80}>
        <div id="nutrition" className="mt-14 scroll-mt-24 rounded-2xl border border-divider bg-surface/40 p-5 sm:p-7">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
            {d.nutritionEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            {card.dietTitle}
          </h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: d.nutritionStyle, value: card.nutrition.style },
              { label: d.nutritionProtein, value: card.nutrition.proteinTarget },
              { label: d.nutritionCalorie, value: card.nutrition.calorieBias }
            ].map((stat) => (
              <div
                key={stat.label}
                className="group/stat relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20 p-4 transition-[border-color,background-color,box-shadow] duration-300 hover:border-purple-300/35 hover:bg-purple-300/[0.04] hover:shadow-[0_0_28px_rgba(168,85,247,0.10)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60 transition-opacity duration-300 group-hover/stat:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(168,85,247,0.55) 30%, rgba(237,233,254,0.9) 50%, rgba(168,85,247,0.55) 70%, transparent)"
                  }}
                />
                <dt className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-purple-200/80">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold leading-snug text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            {card.nutrition.notes}
          </p>
        </div>
      </RevealSection>

      {bundle.recipes?.length ? (
        <RevealSection delay={100}>
          <div id="recipes" className="mt-14 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.recipesEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {d.recipesTitle}
            </h2>
            <p className="mt-3 text-sm text-muted">{d.recipesNote}</p>
            <RecipeGrid
              recipes={bundle.recipes}
              copy={{
                ingredients: d.recipeIngredients,
                steps: d.recipeSteps,
                time: d.recipeTime,
                kcal: d.recipeKcal,
                protein: d.recipeProtein,
                carbs: d.recipeCarbs,
                fat: d.recipeFat,
                mealTypeLabels: d.mealTypeLabels
              }}
            />
          </div>
        </RevealSection>
      ) : null}

      {bundle.groceryList?.length ? (
        <RevealSection delay={100}>
          <div id="grocery" className="mt-14 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.groceryEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {d.groceryTitle}
            </h2>
            <p className="mt-3 text-sm text-muted">{d.groceryNote}</p>
            <GroceryList groups={bundle.groceryList} />
          </div>
        </RevealSection>
      ) : null}

      {bundle.faq?.length ? (
        <RevealSection delay={120}>
          <div id="faq" className="mt-14 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {xc.headings.faq}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {xc.faqTitle}
            </h2>
            <FaqList items={bundle.faq} />
          </div>
        </RevealSection>
      ) : null}

      <RevealSection delay={160}>
        <div className="mt-14 flex flex-col items-stretch gap-4 rounded-2xl border border-purple-400/20 bg-[linear-gradient(180deg,rgba(168,85,247,0.06),rgba(168,85,247,0.01))] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.readyEyebrow}
            </p>
            <p className="mt-1 text-base font-semibold text-white sm:text-lg">
              {d.readyTitle}
            </p>
          </div>
          <Link
            href={programHref}
            className="tj-cta-sheen inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] px-5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(168,85,247,0.22)] hover:brightness-110 sm:w-auto"
          >
            Start Program
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </RevealSection>

      {related.length > 0 ? (
        <RevealSection delay={200}>
          <div id="more" className="mt-14 scroll-mt-24">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-200/80">
              {d.moreBundlesTitle}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {related.map((rb) => {
                const rc = localizeBundle(rb, locale);
                return (
                  <Link
                    key={rb.slug}
                    href={`/${locale}/bundles/${rb.slug}`}
                    className="group/rel flex flex-col rounded-xl border border-white/[0.07] bg-surface/40 p-4 transition-[border-color,box-shadow,transform] duration-200 hover:border-purple-300/35 hover:shadow-[0_0_24px_rgba(168,85,247,0.12)] motion-safe:hover:-translate-y-0.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-200/70">
                      {rc.goalLabel}
                    </span>
                    <span className="mt-1.5 text-sm font-semibold leading-snug text-white transition-colors duration-200 group-hover/rel:text-purple-50">
                      {rc.name}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-300">
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

      <DetailSectionNav items={navItems} />

      {owns ? (
        <StickyBuyBar
          name={card.name}
          href={programHref}
          label="Start Program"
          ariaLabel={`Start ${card.name}`}
        />
      ) : (
        <StickyOfferBar
          name={card.name}
          priceLabel={bundle.save}
          targetId="cta"
          label={xc.viewOptions}
          ariaLabel={`${xc.viewOptions} — ${card.name}`}
        />
      )}
    </section>
  );
}
