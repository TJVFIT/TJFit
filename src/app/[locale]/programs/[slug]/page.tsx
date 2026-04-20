import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { FreeProductBodyBlocks, FreeProductUpgradeFooter } from "@/components/free-product-detail-view";
import { ProgramEliteSystemCard } from "@/components/program-elite-system-card";
import { ProgramBlueprintNavigator } from "@/components/program-blueprint-navigator";
import { ProgramDetailHero } from "@/components/program-detail-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Logo } from "@/components/ui/Logo";
import { ProgramViewTracker } from "@/components/marketing/program-view-tracker";
import { ProgramPaymentSuccessNotice } from "@/components/program-payment-success-notice";
import { ProgramContentLock } from "@/components/program-content-lock";
import { coaches, products, programs } from "@/lib/content";
import { localizeCustomProgramRow, type CustomProgramRow } from "@/lib/custom-programs";
import { getFreeProductPageModel, isFreeProductSlug } from "@/lib/free-product-pages";
import { programBlueprints } from "@/lib/program-blueprints";
import { Locale, locales } from "@/lib/i18n";
import {
  formatCoachCommissionLine,
  formatProgramPrice,
  getProgramBasePriceTry,
  getProgramUiCopy,
  localizeAssetType,
  localizeProgram
} from "@/lib/program-localization";
import { getOptionalServerUser, resolveStaticProgramAccess, userHasPaidProgram } from "@/lib/program-access";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getProgramManagementCopy } from "@/lib/program-management-copy";
import { getProgramEliteLabels, getProgramEliteMeta } from "@/lib/program-elite-meta";

function getProgramTheme(category: string) {
  const base = category.toLowerCase();
  if (base.includes("nutrition")) return "from-cyan-400/30 via-teal-400/20 to-sky-400/30";
  if (base.includes("fat")) return "from-cyan-400/30 via-sky-400/20 to-violet-400/30";
  if (base.includes("muscle")) return "from-violet-400/30 via-indigo-400/20 to-cyan-400/30";
  return "from-cyan-400/30 via-sky-400/20 to-indigo-400/30";
}

function trainingLocationLabel(slug: string, copy: ReturnType<typeof getProgramUiCopy>): string {
  const s = slug.toLowerCase();
  if (s.startsWith("home")) return copy.trainingLocationHome;
  if (s.startsWith("gym")) return copy.trainingLocationGym;
  return copy.trainingLocationAny;
}

