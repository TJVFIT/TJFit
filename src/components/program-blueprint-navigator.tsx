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
            className="flex flex-col gap-1 border-b border-white/[0.04] py-3 transition-colors duration-150 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <span className="text-[14px] font-medium text-white">{detail ? title : line}</span>
            {detail ? (
              <span className="font-mono text-[12px] text-white/55 sm:max-w-[58%] sm:text-end">{detail}</span>
            ) : (
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/35 sm:max-w-[40%] sm:text-end">
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
    <div className="mt-10 space-y-8">
      {/* Phase timeline header */}
      <div className="tj-nav-scroll flex max-w-full flex-nowrap gap-0 overflow-x-auto border-b border-white/[0.06]">
        {phases.map((p, i) => (
          <button
            key={p.title}
            type="button"
            title={p.title}
            onClick={() => setTab(i)}
            className={cn(
              "relative inline-flex min-h-[44px] shrink-0 items-center gap-2 px-4 py-3 text-left text-[13px] font-medium transition-colors duration-150 sm:px-5",
              tab === i ? "text-white" : "text-white/45 hover:text-white/80"
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="max-w-[10rem] truncate">{p.title}</span>
            {tab === i ? (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-[2px] rounded-t bg-accent"
              />
            ) : null}
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
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] md:grid-cols-2">
          <div className="bg-[#0C0D10] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              {qualityPack.standardsTitle}
            </p>
            <ul className="mt-3 space-y-1.5 text-[13px] leading-[1.55] text-white/75">
              {qualityPack.standards.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-px w-3 shrink-0 bg-white/25" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0C0D10] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              {qualityPack.checkinsTitle}
            </p>
            <ul className="mt-3 space-y-1.5 text-[13px] leading-[1.55] text-white/75">
              {qualityPack.checkins.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-px w-3 shrink-0 bg-white/25" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {blueprint.safety.length > 0 && !paidLocked ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#0C0D10] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{safetyTitle}</p>
          <ul className="mt-3 space-y-1.5 text-[13px] leading-[1.55] text-white/75">
            {blueprint.safety.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-px w-3 shrink-0 bg-amber-300/60" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
