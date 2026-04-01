import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { coaches, programs } from "@/lib/content";
import { getHomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { isLocale, type Locale } from "@/lib/i18n";

/**
 * Luxury home is client-only (ssr: false) so Framer Motion + useReducedMotion never run during SSR.
 * That avoids hydration mismatches that surface as "Application error: a client-side exception has occurred".
 */
const LuxuryHome = dynamic(() => import("@/components/luxury/luxury-home").then((m) => m.LuxuryHome), {
  ssr: false,
  loading: () => <HomeLuxurySkeleton />
});

function HomeLuxurySkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0B] px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
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
  const programPreviews = programs.slice(0, 4).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    duration: p.duration,
    price: p.price
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
        <div className="min-h-[100dvh] bg-[#0A0A0B] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-sm text-zinc-400">
              The homepage could not be displayed. Please reload or try again later.
            </p>
            <a
              href={`/${locale}/programs`}
              className="mt-8 inline-flex rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-zinc-100"
            >
              Browse programs
            </a>
          </div>
        </div>
      }
    >
      <LuxuryHome locale={locale} copy={copy} programs={programPreviews} coaches={coachPreviews} />
    </ClientErrorBoundary>
  );
}
