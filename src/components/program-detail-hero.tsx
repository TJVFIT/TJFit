import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";

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
  const variant = isDiet ? "nutrient" : "dumbbell";

  const chip = (label: string, tone: "champagne" | "muted" = "muted") => (
    <span
      className="rounded-full border px-3 py-1.5 text-xs font-medium"
      style={
        tone === "champagne"
          ? {
              borderColor: "rgba(34,211,238,0.32)",
              background: "rgba(34,211,238,0.08)",
              color: TJ_PALETTE.champagne
            }
          : {
              borderColor: TJ_PALETTE.hairline,
              background: "rgba(246,243,237,0.03)",
              color: TJ_PALETTE.textMuted
            }
      }
    >
      {label}
    </span>
  );

  return (
    <section
      className="relative -mx-4 min-h-[320px] overflow-hidden sm:-mx-6 md:min-h-[400px] lg:mx-[calc(-50vw+50%)] lg:w-screen lg:max-w-[100vw]"
      style={{ background: TJ_PALETTE.obsidian }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 72% 40%, rgba(34,211,238,0.14), transparent 60%), radial-gradient(ellipse 70% 60% at 15% 90%, rgba(143,164,196,0.05), transparent 55%)`
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-0 hidden opacity-[0.85] lg:block"
        style={{ maskImage: "radial-gradient(ellipse 70% 60% at 78% 55%, black 35%, transparent 90%)" }}
        aria-hidden
      >
        <TJHeroStage variant={variant} speed={0.7} intensity={0.85} />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(90deg, ${TJ_PALETTE.obsidian} 0%, rgba(8,8,10,0.88) 40%, rgba(8,8,10,0.25) 75%, transparent 100%), linear-gradient(to bottom, transparent 0%, rgba(8,8,10,0.55) 100%)`
        }}
        aria-hidden
      />

      <div className="relative z-[2] mx-auto flex min-h-[320px] max-w-6xl flex-col justify-end px-4 pb-10 pt-16 sm:px-6 md:min-h-[400px] md:pb-10 md:pt-20 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]" style={{ color: TJ_PALETTE.textSubtle }}>
          <Link href={`/${locale}`} className="transition-colors duration-150 hover:text-white">
            {breadcrumbHome}
          </Link>
          <span aria-hidden>/</span>
          <Link href={listHref} className="transition-colors duration-150 hover:text-white">
            {listLabel}
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: TJ_PALETTE.textMuted }}>{programTitle}</span>
        </nav>

        <div className="mt-4 flex flex-wrap gap-2">
          {chip(programCategory, "champagne")}
          {chip(goalLabel)}
          {chip(locationOrTypeLabel)}
          {chip(levelLabel)}
        </div>

        <h1
          className="mt-6 max-w-4xl font-display font-extrabold leading-[1.02] tracking-[-0.03em] md:text-[56px]"
          style={{ fontSize: "clamp(36px, 5.2vw, 64px)", color: TJ_PALETTE.textPrimary }}
        >
          {programTitle}
        </h1>
        <p className="mt-3 text-sm" style={{ color: TJ_PALETTE.textMuted }}>
          {metaLine}
        </p>

        <Link
          href={listHref}
          className="mt-6 inline-flex w-fit text-[13px] transition-colors duration-150 hover:text-white"
          style={{ color: TJ_PALETTE.textSubtle }}
        >
          ← {isDiet ? breadcrumbDiets : breadcrumbPrograms}
        </Link>
      </div>
    </section>
  );
}
