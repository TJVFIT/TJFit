import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = await request.json().catch(() => null);
  const message = String(body?.message ?? "").trim();
  const conversationId = String(body?.conversationId ?? "").trim();
  const locale = String(body?.locale ?? "en");
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const [{ data: subscription }, { data: historyRows }, { data: planRow }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin
      .from("tjai_chat_messages")
      .select("role,content")
      .eq("user_id", auth.user.id)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("saved_tjai_plans")
      .select("plan_json")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const tier = (subscription?.tier ?? "core") as "core" | "pro" | "apex";
  if (tier === "core") {
    const { data: usage } = await admin
      .from("tjai_trial_usage")
      .select("messages_used")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (Number(usage?.messages_used ?? 0) >= 10) {
      return NextResponse.json({ error: "Trial message limit reached.", code: "LIMIT_REACHED" }, { status: 402 });
    }
  }
  if (tier === "pro") {
    return NextResponse.json({ error: "TJAI chat is available for Apex or Core trial users.", code: "TJAI_CHAT_UPGRADE_REQUIRED" }, { status: 402 });
  }

  await admin.from("tjai_chat_messages").insert({
    user_id: auth.user.id,
    conversation_id: conversationId,
    role: "user",
    content: message
  });

  const history = (historyRows ?? [])
    .slice()
    .reverse()
    .map((row) => ({
      role: row.role === "assistant" ? "assistant" : "user",
      content: row.content
    }));

  const planSummary = (planRow?.plan_json as { summary?: Record<string, unknown> } | null)?.summary ?? {};

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      stream: true,
      system: `You are TJAI, TJFit's AI fitness and nutrition coach.
You are warm, motivating, expert, and direct.
Always respond in the user's language.
Preferred locale: ${locale}
User's plan summary: ${JSON.stringify(planSummary)}
You have full context of this user's goals, body stats, training split, and dietary targets.
Reference their specific plan data when relevant.`,
      messages: [...history, { role: "user", content: message }]
    })
  });
  if (!upstream.ok || !upstream.body) {
    const raw = await upstream.text();
    return NextResponse.json({ error: "Chat generation failed", details: raw.slice(0, 300) }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      let fullResponse = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
            const parsed = JSON.parse(data);
            const delta = parsed?.delta?.text ?? parsed?.content_block?.text ?? parsed?.content_block_delta?.text ?? "";
            if (delta) {
              fullResponse += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n[Response interrupted]"));
      } finally {
        if (fullResponse.trim()) {
          await admin.from("tjai_chat_messages").insert({
            user_id: auth.user.id,
            conversation_id: conversationId,
            role: "assistant",
            content: fullResponse.trim()
          });
        }
        controller.close();
        reader.releaseLock();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked"
    }
  });
}

