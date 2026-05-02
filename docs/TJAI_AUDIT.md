# TJAI Audit — 2026-05-02

## Summary
- Routes audited: 25 (24 listed + `chat/conversations/route.ts`)
- 🔴 Critical (ship-blocking): 6
- 🟡 High (real bug, not blocking): 11
- 🟢 Polish: 9

The most damaging finding is **trial enforcement is broken** — `/chat` reads `messages_used` to gate access, but only `/trial-consume-message` increments it, called optimistically from the client (`tjai-chat.tsx:199`, `tjai-chat-standalone.tsx:200`). A user who removes that fetch (or uses the streaming endpoint directly) bypasses the 10-message free trial entirely. Second-most damaging: **5 routes still import `tjai-anthropic`** (Anthropic SDK) despite the project using `tjai-openai`. They will 500 in production unless `ANTHROPIC_API_KEY` is set.

## Per-route findings

### /api/tjai/access (src/app/api/tjai/access/route.ts, 42 lines)
- ✅ Auth via `requireAuth`
- ✅ Clean — no input, GET only
- 🟢 No try/catch around the parallel Promise.all DB query bundle (`access/route.ts:15`); a Supabase outage returns an unhandled rejection / 500 with no shaped error. Patch: wrap in try/catch returning `NextResponse.json({error},{status:500})`.

### /api/tjai/badges (src/app/api/tjai/badges/route.ts, 16 lines)
- ✅ Auth, ✅ Clean

### /api/tjai/blog-generate (src/app/api/tjai/blog-generate/route.ts, 55 lines)
- 🔴 **Imports `callClaude` from `@/lib/tjai-anthropic`** (`blog-generate/route.ts:3`) — project uses OpenAI. Will 500 if `ANTHROPIC_API_KEY` not set. Patch: replace with `callOpenAI({ system, user, maxTokens: 4500 })` from `@/lib/tjai-openai`.
- ✅ Admin-gated correctly
- 🟡 No try/catch around `callClaude` (`:26-33`) — a model failure rejects the request with no logging. Patch: wrap in try/catch.
- 🟡 Hardcoded English system + user prompts (`:20-24`) — fine since admin-only, but flag.

### /api/tjai/chat (src/app/api/tjai/chat/route.ts, 317 lines)
- ✅ Auth, ✅ Streams via `streamOpenAI` correctly
- 🔴 **Trial enforcement gap**: route gates on `coreTrialMessagesRemaining` (`:82-89`) but never increments `tjai_trial_usage.messages_used`. The increment lives in a separate route (`/trial-consume-message`) called from the client. Skip that fetch → infinite free messages. Patch: at `:88` after the access check (and after medical/domain guards), call the increment in the same transaction (`admin.from("tjai_trial_usage").update({ messages_used: used+1 })`) before returning the stream.
- 🟡 `(plan as any)` cast at `:201` and `parsed.choices?.[0]?.delta?.content` parsed without a zod guard (`:243-246`) — acceptable for SSE but flag.
- 🟡 Catch swallows error and falls through to `fallbackCoachReply` without logging the upstream OpenAI error in user-facing observability (`:291`). Patch: `console.error("[TJAI chat stream] fallback triggered:", err)`.
- 🟡 Inserts user+assistant messages **after** stream `finally` (`:263-266`) — if the client aborts mid-stream, the partial reply is still saved. That's acceptable, but the `void` insert errors are silently swallowed (`:263`) — schema mismatches will never surface. Patch: log insert errors.
- 🟢 Heavy file (317 lines) but under the 500-line cap.
- 🟢 Inline dynamic import of `trial-config` at `:81` is unnecessary (top-level import works in Next 14 server). Patch: hoist.

### /api/tjai/chat/conversations (src/app/api/tjai/chat/conversations/route.ts, 44 lines)
- ✅ Auth, RLS-scoped via `auth.supabase`
- ✅ Clean

