"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { PremiumPageShell } from "@/components/premium";
import type { Locale } from "@/lib/i18n";
import { programs } from "@/lib/content";
import { localizeProgram } from "@/lib/program-localization";
import { formatQuizProgress, getStartFunnelCopy } from "@/lib/start-funnel-copy";
import { resolveStartFunnelDietSlug, resolveStartFunnelProgramSlug } from "@/lib/start-funnel-resolve";
import { cn } from "@/lib/utils";

type Phase = "landing" | 1 | 2 | 3 | "result";

export function StartFunnelClient({ locale }: { locale: Locale }) {
  const copy = getStartFunnelCopy(locale);
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("landing");
  const [goal, setGoal] = useState<"fat" | "muscle" | null>(null);
  const [location, setLocation] = useState<"home" | "gym" | null>(null);
  const [diet, setDiet] = useState<"cut" | "bulk" | null>(null);

  const ioRef = useRef<HTMLElement | null>(null);
  const [ioIn, setIoIn] = useState(false);

  useEffect(() => {
    const el = ioRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIoIn(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setIoIn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const programSlug = useMemo(() => {
    if (goal === null || location === null) return null;
    return resolveStartFunnelProgramSlug(goal, location);
  }, [goal, location]);

  const dietSlug = useMemo(() => {
    if (diet === null) return null;
    return resolveStartFunnelDietSlug(diet);
  }, [diet]);

  const programModel = useMemo(() => {
    if (!programSlug) return null;
    const p = programs.find((x) => x.slug === programSlug);
    return p ? localizeProgram(p, locale) : null;
  }, [programSlug, locale]);

  const dietModel = useMemo(() => {
    if (!dietSlug) return null;
    const p = programs.find((x) => x.slug === dietSlug);
    return p ? localizeProgram(p, locale) : null;
  }, [dietSlug, locale]);

  const programHref = programSlug ? `/${locale}/programs/${programSlug}` : "#";
  const dietHref = dietSlug ? `/${locale}/programs/${dietSlug}` : "#";
  const signupHref =
    programSlug != null ? `/${locale}/signup?next=${encodeURIComponent(programHref)}` : `/${locale}/signup`;

  const mismatchNote =
    goal === "fat" && location === "gym"
      ? copy.resultNoteFatGym
      : goal === "muscle" && location === "home"
        ? copy.resultNoteMuscleHome
        : null;

  const quizStepIndex = phase === 1 ? 1 : phase === 2 ? 2 : phase === 3 ? 3 : 0;

  const reset = () => {
    setPhase("landing");
    setGoal(null);
    setLocation(null);
    setDiet(null);
  };

  return (
    <PremiumPageShell className="max-w-3xl">
      {phase === "landing" ? (
        <section
          ref={ioRef}
          className={cn(
            "mx-auto px-4 py-16 text-center sm:px-6 sm:py-24",
            "tj-io-fade",
            ioIn && "tj-io-in"
          )}
        >
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
            {copy.landingHeadline}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {copy.landingSubheadline}
          </p>
          <button
            type="button"
            onClick={() => setPhase(1)}
            className="mx-auto mt-10 flex min-h-[52px] w-full max-w-sm items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-8 text-sm font-semibold text-[#05080a] shadow-[0_0_40px_-12px_rgba(34,211,238,0.55)] transition hover:brightness-105 sm:text-base"
          >
            {copy.ctaFindPlan}
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </button>
        </section>
      ) : null}

      {phase !== "landing" && phase !== "result" ? (
        <div className="mx-auto px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8 flex gap-1.5 sm:mb-10">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  quizStepIndex >= n ? "bg-cyan-400/90" : "bg-white/[0.08]"
                )}
                aria-hidden
              />
            ))}
          </div>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {formatQuizProgress(copy, quizStepIndex, 3)}
          </p>

          <div className="relative mt-6 min-h-[12rem] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111215]/95 p-6 sm:min-h-[14rem] sm:p-8">
            {phase === 1 ? (
              <div key="q1" className="tj-quiz-step space-y-5">
                <p className="text-lg font-semibold text-white sm:text-xl">{copy.question1Title}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice label={copy.goalFat} selected={goal === "fat"} onClick={() => setGoal("fat")} />
                  <Choice label={copy.goalMuscle} selected={goal === "muscle"} onClick={() => setGoal("muscle")} />
                </div>
                <StepNav
                  showBack
                  onBack={reset}
                  backLabel={copy.back}
                  nextLabel={copy.next}
                  canNext={goal !== null}
                  onNext={() => setPhase(2)}
                />
              </div>
            ) : null}

            {phase === 2 ? (
              <div key="q2" className="tj-quiz-step space-y-5">
                <p className="text-lg font-semibold text-white sm:text-xl">{copy.question2Title}</p>
                <p className="text-sm text-zinc-500">{copy.stepLocationNote}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice label={copy.locHome} selected={location === "home"} onClick={() => setLocation("home")} />
                  <Choice label={copy.locGym} selected={location === "gym"} onClick={() => setLocation("gym")} />
                </div>
                <StepNav
                  showBack
                  onBack={() => setPhase(1)}
                  backLabel={copy.back}
                  nextLabel={copy.next}
                  canNext={location !== null}
                  onNext={() => setPhase(3)}
                />
              </div>
            ) : null}

            {phase === 3 ? (
              <div key="q3" className="tj-quiz-step space-y-5">
                <p className="text-lg font-semibold text-white sm:text-xl">{copy.question3Title}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice
                    label={
                      <span className="flex flex-col items-start gap-0.5 text-left">
                        <span>{copy.dietCut}</span>
                        <span className="text-xs font-normal text-zinc-500">{copy.dietCutHint}</span>
                      </span>
                    }
                    selected={diet === "cut"}
                    onClick={() => setDiet("cut")}
                  />
                  <Choice
                    label={
                      <span className="flex flex-col items-start gap-0.5 text-left">
                        <span>{copy.dietBulk}</span>
                        <span className="text-xs font-normal text-zinc-500">{copy.dietBulkHint}</span>
                      </span>
                    }
                    selected={diet === "bulk"}
                    onClick={() => setDiet("bulk")}
                  />
                </div>
                <StepNav
                  showBack
                  onBack={() => setPhase(2)}
                  backLabel={copy.back}
                  nextLabel={copy.next}
                  canNext={diet !== null}
                  onNext={() => setPhase("result")}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === "result" && programModel && dietModel && programSlug && dietSlug ? (
        <div className="mx-auto space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{copy.resultTitle}</p>
            <p className="mt-3 text-sm text-zinc-400">{copy.resultSubtitle}</p>
          </div>

          {mismatchNote ? (
            <p className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4 text-sm leading-relaxed text-zinc-300">
              {mismatchNote}
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <ResultCard
              label={copy.resultProgramLabel}
              title={programModel.title}
              description={programModel.description}
              href={programHref}
            />
            <ResultCard
              label={copy.resultDietLabel}
              title={dietModel.title}
              description={dietModel.description}
              href={dietHref}
            />
          </div>

          {user ? (
            <Link
              href={programHref}
              className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-sm font-semibold text-[#05080a] shadow-[0_0_36px_-10px_rgba(34,211,238,0.5)]"
            >
              {copy.ctaStartFree}
            </Link>
          ) : (
            <Link
              href={signupHref}
              className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-sm font-semibold text-[#05080a] shadow-[0_0_36px_-10px_rgba(34,211,238,0.5)]"
            >
              {copy.ctaStartFree}
            </Link>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/programs`}
              className="flex min-h-[48px] items-center justify-center rounded-full border border-white/15 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.04]"
            >
              {copy.ctaBrowsePrograms}
            </Link>
            <Link
              href={`/${locale}/diets`}
              className="flex min-h-[48px] items-center justify-center rounded-full border border-white/15 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.04]"
            >
              {copy.ctaBrowseDiets}
            </Link>
          </div>

          <button type="button" onClick={reset} className="w-full text-center text-sm text-zinc-500 transition hover:text-zinc-300">
            {copy.retakeQuiz}
          </button>
        </div>
      ) : null}
    </PremiumPageShell>
  );
}

function Choice({
  label,
  selected,
  onClick
}: {
  label: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[56px] rounded-2xl border px-4 py-4 text-left text-sm font-medium transition duration-200",
        selected ? "border-cyan-400/55 bg-cyan-500/10 text-white ring-1 ring-cyan-400/25" : "border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/[0.03]"
      )}
    >
      {label}
    </button>
  );
}

function StepNav({
  showBack,
  onBack,
  backLabel,
  nextLabel,
  canNext,
  onNext
}: {
  showBack: boolean;
  onBack: () => void;
  backLabel: string;
  nextLabel: string;
  canNext: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] rounded-full border border-white/12 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
        >
          {backLabel}
        </button>
      ) : null}
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="min-h-[48px] rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-3 text-sm font-semibold text-[#05080a] transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ResultCard({
  label,
  title,
  description,
  href
}: {
  label: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 font-display text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-400">{description}</p>
      <Link href={href} className="mt-4 text-sm font-medium text-cyan-300 hover:text-cyan-200">
        {title} →
      </Link>
    </div>
  );
}
