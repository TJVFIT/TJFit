"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { CoachEarningsSummary, SaleCommissionStatus } from "@/lib/coach-earnings";

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function CoachEarningsWidget({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).dashboard.coach;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CoachEarningsSummary | null>(null);

  const statusLabel = useCallback(
    (status: SaleCommissionStatus): string => {
      switch (status) {
        case "pending":
          return d.walletStatusPending;
        case "payable":
          return d.walletStatusPayable;
        case "paid":
          return d.walletStatusPaid;
        case "disputed":
          return d.walletStatusDisputed;
        case "refunded":
          return d.walletStatusRefunded;
        default:
          return status;
      }
    },
    [d]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coach/earnings", { credentials: "include", cache: "no-store" });
      const data = res.ok ? await res.json().catch(() => null) : null;
      setSummary(data && typeof data.totalUsd === "number" ? (data as CoachEarningsSummary) : null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mt-4 space-y-3" aria-busy="true">
        <div className="tj-skeleton tj-shimmer h-16 w-full rounded-[20px]" />
        <div className="tj-skeleton tj-shimmer h-24 w-full rounded-[20px]" />
      </div>
    );
  }

  const isEmpty =
    !summary ||
    (summary.totalUsd === 0 && summary.pendingUsd === 0 && summary.paidUsd === 0 && summary.recentCommissions.length === 0);

  if (isEmpty) {
    return (
      <div className="mt-4">
        <EmptyState subtext={d.walletEmpty} />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-faint">{d.walletTotalLabel}</p>
          <p className="mt-1 tabular-nums text-lg font-semibold text-white">{formatUsd(summary.totalUsd)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-faint">{d.walletPendingLabel}</p>
          <p className="mt-1 tabular-nums text-lg font-semibold text-white">{formatUsd(summary.pendingUsd)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-faint">{d.walletPaidLabel}</p>
          <p className="mt-1 tabular-nums text-lg font-semibold text-white">{formatUsd(summary.paidUsd)}</p>
        </div>
      </div>

      {summary.recentCommissions.length > 0 ? (
        <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-medium text-white">{d.walletRecentTitle}</p>
          <ul className="mt-3 space-y-2">
            {summary.recentCommissions.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-white">{c.productLabel}</p>
                  <p className="text-xs text-faint">{new Date(c.saleDate).toLocaleDateString(locale)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular-nums text-white">{formatUsd(c.shareUsd)}</p>
                  <p className="text-xs text-faint">{statusLabel(c.status)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
