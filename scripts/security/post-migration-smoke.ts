/**
 * post-migration-smoke.ts — read-only verification that migration
 * 20260723221731_security_hardening.sql is fully in effect on the target
 * database (WP-SEC-11 stage gates; see
 * docs/runbooks/migration-20260723221731-apply.md).
 *
 * Runs NOTHING that writes. Every probe is a SELECT or a
 * permission-denied-expected call. Safe against prod.
 *
 * Usage (target selected purely by env):
 *   npx tsx scripts/security/post-migration-smoke.ts
 *
 * Required env (same names as .env.example):
 *   NEXT_PUBLIC_SUPABASE_URL      — project or preview-branch API URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon key for the same target
 *   SUPABASE_SERVICE_ROLE_KEY     — service key for the same target
 *
 * Exit code 0 = every check passed; 1 = at least one check failed.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "Missing env: need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const service = createClient(url, serviceKey, { auth: { persistSession: false } });

let failed = 0;
function pass(label: string) {
  console.log(`PASS  ${label}`);
}
function fail(label: string, detail?: string) {
  failed += 1;
  console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
}

/**
 * The migration's final block revokes these tables from anon+authenticated —
 * an anon SELECT must come back with a permission/relation error, never rows.
 */
const REVOKED_TABLES = [
  "program_orders",
  "tjfit_coin_wallets",
  "tjfit_coin_ledger",
  "tjfit_discount_offers",
  "tjfit_discount_codes",
  "custom_programs",
  "marketing_subscribers",
  "community_blog_posts"
] as const;

async function checkRevokedTables() {
  for (const table of REVOKED_TABLES) {
    const { data, error } = await anon.from(table).select("*").limit(1);
    if (error) {
      pass(`anon SELECT ${table} denied (${error.code ?? "error"})`);
    } else if ((data ?? []).length === 0) {
      // RLS-empty (no error, zero rows) is NOT the migration's contract —
      // the revoke must produce a hard error, otherwise the Data API surface
      // is still exposed and only row policies stand between it and the data.
      fail(`anon SELECT ${table}`, "returned empty success — table grant NOT revoked");
    } else {
      fail(`anon SELECT ${table}`, "returned rows — table grant NOT revoked");
    }
  }
}

async function checkServiceStillWorks() {
  // The service role must keep full access (the app's scoped APIs depend on
  // it). One representative table proves the revoke didn't over-reach.
  const { error } = await service.from("program_orders").select("id").limit(1);
  if (error) {
    fail("service-role SELECT program_orders", error.message);
  } else {
    pass("service-role SELECT program_orders still works");
  }
}

async function checkRedeemFunctionLockedDown() {
  // execute on redeem_tjfit_discount is revoked from anon/authenticated and
  // granted only to service_role. Calling it as anon must fail with a
  // permission error BEFORE the function body runs (null p_user_id would
  // raise 'invalid_user' from inside the body — seeing that error means the
  // grant is wrong even though no write happened; both paths are read-only).
  const { error } = await anon.rpc("redeem_tjfit_discount", {
    p_user_id: null,
    p_offer_key: "smoke-test-probe"
  });
  if (!error) {
    fail("anon rpc redeem_tjfit_discount", "call succeeded — execute grant NOT revoked");
  } else if (/invalid_user|TJ003/i.test(error.message)) {
    fail(
      "anon rpc redeem_tjfit_discount",
      "function body executed (invalid_user) — execute grant NOT revoked"
    );
  } else {
    pass(`anon rpc redeem_tjfit_discount denied (${error.code ?? error.message})`);
  }
}

async function checkBuckets() {
  // The migration upserts these two buckets with fixed visibility.
  const expectations: Array<{ id: string; isPublic: boolean }> = [
    { id: "community-blog-images", isPublic: true },
    { id: "program-assets", isPublic: false }
  ];
  for (const { id, isPublic } of expectations) {
    const { data, error } = await service.storage.getBucket(id);
    if (error || !data) {
      fail(`bucket ${id} exists`, error?.message ?? "not found");
    } else if (Boolean(data.public) !== isPublic) {
      fail(`bucket ${id} visibility`, `public=${data.public}, expected ${isPublic}`);
    } else {
      pass(`bucket ${id} exists, public=${isPublic}`);
    }
  }
}

async function checkWalletBackfill() {
  // The migration backfills a wallet per auth user and installs a trigger for
  // new users. Read-only proxy: the wallets table must be non-empty on any
  // environment that has at least one user.
  const { count, error } = await service
    .from("tjfit_coin_wallets")
    .select("user_id", { count: "exact", head: true });
  if (error) {
    fail("wallet backfill count", error.message);
  } else if ((count ?? 0) === 0) {
    // Zero users → zero wallets is legitimate on a fresh branch DB.
    console.log("WARN  tjfit_coin_wallets is empty — fine only if this DB has zero auth users");
    pass("wallet backfill (vacuously — empty environment)");
  } else {
    pass(`wallet backfill present (${count} wallets)`);
  }
}

async function main() {
  console.log(`→ post-migration smoke against ${url}\n`);
  await checkRevokedTables();
  await checkServiceStillWorks();
  await checkRedeemFunctionLockedDown();
  await checkBuckets();
  await checkWalletBackfill();
  console.log(
    failed === 0
      ? "\nAll post-migration smoke checks passed."
      : `\n${failed} check(s) FAILED — migration 20260723221731 is not (fully) in effect.`
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("smoke script crashed:", err);
  process.exit(1);
});
