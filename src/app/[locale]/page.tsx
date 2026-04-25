import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { HomepageIntroGate } from "@/components/home/homepage-intro-gate";
import { coaches, programs } from "@/lib/content";
import { getDietPhase, isCatalogDiet } from "@/lib/diet-catalog";
import { getHomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { getFeaturedCatalogPrograms, normalizeCatalogProgram } from "@/lib/program-catalog";
import { localizeProgram } from "@/lib/program-localization";

/** Client-only immersive home — scroll observers, sidebar offset. */
const ImmersiveHome = dynamic(() => import("@/components/immersive-home").then((m) => m.ImmersiveHome), {
  ssr: true,
  loading: () => <HomeLuxurySkeleton />
});

function HomeLuxurySkeleton() {
  return (
    <div className="min-h-[100dvh] bg-background px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-7 w-20 rounded-full bg-white/[0.08]" />
        <div className="mt-10 h-10 max-w-md rounded-lg bg-white/[0.07]" />
        <div className="mt-3 h-10 max-w-sm rounded-lg bg-white/[0.06]" />
        <div className="mt-8 h-24 max-w-lg rounded-lg bg-white/[0.05]" />
        <div className="mt-10 flex gap-4">
          <div className="h-12 w-36 rounded-full bg-white/[0.08]" />
          <div className="h-12 w-40 rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) {
    notFound();
  }

  const locale = raw as Locale;
  const copy = getHomeLuxuryCopy(locale);
  const freePrograms = programs.filter((p) => p.is_free);
  const programCount = programs.filter((p) => !isCatalogDiet(p)).length;
  const dietCount = programs.filter(isCatalogDiet).length;
  const programPreviews = programs
    .filter((p) => !isCatalogDiet(p))
    .map((p) => normalizeCatalogProgram(localizeProgram(p, locale), locale));
  const featuredProgramPreviews = getFeaturedCatalogPrograms(programPreviews, 4).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    duration: p.duration,
    price: p.price,
    description: p.display.previewReason,
    difficulty: p.difficulty,
    metaLine: p.display.metaLine,
    goalBadge: p.display.goalBadge,
    locationBadge: p.display.locationBadge,
    tierLabel: p.display.tierLabel,
    is_free: Boolean(p.is_free)
  }));
  const dietPreviews = programs.filter(isCatalogDiet).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    duration: p.duration,
    price: p.price,
    phase: getDietPhase(p),
    is_free: Boolean(p.is_free)
  }));
  const coachPreviews = coaches.slice(0, 4).map((c) => ({
    slug: c.slug,
    name: c.name,
    specialty: c.specialty,
    rating: c.rating
  }));

  return (
    <ClientErrorBoundary
      sentryScope="home-luxury"
      fallback={
        <div className="min-h-[100dvh] bg-background px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-sm text-muted">
              The homepage could not be displayed. Please reload or try again later.
            </p>
            <a
              href={`/${locale}/programs`}
              className="mt-8 inline-flex rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-bright"
            >
              Browse programs
            </a>
          </div>
        </div>
      }
    >
      <HomepageIntroGate>
        <ImmersiveHome
          locale={locale}
          copy={copy}
          programs={featuredProgramPreviews}
          diets={dietPreviews}
          coaches={coachPreviews}
          freePrograms={freePrograms}
          programCount={programCount}
          dietCount={dietCount}
        />
      </HomepageIntroGate>
    </ClientErrorBoundary>
  );
}
