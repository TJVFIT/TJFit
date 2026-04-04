import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type ProgramDetailHeroProps = {
  locale: Locale;
  programTitle: string;
  isDiet: boolean;
  programCategory: string;
  breadcrumbHome: string;
  breadcrumbPrograms: string;
  breadcrumbDiets: string;
  goalLabel: string;
  locationOrTypeLabel: string;
  levelLabel: string;
  metaLine: string;
};

export function ProgramDetailHero({
  locale,
  programTitle,
  isDiet,
  programCategory,
  breadcrumbHome,
  breadcrumbPrograms,
  breadcrumbDiets,
  goalLabel,
  locationOrTypeLabel,
  levelLabel,
  metaLine
}: ProgramDetailHeroProps) {
  const listHref = isDiet ? `/${locale}/diets` : `/${locale}/programs`;
  const listLabel = isDiet ? breadcrumbDiets : breadcrumbPrograms;

  return (
    <section className="relative -mx-4 min-h-[280px] overflow-hidden sm:-mx-6 md:min-h-[360px] lg:mx-[calc(-50vw+50%)] lg:w-screen lg:max-w-[100vw]">
      <div className="absolute inset-0 bg-[#09090B]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[min(100%,520px)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_65%)] opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.3)_0%,rgba(9,9,11,0.95)_100%)]"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto flex min-h-[280px] max-w-6xl flex-col justify-end px-4 pb-8 pt-16 sm:px-6 md:min-h-[360px] md:pb-8 md:pt-20 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#52525B]">
          <Link href={`/${locale}`} className="transition-colors duration-150 hover:text-white">
            {breadcrumbHome}
          </Link>
          <span aria-hidden>/</span>
          <Link href={listHref} className="transition-colors duration-150 hover:text-white">
            {listLabel}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[#A1A1AA]">{programTitle}</span>
        </nav>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)] px-3 py-1.5 text-xs font-medium text-[#22D3EE]">
            {programCategory}
          </span>
          <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-medium text-[#A1A1AA]">
            {goalLabel}
          </span>
          <span className="rounded-full border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.08)] px-3 py-1.5 text-xs font-medium text-[#A78BFA]">
            {locationOrTypeLabel}
          </span>
          <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-medium text-[#A1A1AA]">
            {levelLabel}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em] text-white md:text-[56px]">
          {programTitle}
        </h1>
        <p className="mt-3 text-sm text-[#A1A1AA]">{metaLine}</p>

        <Link
          href={listHref}
          className="mt-6 inline-flex w-fit text-[13px] text-[#52525B] transition-colors duration-150 hover:text-white"
        >
          ← {isDiet ? breadcrumbDiets : breadcrumbPrograms}
        </Link>
      </div>
    </section>
  );
}