### /api/tjai/evaluate-progress (src/app/api/tjai/evaluate-progress/route.ts, 169 lines)
- ✅ Auth, ✅ JSON-mode OpenAI usage
- 🟡 **Returns 200 with `evaluation: null` and an `error` field on AI failure** (`evaluate-progress/route.ts:138-144`) — the anti-pattern called out in scope. UI consumer (`tjai-progress-tab.tsx:117`) won't distinguish "no signal" from "AI broken". Patch: return `{status:502, error}` so the client can retry.
- 🟡 `JSON.parse(raw) as EvaluationResult` (`:136`) — no schema validation; a malformed Opus response can corrupt the saved `tjai_adaptive_checkpoints` row via `saveAdaptiveCheckpoint`. Patch: validate with zod (urgency enum, type enum, recommendations array).
- 🟡 Bug: weekly change calculation `(latestWeight - oldestWeight) / Math.max(1, entries.length - 1)` (`:81`) divides by **entry count**, not weeks elapsed. With daily logs over 1 week you get ~1/7th the real rate. Patch: divide by `weeksSincePlan` derived from `entries[0].entry_date - entries.last.entry_date`.

### /api/tjai/export-pdf (src/app/api/tjai/export-pdf/route.ts, 75 lines)
- ✅ Auth
- 🟡 **No paywall check** — anyone authenticated can POST a plan blob and get a PDF. Compare with `/generate-pdf` which gates on `access.canDownloadPdf`. Patch: gate behind `getTJAIAccess(...).canDownloadPdf` or the trial/purchase check. Otherwise free users bypass the upgrade wall by sending the plan they already see in their browser back to this endpoint.
- 🟡 No zod validation on `body.plan` / `body.metrics` / `body.answers` (`:25-31`) — `buildTjaiPdf` will throw on malformed shape. The catch at `:67` returns 500 but the user gets a generic error. Patch: zod-validate or at minimum check `typeof body.plan === "object" && body.plan.diet`.

### /api/tjai/generate (src/app/api/tjai/generate/route.ts, 95 lines)
- ✅ Auth, ✅ Paywall via `getTJAIAccess`
- 🟡 No zod schema for quiz answers — relies on `normalizeQuizAnswers` to coerce (`generate/route.ts:58`). Acceptable but `rawAnswers as Record<string, unknown>` cast at `:57` bypasses TS guarantees. The `if (!Number.isFinite(profile.age) ...` check (`:61`) catches the worst case but a string-typed `s2_pace` slips through.
- 🟡 `buildTjaiUserProfile` logic is in `tjai-intake.ts`; this route assumes its output shape — fine, but a single test for the boundary would prevent regressions.

### /api/tjai/generate-pdf (src/app/api/tjai/generate-pdf/route.ts, 63 lines)
- ✅ Auth, ✅ Paywall
- 🟡 No try/catch around `buildTJAIPlanPdf` (`generate-pdf/route.ts:46`) — corrupt plan data 500s with default Next handler. Patch: wrap.
- 🟢 `purchase.data?.id` mark-downloaded is best-effort — but if it throws inside the route it surfaces as 500 to the user despite the PDF being built. Patch: `await admin.from("tjai_plan_purchases").update(...).then(...).catch(()=>{})`.

### /api/tjai/grocery-list (src/app/api/tjai/grocery-list/route.ts, 38 lines)
- 🔴 **Imports `callClaude` from `@/lib/tjai-anthropic`** (`grocery-list/route.ts:3`) — same SDK mismatch as blog-generate. Patch: swap to `callOpenAI({...,jsonMode:true})` and parse with `safeParseJSON`.
- ✅ Auth
- 🟡 No paywall check — meal-prep does not gate either, but the user could use this without ever paying. Patch: add `getTJAIAccess` check or gate on plan existence.
- 🟡 `JSON.stringify(week)` (`:29`) blindly serializes user input into the prompt — large `week` objects will overflow tokens. Patch: enforce a size cap or compact representation.

### /api/tjai/meal-prep (src/app/api/tjai/meal-prep/route.ts, 39 lines)
- 🔴 **Same SDK mismatch** — imports `callClaude` (`meal-prep/route.ts:3`). Patch: swap to `callOpenAI`.
- ✅ Auth
- 🟡 No paywall check, no input cap on `week`, identical pattern to grocery-list.

### /api/tjai/memory (src/app/api/tjai/memory/route.ts, 29 lines)
- ✅ Auth, RLS-scoped DELETE
- 🟢 No try/catch on the DELETE — Supabase failure returns ambiguous 500. Acceptable.

