/**
 * Entitlement reads must not run as the `authenticated` role.
 *
 * Security-hardening migration 20260723221731 revokes `program_orders` from
 * anon + authenticated. Four call sites read entitlement from that table, and
 * every one of them must therefore use the SERVICE-ROLE client. If any is
 * reverted to the session client (`auth.supabase` from requireAuth, or
 * createServerSupabaseClient), that customer silently loses access:
 *
 *   download route        -> 403 "Purchase required" on a paid PDF
 *   bundle detail page    -> "Buy" shown to someone who already bought
 *   program page          -> redirect away from a program they own
 *   dashboard summary     -> purchase history disappears
 *
 * None of it throws. It just quietly stops working for paying customers.
 *
 * Only the download route has a behavioural test — the other three are Next
 * server components / route handlers whose full render is not worth stubbing
 * for this. So this file asserts the invariant STRUCTURALLY, against the real
 * source. It is a coarse instrument on purpose: it cannot prove correctness,
 * but it does catch the exact regression above on all four sites at once,
 * which is the failure that actually costs money.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

const ENTITLEMENT_SITES = [
  "src/app/api/bundles/download/[slug]/route.ts",
  "src/app/[locale]/bundles/[slug]/page.tsx",
  "src/app/[locale]/bundles/[slug]/program/page.tsx",
  "src/app/api/user/dashboard-summary/route.ts"
] as const;

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf8");
}

/** Strip line and block comments so prose about the session client can't trip the checks. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("entitlement reads use the service-role client", () => {
  it.each(ENTITLEMENT_SITES)("%s obtains the service client", (rel) => {
    expect(stripComments(read(rel))).toContain("getSupabaseServerClient()");
  });

  it.each(ENTITLEMENT_SITES)("%s never passes a session client into hasPurchasedProgram", (rel) => {
    const code = stripComments(read(rel));
    // The two ways a session client reaches this code: requireAuth's `.supabase`
    // field, and a directly-constructed cookie client.
    expect(code).not.toMatch(/hasPurchasedProgram\(\s*auth\.supabase/);
    expect(code).not.toMatch(/hasPurchasedProgram\(\s*supabase\s*,/);
    expect(code).not.toMatch(/hasPurchasedProgram\(\s*createServerSupabaseClient\(\)/);
  });

  it.each(ENTITLEMENT_SITES)("%s never queries program_orders on a session client", (rel) => {
    const code = stripComments(read(rel));
    expect(code).not.toMatch(/auth\.supabase\s*\n?\s*\.from\("program_orders"\)/);
    expect(code).not.toMatch(/auth\.supabase\.from\("program_orders"\)/);
  });
});

describe("entitlement reads fail closed when the service client is unavailable", () => {
  it("download route returns 500 rather than falling through to the gate", () => {
    const code = stripComments(read(ENTITLEMENT_SITES[0]));
    expect(code).toMatch(/if\s*\(!db\)\s*return[\s\S]{0,120}500/);
  });

  it("bundle detail page leaves `owns` false when there is no service client", () => {
    // `!!db && (await ...)` short-circuits before the entitlement call, so a
    // missing client can never grant ownership.
    const code = stripComments(read(ENTITLEMENT_SITES[1]));
    expect(code).toMatch(/!!db\s*&&\s*\(await hasPurchasedProgram\(/);
  });

  it("program page denies access when there is no service client", () => {
    const code = stripComments(read(ENTITLEMENT_SITES[2]));
    expect(code).toMatch(/db\s*\?\s*await hasPurchasedProgram\([\s\S]*?:\s*false/);
  });

  it("dashboard summary returns 500 rather than rendering an empty purchase history", () => {
    // An empty history would read as "you own nothing", which is the same
    // user-visible outcome as the lockout bug.
    const code = stripComments(read(ENTITLEMENT_SITES[3]));
    expect(code).toMatch(/if\s*\(!ordersDb\)\s*return[\s\S]{0,120}500/);
  });
});

describe("the entitlement predicate itself", () => {
  const purchases = stripComments(read("src/lib/purchases.ts"));

  it("only counts paid orders", () => {
    expect(purchases).toMatch(/eq\("status",\s*"paid"\)/);
  });

  it("stays in sync with the status the refund handler writes", () => {
    // PR #13 added 'refunded' as a terminal status. If the refund handler ever
    // wrote a different literal, refunded buyers would keep their access.
    const refund = stripComments(read("src/app/api/webhooks/gumroad/handlers/refund.ts"));
    expect(refund).toMatch(/status:\s*"refunded"/);
    expect(purchases).not.toMatch(/"refunded"/);
  });
});
