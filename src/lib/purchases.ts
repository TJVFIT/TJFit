import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Purchase / entitlement checks backed by `program_orders` (paid status).
 * Fulfillment runs via Paddle webhook → `fulfillProgramOrderPaid` (no separate `purchases` table).
 */

export async function hasPurchasedProgram(
  supabase: SupabaseClient,
  userId: string,
  programSlug: string
): Promise<boolean> {
  const { data } = await supabase
    .from("program_orders")
    .select("id")
    .eq("user_id", userId)
    .eq("program_slug", programSlug)
    .eq("status", "paid")
    .maybeSingle();
  return Boolean(data);
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
  return data.map((row) => row.program_slug).filter((s): s is string => typeof s === "string");
}
