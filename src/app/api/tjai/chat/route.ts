import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { callOpenAI, streamOpenAI } from "@/lib/tjai-openai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DOMAIN_GUARD = "Please ask me stuff related to health, sports, coaching, or the website.";

type HistoryRow = { role: "user" | "assistant"; content: string };
type PreferenceRow = { preference_key: string; preference_value: string };

type WorkoutLog = {
  workout_date: string | null;
  exercise: string | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_minutes: number | null;
};

type ProgressEntry = {
  entry_date: string | null;
  weight_kg: number | null;
  body_fat_percent: number | null;
  waist_cm: number | null;
};

function isLikelyFitnessQuestion(message: string): boolean {
  const m = message.toLowerCase();
  return [
    "workout", "work out", "training", "train", "exercise", "lift", "lifting",
    "strength", "hypertrophy", "reps", "sets", "rest day", "split", "fitness",
    "fat", "muscle", "body fat", "bulk", "cut", "lose weight", "gain weight",
    "diet", "nutrition", "meal", "meal prep", "calorie", "protein", "carb",
    "fat intake", "cardio", "tdee", "bmr", "coach", "coaching", "health",
    "wellness", "sleep", "hydration", "injury", "recovery", "rehab", "program",
    "tjai", "tjfit", "community", "website", "supplement", "gym", "home workout",
    "chest", "back", "legs", "shoulders", "arm", "abs", "progress", "weight",
    "plateau", "overload", "deload", "refeed", "macros"
  ].some((k) => m.includes(k));
}

function fallbackCoachReply(message: string, locale: string): string {
  if (!isLikelyFitnessQuestion(message)) return DOMAIN_GUARD;
  if (locale === "tr") return "Hizli plan: 3-4 gun kuvvet + gunluk adim hedefi + protein odakli beslenme ile basla. Her hafta agirlik veya tekrar arttir, 7-9 saat uyku ve duzenli su tuketimi ekle. Saglik sorunun varsa doktoruna danis.";
  if (locale === "ar") return "ابدأ بخطة بسيطة: 3-4 أيام مقاومة أسبوعياً + خطوات يومية + بروتين كافٍ. زِد الحمل تدريجياً كل أسبوع، ونَم 7-9 ساعات مع ترطيب جيد. إذا لديك حالة صحية خاصة فاستشر مختصاً.";
  if (locale === "es") return "Empieza simple: 3-4 dias de fuerza por semana + objetivo de pasos diarios + proteina suficiente. Sube carga o repeticiones progresivamente, duerme 7-9h y mantente hidratado. Si tienes una condicion medica, consulta a un profesional.";
  if (locale === "fr") return "Commencez simple: 3-4 seances de musculation/semaine + objectif de pas quotidiens + apport proteique suffisant. Augmentez progressivement la charge ou les repetitions, dormez 7-9h et hydratez-vous. En cas de probleme de sante, consultez un professionnel.";
  return "Start simple: train strength 3-4 days/week, hit a daily step goal, and prioritize protein. Progress load or reps weekly, sleep 7-9 hours, and stay hydrated. If you have a medical condition, check with a qualified professional.";
}

