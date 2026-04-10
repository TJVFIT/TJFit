"use client";

import { useEffect, useMemo, useState } from "react";

import { BodySilhouetteSelector } from "@/components/tjai/body-silhouette-selector";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { QuizAnswers, QuizStep, TJAICopy } from "@/lib/tjai-types";

const QUIZ_PROGRESS_KEY = "tjai_quiz_progress";
const QUIZ_PROGRESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const QUIZ_UI_COPY = {
  en: {
    categoryPersonal: "Personal Info",
    categoryBody: "Body Statistics",
    categoryGoal: "Your Goal",
    categoryHistory: "Training History",
    categoryLifestyle: "Lifestyle",
    categoryPrefs: "Preferences",
    categoryFinal: "Final Details",
    resumeTitle: "Resume your TJAI quiz? You left off at question",
    resume: "Resume",
    startOver: "Start Over",
    numbersTitle: "Your Numbers So Far",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Daily Target",
    formula: "Estimates based on Mifflin-St Jeor formula.",
    question: "Question"
  },
  tr: {
    categoryPersonal: "Kisisel Bilgiler",
    categoryBody: "Vucut Olculeri",
    categoryGoal: "Hedefin",
    categoryHistory: "Antrenman Gecmisi",
    categoryLifestyle: "Yasam Tarzi",
    categoryPrefs: "Tercihler",
    categoryFinal: "Son Detaylar",
    resumeTitle: "TJAI testine devam etmek ister misin? Kaldigin soru:",
    resume: "Devam Et",
    startOver: "Bastan Basla",
    numbersTitle: "Simdiki Tahmini Degerlerin",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Gunluk Hedef",
    formula: "Tahminler Mifflin-St Jeor formulune gore hesaplanir.",
    question: "Soru"
  },
  ar: {
    categoryPersonal: "المعلومات الشخصية",
    categoryBody: "قياسات الجسم",
    categoryGoal: "هدفك",
    categoryHistory: "سجل التدريب",
    categoryLifestyle: "نمط الحياة",
    categoryPrefs: "التفضيلات",
    categoryFinal: "التفاصيل النهائية",
    resumeTitle: "هل تريد المتابعة من حيث توقفت؟ توقفت عند السؤال",
    resume: "متابعة",
    startOver: "ابدأ من جديد",
    numbersTitle: "أرقامك الحالية",
    bmr: "BMR",
    tdee: "TDEE",
    target: "الهدف اليومي",
    formula: "تقديرات مبنية على معادلة Mifflin-St Jeor.",
    question: "السؤال"
  },
  es: {
    categoryPersonal: "Informacion Personal",
    categoryBody: "Estadisticas Corporales",
    categoryGoal: "Tu Objetivo",
    categoryHistory: "Historial de Entrenamiento",
    categoryLifestyle: "Estilo de Vida",
    categoryPrefs: "Preferencias",
    categoryFinal: "Detalles Finales",
    resumeTitle: "Quieres continuar tu quiz de TJAI? Te quedaste en la pregunta",
    resume: "Continuar",
    startOver: "Empezar de Nuevo",
    numbersTitle: "Tus Numeros Hasta Ahora",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Objetivo Diario",
    formula: "Estimaciones basadas en la formula de Mifflin-St Jeor.",
    question: "Pregunta"
  },
  fr: {
    categoryPersonal: "Infos Personnelles",
    categoryBody: "Statistiques Corporelles",
    categoryGoal: "Votre Objectif",
    categoryHistory: "Historique d'Entrainement",
    categoryLifestyle: "Mode de Vie",
    categoryPrefs: "Preferences",
    categoryFinal: "Details Finaux",
    resumeTitle: "Reprendre votre quiz TJAI ? Vous etiez a la question",
    resume: "Reprendre",
    startOver: "Recommencer",
    numbersTitle: "Vos Chiffres Actuels",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Objectif Quotidien",
    formula: "Estimations basees sur la formule Mifflin-St Jeor.",
    question: "Question"
  }
} as const;

