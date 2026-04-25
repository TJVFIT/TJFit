"use client";

import { useEffect, useMemo, useState } from "react";

import { TJAICalculating } from "@/components/tjai/tjai-calculating";
import { TJAIQuiz } from "@/components/tjai/tjai-quiz";
import { TJAIResult } from "@/components/tjai/tjai-result";
import { getTJAIAccess } from "@/lib/tjai-access";
import { buildTjaiUserProfile, normalizeQuizAnswers } from "@/lib/tjai-intake";
import { getDirection, type Locale } from "@/lib/i18n";
import { TJAI_ONE_TIME_PRICE_USD } from "@/lib/tjai-pricing";
import { getTjaiAccessCopy } from "@/lib/tjai-access-copy";
import { getTjaiCopy, getTjaiSteps } from "@/lib/tjai-copy";
import { calculateTJAIMetrics } from "@/lib/tjai-science";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";

type Phase = "quiz" | "approach" | "calculating" | "compare" | "result";

export function TJAIShell({
  locale,
  initialAnswers,
  initialPhase = "quiz"
}: {
  locale: Locale;
  initialAnswers?: QuizAnswers;
  initialPhase?: Phase;
}) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers ?? {});
  const [metrics, setMetrics] = useState<TJAIMetrics | null>(null);
  const [plan, setPlan] = useState<TJAIPlan | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState<QuizAnswers>(initialAnswers ?? {});
  const [comparePlans, setComparePlans] = useState<{ moderate: TJAIPlan; aggressive: TJAIPlan } | null>(null);
  const [compareMetrics, setCompareMetrics] = useState<{ moderate: TJAIMetrics; aggressive: TJAIMetrics } | null>(null);
  const [selectedPlanMode, setSelectedPlanMode] = useState<"moderate" | "aggressive">("moderate");
  const [tier, setTier] = useState<"core" | "pro" | "apex">("core");
  const [hasOneTimePlanPurchase, setHasOneTimePlanPurchase] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<QuizAnswers | null>(null);
  const [pendingPace, setPendingPace] = useState<"moderate" | "aggressive" | undefined>(undefined);

  const copy = useMemo(() => getTjaiCopy(locale), [locale]);
  const steps = useMemo(() => getTjaiSteps(locale), [locale]);
  const accessCopy = useMemo(() => getTjaiAccessCopy(locale), [locale]);
  const direction = getDirection(locale);

  useEffect(() => {
    if (!initialAnswers) return;
    setAnswers(initialAnswers);
    setDraftAnswers(initialAnswers);
    setPhase(initialPhase);
  }, [initialAnswers, initialPhase]);

  useEffect(() => {
    void fetch("/api/tjai/access", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setTier((data.tier ?? "core") as "core" | "pro" | "apex");
        setHasOneTimePlanPurchase(Boolean(data.hasOneTimePlanPurchase));
        setRemainingMessages(Number(data.coreTrialMessagesRemaining ?? 0));
      })
      .catch(() => undefined);
  }, []);

  const access = useMemo(
    () =>
      getTJAIAccess(tier, {
        hasOneTimePlanPurchase,
        coreTrialMessagesRemaining: remainingMessages
      }),
    [hasOneTimePlanPurchase, remainingMessages, tier]
  );

  const handleGenerate = async (submittedAnswers: QuizAnswers, paceOverride?: "moderate" | "aggressive") => {
    const normalizedAnswers = normalizeQuizAnswers(submittedAnswers);
    if (!access.canGeneratePlan) {
      setPendingAnswers(normalizedAnswers);
      setPendingPace(paceOverride);
      setShowUpgrade(true);
      return;
    }
    setAnswers(normalizedAnswers);
    setPendingAnswers(normalizedAnswers);
    setPendingPace(paceOverride);
    setGenerateError(null);
    const effective = paceOverride ? normalizeQuizAnswers({ ...normalizedAnswers, s2_pace: paceOverride }) : normalizedAnswers;
    const localMetrics = calculateTJAIMetrics(effective);
    setMetrics(localMetrics);
    setPhase("calculating");

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 150000); // 2.5 min max
      let response: Response;
      try {
        response = await fetch("/api/tjai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: normalizedAnswers, paceOverride }),
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeout);
      }
      const data = await response.json();
      if (!response.ok) {
        const errMsg = data?.error ?? "Plan generation failed. Please try again.";
        console.error("[TJAI] generate error:", errMsg);
        setGenerateError(errMsg);
        return; // Stay on calculating phase, show error overlay
      }
      setPlan(data.plan as TJAIPlan);
      setMetrics((data.metrics as TJAIMetrics) ?? localMetrics);
      setGeneratedAt(data.generatedAt ?? new Date().toISOString());
      setGenerateError(null);
      setPhase("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection error. Please check your internet and try again.";
      console.error("[TJAI] generate client error:", msg);
      setGenerateError(msg);
    }
  };

  const handleCompareBoth = async (submittedAnswers: QuizAnswers) => {
    const normalizedAnswers = normalizeQuizAnswers(submittedAnswers);
    if (!access.canGeneratePlan) {
      setPendingAnswers(normalizedAnswers);
      setShowUpgrade(true);
      return;
    }
    setPhase("calculating");
    try {
      const [moderateRes, aggressiveRes] = await Promise.all([
        fetch("/api/tjai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: normalizedAnswers, paceOverride: "moderate" })
        }),
        fetch("/api/tjai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: normalizedAnswers, paceOverride: "aggressive" })
        })
      ]);
      const moderateData = await moderateRes.json();
      const aggressiveData = await aggressiveRes.json();
      if (!moderateRes.ok || !aggressiveRes.ok) throw new Error("Compare generation failed");
      setComparePlans({ moderate: moderateData.plan as TJAIPlan, aggressive: aggressiveData.plan as TJAIPlan });
      setCompareMetrics({ moderate: moderateData.metrics as TJAIMetrics, aggressive: aggressiveData.metrics as TJAIMetrics });
      setAnswers(normalizedAnswers);
      setGeneratedAt(new Date().toISOString());
      setPhase("compare");
    } catch {
      setPhase("approach");
    }
  };

  const handleSave = async (planOverride?: TJAIPlan) => {
    if (!plan || !metrics || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tjai/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planOverride ?? plan, answers, metrics })
      });
      if (!response.ok) throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStartOver = () => {
    setPhase("quiz");
    setPlan(null);
    setMetrics(null);
    setGeneratedAt("");
    setAnswers({});
    setDraftAnswers({});
    setComparePlans(null);
    setCompareMetrics(null);
  };

  if (phase === "quiz") {
    return (
      <TJAIQuiz
        locale={locale}
        copy={copy}
        steps={steps}
        direction={direction}
        onAnswersChange={setDraftAnswers}
        onSubmit={(submitted) => {
          setDraftAnswers(normalizeQuizAnswers(submitted));
          setPhase("approach");
        }}
      />
    );
  }

  if (phase === "approach") {
    const normalizedDraft = normalizeQuizAnswers(draftAnswers);
    const moderate = calculateTJAIMetrics({ ...normalizedDraft, s2_pace: "moderate" });
    const aggressive = calculateTJAIMetrics({ ...normalizedDraft, s2_pace: "aggressive" });
    const profile = buildTjaiUserProfile(normalizedDraft);
    const recommendAggressive = profile.pace === "aggressive" && profile.experienceLevel !== "beginner" && profile.stressLevel !== "very_high";
    return (
      <section className="min-h-[100svh] bg-background px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Almost there</p>
          <h2 className="mt-2 text-3xl font-bold">{accessCopy.approachTitle}</h2>
          <p className="mt-2 text-sm text-muted">{accessCopy.approachSub}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-divider bg-surface p-4 sm:grid-cols-4">
            {[
              { label: "BMR", value: `${moderate.bmr} kcal` },
              { label: "TDEE", value: `${moderate.tdee} kcal` },
              { label: "Protein", value: `${moderate.protein}g` },
              { label: "Goal calories", value: `${moderate.calorieTarget} kcal` }
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-divider p-3 text-center">
                <p className="text-xs text-muted">{s.label}</p>
                <p className="mt-1 font-semibold text-accent">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className={`rounded-xl border p-5 ${!recommendAggressive ? "border-accent bg-[rgba(34,211,238,0.04)]" : "border-divider bg-surface"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-accent">{accessCopy.moderateTitle}</h3>
                {!recommendAggressive && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">RECOMMENDED</span>}
              </div>
              <p className="mt-2 text-sm text-muted">{accessCopy.moderateBody}</p>
              <p className="mt-2 text-xs text-faint">{moderate.weeklyWeightChange} kg/week expected</p>
              <button type="button" className="mt-4 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-[#09090B]" onClick={() => void handleGenerate(normalizedDraft, "moderate")}>
                {accessCopy.moderateCta}
              </button>
            </article>
            <article className={`rounded-xl border p-5 ${recommendAggressive ? "border-accent-violet bg-[rgba(167,139,250,0.04)]" : "border-divider bg-surface"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-accent-violet">{accessCopy.aggressiveTitle}</h3>
                {recommendAggressive && <span className="rounded-full bg-accent-violet/20 px-2 py-0.5 text-[10px] font-bold text-accent-violet">RECOMMENDED</span>}
              </div>
              <p className="mt-2 text-sm text-muted">{accessCopy.aggressiveBody}</p>
              <p className="mt-2 text-xs text-faint">{aggressive.weeklyWeightChange} kg/week expected</p>
              <button type="button" className="mt-4 w-full rounded-full border border-accent-violet px-4 py-2.5 text-sm font-semibold text-bright" onClick={() => void handleGenerate(normalizedDraft, "aggressive")}>
                {accessCopy.aggressiveCta}
              </button>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => void handleCompareBoth(normalizedDraft)} className="rounded-full border border-divider px-5 py-2 text-sm text-muted hover:border-accent hover:text-white">
              {accessCopy.compareCta}
            </button>
            <button type="button" onClick={() => handleStartOver()} className="rounded-full border border-divider px-5 py-2 text-sm text-muted hover:text-white">
              ← Retake Quiz
            </button>
          </div>
        </div>
        {showUpgrade ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-divider bg-surface p-6">
              <h3 className="text-xl font-semibold text-white">{accessCopy.upgrade.title}</h3>
              <p className="mt-2 text-sm text-muted">{accessCopy.upgrade.body}</p>
              <div className="mt-5 grid gap-2">
                <a href={`/${locale}/membership?tjai_onetime=1`} className="btn-primary-shimmer inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-4 py-2 text-sm font-bold text-[#09090B]">
                  {accessCopy.upgrade.oneTime.replace("{price}", String(TJAI_ONE_TIME_PRICE_USD))}
                </a>
                <a href={`/${locale}/membership?tier=pro`} className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-accent px-4 py-2 text-sm font-semibold text-bright">
                  {accessCopy.upgrade.pro}
                </a>
                <a href={`/${locale}/membership?tier=apex`} className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-accent-violet px-4 py-2 text-sm font-semibold text-bright">
                  {accessCopy.upgrade.apex}
                </a>
                <button type="button" onClick={() => setShowUpgrade(false)} className="text-xs text-muted">
                  {accessCopy.upgrade.close}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  if (phase === "calculating") {
    return (
      <div className="relative">
        <TJAICalculating copy={copy} metrics={metrics} done={Boolean(plan) && !generateError} />
        {generateError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0F0A0A] p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Generation Failed</h3>
              <p className="mt-2 text-sm text-muted">{generateError}</p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
                  onClick={() => {
                    if (pendingAnswers) void handleGenerate(pendingAnswers, pendingPace);
                  }}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className="text-sm text-faint hover:text-white"
                  onClick={() => { setGenerateError(null); setPhase("approach"); }}
                >
                  ← Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "compare" && comparePlans && compareMetrics) {
    const profile = buildTjaiUserProfile(answers);
    const recommendation =
      profile.pace === "aggressive" && profile.experienceLevel !== "beginner" && compareMetrics.aggressive.metabolicType === "fast"
        ? "Aggressive"
        : "Moderate";
    return (
      <section className="min-h-[100svh] bg-background px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-divider bg-surface p-5">
            <h2 className="text-2xl font-bold">TJAI Recommendation: {recommendation}</h2>
            <p className="mt-1 text-sm text-muted">Based on your discipline profile and metabolic type.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-divider bg-surface p-4">
              <h3 className="font-semibold text-accent">Moderate Plan</h3>
              <p className="mt-2 text-sm text-muted">Calories: {compareMetrics.moderate.calorieTarget}</p>
              <p className="text-sm text-muted">Weekly change: {compareMetrics.moderate.weeklyWeightChange}</p>
              <button className="mt-3 rounded-full border border-accent px-3 py-1 text-xs" onClick={() => { setPlan(comparePlans.moderate); setMetrics(compareMetrics.moderate); setSelectedPlanMode("moderate"); setPhase("result"); }}>
                Use Moderate Plan
              </button>
            </article>
            <article className="rounded-xl border border-divider bg-surface p-4">
              <h3 className="font-semibold text-accent-violet">Aggressive Plan</h3>
              <p className="mt-2 text-sm text-muted">Calories: {compareMetrics.aggressive.calorieTarget}</p>
              <p className="text-sm text-muted">Weekly change: {compareMetrics.aggressive.weeklyWeightChange}</p>
              <button className="mt-3 rounded-full border border-accent-violet px-3 py-1 text-xs" onClick={() => { setPlan(comparePlans.aggressive); setMetrics(compareMetrics.aggressive); setSelectedPlanMode("aggressive"); setPhase("result"); }}>
                Use Aggressive Plan
              </button>
            </article>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={`rounded-full px-4 py-2 text-sm ${selectedPlanMode === "moderate" ? "bg-accent text-[#09090B]" : "border border-divider text-muted"}`} onClick={() => { setPlan(comparePlans.moderate); setMetrics(compareMetrics.moderate); setSelectedPlanMode("moderate"); }}>
              View Moderate Plan
            </button>
            <button className={`rounded-full px-4 py-2 text-sm ${selectedPlanMode === "aggressive" ? "bg-accent-violet text-[#09090B]" : "border border-divider text-muted"}`} onClick={() => { setPlan(comparePlans.aggressive); setMetrics(compareMetrics.aggressive); setSelectedPlanMode("aggressive"); }}>
              View Aggressive Plan
            </button>
            <button className="rounded-full border border-divider px-4 py-2 text-sm text-muted" onClick={() => setPhase("result")}>
              Continue
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!plan || !metrics) return null;

  return (
    <TJAIResult
      copy={copy}
      plan={plan}
      answers={answers}
      metrics={metrics}
      generatedAt={generatedAt}
      onSave={handleSave}
      onStartOver={handleStartOver}
      isSaving={saving}
      coreLimitedChat={tier === "core"}
      onChatLimitReached={() => setShowUpgrade(true)}
    />
  );
}

