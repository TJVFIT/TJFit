import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Purchase / entitlement checks backed by `program_orders` (paid status).
 * Fulfillment runs via Gumroad webhook → `fulfillProgramOrderPaid` (no separate `purchases` table).
 */

export async function hasPurchasedProgram(
  supabase: SupabaseClient,
  userId: string,
  programSlug: string
): Promise<boolean> {
  // limit(1) rather than maybeSingle(): duplicate paid rows for the same
  // (user, program) can legitimately exist (e.g. Gumroad webhook retries), and
  // maybeSingle() would error on >1 row and wrongly report "not owned",
  // locking a paying customer out of their download.
  const { data } = await supabase
    .from("program_orders")
    .select("id")
    .eq("user_id", userId)
    .eq("program_slug", programSlug)
    .eq("status", "paid")
    .limit(1);
  return Boolean(data && data.length > 0);
}

export async function listPurchasedProgramSlugs(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("program_orders")
    .select("program_slug")
    .eq("user_id", userId)
    .eq("status", "paid");
  if (error || !data) return [];
  // Dedupe: duplicate paid rows (e.g. webhook retries) must not yield repeated slugs.
  const slugs = data.map((row) => row.program_slug).filter((s): s is string => typeof s === "string");
  return Array.from(new Set(slugs));
}