### /api/tjai/progress (src/app/api/tjai/progress/route.ts, 128 lines)
- ✅ Auth
- 🟡 **Schema mismatch**: line 24 selects `id,week_number,day_label,exercise_name,logged_at` from `workout_logs`. Migration `20260316000100_progress_and_secure_chat.sql:31` defines `exercise` (not `exercise_name`). Migration `20260407150000_launch_polish_indexes.sql:48` ALTER-adds `exercise_name`. So this works on prod **only if both migrations applied**. Newer fields like `rpe`, `soreness` (added `20260426150000`) are not used. Patch: use COALESCE in a view or add a sentinel `.select("id,week_number,day_label,exercise_name,exercise,logged_at")` and read `r.exercise_name ?? r.exercise`.
- 🟡 `(planRow?.plan_json as any)` (`progress/route.ts:97`) — bypasses TS validation. Pulled into the JSON response. A null `weeks` array crashes with cryptic error.
- 🟡 `nutritionHit` is hardcoded zero (`:38`) — `protein_hit_percent` and `calorie_hit_percent` are always 0 in the response payload. Patch: either compute from logged meals or remove from contract.
- 🟡 If `OPENAI_API_KEY` missing, falls through to a stub English string (`:81`) — no localization. Patch: route through translation copy file.
- 🟢 The `nextWorkouts` slice may be empty for any user beyond plan week 12 — silent no-op.

### /api/tjai/replace-meal (src/app/api/tjai/replace-meal/route.ts, 61 lines)
- ✅ Auth, ✅ Paywall
- 🟡 `as any` casts at `:51,54` (`plan_json as any`, no shape check) — a user with a malformed `plan_json` row 500s. Patch: validate against `TJAIPlan` shape.
- 🟡 `body.meal` accepted as `unknown` and written without validation (`:56`) — store-time XSS risk if anything renders it as HTML. Patch: zod-validate the meal shape (`name, foods, calories, protein, carbs, fat`).

### /api/tjai/request-coach-review (src/app/api/tjai/request-coach-review/route.ts, 25 lines)
- ✅ Auth
- 🔴 **Trust-the-client paywall**: `if (!isPro) return 402` (`request-coach-review/route.ts:14`) — `isPro` comes from the request body. Any user can POST `{ planId, isPro: true }`. Patch: replicate the `getTJAIAccess` server-side check pattern from `/save` or `/swap-meal`. Without this, the coach review queue gets flooded by free users.

### /api/tjai/save (src/app/api/tjai/save/route.ts, 64 lines)
- ✅ Auth
- 🔴 **Returns 200 with `warning` on failure** (`save/route.ts:38`, `:43`) — both DB error and crash paths return `ok:true`. The UI (`tjai-shell.tsx:172`) checks `response.ok` only; it sees success and never tells the user the plan didn't save. Patch: return `status:500` on DB error and let the UI retry.
- 🟡 No paywall — any authenticated user can save unlimited plans (no `getTJAIAccess`). If save is the persistence step after `/generate` (which is gated), this is fine; if accessed directly it bypasses. Acceptable as-is.

### /api/tjai/settings (src/app/api/tjai/settings/route.ts, 30 lines)
- ✅ Auth
- 🟢 Manual whitelist of `persona/memory_enabled/tts_autoplay` (`settings/route.ts:23-27`) — clean enough; zod would be marginal improvement.

### /api/tjai/share-card (src/app/api/tjai/share-card/route.ts, 12 lines)
- ✅ Auth
- 🔴 **Stub route** — returns `{ ok: true }` always (`share-card/route.ts:7-11`). No share-card generation. Either implement (OG image render) or delete the route. Patch: if shipping, integrate `@vercel/og`; if not, return 501 so the UI can hide the button.

### /api/tjai/streak (src/app/api/tjai/streak/route.ts, 13 lines)
- ✅ Auth, ✅ Clean

### /api/tjai/suggestions (src/app/api/tjai/suggestions/route.ts, 130 lines)
- ✅ Auth, ✅ Paywall, ✅ Rate limit
- 🟡 No try/catch around `gatherSignals` / `generateSuggestion` / `persistSuggestion` (`suggestions/route.ts:93-110`) — any of those throws → 500 with no shaped error. Patch: wrap.
- 🟡 PATCH validates `decision` to `accepted|rejected` (`:124`) — good. But `decideSuggestion` returns boolean `false` on missing-row (`:128`) which 500s — semantically should be 404.

