"use client";

import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { ProgramBlueprint } from "@/lib/program-blueprints";
import { ProgramContentLock } from "@/components/program-content-lock";
import type { Locale } from "@/lib/i18n";
import { getProgramQualityPack } from "@/lib/program-quality-copy";

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

function PhaseAccordion({
  phase,
  index,
  open,
  onToggle,
  copy,
  isDiet,
  colA,
  colB,
  locked,
  checkoutHref,
  lockTitle,
  lockSubtitle,
  lockCtaLabel
}: {
  phase: ProgramBlueprint["weeklyPhases"][number];
  index: number;
  open: boolean;
  onToggle: () => void;
  copy: Copy;
  isDiet: boolean;
  colA: string;
  colB: string;
  locked: boolean;
  checkoutHref: string;
  lockTitle: string;
  lockSubtitle: string;
  lockCtaLabel: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const inner = <PhasePanel phase={phase} copy={copy} isDiet={isDiet} colA={colA} colB={colB} />;

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setHeight(open ? node.scrollHeight : 0);
  }, [open, phase]);

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/[0.07] bg-[#0C0D10] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
      >
        <span className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mt-1 block truncate font-display text-lg font-semibold tracking-tight text-white">
            {phase.title}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-cyan-100 transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <div
        className="overflow-hidden transition-[height] duration-[320ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
        style={{ height }}
      >
        <div ref={contentRef} className="px-5 pb-5">
          {locked ? (
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
      </div>
    </article>
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
  const [openPhase, setOpenPhase] = useState(0);

  const colA = isDiet ? "Daily structure" : copy.blueprintTrainingDays;
  const colB = isDiet ? "Targets & recovery" : copy.blueprintConditioning;

  if (!phases.length) return null;

  return (
    <div className="mt-10 space-y-8">
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <PhaseAccordion
            key={phase.title}
            phase={phase}
            index={index}
            open={openPhase === index}
            onToggle={() => setOpenPhase((current) => (current === index ? -1 : index))}
            copy={copy}
            isDiet={isDiet}
            colA={colA}
            colB={colB}
            locked={paidLocked && index > 0}
            checkoutHref={checkoutHref}
            lockTitle={lockTitle}
            lockSubtitle={lockSubtitle}
            lockCtaLabel={lockCtaLabel}
          />
        ))}
      </div>

      {!paidLocked ? (
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
                <span className="mt-2 h-px w-3 shrink-0 bg-cyan-300/60" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
