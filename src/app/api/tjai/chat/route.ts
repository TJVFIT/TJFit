import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const message = String(body?.message ?? "").trim();
  const planContext = body?.planContext;
  const metricsContext = body?.metricsContext;
  const answersContext = body?.answersContext;
  const history = Array.isArray(body?.history) ? body.history : [];
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const prompt = `Context:
Plan: ${JSON.stringify(planContext)}
Metrics: ${JSON.stringify(metricsContext)}
Answers: ${JSON.stringify(answersContext)}
History: ${JSON.stringify(history)}
User message: ${message}`;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1800,
      stream: true,
      system:
        "You are TJAI, TJFit's AI fitness coach. Answer with specifics from the user's plan and metrics. Keep concise and practical.",
      messages: [{ role: "user", content: prompt }]
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
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n[Response interrupted]"));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}

