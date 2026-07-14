"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { bundlePriceLabel, type BundleFacts } from "@/components/bundles/bundle-compare";
import { getBundleExtrasCopy } from "@/lib/bundle-extras-copy";
import type { BundleGoal } from "@/lib/bundles";
import { getBundlesCopy } from "@/lib/bundles-copy";

type GoalAnswer = "loseFat" | "buildMuscle" | "both" | "strength" | "conditioning" | "justStarting";
type ExperienceAnswer = "beginner" | "intermediate" | "advanced";
type SettingAnswer = "gym" | "home" | "either";
type DaysAnswer = 3 | 4 | 5 | 6;

type Answers = {
  goal: GoalAnswer | null;
  experience: ExperienceAnswer | null;
  setting: SettingAnswer | null;
  days: DaysAnswer | null;
};

type CompleteAnswers = {
  goal: GoalAnswer;
  experience: ExperienceAnswer;
  setting: SettingAnswer;
  days: DaysAnswer;
};

const EMPTY_ANSWERS: Answers = { goal: null, experience: null, setting: null, days: null };
const TOTAL_STEPS = 4;

const GOAL_TARGET: Record<GoalAnswer, BundleGoal> = {
  loseFat: "fat-loss",
  buildMuscle: "muscle-gain",
  both: "recomp",
  strength: "strength",
  conditioning: "conditioning",
  justStarting: "foundation"
};

const EXPERIENCE_RANK: Record<ExperienceAnswer, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2
};

/** Deterministic fit score over the real catalogue metadata. */
function scoreBundle(b: BundleFacts, a: CompleteAnswers): number {
  let score = 0;

  const wantedGoal = GOAL_TARGET[a.goal];
  if (b.goal === wantedGoal) score += 4;
  else if (wantedGoal === "recomp" && (b.goal === "fat-loss" || b.goal === "muscle-gain")) score += 2;
  else if ((wantedGoal === "fat-loss" || wantedGoal === "muscle-gain") && b.goal === "recomp") score += 2;

  const gap = Math.abs(EXPERIENCE_RANK[b.difficultyLabel] - EXPERIENCE_RANK[a.experience]);
  if (gap === 0) score += 3;
  else if (gap === 1) score += 1;
  if (a.experience === "beginner" && b.difficulty >= 4) score -= 2;

  if (a.setting === "either") score += 2;
  else if (b.setting === a.setting) score += 3;
  else if (b.setting === "hybrid") score += 2;

  const dayGap = Math.abs(b.sessionsPerWeek - a.days);
  if (dayGap === 0) score += 3;
  else if (dayGap === 1) score += 2;
  else if (dayGap === 2) score += 1;
  if (b.sessionsPerWeek > a.days) score -= 1;

  return score;
}

