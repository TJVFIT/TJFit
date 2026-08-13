import { describe, it, expect } from "vitest";

import {
  aggregateCoachEarnings,
  buildProductLabel,
  fetchCoachSaleCommissions,
  fetchProductLabels,
  type SaleCommissionRow
} from "@/lib/coach-earnings";

/**
 * WP-COACH-04 — coach earnings visibility. Payments-adjacent: these tests
 * pin (a) the aggregation math a bug in which would misreport a coach's
 * money, and (b) that the DB read is scoped to the calling coach's own
 * rows only (coach A must never see coach B's commissions).
 */

function row(overrides: Partial<SaleCommissionRow> = {}): SaleCommissionRow {
  return {
    id: overrides.id ?? "sale_1",
    created_at: overrides.created_at ?? "2026-08-01T00:00:00.000Z",
    product_type: overrides.product_type ?? "program",
    product_id: overrides.product_id ?? "11111111-1111-1111-1111-111111111111",
    coach_amount_usd: overrides.coach_amount_usd ?? 10,
    coach_share_pct: overrides.coach_share_pct ?? 75,
    status: overrides.status ?? "paid"
  };
}

describe("aggregateCoachEarnings", () => {
  it("sums paid rows into paidUsd and payable/pending rows into pendingUsd", () => {
    const rows = [
      row({ id: "a", status: "paid", coach_amount_usd: 10 }),
      row({ id: "b", status: "paid", coach_amount_usd: 5 }),
      row({ id: "c", status: "payable", coach_amount_usd: 7 }),
      row({ id: "d", status: "pending", coach_amount_usd: 3 })
    ];
    const summary = aggregateCoachEarnings(rows, () => "label");
    expect(summary.paidUsd).toBe(15);
    expect(summary.pendingUsd).toBe(10);
    expect(summary.totalUsd).toBe(25);
  });

  it("excludes disputed and refunded rows from every total", () => {
    const rows = [
      row({ id: "a", status: "paid", coach_amount_usd: 10 }),
      row({ id: "b", status: "disputed", coach_amount_usd: 99 }),
      row({ id: "c", status: "refunded", coach_amount_usd: 50 })
    ];
    const summary = aggregateCoachEarnings(rows, () => "label");
    expect(summary.paidUsd).toBe(10);
    expect(summary.pendingUsd).toBe(0);
    expect(summary.totalUsd).toBe(10);
    // Still show up in the recent list — coach should see the dispute, just
    // not have it silently counted as money.
    expect(summary.recentCommissions).toHaveLength(3);
    const disputed = summary.recentCommissions.find((c) => c.id === "b");
    expect(disputed?.status).toBe("disputed");
  });

  it("rounds to 2 decimals and never produces floating-point drift", () => {
    const rows = [
      row({ id: "a", status: "paid", coach_amount_usd: 0.1 }),
      row({ id: "b", status: "paid", coach_amount_usd: 0.2 })
    ];
    const summary = aggregateCoachEarnings(rows, () => "label");
    expect(summary.paidUsd).toBe(0.3);
  });

  it("caps recentCommissions at the given limit while totals still cover every row", () => {
    const rows = Array.from({ length: 25 }, (_, i) =>
      row({ id: `s${i}`, status: "paid", coach_amount_usd: 1 })
    );
    const summary = aggregateCoachEarnings(rows, () => "label", 20);
    expect(summary.recentCommissions).toHaveLength(20);
    expect(summary.paidUsd).toBe(25);
  });

  it("maps each recent row through the labelFor callback and preserves the amount/status/pct", () => {
    const rows = [row({ id: "a", coach_amount_usd: 12.5, coach_share_pct: 80, status: "paid" })];
    const summary = aggregateCoachEarnings(rows, (r) => `label-${r.id}`);
    expect(summary.recentCommissions[0]).toEqual({
      id: "a",
      saleDate: "2026-08-01T00:00:00.000Z",
      productLabel: "label-a",
      sharePct: 80,
      shareUsd: 12.5,
      status: "paid"
    });
  });

  it("empty-state path: zero rows produce all-zero totals and an empty list", () => {
    const summary = aggregateCoachEarnings([], () => "label");
    expect(summary).toEqual({
      totalUsd: 0,
      pendingUsd: 0,
      paidUsd: 0,
      recentCommissions: []
    });
  });
});

describe("buildProductLabel", () => {
  it("uses the known title when present", () => {
    const titles = new Map([["11111111-1111-1111-1111-111111111111", "12-Week Recomp"]]);
    const label = buildProductLabel(
      { product_type: "program", product_id: "11111111-1111-1111-1111-111111111111" },
      titles
    );
    expect(label).toBe("12-Week Recomp");
  });

  it("falls back to a kind + short-id label when the title is unknown", () => {
    const label = buildProductLabel(
      { product_type: "diet", product_id: "aabbccdd-1111-1111-1111-111111111111" },
      new Map()
    );
    expect(label).toBe("Diet #aabbccdd");
  });
});

/**
 * Minimal fake of the Supabase query-builder chain used by
 * fetchCoachSaleCommissions / fetchProductLabels: .from().select().eq()
 * .order().limit() and .from().select().in(). Records every filter call so
 * tests can assert exactly what was scoped to the DB, and simulates real
 * row-level filtering so a coach-scoping regression shows up as wrong data,
 * not just a missing .eq() call.
 */
