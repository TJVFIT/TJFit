import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Rolling-window rate limit backed by `tjai_ai_call_logs`.
 * Reuses the telemetry table — no extra writes, no extra schema.
 *
 * Returns { allowed, count, resetIn } where resetIn is seconds until the
 * oldest counted call ages out of the window.
 */
export async function checkRateLimit({
  supabase,
  userId,
  route,
  windowSeconds,
  max
}: {
  supabase: SupabaseClient;
  userId: string;
  route: string;
  windowSeconds: number;
  max: number;
}): Promise<{ allowed: boolean; count: number; resetIn: number }> {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await supabase
    .from("tjai_ai_call_logs")
    .select("created_at", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("route", route)
    .gte("created_at", since);
  const used = count ?? 0;
  return {
    allowed: used < max,
    count: used,
    resetIn: windowSeconds
  };
}
