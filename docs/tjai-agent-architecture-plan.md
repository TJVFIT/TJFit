# TJAI Agent Architecture Plan

This document captures an audit of the pre-refactor TJAI stack, compares it to useful patterns from agentic coding assistants (e.g. Claude Code-style orchestration), and records what we implemented in-repo.

## Phase 1 — Architecture audit (baseline)

### Folder structure (API + lib + UI)

| Area | Role |
|------|------|
| `src/app/api/tjai/*` | Route handlers: generate, chat, save, access, trial, meal swap/replace, progress, PDF, grocery, blog-generate, etc. |
| `src/lib/tjai-*.ts` | Core domain: prompts (`tjai-prompts`), OpenAI (`tjai-openai`), Anthropic (`tjai-anthropic` for some flows), intake/profile (`tjai-intake`), science/metrics (`tjai-science`), validation (`tjai-plan-validation`), memory (`tjai-plan-store`), access matrix (`tjai-access`), types (`tjai-types`). |
| `src/components/tjai/*` | Hub UI, quiz, chat, plan tabs, PDF/share flows. |

### Request flow (12-week plan)

1. `POST /api/tjai/generate` — `requireAuth` → Supabase admin → subscription + purchase → `getTJAIAccess` → normalize quiz → profile + `calculateTJAIMetrics` → parallel `getSimilarUserInsight` + `buildTjaiMemorySnapshot` → `buildTJAISystemPrompt` + `buildTJAIUserPrompt` → `callOpenAI` (JSON mode) → `safeParseJSON` → `validateTjaiPlan` → insert `saved_tjai_plans` → analytics/memory side effects.

### Request flow (chat)

1. `POST /api/tjai/chat` — auth + access → domain keyword guard OR short-circuit → optional OpenAI key fallback → parallel DB reads (plan, memory, history, prefs, workout_logs, progress_entries) → `routeCoachChatIntent(message)` (keyword router) → `buildChatCoachSystemPrompt` (core + optional focus addendum) → `streamOpenAI` → SSE → persist messages + async preference extraction.

### Prompt system

- **Strength:** `tjai-prompts.ts` centralizes the heavy 12-week JSON contract and coaching rules in one place with structured sections.
- **Weakness:** Chat coach prompt is embedded inside `chat/route.ts` (~60+ lines), duplicating “TJAI persona” and program list. Harder to version and A/B test.

### Conversation / session

- `conversationId` from client or `randomUUID()`.
- Messages in `tjai_chat_messages`; preferences in `user_chat_preferences`.

### Auth / user binding

- `requireAuth` + RLS-scoped user client for chat inserts; admin client for generate saves and subscription reads.

### Data storage

- `saved_tjai_plans` (versioned inserts), `tjai_plan_purchases`, `user_subscriptions`, `tjai_trial_usage`, `tjai_adaptive_checkpoints`, logs/progress tables.

### Safety / fallback

- Chat: keyword domain guard + localized `fallbackCoachReply` when OpenAI missing or stream fails.
- Generate: field validation before AI; JSON parse + `validateTjaiPlan`.
- Chat system text includes injury/medical disclaimer guidance.

### Weak / missing / duplicated / fragile (pre-refactor)

| Issue | Detail |
|-------|--------|
| Monolithic route handlers | Generate is manageable; chat mixes orchestration, prompt authoring, streaming, persistence. |
| Duplicated “coach brain” | Persona split between `tjai-prompts` (plan) and `chat/route.ts` (chat). |
| Limited observability | `console.log` only; no structured stage timeline for support/debug. |
| Validation depth | `validateTjaiPlan` checks shape, not numeric consistency vs computed metrics. |
| Two LLM backends | OpenAI (plan/chat) vs Anthropic (meal swap) — acceptable product split but increases ops surface. |

## Phase 2 — What we adopt from “Claude Code–style” design (adapted)

We **do not** copy terminal/git/plugin UX. We borrow:

1. **Orchestrator** — one pipeline entry for plan generation with explicit stages and timings.
2. **Modular tools** — small typed wrappers around existing pure/IO helpers (profile, metrics, memory, analytics).
3. **Skill registry** — named skills (`create_program`, `coach_chat`, …) for documentation and future routing; extensible map.
4. **Versioned prompt facade** — `src/lib/tjai/prompts` re-exports existing builders + `PROMPT_VERSION` for traceability.
5. **Context builder (chat)** — `buildChatCoachContext` isolates prompt assembly from transport (SSE).
6. **Execution trace** — stages: `received` → `context_built` → `tools_run` → `draft_generated` → `validated` → `delivered` / `failed`.
7. **Optional strict validation** — env-flagged macro/calorie coherence checks after structural validation.
8. **Feature flags** — `tjai/feature-flags.ts` for observability verbosity and strict validation (default safe).

