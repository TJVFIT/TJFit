"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ProgramSummary = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  duration: string;
};

type Answers = {
  safety: "clear" | "review" | "";
  goal: "fat-loss" | "strength" | "nutrition" | "";
  location: "home" | "gym" | "either" | "";
  level: "beginner" | "intermediate" | "advanced" | "";
};

const initialAnswers: Answers = {
  safety: "",
  goal: "",
  location: "",
  level: ""
};

export function FitnessQuiz({
  locale,
  programs
}: {
  locale: Locale;
  programs: ProgramSummary[];
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const reduceMotion = useReducedMotion();

  const steps = [
    {
      key: "safety" as const,
      eyebrow: "01 / safety gate",
      title: "Before we match a plan, is medical clearance needed?",
      description:
        "Choose review if you have unexplained chest pain, fainting, a recent major procedure, a condition affected by exercise, or were told to seek clearance before training.",
      options: [
        { value: "clear", label: "No known reason to pause", note: "Continue to training goals" },
        { value: "review", label: "I should get professional clearance", note: "TJFit will pause recommendations" }
      ]
    },
    {
      key: "goal" as const,
      eyebrow: "02 / primary goal",
      title: "What should the next twelve weeks do?",
      description: "Pick the one result that matters most right now.",
      options: [
        { value: "fat-loss", label: "Reduce body fat", note: "Conditioning and sustainable output" },
        { value: "strength", label: "Build muscle and strength", note: "Progressive overload and recovery" },
        { value: "nutrition", label: "Fix nutrition structure", note: "Meal planning and consistent intake" }
      ]
    },
    {
      key: "location" as const,
      eyebrow: "03 / training reality",
      title: "Where can you train consistently?",
      description: "The best plan is the one your week can actually support.",
      options: [
        { value: "home", label: "At home", note: "Bodyweight or minimal equipment" },
        { value: "gym", label: "In a gym", note: "Full equipment access" },
        { value: "either", label: "Either works", note: "Match on goal first" }
      ]
    },
    {
      key: "level" as const,
      eyebrow: "04 / experience",
      title: "How much structured training have you done?",
      description: "This adjusts complexity and starting intensity.",
      options: [
        { value: "beginner", label: "Starting or returning", note: "Technique and repeatable foundations" },
        { value: "intermediate", label: "Training consistently", note: "Progression with more volume" },
        { value: "advanced", label: "Experienced", note: "Higher workload and tighter recovery" }
      ]
    }
  ];

  const selected = answers[steps[step]?.key];
  const isBlocked = answers.safety === "review";
  const isComplete = step >= steps.length;

  const matches = useMemo(() => {
    if (!isComplete || isBlocked) return [];
    return programs
      .map((program) => {
        const haystack = `${program.title} ${program.category} ${program.difficulty}`.toLowerCase();
        let score = 0;
        if (answers.goal === "fat-loss" && program.category.toLowerCase().includes("fat")) score += 5;
        if (answers.goal === "strength" && program.category.toLowerCase().includes("strength")) score += 5;
        if (answers.goal === "nutrition" && program.category.toLowerCase().includes("nutrition")) score += 5;
        if (answers.location === "home" && haystack.includes("home")) score += 3;
        if (answers.location === "gym" && haystack.includes("gym")) score += 3;
        if (answers.location === "either") score += 1;
        if (answers.level === "advanced" && haystack.includes("advanced")) score += 1;
        if (answers.level === "beginner" && !haystack.includes("advanced")) score += 1;
        return { program, score };
      })
      .sort((a, b) => b.score - a.score || a.program.title.localeCompare(b.program.title))
      .slice(0, 3);
  }, [answers, isBlocked, isComplete, programs]);

  const choose = (value: string) => {
    const key = steps[step].key;
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const next = () => {
    if (!selected) return;
    if (step === 0 && answers.safety === "review") return;
    setStep((current) => current + 1);
  };

  const restart = () => {
    setAnswers(initialAnswers);
    setStep(0);
  };

  if (isBlocked) {
    return (
      <div className="rounded-[2rem] border border-accent-soft/20 bg-[#091329] p-6 shadow-inset sm:p-9">
        <ShieldCheck className="h-7 w-7 text-accent-soft" aria-hidden />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
          Recommendation paused
        </p>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Get qualified clearance before choosing a training plan.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
          TJFit will not infer a safe exercise prescription from a high-risk answer. A licensed clinician who understands your situation should decide what is appropriate.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/5"
        >
          <RotateCcw className="h-4 w-4 text-accent-soft" aria-hidden />
          Start again
        </button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#071126]/90 p-6 shadow-inset sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
              Deterministic match / complete
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Your strongest program matches
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              These results come from your answers and TJFit’s program metadata. No medical claims or hidden AI ranking.
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Retake
          </button>
        </div>

        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {matches.map(({ program }, index) => (
            <Link
              key={program.slug}
              href={`/${locale}/programs/${program.slug}`}
              className="group grid gap-4 py-6 transition sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <span className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-white group-hover:text-accent-soft">
                  {program.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">{program.description}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {program.category} / {program.duration}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-accent-soft transition group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const current = steps[step];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#071126]/90 p-5 shadow-inset sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">{current.eyebrow}</p>
        <p className="font-mono text-[10px] tabular-nums text-zinc-500">{step + 1} / {steps.length}</p>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full origin-left rounded-full bg-accent"
          animate={{ scaleX: (step + 1) / steps.length }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.key}
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="mt-8 max-w-2xl font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            {current.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{current.description}</p>

          <div className="mt-7 grid gap-3">
            {current.options.map((option) => {
              const active = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => choose(option.value)}
                  className={cn(
                    "grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border p-4 text-left transition duration-300 sm:p-5",
                    active
                      ? "border-accent-soft/45 bg-accent/10"
                      : "border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-white sm:text-base">{option.label}</span>
                    <span className="mt-1 block text-xs text-zinc-500">{option.note}</span>
                  </span>
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-lg border transition",
                      active ? "border-accent-soft/50 bg-accent text-white" : "border-white/10"
                    )}
                  >
                    {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!selected}
          className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35"
        >
          {step === steps.length - 1 ? "Show matches" : "Continue"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
