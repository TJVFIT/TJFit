import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DOMAIN_GUARD = "Please ask me stuff related to health, sports, coaching, or the website.";

type HistoryRow = { role: "user" | "assistant"; content: string };
type PreferenceRow = { preference_key: string; preference_value: string };

function isLikelyFitnessQuestion(message: string) {
  const m = message.toLowerCase();
  return [
    "workout",
    "work out",
    "training",
    "train",
    "exercise",
    "lift",
    "lifting",
    "strength",
    "hypertrophy",
    "reps",
    "sets",
    "rest day",
    "split",
    "fitness",
    "fat",
    "muscle",
    "body fat",
    "bulk",
    "cut",
    "lose weight",
    "gain weight",
    "diet",
    "nutrition",
    "meal",
    "meal prep",
    "calorie",
    "protein",
    "carb",
    "fat intake",
    "cardio",
    "tdee",
    "bmr",
    "coach",
    "coaching",
    "health",
    "wellness",
    "sleep",
    "hydration",
    "injury",
    "recovery",
    "rehab",
    "recovery",
    "program",
    "tjai",
    "tjfit",
    "community",
    "website",
    "supplement",
    "gym",
    "home workout",
    "chest",
    "back",
    "legs",
    "shoulders",
    "arm",
    "abs"
  ].some((k) => m.includes(k));
}