## Phase 3 — Implemented architecture tree

```
docs/tjai-agent-architecture-plan.md     (this file)
src/lib/tjai/
  feature-flags.ts                         Env toggles
  observability.ts                       Stage + timing helpers
  types/execution.ts                     ExecutionStage, TjaiRunTrace
  guards/fitness-domain.ts               Domain guard + fallback replies (chat)
  tools/types.ts                         ToolResult<T>
  tools/profile-tool.ts                  Quiz → profile
  tools/metrics-tool.ts                  Quiz → TJAIMetrics
  tools/memory-tool.ts                   Memory snapshot
  tools/analytics-tool.ts                Similar-user insight
  tools/index.ts                         Barrel
  registry/skills.ts                     Skill ids + metadata (+ future dispatch)
  agents/program-designer.ts             Plan prompt surface (versioned facade)
  prompts/index.ts                     Re-export prompt builders + PROMPT_VERSION
  context/chat-coach-context.ts          System prompt + data context for chat
  validation/enhanced-plan-checks.ts     Optional metric coherence checks
  orchestrator/plan-generation-pipeline.ts
  orchestrator/chat-intent.ts            Coach chat intent routing (keyword → focus addendum)
  index.ts                               Public exports for routes
```

## Phase 4 — Route changes

- `src/app/api/tjai/generate/route.ts` — delegates generation to `runPlanGenerationPipeline` (same JSON contract and DB insert; adds staged trace, optional token usage on the OpenAI response, optional strict coherence checks).
- `src/app/api/tjai/chat/route.ts` — uses `TJAI_CHAT_DOMAIN_GUARD`, `isLikelyFitnessQuestion`, `fallbackCoachReply` from `guards/fitness-domain`, `routeCoachChatIntent`, and `buildChatCoachSystemPrompt` from `context/chat-coach-context` (streaming + persistence unchanged).
- `src/app/api/tjai/weekly-check-in/route.ts` — `GET`/`POST` structured weekly self check-in; persists to `tjai_weekly_check_ins` (see Supabase migration).

### Environment flags (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `TJAI_STRICT_PLAN_VALIDATION` | When `true`, rejects plans if `summary.calorieTarget` / `summary.protein` drift too far from server `TJAIMetrics` after structural validation. |
| `TJAI_DEBUG_PIPELINE` | When `true`, logs pipeline stages/timings/token usage and chat `context_built` metadata. |

### Typed tools package

`src/lib/tjai/tools/*` provides small `ToolResult<T>` wrappers around profile, metrics, memory, and analytics helpers. The plan pipeline still calls the underlying libs directly for parity with the previous route; new flows (e.g. a chat orchestrator) can adopt these tools first without rewiring production-critical paths.

### OpenAI observability

`callOpenAI` accepts an optional `onUsage` callback; the plan pipeline attaches it to record `promptTokens` / `completionTokens` on the run trace when the API returns usage.

## Phase 5 — Future extension points

1. **Intent router** — classify chat into skills (`adjust_macros`, `summarize_progress`) before choosing tools; start with registry entries only.
2. **Dedicated sub-agents** — split `tjai-prompts` into per-agent files (program vs diet vs recovery) behind the same orchestrator contract.
3. **Tool expansion** — exercise library search, RAG on `docs/programs/*`, coach handoff — register in `registry/skills.ts`.
4. **Long-term memory** — extend `buildTjaiMemorySnapshot` with summarization + token budget in context builder.
5. **Unified billing hooks** — access checks already centralized in `getTJAIAccess`; orchestrator can accept `TJAIAccess` snapshot in trace metadata.

## Migration notes

- Plan/chat orchestration refactor: no schema change.
- Weekly check-in: apply `supabase/migrations/20260420120000_tjai_weekly_check_ins.sql` for `tjai_weekly_check_ins`.
- Set `TJAI_STRICT_PLAN_VALIDATION=true` only after validating false-positive rate on staging.
- Set `TJAI_DEBUG_PIPELINE=true` for verbose server logs (avoid in production unless diagnosing).
