"use client";

import { useEffect, useMemo, useState } from "react";

import { BodySilhouetteSelector } from "@/components/tjai/body-silhouette-selector";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { cn } from "@/lib/utils";
import type { QuizAnswers, QuizStep, TJAICopy } from "@/lib/tjai-types";

type Props = {
  copy: TJAICopy;
  steps: QuizStep[];
  direction: "ltr" | "rtl";
  onSubmit: (answers: QuizAnswers) => void;
  onAnswersChange?: (answers: QuizAnswers) => void;
};

function isSkipped(step: QuizStep, answers: QuizAnswers): boolean {
  if (!step.skipIf) return false;
  const parent = answers[step.skipIf.stepId];
  if (Array.isArray(step.skipIf.value)) {
    return step.skipIf.value.includes(String(parent ?? ""));
  }
  return String(parent ?? "") === String(step.skipIf.value);
}

function hasAnswer(step: QuizStep, answer: QuizAnswers[string] | undefined): boolean {
  if (step.type === "multi") return Array.isArray(answer) && answer.length > 0;
  if (step.type === "text") return typeof answer === "string" ? answer.trim().length > 0 : !step.required;
  if (step.type === "number" || step.type === "slider" || step.type === "scale") return typeof answer === "number";
  return typeof answer === "string" && answer.trim().length > 0;
}

