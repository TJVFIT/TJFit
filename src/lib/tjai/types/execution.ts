export type ExecutionStage =
  | "received"
  | "classified"
  | "context_built"
  | "tools_run"
  | "draft_generated"
  | "semantic_validation_failed"
  | "repair_attempted"
  | "validated"
  | "refine_started"
  | "refined"
  | "refine_skipped"
  | "delivered"
  | "failed";

export type TjaiRunTrace = {
  skillId: string;
  promptVersion?: string;
  stages: Array<{ stage: ExecutionStage; atMs: number; meta?: Record<string, unknown> }>;
  timingsMs: Record<string, number>;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  errors?: string[];
};
