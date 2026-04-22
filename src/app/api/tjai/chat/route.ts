import { NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import {
  buildChatCoachSystemPrompt,
  fallbackCoachReply,
  isLikelyFitnessQuestion,
  logChatCoachContextBuilt,
  routeCoachChatIntent,
  TJAI_CHAT_DOMAIN_GUARD,
  type ChatCoachPlanRow,
  type ChatCoachPreferenceRow,
  type ChatCoachProgressEntry,
  type ChatCoachWorkoutLog
} from "@/lib/tjai";
import { isSupportedLocale } from "@/lib/i18n";
import { getTJAIAccess } from "@/lib/tjai-access";
import { buildTjaiMemorySnapshot, getLatestTjaiPlan } from "@/lib/tjai-plan-store";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { callOpenAI, streamOpenAI } from "@/lib/tjai-openai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type HistoryRow = { role: "user" | "assistant"; content: string };

async function extractPreference(message: string): Promise<{ key: string | null; value: string | null }> {
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) return { key: null, value: null };
  try {
    const raw = await callOpenAI({
      system: 'Extract user food/training preferences only. Return strict JSON: {"key":"...","value":"..."} or {"key":null}. No markdown.',
      user: message,
      maxTokens: 120,
      jsonMode: true
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
    const admin = getSupabaseServerClient();
    if (!admin) return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });

    const body = await request.json().catch(() => null);
    const message = String(body?.message ?? "").trim();
    const locale = String(body?.locale ?? "en");
    const conversationId = String(body?.conversationId ?? "").trim() || crypto.randomUUID();

    if (!message) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400 });
    }

    const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
    const [{ data: sub }, { data: usage }, { data: purchase }, { data: profile }] = await Promise.all([
      admin.from("user_subscriptions").select("tier,status").eq("user_id", auth.user.id).maybeSingle(),
      admin.from("tjai_trial_usage").select("messages_used,trial_started_at,trial_ends_at").eq("user_id", auth.user.id).maybeSingle(),
      admin.from("tjai_plan_purchases").select("id").eq("user_id", auth.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
      isAdminByEmail ? Promise.resolve({ data: { role: "admin" } }) : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
    ]);
    const isAdmin = isAdminByEmail || profile?.role === "admin";
    const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
    const trialEndsAt = usage?.trial_ends_at ? new Date(usage.trial_ends_at).getTime() : 0;
    const remaining = isAdmin ? 999 : Math.max(0, trialEndsAt > Date.now() ? 10 - Number(usage?.messages_used ?? 0) : 0);
    const access = getTJAIAccess(tier, {
      hasOneTimePlanPurchase: Boolean(purchase?.id),
      coreTrialMessagesRemaining: remaining,
      isAdmin
    });
    if (!access.canUseChat) {
      return new Response(JSON.stringify({ error: "Upgrade required for TJAI chat." }), { status: 402, headers: { "Content-Type": "application/json" } });
    }

    if (!isLikelyFitnessQuestion(message)) {
      const guarded = TJAI_CHAT_DOMAIN_GUARD;
      await auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: guarded }
      ]);
      return new Response(JSON.stringify({ message: guarded, conversationId }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[TJAI chat] OPENAI_API_KEY is not set — aborting with 503.");
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

    const [planRow, memorySnapshot, { data: historyRows }, { data: prefRows }, recentData] = await Promise.all([
      getLatestTjaiPlan(auth.supabase, auth.user.id),
      buildTjaiMemorySnapshot(auth.supabase, auth.user.id),
      auth.supabase
        .from("tjai_chat_messages")
        .select("role,content,created_at")
        .eq("user_id", auth.user.id)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(20),
      auth.supabase
        .from("user_chat_preferences")
        .select("preference_key,preference_value")
        .eq("user_id", auth.user.id),
      Promise.all([
        auth.supabase
          .from("workout_logs")
          .select("workout_date,exercise,sets,reps,weight_kg,duration_minutes")
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
      }))
    ]);

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

    const systemPrompt = buildChatCoachSystemPrompt({
      planRow: planRow as ChatCoachPlanRow | null,
      memorySnapshot,
      preferences,
      workouts: recentData.workouts,
      entries: recentData.entries,
      coachIntent,
      locale: isSupportedLocale(locale) ? locale : "en"
    });

    const messages = [
      ...history.slice(-12).map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: message }
    ];

    try {
      const upstream = await streamOpenAI({ system: systemPrompt, messages, maxTokens: 700 });
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

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`));
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
