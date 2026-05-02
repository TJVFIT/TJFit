import Link from "next/link";
import { Suspense } from "react";
import { FreeProductBodyBlocks, FreeProductUpgradeFooter } from "@/components/free-product-detail-view";
import { ProgramEliteSystemCard } from "@/components/program-elite-system-card";
import { ProgramBlueprintNavigator } from "@/components/program-blueprint-navigator";
import { ProgramDetailHero } from "@/components/program-detail-hero";
import { ProgramDetailTabs } from "@/components/programs/program-detail-tabs";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProgramViewTracker } from "@/components/marketing/program-view-tracker";
import { ProgramPaymentSuccessNotice } from "@/components/program-payment-success-notice";
import { ProgramContentLock } from "@/components/program-content-lock";
import { StickyPurchaseRail } from "@/components/sticky-purchase-rail";
import { MobileCtaBar } from "@/components/mobile-cta-bar";
import { coaches, products, programs } from "@/lib/content";
import { localizeCustomProgramRow, type CustomProgramRow } from "@/lib/custom-programs";
import { getFreeProductPageModel, isFreeProductSlug } from "@/lib/free-product-pages";
import { getOrBuildBlueprint } from "@/lib/program-blueprints";
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
  if (base.includes("nutrition")) return "from-cyan-400/30 via-sky-400/20 to-blue-400/30";
  if (base.includes("fat")) return "from-cyan-400/30 via-sky-400/20 to-blue-400/30";
  if (base.includes("muscle")) return "from-blue-400/30 via-sky-400/20 to-cyan-400/30";
  return "from-cyan-400/30 via-sky-400/20 to-blue-400/30";
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

  let customProgramPdfPath: string | null = null;
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
        customProgramPdfPath = row.pdf_path;
      }
    }
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

  if (!staticProgram && !customProgram) {
    return <ProgramUnavailableState locale={locale} />;
  }

  const authCtx = await getOptionalServerUser();
  const userId = authCtx?.userId ?? null;
  const isAdmin = authCtx?.role === "admin";
  // Static paid programs: public preview is OK — body sections are gated
  // by ProgramContentLock. Custom uploaded programs are different —
  // their body is auto-translated user-uploaded text we can't show
  // publicly. Hide the text body and PDF link from anyone who isn't
  // signed in AND paid (or admin).
  let hasPaidOrder = false;
  if (authCtx && program && !program.is_free) {
    hasPaidOrder = await userHasPaidProgram(authCtx.supabase, userId!, slug);
  }
  let hasPaidCustomProgram = false;
  if (authCtx && customProgram) {
    hasPaidCustomProgram = isAdmin || (await userHasPaidProgram(authCtx.supabase, userId!, slug));
    if (hasPaidCustomProgram && customProgramPdfPath) {
      const { data: signed } = await authCtx.supabase.storage
        .from("program-assets")
        .createSignedUrl(customProgramPdfPath, 60 * 20);
      customProgramPdfUrl = signed?.signedUrl ?? null;
    }
  }
  const customProgramLocked = Boolean(customProgram) && !hasPaidCustomProgram;
  // Hard gate: if this is a custom program and the viewer is not signed in
  // (or signed in but not paid/admin), strip the translated text and signed
  // PDF URL entirely. The page still renders so they see the title and CTA,
  // but the body content is never sent to the client.
  if (customProgram && !hasPaidCustomProgram) {
    customProgramTranslatedText = null;
    customProgramPdfUrl = null;
  }
  const access = resolveStaticProgramAccess(program ?? null, userId, hasPaidOrder, isAdmin);

  const baseTry = program ? getProgramBasePriceTry(program) : customProgram?.price_try ?? 400;
  const localizedPrice = program?.is_free ? copy.freePriceLabel : formatProgramPrice(baseTry, locale);
  const priceTreatmentCopy = program && (program.is_free || baseTry === 0) ? "Free preview" : localizedPrice;

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
  const blueprint = program ? getOrBuildBlueprint(program) : undefined;
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
  const railNeedsCheckout = !program || (!program.is_free && !access.showFullPaidContent);
  const railPrimaryHref = program?.is_free ? freeDownloadHref : railNeedsCheckout ? (userId ? checkoutHref : signupUnlockHref) : undefined;
  const railPrimaryLabel = program?.is_free
    ? freeDownloadLabel[locale]
    : railNeedsCheckout
      ? userId
        ? copy.getFullAccess
        : copy.signUpToUnlockFree
      : undefined;
  const railSecondaryHref = !program?.is_free && railNeedsCheckout && !userId ? loginUnlockHref : undefined;
  const railSecondaryLabel = railSecondaryHref ? copy.logInToUnlockFree : undefined;
  const railAccessCopy = program?.is_free || (program && access.showFullPaidContent) ? copy.youHaveFullAccess : undefined;

  return (
    <div className="relative pb-32 pt-0 sm:pb-20 lg:pb-24 xl:pb-24">
      <ProgramViewTracker slug={slug} />
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <ProgramPaymentSuccessNotice
            message={copy.paymentSuccessBanner}
            dismissLabel={copy.dismissNotice}
            programSlug={slug}
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
        imageLabels={program?.previewImages}
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

          <ProgramDetailTabs
            tabs={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <>
          {program ? (
            <div className="mt-10">
              <ProgramEliteSystemCard
                meta={getProgramEliteMeta(slug, programCategory, isDiet)}
                labels={getProgramEliteLabels(locale, isDiet)}
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-faint">{copy.languageOptionsLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {locales.map((targetLocale) => (
                <Link
                  key={targetLocale}
                  href={`/${targetLocale}/programs/${slug}`}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    targetLocale === locale
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/15 text-bright hover:border-white/30 hover:text-white"
                  }`}
                >
                  {localeNames[targetLocale]}
                </Link>
              ))}
            </div>
          </div>

          <div className={`mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br ${programTheme}`}>
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-black/30 px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85">
                {premiumBannerLabel}
              </p>
              <span className="rounded-sm border border-white/[0.18] bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                {tier}
              </span>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/65">
                {programDuration}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">
                {priceTreatmentCopy}
              </p>
            </div>
          </div>


          {!program && (
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-faint">{copy.autoTranslatedPdf}</p>
              <p className="mt-3 text-sm leading-7 text-bright">
                {(customProgramTranslatedText ?? "").slice(0, customProgramLocked ? 400 : 1200)}
                {(customProgramTranslatedText ?? "").length > (customProgramLocked ? 400 : 1200) ? "..." : ""}
              </p>
              {customProgramPdfUrl && !customProgramLocked ? (
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
              ) : customProgramLocked ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={userId ? checkoutHref : signupUnlockHref}
                    className="gradient-button inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-white"
                  >
                    {userId ? copy.getFullAccess : copy.signUpToUnlockFree}
                  </Link>
                  {!userId ? (
                    <Link
                      href={loginUnlockHref}
                      className="inline-flex items-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 hover:border-white/30 hover:text-white"
                    >
                      {copy.logInToUnlockFree}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

                  </>
                )
              },
              {
                id: "structure",
                label: "Structure",
                content: (
                  <>
          {blueprint ? (
            <div className="mt-10 space-y-6">
              <div className="rounded-2xl border border-divider bg-surface p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-dim">{copy.blueprintTitle}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-divider bg-[#18191E] p-3 text-sm text-muted">
                    <p className="text-xs uppercase tracking-[0.2em] text-dim">{copy.blueprintGoal}</p>
                    <p className="mt-2 text-white">{blueprint.goal}</p>
                  </div>
                  <div className="rounded-xl border border-divider bg-[#18191E] p-3 text-sm text-muted">
                    <p className="text-xs uppercase tracking-[0.2em] text-dim">{copy.blueprintLevel}</p>
                    <p className="mt-2 text-white">{blueprint.level}</p>
                  </div>
                  <div className="rounded-xl border border-divider bg-[#18191E] p-3 text-sm text-muted">
                    <p className="text-xs uppercase tracking-[0.2em] text-dim">{copy.blueprintEquipment}</p>
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
          ) : (
            <div className="rounded-[14px] border border-cyan-300/15 bg-cyan-300/[0.06] p-6 text-center">
              <p className="font-display text-xl font-semibold text-white">{copy.blueprintTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">Structure details are being prepared for this program.</p>
            </div>
          )}

                  </>
                )
              },
              {
                id: "preview",
                label: "Preview",
                content: (
                  <>
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
          ) : (
            <div className="rounded-[14px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(14,165,233,0.025))] p-6 text-center">
              <p className="font-display text-xl font-semibold text-white">{priceTreatmentCopy}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{programDescription}</p>
            </div>
          )}
                  </>
                )
              }
            ]}
          />
        </section>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          {/* Hide the inline rail below md — MobileCtaBar (md:hidden) handles
              the small-screen purchase decision. md→xl shows the rail
              inline; xl+ pins it sticky via the aside's xl:sticky. */}
          <div className="hidden md:block">
            <StickyPurchaseRail
              coachLabel={copy.coachLabel}
              coachName={coach?.name ?? copy.teamFallback}
              coachSpecialty={coach?.specialty ?? copy.teamFallback}
              difficultyLabel={copy.difficultyLabel}
              difficulty={programDifficulty}
              durationLabel={copy.durationLabel}
              duration={programDuration}
              priceLabel={copy.priceLabel}
              priceCopy={priceTreatmentCopy}
              primaryHref={railPrimaryHref}
              primaryLabel={railPrimaryLabel}
              secondaryHref={railSecondaryHref}
              secondaryLabel={railSecondaryLabel}
              accessCopy={railAccessCopy || undefined}
            />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-6">
            <p className="text-lg font-semibold text-white">{copy.recommendedEquipment}</p>
            <div className="mt-6 space-y-4">
              {recommendedProducts.length === 0 && <p className="text-sm text-muted">{copy.noEquipment}</p>}
              {recommendedProducts.map((product) => (
                <div key={product.slug} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-muted">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums text-white">{formatProgramPrice(product.price, locale)}</p>
                      <p className="mt-1 text-xs text-faint">{formatCoachCommissionLine(locale, product.coachCommissionRate)}</p>
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
          <div className="rounded-2xl border border-[rgba(34,211,238,0.15)] bg-[linear-gradient(135deg,rgba(34,211,238,0.07),rgba(14,165,233,0.05))] p-8 text-center sm:p-12">
            <p className="text-base font-semibold text-white">{copy.paidPreviewTitle}</p>
            <p className="mt-2 text-sm text-muted">{copy.paidPreviewSubtitle}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={userId ? checkoutHref : signupUnlockHref}
                className="lux-btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-2.5 text-sm font-bold text-[#09090B] transition-[transform,box-shadow] duration-150 ease-out hover:scale-[1.02] active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
              >
                {userId ? `${copy.getFullAccess} — ${programTitle}` : copy.signUpToUnlockFree}
              </Link>
              {!userId ? (
                <Link
                  href={loginUnlockHref}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-5 py-2 text-sm text-white/85 hover:border-white/30 hover:text-white"
                >
                  {copy.logInToUnlockFree}
                </Link>
              ) : null}
            </div>
          </div>
        </ScrollReveal>
      ) : null}

      {/* Mobile sticky purchase bar — only when there's an actual purchase
          decision to make. Hidden on xl where the sticky aside takes over. */}
      {program && !program.is_free && !access.showFullPaidContent ? (
        <MobileCtaBar
          ariaLabel={copy.priceLabel}
          eyebrow={programDuration}
          priceCopy={priceTreatmentCopy}
          href={userId ? checkoutHref : signupUnlockHref}
          label={userId ? copy.getFullAccess : copy.signUpToUnlockFree}
        />
      ) : null}

      {customProgram && customProgramLocked ? (
        <MobileCtaBar
          ariaLabel={copy.priceLabel}
          eyebrow={programDuration || copy.programKindPremium}
          priceCopy={priceTreatmentCopy}
          href={userId ? checkoutHref : signupUnlockHref}
          label={userId ? copy.getFullAccess : copy.signUpToUnlockFree}
        />
      ) : null}
    </div>
  );
}

function ProgramUnavailableState({ locale }: { locale: Locale }) {
  return (
    <main className="relative min-h-[100dvh] bg-[#08080A] px-5 py-28 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(34,211,238,0.12),transparent_60%)]" />
      <section className="relative mx-auto max-w-xl rounded-[18px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(14,165,233,0.025))] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
          <span className="h-6 w-6 rounded-full border border-cyan-100/80" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Program coming soon</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          This program is not available yet. Browse the catalog for live previews and structured TJFit systems.
        </p>
        <Link
          href={`/${locale}/programs`}
          className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-[#071013] transition-transform duration-150 active:scale-[0.97]"
        >
          Back to programs
        </Link>
      </section>
    </main>
  );
}
