import Link from "next/link";
import { notFound } from "next/navigation";
import { FreeProductBodyBlocks, FreeProductUpgradeFooter } from "@/components/free-product-detail-view";
import { Logo } from "@/components/ui/Logo";
import { ProgramViewTracker } from "@/components/marketing/program-view-tracker";
import { ProgramContentLock } from "@/components/program-content-lock";
import { coaches, products, programs } from "@/lib/content";
import { localizeCustomProgramRow, type CustomProgramRow } from "@/lib/custom-programs";
import { getFreeProductPageModel, isFreeProductSlug } from "@/lib/free-product-pages";
import { programBlueprints, type ProgramBlueprint } from "@/lib/program-blueprints";
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

function getProgramTheme(category: string) {
  const base = category.toLowerCase();
  if (base.includes("nutrition")) return "from-emerald-400/30 via-teal-400/20 to-cyan-400/30";
  if (base.includes("fat")) return "from-orange-400/30 via-rose-400/20 to-red-400/30";
  if (base.includes("muscle")) return "from-violet-400/30 via-fuchsia-400/20 to-indigo-400/30";
  return "from-cyan-400/30 via-blue-400/20 to-indigo-400/30";
}

function trainingLocationLabel(slug: string, copy: ReturnType<typeof getProgramUiCopy>): string {
  const s = slug.toLowerCase();
  if (s.startsWith("home")) return copy.trainingLocationHome;
  if (s.startsWith("gym")) return copy.trainingLocationGym;
  return copy.trainingLocationAny;
}

