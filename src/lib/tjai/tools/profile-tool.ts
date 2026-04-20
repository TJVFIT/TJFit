import { buildTjaiUserProfile } from "@/lib/tjai-intake";
import type { TjaiUserProfile } from "@/lib/tjai-types";
import type { ToolResult } from "@/lib/tjai/tools/types";

export function toolBuildTjaiProfile(answers: Record<string, unknown>): ToolResult<TjaiUserProfile> {
  try {
    return { ok: true, data: buildTjaiUserProfile(answers) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "profile_tool_failed", code: "PROFILE" };
  }
}
