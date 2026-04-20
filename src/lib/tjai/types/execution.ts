export type ExecutionStage =
  | "received"
  | "classified"
  | "context_built"
  | "tools_run"
  | "draft_generated"
  | "validated"
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