### /api/tjai/swap-meal (src/app/api/tjai/swap-meal/route.ts, 64 lines)
- 🔴 **SDK mismatch** — `callClaude, extractJsonBlock` from `tjai-anthropic` (`swap-meal/route.ts:4`). Patch: swap to `callOpenAI({...,jsonMode:true})`.
- ✅ Auth, ✅ Paywall
- 🟡 `details: String(error)` in error response (`:61`) leaks raw provider error text to client (could include API key fragments depending on what Anthropic returns). Patch: drop `details` or sanitize.

### /api/tjai/trial-consume-message (src/app/api/tjai/trial-consume-message/route.ts, 58 lines)
- ✅ Auth, admin bypass
- 🔴 **Race / bypass**: this is the only place `messages_used` increments and it's called from the client. Combined with `/chat` not enforcing the increment, this is the ship-blocker described in the summary. Patch: move increment into `/chat` after the access gate; keep this route for backwards compat or delete.
- 🟡 `update({ messages_used: nextUsed })` without `.eq("user_id",...)` constraint? Actually it has `.eq("user_id", authResult.user.id)` (`:50`), good. But if no row exists (new user), the update is a no-op and returns no error. Patch: use upsert.

### /api/tjai/trial-status (src/app/api/tjai/trial-status/route.ts, 63 lines)
- ✅ Auth
- 🟡 `if (!current || shouldReset)` upsert (`trial-status/route.ts:33-49`) — auto-resets the trial every time it expires. Intent unclear: a user whose trial ended 6 months ago gets a fresh 30-day trial just by hitting GET. Patch: only initialize once; let expiry stay sticky.
- 🟢 Hardcoded `30 * 24 * 60 * 60 * 1000` (`:35`) — should pull from `TJAI_TRIAL_DURATION_DAYS` if exists in `trial-config`.

### /api/tjai/tts (src/app/api/tjai/tts/route.ts, 115 lines)
- ✅ Auth, ✅ Rate limit, ✅ Paywall
- 🟡 `error: err instanceof Error ? err.message : "TTS failed"` (`:111`) leaks ElevenLabs error verbatim to client. Patch: log and return generic.
- 🟡 No max length on `text` (`:87-88`) — ElevenLabs charges per character. A user can POST a 100k-char string. Patch: cap `text.slice(0,1000)` or 413 above.

### /api/tjai/weekly-check-in (src/app/api/tjai/weekly-check-in/route.ts, 129 lines)
- ✅ Auth, ✅ Strong validation (`weekly-check-in/route.ts:57-62`)
- 🟡 Two `catch {}` swallow blocks (`:105`, `:123`) — streak/badge evaluation and async suggestion generation silently fail, leaving the user without feedback when their badge actually unlocked. Patch: log to `console.error`.
- 🟡 Best-effort relation-not-found fallback (`:35-39`, `:85-87`) is a bandage. If the migration `20260420120000` hasn't run, this becomes a 503 forever. Patch: add a CI check that all migrations are applied.

## Cross-cutting issues

1. **SDK mismatch (5 routes)** — `blog-generate`, `grocery-list`, `meal-prep`, `swap-meal`, plus the `extractJsonBlock` helper consumer pattern, all import `tjai-anthropic` while the project standard is `tjai-openai`. They will fail unless `ANTHROPIC_API_KEY` is set. The Anthropic file (`src/lib/tjai-anthropic.ts`) is dead-loaded by these and should either be deleted or every consumer migrated.
2. **`as any` plan_json casts** — at least 4 routes (`progress:97`, `replace-meal:51`, `chat:201`, others) cast `plan_json` to `any`. A single zod schema for `TJAIPlan` reused at the boundary would catch every corruption. Patch: build `TJAIPlanSchema` and `parse()` once where `getLatestTjaiPlan` returns.
3. **Error response inconsistency** — `/save` returns 200-with-warning, `/evaluate-progress` returns 200-with-error-string, `/share-card` returns 200-stub, others return shaped 4xx/5xx. Pick one shape and document it.
4. **Optimistic client gating** — `/chat`, `/request-coach-review`, and `/trial-consume-message` all rely on the client to behave. Server should always re-check.
5. **Silent error swallowing** — `catch {}` patterns in `/chat:267-273`, `/weekly-check-in:105`, `:123`. At minimum log to `console.error`.

