# TJAI Memory Dashboard — Cycle 093 Gap Audit — 2026-05-27

**Method:** static review of [supabase/migrations/20260426130000_tjai_settings_and_memory.sql](../../supabase/migrations/20260426130000_tjai_settings_and_memory.sql) (schema), [src/lib/tjai/long-memory.ts](../../src/lib/tjai/long-memory.ts) (row type + loader), [src/app/api/tjai/memory/route.ts](../../src/app/api/tjai/memory/route.ts) (API), [src/components/tjai/memory-client.tsx](../../src/components/tjai/memory-client.tsx) (UI). Cross-referenced against LASTCLAUDECODE.md Cycle 093 (Memory UX Controls).

## DB schema today

```sql
CREATE TABLE tjai_long_memory (
  id          uuid PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact        text NOT NULL,
  category    text NOT NULL DEFAULT 'general' CHECK (category IN (
                'goal','injury','preference','lift','milestone','constraint','general'
              )),
  source      text NOT NULL DEFAULT 'chat',
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- RLS: auth.uid() = user_id (FOR ALL)
-- Indexes: (user_id, created_at DESC) and (user_id, category)
-- ON DELETE CASCADE from auth.users — account-delete cleans up memories
```

`LongMemoryRow` mirrors the table 1:1.

## Cycle 093 requirements vs. current coverage

### Dashboard features

| Requirement | Schema supports | API exposes | UI shows | Gap |
|---|---|---|---|---|
| Category filter (7 categories) | ✓ (CHECK enum) | ✓ (GET returns category) | **Partial** — UI groups by category headings but no filter chips | P2 — add "All / Goals / Injuries / …" filter chips |
| Source (quiz/chat/inferred/user-added/coach-admin) | **Partial** — `source` column exists, default `"chat"`, no enum constraint | ✓ (returned in GET) | ❌ — never rendered | P2 — render `source` as a small chip near each fact; expand category enum to constrain source values |
| Created timestamp | ✓ | ✓ | ❌ — `created_at` returned but never displayed | P3 — render relative time ("3 days ago") next to each fact |
| Updated timestamp | ❌ | ❌ | ❌ | P3 — add `updated_at` column + auto-update trigger; surface "edited" badge if differs from `created_at` |
| Confidence (if inferred) | ❌ | ❌ | ❌ | P2 — add `confidence numeric(3,2)` column; UI shows low-confidence facts with a "review me" affordance |
| Last-used / referenced indicator | ❌ | ❌ | ❌ | P3 — add `last_referenced_at timestamptz`; bump it from chat retrieval. Helps users prune stale memories |
| Edit memory text | n/a (text is mutable) | **NEW** — `PATCH /api/tjai/memory` added in Plan2 phase 4 (commit `d0a37eb`) | ❌ — UI doesn't call PATCH yet | P1 — wire an inline-edit control in memory-client.tsx. Backend ready. |
| Delete single | n/a | ✓ `DELETE ?id=` | ✓ "forget" link | none |
| Clear all | n/a | ✓ `DELETE ?all=1` | ✓ "Wipe all" button + confirm dialog | none |
| Pause future memory | ✓ via [tjai_user_settings.memory_enabled](../../supabase/migrations/20260426130000_tjai_settings_and_memory.sql) | ✓ via `/api/tjai/settings` | ✓ Long-term memory toggle in memory-client | none — correct separation of concerns |
| Temporary chat / no-memory mode | **Partial** — memory_enabled toggle is global, not per-conversation | n/a | n/a | P2 — add per-conversation `is_ephemeral` flag, or a "temporary chat" mode toggle on the chat page itself |
| In-chat "What do you remember about me?" shortcut | n/a | n/a | ❌ | P3 — add a chat suggestion chip that opens the memory dashboard |

### Safety / control

| Cycle 093 requirement | Status |
|---|---|
| Sensitive memories require explicit consent | ❌ — no consent gate. Any fact extracted from chat lands in the table. P1 — at minimum, log sensitive categories (`injury`) with explicit user acknowledgement. |
| Deletion confirms what is removed vs retained logs | **Partial** — wipe-all uses `confirm()`. Doesn't disclose whether logs / chat transcripts persist after wipe. |
| Memory should not override current user message | n/a — handled at prompt-assembly time in `buildChatCoachSystemPrompt`. Confirmed in earlier audit. |
| ON DELETE CASCADE from auth.users | ✓ — account deletion removes memories automatically. Phase 11 (account-deletion audit) will confirm wider data-erasure scope. |

## Source-of-truth gap

The `source` column exists but is **defaulted to `'chat'`** with no UI control or enum constraint. The doc's expected sources:

| Source value | Used today? |
|---|---|
| `quiz` | No |
| `chat` | Default for everything |
| `inferred` | No |
| `user-added` | No |
| `coach`/`admin` | No |

So the `source` field exists but doesn't carry meaning. Recommendation: tighten the CHECK constraint to an enum and label the right write path on each insert (`chat`, `quiz`, `inferred`, `user_added`). UI then shows the badge.

## Memory write paths

- [src/lib/tjai/long-memory.ts line 115](../../src/lib/tjai/long-memory.ts) inserts to `tjai_long_memory` from the Anthropic-backed consolidation step. This is the *only* known write path — quiz answers, profile inputs, and chat extractions all funnel here.
- The TJAI quiz currently does NOT write to `tjai_long_memory`; it stores answers in a separate `tjai_user_memory` (structured) and lets the consolidation step decide what's durable enough to promote.
- No "user-added" write path exists. User can only delete, not add. Cycle 093 explicitly wants user-add.

## Recommended priorities

| Severity | Action | Phase to land in |
|---|---|---|
| P1 | Wire memory-client.tsx inline-edit → `PATCH /api/tjai/memory` | Phase 23 (TJAI chat polish) — or split into its own micro-phase |
| P1 | Sensitive-category consent gate for `injury` writes | Phase 5 ⚠ (TJAI generate refund-safety + structured) — sibling territory |
| P2 | Add `confidence numeric(3,2)` + `updated_at timestamptz` + `last_referenced_at timestamptz` columns; UI surfaces confidence | DB migration phase (separate ⚠ — Phase 18 RLS pass is the closest slot) |
| P2 | Constrain `source` to enum (`quiz / chat / inferred / user_added / coach / admin`) and start labeling writes | Same DB migration |
| P2 | Category filter chips in memory-client.tsx | Phase 23 |
| P2 | Per-conversation "temporary chat" toggle | Phase 23 sibling |
| P3 | Render `created_at` as relative time + add "in-chat: what do you remember?" suggestion chip | Phase 23 |
| P3 | Disclose what data persists after wipe-all in the confirm dialog | Phase 15 (form/error microcopy pass — copy work) |

## Eval coverage gap

None of the 17 cases in [tests/tjai-eval/cases.json](../../tests/tjai-eval/cases.json) test memory recall, edit, or sensitive-category writes. Adding 2-3 cases (e.g., "I told you last week I have a knee issue. Did you remember?", "Forget my injury", "What do you remember about me?") would harden any future memory work.

## What this audit did NOT cover

- The `tjai_user_memory` structured table (separate from long-memory; covered in profile/quiz audits).
- Memory retrieval ordering / relevance in `buildChatCoachSystemPrompt` (covered in Phase 9 stream audit indirectly).
- Cross-locale memory display (Phase 9 of Plan 1 already localized the UI chrome via `tjai-memory-copy.ts`; fact text itself stays in whatever language the user typed in).
