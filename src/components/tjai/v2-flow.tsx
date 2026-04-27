"use client";

import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";
import {
  getTjaiV2Stage1Steps,
  getTjaiV2Stage2Steps,
  getTjaiV2Stage3Steps
} from "@/lib/tjai-v2-intake";
import type {
  V2Diet,
  V2Grocery,
  V2Macros,
  V2Plan,
  V2Recipe,
  V2Supplements,
  V2Workout
} from "@/lib/tjai/v2-plan-schema";
import type { QuizAnswers, QuizStep } from "@/lib/tjai-types";
import { cn } from "@/lib/utils";

type Stage = "persona" | "personal" | "local" | "health" | "complete";

const STAGE_ORDER: Stage[] = ["persona", "personal", "local", "health", "complete"];
const STAGE_LABEL: Record<Stage, string> = {
  persona: "1 · Coach style",
  personal: "1 · About you",
  local: "2 · Your area",
  health: "3 · Health",
  complete: "Plan"
};

export function TJAIV2Flow({ locale }: { locale: Locale }) {
  const [stage, setStage] = useState<Stage>("persona");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing intake on mount.
  useEffect(() => {
    fetch("/api/tjai/intake-v2", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          if (data.persona) setAnswers((prev) => ({ ...prev, persona: data.persona }));
          if (data.answers) setAnswers((prev) => ({ ...prev, ...data.answers }));
          if (data.stage && STAGE_ORDER.includes(data.stage)) setStage(data.stage);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stage1 = useMemo(() => getTjaiV2Stage1Steps(locale), [locale]);
  const stage2 = useMemo(() => getTjaiV2Stage2Steps(locale), [locale]);
  const stage3 = useMemo(() => getTjaiV2Stage3Steps(locale), [locale]);

  const stagePersonaSteps = stage1.filter((s) => s.stage === "persona");
  const stagePersonalSteps = stage1.filter((s) => s.stage === "personal");

  if (loading) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-8">
      {/* Stage indicator */}
      <nav aria-label="Stages" className="flex flex-wrap gap-2 text-[11px] font-medium tracking-tight">
        {STAGE_ORDER.map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-full border px-3 py-1.5 transition-colors",
              stage === s
                ? "border-accent/50 bg-accent/10 text-accent"
                : STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(s)
                  ? "border-white/15 bg-white/[0.04] text-white/55"
                  : "border-white/[0.08] text-white/35"
            )}
          >
            {STAGE_LABEL[s]}
          </span>
        ))}
      </nav>

      {stage === "persona" ? (
        <StageRenderer
          title="Pick your coach style"
          steps={stagePersonaSteps}
          answers={answers}
          onChange={setAnswers}
          onNext={async () => {
            setSaving(true);
            await saveStage("personal", answers);
            setSaving(false);
            setStage("personal");
          }}
          saving={saving}
          canNext={Boolean(answers.persona)}
        />
      ) : null}

      {stage === "personal" ? (
        <StageRenderer
          title="About you"
          steps={stagePersonalSteps}
          answers={answers}
          onChange={setAnswers}
          onBack={() => setStage("persona")}
          onNext={async () => {
            setSaving(true);
            await saveStage("local", answers);
            setSaving(false);
            setStage("local");
          }}
          saving={saving}
          canNext={requiredFilled(stagePersonalSteps, answers)}
        />
      ) : null}

      {stage === "local" ? (
        <StageRenderer
          title="Your area"
          steps={stage2}
          answers={answers}
          onChange={setAnswers}
          onBack={() => setStage("personal")}
          onNext={async () => {
            setSaving(true);
            await saveStage("health", answers);
            setSaving(false);
            setStage("health");
          }}
          saving={saving}
          canNext={requiredFilled(stage2, answers)}
        />
      ) : null}

      {stage === "health" ? (
        <StageRenderer
          title="Health & safety"
          steps={stage3}
          answers={answers}
          onChange={setAnswers}
          onBack={() => setStage("local")}
          onNext={async () => {
            setSaving(true);
            await saveStage("complete", answers);
            setSaving(false);
            setStage("complete");
          }}
          saving={saving}
          canNext={requiredFilled(stage3, answers)}
          nextLabel="Continue to plan"
        />
      ) : null}

      {stage === "complete" ? <PlanGenerator locale={locale} /> : null}
    </div>
  );
}

async function saveStage(nextStage: Stage, answers: QuizAnswers): Promise<void> {
  await fetch("/api/tjai/intake-v2", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stage: nextStage,
      answers,
      persona: typeof answers.persona === "string" ? answers.persona : null
    })
  });
}

