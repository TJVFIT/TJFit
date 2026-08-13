import { describe, it, expect } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { GumroadSale } from "@/lib/gumroad/client";
import {
  handleSale,
  resolveEntitlementSlug,
  resolveSubscriptionPlan,
  computeSubscriptionPeriodEnd,
  type GumroadSalePayload
} from "@/app/api/webhooks/gumroad/handlers/sale";
import {
  handleSubscriptionCancellation,
  handleSubscriptionEvent
} from "@/app/api/webhooks/gumroad/handlers/subscription";
import { handleRefund } from "@/app/api/webhooks/gumroad/handlers/refund";

/**
 * The Gumroad fulfillment trio — the money paths that turn a verified payment
 * into real access:
 *   (1) subscription first-charge  → user_subscriptions.tier grants Pro/Apex
 *   (2) refund / cancellation      → revoke / stop-renew, idempotently
 *   (3) program / diet direct buy  → paid program_orders row (the entitlement)
 *
 * These use a hand-rolled fake Supabase client (records writes, resolves reads
 * from a per-test table) so we can assert on the exact rows written without a
 * live database — the same "assert the effect, not the DB" style the repo uses
 * for its other webhook money tests.
 */

// ---------------------------------------------------------------------------
// Fake Supabase client
// ---------------------------------------------------------------------------

type Op = { method: string; args: unknown[] };
type Result = { data?: unknown; error?: unknown };
type Write = { table: string; op: "insert" | "update" | "upsert"; payload: unknown; ops: Op[] };

function eqMap(ops: Op[]): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  for (const o of ops) if (o.method === "eq") m[String(o.args[0])] = o.args[1];
  return m;
}

class FakeBuilder {
  ops: Op[] = [];
  constructor(
    private table: string,
    private resolve: (table: string, ops: Op[]) => Result,
    private writes: Write[]
  ) {}
  private add(method: string, args: unknown[]) {
    this.ops.push({ method, args });
    return this;
  }
  select(...a: unknown[]) {
    return this.add("select", a);
  }
  eq(...a: unknown[]) {
    return this.add("eq", a);
  }
  in(...a: unknown[]) {
    return this.add("in", a);
  }
  neq(...a: unknown[]) {
    return this.add("neq", a);
  }
  ilike(...a: unknown[]) {
    return this.add("ilike", a);
  }
  order(...a: unknown[]) {
    return this.add("order", a);
  }
  limit(...a: unknown[]) {
    return this.add("limit", a);
  }
  insert(...a: unknown[]) {
    this.add("insert", a);
    this.writes.push({ table: this.table, op: "insert", payload: a[0], ops: this.ops });
    return this;
  }
  update(...a: unknown[]) {
    this.add("update", a);
    this.writes.push({ table: this.table, op: "update", payload: a[0], ops: this.ops });
    return this;
  }
  upsert(...a: unknown[]) {
    this.add("upsert", a);
    this.writes.push({ table: this.table, op: "upsert", payload: a[0], ops: this.ops });
    return this;
  }
  maybeSingle() {
    return Promise.resolve(this.result());
  }
  single() {
    return Promise.resolve(this.result());
  }
  private result(): Result {
    return this.resolve(this.table, this.ops);
  }
  then<T>(onF?: (v: Result) => T, onR?: (e: unknown) => T) {
    return Promise.resolve(this.result()).then(onF, onR);
  }
}

type FakeSpec = {
  resolve: (table: string, ops: Op[]) => Result;
};

function createFakeAdmin(spec: FakeSpec): { admin: SupabaseClient; writes: Write[] } {
  const writes: Write[] = [];
  const client = {
    from(table: string) {
      return new FakeBuilder(table, spec.resolve, writes);
    },
    rpc() {
      return Promise.resolve({ data: null, error: null });
    },
    auth: {
      admin: {
        createUser: () => Promise.resolve({ data: { user: null }, error: null }),
        listUsers: () => Promise.resolve({ data: { users: [] } }),
        generateLink: () => Promise.resolve({ data: null, error: null })
      }
    }
  };
  return { admin: client as unknown as SupabaseClient, writes };
}