function fallbackCoachReply(message: string, locale: string) {
  if (!isLikelyFitnessQuestion(message)) return DOMAIN_GUARD;
  if (locale === "tr") {
    return "Hizli plan: 3-4 gun kuvvet + gunluk adim hedefi + protein odakli beslenme ile basla. Her hafta agirlik veya tekrar arttir, 7-9 saat uyku ve duzenli su tuketimi ekle. Saglik sorunun varsa doktoruna danis.";
  }
  if (locale === "ar") {
    return "ابدأ بخطة بسيطة: 3-4 أيام مقاومة أسبوعياً + خطوات يومية + بروتين كافٍ. زِد الحمل تدريجياً كل أسبوع، ونَم 7-9 ساعات مع ترطيب جيد. إذا لديك حالة صحية خاصة فاستشر مختصاً.";
  }
  if (locale === "es") {
    return "Empieza simple: 3-4 dias de fuerza por semana + objetivo de pasos diarios + proteina suficiente. Sube carga o repeticiones progresivamente, duerme 7-9h y mantente hidratado. Si tienes una condicion medica, consulta a un profesional.";
  }
  if (locale === "fr") {
    return "Commencez simple: 3-4 seances de musculation/semaine + objectif de pas quotidiens + apport proteique suffisant. Augmentez progressivement la charge ou les repetitions, dormez 7-9h et hydratez-vous. En cas de probleme de sante, consultez un professionnel.";
  }
  return "Start simple: train strength 3-4 days/week, hit a daily step goal, and prioritize protein. Progress load or reps weekly, sleep 7-9 hours, and stay hydrated. If you have a medical condition, check with a qualified professional.";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function extractPreference(apiKey: string, message: string): Promise<{ key: string | null; value: string | null }> {
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) return { key: null, value: null };
  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 120,
      system:
        'Extract user food/training preferences only. Return strict JSON: {"key":"...","value":"..."} or {"key":null}. No markdown.',
      messages: [{ role: "user", content: message }]
    })
  }, 8000);
  if (!response.ok) return { key: null, value: null };
  const payload = await response.json();
  const text = String(payload?.content?.[0]?.text ?? "").trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { key: null, value: null };
  const parsed = JSON.parse(jsonMatch[0]) as { key?: string | null; value?: string | null };
  return {
    key: typeof parsed?.key === "string" && parsed.key.trim().length > 0 ? parsed.key.trim() : null,
    value: typeof parsed?.value === "string" && parsed.value.trim().length > 0 ? parsed.value.trim() : null
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const message = String(body?.message ?? "").trim();
    const locale = String(body?.locale ?? "en");
    const conversationId = String(body?.conversationId ?? "").trim() || crypto.randomUUID();

    if (!message) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    if (!isLikelyFitnessQuestion(message)) {
      const guarded = DOMAIN_GUARD;
      const persistedId = conversationId || crypto.randomUUID();
      const { error: domainInsertError } = await auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: persistedId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: persistedId, role: "assistant", content: guarded }
      ]);
      if (domainInsertError) {
        console.error("TJAI chat: failed to save domain-guard messages", domainInsertError);
      }
      return NextResponse.json({ message: guarded, conversationId: persistedId });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("TJAI chat error: ANTHROPIC_API_KEY is not set");
      const fallback = fallbackCoachReply(message, locale);
      const { error: fallbackInsertError } = await auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: fallback }
      ]);
      if (fallbackInsertError) {
        console.error("TJAI chat: failed to save fallback messages", fallbackInsertError);
      }
      return NextResponse.json({ message: fallback, conversationId });
    }

    const [{ data: planRow }, { data: historyRows }, { data: prefRows }] = await Promise.all([
      auth.supabase
        .from("saved_tjai_plans")
        .select("goal,daily_calories,protein_g,training_days_per_week,training_location,plan_json")
        .eq("user_id", auth.user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
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
        .eq("user_id", auth.user.id)
    ]);

    // Rows fetched newest-first (limit 20), reverse to oldest-first for prompt order
    const history: HistoryRow[] = (historyRows ?? []).reverse().flatMap((row) => {
      if ((row.role === "user" || row.role === "assistant") && typeof row.content === "string") {
        return [{ role: row.role, content: row.content }];
      }
      return [];
    });

    const planSummary = (planRow?.plan_json as { summary?: Record<string, unknown> } | null)?.summary ?? {};
    const preferences = (prefRows ?? []) as PreferenceRow[];
    const preferencesLine =
      preferences.length > 0
        ? preferences.map((p) => `${p.preference_key}: ${p.preference_value}`).join("; ")
        : "No stored preferences yet.";

    const planContext = planRow
      ? `USER'S TJAI PLAN SUMMARY:
- Goal: ${planRow.goal ?? "fat_loss"}
- Daily Calories: ${planRow.daily_calories ?? planSummary?.["daily_calories"] ?? "calculated"}
- Protein Target: ${planRow.protein_g ?? planSummary?.["protein_g"] ?? "calculated"}g
- Training Days: ${planRow.training_days_per_week ?? planSummary?.["training_days_per_week"] ?? 4}/week
- Location: ${planRow.training_location ?? "gym"}`
      : "User has not generated a TJAI plan yet.";

    const systemPrompt = `You are TJAI - TJFit's expert AI fitness and nutrition coach.
You are warm, knowledgeable, direct, and motivating.
You ALWAYS answer fitness, nutrition, training, and health questions.
You respond in the same language the user writes in.
${planContext}

USER PREFERENCES FROM CONVERSATION:
${preferencesLine}

TJFIT PROGRAMS YOU CAN RECOMMEND:
- Gym Fat Loss Protocol (12 weeks, gym, fat loss)
- Gym Mass Builder (12 weeks, gym, muscle gain)
- Hypertrophy System (12 weeks, gym, advanced muscle)
- Home Fat Burn Accelerator (12 weeks, home, fat loss)
- Home Fat Loss Starter (4 weeks, home, free, beginner)
- Gym Muscle Starter (4 weeks, gym, free, beginner)

RULES:
- For injury or medical topics: include a short safety disclaimer.
- Keep responses concise but complete (150-300 words unless user asks for depth).
- Use bullet points for lists and numbered steps for action plans.`;

    // Fire-and-forget: extract and save user preferences in background — don't block main response
    void (async () => {
      try {
        const preference = await extractPreference(apiKey, message);
        if (preference.key && preference.value) {
          const { error: prefError } = await auth.supabase.from("user_chat_preferences").upsert({
            user_id: auth.user.id,
            preference_key: preference.key,
            preference_value: preference.value,
            source: "chat",
            updated_at: new Date().toISOString()
          });
          if (prefError) {
            console.error("TJAI chat preference save error:", prefError);
          }
        }
      } catch (prefExtractError) {
        console.error("TJAI chat preference extract error:", prefExtractError);
      }
    })();

    const upstream = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [...history, { role: "user", content: message }]
      })
    }, 30000);

    if (!upstream.ok) {
      const raw = await upstream.text();
      console.error("TJAI chat error: Anthropic non-200", raw);
      const fallback = fallbackCoachReply(message, locale);
      return NextResponse.json({ message: fallback, conversationId });
    }

    const payload = await upstream.json();
    const assistantMessage =
      payload?.content?.find?.((chunk: { type?: string }) => chunk?.type === "text")?.text ??
      payload?.content?.[0]?.text ??
      "I had trouble processing that. Please try again.";

    const insertRows = [
      {
        user_id: auth.user.id,
        conversation_id: conversationId,
        role: "user",
        content: message,
        created_at: new Date().toISOString()
      },
      {
        user_id: auth.user.id,
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage,
        created_at: new Date(Date.now() + 1).toISOString()
      }
    ];
    const { error: saveError } = await auth.supabase.from("tjai_chat_messages").insert(insertRows);
    if (saveError) {
      console.error("TJAI chat error: failed to save chat", saveError);
    }

    return NextResponse.json({ message: assistantMessage, conversationId });
  } catch (error) {
    console.error("TJAI chat error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({
        message: "TJAI timed out. Quick fallback: do 3 full-body sessions this week, walk daily, hit protein, and recover with 7-9h sleep.",
        conversationId: crypto.randomUUID()
      });
    }
    return NextResponse.json({
      message: "TJAI had a temporary issue. Keep your plan simple today: train, hydrate, and hit protein. Ask again in a moment.",
      conversationId: crypto.randomUUID()
    });
  }
}