function requiredFilled(steps: QuizStep[], answers: QuizAnswers): boolean {
  return steps.every((s) => {
    if (!s.required) return true;
    if (s.showIf) return true; // skip showIf-gated for simplicity
    const v = answers[s.id];
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
}

// ───────────────────────────────────────────────────────────────────
// STAGE RENDERER
// ───────────────────────────────────────────────────────────────────

function StageRenderer({
  title,
  steps,
  answers,
  onChange,
  onNext,
  onBack,
  canNext,
  saving,
  nextLabel
}: {
  title: string;
  steps: QuizStep[];
  answers: QuizAnswers;
  onChange: (a: QuizAnswers) => void;
  onNext: () => void;
  onBack?: () => void;
  canNext: boolean;
  saving: boolean;
  nextLabel?: string;
}) {
  const visible = steps.filter((s) => evalShowIf(s, answers));

  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
      <div className="mt-6 space-y-7">
        {visible.map((step) => (
          <Question
            key={step.id}
            step={step}
            value={answers[step.id]}
            onChange={(v) => onChange({ ...answers, [step.id]: v })}
          />
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || saving}
          className={cn(
            "rounded-md px-5 py-2 text-sm font-semibold transition",
            canNext && !saving
              ? "bg-accent text-[#08080A] hover:brightness-105"
              : "bg-white/[0.04] text-white/35"
          )}
        >
          {saving ? "Saving…" : (nextLabel ?? "Continue →")}
        </button>
      </div>
    </section>
  );
}

function evalShowIf(step: QuizStep, answers: QuizAnswers): boolean {
  if (!step.showIf) return true;
  const mode = step.showIf.mode ?? "all";
  const checks = step.showIf.conditions.map((c) => {
    const a = answers[c.stepId];
    const v = c.value;
    if (c.operator === "not_equals") return a !== v;
    if (c.operator === "includes") return Array.isArray(a) && a.includes(v as string);
    return a === v;
  });
  return mode === "any" ? checks.some(Boolean) : checks.every(Boolean);
}

// ───────────────────────────────────────────────────────────────────
// QUESTION INPUTS
// ───────────────────────────────────────────────────────────────────

function Question({
  step,
  value,
  onChange
}: {
  step: QuizStep;
  value: QuizAnswers[string] | undefined;
  onChange: (v: QuizAnswers[string]) => void;
}) {
  return (
    <div>
      <p className="text-[15px] font-medium text-white">{step.question}</p>
      {step.sub ? <p className="mt-1 text-[13px] text-white/50">{step.sub}</p> : null}
      <div className="mt-3">
        {step.type === "single" ? (
          <SingleSelect step={step} value={value} onChange={onChange} />
        ) : step.type === "multi" ? (
          <MultiSelect step={step} value={value} onChange={onChange} />
        ) : step.type === "text" ? (
          <input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={step.placeholder}
            className="w-full rounded-md border border-white/[0.1] bg-[#0A0B0E] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent/50 focus:outline-none"
          />
        ) : step.type === "number" ? (
          <NumberInput step={step} value={value} onChange={onChange} />
        ) : null}
      </div>
    </div>
  );
}

function SingleSelect({
  step,
  value,
  onChange
}: {
  step: QuizStep;
  value: QuizAnswers[string] | undefined;
  onChange: (v: QuizAnswers[string]) => void;
}) {
  const options = step.options ?? [];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value as string)}
            className={cn(
              "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
              active
                ? "border-accent/50 bg-accent/10 text-white"
                : "border-white/[0.08] bg-white/[0.02] text-white/80 hover:border-white/20"
            )}
          >
            <div>{opt.label}</div>
            {opt.hint ? <div className="mt-0.5 text-[11px] text-white/45">{opt.hint}</div> : null}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({
  step,
  value,
  onChange
}: {
  step: QuizStep;
  value: QuizAnswers[string] | undefined;
  onChange: (v: QuizAnswers[string]) => void;
}) {
  const options = step.options ?? [];
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange([...selected, v]);
  };
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const active = selected.includes(String(opt.value));
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => toggle(String(opt.value))}
            className={cn(
              "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
              active
                ? "border-accent/50 bg-accent/10 text-white"
                : "border-white/[0.08] bg-white/[0.02] text-white/80 hover:border-white/20"
            )}
          >
            <div>{opt.label}</div>
            {opt.hint ? <div className="mt-0.5 text-[11px] text-white/45">{opt.hint}</div> : null}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  step,
  value,
  onChange
}: {
  step: QuizStep;
  value: QuizAnswers[string] | undefined;
  onChange: (v: QuizAnswers[string]) => void;
}) {
  const num = typeof value === "number" ? value : (step.defaultValue ?? step.min ?? 0);
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={step.min ?? 0}
        max={step.max ?? 100}
        step={step.step ?? 1}
        value={num}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-accent"
      />
      <span className="w-20 text-right font-mono text-sm tabular-nums text-white">
        {num} {step.unit ?? ""}
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// PLAN GENERATOR + RENDER
// ───────────────────────────────────────────────────────────────────

function PlanGenerator({ locale: _locale }: { locale: Locale }) {
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<Partial<V2Plan>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);

  const generate = async () => {
    setGenerating(true);
    setPlan({});
    setError(null);
    setDone(false);
    setLogLines([]);

    try {
      const res = await fetch("/api/tjai/plan-v2", { method: "POST", credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        setError(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("No stream returned.");
        setGenerating(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload) as
              | { type: "start"; planId: string }
              | { type: "section"; key: string; data: unknown }
              | { type: "disclaimer"; data: unknown }
              | { type: "error"; message: string }
              | { type: "done"; plan: V2Plan }
              | { type: "saved"; planId: string };
            if (event.type === "section") {
              setPlan((prev) => ({ ...prev, [event.key]: event.data }));
              setLogLines((prev) => [...prev, `Got ${event.key}`]);
            } else if (event.type === "disclaimer") {
              setLogLines((prev) => [...prev, `Disclaimer received`]);
            } else if (event.type === "error") {
              setError(event.message);
            } else if (event.type === "done") {
              setPlan(event.plan);
              setDone(true);
            } else if (event.type === "start") {
              setLogLines((prev) => [...prev, "Starting…"]);
            } else if (event.type === "saved") {
              setLogLines((prev) => [...prev, "Plan saved"]);
            }
          } catch {
            /* ignore malformed event */
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  const showStartButton = !generating && !done && Object.keys(plan).length === 0;

  return (
    <section className="space-y-6">
      {showStartButton ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0C0D10] p-6 text-center sm:p-10">
          <p className="font-display text-xl font-semibold text-white sm:text-2xl">Ready to generate?</p>
          <p className="mt-2 text-sm text-white/55">
            Workout, diet, day-1 recipes, weekly grocery list, and supplement stack.
            Streams live as it generates (~30–60 seconds total).
          </p>
          <button
            type="button"
            onClick={generate}
            className="mt-6 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-[#08080A] hover:brightness-105"
          >
            Generate my plan
          </button>
        </div>
      ) : null}

      {generating || logLines.length > 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0A0B0E] p-4 font-mono text-[11px] text-white/55">
          {logLines.map((l, i) => (
            <div key={i}>· {l}</div>
          ))}
          {generating ? <div className="animate-pulse">· …</div> : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      {plan.macros ? <MacrosCard macros={plan.macros} /> : null}
      {plan.disclaimers && plan.disclaimers.length > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-4 text-sm text-amber-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">Notes</p>
          <ul className="mt-2 space-y-1 text-[13px]">
            {plan.disclaimers.map((d, i) => (
              <li key={i}>· {d.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {plan.workout ? <WorkoutCard workout={plan.workout} /> : null}
      {plan.diet ? <DietCard diet={plan.diet} recipes={plan.recipes} /> : null}
      {plan.grocery ? <GroceryCard grocery={plan.grocery} /> : null}
      {plan.supplements ? <SupplementsCard supplements={plan.supplements} /> : null}

      {done ? (
        <button
          type="button"
          onClick={generate}
          className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
        >
          Regenerate
        </button>
      ) : null}
    </section>
  );
}

function MacrosCard({ macros }: { macros: V2Macros }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Macros</p>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        <Stat label="Target" value={`${macros.targetKcal} kcal`} />
        <Stat label="Protein" value={`${macros.proteinG} g`} />
        <Stat label="Carbs" value={`${macros.carbsG} g`} />
        <Stat label="Fat" value={`${macros.fatG} g`} />
      </div>
      <p className="mt-3 text-[12px] italic text-white/45">{macros.rationale}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 text-[15px] font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

function WorkoutCard({ workout }: { workout: V2Workout }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        Workout · {workout.split} · {workout.daysPerWeek}d/week
      </p>
      <div className="mt-4 space-y-5">
        {workout.phases.map((phase) => (
          <div key={phase.phase}>
            <p className="text-[13px] font-semibold text-white">
              Phase {phase.phase} <span className="text-white/45">· {phase.weeksLabel}</span>
            </p>
            <p className="text-[12px] text-white/55">{phase.focus}</p>
            <div className="mt-2 space-y-2">
              {phase.days.map((day) => (
                <details key={day.day} className="rounded-md border border-white/[0.06] bg-[#0A0B0E] p-3">
                  <summary className="cursor-pointer text-[13px] font-medium">
                    Day {day.day} · {day.label}{" "}
                    <span className="text-white/45">({day.exercises.length} exercises)</span>
                  </summary>
                  <ul className="mt-2 space-y-1 text-[12px] text-white/75">
                    {day.exercises.map((ex, i) => (
                      <li key={i}>
                        <span className="font-medium text-white">{ex.name}</span> ·{" "}
                        {ex.sets}×{ex.reps} @ RPE {ex.rpe}
                        {ex.cue ? <span className="text-white/45"> · {ex.cue}</span> : null}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] italic text-white/50">{workout.progressionRule}</p>
    </div>
  );
}

function DietCard({ diet, recipes }: { diet: V2Diet; recipes?: Record<string, V2Recipe> }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        Diet · {diet.pattern}
      </p>
      {diet.schedule ? <p className="mt-1 text-[12px] text-white/55">{diet.schedule}</p> : null}
      <div className="mt-4 space-y-2">
        {diet.days.map((day) => (
          <details key={day.day} className="rounded-md border border-white/[0.06] bg-[#0A0B0E] p-3">
            <summary className="cursor-pointer text-[13px] font-medium">
              {day.label} <span className="text-white/45">· {day.totalKcal} kcal · {day.totalProteinG}g P</span>
            </summary>
            <ul className="mt-2 space-y-2 text-[12px]">
              {day.meals.map((m, i) => {
                const recipe = m.recipeHash && recipes ? recipes[m.recipeHash] : undefined;
                return (
                  <li key={i} className="text-white/75">
                    <span className="font-medium text-white">{m.slot}:</span> {m.name}{" "}
                    <span className="text-white/40">({m.kcal} kcal · {m.proteinG}g P)</span>
                    {recipe ? (
                      <details className="mt-1 ml-3">
                        <summary className="cursor-pointer text-[11px] text-accent/80">View recipe</summary>
                        <div className="mt-1 text-white/65">
                          <p className="text-[11px]">
                            {recipe.cookTimeMin} min · serves {recipe.servings}
                            {recipe.estCost ? ` · ${recipe.estCost}` : ""}
                          </p>
                          <p className="mt-1 font-medium text-white/85">Ingredients</p>
                          <ul className="ml-3">
                            {recipe.ingredients.map((ing, j) => (
                              <li key={j}>
                                · {ing.quantity} {ing.name}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 font-medium text-white/85">Steps</p>
                          <ol className="ml-3">
                            {recipe.steps.map((s) => (
                              <li key={s.n}>
                                {s.n}. {s.text}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </details>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function GroceryCard({ grocery }: { grocery: V2Grocery }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        Grocery list · week of {grocery.weekOf}
      </p>
      {grocery.estTotalCost ? (
        <p className="mt-1 text-[12px] text-white/55">Estimated: {grocery.estTotalCost}</p>
      ) : null}
      <div className="mt-3 space-y-1 text-[12px] text-white/75">
        {grocery.items.map((item, i) => (
          <div key={i} className="flex items-baseline justify-between gap-2 border-b border-white/[0.04] py-1">
            <div>
              <span
                className={cn(
                  "mr-2 rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
                  item.priority === "must"
                    ? "bg-accent/15 text-accent"
                    : "bg-white/[0.05] text-white/45"
                )}
              >
                {item.priority}
              </span>
              <span className="text-white">{item.name}</span>
              {item.brandHint ? <span className="text-white/40"> · {item.brandHint}</span> : null}
            </div>
            <div className="text-white/55 tabular-nums">{item.quantity}</div>
          </div>
        ))}
      </div>
      {grocery.deliveryLink ? (
        <a
          href={grocery.deliveryLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-md border border-white/15 px-3 py-1.5 text-[12px] text-white/75 hover:border-white/30 hover:text-white"
        >
          Shop online →
        </a>
      ) : null}
    </div>
  );
}

function SupplementsCard({ supplements }: { supplements: V2Supplements }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Supplements</p>
      {supplements.monthlyCostEstimate ? (
        <p className="mt-1 text-[12px] text-white/55">~{supplements.monthlyCostEstimate}/month</p>
      ) : null}
      <div className="mt-3 space-y-3">
        {supplements.items.map((item, i) => (
          <div key={i} className="rounded-md border border-white/[0.05] bg-[#0A0B0E] p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-medium text-white">{item.name}</p>
              <span className="text-[10px] uppercase tracking-wider text-white/40">{item.category}</span>
            </div>
            <p className="mt-1 text-[12px] tabular-nums text-white/65">{item.doseLine}</p>
            {item.rationale ? <p className="mt-1 text-[12px] italic text-white/55">{item.rationale}</p> : null}
            {item.alreadyTaking ? (
              <p className="mt-1 text-[11px] text-emerald-300/80">✓ Already in your stack</p>
            ) : null}
            {item.buyLink ? (
              <a
                href={item.buyLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[11px] text-accent/80 hover:text-accent"
              >
                Find online →
              </a>
            ) : null}
          </div>
        ))}
      </div>
      {supplements.warnings && supplements.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/[0.05] p-3 text-[12px] text-amber-100">
          {supplements.warnings.map((w, i) => (
            <p key={i}>· {w}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
