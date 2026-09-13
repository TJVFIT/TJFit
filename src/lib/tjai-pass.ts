import type { SupabaseClient } from "@supabase/supabase-js";

/** Historical subscription/credit rights are checked separately by the TJAI access layer. */
export async function getTjaiPassAccess(client: SupabaseClient, userId: string): Promise<{ hasPass: boolean; available: boolean }> {
  try {
    const { data, error } = await client.from("tjai_pass_purchases").select("provider_order_id")
      .eq("user_id", userId).eq("provider", "lemonsqueezy").eq("status", "active").eq("test_mode", false).limit(1);
    if (error) return { hasPass: false, available: false };
    return { hasPass: Boolean(data?.length), available: true };
  } catch { return { hasPass: false, available: false }; }
}