## Schema mismatches
- **`workout_logs.exercise` vs `exercise_name`**: `chat/route.ts:163` selects `exercise`; `progress/route.ts:24` selects `exercise_name`; `progress/route.ts:62` falls back to `exercise_name ?? exercise`. The two columns exist due to overlapping migrations (`20260316000100` defines `exercise`, `20260407150000` adds `exercise_name`). **Real bug**: the chat route selects only `exercise`, so any workout logged via the new code path (`exercise_name` only) won't appear in chat context. Patch: select both, coalesce.
- **`tjai_weekly_check_ins`**: route returns 503 on missing relation, indicating awareness of partial migration state. Verify migration `20260420120000` is applied to prod.
- No schema mismatches found for `tjai_long_memory`, `tjai_trial_usage`, `tjai_chat_messages`, `tjai_weekly_insights`, `saved_tjai_plans`, `coach_review_requests`, `tjai_plan_purchases`, `user_chat_preferences`, `tjai_ai_call_logs`, `program_progress`, `progress_entries`, `user_subscriptions`, `profiles`.

## Recommended patches (prioritized for Phase C)

1. 🔴 **Move `messages_used` increment server-side into `/chat`** after the access gate (and keep it for `tjai_chat_messages` insertion atomically). Delete or stub `/trial-consume-message`. Without this, free trial doesn't exist. (`chat/route.ts:88`)
2. 🔴 **Migrate 4 routes off `tjai-anthropic`** to `tjai-openai` (`blog-generate:3`, `grocery-list:3`, `meal-prep:3`, `swap-meal:4`). Delete `tjai-anthropic.ts` once empty.
3. 🔴 **Fix `/request-coach-review` paywall** — replace `body.isPro` trust with server-side `getTJAIAccess(tier).canRequestCoachReview` (or equivalent). (`request-coach-review/route.ts:14`)
4. 🔴 **Fix `/save` failure shape** — return 500 (not 200+warning) when DB write fails so `tjai-shell.tsx:172` can react. (`save/route.ts:38,43`)
5. 🔴 **Gate `/export-pdf`** behind `access.canDownloadPdf` like `/generate-pdf`. Free users currently bypass the upgrade wall. (`export-pdf/route.ts:20-31`)
6. 🔴 **Implement or remove `/share-card`** — currently a stub. (`share-card/route.ts:7-11`)
7. 🟡 **Fix `evaluate-progress` weekly-rate division** — divide by elapsed weeks, not entry count. (`evaluate-progress/route.ts:81`)
8. 🟡 **Add `TJAIPlanSchema` zod validator** at the `getLatestTjaiPlan` boundary; remove `as any` casts in `progress`, `replace-meal`, `chat`.
9. 🟡 **Fix `chat` workout selector** to select both `exercise` and `exercise_name`. (`chat/route.ts:163`)
10. 🟡 **Cap `tts` text length** at ~1000 chars. (`tts/route.ts:88`)
11. 🟡 **Stop returning Anthropic/OpenAI error text** to the client in `swap-meal:61` and `tts:111`.
12. 🟡 **Remove auto-trial-reset** in `trial-status` — initialize once, then leave expired. (`trial-status/route.ts:33`)
13. 🟢 Replace `catch {}` swallow blocks with `console.error` logs in `chat:267-273`, `weekly-check-in:105,123`.
14. 🟢 Wrap unprotected DB/PDF/AI calls in try/catch with shaped 500: `access:15`, `generate-pdf:46`, `blog-generate:26`, `suggestions:93-110`.
15. 🟢 No file exceeds the 500-line cap; `chat/route.ts` (317) is the largest and should stay watched as streaming logic grows.

No leftover non-zero prices found in any route file (verified — `tjai-pricing.ts` exports zeros and no route hardcodes a `$<n>` user-facing string outside that helper).
