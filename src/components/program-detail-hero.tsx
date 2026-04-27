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
    <section className="relative -mx-4 overflow-hidden border-b border-white/[0.06] bg-[#08080A] sm:-mx-6 lg:mx-[calc(-50vw+50%)] lg:w-screen lg:max-w-[100vw]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(34,211,238,0.08), transparent 65%), linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(8,8,10,0.6) 100%)"
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-20 sm:px-6 md:pt-24 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:px-8 lg:pb-16">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/45">
            <Link href={`/${locale}`} className="transition-colors duration-150 hover:text-white">
              {breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="transition-colors duration-150 hover:text-white">
              {listLabel}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-white/65">{programTitle}</span>
          </nav>

          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
            {programCategory}
          </p>

          <h1
            className="mt-3 max-w-4xl font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.02em] text-white sm:text-[52px] lg:text-[60px]"
          >
            {programTitle}
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-white/55">{metaLine}</p>
        </div>

        <dl className="grid grid-cols-3 gap-x-6 gap-y-3 border-l border-white/[0.06] pl-6 text-[12px] lg:min-w-[260px]">
          <Spec label="Goal" value={goalLabel} />
          <Spec label={isDiet ? "Type" : "Setup"} value={locationOrTypeLabel} />
          <Spec label="Level" value={levelLabel} />
        </dl>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{label}</dt>
      <dd className="mt-1.5 truncate text-[13px] font-medium text-white/90">{value}</dd>
    </div>
  );
}
