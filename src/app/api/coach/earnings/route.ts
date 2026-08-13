import { NextResponse } from "next/server";

import { requireCoachOrAdmin } from "@/lib/require-coach-or-admin";
import {
  aggregateCoachEarnings,
  buildProductLabel,
  fetchCoachSaleCommissions,
  fetchProductLabels,
  RECENT_COMMISSIONS_LIMIT
} from "@/lib/coach-earnings";

export const dynamic = "force-dynamic";

// Payments-adjacent, READ-ONLY. No writes to sale_commissions,
// commission_settings, or coach_payouts; no payout initiation. See
// src/lib/coach-earnings.ts for the aggregation + scoping contract.
export async function GET() {
  const auth = await requireCoachOrAdmin();
  if (!auth.ok) return auth.response;

  let rows;
  try {
    // auth.userId is session-derived (never client-supplied) — this is the
    // only thing that scopes a coach to their own rows.
    rows = await fetchCoachSaleCommissions(auth.supabase, auth.userId);
  } catch (err) {
    console.error("[coach/earnings] fetch failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to load earnings" }, { status: 500 });
  }

  const recentSlice = rows.slice(0, RECENT_COMMISSIONS_LIMIT);
  const titles = await fetchProductLabels(
    auth.supabase,
    recentSlice.map((row) => row.product_id)
  );

  const summary = aggregateCoachEarnings(rows, (row) => buildProductLabel(row, titles));
  return NextResponse.json(summary);
}