function BlueprintPhaseCard({
  phase,
  copy
}: {
  phase: ProgramBlueprint["weeklyPhases"][number];
  copy: ReturnType<typeof getProgramUiCopy>;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
      <p className="text-lg font-semibold text-white">{phase.title}</p>
      <p className="mt-2 text-sm text-zinc-400">{phase.focus}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.blueprintTrainingDays}</p>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            {phase.trainingDays.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.blueprintConditioning}</p>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            {phase.conditioning.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
  let hasPaidOrder = false;
  if (authCtx && program && !program.is_free) {
    hasPaidOrder = await userHasPaidProgram(authCtx.supabase, userId!, slug);
  }
  const access = resolveStaticProgramAccess(program ?? null, userId, hasPaidOrder);

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
  const previewItems = program?.previewImages ?? [programManagementCopy.uploadedProgramPreview];
  const programAssets =
    program?.assets ??
    [
      { type: "pdf-guide" as const, label: programManagementCopy.uploadedPdfAsset },
      { type: "pdf-guide" as const, label: programManagementCopy.translatedPackAsset }
    ];

  const paidContentLocked = Boolean(program && !program.is_free && !access.showFullPaidContent);
  const blueprintPhases = blueprint?.weeklyPhases ?? [];
  const firstBlueprintPhase = blueprintPhases[0];
  const restBlueprintPhases = blueprintPhases.slice(1);

  const freeModel = program && isFreeProductSlug(slug) ? getFreeProductPageModel(slug, locale) : null;
  const upgradeTargetProgram = freeModel ? programs.find((p) => p.slug === freeModel.upgrade.checkoutSlug) : undefined;
  const upgradeProgramTitle = upgradeTargetProgram ? localizeProgram(upgradeTargetProgram, locale).title : copy.upgradeSectionTitle;

  const dayLabels = {
    warmup: copy.workoutWarmupLabel,
    main: copy.workoutMainLabel,
    cooldown: copy.workoutCooldownLabel
  };

  const checkoutHref = `/${locale}/checkout?program=${slug}`;
  const premiumBannerLabel = program?.is_free ? copy.programKindFree : copy.programKindPremium;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <ProgramViewTracker slug={slug} />
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-8 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.75)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge">{programCategory}</span>
            {program?.is_free ? (
              <span className="rounded-full border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                {copy.freeBadge}
              </span>
            ) : null}
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white">{programTitle}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{programDescription}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200">
              {blueprint?.goal ?? programCategory}
            </span>
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200">
              {programDuration}
            </span>
            {program ? (
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-100/95">
                {program.category.toLowerCase().includes("nutrition") ? copy.dietPlanBadge : trainingLocationLabel(slug, copy)}
              </span>
            ) : null}
          </div>

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

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {previewItems.map((_, index) => (
              <div
                key={`${slug}-preview-${index}`}
                className={`rounded-[24px] border border-white/10 bg-gradient-to-br p-8 text-center text-xs uppercase tracking-[0.24em] text-zinc-100/85 ${programTheme}`}
              >
                {copy.previewLabel} {index + 1}
              </div>
            ))}
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

          {blueprint && (
            <div className="mt-10 space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.blueprintTitle}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{copy.blueprintGoal}</p>
                    <p className="mt-2 text-white">{blueprint.goal}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{copy.blueprintLevel}</p>
                    <p className="mt-2 text-white">{blueprint.level}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{copy.blueprintEquipment}</p>
                    <p className="mt-2 text-white">{blueprint.equipment}</p>
                  </div>
                </div>
              </div>

              {firstBlueprintPhase ? <BlueprintPhaseCard phase={firstBlueprintPhase} copy={copy} /> : null}

              {restBlueprintPhases.length > 0 || blueprint.safety.length > 0 ? (
                paidContentLocked ? (
                  <ProgramContentLock
                    locked
                    title={copy.paidPreviewTitle}
                    subtitle={copy.paidPreviewSubtitle}
                    ctaHref={checkoutHref}
                    ctaLabel={copy.getFullAccess}
                  >
                    <div className="space-y-5 p-2">
                      {restBlueprintPhases.map((phase) => (
                        <BlueprintPhaseCard key={phase.title} phase={phase} copy={copy} />
                      ))}
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.blueprintSafety}</p>
                        <div className="mt-3 space-y-2 text-sm text-zinc-300">
                          {blueprint.safety.map((item) => (
                            <p key={item}>- {item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ProgramContentLock>
                ) : (
                  <>
                    {restBlueprintPhases.map((phase) => (
                      <BlueprintPhaseCard key={phase.title} phase={phase} copy={copy} />
                    ))}
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.blueprintSafety}</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        {blueprint.safety.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    </div>
                  </>
                )
              ) : null}
            </div>
          )}

          {program && freeModel ? (
            <div className="mt-10 space-y-2">
              {!access.showFullFreeContent ? (
                <ProgramContentLock
                  locked
                  title={copy.freeContentTeaserTitle}
                  subtitle={copy.freeContentTeaserBody}
                  ctaHref={`/${locale}/signup`}
                  ctaLabel={copy.signUpToUnlockFree}
                  secondaryHref={`/${locale}/login`}
                  secondaryLabel={copy.logInToUnlockFree}
                >
                  <div className="p-4 sm:p-5">
                    <FreeProductBodyBlocks model={freeModel} dayLabels={dayLabels} />
                  </div>
                </ProgramContentLock>
              ) : (
                <FreeProductBodyBlocks model={freeModel} dayLabels={dayLabels} />
              )}
              <FreeProductUpgradeFooter model={freeModel} locale={locale} upgradeProgramTitle={upgradeProgramTitle} />
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
                access.showFullFreeContent ? (
                  <p className="text-sm font-medium text-emerald-300/95">{copy.youHaveFullAccess}</p>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/signup`}
                      className="gradient-button inline-flex justify-center rounded-full px-5 py-2.5 text-center text-sm font-medium text-white"
                    >
                      {copy.signUpToUnlockFree}
                    </Link>
                    <Link
                      href={`/${locale}/login`}
                      className="inline-flex justify-center rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-white/5"
                    >
                      {copy.logInToUnlockFree}
                    </Link>
                  </>
                )
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
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
          <p className="text-base font-semibold text-white">{copy.paidPreviewTitle}</p>
          <p className="mt-2 text-sm text-zinc-400">{copy.paidPreviewSubtitle}</p>
          <Link
            href={checkoutHref}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-2.5 text-sm font-semibold text-[#05080a]"
          >
            {copy.getFullAccess} — {programTitle}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
