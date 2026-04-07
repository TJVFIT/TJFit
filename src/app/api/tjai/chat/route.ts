import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DOMAIN_GUARD =
  "Please ask me stuff related to health, sports, coaching, or the website.";

function isFitnessDomainMessage(message: string) {
  const m = message.toLowerCase();
  const keywords = [
    "fitness",
    "health",
    "sport",
    "sports",
    "workout",
    "training",
    "coach",
    "coaching",
    "diet",
    "nutrition",
    "protein",
    "calorie",
    "macro",
    "fat loss",
    "muscle",
    "gym",
    "home workout",
    "injury",
    "recovery",
    "tdee",
    "tjfit",
    "website",
    "program",
    "community",
    "blog"
  ];
  return keywords.some((k) => m.includes(k));
}

function buildFallbackReply(message: string, locale: string) {
  const m = message.toLowerCase();
  if (!isFitnessDomainMessage(message)) return DOMAIN_GUARD;
  if (m.includes("chest") || m.includes("push")) {
    return locale === "ar"
      ? "بعد يوم الصدر: اعمل سحب خفيف (ظهر + بايسبس) أو كارديو منخفض الشدة. حافظ على التعافي: نوم 7-9 ساعات، بروتين كافٍ، وإحماء الكتف قبل أي تمارين ضغط."
      : "After chest day, do a light pull session (back + biceps) or low-intensity cardio. Prioritize recovery: 7-9h sleep, enough protein, and shoulder warm-up before pressing again.";
  }
  if (m.includes("fat") || m.includes("lose weight")) {
    return locale === "ar"
      ? "لخسارة الدهون: ابدأ بعجز 300-500 سعرة يومياً، بروتين 1.6-2.2 غ/كغ، تمارين مقاومة 3-4 أيام، و8-10 آلاف خطوة."
      : "For fat loss: start with a 300-500 kcal daily deficit, protein around 1.6-2.2 g/kg, resistance training 3-4 days/week, and 8-10k daily steps.";
  }
  if (m.includes("muscle") || m.includes("bulk")) {
    return locale === "ar"
      ? "لبناء العضلات: فائض 200-300 سعرة، بروتين 1.6-2.2 غ/كغ، حمل تدريجي، وتتبّع الأداء أسبوعياً."
      : "For muscle gain: use a 200-300 kcal surplus, protein 1.6-2.2 g/kg, progressive overload, and weekly performance tracking.";
  }
  if (m.includes("tdee")) {
    return locale === "ar"
      ? "يمكنك استخدام حاسبة TDEE في الموقع من قسم Start Free لتحديد سعرات الصيانة ثم ضبط الهدف (تنشيف/زيادة)."
      : "Use the website TDEE calculator in Start Free to estimate maintenance calories, then adjust for your goal (cut or gain).";
  }
  return locale === "ar"
    ? "أقدر أساعدك في التدريب، التغذية، التعافي، وبرامج TJFit. اذكر هدفك الحالي وسأعطيك خطة واضحة."
    : "I can help with training, nutrition, recovery, and TJFit programs. Tell me your current goal and I will give you a clear plan.";
}

function textResponse(text: string) {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}

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
  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  let isAdminByRole = false;
  if (!isAdminByEmail) {
    const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    isAdminByRole = profile?.role === "admin";
  }
  const isAdmin = isAdminByEmail || isAdminByRole;

  if (!isAdmin && !isFitnessDomainMessage(message)) {
    await admin.from("tjai_chat_messages").insert({
      user_id: auth.user.id,
      conversation_id: conversationId,
      role: "assistant",
      content: DOMAIN_GUARD
    });
    return textResponse(DOMAIN_GUARD);
  }

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
  if (!isAdmin && tier === "core") {
    const { data: usage } = await admin
      .from("tjai_trial_usage")
      .select("messages_used")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (Number(usage?.messages_used ?? 0) >= 10) {
      return NextResponse.json({ error: "Trial message limit reached.", code: "LIMIT_REACHED" }, { status: 402 });
    }
  }
  if (!isAdmin && tier === "pro") {
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

  if (!apiKey) {
    const fallback = buildFallbackReply(message, locale);
    await admin.from("tjai_chat_messages").insert({
      user_id: auth.user.id,
      conversation_id: conversationId,
      role: "assistant",
      content: fallback
    });
    return textResponse(fallback);
  }

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
Reference their specific plan data when relevant.
If the user asks about topics unrelated to fitness, health, sports, coaching, or the TJFit website, reply exactly with:
"${DOMAIN_GUARD}"`,
      messages: [...history, { role: "user", content: message }]
    })
  });
  if (!upstream.ok || !upstream.body) {
    const fallback = buildFallbackReply(message, locale);
    await admin.from("tjai_chat_messages").insert({
      user_id: auth.user.id,
      conversation_id: conversationId,
      role: "assistant",
      content: fallback
    });
    return textResponse(fallback);
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

