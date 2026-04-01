import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgramViewTracker } from "@/components/marketing/program-view-tracker";
import { coaches, products, programs } from "@/lib/content";
import { localizeCustomProgramRow, type CustomProgramRow } from "@/lib/custom-programs";
import { programBlueprints } from "@/lib/program-blueprints";
import { Locale, locales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import {
  formatProgramPrice,
  getProgramBasePriceTry,
  getProgramUiCopy,
  localizeAssetType,
  localizeProgram
} from "@/lib/program-localization";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getProgramManagementCopy } from "@/lib/program-management-copy";

function getProgramTheme(category: string) {
  const base = category.toLowerCase();
  if (base.includes("nutrition")) return "from-emerald-400/30 via-teal-400/20 to-cyan-400/30";
  if (base.includes("fat")) return "from-orange-400/30 via-rose-400/20 to-red-400/30";
  if (base.includes("muscle")) return "from-violet-400/30 via-fuchsia-400/20 to-indigo-400/30";
  return "from-cyan-400/30 via-blue-400/20 to-indigo-400/30";
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
  const localizedPrice = formatProgramPrice(
    program ? getProgramBasePriceTry(program) : customProgram?.price_try ?? 400,
    locale
  );
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
  const recommendedProducts = products.filter((product) =>
    program?.requiredEquipment.includes(product.slug)
  );
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

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <ProgramViewTracker slug={slug} />
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-8 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.75)]">
          <span className="badge">{programCategory}</span>
          <h1 className="mt-6 text-4xl font-semibold text-white">{programTitle}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{programDescription}</p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Language Options</p>
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
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-100/85">TJFit Premium Program</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-semibold text-white">
                  {tier}
                </span>
                <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-semibold text-white">
                  TJFit
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
            <p className="text-lg font-semibold text-white">{copy.assetsLabel}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {programAssets.map((asset, index) => (
                <div key={`${asset.type}-${index}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    {localizeAssetType(asset.type, locale)}
                  </p>
                  <p className="mt-3 text-white">{copy.previewLabel} {index + 1}</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {program ? "TJFit branded module" : "Uploaded and auto-translated module"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {!program && (
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Auto-Translated PDF Content</p>
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
                    Download Uploaded PDF
                  </a>
                </div>
              )}
            </div>
          )}

          {blueprint && (
            <div className="mt-10 space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Program Blueprint</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Goal</p>
                    <p className="mt-2 text-white">{blueprint.goal}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Level</p>
                    <p className="mt-2 text-white">{blueprint.level}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Equipment</p>
                    <p className="mt-2 text-white">{blueprint.equipment}</p>
                  </div>
                </div>
              </div>

              {blueprint.weeklyPhases.map((phase) => (
                <div key={phase.title} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                  <p className="text-lg font-semibold text-white">{phase.title}</p>
                  <p className="mt-2 text-sm text-zinc-400">{phase.focus}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Training Days</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        {phase.trainingDays.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Conditioning and Recovery</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        {phase.conditioning.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Safety</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-300">
                  {blueprint.safety.map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-6">
            <p className="text-sm text-zinc-400">{copy.coachLabel}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{coach?.name ?? copy.teamFallback}</p>
            <p className="mt-2 text-sm text-zinc-400">{coach?.specialty ?? copy.teamFallback}</p>

            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>{copy.difficultyLabel}</span>
                <span className="text-white">{programDifficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.durationLabel}</span>
                <span className="text-white">{programDuration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.priceLabel}</span>
                <span className="text-white">{localizedPrice}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/checkout?program=${slug}`}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                {copy.buyProgram}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-6">
            <p className="text-lg font-semibold text-white">{copy.recommendedEquipment}</p>
            <div className="mt-6 space-y-4">
              {recommendedProducts.length === 0 && (
                <p className="text-sm text-zinc-400">{copy.noEquipment}</p>
              )}
              {recommendedProducts.map((product) => (
                <div key={product.slug} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{localizedPrice}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Coach earns {product.coachCommissionRate}% commission
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
