import type { SupabaseClient } from "@supabase/supabase-js";

import { buildTjaiMemorySnapshot } from "@/lib/tjai-plan-store";
import type { TjaiMemorySnapshot } from "@/lib/tjai-types";
import type { ToolResult } from "@/lib/tjai/tools/types";

export async function toolTjaiMemorySnapshot(
  supabase: SupabaseClient,
  userId: string
): Promise<ToolResult<TjaiMemorySnapshot>> {
  try {
    const data = await buildTjaiMemorySnapshot(supabase, userId);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "memory_tool_failed", code: "MEMORY" };
  }
}
