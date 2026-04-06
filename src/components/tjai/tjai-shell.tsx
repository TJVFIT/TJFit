"use client";

import { useEffect, useMemo, useState } from "react";

import { TJAICalculating } from "@/components/tjai/tjai-calculating";
import { TJAIQuiz } from "@/components/tjai/tjai-quiz";
import { TJAIResult } from "@/components/tjai/tjai-result";
import { getDirection, type Locale } from "@/lib/i18n";
import { getTjaiAccessCopy } from "@/lib/tjai-access-copy";
import { getTjaiCopy, getTjaiSteps } from "@/lib/tjai-copy";
import { calculateTJAIMetrics } from "@/lib/tjai-science";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";

type Phase = "quiz" | "approach" | "calculating" | "compare" | "result";

export function TJAIShell({ locale }: { locale: Locale }) {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [metrics, setMetrics] = useState<TJAIMetrics | null>(null);
  const [plan, setPlan] = useState<TJAIPlan | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState<QuizAnswers>({});
  const [comparePlans, setComparePlans] = useState<{ moderate: TJAIPlan; aggressive: TJAIPlan } | null>(null);
  const [compareMetrics, setCompareMetrics] = useState<{ moderate: TJAIMetrics; aggressive: TJAIMetrics } | null>(null);
  const [selectedPlanMode, setSelectedPlanMode] = useState<"moderate" | "aggressive">("moderate");
  const [tier, setTier] = useState<"core" | "pro" | "apex">("core");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const copy = useMemo(() => getTjaiCopy(locale), [locale]);
  const steps = useMemo(() => getTjaiSteps(locale), [locale]);
  const accessCopy = useMemo(() => getTjaiAccessCopy(locale), [locale]);
  const direction = getDirection(locale);

  useEffect(() => {
    void fetch("/api/tjai/trial-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setTier((data.tier ?? "core") as "core" | "pro" | "apex");
      })
      .catch(() => undefined);
  }, []);

  const handleGenerate = async (submittedAnswers: QuizAnswers, paceOverride?: "Moderate" | "Aggressive") => {
    setAnswers(submittedAnswers);
    const effective = paceOverride ? { ...submittedAnswers, s2_pace: paceOverride } : submittedAnswers;
    const localMetrics = calculateTJAIMetrics(effective);
    setMetrics(localMetrics);
    if (tier === "core") {
      setShowUpgrade(true);
      return;
    }
    setPhase("calculating");

    try {
      const response = await fetch("/api/tjai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: submittedAnswers, paceOverride })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to generate plan");
      }
      setPlan(data.plan as TJAIPlan);
      setMetrics((data.metrics as TJAIMetrics) ?? localMetrics);
      setGeneratedAt(data.generatedAt ?? new Date().toISOString());
      setPhase("result");
    } catch {
      setPhase("quiz");
    }
  };

  const handleCompareBoth = async (submittedAnswers: QuizAnswers) => {
    setPhase("calculating");
    try {
      const [moderateRes, aggressiveRes] = await Promise.all([
        fetch("/api/tjai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: submittedAnswers, paceOverride: "Moderate" })
        }),
        fetch("/api/tjai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: submittedAnswers, paceOverride: "Aggressive" })
        })
      ]);
      const moderateData = await moderateRes.json();
      const aggressiveData = await aggressiveRes.json();
      if (!moderateRes.ok || !aggressiveRes.ok) throw new Error("Compare generation failed");
      setComparePlans({ moderate: moderateData.plan as TJAIPlan, aggressive: aggressiveData.plan as TJAIPlan });
      setCompareMetrics({ moderate: moderateData.metrics as TJAIMetrics, aggressive: aggressiveData.metrics as TJAIMetrics });
      setAnswers(submittedAnswers);
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
        copy={copy}
        steps={steps}
        direction={direction}
        onAnswersChange={setDraftAnswers}
        onSubmit={(submitted) => {
          setDraftAnswers(submitted);
          setPhase("approach");
        }}
      />
    );
  }

  if (phase === "approach") {
    const moderate = calculateTJAIMetrics({ ...draftAnswers, s2_pace: "Moderate" });
    const aggressive = calculateTJAIMetrics({ ...draftAnswers, s2_pace: "Aggressive" });
    const discipline = String(draftAnswers.s18_discipline ?? "");
    return (
      <section className="min-h-[100svh] bg-[#09090B] px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold">{accessCopy.approachTitle}</h2>
          <p className="mt-2 text-sm text-[#A1A1AA]">{accessCopy.approachSub}</p>
          <div className="mt-5 rounded-xl border border-[#1E2028] bg-[#111215] p-4">
            <p className="text-sm font-semibold text-white">{accessCopy.metricsTitle}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
              <p className="rounded-lg border border-[#1E2028] p-2 text-center">{accessCopy.metrics.bmr}: {moderate.bmr}</p>
              <p className="rounded-lg border border-[#1E2028] p-2 text-center">{accessCopy.metrics.tdee}: {moderate.tdee}</p>
              <p className="rounded-lg border border-[#1E2028] p-2 text-center">{accessCopy.metrics.protein}: {moderate.protein}</p>
              <p className="rounded-lg border border-[#1E2028] p-2 text-center">{accessCopy.metrics.carbs}: {moderate.carbs}</p>
              <p className="rounded-lg border border-[#1E2028] p-2 text-center">{accessCopy.metrics.fat}: {moderate.fat}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[#22D3EE] bg-[#111215] p-5">
              <h3 className="text-xl font-semibold text-[#22D3EE]">{accessCopy.moderateTitle}</h3>
              <p className="mt-2 text-sm text-[#A1A1AA]">{accessCopy.moderateBody}</p>
              <p className="mt-2 text-sm text-white">Expected weekly change: {moderate.weeklyWeightChange} kg/week</p>
              <button type="button" className="mt-4 rounded-full bg-[#22D3EE] px-4 py-2 text-sm font-bold text-[#09090B]" onClick={() => void handleGenerate(draftAnswers, "Moderate")}>
                {accessCopy.moderateCta}
              </button>
            </article>
            <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
              <h3 className="text-xl font-semibold text-[#A78BFA]">{accessCopy.aggressiveTitle}</h3>
              <p className="mt-2 text-sm text-[#A1A1AA]">{accessCopy.aggressiveBody}</p>
              <p className="mt-2 text-sm text-white">Expected weekly change: {aggressive.weeklyWeightChange} kg/week</p>
              {discipline.startsWith("Low") ? <p className="mt-2 text-xs text-[#EF4444]">Not recommended if discipline is Low.</p> : null}
              <button type="button" className="mt-4 rounded-full border border-[#A78BFA] px-4 py-2 text-sm text-[#D4D4D8]" onClick={() => void handleGenerate(draftAnswers, "Aggressive")}>
                {accessCopy.aggressiveCta}
              </button>
            </article>
          </div>
          <button type="button" onClick={() => void handleCompareBoth(draftAnswers)} className="mt-6 rounded-full border border-[#1E2028] px-5 py-2 text-sm text-[#A1A1AA] hover:border-[#22D3EE] hover:text-white">
            {accessCopy.compareCta}
          </button>
        </div>
        {showUpgrade ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
              <h3 className="text-xl font-semibold text-white">{accessCopy.upgrade.title}</h3>
              <p className="mt-2 text-sm text-[#A1A1AA]">{accessCopy.upgrade.body}</p>
              <div className="mt-5 grid gap-2">
                <a href={`/${locale}/membership?tier=pro`} className="btn-primary-shimmer inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-4 py-2 text-sm font-bold text-[#09090B]">
                  {accessCopy.upgrade.pro}
                </a>
                <a href={`/${locale}/membership?tier=apex`} className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#A78BFA] px-4 py-2 text-sm font-semibold text-[#D4D4D8]">
                  {accessCopy.upgrade.apex}
                </a>
                <button type="button" onClick={() => setShowUpgrade(false)} className="text-xs text-[#A1A1AA]">
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
    return <TJAICalculating copy={copy} metrics={metrics} done={Boolean(plan)} />;
  }

  if (phase === "compare" && comparePlans && compareMetrics) {
    const recommendation =
      String(answers.s18_discipline ?? "").startsWith("High") && compareMetrics.aggressive.metabolicType === "fast" ? "Aggressive" : "Moderate";
    return (
      <section className="min-h-[100svh] bg-[#09090B] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h2 className="text-2xl font-bold">TJAI Recommendation: {recommendation}</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">Based on your discipline profile and metabolic type.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-4">
              <h3 className="font-semibold text-[#22D3EE]">Moderate Plan</h3>
              <p className="mt-2 text-sm text-[#A1A1AA]">Calories: {compareMetrics.moderate.calorieTarget}</p>
              <p className="text-sm text-[#A1A1AA]">Weekly change: {compareMetrics.moderate.weeklyWeightChange}</p>
              <button className="mt-3 rounded-full border border-[#22D3EE] px-3 py-1 text-xs" onClick={() => { setPlan(comparePlans.moderate); setMetrics(compareMetrics.moderate); setSelectedPlanMode("moderate"); setPhase("result"); }}>
                Use Moderate Plan
              </button>
            </article>
            <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-4">
              <h3 className="font-semibold text-[#A78BFA]">Aggressive Plan</h3>
              <p className="mt-2 text-sm text-[#A1A1AA]">Calories: {compareMetrics.aggressive.calorieTarget}</p>
              <p className="text-sm text-[#A1A1AA]">Weekly change: {compareMetrics.aggressive.weeklyWeightChange}</p>
              <button className="mt-3 rounded-full border border-[#A78BFA] px-3 py-1 text-xs" onClick={() => { setPlan(comparePlans.aggressive); setMetrics(compareMetrics.aggressive); setSelectedPlanMode("aggressive"); setPhase("result"); }}>
                Use Aggressive Plan
              </button>
            </article>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={`rounded-full px-4 py-2 text-sm ${selectedPlanMode === "moderate" ? "bg-[#22D3EE] text-[#09090B]" : "border border-[#1E2028] text-[#A1A1AA]"}`} onClick={() => { setPlan(comparePlans.moderate); setMetrics(compareMetrics.moderate); setSelectedPlanMode("moderate"); }}>
              View Moderate Plan
            </button>
            <button className={`rounded-full px-4 py-2 text-sm ${selectedPlanMode === "aggressive" ? "bg-[#A78BFA] text-[#09090B]" : "border border-[#1E2028] text-[#A1A1AA]"}`} onClick={() => { setPlan(comparePlans.aggressive); setMetrics(compareMetrics.aggressive); setSelectedPlanMode("aggressive"); }}>
              View Aggressive Plan
            </button>
            <button className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-[#A1A1AA]" onClick={() => setPhase("result")}>
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