export function TJAIQuiz({ copy, steps, direction, onSubmit, onAnswersChange }: Props) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [idx, setIdx] = useState(0);
  const [showError, setShowError] = useState(false);
  const [shake, setShake] = useState(false);
  const magneticGenerateRef = useMagneticButton<HTMLButtonElement>(0.3);

  const filteredSteps = useMemo(() => steps.filter((step) => !isSkipped(step, answers)), [steps, answers]);
  const step = filteredSteps[idx];
  const total = filteredSteps.length;
  const progress = total > 0 ? ((idx + 1) / total) * 100 : 0;

  useEffect(() => {
    if (!step) return;
    if (idx > total - 1) setIdx(Math.max(0, total - 1));
  }, [idx, step, total]);

  useEffect(() => {
    if (!step) return;
    if (step.type !== "slider") return;
    if (typeof answers[step.id] === "number") return;
    const min = step.min ?? 0;
    const max = step.max ?? 100;
    const defaultValue = step.defaultValue ?? Math.round((min + max) / 2);
    setAnswers((prev) => ({ ...prev, [step.id]: defaultValue }));
  }, [answers, step]);

  if (!step) return null;

  const currentAnswer = answers[step.id];
  const canContinue = !step.required || hasAnswer(step, currentAnswer);

  const goNext = () => {
    if (!canContinue) {
      setShowError(true);
      setShake(true);
      window.setTimeout(() => setShake(false), 320);
      return;
    }
    setShowError(false);
    if (idx >= total - 1) {
      onSubmit(answers);
      return;
    }
    setIdx((v) => Math.min(total - 1, v + 1));
  };

  const updateAnswer = (value: QuizAnswers[string], autoAdvance = false) => {
    setAnswers((prev) => {
      const next = { ...prev, [step.id]: value };
      onAnswersChange?.(next);
      return next;
    });
    setShowError(false);
    if (autoAdvance) {
      window.setTimeout(() => {
        setIdx((v) => Math.min(total - 1, v + 1));
      }, 400);
    }
  };

  const renderInput = () => {
    if (step.id === "s3_body_silhouette") {
      const currentBody = typeof currentAnswer === "string" ? currentAnswer : undefined;
      return (
        <BodySilhouetteSelector
          gender={typeof answers.s1_gender === "string" ? answers.s1_gender : undefined}
          value={currentBody as "Very Lean" | "Lean" | "Average" | "Overweight" | "Obese" | undefined}
          onSelect={(selection) => {
            setAnswers((prev) => {
              const next = {
                ...prev,
                s3_body_silhouette: selection.bodyType,
                s3_body_type: selection.bodyType,
                s3_estimated_bf: selection.estimatedBF
              };
              onAnswersChange?.(next);
              return next;
            });
            setShowError(false);
            window.setTimeout(() => setIdx((v) => Math.min(total - 1, v + 1)), 500);
          }}
        />
      );
    }

    if (step.type === "single") {
      return (
        <div className="grid gap-3">
          {(step.options ?? []).map((option) => {
            const selected = currentAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateAnswer(option, idx < total - 1)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ease-out",
                  selected
                    ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white"
                    : "border-[#1E2028] bg-[#111215] text-[#A1A1AA] hover:border-[rgba(34,211,238,0.3)] hover:bg-[rgba(34,211,238,0.04)] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "relative inline-flex h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px]",
                    selected ? "border-[#22D3EE] bg-[#22D3EE]" : "border-current"
                  )}
                >
                  {selected ? <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" /> : null}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (step.type === "multi") {
      const selected = Array.isArray(currentAnswer) ? currentAnswer : [];
      const toggle = (option: string) => {
        if (selected.includes(option)) {
          updateAnswer(selected.filter((v) => v !== option));
        } else {
          updateAnswer([...selected, option]);
        }
      };
      return (
        <div className="grid gap-3">
          {(step.options ?? []).map((option) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ease-out",
                  active
                    ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white"
                    : "border-[#1E2028] bg-[#111215] text-[#A1A1AA] hover:border-[rgba(34,211,238,0.3)] hover:bg-[rgba(34,211,238,0.04)] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]",
                    active ? "border-[#22D3EE] bg-[#22D3EE] text-[#09090B]" : "border-current"
                  )}
                >
                  {active ? "✓" : ""}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (step.type === "number") {
      return (
        <div>
          <div className="mb-4 text-center text-5xl font-extrabold text-[#22D3EE]">
            {typeof currentAnswer === "number" ? currentAnswer : "--"}
          </div>
          <div className="relative">
            <input
              type="number"
              min={step.min}
              max={step.max}
              value={typeof currentAnswer === "number" ? currentAnswer : ""}
              onChange={(event) => updateAnswer(Number(event.target.value))}
              className="w-full rounded-[10px] border border-[#1E2028] bg-[#111215] px-4 py-3 text-base text-white outline-none transition-all focus:border-[#22D3EE] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)]"
            />
            <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-[#52525B]">{step.unit}</span>
          </div>
        </div>
      );
    }

    if (step.type === "slider") {
      const min = step.min ?? 0;
      const max = step.max ?? 100;
      const value = typeof currentAnswer === "number" ? currentAnswer : min;
      const pct = ((value - min) / Math.max(1, max - min)) * 100;
      const sliderFill = direction === "rtl" ? `linear-gradient(to left,#22D3EE ${pct}%,#1E2028 ${pct}%)` : `linear-gradient(to right,#22D3EE ${pct}%,#1E2028 ${pct}%)`;
      return (
        <div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-[#22D3EE]">{value}</div>
            <div className="mt-2 text-sm text-[#A1A1AA]">{step.unit}</div>
          </div>
          <div className="mt-6">
            <input
              type="range"
              min={min}
              max={max}
              step={step.step ?? 1}
              value={value}
              onChange={(event) => updateAnswer(Number(event.target.value))}
              className={cn("tjai-slider w-full", direction === "rtl" && "scale-x-[-1]")}
              style={{ background: sliderFill }}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-[#52525B]">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        </div>
      );
    }

    if (step.type === "scale") {
      const value = typeof currentAnswer === "number" ? currentAnswer : 0;
      return (
        <div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }).map((_, i) => {
              const n = i + 1;
              const active = n <= value;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateAnswer(n)}
                  className={cn(
                    "h-10 rounded-full border text-sm transition-all",
                    active ? "border-[#22D3EE] bg-[#22D3EE] text-[#09090B]" : "border-[#1E2028] text-[#A1A1AA] hover:border-[#22D3EE]"
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#52525B]">
            <span>{copy.quiz.notAtAll}</span>
            <span>{copy.quiz.extremely}</span>
          </div>
        </div>
      );
    }

    const textValue = typeof currentAnswer === "string" ? currentAnswer : "";
    return (
      <div>
        <textarea
          value={textValue}
          onChange={(event) => updateAnswer(event.target.value)}
          placeholder={step.placeholder}
          className="min-h-[120px] w-full rounded-xl border border-[#1E2028] bg-[#111215] p-4 text-sm text-white outline-none transition-all placeholder:text-[#52525B] focus:border-[#22D3EE] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)]"
        />
        <div className="mt-2 text-right text-xs text-[#52525B]">
          {textValue.length} {copy.quiz.chars}
        </div>
      </div>
    );
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#09090B] px-4 py-6 text-white sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#22D3EE] opacity-[0.07] blur-[60px]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[400px] w-[400px] rounded-full bg-[#A78BFA] opacity-[0.05] blur-[60px]" />

      <div className="mx-auto flex min-h-[90svh] w-full max-w-[640px] flex-col">
        <div className="pt-1">
          <div className="h-[2px] overflow-hidden rounded-full bg-[#1E2028]">
            <div
              className="h-full bg-[linear-gradient(90deg,#22D3EE,#A78BFA)] transition-[width] duration-[600ms] [transition-timing-function:cubic-bezier(0,0,0.2,1)]"
              style={{ width: `${progress}%`, marginLeft: direction === "rtl" ? "auto" : undefined }}
            />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#22D3EE]">
            {copy.nav.sectionOf} {step.sectionNumber} / {step.totalSections} - {step.section}
          </p>
        </div>

        <div key={step.id} className="mt-8 flex-1 animate-[tjai-step-enter_420ms_ease]">
          <div className="mb-4 text-[11px] uppercase tracking-[0.2em] text-[#22D3EE]">{step.section}</div>
          <h1 className="text-[clamp(1.375rem,3vw,1.75rem)] font-bold leading-[1.3] text-white">{step.question}</h1>
          {step.sub ? <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">{step.sub}</p> : null}
          <div className="mt-7">{renderInput()}</div>
          {showError && !canContinue ? <p className="mt-3 text-sm text-[#EF4444]">{copy.validation.required}</p> : null}
        </div>

        <div className="sticky bottom-0 mt-8 border-t border-[#1E2028]/80 bg-[#09090B]/90 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#52525B]">
              {copy.nav.stepOf} {idx + 1} / {total}
            </span>
            <div className="flex items-center gap-2">
              {idx > 0 ? (
                <button
                  type="button"
                  onClick={() => setIdx((v) => Math.max(0, v - 1))}
                  className="min-h-11 rounded-full border border-[#1E2028] px-4 text-sm text-[#A1A1AA] transition-all hover:border-[rgba(255,255,255,0.2)] hover:text-white"
                >
                  <span className="sm:hidden">{"←"}</span>
                  <span className="hidden sm:inline">{copy.nav.back}</span>
                </button>
              ) : null}
              <button
                type="button"
                ref={idx === total - 1 ? magneticGenerateRef : undefined}
                onClick={goNext}
                disabled={!canContinue}
                className={cn(
                  "min-h-11 rounded-full px-5 text-sm font-bold text-[#09090B] transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  idx === total - 1
                    ? "bg-[linear-gradient(135deg,#22D3EE,#A78BFA)] shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:scale-[1.02] animate-[tjai-pulse_1.8s_ease-in-out_infinite]"
                    : "bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] hover:scale-[1.02]",
                  shake && "animate-[tjai-shake_300ms_ease]"
                )}
              >
                {idx === total - 1 ? copy.nav.generate : copy.nav.continue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

