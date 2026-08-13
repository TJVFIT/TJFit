// WP-COACH-04 — coach earnings visibility.
//
// Payments-adjacent, READ-ONLY. This module never writes to
// sale_commissions, commission_settings, or coach_payouts, and it never
// initiates a payout. It only aggregates rows the caller already has a
// right to see (scoped to their own coach_id by the route handler via
// requireCoachOrAdmin's session-derived userId — never a client-supplied
// id, so a coach cannot request another coach's rows).
//
// Currency: sale_commissions.coach_amount_usd is stored in USD (see the
// `_usd` column suffix and computeShareUSD in src/lib/gumroad/commission.ts,
// which produces it). This module displays exactly what's stored — no
// conversion, no invented rates.

import type { SupabaseClient } from "@supabase/supabase-js";

export type SaleCommissionStatus = "pending" | "payable" | "paid" | "disputed" | "refunded";

export type SaleCommissionRow = {
  id: string;
  created_at: string;
  product_type: "program" | "diet";
  product_id: string;
  coach_amount_usd: number;
  coach_share_pct: number;
  status: SaleCommissionStatus;
};

export type RecentCommission = {
  id: string;
  saleDate: string;
  productLabel: string;
  sharePct: number;
  shareUsd: number;
  status: SaleCommissionStatus;
};

export type CoachEarningsSummary = {
  totalUsd: number;
  pendingUsd: number;
  paidUsd: number;
  recentCommissions: RecentCommission[];
};

// Caps how many rows a single request aggregates over. Generous enough that
// no real coach hits it today, but bounded so the query can never become
// unbounded as sale_commissions grows.
export const EARNINGS_FETCH_LIMIT = 2000;
export const RECENT_COMMISSIONS_LIMIT = 20;

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Pure aggregation over a coach's sale_commissions rows. Rows must already
 * be scoped to a single coach_id and sorted newest-first (the DB query does
 * both) — this function does not filter or sort, so a caller error there
 * cannot be silently hidden by aggregation.
 *
 * `paid` rows count toward paidUsd; `pending`/`payable` rows count toward
 * pendingUsd; `disputed`/`refunded` rows are excluded from all totals
 * entirely (they are not money the coach can expect). totalUsd is
 * pendingUsd + paidUsd.
 *
 * ROUNDING CONTRACT (adversarial-review must-fix): every amount is rounded
 * to cents PER ROW first, and the bucket totals are sums of those rounded
 * row values. This is a statement view — the rows a coach can see must add
 * up exactly to the totals they can see (3 × $0.237 shows 3 × $0.24 and a
 * $0.72 total, never $0.71). Rounding once at the end produced penny
 * discrepancies between visible rows and visible totals.
 */
export function aggregateCoachEarnings(
  rows: SaleCommissionRow[],
  labelFor: (row: SaleCommissionRow) => string,
  recentLimit: number = RECENT_COMMISSIONS_LIMIT
): CoachEarningsSummary {
  let pendingCents = 0;
  let paidCents = 0;

  for (const row of rows) {
    const amount = Number(row.coach_amount_usd);
    if (!Number.isFinite(amount)) continue;
    // MUST be the same rounding as the per-row display (round2) — two
    // different rounding implementations is exactly how 1.005 becomes 101
    // cents in a row but 100 cents in the bucket.
    const cents = Math.round(round2(amount) * 100);
    if (row.status === "paid") {
      paidCents += cents;
    } else if (row.status === "pending" || row.status === "payable") {
      pendingCents += cents;
    }
    // disputed / refunded: excluded from every total on purpose.
  }

  const recentCommissions: RecentCommission[] = rows.slice(0, recentLimit).map((row) => ({
    id: row.id,
    saleDate: row.created_at,
    productLabel: labelFor(row),
    sharePct: Number(row.coach_share_pct) || 0,
    shareUsd: round2(Number(row.coach_amount_usd) || 0),
    status: row.status
  }));

  return {
    totalUsd: (pendingCents + paidCents) / 100,
    pendingUsd: pendingCents / 100,
    paidUsd: paidCents / 100,
    recentCommissions
  };
}

/** Best-effort human label for a sale row. Falls back to a short id when no title is known. */
export function buildProductLabel(row: Pick<SaleCommissionRow, "product_type" | "product_id">, titles: Map<string, string>): string {
  const title = titles.get(row.product_id);
  if (title && title.trim()) return title.trim();
  const kind = row.product_type === "diet" ? "Diet" : "Program";
  const shortId = row.product_id.slice(0, 8);
  return `${kind} #${shortId}`;
}

/**
 * Fetch a single coach's sale_commissions rows, newest first. `coachId` must
 * be the session-derived caller id (never a client-supplied value) — this is
 * the only scoping boundary between coaches, so callers must not loosen it.
 */
export async function fetchCoachSaleCommissions(
  supabase: SupabaseClient,
  coachId: string,
  limit: number = EARNINGS_FETCH_LIMIT
): Promise<SaleCommissionRow[]> {
  const { data, error } = await supabase
    .from("sale_commissions")
    .select("id,created_at,product_type,product_id,coach_amount_usd,coach_share_pct,status")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`fetchCoachSaleCommissions failed: ${error.message}`);
  }
  return (data ?? []) as SaleCommissionRow[];
}

/** Best-effort title lookup for coach-authored products (custom_programs). Never throws. */
export async function fetchProductLabels(
  supabase: SupabaseClient,
  productIds: string[]
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(productIds)].filter(Boolean);
  const titles = new Map<string, string>();
  if (uniqueIds.length === 0) return titles;

  const { data, error } = await supabase.from("custom_programs").select("id,title").in("id", uniqueIds);
  if (error || !data) return titles;

  for (const row of data as Array<{ id: string; title: string }>) {
    titles.set(row.id, row.title);
  }
  return titles;
}