export default async function ProgramDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const slug = params.slug ?? "";
  const staticProgram = programs.find((item) => item.slug === slug);
  let customProgram: ReturnType<typeof localizeCustomProgramRow> | null = null;
  let customProgramPdfUrl: string | null = null;
  let customProgramTranslatedText: string | null = null;

  if (!staticProgram) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("custom_programs")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (data) {
        const row = data as CustomProgramRow;
        customProgram = localizeCustomProgramRow(row, locale);
        customProgramTranslatedText = row.localized_pdf_text?.[locale] ?? row.source_pdf_text ?? "";
        const { data: signed } = await supabase.storage.from("program-assets").createSignedUrl(row.pdf_path, 60 * 20);
        customProgramPdfUrl = signed?.signedUrl ?? null;
      }
    }
  }

  if (!staticProgram && !customProgram) {
    notFound();
  }

  const program = staticProgram;
  const localeNames: Record<Locale, string> = {
    en: "English",
    tr: "Turkce",
    ar: "العربية",
    es: "Espanol",
    fr: "Francais"
  };
  const localizedProgram = program ? localizeProgram(program, locale) : null;
  const copy = getProgramUiCopy(locale);
  const programManagementCopy = getProgramManagementCopy(locale);

  const authCtx = await getOptionalServerUser();
  const userId = authCtx?.userId ?? null;
  const isAdmin = authCtx?.role === "admin";
  if (program && !program.is_free && !userId) {
    redirect(`/${locale}/signup?redirect=${encodeURIComponent(`/${locale}/programs/${slug}`)}`);
  }
  let hasPaidOrder = false;
  if (authCtx && program && !program.is_free) {
    hasPaidOrder = await userHasPaidProgram(authCtx.supabase, userId!, slug);
  }
  const access = resolveStaticProgramAccess(program ?? null, userId, hasPaidOrder, isAdmin);

  const baseTry = program ? getProgramBasePriceTry(program) : customProgram?.price_try ?? 400;
  const localizedPrice = program?.is_free ? copy.freePriceLabel : formatProgramPrice(baseTry, locale);

  const programTheme = getProgramTheme((localizedProgram ?? customProgram!).category);
  const tier =
    slug.includes("advanced") || slug.includes("hardcore")
      ? "ELITE"
      : slug.includes("pro") || slug.includes("shred")
        ? "POPULAR"
        : slug.includes("starter")
          ? "NEW"
          : "SIGNATURE";
  const coach = program ? coaches.find((entry) => entry.slug === program.coachSlug) : null;
  const recommendedProducts = products.filter((product) => program?.requiredEquipment.includes(product.slug));
  const blueprint = program ? programBlueprints[program.slug] : undefined;
  const programTitle = localizedProgram?.title ?? customProgram?.title ?? "";
  const programCategory = localizedProgram?.category ?? customProgram?.category ?? "";
  const programDescription = localizedProgram?.description ?? customProgram?.description ?? "";
  const programDuration = localizedProgram?.duration ?? customProgram?.duration ?? "";
  const programDifficulty = localizedProgram?.difficulty ?? customProgram?.difficulty ?? "Beginner to Advanced";
  const programAssets =
    program?.assets ??
    [
      { type: "pdf-guide" as const, label: programManagementCopy.uploadedPdfAsset },
      { type: "pdf-guide" as const, label: programManagementCopy.translatedPackAsset }
    ];

  const paidContentLocked = Boolean(program && !program.is_free && !access.showFullPaidContent);
  const freeContentUnlocked = Boolean(program?.is_free);
  const freeModel = program && isFreeProductSlug(slug) ? getFreeProductPageModel(slug, locale) : null;
  const upgradeTargetProgram = freeModel ? programs.find((p) => p.slug === freeModel.upgrade.checkoutSlug) : undefined;
  const upgradeProgramTitle = upgradeTargetProgram ? localizeProgram(upgradeTargetProgram, locale).title : copy.upgradeSectionTitle;

  const dayLabels = {
    warmup: copy.workoutWarmupLabel,
    main: copy.workoutMainLabel,
    cooldown: copy.workoutCooldownLabel
  };
  const freeDownloadLabel: Record<Locale, string> = {
    en: "Download Free PDF",
    tr: "Ucretsiz PDF Indir",
    ar: "تحميل PDF مجاني",
    es: "Descargar PDF Gratis",
    fr: "Telecharger PDF Gratuit"
  };
  const freeDownloadHref = `/api/free/download?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`;

  const checkoutHref = `/${locale}/checkout?program=${slug}`;
  const premiumBannerLabel = program?.is_free ? copy.programKindFree : copy.programKindPremium;
  const signupUnlockHref = `/${locale}/signup?redirect=${encodeURIComponent(`/${locale}/programs/${slug}`)}`;
  const loginUnlockHref = `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/programs/${slug}`)}`;
  const isDiet = programCategory.toLowerCase().includes("nutrition");

  const heroGoal = blueprint?.goal ?? programCategory;
  const heroLocation =
    program && !program.category.toLowerCase().includes("nutrition")
      ? trainingLocationLabel(slug, copy)
      : isDiet
        ? copy.dietPlanBadge
        : programCategory;
  const heroLevel = blueprint?.level ?? programDifficulty;
  const heroMeta = blueprint
    ? `${programDuration} · ${blueprint.equipment}`
    : program
      ? `${programDuration} · ${trainingLocationLabel(slug, copy)}`
      : programDuration;

  return (
    <div className="relative pb-16 pt-0 sm:pb-20 lg:pb-24">
      <ProgramViewTracker slug={slug} />
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <ProgramPaymentSuccessNotice
            message={copy.paymentSuccessBanner}
            dismissLabel={copy.dismissNotice}
          />
        </Suspense>
      </div>
      <ProgramDetailHero
        locale={locale}
        programTitle={programTitle}
        isDiet={isDiet}
        programCategory={programCategory}
        breadcrumbHome={copy.breadcrumbHome}
        breadcrumbPrograms={copy.breadcrumbPrograms}
        breadcrumbDiets={copy.breadcrumbDiets}
        goalLabel={heroGoal}
        locationOrTypeLabel={heroLocation}
        levelLabel={heroLevel}
        metaLine={heroMeta}
      />

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 px-4 sm:px-6 lg:px-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="mx-auto w-full max-w-[800px] rounded-[14px] border border-[var(--color-border)] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.75)] sm:p-8 xl:mx-0">
          <div className="flex flex-wrap items-center gap-2">
            {program?.is_free ? (
              <span className="rounded-full border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                {copy.freeBadge}
              </span>
            ) : null}
          </div>
          <p className="mt-6 max-w-[680px] text-base leading-[1.7] text-[var(--color-text-secondary)]">{programDescription}</p>
          <p className="mt-3 text-sm italic text-[var(--color-text-muted)]">
            {isDiet ? copy.dietPageTrust : copy.programPageTrust}
          </p>

          {program ? (
            <div className="mt-10">
              <ProgramEliteSystemCard
                meta={getProgramEliteMeta(slug, programCategory, isDiet)}
                labels={getProgramEliteLabels(locale, isDiet)}
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.languageOptionsLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {locales.map((targetLocale) => (
                <Link
                  key={targetLocale}
                  href={`/${targetLocale}/programs/${slug}`}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    targetLocale === locale
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/15 text-zinc-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {localeNames[targetLocale]}
                </Link>
              ))}
            </div>
          </div>

          <div className={`mt-8 rounded-[28px] border border-white/10 bg-gradient-to-br p-7 ${programTheme}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-100/85">{premiumBannerLabel}</p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-semibold text-white">
                  {tier}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/25 bg-black/20 px-2.5 py-1.5">
                  <Logo
                    variant="icon"
                    size="navbar"
                    href={`/${locale}`}
                    suppressMinTouchTarget
                    className="shrink-0"
                    alt=""
                  />
                </span>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-white">{programTitle}</h2>
            <p className="mt-3 text-sm text-zinc-100/90">{programDuration}</p>
            <p className="mt-3 text-sm font-medium text-white/95">{localizedPrice}</p>
          </div>

          <div className="mt-10">
            <p className="text-lg font-semibold text-white">{copy.whatYouGetTitle}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-300">
              {programAssets.map((asset, idx) => (
                <li key={`${asset.type}-${idx}`} className="flex gap-2.5 leading-relaxed">
                  <span className="mt-0.5 shrink-0 text-cyan-400/90" aria-hidden>
                    -
                  </span>
                  <span>
                    <span className="font-medium text-white">{localizeAssetType(asset.type, locale)}</span>
                    <span className="text-zinc-500"> — </span>
                    {asset.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <p className="text-lg font-semibold text-white">{copy.assetsLabel}</p>
            <p className="mt-1 text-xs text-zinc-500">{paidContentLocked ? copy.previewSectionNotice : null}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {programAssets.length > 0 && (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    {localizeAssetType(programAssets[0].type, locale)}
                  </p>
                  <p className="mt-3 text-white">
                    {copy.previewLabel} 1
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {program ? copy.brandedModule : "Uploaded and auto-translated module"}
                  </p>
                </div>
              )}
              {paidContentLocked && programAssets.length > 1 ? (
                <ProgramContentLock
                  locked
                  title={copy.paidPreviewTitle}
                  subtitle={copy.paidPreviewSubtitle}
                  ctaHref={checkoutHref}
                  ctaLabel={copy.getFullAccess}
                  className="md:col-span-1"
                >
                  <div className="grid gap-4">
                    {programAssets.slice(1).map((asset, index) => (
                      <div key={`${asset.type}-${index + 1}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                          {localizeAssetType(asset.type, locale)}
                        </p>
                        <p className="mt-3 text-white">
                          {copy.previewLabel} {index + 2}
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">{copy.brandedModule}</p>
                      </div>
                    ))}
                  </div>
                </ProgramContentLock>
              ) : (
                programAssets.slice(1).map((asset, index) => (
                  <div key={`${asset.type}-${index + 1}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      {localizeAssetType(asset.type, locale)}
                    </p>
                    <p className="mt-3 text-white">
                      {copy.previewLabel} {index + 2}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {program ? copy.brandedModule : "Uploaded and auto-translated module"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {!program && (
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.autoTranslatedPdf}</p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {(customProgramTranslatedText ?? "").slice(0, 1200)}
                {(customProgramTranslatedText ?? "").length > 1200 ? "..." : ""}
              </p>
              {customProgramPdfUrl && (
                <div className="mt-4">
                  <a
                    href={customProgramPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
                  >
                    {copy.downloadUploadedPdf}
                  </a>
                </div>
              )}
            </div>
          )}

          {blueprint ? (
            <div className="mt-10 space-y-6">
              <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#52525B]">{copy.blueprintTitle}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[#1E2028] bg-[#18191E] p-3 text-sm text-[#A1A1AA]">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#52525B]">{copy.blueprintGoal}</p>
                    <p className="mt-2 text-white">{blueprint.goal}</p>
                  </div>
                  <div className="rounded-xl border border-[#1E2028] bg-[#18191E] p-3 text-sm text-[#A1A1AA]">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#52525B]">{copy.blueprintLevel}</p>
                    <p className="mt-2 text-white">{blueprint.level}</p>
                  </div>
                  <div className="rounded-xl border border-[#1E2028] bg-[#18191E] p-3 text-sm text-[#A1A1AA]">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#52525B]">{copy.blueprintEquipment}</p>
                    <p className="mt-2 text-white">{blueprint.equipment}</p>
                  </div>
                </div>
              </div>
              <ProgramBlueprintNavigator
                blueprint={blueprint}
                copy={{
                  blueprintTrainingDays: copy.blueprintTrainingDays,
                  blueprintConditioning: copy.blueprintConditioning
                }}
                locale={locale}
                isDiet={isDiet}
                paidLocked={paidContentLocked}
                checkoutHref={checkoutHref}
                lockTitle={copy.paidPreviewTitle}
                lockSubtitle={copy.paidPreviewSubtitle}
                lockCtaLabel={copy.getFullAccess}
                safetyTitle={copy.blueprintSafety}
              />
            </div>
          ) : null}

          {program && freeModel ? (
            <div className="mt-10 space-y-2">
              {freeContentUnlocked ? (
                <FreeProductBodyBlocks model={freeModel} dayLabels={dayLabels} />
              ) : !access.showFullFreeContent ? (
                <ProgramContentLock
                  locked
                  title={copy.freeContentTeaserTitle}
                  subtitle={copy.freeContentTeaserBody}
                  ctaHref={signupUnlockHref}
                  ctaLabel={copy.signUpToUnlockFree}
                  secondaryHref={loginUnlockHref}
                  secondaryLabel={copy.logInToUnlockFree}
                >
                  <div className="p-4 sm:p-5">
                    <FreeProductBodyBlocks model={freeModel} dayLabels={dayLabels} />
                  </div>
                </ProgramContentLock>
              ) : (
                <FreeProductBodyBlocks model={freeModel} dayLabels={dayLabels} />
              )}
              <FreeProductUpgradeFooter
                model={freeModel}
                locale={locale}
                upgradeProgramTitle={upgradeProgramTitle}
                freeDownloadHref={freeDownloadHref}
                freeDownloadLabel={freeDownloadLabel[locale]}
              />
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-6">
            <p className="text-sm text-zinc-400">{copy.coachLabel}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{coach?.name ?? copy.teamFallback}</p>
            <p className="mt-2 text-sm text-zinc-400">{coach?.specialty ?? copy.teamFallback}</p>

            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between gap-2">
                <span>{copy.difficultyLabel}</span>
                <span className="text-right text-white">{programDifficulty}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>{copy.durationLabel}</span>
                <span className="text-right text-white">{programDuration}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>{copy.priceLabel}</span>
                <span className="text-right text-white">{localizedPrice}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col flex-wrap gap-3 sm:flex-row">
              {program?.is_free ? (
                <>
                  <a
                    href={freeDownloadHref}
                    className="lux-btn-primary inline-flex min-h-[44px] justify-center rounded-full px-5 py-2.5 text-center text-sm font-bold text-[#09090B]"
                  >
                    {freeDownloadLabel[locale]}
                  </a>
                  <p className="text-sm font-medium text-emerald-300/95">{copy.youHaveFullAccess}</p>
                </>
              ) : program && !access.showFullPaidContent ? (
                <Link href={checkoutHref} className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white">
                  {copy.getFullAccess}
                </Link>
              ) : program && access.showFullPaidContent ? (
                <p className="text-sm font-medium text-emerald-300/95">{copy.youHaveFullAccess}</p>
              ) : (
                <Link href={checkoutHref} className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white">
                  {copy.getFullAccess}
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-6">
            <p className="text-lg font-semibold text-white">{copy.recommendedEquipment}</p>
            <div className="mt-6 space-y-4">
              {recommendedProducts.length === 0 && <p className="text-sm text-zinc-400">{copy.noEquipment}</p>}
              {recommendedProducts.map((product) => (
                <div key={product.slug} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{localizedPrice}</p>
                      <p className="mt-1 text-xs text-zinc-500">{formatCoachCommissionLine(locale, product.coachCommissionRate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {paidContentLocked && program && !program.is_free ? (
        <ScrollReveal className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[rgba(34,211,238,0.15)] bg-[linear-gradient(135deg,rgba(34,211,238,0.05),rgba(167,139,250,0.05))] p-10 text-center sm:p-12">
            <p className="text-base font-semibold text-white">{copy.paidPreviewTitle}</p>
            <p className="mt-2 text-sm text-[#A1A1AA]">{copy.paidPreviewSubtitle}</p>
            <Link
              href={checkoutHref}
              className="lux-btn-primary mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-2.5 text-sm font-bold text-[#09090B] transition-[transform,box-shadow] duration-150 ease-out hover:scale-[1.02] active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              {copy.getFullAccess} — {programTitle}
            </Link>
          </div>
        </ScrollReveal>
      ) : null}
    </div>
  );
}