function makeFakeSupabase(allRows: Array<SaleCommissionRow & { coach_id: string }>) {
  const calls: { table: string; eq: Array<[string, string]> }[] = [];

  const client = {
    from(table: string) {
      const eqCalls: Array<[string, string]> = [];
      const record = { table, eq: eqCalls };
      calls.push(record);

      const builder = {
        select() {
          return builder;
        },
        eq(col: string, val: string) {
          eqCalls.push([col, val]);
          return builder;
        },
        in(col: string, vals: string[]) {
          eqCalls.push([col, vals.join(",")]);
          return builder;
        },
        order() {
          return builder;
        },
        limit(n: number) {
          return finish(n);
        },
        // fetchProductLabels awaits the builder directly (no .limit() call).
        then(resolve: (v: unknown) => unknown) {
          return resolve(finish());
        }
      };

      function finish(limit?: number) {
        if (table === "sale_commissions") {
          const coachFilter = eqCalls.find(([col]) => col === "coach_id")?.[1];
          let rows = allRows.filter((r) => r.coach_id === coachFilter);
          rows = rows
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          if (limit !== undefined) rows = rows.slice(0, limit);
          return { data: rows, error: null };
        }
        if (table === "custom_programs") {
          const idsFilter = eqCalls.find(([col]) => col === "id")?.[1] ?? "";
          const ids = new Set(idsFilter.split(",").filter(Boolean));
          const data = allRows
            .filter((r) => ids.has(r.product_id))
            .map((r) => ({ id: r.product_id, title: `title-${r.product_id}` }));
          return { data, error: null };
        }
        return { data: [], error: null };
      }

      return builder;
    }
  };

  return { client, calls };
}

describe("fetchCoachSaleCommissions coach-scoping", () => {
  const coachA = "coach-a-uuid";
  const coachB = "coach-b-uuid";

  const seed = [
    { ...row({ id: "a1", coach_amount_usd: 10, status: "paid" }), coach_id: coachA },
    { ...row({ id: "a2", coach_amount_usd: 20, status: "pending" }), coach_id: coachA },
    { ...row({ id: "b1", coach_amount_usd: 999, status: "paid" }), coach_id: coachB }
  ];

  it("coach A only sees coach A's rows, never coach B's", async () => {
    const { client } = makeFakeSupabase(seed);
    const rows = await fetchCoachSaleCommissions(client as never, coachA);
    expect(rows.map((r) => r.id).sort()).toEqual(["a1", "a2"]);
    expect(rows.some((r) => r.id === "b1")).toBe(false);
  });

  it("coach B only sees coach B's rows, never coach A's", async () => {
    const { client } = makeFakeSupabase(seed);
    const rows = await fetchCoachSaleCommissions(client as never, coachB);
    expect(rows.map((r) => r.id)).toEqual(["b1"]);
  });

  it("filters by coach_id on the sale_commissions table (structural pin on the scoping call)", async () => {
    const { client, calls } = makeFakeSupabase(seed);
    await fetchCoachSaleCommissions(client as never, coachA);
    const call = calls.find((c) => c.table === "sale_commissions");
    expect(call).toBeDefined();
    expect(call?.eq).toContainEqual(["coach_id", coachA]);
  });

  it("an unknown coach id returns no rows (fails closed, not open)", async () => {
    const { client } = makeFakeSupabase(seed);
    const rows = await fetchCoachSaleCommissions(client as never, "someone-else");
    expect(rows).toEqual([]);
  });
});

describe("fetchProductLabels", () => {
  it("returns an empty map without querying when there are no product ids", async () => {
    const { client, calls } = makeFakeSupabase([]);
    const titles = await fetchProductLabels(client as never, []);
    expect(titles.size).toBe(0);
    expect(calls).toHaveLength(0);
  });

  it("looks up titles for the given ids only", async () => {
    const coachA = "coach-a-uuid";
    const seed = [{ ...row({ id: "a1", product_id: "pid-1" }), coach_id: coachA }];
    const { client } = makeFakeSupabase(seed);
    const titles = await fetchProductLabels(client as never, ["pid-1"]);
    expect(titles.get("pid-1")).toBe("title-pid-1");
  });
});

describe("row-sum equals bucket-total (penny-consistency contract)", () => {
  it("3 x 0.237 displays as 3 x $0.24 and the paid total is exactly $0.72", () => {
    const rows = [0.237, 0.237, 0.237].map((amt, i) => row({ id: `r${i}`, status: "paid", coach_amount_usd: amt }));
    const out = aggregateCoachEarnings(rows, () => "P");
    const rowSum = out.recentCommissions.reduce((s, c) => s + Math.round(c.shareUsd * 100), 0);
    expect(out.recentCommissions.map((c) => c.shareUsd)).toEqual([0.24, 0.24, 0.24]);
    expect(Math.round(out.paidUsd * 100)).toBe(rowSum);
    expect(out.paidUsd).toBe(0.72);
  });

  it("mixed buckets: each bucket total equals the sum of its rounded rows", () => {
    const rows = [
      row({ id: "a", status: "paid", coach_amount_usd: 1.005 }),
      row({ id: "b", status: "paid", coach_amount_usd: 2.994 }),
      row({ id: "c", status: "pending", coach_amount_usd: 0.555 }),
      row({ id: "d", status: "payable", coach_amount_usd: 0.444 })
    ];
    const out = aggregateCoachEarnings(rows, () => "P");
    const cents = (n: number) => Math.round(n * 100);
    const paidRowCents = out.recentCommissions.filter((c) => c.status === "paid").reduce((s, c) => s + cents(c.shareUsd), 0);
    const pendingRowCents = out.recentCommissions
      .filter((c) => c.status === "pending" || c.status === "payable")
      .reduce((s, c) => s + cents(c.shareUsd), 0);
    expect(cents(out.paidUsd)).toBe(paidRowCents);
    expect(cents(out.pendingUsd)).toBe(pendingRowCents);
    expect(cents(out.totalUsd)).toBe(paidRowCents + pendingRowCents);
  });
});
