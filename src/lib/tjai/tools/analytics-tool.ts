import type { SupabaseClient } from "@supabase/supabase-js";

import { getSimilarUserInsight } from "@/lib/tjai-analytics";
import type { ToolResult } from "@/lib/tjai/tools/types";

export async function toolSimilarUserInsight(
  supabase: SupabaseClient,
  answers: Record<string, unknown>
): Promise<ToolResult<string | null>> {
  try {
    const insight = await getSimilarUserInsight(supabase, answers);
    return { ok: true, data: insight };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "analytics_tool_failed", code: "ANALYTICS" };
  }
}