type Props = {
  locale: Locale;
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

export function TJAIQuiz({ locale, copy, steps, direction, onSubmit, onAnswersChange }: Props) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [idx, setIdx] = useState(0);
  const [showError, setShowError] = useState(false);
  const [shake, setShake] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ currentStep: number; answers: QuizAnswers } | null>(null);
  const [resumeHandled, setResumeHandled] = useState(false);
  const magneticGenerateRef = useMagneticButton<HTMLButtonElement>(0.3);

  const localeKey = locale as keyof typeof QUIZ_UI_COPY;
  const uiCopy = QUIZ_UI_COPY[localeKey] ?? QUIZ_UI_COPY.en;
  const filteredSteps = useMemo(() => steps.filter((step) => !isSkipped(step, answers)), [steps, answers]);
  const total = filteredSteps.length;
  const safeIdx = total > 0 ? Math.min(Math.max(idx, 0), total - 1) : 0;
  const step = filteredSteps[safeIdx];
  const progress = total > 0 ? ((safeIdx + 1) / total) * 100 : 0;

  useEffect(() => {
    if (typeof window === "undefined" || resumeHandled) return;
    const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!raw) {
      setResumeHandled(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { currentStep?: number; answers?: QuizAnswers; savedAt?: number };
      const savedAt = Number(parsed?.savedAt ?? 0);
      if (!savedAt || Date.now() - savedAt > QUIZ_PROGRESS_MAX_AGE_MS) {
        window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
        setResumeHandled(true);
        return;
      }
      const savedStep = Number(parsed?.currentStep ?? 0);
      const savedAnswers = parsed?.answers ?? {};
      if (savedStep > 0 && savedAnswers && typeof savedAnswers === "object") {
        setResumePrompt({ currentStep: savedStep, answers: savedAnswers });
      }
    } catch {
      window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
    } finally {
      setResumeHandled(true);
    }
  }, [resumeHandled]);

  useEffect(() => {
    if (typeof window === "undefined" || !resumeHandled || resumePrompt) return;
    window.localStorage.setItem(
      QUIZ_PROGRESS_KEY,
      JSON.stringify({
        currentStep: idx,
        answers,
        savedAt: Date.now()
      })
    );
  }, [answers, idx, resumeHandled, resumePrompt]);

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

  if (!step) {
    return (
      <section className="relative min-h-[100svh] overflow-hidden bg-[#09090B] px-4 py-6 text-white sm:py-10">
        <div className="mx-auto flex min-h-[50svh] w-full max-w-[640px] items-center justify-center">
          <p className="text-sm text-[#A1A1AA]">Loading quiz...</p>
        </div>
      </section>
    );
  }

  const currentAnswer = answers[step.id];
  const canContinue = !step.required || hasAnswer(step, currentAnswer);

  const questionNumber = safeIdx + 1;
  const categoryLabel =
    questionNumber <= 2
      ? uiCopy.categoryPersonal
      : questionNumber <= 5
        ? uiCopy.categoryBody
        : questionNumber <= 8
          ? uiCopy.categoryGoal
          : questionNumber <= 11
            ? uiCopy.categoryHistory
            : questionNumber <= 14
              ? uiCopy.categoryLifestyle
              : questionNumber <= 17
                ? uiCopy.categoryPrefs
                : uiCopy.categoryFinal;

  const weight = Number(answers.s1_weight ?? 0);
  const height = Number(answers.s1_height ?? 0);
  const age = Number(answers.s1_age ?? 0);
  const sex = String(answers.s1_gender ?? "Male").toLowerCase();
  const goal = String(answers.s2_goal ?? "Lose fat").toLowerCase();
  const activity = String(answers.s4_daily_activity ?? "Moderate");
  const multipliers: Record<string, number> = {
    very_low: 1.2,
    low: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const activityKey = activity.startsWith("Very low")
    ? "very_low"
    : activity.startsWith("Low")
      ? "low"
      : activity.startsWith("Active")
        ? "active"
        : activity.startsWith("Very active")
          ? "very_active"
          : "moderate";
  const bmr =
    weight > 0 && height > 0 && age > 0
      ? sex.includes("male")
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161
      : null;
  const tdee = bmr ? bmr * (multipliers[activityKey] ?? 1.55) : null;
  const targetCalories = tdee
    ? goal.includes("gain")
      ? Math.round(tdee + 300)
      : goal.includes("maintain")
        ? Math.round(tdee)
        : Math.round(tdee - 500)
    : null;

  const goNext = () => {
    if (!canContinue) {
      setShowError(true);
      setShake(true);
      window.setTimeout(() => setShake(false), 320);
      return;
    }
    setShowError(false);
    if (idx >= total - 1) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
      }
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
      const fallbackSingleOptions: Record<string, string[]> = {
        s1_gender: ["Male", "Female", "Prefer not to say"]
      };
      const singleOptions =
        Array.isArray(step.options) && step.options.length > 0 ? step.options : (fallbackSingleOptions[step.id] ?? []);
      if (singleOptions.length === 0) {
        return (
          <div className="rounded-[10px] border border-[#1E2028] bg-[#111215] p-4 text-sm text-[#A1A1AA]">
            This question failed to load options. Please tap Continue to move to the next question.
          </div>
        );
      }
      return (
        <div className="grid gap-3">
          {singleOptions.map((option) => {
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
      const multiOptions = Array.isArray(step.options) ? step.options : [];
      if (multiOptions.length === 0) {
        return (
          <div className="rounded-[10px] border border-[#1E2028] bg-[#111215] p-4 text-sm text-[#A1A1AA]">
            This question failed to load options. Please tap Continue to move to the next question.
          </div>
        );
      }
      const toggle = (option: string) => {
        if (selected.includes(option)) {
          updateAnswer(selected.filter((v) => v !== option));
        } else {
          updateAnswer([...selected, option]);
        }
      };
      return (
        <div className="grid gap-3">
          {multiOptions.map((option) => {
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
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#22D3EE]">
            {uiCopy.question} {questionNumber} of {total} · {categoryLabel}
          </p>
          <div className="h-[2px] overflow-hidden rounded-full bg-[#1E2028]">
            <div
              className="tjai-progress-fill h-full bg-[linear-gradient(90deg,#22D3EE,#A78BFA)]"
              style={{ width: `${progress}%`, marginLeft: direction === "rtl" ? "auto" : undefined }}
            />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#22D3EE]">
            {copy.nav.sectionOf} {step.sectionNumber} / {step.totalSections} - {step.section}
          </p>
        </div>

        {resumePrompt ? (
          <div className="mt-4 rounded-xl border border-[#1E2028] bg-[#111215] p-4">
            <p className="text-sm text-white">{uiCopy.resumeTitle} {resumePrompt.currentStep + 1}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnswers(resumePrompt.answers);
                  setIdx(resumePrompt.currentStep);
                  setResumePrompt(null);
                }}
                className="rounded-full bg-[#22D3EE] px-4 py-2 text-xs font-semibold text-[#09090B]"
              >
                {uiCopy.resume}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
                  }
                  setResumePrompt(null);
                }}
                className="rounded-full border border-[#1E2028] px-4 py-2 text-xs text-[#A1A1AA]"
              >
                {uiCopy.startOver}
              </button>
            </div>
          </div>
        ) : null}

        <aside className="mt-4 rounded-xl border border-[rgba(34,211,238,0.15)] bg-[rgba(34,211,238,0.05)] p-4">
          <p className="text-sm font-semibold text-white">{uiCopy.numbersTitle}</p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-[#1E2028] bg-[#0F1116] p-3">
              <p className="text-xs text-[#A1A1AA]">{uiCopy.bmr}</p>
              <p className="text-lg font-bold text-[#22D3EE]">{bmr ? Math.round(bmr) : "..."} {bmr ? "kcal" : ""}</p>
            </div>
            <div className="rounded-lg border border-[#1E2028] bg-[#0F1116] p-3">
              <p className="text-xs text-[#A1A1AA]">{uiCopy.tdee}</p>
              <p className="text-lg font-bold text-[#22D3EE]">{tdee ? Math.round(tdee) : "..."} {tdee ? "kcal" : ""}</p>
            </div>
            <div className="rounded-lg border border-[#1E2028] bg-[#0F1116] p-3">
              <p className="text-xs text-[#A1A1AA]">{uiCopy.target}</p>
              <p className="text-lg font-bold text-[#22D3EE]">{targetCalories ?? "..."} {targetCalories ? "kcal" : ""}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#A1A1AA]">{uiCopy.formula}</p>
        </aside>

        <div
          key={step.id}
          className="question-enter mt-8 flex-1"
        >
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
              {safeIdx > 0 ? (
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
                ref={safeIdx === total - 1 ? magneticGenerateRef : undefined}
                onClick={goNext}
                disabled={!canContinue}
                className={cn(
                  "min-h-11 rounded-full px-5 text-sm font-bold text-[#09090B] transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  safeIdx === total - 1
                    ? "bg-[linear-gradient(135deg,#22D3EE,#A78BFA)] shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:scale-[1.02] animate-[tjai-pulse_1.8s_ease-in-out_infinite]"
                    : "bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] hover:scale-[1.02]",
                  shake && "animate-[tjai-shake_300ms_ease]"
                )}
              >
                {safeIdx === total - 1 ? copy.nav.generate : copy.nav.continue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

