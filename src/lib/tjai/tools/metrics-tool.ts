import { calculateTJAIMetrics } from "@/lib/tjai-science";
import type { QuizAnswers, TJAIMetrics } from "@/lib/tjai-types";
import type { ToolResult } from "@/lib/tjai/tools/types";

export function toolCalculateTjaiMetrics(answers: QuizAnswers): ToolResult<TJAIMetrics> {
  try {
    return { ok: true, data: calculateTJAIMetrics(answers) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "metrics_tool_failed", code: "METRICS" };
  }
}
