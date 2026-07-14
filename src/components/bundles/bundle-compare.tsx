"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getBundleExtrasCopy } from "@/lib/bundle-extras-copy";
import type { BundleGoal } from "@/lib/bundles";
import { getBundlesCopy } from "@/lib/bundles-copy";

/**
 * Minimal serializable facts about a bundle — built server-side in
 * bundles/page.tsx from listBundles() + bundleInsideStats() and shared by
 * the comparison table and the finder quiz.
 */
export type BundleFacts = {
  slug: string;
  /** Localized bundle name (via localizeBundle). */
  name: string;
  goal: BundleGoal;
  /** Localized goal chip label. */
  goalLabel: string;
  weeks: number;
  sessionsPerWeek: number;
  /** Owner-set price. 0 = free. The ONLY source of displayed prices. */
  priceUsd: number;
  difficulty: number;
  difficultyLabel: "beginner" | "intermediate" | "advanced";
  setting: "gym" | "home" | "hybrid";
  recipes: number;
};

export function bundlePriceLabel(priceUsd: number, freeLabel: string): string {
  return priceUsd === 0 ? freeLabel : `$${priceUsd}`;
}

export function BundleCompare({ bundles, locale }: { bundles: BundleFacts[]; locale: string }) {
  const copy = useMemo(() => getBundleExtrasCopy(locale), [locale]);
  const pageCopy = useMemo(() => getBundlesCopy(locale), [locale]);

  return (
    <section aria-labelledby="bundle-compare-heading" className="relative mt-16">
      <h2
        id="bundle-compare-heading"
        className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        {copy.headings.compare}
      </h2>

      {/* Focusable scroll region so keyboard users can pan the wide table. */}
      <div
        role="region"
        aria-labelledby="bundle-compare-heading"
        tabIndex={0}
        className="mt-6 overflow-x-auto rounded-2xl border border-purple-400/20 bg-[linear-gradient(180deg,rgba(8,8,11,0.92),rgba(8,8,11,0.6))] shadow-[0_0_32px_rgba(168,85,247,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300/60"
      >
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th
                scope="col"
                className="sticky start-0 z-[1] bg-[#0b0a11] px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/80"
              >
                {copy.compareTable.bundle}
              </th>
              <HeadCell>{copy.compareTable.goal}</HeadCell>
              <HeadCell>{copy.filters.difficulty}</HeadCell>
              <HeadCell>{copy.filters.equipment}</HeadCell>
              <HeadCell>{copy.statLabels.weeks}</HeadCell>
              <HeadCell>{pageCopy.sessions}</HeadCell>
              <HeadCell>{copy.statLabels.recipes}</HeadCell>
              <HeadCell>{copy.compareTable.price}</HeadCell>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b) => {
              const isFree = b.priceUsd === 0;
              return (
                <tr
                  key={b.slug}
                  className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-purple-300/[0.04]"
                >
                  <th
                    scope="row"
                    className="sticky start-0 z-[1] bg-[#0b0a11] px-4 py-3 text-start font-semibold"
                  >
                    <Link
                      href={`/${locale}/bundles/${b.slug}`}
                      className="rounded text-white transition-colors hover:text-purple-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300/60"
                    >
                      {b.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-bright/85">{b.goalLabel}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex gap-1" aria-hidden>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-3.5 rounded-full ${
                              i <= b.difficulty ? "bg-purple-300/80" : "bg-white/[0.08]"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-xs text-bright/80">
                        {copy.difficultyLabels[b.difficultyLabel]}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bright/85">{copy.settingLabels[b.setting]}</td>
                  <td className="px-4 py-3 tabular-nums text-bright/85">{b.weeks}</td>
                  <td className="px-4 py-3 tabular-nums text-bright/85">{b.sessionsPerWeek}</td>
                  <td className="px-4 py-3 tabular-nums text-bright/85">{b.recipes}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        isFree
                          ? "border border-white/20 bg-white/[0.08] text-white/85"
                          : "border border-purple-300/40 bg-purple-300/[0.12] text-purple-50"
                      }`}
                    >
                      {bundlePriceLabel(b.priceUsd, copy.free)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200/80"
    >
      {children}
    </th>
  );
}