export function BundleFinder({ bundles, locale }: { bundles: BundleFacts[]; locale: string }) {
  const copy = useMemo(() => getBundleExtrasCopy(locale), [locale]);
  const pageCopy = useMemo(() => getBundlesCopy(locale), [locale]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [showResult, setShowResult] = useState(false);

  const results = useMemo(() => {
    const { goal, experience, setting, days } = answers;
    if (!showResult || !goal || !experience || !setting || !days) return null;
    const ranked = bundles
      .map((b, i) => ({ b, i, score: scoreBundle(b, { goal, experience, setting, days }) }))
      .sort((x, y) => y.score - x.score || x.i - y.i);
    return { best: ranked[0].b, runnerUp: ranked[1].b };
  }, [answers, bundles, showResult]);

  const pick = <K extends keyof Answers>(key: K, value: NonNullable<Answers[K]>) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const goBack = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const restart = () => {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setShowResult(false);
  };

  const questions = [
    copy.quiz.goalQuestion,
    copy.quiz.experienceQuestion,
    copy.quiz.equipmentQuestion,
    copy.quiz.daysQuestion
  ];

  return (
    <section
      aria-labelledby="bundle-finder-heading"
      className="relative mt-16 overflow-hidden rounded-2xl border border-purple-400/20 bg-[linear-gradient(180deg,rgba(8,8,11,0.92),rgba(8,8,11,0.55))] p-6 shadow-[0_0_32px_rgba(168,85,247,0.06)] sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-40 w-64 rtl:left-0 rtl:right-auto"
        style={{
          background: "radial-gradient(60% 70% at 80% 20%, rgba(168,85,247,0.12), transparent 70%)"
        }}
      />

      <h2
        id="bundle-finder-heading"
        className="relative font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        {copy.headings.findYourBundle}
      </h2>

      {!showResult ? (
        <div className="relative mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-200/80">
            {copy.quiz.stepOf(step + 1, TOTAL_STEPS)}
          </p>
          <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
            <div
              className="h-full rounded-full bg-purple-300/70 motion-safe:transition-[width] motion-safe:duration-500"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          {/* Keyed by step so each question replays the fade-up cascade. */}
          <div
            key={step}
            className="mt-6 motion-safe:animate-[tj-fade-up_420ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          >
            <p className="text-base font-semibold text-white sm:text-lg">{questions[step]}</p>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={questions[step]}>
              {step === 0
                ? (Object.keys(copy.quiz.goalOptions) as GoalAnswer[]).map((value) => (
                    <Chip
                      key={value}
                      label={copy.quiz.goalOptions[value]}
                      selected={answers.goal === value}
                      onClick={() => pick("goal", value)}
                    />
                  ))
                : null}
              {step === 1
                ? (["beginner", "intermediate", "advanced"] as ExperienceAnswer[]).map((value) => (
                    <Chip
                      key={value}
                      label={copy.difficultyLabels[value]}
                      selected={answers.experience === value}
                      onClick={() => pick("experience", value)}
                    />
                  ))
                : null}
              {step === 2
                ? (["gym", "home", "either"] as SettingAnswer[]).map((value) => (
                    <Chip
                      key={value}
                      label={value === "either" ? copy.quiz.eitherOption : copy.settingLabels[value]}
                      selected={answers.setting === value}
                      onClick={() => pick("setting", value)}
                    />
                  ))
                : null}
              {step === 3
                ? ([3, 4, 5, 6] as DaysAnswer[]).map((value) => (
                    <Chip
                      key={value}
                      label={copy.quiz.daysValue(value)}
                      selected={answers.days === value}
                      onClick={() => setAnswers((prev) => ({ ...prev, days: value }))}
                    />
                  ))
                : null}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-[40px] items-center rounded-full border border-white/[0.08] px-4 text-xs font-semibold text-bright/80 transition-colors hover:border-purple-300/30 hover:text-purple-100"
              >
                {copy.quiz.back}
              </button>
            ) : null}
            {step === TOTAL_STEPS - 1 ? (
              <button
                type="button"
                disabled={!answers.days}
                onClick={() => setShowResult(true)}
                className="tj-cta-sheen inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-purple-300/45 bg-purple-300/[0.08] px-6 text-sm font-semibold text-purple-50 transition-[border-color,background-color,box-shadow] duration-200 hover:border-purple-300/65 hover:bg-purple-300/[0.14] hover:shadow-[0_0_22px_rgba(168,85,247,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.quiz.seeMatch}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      ) : results ? (
        <div
          key="result"
          className="relative mt-6 motion-safe:animate-[tj-fade-up_420ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
        >
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <ResultCard
              bundle={results.best}
              locale={locale}
              eyebrow={copy.quiz.bestMatch}
              primary
              freeLabel={copy.free}
              detailsLabel={pageCopy.details}
              weeksText={pageCopy.weeksValue(results.best.weeks)}
              sessionsText={pageCopy.sessionsValue(results.best.sessionsPerWeek)}
              settingText={copy.settingLabels[results.best.setting]}
              difficultyText={copy.difficultyLabels[results.best.difficultyLabel]}
            />
            <ResultCard
              bundle={results.runnerUp}
              locale={locale}
              eyebrow={copy.quiz.alsoConsider}
              freeLabel={copy.free}
              detailsLabel={pageCopy.details}
              weeksText={pageCopy.weeksValue(results.runnerUp.weeks)}
              sessionsText={pageCopy.sessionsValue(results.runnerUp.sessionsPerWeek)}
              settingText={copy.settingLabels[results.runnerUp.setting]}
              difficultyText={copy.difficultyLabels[results.runnerUp.difficultyLabel]}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={restart}
              className="inline-flex min-h-[40px] items-center rounded-full border border-white/[0.08] px-4 text-xs font-semibold text-bright/80 transition-colors hover:border-purple-300/30 hover:text-purple-100"
            >
              {copy.quiz.startOver}
            </button>
            <p className="text-xs text-muted">
              {copy.quiz.tjaiPrompt}{" "}
              <Link
                href={`/${locale}/ai`}
                className="font-semibold text-purple-200 underline decoration-purple-300/40 underline-offset-4 transition-colors hover:text-purple-100"
              >
                {copy.quiz.tjaiCta}
              </Link>
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center rounded-full border px-4 py-2 text-sm font-semibold transition-[color,border-color,background-color] motion-safe:transition-all ${
        selected
          ? "tj-chip-active border-purple-300/60 bg-purple-300/[0.12] text-purple-50"
          : "border-white/[0.08] bg-white/[0.02] text-bright/80 hover:border-purple-300/30 hover:text-purple-100"
      }`}
    >
      {label}
    </button>
  );
}

function ResultCard({
  bundle,
  locale,
  eyebrow,
  primary,
  freeLabel,
  detailsLabel,
  weeksText,
  sessionsText,
  settingText,
  difficultyText
}: {
  bundle: BundleFacts;
  locale: string;
  eyebrow: string;
  primary?: boolean;
  freeLabel: string;
  detailsLabel: string;
  weeksText: string;
  sessionsText: string;
  settingText: string;
  difficultyText: string;
}) {
  const isFree = bundle.priceUsd === 0;
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-5 ${
        primary
          ? "border-purple-300/45 bg-purple-300/[0.06] shadow-[0_0_40px_rgba(168,85,247,0.12)]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-200/80">{eyebrow}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
            isFree
              ? "border border-white/20 bg-white/[0.08] text-white/85"
              : "border border-purple-300/40 bg-purple-300/[0.12] text-purple-50"
          }`}
        >
          {bundlePriceLabel(bundle.priceUsd, freeLabel)}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold leading-tight text-white">{bundle.name}</h3>
      <p className="mt-2 text-xs text-bright/80">
        {bundle.goalLabel} · {difficultyText} · {settingText}
      </p>
      <p className="mt-1 text-xs text-muted tabular-nums">
        {weeksText} · {sessionsText}
      </p>
      <div className="mt-auto pt-4">
        <Link
          href={`/${locale}/bundles/${bundle.slug}`}
          className="tj-cta-sheen inline-flex min-h-[40px] items-center gap-1 rounded-full border border-purple-300/20 px-4 py-2 text-xs font-semibold text-purple-200 transition-colors hover:border-purple-300/40 hover:text-purple-100"
        >
          {detailsLabel}
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
