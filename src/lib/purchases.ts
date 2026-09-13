import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Preserve historical paid program orders and verified live Lemon bundle grants.
 * Refunds and sandbox receipts never satisfy the new digital entitlement branch.
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
  if (data && data.length > 0) return true;
  const { data: digital, error } = await supabase.from("digital_bundle_purchases").select("provider_order_id")
    .eq("user_id", userId).eq("program_slug", programSlug).eq("provider", "lemonsqueezy")
    .eq("status", "active").eq("test_mode", false).limit(1);
  return !error && Boolean(digital?.length);
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
  const { data: digital } = await supabase.from("digital_bundle_purchases").select("program_slug")
    .eq("user_id", userId).eq("provider", "lemonsqueezy").eq("status", "active").eq("test_mode", false);
  // Dedupe: duplicate paid rows (e.g. webhook retries) must not yield repeated slugs.
  const slugs = [...(!error && data ? data : []), ...(digital ?? [])].map((row) => row.program_slug).filter((s): s is string => typeof s === "string");
  return Array.from(new Set(slugs));
}
