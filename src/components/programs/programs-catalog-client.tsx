"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { ProgramCard } from "@/components/program-card";
import type {
  CatalogGoalFilter,
  CatalogLocationFilter,
  CatalogProgram
} from "@/lib/program-catalog";
import { sortCatalogPrograms, matchesCatalogFilters } from "@/lib/program-catalog";
import { cn } from "@/lib/utils";

type CatalogItem = {
  program: CatalogProgram;
  href: string;
  viewLabel: string;
  priceLabel: string;
  freeBadgeLabel?: string;
};

type FilterOption<T extends string> = {
  label: string;
  value: T;
};

type ProgramsCatalogClientProps = {
  items: CatalogItem[];
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  goalLabel: string;
  locationLabel: string;
  allLabel: string;
  clearLabel: string;
  goalOptions: Array<FilterOption<Exclude<CatalogGoalFilter, "all">>>;
  locationOptions: Array<FilterOption<Exclude<CatalogLocationFilter, "all">>>;
};

type CatalogCardShellProps = {
  children: React.ReactNode;
  index: number;
};

function CatalogCardShell({ children, index }: CatalogCardShellProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      node.dataset.visible = "true";
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        window.setTimeout(() => {
          node.dataset.visible = "true";
        }, index * 60);
        observer.unobserve(node);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      data-visible="false"
      className="h-full translate-y-5 opacity-0 transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
    >
      {children}
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[36px] items-center rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em]",
        "transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.97] motion-reduce:transition-none",
        active
          ? "border-cyan-300/70 bg-cyan-300 text-[#071013] shadow-[0_14px_34px_-22px_rgba(34,211,238,0.9)]"
          : "border-white/[0.09] bg-white/[0.035] text-white/62 hover:border-cyan-300/35 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

function CatalogSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0E0F12]"
          aria-hidden
        >
          <div className="aspect-[16/9] animate-pulse bg-gradient-to-br from-white/[0.08] via-cyan-300/[0.08] to-white/[0.03]" />
          <div className="space-y-4 p-4">
            <div className="h-3 w-20 rounded-full bg-white/[0.08]" />
            <div className="h-5 w-4/5 rounded-full bg-white/[0.1]" />
            <div className="h-3 w-full rounded-full bg-white/[0.07]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-8 rounded-lg bg-white/[0.06]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded-full bg-white/[0.1]" />
              <div className="h-4 w-20 rounded-full bg-cyan-300/[0.14]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgramsCatalogClient({
  items,
  emptyTitle,
  emptyBody,
  emptyCta,
  goalLabel,
  locationLabel,
  allLabel,
  clearLabel,
  goalOptions,
  locationOptions
}: ProgramsCatalogClientProps) {
  const [goal, setGoal] = useState<CatalogGoalFilter>("all");
  const [location, setLocation] = useState<CatalogLocationFilter>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const visibleItems = useMemo(() => {
    return sortCatalogPrograms(
      items
        .map((item) => item.program)
        .filter((program) => matchesCatalogFilters(program, { goal, location, level: "all", freeOnly: false })),
      "featured"
    ).map((program) => items.find((item) => item.program.slug === program.slug)!);
  }, [goal, items, location]);

  const hasFilters = goal !== "all" || location !== "all";

  return (
    <section className="mt-12">
      <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
            <SlidersHorizontal className="h-4 w-4 text-cyan-200/80" aria-hidden />
            {goalLabel}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={goal === "all"} label={allLabel} onClick={() => setGoal("all")} />
            {goalOptions.map((option) => (
              <FilterPill
                key={option.value}
                active={goal === option.value}
                label={option.label}
                onClick={() => setGoal(option.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t border-white/[0.06] pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">{locationLabel}</div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill active={location === "all"} label={allLabel} onClick={() => setLocation("all")} />
            {locationOptions.map((option) => (
              <FilterPill
                key={option.value}
                active={location === option.value}
                label={option.label}
                onClick={() => setLocation(option.value)}
              />
            ))}
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setGoal("all");
                  setLocation("all");
                }}
                className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55 transition-colors duration-200 hover:border-cyan-300/35 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                {clearLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-7" aria-live="polite">
        {!ready ? (
          <CatalogSkeletonGrid />
        ) : visibleItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => (
              <CatalogCardShell key={`${item.program.slug}-${goal}-${location}`} index={index}>
                <ProgramCard
                  program={item.program}
                  href={item.href}
                  viewLabel={item.viewLabel}
                  priceLabel={item.priceLabel}
                  freeBadgeLabel={item.freeBadgeLabel}
                  tierLabel={item.program.display.tierLabel}
                  metaLine={item.program.display.metaLine}
                  trainingGoalBadge={item.program.display.goalBadge}
                  trainingLocationBadge={item.program.display.locationBadge}
                />
              </CatalogCardShell>
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(14,165,233,0.03))] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
              <SlidersHorizontal className="h-6 w-6 text-cyan-100" aria-hidden />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">{emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/58">{emptyBody}</p>
            <button
              type="button"
              onClick={() => {
                setGoal("all");
                setLocation("all");
              }}
              className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-[#071013] transition-transform duration-150 active:scale-[0.97]"
            >
              {emptyCta}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
