"use client";

import { useEffect, useState } from "react";
import type { ProgramBlueprint } from "@/lib/program-blueprints";
import { ProgramContentLock } from "@/components/program-content-lock";
import type { Locale } from "@/lib/i18n";
import { getProgramQualityPack } from "@/lib/program-quality-copy";
import { cn } from "@/lib/utils";

type Copy = {
  blueprintTrainingDays: string;
  blueprintConditioning: string;
};

function parseRow(line: string): { title: string; detail: string | null } {
  const idx = line.indexOf(":");
  if (idx === -1) return { title: line, detail: null };
  return {
    title: line.slice(0, idx).trim(),
    detail: line.slice(idx + 1).trim() || null
  };
}

function PhaseRows({
  lines,
  isDiet
}: {
  lines: string[];
  isDiet: boolean;
}) {
  return (
    <ul className="space-y-0">
      {lines.map((line, lineIdx) => {
        const { title, detail } = parseRow(line);
        return (
          <li
            key={`${lineIdx}-${line.slice(0, 48)}`}
            className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.04)] py-3.5 transition-[background-color] duration-150 ease-out last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 [@media(hover:hover)]:hover:rounded-lg [@media(hover:hover)]:hover:bg-[rgba(255,255,255,0.02)] [@media(hover:hover)]:hover:px-3"
          >
            <span className="text-[15px] font-semibold text-white">{detail ? title : line}</span>
            {detail ? (
              <span className="text-[13px] font-mono text-muted sm:max-w-[55%] sm:text-end">{detail}</span>
            ) : (
              <span className="text-[12px] italic text-dim sm:max-w-[50%] sm:text-end">
                {isDiet ? "Meal note" : "Session detail"}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PhasePanel({
  phase,
  copy,
  isDiet,
  colA,
  colB
}: {
  phase: ProgramBlueprint["weeklyPhases"][number];
  copy: Copy;
  isDiet: boolean;
  colA: string;
  colB: string;
}) {
  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted">{phase.focus}</p>
      <div>
        <h3 className="border-b border-divider pb-2 font-display text-lg font-semibold text-accent">{colA}</h3>
        <div className="mt-4">
          <PhaseRows lines={phase.trainingDays} isDiet={isDiet} />
        </div>
      </div>
      <div>
        <h3 className="border-b border-divider pb-2 font-display text-lg font-semibold text-accent">{colB}</h3>
        <div className="mt-4">
          <PhaseRows lines={phase.conditioning} isDiet={isDiet} />
        </div>
      </div>
    </div>
  );
}

export function ProgramBlueprintNavigator({
  blueprint,
  copy,
  locale,
  isDiet,
  paidLocked,
  checkoutHref,
  lockTitle,
  lockSubtitle,
  lockCtaLabel,
  safetyTitle
}: {
  blueprint: ProgramBlueprint;
  copy: Copy;
  locale: Locale;
  isDiet: boolean;
  paidLocked: boolean;
  checkoutHref: string;
  lockTitle: string;
  lockSubtitle: string;
  lockCtaLabel: string;
  safetyTitle: string;
}) {
  const phases = blueprint.weeklyPhases;
  const qualityPack = getProgramQualityPack(locale, blueprint, isDiet);
  const [tab, setTab] = useState(0);
  const [contentOn, setContentOn] = useState(true);

  const colA = isDiet ? "Daily structure" : copy.blueprintTrainingDays;
  const colB = isDiet ? "Targets & recovery" : copy.blueprintConditioning;

  useEffect(() => {
    setContentOn(false);
    const t = window.setTimeout(() => setContentOn(true), 20);
    return () => window.clearTimeout(t);
  }, [tab]);

  if (!phases.length) return null;

  const phase = phases[tab] ?? phases[0];
  const lockedTab = paidLocked && tab > 0;

  const inner = <PhasePanel phase={phase} copy={copy} isDiet={isDiet} colA={colA} colB={colB} />;

  return (
    <div className="mt-10 space-y-6">
      <div className="tj-nav-scroll inline-flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-[10px] border border-divider bg-surface p-1.5">
        {phases.map((p, i) => (
          <button
            key={p.title}
            type="button"
            title={p.title}
            onClick={() => setTab(i)}
            className={cn(
              "min-h-[44px] max-w-[min(100%,11rem)] truncate rounded-lg px-4 py-2 text-left text-[13px] font-medium transition-[color,background-color,border-color,box-shadow] duration-200 ease-out sm:min-h-0",
              tab === i
                ? "border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.10)] text-accent"
                : "border border-transparent text-dim hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "transition-[opacity,transform] duration-[250ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100",
          contentOn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        {lockedTab ? (
          <ProgramContentLock
            locked
            title={lockTitle}
            subtitle={lockSubtitle}
            ctaHref={checkoutHref}
            ctaLabel={lockCtaLabel}
          >
            <div className="p-4">{inner}</div>
          </ProgramContentLock>
        ) : (
          inner
        )}
      </div>

      {!lockedTab ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-divider bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-dim">{qualityPack.standardsTitle}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {qualityPack.standards.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-divider bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-dim">{qualityPack.checkinsTitle}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {qualityPack.checkins.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {blueprint.safety.length > 0 && !paidLocked ? (
        <div className="rounded-2xl border border-divider bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-dim">{safetyTitle}</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {blueprint.safety.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
