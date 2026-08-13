import { NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import {
  buildChatCoachSystemPrompt,
  buildCoachState,
  detectMedicalRisk,
  extractFactsFromMessage,
  fallbackCoachReply,
  formatCoachStateForPrompt,
  formatMemoryBlock,
  loadLongMemoryFacts,
  loadTjaiUserSettings,
  logChatCoachContextBuilt,
  medicalSafetyResponse,
  persistFacts,
  recordTjaiEvent,
  routeCoachChatIntent,
  type ChatCoachPlanRow,
  type ChatCoachPreferenceRow,
  type ChatCoachProgressEntry,
  type ChatCoachWorkoutLog
} from "@/lib/tjai";
import { buildCatalogBlock } from "@/lib/tjai/catalog-context";
import { pickCoachSuggestionKeys } from "@/lib/tjai/chat-suggestions";
import { coachIntentMaxTokens } from "@/lib/tjai/orchestrator/chat-intent";
import { buildReadinessProfile } from "@/lib/tjai/readiness";
import { buildTjaiUserProfile } from "@/lib/tjai-intake";
import { isSupportedLocale } from "@/lib/i18n";
import { getTJAIAccess } from "@/lib/tjai-access";
import { buildTjaiMemorySnapshot, getLatestTjaiPlan } from "@/lib/tjai-plan-store";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { llmCall, llmStream } from "@/lib/tjai/llm";
import { isTaskAvailable } from "@/lib/tjai/provider-policy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type HistoryRow = { role: "user" | "assistant"; content: string };

// Deterministic digest of conversation turns older than the verbatim window:
// one role-tagged bullet per message (first ~110 chars), hard-capped at 20
// lines / 1600 chars so long chats keep continuity without extra LLM calls.
const DIGEST_MAX_LINES = 20;
const DIGEST_MAX_CHARS = 1600;
const DIGEST_SNIPPET_CHARS = 110;

function buildEarlierConversationDigest(earlier: HistoryRow[]): string {
  if (earlier.length === 0) return "";
  const lines: string[] = [];
  let chars = 0;
  for (const turn of earlier.slice(-DIGEST_MAX_LINES)) {
    const snippet = turn.content.replace(/\s+/g, " ").trim().slice(0, DIGEST_SNIPPET_CHARS);
    if (!snippet) continue;
    const line = `- ${turn.role === "user" ? "User" : "Coach"}: ${snippet}`;
    if (chars + line.length + 1 > DIGEST_MAX_CHARS) break;
    lines.push(line);
    chars += line.length + 1;
  }
  return lines.join("\n");
}

async function extractPreference(message: string): Promise<{ key: string | null; value: string | null }> {
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) return { key: null, value: null };
  try {
    const raw = await llmCall({
      task: "chat_preference_extract",
      system: 'Extract user food/training preferences only. Return strict JSON: {"key":"...","value":"..."} or {"key":null}. No markdown.',
      user: message,
      maxTokens: 120,
      jsonMode: true,
      // Cheap utility extraction — gpt-4o-mini is ~95% cheaper than gpt-4o
      // for a task this simple. The chat reply itself still uses gpt-4o.
      openaiModel: "gpt-4o-mini",
      route: "tjai/chat"
    });
    const parsed = JSON.parse(raw) as { key?: string | null; value?: string | null };
    return {
      key: typeof parsed?.key === "string" && parsed.key.trim().length > 0 ? parsed.key.trim() : null,
      value: typeof parsed?.value === "string" && parsed.value.trim().length > 0 ? parsed.value.trim() : null
    };
  } catch {
    return { key: null, value: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Rate limit: 30 messages/min per user (auth.user.id is the natural key
    // since this route is auth-gated; fall back to IP if user id is absent).
    const limiter = await rateLimit({
      key: `tjai-chat:${auth.user.id ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
      limit: 30,
      windowMs: 60_000
    });
    if (!limiter.success) {
      return new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 });
    }

    const admin = getSupabaseServerClient();
    if (!admin) return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });

    const body = await request.json().catch(() => null);
    const message = String(body?.message ?? "").trim();
    const locale = String(body?.locale ?? "en");
    const conversationId = String(body?.conversationId ?? "").trim() || crypto.randomUUID();

    if (!message) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400 });
    }

    // Context assembly fired NOW, before the access gates are awaited. It only
    // needs auth.user.id + conversationId, and the gates only decide whether we
    // proceed — so overlapping the two waves removes one full DB round-trip
    // from every message (the database is currently in ap-northeast-1, so a
    // round-trip is real money: ~250ms from Europe). On the rare denied path
    // the reads are simply abandoned — all cheap SELECTs, nothing mutating.
    const contextWave = Promise.all([
      getLatestTjaiPlan(auth.supabase, auth.user.id),
      buildTjaiMemorySnapshot(auth.supabase, auth.user.id),
      auth.supabase
        .from("tjai_chat_messages")
        .select("role,content,created_at")
        .eq("user_id", auth.user.id)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(40),
      auth.supabase
        .from("user_chat_preferences")
        .select("preference_key,preference_value")
        .eq("user_id", auth.user.id),
      Promise.all([
        auth.supabase
          .from("workout_logs")
          // Alias `exercise_name` → `exercise` so older readers (and the
          // ChatCoachWorkoutLog type) keep working unchanged. Trigger
          // `sync_workout_log_exercise_columns_trigger` keeps the legacy
          // `exercise` column and the newer `exercise_name` in lockstep
          // (migration 20260502120100), so reading either is equivalent.
          .select("workout_date,exercise:exercise_name,sets,reps,weight_kg,duration_minutes")
          .eq("user_id", auth.user.id)
          .order("workout_date", { ascending: false })
          .limit(14),
        auth.supabase
          .from("progress_entries")
          .select("entry_date,weight_kg,body_fat_percent,waist_cm")
          .eq("user_id", auth.user.id)
          .order("entry_date", { ascending: false })
          .limit(6)
      ]).then(([w, p]) => ({
        workouts: (w.data ?? []) as ChatCoachWorkoutLog[],
        entries: (p.data ?? []) as ChatCoachProgressEntry[]
      })),
      loadTjaiUserSettings(auth.supabase, auth.user.id),
      loadLongMemoryFacts(auth.supabase, auth.user.id, 30)
    ]);
    // If a gate early-returns below, nothing ever awaits contextWave — attach a
    // no-op handler so a rejection can't surface as an unhandled crash. A later
    // `await contextWave` still rejects normally for the happy path.
    contextWave.catch(() => {});

    const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
    const [{ data: sub }, { data: rawUsage }, { data: purchase }, { data: profile }] = await Promise.all([
      admin.from("user_subscriptions").select("tier,status").eq("user_id", auth.user.id).maybeSingle(),
      admin.from("tjai_trial_usage").select("messages_used,trial_started_at,trial_ends_at").eq("user_id", auth.user.id).maybeSingle(),
      admin.from("tjai_plan_purchases").select("id").eq("user_id", auth.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
      isAdminByEmail ? Promise.resolve({ data: { role: "admin" } }) : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
    ]);
    const isAdmin = isAdminByEmail || profile?.role === "admin";
    const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";

    // Self-seed the trial row when missing. Without this, a core user whose
    // dashboard never hit /api/tjai/trial-status (mobile, direct API, stale
    // cache) is permanently 402'd despite having free credits. trial-status
    // and consume_trial_message both treat row presence as the gate.
    let usage = rawUsage;
    if (!isAdmin && tier === "core" && !usage && !purchase?.id) {
      const start = new Date();
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const { data: seeded } = await admin
        .from("tjai_trial_usage")
        .upsert(
          {
            user_id: auth.user.id,
            messages_used: 0,
            trial_started_at: start.toISOString(),
            trial_ends_at: end.toISOString(),
            last_reset_at: start.toISOString()
          },
          { onConflict: "user_id" }
        )
        .select("messages_used,trial_started_at,trial_ends_at")
        .single();
      if (seeded) usage = seeded;
    }

    const trialEndsAt = usage?.trial_ends_at ? new Date(usage.trial_ends_at).getTime() : 0;
    const { TJAI_TRIAL_MESSAGE_LIMIT } = await import("@/lib/tjai/trial-config");
    const remaining = isAdmin ? 999 : Math.max(0, trialEndsAt > Date.now() ? TJAI_TRIAL_MESSAGE_LIMIT - Number(usage?.messages_used ?? 0) : 0);
    const access = getTJAIAccess(tier, {
      hasOneTimePlanPurchase: Boolean(purchase?.id),
      coreTrialMessagesRemaining: remaining,
      isAdmin
    });
    if (!access.canUseChat) {
      return new Response(
        JSON.stringify({ error: "Upgrade required for TJAI chat.", code: "access_denied" }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    const medicalRisk = detectMedicalRisk(message);
    if (medicalRisk) {
      const safeReply = medicalSafetyResponse(
        medicalRisk.category,
        isSupportedLocale(locale) ? locale : "en"
      );
      await auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: safeReply }
      ]);
      void admin.from("tjai_ai_call_logs").insert({
        user_id: auth.user.id,
        route: "tjai/chat",
        task: "safety_refusal",
        provider: "guard",
        model: `medical:${medicalRisk.category}`,
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_tokens: 0,
        cache_read_tokens: 0,
        latency_ms: 0,
        cost_usd: 0,
        ok: true
      });
      recordTjaiEvent(admin, {
        event: "safety_guard_triggered",
        userId: auth.user.id,
        conversationId,
        locale: isSupportedLocale(locale) ? locale : "en",
        riskLevel: "critical",
        outcome: "aborted",
        metadata: { category: medicalRisk.category, route: "tjai/chat" }
      });
      return new Response(JSON.stringify({ message: safeReply, conversationId, refused: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // TJAI answers any topic now (owner directive). The fitness-domain guard
    // was removed so general questions get a real answer instead of a canned
    // redirect. The medical-safety guard above still runs first, and the
    // system prompt keeps TJAI's coaching persona for on-brand replies.

    // TJAI is offline when no LLM provider is configured for chat streaming.
    if (!isTaskAvailable("chat_stream")) {
      console.error("[TJAI chat] No LLM provider configured for chat_stream — aborting with 503.");
      return new Response(
        JSON.stringify({
          error: "TJAI is temporarily offline. Please try again shortly.",
          code: "TJAI_UNAVAILABLE"
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", "Retry-After": "30" }
        }
      );
    }

    // Core-trial users get an atomic per-message RPC consume below, after
    // OpenAI returns a usable response — that way failed OpenAI calls don't
    // burn a trial credit. The earlier `remaining` check (above) is a cheap
    // pre-gate; the RPC is the source of truth and re-checks under a lock.
    const isCoreTrial = !isAdmin && tier === "core" && !purchase?.id;

    // Fired before the access gates (see above) — by the time the gates have
    // resolved, these reads are usually already back or nearly so.
    const [planRow, memorySnapshot, { data: historyRows }, { data: prefRows }, recentData, userSettings, longMemoryFacts] =
      await contextWave;

    const history: HistoryRow[] = (historyRows ?? []).reverse().flatMap((row) => {
      if ((row.role === "user" || row.role === "assistant") && typeof row.content === "string") {
        return [{ role: row.role as "user" | "assistant", content: row.content }];
      }
      return [];
    });

    const preferences = (prefRows ?? []) as ChatCoachPreferenceRow[];

    logChatCoachContextBuilt({
      userId: auth.user.id,
      conversationId,
      historyTurns: history.length
    });

    const coachIntent = routeCoachChatIntent(message);

    const longMemoryBlock = userSettings.memory_enabled ? formatMemoryBlock(longMemoryFacts) : "";

    const typedPlanRow = planRow as ChatCoachPlanRow | null;
    const readiness = typedPlanRow?.answers_json
      ? buildReadinessProfile(buildTjaiUserProfile(typedPlanRow.answers_json))
      : null;
    const coachStateBlock = formatCoachStateForPrompt(
      buildCoachState({
        planRow: typedPlanRow,
        workouts: recentData.workouts,
        entries: recentData.entries,
        adaptiveCheckpoint: memorySnapshot.adaptiveCheckpoint,
        readiness
      })
    );

    const systemPrompt = buildChatCoachSystemPrompt({
      planRow: typedPlanRow,
      memorySnapshot,
      preferences,
      workouts: recentData.workouts,
      entries: recentData.entries,
      coachIntent,
      locale: isSupportedLocale(locale) ? locale : "en",
      persona: userSettings.persona,
      longMemoryBlock,
      coachStateBlock,
      catalogBlock: buildCatalogBlock(message, typedPlanRow?.goal ?? undefined),
      earlierConversationDigest: buildEarlierConversationDigest(history.slice(0, -12))
    });

    const messages = [
      ...history.slice(-12).map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: message }
    ];

    const maxTokens = coachIntentMaxTokens(coachIntent, message);

    try {
      const upstream = await llmStream({ task: "chat_stream", system: systemPrompt, messages, maxTokens });

      // OpenAI accepted the request (we have a 200 stream). Atomically consume
      // a trial credit now — if we lost the race against another concurrent
      // request, abort the upstream and return 402 without billing the user.
      if (isCoreTrial) {
        const { data: rpcRows, error: rpcError } = await admin.rpc("consume_trial_message", {
          p_user_id: auth.user.id,
          p_limit: TJAI_TRIAL_MESSAGE_LIMIT
        });
        if (rpcError) {
          console.error("[TJAI chat] consume_trial_message RPC failed", rpcError);
          void upstream.cancel();
          return new Response(
            JSON.stringify({ error: "Trial accounting failed.", code: "rpc_error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        const consume = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
          | { messages_used?: number; ok?: boolean; reason?: string }
          | null;
        if (!consume?.ok) {
          void upstream.cancel();
          return new Response(
            JSON.stringify({
              error: "Trial limit reached.",
              code: String(consume?.reason ?? "limit_reached"),
              messagesUsed: Number(consume?.messages_used ?? 0),
              messageLimit: TJAI_TRIAL_MESSAGE_LIMIT
            }),
            { status: 402, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = upstream.getReader();
      let assistantReply = "";
      let buffer = "";

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId })}\n\n`));
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (!payload || payload === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(payload) as {
                    choices?: Array<{ delta?: { content?: string } }>;
                  };
                  const delta = parsed.choices?.[0]?.delta?.content ?? "";
                  if (!delta) continue;
                  assistantReply += delta;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, conversationId })}\n\n`));
                } catch {
                  /* ignore malformed upstream chunk */
                }
              }
            }

            // Data-driven follow-up chips: keys only (the client owns the
            // localized text), computed from context already loaded above —
            // no extra queries, no extra LLM call.
            const suggestionKeys = pickCoachSuggestionKeys({
              hasPlan: Boolean(typedPlanRow),
              goal: typedPlanRow?.goal ?? null,
              workoutDates: recentData.workouts.map((w) => w.workout_date ?? null),
              entries: recentData.entries.map((e) => ({ weight_kg: e.weight_kg ?? null }))
            });
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true, conversationId, suggestionKeys })}\n\n`)
            );
            controller.close();
          } catch (streamError) {
            controller.error(streamError);
          } finally {
            reader.releaseLock();
            const finalReply = assistantReply.trim() || fallbackCoachReply(message, locale);
            void auth.supabase.from("tjai_chat_messages").insert([
              { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
              { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: finalReply }
            ]);
            void extractPreference(message).then(async (pref) => {
              if (pref.key && pref.value) {
                await auth.supabase.from("user_chat_preferences").upsert(
                  { user_id: auth.user.id, preference_key: pref.key, preference_value: pref.value },
                  { onConflict: "user_id,preference_key" }
                );
              }
            });
            if (userSettings.memory_enabled) {
              void extractFactsFromMessage(message, auth.user.id).then((facts) =>
                persistFacts(auth.supabase, auth.user.id, facts)
              );
            }
          }
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive"
        }
      });
    } catch {
      const reply = fallbackCoachReply(message, locale);

      void auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: reply }
      ]);

      void extractPreference(message).then(async (pref) => {
        if (pref.key && pref.value) {
          await auth.supabase.from("user_chat_preferences").upsert(
            { user_id: auth.user.id, preference_key: pref.key, preference_value: pref.value },
            { onConflict: "user_id,preference_key" }
          );
        }
      });

      return new Response(JSON.stringify({ message: reply, conversationId }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TJAI] Unhandled error:", msg);
    return new Response(JSON.stringify({ error: "Chat failed" }), { status: 500 });
  }
}