// Task 7 — Progressive overload detection
function detectProgressiveOverload(logs: WorkoutLog[]): string {
  if (logs.length < 4) return "";

  const byExercise = new Map<string, Array<{ date: string; weight: number | null; reps: number | null }>>();
  for (const log of logs) {
    const key = (log.exercise ?? "").toLowerCase().trim();
    if (!key) continue;
    if (!byExercise.has(key)) byExercise.set(key, []);
    byExercise.get(key)!.push({
      date: log.workout_date ?? "",
      weight: log.weight_kg !== null ? Number(log.weight_kg) : null,
      reps: log.reps !== null ? Number(log.reps) : null
    });
  }

  const insights: string[] = [];
  for (const [exercise, sessions] of byExercise) {
    if (sessions.length < 2) continue;
    const withWeight = sessions.filter((s) => s.weight !== null);
    if (withWeight.length >= 2) {
      const first = withWeight[withWeight.length - 1].weight!;
      const latest = withWeight[0].weight!;
      if (latest > first) {
        insights.push(`${exercise}: progressed from ${first}kg to ${latest}kg ✓`);
      } else if (latest === first && withWeight.length >= 3) {
        insights.push(`${exercise}: weight stalled at ${latest}kg for ${withWeight.length} sessions — consider adding a set or a small weight increment`);
      }
    }
  }

  return insights.length > 0
    ? `\nPROGRESSIVE OVERLOAD ANALYSIS:\n${insights.slice(0, 4).join("\n")}`
    : "";
}

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

    const body = await request.json().catch(() => null);
    const message = String(body?.message ?? "").trim();
    const locale = String(body?.locale ?? "en");
    const conversationId = String(body?.conversationId ?? "").trim() || crypto.randomUUID();

    if (!message) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400 });
    }

    // Domain guard — non-fitness questions answered instantly without streaming
    if (!isLikelyFitnessQuestion(message)) {
      const guarded = DOMAIN_GUARD;
      await auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: guarded }
      ]);
      return new Response(JSON.stringify({ message: guarded, conversationId }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[TJAI chat] OPENAI_API_KEY is not set");
      const fallback = fallbackCoachReply(message, locale);
      await auth.supabase.from("tjai_chat_messages").insert([
        { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
        { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: fallback }
      ]);
      return new Response(JSON.stringify({ message: fallback, conversationId }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Task 2B — 4 parallel queries: plan, history, preferences, real user data
    const [{ data: planRow }, { data: historyRows }, { data: prefRows }, recentData] =
      await Promise.all([
        auth.supabase
          .from("saved_tjai_plans")
          .select("goal,daily_calories,protein_g,training_days_per_week,training_location,plan_json,version_number")
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
          .eq("user_id", auth.user.id),
        // Real workout + progress data
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
          workouts: (w.data ?? []) as WorkoutLog[],
          entries: (p.data ?? []) as ProgressEntry[]
        }))
      ]);

    const history: HistoryRow[] = (historyRows ?? []).reverse().flatMap((row) => {
      if ((row.role === "user" || row.role === "assistant") && typeof row.content === "string") {
        return [{ role: row.role as "user" | "assistant", content: row.content }];
      }
      return [];
    });

    const planSummary = (planRow?.plan_json as { summary?: Record<string, unknown> } | null)?.summary ?? {};
    const preferences = (prefRows ?? []) as PreferenceRow[];
    const preferencesLine = preferences.length > 0
      ? preferences.map((p) => `${p.preference_key}: ${p.preference_value}`).join("; ")
      : "No stored preferences yet.";

    const planContext = planRow
      ? `USER'S TJAI PLAN:
- Goal: ${planRow.goal ?? "fat_loss"}
- Daily Calories: ${planRow.daily_calories ?? planSummary?.["daily_calories"] ?? "not set"}
- Protein Target: ${planRow.protein_g ?? planSummary?.["protein_g"] ?? "not set"}g
- Training Days: ${planRow.training_days_per_week ?? 4}/week
- Location: ${planRow.training_location ?? "gym"}${planRow.version_number && Number(planRow.version_number) > 1 ? `\n- Plan version: ${planRow.version_number}` : ""}`
      : "User has not generated a TJAI plan yet.";

    // Task 2B — build realDataContext
    const workouts = recentData.workouts;
    const entries = recentData.entries;

    const workoutSummary = workouts.length > 0
      ? workouts.slice(0, 10).map((w) =>
          `${w.workout_date ?? "?"}: ${w.exercise ?? "unknown"}${w.sets ? ` ${w.sets}×${w.reps ?? "?"}` : ""}${w.weight_kg ? ` @ ${w.weight_kg}kg` : ""}${w.duration_minutes ? ` (${w.duration_minutes}min)` : ""}`
        ).join("\n")
      : "No workouts logged yet.";

    const weightTrend = entries.length >= 2
      ? (() => {
          const latest = Number(entries[0]?.weight_kg ?? 0);
          const oldest = Number(entries[entries.length - 1]?.weight_kg ?? 0);
          const diff = latest - oldest;
          return `${latest}kg (${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg over last ${entries.length} entries)`;
        })()
      : entries[0]?.weight_kg
        ? `${entries[0].weight_kg}kg (only 1 data point)`
        : "No weight logged yet.";

    const latestBodyFat = entries[0]?.body_fat_percent ? `${entries[0].body_fat_percent}%` : "Not logged";
    const overloadContext = detectProgressiveOverload(workouts); // Task 7

    const realDataContext = `
LIVE USER DATA (use this to give hyper-personalized advice):
Recent workouts (last 14 days):
${workoutSummary}

Body metrics trend:
- Current weight: ${weightTrend}
- Latest body fat: ${latestBodyFat}${entries[0]?.waist_cm ? `\n- Waist: ${entries[0].waist_cm}cm` : ""}${overloadContext}`;

    // Task 2C — full system prompt with real data
    const systemPrompt = `You are TJAI — TJFit's elite AI fitness and nutrition coach. You are warm, precise, and data-driven.
You ALWAYS answer fitness, nutrition, training, and health questions.
You respond in the same language the user writes in.

${planContext}

${realDataContext}

USER PREFERENCES:
${preferencesLine}

TJFIT PROGRAMS YOU CAN RECOMMEND:
- Gym Fat Loss Protocol (12 weeks, gym, fat loss)
- Gym Mass Builder (12 weeks, gym, muscle gain)
- Hypertrophy System (12 weeks, gym, advanced)
- Home Fat Burn Accelerator (12 weeks, home, fat loss)
- Home Fat Loss Starter (4 weeks, home, free, beginner)
- Gym Muscle Starter (4 weeks, gym, free, beginner)

COACHING RULES:
- Reference the user's ACTUAL logged workouts and weight when giving advice. Be specific — name the exercises they logged, the weights they used.
- If their weight trend doesn't match their plan's projections, acknowledge it and diagnose why.
- For injury or medical topics: include a short safety d- For injury or medical topics: include a short safety disclaimer and recommend a professional.
- Never fabricate workout data. If no data exists, say so and encourage logging.
- Keep responses concise (under 280 words) unless a detailed breakdown is needed.
- End with one specific actionable next step tailored to their data.`

    const messages = [
      ...history.slice(-12).map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: message }
    ];

    let reply: string;
    try {
      reply = await callOpenAI({ system: systemPrompt, user: message, maxTokens: 600 });
    } catch {
      reply = fallbackCoachReply(message, locale);
    }

    // Save conversation turn
    void auth.supabase.from("tjai_chat_messages").insert([
      { user_id: auth.user.id, conversation_id: conversationId, role: "user", content: message },
      { user_id: auth.user.id, conversation_id: conversationId, role: "assistant", content: reply }
    ]);

    // Extract and store preferences in background
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TJAI] Unhandled error:", msg);
    return new Response(JSON.stringify({ error: "Chat failed" }), { status: 500 });
  }
}