const findWrite = (writes: Write[], table: string, op: Write["op"]) =>
  writes.find((w) => w.table === table && w.op === op);

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("resolveSubscriptionPlan", () => {
  it("reads pro/apex + billing mode from url_params", () => {
    expect(
      resolveSubscriptionPlan({ url_params: { tjfit_tier: "pro", tjfit_billing_mode: "monthly" } })
    ).toEqual({ tier: "pro", billingMode: "monthly" });
    expect(
      resolveSubscriptionPlan({ url_params: { tjfit_tier: "apex", tjfit_billing_mode: "annual" } })
    ).toEqual({ tier: "apex", billingMode: "annual" });
  });

  it("is case-insensitive and trims", () => {
    expect(
      resolveSubscriptionPlan({ url_params: { tjfit_tier: " APEX ", tjfit_billing_mode: "Yearly" } })
    ).toEqual({ tier: "apex", billingMode: "annual" });
  });

  it("falls back to Gumroad recurrence for the billing mode", () => {
    expect(resolveSubscriptionPlan({ url_params: { tjfit_tier: "pro" }, recurrence: "yearly" })).toEqual(
      { tier: "pro", billingMode: "annual" }
    );
  });

  it("returns null for a missing or non-paid tier (never grants a wrong tier)", () => {
    expect(resolveSubscriptionPlan({ url_params: {} })).toBeNull();
    expect(resolveSubscriptionPlan({ url_params: { tjfit_tier: "core" } })).toBeNull();
    expect(resolveSubscriptionPlan({ url_params: { tjfit_tier: "free" } })).toBeNull();
  });
});

describe("resolveEntitlementSlug — static catalogs, zero DB reads", () => {
  // Programs and diets have no DB table (static-code catalogs), so slug
  // resolution must never touch Supabase. An admin whose .from() throws
  // makes any regression to a table lookup fail loudly.
  const dbFreeAdmin = {
    from() {
      throw new Error("resolveEntitlementSlug must not query the database");
    }
  } as unknown as SupabaseClient;

  it("a stamped tjfit_program_slug always wins", async () => {
    await expect(
      resolveEntitlementSlug(dbFreeAdmin, "program", "comeback", {
        url_params: { tjfit_program_slug: "recomp" }
      })
    ).resolves.toBe("recomp");
  });

  it("falls back to the static registry keyed by product_id (storefront purchase)", async () => {
    // "comeback" is the one registered program slug (comeback-12w folder).
    await expect(resolveEntitlementSlug(dbFreeAdmin, "program", "comeback", {})).resolves.toBe(
      "comeback"
    );
  });

  it("returns null for a product_id that is not a registered program slug", async () => {
    await expect(
      resolveEntitlementSlug(dbFreeAdmin, "program", "prog-uuid", {})
    ).resolves.toBeNull();
  });

  it("diets have no registry fallback yet", async () => {
    await expect(resolveEntitlementSlug(dbFreeAdmin, "diet", "any-diet", {})).resolves.toBeNull();
  });
});

describe("computeSubscriptionPeriodEnd", () => {
  const start = "2026-01-15T00:00:00.000Z";
  it("adds a month for monthly billing", () => {
    expect(computeSubscriptionPeriodEnd(start, { billingMode: "monthly" })).toBe(
      "2026-02-15T00:00:00.000Z"
    );
  });
  it("adds a year when the Gumroad recurrence is yearly (authoritative over mode)", () => {
    expect(computeSubscriptionPeriodEnd(start, { recurrence: "yearly", billingMode: "monthly" })).toBe(
      "2027-01-15T00:00:00.000Z"
    );
  });
});

// ---------------------------------------------------------------------------
// (1) Subscription fulfillment
// ---------------------------------------------------------------------------

