"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PremiumPageShell } from "@/components/premium";
import { ProgramCard, SectionHeading } from "@/components/ui";
import { programs, Program } from "@/lib/content";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";
import { useAuth } from "@/components/auth-provider";
import { getProgramManagementCopy } from "@/lib/program-management-copy";

type CustomProgramCard = Program & { isCustomUpload?: boolean };

export default function ProgramsPage({ params }: { params: { locale: string } }) {
  const rawLocale = params?.locale ?? "";
  const localeValid = isLocale(rawLocale);
  const locale = (localeValid ? rawLocale : "en") as Locale;
  const copy = getProgramUiCopy(locale);
  const programManagementCopy = getProgramManagementCopy(locale);
  const { role } = useAuth();
  const [uploadedPrograms, setUploadedPrograms] = useState<CustomProgramCard[]>([]);

  const canUpload = role === "admin" || role === "coach";

  useEffect(() => {
    const loadCustomPrograms = async () => {
      const res = await fetch(`/api/programs/custom?locale=${locale}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data.programs ?? []).map((item: any) => ({
        slug: item.slug,
        title: item.title,
        category: item.category,
        difficulty: item.difficulty ?? "Beginner to Advanced",
        duration: item.duration ?? "12 weeks",
        price: item.price_try ?? 400,
        description: item.description,
        coachSlug: "tjfit-team",
        requiredEquipment: [],
        previewImages: [programManagementCopy.uploadedProgramPreview],
        assets: [{ type: "pdf-guide" as const, label: programManagementCopy.uploadedPdfAsset }],
        coachCommissionRate: 0,
        isCustomUpload: true
      })) as CustomProgramCard[];
      setUploadedPrograms(mapped);
    };
    loadCustomPrograms();
  }, [locale, programManagementCopy.uploadedPdfAsset, programManagementCopy.uploadedProgramPreview]);

  const allPrograms = useMemo(
    () => [...uploadedPrograms, ...programs.map((item) => localizeProgram(item, locale))],
    [uploadedPrograms, locale]
  );

  if (!localeValid) {
    notFound();
  }

  const tierLabels =
    locale === "tr"
      ? { elite: "Elite", popular: "Populer", fresh: "Yeni", signature: "Ozel" }
      : locale === "ar"
        ? { elite: "نخبة", popular: "الاكثر طلبا", fresh: "جديد", signature: "مميز" }
        : locale === "es"
          ? { elite: "Elite", popular: "Popular", fresh: "Nuevo", signature: "Signature" }
          : locale === "fr"
            ? { elite: "Elite", popular: "Populaire", fresh: "Nouveau", signature: "Signature" }
            : { elite: "Elite", popular: "Popular", fresh: "New", signature: "Signature" };
  const heading =
    locale === "tr"
      ? {
          eyebrow: "Program Pazari",
          title: "Hizli sonuc ve duzenli ilerleme icin dijital programlar.",
          body: "Yag yakimi, kondisyon ve kas gelisimi hedefleri icin yapilandirilmis programlari kesfedin."
        }
      : locale === "ar"
        ? {
            eyebrow: "سوق البرامج",
            title: "برامج رقمية لنتائج سريعة والتزام مستمر.",
            body: "تصفح برامج منظمة لحرق الدهون وتحسين اللياقة وبناء العضلات."
          }
        : locale === "es"
          ? {
              eyebrow: "Marketplace de Programas",
              title: "Programas digitales para resultados rapidos y constancia.",
              body: "Explora planes estructurados para perdida de grasa, condicion y ganancia muscular."
            }
          : locale === "fr"
            ? {
                eyebrow: "Marketplace de Programmes",
                title: "Programmes digitaux pour des resultats rapides et reguliers.",
                body: "Decouvrez des plans structures pour perte de graisse, condition physique et prise de muscle."
              }
            : {
                eyebrow: "Programs Marketplace",
                title: "Digital programs built for fast results and consistency.",
                body: "Browse structured training plans for fat loss, conditioning, and lean muscle goals. New programs are added weekly."
              };

  return (
    <PremiumPageShell className="max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} copy={heading.body} />
        {canUpload && (
          <Link
            href={`/${params.locale}/programs/upload`}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
            title={programManagementCopy.uploadCtaTitle}
          >
            <Plus className="h-4 w-4" />
            {programManagementCopy.upload}
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {allPrograms.map((program) => (
          <ProgramCard
            key={program.slug}
            program={program}
            href={`/${params.locale}/programs/${program.slug}`}
            viewLabel={copy.viewProgram}
            priceLabel={formatProgramPrice(
              "isCustomUpload" in program && program.isCustomUpload ? program.price : getProgramBasePriceTry(program),
              locale
            )}
            tierLabel={
              program.slug.includes("advanced") || program.slug.includes("hardcore")
                ? tierLabels.elite
                : program.slug.includes("pro") || program.slug.includes("shred")
                  ? tierLabels.popular
                  : program.slug.includes("starter") || program.slug.includes("beginner")
                    ? tierLabels.fresh
                    : tierLabels.signature
            }
          />
        ))}
      </div>
      {allPrograms.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-zinc-500">
          {programManagementCopy.noProgramsPublished}
        </div>
      )}
    </PremiumPageShell>
  );
}
