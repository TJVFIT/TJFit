import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { HomepageIntroGate } from "@/components/home/homepage-intro-gate";
import { coaches, programs } from "@/lib/content";
import { getHomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { isLocale, type Locale } from "@/lib/i18n";

/** Client-only immersive home — scroll observers, sidebar offset. */
const ImmersiveHome = dynamic(() => import("@/components/immersive-home").then((m) => m.ImmersiveHome), {
  ssr: true,
  loading: () => <HomeLuxurySkeleton />
});

/**
 * Self-contained copy for the homepage crash fallback. Kept inline (no copy
 * module import) so the fallback still renders even if a lib import is what
 * failed.
 */
const FALLBACK_COPY: Record<Locale, { title: string; body: string; retry: string; browse: string }> = {
  en: {
    title: "Something went wrong",
    body: "The homepage could not be displayed. Please reload or try again later.",
    retry: "Reload",
    browse: "Browse bundles"
  },
  tr: {
    title: "Bir şeyler ters gitti",
    body: "Ana sayfa görüntülenemedi. Lütfen sayfayı yenile veya daha sonra tekrar dene.",
    retry: "Yenile",
    browse: "Paketleri incele"
  },
  ar: {
    title: "حدث خطأ ما",
    body: "تعذّر عرض الصفحة الرئيسية. يرجى إعادة التحميل أو المحاولة لاحقاً.",
    retry: "إعادة التحميل",
    browse: "تصفّح الحزم"
  },
  es: {
    title: "Algo salió mal",
    body: "No se pudo mostrar la página de inicio. Recárgala o inténtalo más tarde.",
    retry: "Recargar",
    browse: "Ver paquetes"
  },
  fr: {
    title: "Un problème est survenu",
    body: "La page d'accueil n'a pas pu s'afficher. Recharge la page ou réessaie plus tard.",
    retry: "Recharger",
    browse: "Voir les packs"
  }
};

function HomeLuxurySkeleton() {
  return (
    <div className="min-h-[100dvh] bg-background px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="tj-skeleton h-7 w-20 rounded-full" />
        <div className="tj-skeleton mt-10 h-10 max-w-md rounded-lg" />
        <div className="tj-skeleton mt-3 h-10 max-w-sm rounded-lg" />
        <div className="tj-skeleton mt-8 h-24 max-w-lg rounded-lg" />
        <div className="mt-10 flex gap-4">
          <div className="tj-skeleton h-12 w-36 rounded-full" />
          <div className="tj-skeleton h-12 w-40 rounded-full" />
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
        <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-24 sm:px-6 lg:px-8">
          <div className="tj-empty-state mx-auto flex max-w-md flex-col items-center rounded-2xl px-8 py-12 text-center">
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/[0.07] text-2xl"
            >
              ⚠
            </span>
            <h1 className="mt-5 font-display text-xl font-semibold text-white">
              {FALLBACK_COPY[locale].title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {FALLBACK_COPY[locale].body}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`/${locale}`}
                className="tj-cta-sheen inline-flex min-h-[44px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-6 text-sm font-bold text-[#09090B] shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              >
                {FALLBACK_COPY[locale].retry}
              </a>
              <a
                href={`/${locale}/bundles`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.05] px-6 text-sm font-medium text-bright transition-colors hover:border-cyan-300/35 hover:text-cyan-100"
              >
                {FALLBACK_COPY[locale].browse}
              </a>
            </div>
          </div>
        </div>
      }
    >
      <HomepageIntroGate>
        <ImmersiveHome
          locale={locale}
          copy={copy}
          coaches={coachPreviews}
          freePrograms={freePrograms}
        />
      </HomepageIntroGate>
    </ClientErrorBoundary>
  );
}