describe("handleSale — subscription first charge", () => {
  const basePayload: GumroadSalePayload = {
    resource_name: "sale",
    sale_id: "sale_sub_1",
    product_id: "gum_pro_monthly",
    email: "buyer@example.com",
    full_name: "Buyer One",
    price: 1200,
    gumroad_fee: 120,
    currency: "USD",
    subscription_id: "gsub_1",
    recurrence: "monthly",
    sale_timestamp: "2026-03-01T00:00:00.000Z",
    url_params: { tjfit_tier: "pro", tjfit_billing_mode: "monthly" }
  };

  const resolve = (table: string): Result => {
    if (table === "product_gumroad_sync")
      return { data: { product_type: "subscription", product_id: "plan-uuid", gumroad_product_id: "gum_pro_monthly" } };
    if (table === "profiles") return { data: { id: "user-sub-1" } };
    if (table === "user_subscriptions") return { data: null, error: null };
    return { data: null };
  };

  it("upserts an active Pro subscription that unlocks premium access", async () => {
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSale(basePayload, admin);
    expect(res.ok).toBe(true);
    expect(res.action).toBe("grant_subscription");

    const sub = findWrite(writes, "user_subscriptions", "upsert");
    expect(sub).toBeTruthy();
    const row = sub!.payload as Record<string, unknown>;
    expect(row.user_id).toBe("user-sub-1");
    expect(row.tier).toBe("pro");
    expect(row.status).toBe("active");
    expect(row.gumroad_subscription_id).toBe("gsub_1");
    // monthly period from the sale timestamp
    expect(row.current_period_end).toBe("2026-04-01T00:00:00.000Z");
    // idempotent on the user_id unique index
    expect((sub!.ops.find((o) => o.method === "upsert")!.args[1] as { onConflict: string }).onConflict).toBe(
      "user_id"
    );
  });

  it("grants Apex with a yearly period for an annual checkout", async () => {
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSale(
      { ...basePayload, recurrence: "yearly", url_params: { tjfit_tier: "apex", tjfit_billing_mode: "annual" } },
      admin
    );
    expect(res.ok).toBe(true);
    const row = findWrite(writes, "user_subscriptions", "upsert")!.payload as Record<string, unknown>;
    expect(row.tier).toBe("apex");
    expect(row.current_period_end).toBe("2027-03-01T00:00:00.000Z");
  });

  it("fails loudly (no write) when the tier can't be resolved", async () => {
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSale({ ...basePayload, url_params: {} }, admin);
    expect(res.ok).toBe(false);
    expect(res.action).toBe("grant_subscription");
    expect(findWrite(writes, "user_subscriptions", "upsert")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// (3) Program / diet direct buy entitlement
// ---------------------------------------------------------------------------

describe("handleSale — program/diet direct buy grants a real entitlement", () => {
  const payload: GumroadSalePayload = {
    resource_name: "sale",
    sale_id: "sale_prog_1",
    product_id: "gum_recomp",
    email: "buyer@example.com",
    full_name: "Buyer",
    price: 1000,
    gumroad_fee: 100,
    currency: "USD",
    url_params: { tjfit_program_slug: "recomp", tjfit_locale: "tr" }
  };

  function resolver(programOrderInsert: Result, syncProductId = "prog-uuid") {
    return (table: string): Result => {
      if (table === "product_gumroad_sync")
        return { data: { product_type: "program", product_id: syncProductId, gumroad_product_id: "gum_recomp" } };
      if (table === "profiles") return { data: { id: "user-prog-1" } };
      if (table === "programs")
        // Regression tripwire: public.programs has never existed in prod —
        // the catalog is static code (src/lib/programs). Any query against
        // it is the WP-DATABASE-01 bug resurfacing.
        throw new Error("phantom table: nothing may query public.programs");
      if (table === "program_orders") return programOrderInsert;
      if (table === "sale_commissions") return { data: null, error: null };
      return { data: null };
    };
  }

  it("writes a paid program_orders row (the thing hasPurchasedProgram gates on) plus the commission audit", async () => {
    const { admin, writes } = createFakeAdmin({ resolve: resolver({ data: null, error: null }) });
    const res = await handleSale(payload, admin);
    expect(res.ok).toBe(true);
    expect((res as { details: Record<string, unknown> }).details.entitlement_granted).toBe(true);

    const order = findWrite(writes, "program_orders", "insert");
    expect(order).toBeTruthy();
    const row = order!.payload as Record<string, unknown>;
    expect(row.user_id).toBe("user-prog-1");
    expect(row.program_slug).toBe("recomp");
    expect(row.status).toBe("paid");
    expect(row.provider).toBe("gumroad");
    expect(row.provider_order_id).toBe("sale_prog_1");
    expect(row.locale).toBe("tr");

    // audit trail still written
    expect(findWrite(writes, "sale_commissions", "insert")).toBeTruthy();
  });

  it("is idempotent under Gumroad redelivery (duplicate provider_order_id)", async () => {
    const { admin } = createFakeAdmin({ resolve: resolver({ data: null, error: { code: "23505" } }) });
    const res = await handleSale(payload, admin);
    // 23505 on the unique provider_order_id → treated as already-fulfilled
    expect(res.ok).toBe(true);
    expect((res as { details: Record<string, unknown> }).details.entitlement_granted).toBe(true);
  });

  it("storefront purchase (no stamped slug): resolves the program from the static registry", async () => {
    // A buyer straight off the Gumroad storefront carries no tjfit_* url
    // params. The sync row's product_id is the program slug by convention;
    // resolution must come from src/lib/programs — never a DB table.
    const { admin, writes } = createFakeAdmin({
      resolve: resolver({ data: null, error: null }, "comeback")
    });
    const res = await handleSale({ ...payload, url_params: {} }, admin);
    expect(res.ok).toBe(true);
    expect((res as { details: Record<string, unknown> }).details.entitlement_granted).toBe(true);
    const row = findWrite(writes, "program_orders", "insert")!.payload as Record<string, unknown>;
    expect(row.program_slug).toBe("comeback");
  });

  it("storefront purchase with an unregistered product_id: gap surfaced, never a blind grant", async () => {
    const { admin, writes } = createFakeAdmin({
      resolve: resolver({ data: null, error: null }, "prog-uuid")
    });
    const res = await handleSale({ ...payload, url_params: {} }, admin);
    expect(res.ok).toBe(true);
    expect((res as { details: Record<string, unknown> }).details.entitlement_granted).toBe(false);
    expect((res as { details: Record<string, unknown> }).details.entitlement_note).toBe("no_program_slug_resolved");
    expect(findWrite(writes, "program_orders", "insert")).toBeUndefined();
    // the commission audit trail must still be preserved
    expect(findWrite(writes, "sale_commissions", "insert")).toBeTruthy();
  });

  it("diet with no slug source: commission written, entitlement flagged not granted", async () => {
    const resolveDiet = (table: string): Result => {
      if (table === "product_gumroad_sync")
        return { data: { product_type: "diet", product_id: "diet-uuid", gumroad_product_id: "gum_diet" } };
      if (table === "profiles") return { data: { id: "user-diet-1" } };
      if (table === "sale_commissions") return { data: null, error: null };
      return { data: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve: resolveDiet });
    const res = await handleSale({ ...payload, product_id: "gum_diet", url_params: {} }, admin);
    expect(res.ok).toBe(true);
    expect((res as { details: Record<string, unknown> }).details.entitlement_granted).toBe(false);
    expect((res as { details: Record<string, unknown> }).details.entitlement_note).toBe("no_program_slug_resolved");
    expect(findWrite(writes, "program_orders", "insert")).toBeUndefined();
    expect(findWrite(writes, "sale_commissions", "insert")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// (2) Refund
// ---------------------------------------------------------------------------

describe("handleRefund — revokes every entitlement a sale granted", () => {
  const ORDER_UUID = "11111111-2222-3333-4444-555555555555";
  const sale: GumroadSale = {
    id: "sale_ref_1",
    email: "buyer@example.com",
    full_name: "Buyer",
    product_id: "gum_recomp",
    product_name: "Recomp",
    permalink: "recomp",
    price: 1000,
    gumroad_fee: 100,
    currency: "USD",
    quantity: 1,
    subscription_id: "gsub_ref",
    refunded: true,
    created_at: "2026-03-01T00:00:00.000Z"
  };

  it("marks the tracked order + direct order + commission refunded and downgrades the subscription", async () => {
    const resolve = (table: string, ops: Op[]): Result => {
      const filters = eqMap(ops);
      if (table === "program_orders" && filters.id === ORDER_UUID) return { data: [{ id: "ord-1" }] };
      if (table === "program_orders" && filters.provider_order_id === "sale_ref_1")
        return { data: [{ id: "ord-direct-1" }] };
      if (table === "sale_commissions") return { data: [{ id: "com-1" }] };
      if (table === "user_subscriptions" && ops.some((o) => o.method === "select"))
        return { data: { user_id: "user-ref-1" } };
      if (table === "user_subscriptions") return { data: null, error: null };
      return { data: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleRefund(sale, { url_params: { tjfit_order_id: ORDER_UUID } }, admin);
    expect(res.ok).toBe(true);
    if (!res.ok) throw new Error(res.error);
    const details = res.details as { revoked: Record<string, unknown> };
    expect(details.revoked.order_ids).toEqual(["ord-1"]);
    expect(details.revoked.direct_order_ids).toEqual(["ord-direct-1"]);
    expect(details.revoked.commission_ids).toEqual(["com-1"]);
    expect(details.revoked.subscription_user_id).toBe("user-ref-1");

    // the subscription update actually downgrades to the free tier
    const subUpdate = writes.find(
      (w) => w.table === "user_subscriptions" && w.op === "update"
    );
    expect(subUpdate).toBeTruthy();
    const row = subUpdate!.payload as Record<string, unknown>;
    expect(row.tier).toBe("core");
    expect(row.status).toBe("cancelled");

    // orders were flipped to 'refunded'
    const orderUpdate = writes.find((w) => w.table === "program_orders" && w.op === "update");
    expect((orderUpdate!.payload as Record<string, unknown>).status).toBe("refunded");
  });

  it("is idempotent — only touches rows still in a live state", async () => {
    // Everything already refunded → updates match nothing, no throw, ok:true.
    const resolve = (): Result => ({ data: [] });
    const { admin } = createFakeAdmin({ resolve });
    const res = await handleRefund({ ...sale, subscription_id: undefined }, { url_params: {} }, admin);
    expect(res.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// (1b) Subscription lifecycle (renew / end / cancel)
// ---------------------------------------------------------------------------

describe("subscription lifecycle events", () => {
  it("subscription_ended downgrades the user to the free tier", async () => {
    const resolve = (table: string, ops: Op[]): Result => {
      if (table === "user_subscriptions" && ops.some((o) => o.method === "select"))
        return { data: { user_id: "u1", tier: "pro", current_period_end: null } };
      return { data: null, error: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSubscriptionEvent("subscription_ended", { subscription_id: "gsub_1" }, admin);
    expect(res.ok).toBe(true);
    const row = findWrite(writes, "user_subscriptions", "upsert")!.payload as Record<string, unknown>;
    expect(row.tier).toBe("core");
    expect(row.status).toBe("cancelled");
  });

  it("cancellation keeps the paid tier (access retained until period end)", async () => {
    const resolve = (table: string, ops: Op[]): Result => {
      if (table === "user_subscriptions" && ops.some((o) => o.method === "select"))
        return { data: { user_id: "u1", tier: "apex", current_period_end: "2026-09-01T00:00:00.000Z" } };
      return { data: null, error: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSubscriptionCancellation({ subscription_id: "gsub_1" }, admin);
    expect(res.ok).toBe(true);
    const row = findWrite(writes, "user_subscriptions", "upsert")!.payload as Record<string, unknown>;
    expect(row.tier).toBe("apex"); // NOT downgraded
    expect(row.status).toBe("cancelled");
    expect((res as { details: Record<string, unknown> }).details.access_retained_until).toBe(
      "2026-09-01T00:00:00.000Z"
    );
  });

  it("is a safe no-op for an unknown subscription", async () => {
    const resolve = (): Result => ({ data: null });
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSubscriptionEvent("subscription_ended", { subscription_id: "nope" }, admin);
    expect(res.ok).toBe(true);
    expect(res.action).toContain("noop");
    expect(writes.length).toBe(0);
  });

  // --- anti-forgery: lifecycle events carry no sale_id and are NOT re-verified
  // against Gumroad, so they must only ever act on a subscription we recorded
  // from an API-verified first charge (matched by gumroad_subscription_id).

  it("does NOT elevate a core account to a paid tier from a forged updated event (no verified subscription)", async () => {
    // Attacker knows a real account email and posts a forged subscription_updated
    // with tjfit_tier=apex but no subscription_id we ever issued. profiles would
    // resolve the email, but resolution must ignore it and refuse to grant.
    const resolve = (table: string): Result => {
      if (table === "profiles") return { data: { id: "attacker-user" } };
      if (table === "user_subscriptions") return { data: null, error: null };
      return { data: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSubscriptionEvent(
      "subscription_updated",
      { email: "attacker@known.com", url_params: { tjfit_tier: "apex", tjfit_billing_mode: "annual" } },
      admin
    );
    expect(res.ok).toBe(true);
    expect(res.action).toContain("noop");
    // the critical assertion: no tier was written at all
    expect(findWrite(writes, "user_subscriptions", "upsert")).toBeUndefined();
  });

  it("does NOT downgrade a victim from a forged subscription_ended matched only by email", async () => {
    // Forged subscription_ended with a victim's email but no real subscription_id
    // must not revoke their paid access.
    const resolve = (table: string, ops: Op[]): Result => {
      if (table === "profiles") return { data: { id: "victim-user" } };
      if (table === "user_subscriptions" && ops.some((o) => o.method === "select"))
        return { data: { user_id: "victim-user", tier: "apex", current_period_end: null } };
      return { data: null, error: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSubscriptionEvent("subscription_ended", { email: "victim@known.com" }, admin);
    expect(res.ok).toBe(true);
    expect(res.action).toContain("noop");
    // the victim's tier must be untouched — no revocation write
    expect(findWrite(writes, "user_subscriptions", "upsert")).toBeUndefined();
    expect(writes.length).toBe(0);
  });

  it("refreshes an existing paid subscription's period without changing its tier", async () => {
    const resolve = (table: string, ops: Op[]): Result => {
      if (table === "user_subscriptions" && ops.some((o) => o.method === "select"))
        return { data: { user_id: "u1", tier: "pro", current_period_end: null } };
      return { data: null, error: null };
    };
    const { admin, writes } = createFakeAdmin({ resolve });
    const res = await handleSubscriptionEvent(
      "subscription_updated",
      // even if a forged event claims apex, the stored tier wins
      { subscription_id: "gsub_1", recurrence: "monthly", url_params: { tjfit_tier: "apex" } },
      admin
    );
    expect(res.ok).toBe(true);
    const row = findWrite(writes, "user_subscriptions", "upsert")!.payload as Record<string, unknown>;
    expect(row.tier).toBe("pro"); // NOT elevated to apex
    expect(row.status).toBe("active");
  });
});
