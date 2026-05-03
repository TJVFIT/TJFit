// v5 — Commission rate resolver (5-level hierarchy, most-specific wins).
//
// Walks `commission_settings` top-down:
//   1. Per-sale override     (rare, manual admin row tagged 'override')
//   2. Per-product custom    (scope='product',     scope_id=productId)
//   3. Per-coach rate        (scope='coach',       scope_id=coachId)
//   4. Per-product-type      (scope='product_type', product_type='program'|'diet')
//   5. Global default        (scope='global')
//
// First match wins. Returns coach %, TJFit %, and which rule fired
// (so `sale_commissions.applied_rule` is fully traceable).

import type { SupabaseClient } from "@supabase/supabase-js";

export type CommissionRule = "override" | "per_product" | "per_coach" | "product_type" | "global";

export type ResolvedCommission = {
  coachPct: number;
  tjfitPct: number;
  ruleSource: CommissionRule;
  ruleId: string;
};

type ScopeRow = {
  id: string;
  coach_share_pct: number;
  tjfit_share_pct: number;
  effective_from: string;
  effective_until: string | null;
};

async function fetchActive(
  supabase: SupabaseClient,
  filters: Record<string, string | null>
): Promise<ScopeRow | null> {
  const now = new Date().toISOString();
  let query = supabase
    .from("commission_settings")
    .select("id, coach_share_pct, tjfit_share_pct, effective_from, effective_until")
    .lte("effective_from", now)
    .or(`effective_until.is.null,effective_until.gte.${now}`);

  for (const [k, v] of Object.entries(filters)) {
    query = v === null ? query.is(k, null) : query.eq(k, v);
  }

  const { data } = await query.order("effective_from", { ascending: false }).limit(1).maybeSingle();
  return (data as ScopeRow | null) ?? null;
}

export async function resolveCommissionRate(
  supabase: SupabaseClient,
  opts: {
    productType: "program" | "diet";
    productId: string;
    coachId: string;
  }
): Promise<ResolvedCommission> {
  // Per-product
  const product = await fetchActive(supabase, {
    scope: "product",
    scope_id: opts.productId
  });
  if (product) {
    return {
      coachPct: product.coach_share_pct,
      tjfitPct: product.tjfit_share_pct,
      ruleSource: "per_product",
      ruleId: product.id
    };
  }

  // Per-coach
  const coach = await fetchActive(supabase, {
    scope: "coach",
    scope_id: opts.coachId
  });
  if (coach) {
    return {
      coachPct: coach.coach_share_pct,
      tjfitPct: coach.tjfit_share_pct,
      ruleSource: "per_coach",
      ruleId: coach.id
    };
  }

  // Per-product-type
  const type = await fetchActive(supabase, {
    scope: "product_type",
    product_type: opts.productType
  });
  if (type) {
    return {
      coachPct: type.coach_share_pct,
      tjfitPct: type.tjfit_share_pct,
      ruleSource: "product_type",
      ruleId: type.id
    };
  }

  // Global default — must exist (seeded in migration).
  const global = await fetchActive(supabase, { scope: "global" });
  if (!global) {
    throw new Error(
      "commission resolver: no global default in commission_settings. Re-run the v5 migration."
    );
  }
  return {
    coachPct: global.coach_share_pct,
    tjfitPct: global.tjfit_share_pct,
    ruleSource: "global",
    ruleId: global.id
  };
}

/** Compute the per-sale split given the resolved rule + sale net. */
export function computeShareUSD(rule: ResolvedCommission, netUsd: number): {
  coachUsd: number;
  tjfitUsd: number;
} {
  const coachUsd = Number(((netUsd * rule.coachPct) / 100).toFixed(2));
  const tjfitUsd = Number(((netUsd * rule.tjfitPct) / 100).toFixed(2));
  return { coachUsd, tjfitUsd };
}
