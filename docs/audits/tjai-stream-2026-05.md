# TJAI Streaming / Stop / Retry Audit — 2026-05-27

**Method:** static review of [src/app/api/tjai/chat/route.ts](../../src/app/api/tjai/chat/route.ts), [src/components/tjai/tjai-chat.tsx](../../src/components/tjai/tjai-chat.tsx), [src/lib/tjai-openai.ts](../../src/lib/tjai-openai.ts). Cross-referenced against LASTCLAUDECODE.md Cycle 095.

## Architecture

The chat flow is two-mode:
1. **Streamed SSE** (`Content-Type: text/event-stream`) — primary path. Server iterates `streamOpenAI`'s reader, emits `data: {delta, conversationId}\n\n` chunks. Client reader appends each `delta` to the trailing assistant message in `history[]`.
2. **JSON fallback** (`Content-Type: application/json`) — used for 402 (trial limit), 500 (rpc fail), 503 (no OPENAI_API_KEY). Client branches on content-type at [tjai-chat.tsx line 145](../../src/components/tjai/tjai-chat.tsx).

## Findings

### ✓ Working — server-side abort + credit safety

- [chat/route.ts line 286, 296](../../src/app/api/tjai/chat/route.ts): `void upstream.cancel()` aborts the OpenAI stream when trial-credit consumption fails OR limit is reached. The 402/500 response goes back **before any tokens stream to the user**, so credits are NOT charged for an aborted stream.
- [tjai-openai.ts line 57-58, 163-164](../../src/lib/tjai-openai.ts): each `callOpenAI` / `streamOpenAI` request has its own `AbortController` wired to a timeout. Idle requests die after `OPENAI_TIMEOUT_MS` rather than hanging indefinitely.

### ✓ Working — trial credit refund race-safety

The race between "OpenAI accepts request" and "trial credit consumed" is handled inline:

```ts
const upstream = await streamOpenAI(...);          // 1. OpenAI 200
if (isCoreTrial) {
  const { ok, reason } = await admin.rpc("consume_trial_message", ...);
  if (!ok) {
    void upstream.cancel();                         // 2. abort if RPC says limit hit
    return 402;                                     // 3. user pays nothing
  }
}
// 4. otherwise stream the chunks
```

This is the right order. Cycle 095's "do not charge credits on failed stream" rule is satisfied.

### ⚠ P1 — no client-side stop button

[tjai-chat.tsx line 127-216](../../src/components/tjai/tjai-chat.tsx) sets `loading=true` and starts reading the SSE body, but the client **does NOT create an `AbortController`** for the `fetch("/api/tjai/chat", ...)` call. There is no way for the user to interrupt a long generation.

Consequences:
- A 700-token Apex plan stream that's going off the rails has no exit. User can only navigate away (which closes the connection — fine — but they lose the partial message).
- Cycle 095 explicitly requires `stop` button + abort wiring.

**Fix sketch (Phase 23 visual upgrade slot):**
```tsx
const abortRef = useRef<AbortController | null>(null);
// in send():
const ctrl = new AbortController();
abortRef.current = ctrl;
const res = await fetch("/api/tjai/chat", { signal: ctrl.signal, ... });
// add a Stop button while loading:
{loading && <button onClick={() => abortRef.current?.abort()}>Stop</button>}
```

The server already handles client disconnects (the reader read loop sees `done` when the client closes). Adding client-side cancel is a pure-client change; no backend work needed.

### ⚠ P1 — no retry-without-duplicate

When the stream throws (network drop, parse error, etc.), the catch block at [line 216-228](../../src/components/tjai/tjai-chat.tsx) sets `apiError` and shows a fallback message, but the **user's message and the empty assistant message are still in `history[]`**. There's no "retry" button — the user has to re-type their message, which then gets appended again, producing two copies.

Cycle 095 rule: retry preserves conversation id and context, does NOT duplicate the user message.

**Fix sketch:**
- Store the last failed user-message in state.
- Render a Retry button next to `apiError`.
- On retry: pop the empty assistant row, re-send the same text, do NOT append a new user row.

### ⚠ P2 — partial message handling on disconnect

If the user navigates away mid-stream, the assistant `history[]` row contains whatever streamed before the disconnect. That partial message is shown on next chat load (if conversation is persisted). The doc's Cycle 095 says: "partial messages should be marked incomplete or discarded consistently."

Current behavior: persisted as-is, no marker. Possible mitigation:
- Detect non-finalized streams in the route and tag the saved message with `is_complete: false`.
- Client can render a "(message ended early)" suffix or hide incomplete rows.

### ⚠ P2 — thinking indicator vs. streaming indicator

[tjai-chat.tsx line 128, 135](../../src/components/tjai/tjai-chat.tsx) sets `thinking=true` for `getCoachThinkingDelayMs()` (a UX hold to make the model feel deliberate), then sets it to false **before** the fetch starts. So between "thinking off" and the first SSE delta arriving, the user sees… an empty assistant bubble with no indicator. This is the gap Phase 23 (visual upgrade — typing indicator with three pulsing dots) is meant to close.

Recommendation: keep `thinking=true` until the first `delta` arrives, then flip. Or render the three-dot indicator while `loading && history[last].content === ""`.

### ✓ Working — conversation id reuse

[tjai-chat.tsx line 171, 208](../../src/components/tjai/tjai-chat.tsx): conversation id is set from the first server message in either JSON or streaming path and reused on subsequent calls. This means retry would correctly land on the same conversation thread if wired up.

### ✓ Working — SSE chunk parse safety

[tjai-chat.tsx line 211-213](../../src/components/tjai/tjai-chat.tsx): malformed SSE chunks are caught in a `try/catch` and silently skipped. Server-side at [chat/route.ts line 320+](../../src/app/api/tjai/chat/route.ts) the same pattern. No crashes from bad lines.

### ⓘ Observation — fallback reply on empty assistant

When `assistantText` is empty (model returned nothing), the client uses `copy.fallbackReply` instead. That copy is localized via the chat copy module. No empty bubbles ship to users. Good.

## Eval coverage gap

None of the 17 cases in [tests/tjai-eval/cases.json](../../tests/tjai-eval/cases.json) test stop/retry/disconnect flow. Adding 2-3 fault-injection cases (network drop mid-stream, abort mid-stream, double-send race) would harden Phase 11b safety-guard work later.

## Recommended next actions (not in this audit's commit)

| Severity | Action | Phase to land in |
|---|---|---|
| P1 | Wire client-side `AbortController` + Stop button | Phase 23 (visual upgrade — already in scope for "TJAI chat polish") |
| P1 | Wire Retry-without-duplicate on stream failure | Phase 23 |
| P2 | Mark partial assistant messages with `is_complete: false` | Phase 5 ⚠ (TJAI generate refund-safety) — same backend territory |
| P2 | Keep `thinking` indicator until first delta | Phase 23 |
| P3 | Add disconnect-mid-stream eval cases | Phase 21 follow-up |

## What this audit did NOT cover

- Resumable streams (TJFit does not use them today — Vercel AI SDK abort/resume tradeoff doesn't apply).
- TJAI plan generation (`/api/tjai/generate`) abort/refund flow — Phase 5 ⚠ territory.
- Chat persistence layer (conversation save/load).
- TTS streaming on the speaker-button (separate audit, Phase 17 voice).
