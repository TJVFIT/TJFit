import { BrainCircuit, Database, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { FitnessQuiz } from "@/components/fitness-quiz";
import { Reveal } from "@/components/motion";
import { programs } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function AiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return null;
  const locale = localeParam as Locale;
  const programSummaries = programs.map(({ slug, title, category, difficulty, description, duration }) => ({
    slug,
    title,
    category,
    difficulty,
    description,
    duration
  }));

  return (
    <div className="page-shell py-14 sm:py-20">
      <section className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <Reveal>
          <span className="badge">TJAI / guided matching</span>
          <h1 className="mt-6 max-w-[10ch] font-display text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-white sm:text-7xl">
            Guidance with guardrails.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-[62ch] text-base leading-8 text-zinc-300 sm:text-lg">
            TJAI begins with transparent questions, pauses when professional clearance may be needed, and matches against TJFit’s real program catalog. The result is explainable, editable and built for action.
          </p>
          <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
            {[
              [ShieldCheck, "Safety first"],
              [SlidersHorizontal, "Answer-driven"],
              [Database, "Real program data"]
            ].map(([Icon, label]) => {
              const Glyph = Icon as typeof BrainCircuit;
              return (
                <div key={label as string} className="flex items-center gap-2 text-xs text-zinc-400">
                  <Glyph className="h-4 w-4 text-accent-soft" aria-hidden />
                  {label as string}
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      <Reveal className="mt-12 sm:mt-16" delay={0.12}>
        <FitnessQuiz locale={locale} programs={programSummaries} />
      </Reveal>

      <section className="mt-20 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-[0.7fr_1.3fr]">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
          Boundaries / beta
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">What TJAI does</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Narrows program options, explains why a match fits, and helps translate a plan into a usable weekly routine.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">What TJAI does not do</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Diagnose conditions, replace medical care, promise outcomes, or silently infer a safe plan from risk signals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
