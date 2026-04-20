import { isTjaiDebugPipeline } from "@/lib/tjai/feature-flags";
import type { ExecutionStage, TjaiRunTrace } from "@/lib/tjai/types/execution";

export function createRunTrace(skillId: string, promptVersion?: string): TjaiRunTrace {
  return { skillId, promptVersion, stages: [], timingsMs: {} };
}

export function pushStage(trace: TjaiRunTrace, stage: ExecutionStage, meta?: Record<string, unknown>): void {
  trace.stages.push({ stage, atMs: Date.now(), meta });
}

export function appendTraceError(trace: TjaiRunTrace, message: string): void {
  if (!trace.errors) trace.errors = [];
  trace.errors.push(message);
}

export async function withTiming<T>(trace: TjaiRunTrace, key: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  try {
    return await fn();
  } finally {
    trace.timingsMs[key] = Date.now() - t0;
  }
}

export function logPipelineTrace(userId: string, trace: TjaiRunTrace): void {
  if (!isTjaiDebugPipeline()) return;
  console.log("[TJAI pipeline]", userId, JSON.stringify({ stages: trace.stages, timingsMs: trace.timingsMs, tokenUsage: trace.tokenUsage, errors: trace.errors }));
}

export function logChatCoachContextBuilt(input: { userId: string; conversationId: string; historyTurns: number }): void {
  if (!isTjaiDebugPipeline()) return;
  console.log("[TJAI chat] context_built", input.userId, input.conversationId, "historyTurns=", input.historyTurns);
}
