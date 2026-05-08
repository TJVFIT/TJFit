"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export type DietGoalFilter = "all" | "fat_loss" | "muscle_gain" | "maintenance";
export type DietLengthFilter = "all" | "4" | "12";

export type DietCatalogItem = {
  slug: string;
  category: string;
  durationWeeks: number;
  goalLabel: string;
  whoFor: string;
  priceUsd: number;
  href: string;
  priceLabel: string;
};

type FilterOption<T extends string> = { label: string; value: T };

type DietsCatalogClientProps = {
  items: DietCatalogItem[];
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  goalLabel: string;
  lengthLabel: string;
  allLabel: string;
  clearLabel: string;
  goalOptions: Array<FilterOption<Exclude<DietGoalFilter, "all">>>;
  lengthOptions: Array<FilterOption<Exclude<DietLengthFilter, "all">>>;
  weeksSuffix: string;
};

const CATEGORY_TO_GOAL: Record<string, Exclude<DietGoalFilter, "all">> = {
  cutting: "fat_loss",
  bulking: "muscle_gain",
  maintenance: "maintenance"
};

function matchesGoal(item: DietCatalogItem, goal: DietGoalFilter): boolean {
  if (goal === "all") return true;
  return CATEGORY_TO_GOAL[item.category] === goal;
}

function matchesLength(item: DietCatalogItem, length: DietLengthFilter): boolean {
  if (length === "all") return true;
  return String(item.durationWeeks) === length;
}

function CardShell({ children, index }: { children: React.ReactNode; index: number }) {
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
        "inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em]",
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

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0E0F12]"
          aria-hidden
        >
          <div className="space-y-4 p-5">
            <div className="h-3 w-20 rounded-full bg-white/[0.08]" />
            <div className="h-5 w-4/5 rounded-full bg-white/[0.1]" />
            <div className="h-3 w-full rounded-full bg-white/[0.07]" />
            <div className="h-3 w-3/4 rounded-full bg-white/[0.06]" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-16 rounded-full bg-white/[0.08]" />
              <div className="h-4 w-20 rounded-full bg-cyan-300/[0.14]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DietsCatalogClient({
  items,
  emptyTitle,
  emptyBody,
  emptyCta,
  goalLabel,
  lengthLabel,
  allLabel,
  clearLabel,
  goalOptions,
  lengthOptions,
  weeksSuffix
}: DietsCatalogClientProps) {
  const [goal, setGoal] = useState<DietGoalFilter>("all");
  const [length, setLength] = useState<DietLengthFilter>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => matchesGoal(item, goal) && matchesLength(item, length)),
    [goal, length, items]
  );

  const hasFilters = goal !== "all" || length !== "all";

  const reset = () => {
    setGoal("all");
    setLength("all");
  };

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
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
            {lengthLabel}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill active={length === "all"} label={allLabel} onClick={() => setLength("all")} />
            {lengthOptions.map((option) => (
              <FilterPill
                key={option.value}
                active={length === option.value}
                label={option.label}
                onClick={() => setLength(option.value)}
              />
            ))}
            {hasFilters ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.035] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/62 transition-colors hover:border-cyan-300/35 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                {clearLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {!ready ? (
          <SkeletonGrid />
        ) : visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0E0F12] p-10 text-center">
            <p className="text-base font-semibold text-white">{emptyTitle}</p>
            <p className="mt-2 text-sm text-white/55">{emptyBody}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-200 transition-colors hover:bg-cyan-300/15"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {emptyCta}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => (
              <CardShell key={item.slug} index={index}>
                <Link
                  href={item.href}
                  className="tj-breathe tj-breathe-diet group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0E0F12] p-5 transition-colors duration-200 hover:border-cyan-300/[0.18]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">
                    {item.category}
                  </p>
                  <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-white">
                    {item.goalLabel}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
                    {item.whoFor}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-faint">
                    <span>
                      {item.durationWeeks} {weeksSuffix}
                    </span>
                    <span className="font-semibold text-white/80">{item.priceLabel}</span>
                  </div>
                </Link>
              </CardShell>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
