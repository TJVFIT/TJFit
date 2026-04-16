# CLAUDEUPGRADE4 — TJAI AI Intelligence Upgrade
## Cursor Agent Prompt

You are working on **TJFit** (tjfit.org), a premium AI fitness platform. This task upgrades the TJAI AI coaching engine from a static plan generator into a **living, adaptive, data-driven coach** that learns from each user's real progress.

### Stack context
- Next.js 14 App Router, TypeScript strict, Tailwind CSS
- Supabase (auth + RLS + admin service role client)
- OpenAI GPT-4o for plan generation (`src/lib/tjai-openai.ts`)
- Anthropic Claude Sonnet for chat (`src/app/api/tjai/chat/route.ts`) — **will be migrated to GPT-4o streaming in this task**
- Existing tables (do NOT create new schemas unless explicitly listed): `saved_tjai_plans`, `tjai_chat_messages`, `tjai_weekly_insights`, `tjai_plan_analytics`, `workout_logs`, `progress_entries`, `user_chat_preferences`, `program_progress`, `personal_records`

### Critical bugs you must understand before starting

1. **`outcome_weight_change` is NEVER populated.** The `tjai_plan_analytics` table has this column, and `getSimilarUserInsight()` in `src/lib/tjai-analytics.ts` queries it — but it always returns `null` because nothing ever writes to it. The entire "learn from past users" feature is broken.

2. **Weekly insights are hardcoded.** `GET /api/tjai/progress` writes the literal string *"You've been consistent this week..."* to `tjai_weekly_insights` — never calls AI. Every user sees the same generic text.

3. **Chat is blind to real data.** The system prompt in `src/app/api/tjai/chat/route.ts` only has plan metadata (goal, calories, protein). It has zero access to actual `workout_logs`, `progress_entries`, body weight changes, or streak data.

4. **Macro adherence always returns 0%.** The progress API initialises `nutritionHit` counters but never increments them — no logging mechanism feeds this.

5. **No plan adaptation.** Plans are one-shot, static, forever. Nothing detects when a user is ahead/behind projections.

---

## TASK 1 — Upgrade `callOpenAI` to support streaming

**File:** `src/lib/tjai-openai.ts`

Add a new exported function `streamOpenAI` that returns a `ReadableStream` for Server-Sent Events:

```typescript
export async function streamOpenAI({
  system,
  user,
  messages,
  maxTokens = 1000,
}: {
  system: string;
  user?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const body = {
    model: "gpt-4o",
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: true,
    messages: [
      { role: "system", content: system },
      ...(messages ?? []),
      ...(user ? [{ role: "user", content: user }] : []),
    ],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI stream error ${response.status}: ${err.slice(0, 300)}`);
  }

  if (!response.body) throw new Error("No response body from OpenAI stream.");
  return response.body;
}
```

Also upgrade `callOpenAI` to use `gpt-4o-2024-08-06` (the model that supports strict structured outputs) when `jsonMode: true`, and keep `gpt-4o` for standard calls. Change the MODEL constant to:

```typescript
const MODEL_JSON = "gpt-4o-2024-08-06";  // structured outputs
const MODEL_CHAT = "gpt-4o";             // chat / streaming
```

---

## TASK 2 — Migrate chat to GPT-4o with streaming

**File:** `src/app/api/tjai/chat/route.ts`

### 2A — Remove Anthropic dependency entirely

The current chat calls `https://api.anthropic.com/v1/messages`. Replace this with `streamOpenAI` from `src/lib/tjai-openai.ts`. Remove all Anthropic-specific fetch calls, headers, and parsing logic.

### 2B — Inject real user data into the system prompt

After fetching the plan, history, and preferences (the three existing parallel queries), add a **fourth parallel query** to get the user's recent real-world data:

```typescript
const [{ data: planRow }, { data: historyRows }, { data: prefRows }, { data: recentData }] =
  await Promise.all([
    // ... existing 3 queries unchanged ...
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
        .limit(6),
    ]).then(([w, p]) => ({ workouts: w.data ?? [], entries: p.data ?? [] })),
  ]);
```

Build a `realDataContext` string from this data:

```typescript
const workouts = recentData?.workouts ?? [];
const entries = recentData?.entries ?? [];

const workoutSummary = workouts.length > 0
  ? workouts.slice(0, 10).map(w =>
      `${w.workout_date}: ${w.exercise}${w.sets ? ` ${w.sets}×${w.reps ?? "?"}` : ""}${w.weight_kg ? ` @ ${w.weight_kg}kg` : ""}${w.duration_minutes ? ` (${w.duration_minutes}min)` : ""}`
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

const latestBodyFat = entries[0]?.body_fat_percent
  ? `${entries[0].body_fat_percent}%`
  : "Not logged";

const realDataContext = `
LIVE USER DATA (use this to give hyper-personalized advice):
Recent workouts (last 14 days):
${workoutSummary}

Body metrics trend:
- Current weight: ${weightTrend}
- Latest body fat: ${latestBodyFat}
${entries[0]?.waist_cm ? `- Waist: ${entries[0].waist_cm}cm` : ""}
`;
```

### 2C — Updated system prompt

Replace the existing system prompt with this structure (keep the plan context and preferences sections, add the real data):

```typescript
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
- For injury or medical topics: include a short safety disclaimer.
- Responses: 150–300 words unless user asks for depth. Use bullet points for action items.
- Never be generic. Every answer must reference something specific from their data.`;
```

### 2D — Convert to streaming SSE response

Replace the `upstream` fetch + JSON response with a streaming response:

```typescript
const stream = await streamOpenAI({
  system: systemPrompt,
  messages: [...history, { role: "user", content: message }],
  maxTokens: 1000,
});

// Save user message immediately (before streaming)
await auth.supabase.from("tjai_chat_messages").insert({
  user_id: auth.user.id,
  conversation_id: conversationId,
  role: "user",
  content: message,
  created_at: new Date().toISOString(),
});

// Stream back to client, collect full text for saving
let fullText = "";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const transformStream = new TransformStream({
  transform(chunk, controller) {
    const text = decoder.decode(chunk);
    const lines = text.split("\n").filter((line) => line.startsWith("data: "));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          fullText += delta;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, conversationId })}\n\n`));
        }
      } catch {
        // skip malformed SSE chunks
      }
    }
  },
  async flush() {
    // Save complete assistant message after stream ends
    if (fullText) {
      const { error } = await auth.supabase.from("tjai_chat_messages").insert({
        user_id: auth.user.id,
        conversation_id: conversationId,
        role: "assistant",
        content: fullText,
        created_at: new Date(Date.now() + 1).toISOString(),
      });
      if (error) console.error("TJAI chat: failed to save streamed assistant message", error);
    }
    // Fire-and-forget preference extraction (keep existing logic, adapt for OpenAI)
  },
});

return new Response(stream.pipeThrough(transformStream), {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  },
});
```

Keep the `extractPreference` function but update it to use `callOpenAI` (non-streaming, small request) instead of the Anthropic fetch.

### 2E — Update the chat frontend component

**File:** `src/components/tjai/tjai-chat.tsx`

Update the `sendMessage` function to handle streaming:

```typescript
const sendMessage = async (text: string) => {
  // Add user message to UI immediately
  setMessages((prev) => [...prev, { role: "user", content: text }]);
  setInput("");
  setIsLoading(true);

  // Add empty assistant message as placeholder
  setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

  try {
    const res = await fetch("/api/tjai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message: text, conversationId, locale }),
    });

    if (!res.ok || !res.body) throw new Error("Stream failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.delta) {
            // Append delta to the last message (the assistant placeholder)
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: (updated[updated.length - 1].content ?? "") + data.delta,
              };
              return updated;
            });
          }
          if (data.conversationId && !conversationId) {
            setConversationId(data.conversationId);
          }
        } catch {
          // skip
        }
      }
    }
  } catch (err) {
    // Replace placeholder with fallback on error
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "assistant",
        content: "I had a brief connection issue. Please try again.",
      };
      return updated;
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## TASK 3 — Real AI-generated weekly insights

**File:** `src/app/api/tjai/progress/route.ts`

### Current bug
The current code writes a hardcoded string to `tjai_weekly_insights` if no cached insight exists. Every user gets the same generic text.

### Fix
Replace the hardcoded fallback with an actual GPT-4o call that uses the user's real data. This runs at most once per week per user (cached in `tjai_weekly_insights`).

```typescript
// Replace the hardcoded weeklyInsight block with:
if (cachedInsight?.insight_text) {
  weeklyInsight = cachedInsight.insight_text;
} else {
  // Generate a REAL AI insight based on this user's actual data
  try {
    const workoutsThisWeek = (workoutRows ?? []).filter(
      (r) => r.logged_at && r.logged_at >= weekStart
    );
    const planSummaryObj = (planRow?.plan_json as any)?.summary ?? {};

    const insightPrompt = `You are TJAI, an elite AI fitness coach. Generate a single, highly personalized weekly insight for this user. 2-3 sentences max. Be specific to their data. Motivating but honest. No fluff.

USER DATA THIS WEEK:
- Workouts logged: ${workoutsThisWeek.length} sessions
- Exercises: ${[...new Set(workoutsThisWeek.map((w: any) => w.exercise_name ?? w.exercise).filter(Boolean))].slice(0, 5).join(", ") || "none logged"}
- Program week: ${currentWeek} of 12 (${completionPercent}% complete)
- Streak: ${Number(profile?.current_streak ?? 0)} days

PLAN TARGETS:
- Daily calories: ${planSummaryObj.calorieTarget ?? planRow?.daily_calories ?? "not set"}
- Protein: ${planSummaryObj.protein ?? planRow?.protein_g ?? "not set"}g/day
- Weekly change target: ${planSummaryObj.weeklyChange ?? "not set"}

Write 1 insight. No intro phrase like "Great job" or "Here's your insight". Start directly.`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      weeklyInsight = await callOpenAI({
        system: "You are TJAI, a precision AI fitness coach. Be brief, specific, actionable.",
        user: insightPrompt,
        maxTokens: 150,
        jsonMode: false,
      });
    } else {
      weeklyInsight = "Log your workouts and body weight this week to unlock your personalized AI insight.";
    }
  } catch (insightErr) {
    console.error("TJAI weekly insight generation failed:", insightErr);
    weeklyInsight = "Keep logging your sessions — your personalized weekly insight will appear here.";
  }

  // Cache for the week
  await admin.from("tjai_weekly_insights").upsert(
    { user_id: auth.user.id, week_start: weekStart, insight_text: weeklyInsight },
    { onConflict: "user_id,week_start" }
  );
}
```

Add the `callOpenAI` import at the top of the file:
```typescript
import { callOpenAI } from "@/lib/tjai-openai";
```

---

## TASK 4 — Close the learning loop: populate `outcome_weight_change`

**File:** `src/app/api/progress/entries/route.ts`

### What to add (after the existing POST success)

After successfully inserting a new `progress_entries` row, fire a non-blocking background task that:
1. Fetches the user's saved plan (start weight, weekly target, created_at)
2. Fetches all their progress entries sorted by date
3. Computes their actual average weekly weight change since the plan was generated
4. Updates `tjai_plan_analytics` with `outcome_weight_change`

Add this AFTER the `return NextResponse.json(...)` line — use fire-and-forget pattern:

```typescript
// After the successful insert and before the return statement:
void (async () => {
  try {
    const admin = getSupabaseServerClient();
    if (!admin) return;

    // Fetch user's most recent plan
    const { data: plan } = await admin
      .from("saved_tjai_plans")
      .select("daily_calories, protein_g, created_at, answers_json")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) return;

    // Fetch all weight entries since plan creation
    const { data: entries } = await admin
      .from("progress_entries")
      .select("entry_date,weight_kg")
      .eq("user_id", auth.user.id)
      .not("weight_kg", "is", null)
      .gte("entry_date", plan.created_at.slice(0, 10))
      .order("entry_date", { ascending: true });

    if (!entries || entries.length < 2) return;

    const firstWeight = Number(entries[0].weight_kg);
    const lastWeight = Number(entries[entries.length - 1].weight_kg);
    const firstDate = new Date(entries[0].entry_date);
    const lastDate = new Date(entries[entries.length - 1].entry_date);
    const weeksDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weeklyChange = (lastWeight - firstWeight) / weeksDiff;

    // Update the most recent analytics row for this user's goal
    const answers = plan.answers_json as Record<string, unknown> | null;
    const goal = String(answers?.s2_goal ?? "");
    const sex = String(answers?.s1_gender ?? "");
    if (!goal || !sex) return;

    await admin
      .from("tjai_plan_analytics")
      .update({ outcome_weight_change: parseFloat(weeklyChange.toFixed(3)) })
      .eq("goal", goal)
      .eq("sex", sex)
      .is("outcome_weight_change", null)  // only update rows that have no outcome yet
      .order("created_at", { ascending: false })
      .limit(1);

  } catch (err) {
    console.error("TJAI outcome tracking (non-fatal):", err);
  }
})();
```

Add the import: `import { getSupabaseServerClient } from "@/lib/supabase-server";`

---

## TASK 5 — Adaptive plan evaluation endpoint

**File:** `src/app/api/tjai/evaluate-progress/route.ts` ← **create this file**

This endpoint analyses whether the user's plan needs updating, and returns AI-generated recommendations.

```typescript
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { callOpenAI } from "@/lib/tjai-openai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const uid = auth.user.id;

  // Gather all relevant data in parallel
  const [{ data: plan }, { data: entries }, { data: workouts }, { data: progress }] =
    await Promise.all([
      admin
        .from("saved_tjai_plans")
        .select("goal,daily_calories,protein_g,metrics_json,answers_json,created_at,updated_at")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("progress_entries")
        .select("entry_date,weight_kg,body_fat_percent")
        .eq("user_id", uid)
        .not("weight_kg", "is", null)
        .order("entry_date", { ascending: false })
        .limit(12),
      admin
        .from("workout_logs")
        .select("workout_date,exercise")
        .eq("user_id", uid)
        .order("workout_date", { ascending: false })
        .limit(60),
      admin
        .from("program_progress")
        .select("week_number,is_complete")
        .eq("user_id", uid),
    ]);

  if (!plan) {
    return NextResponse.json({ hasEnoughData: false, message: "No plan found. Generate your TJAI plan first." });
  }

  // Need at least 2 weight entries to evaluate
  if (!entries || entries.length < 2) {
    return NextResponse.json({ hasEnoughData: false, message: "Log your weight at least twice to unlock adaptive evaluation." });
  }

  // Compute actual vs projected
  const metrics = plan.metrics_json as Record<string, unknown> | null;
  const projectedWeeklyChange = Number(metrics?.weeklyWeightChange ?? 0);
  const planCreatedAt = new Date(plan.created_at);
  const weeksSincePlan = Math.max(1, (Date.now() - planCreatedAt.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const latestWeight = Number(entries[0].weight_kg);
  const oldestWeight = Number(entries[entries.length - 1].weight_kg);
  const actualWeeklyChange = (latestWeight - oldestWeight) / Math.max(1, entries.length - 1);

  // Count workout frequency
  const recentWorkouts = workouts ?? [];
  const lastFourWeeksWorkouts = recentWorkouts.filter((w) => {
    const d = new Date(w.workout_date ?? "");
    return Date.now() - d.getTime() < 28 * 24 * 60 * 60 * 1000;
  });
  const workoutsPerWeek = lastFourWeeksWorkouts.length / 4;

  const completedWeeks = Math.max(0, ...((progress ?? []).map((r) => Number(r.week_number ?? 0))));

  // Ask GPT-4o for an adaptive evaluation
  const evaluationPrompt = `You are TJAI, an elite AI fitness coach evaluating a user's progress against their plan.

PLAN DATA:
- Goal: ${plan.goal}
- Plan calories: ${plan.daily_calories} kcal/day
- Plan protein: ${plan.protein_g}g/day
- Projected weekly change: ${projectedWeeklyChange > 0 ? "+" : ""}${projectedWeeklyChange}kg/week
- Weeks since plan generated: ${weeksSincePlan.toFixed(1)}

ACTUAL RESULTS:
- Weight change: ${oldestWeight}kg → ${latestWeight}kg (${actualWeeklyChange > 0 ? "+" : ""}${actualWeeklyChange.toFixed(2)}kg/week actual vs ${projectedWeeklyChange}kg/week projected)
- Workouts per week (last 4 weeks): ${workoutsPerWeek.toFixed(1)}
- Completed weeks: ${completedWeeks}

Respond ONLY with valid JSON matching this exact schema:
{
  "shouldAdapt": boolean,
  "urgency": "low" | "medium" | "high",
  "headline": "One sentence summary (max 12 words)",
  "findings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": [
    { "type": "calories" | "protein" | "training" | "recovery" | "mindset", "action": "Specific actionable recommendation", "reason": "Why" }
  ],
  "triggerRegen": boolean,
  "regenReason": "Why regeneration is recommended, or null if not needed"
}

Rules:
- shouldAdapt: true if actual change deviates >30% from projected, or workoutsPerWeek < 2.5
- triggerRegen: true only if shouldAdapt AND weeksSincePlan > 3
- Be specific. Reference the actual numbers.`;

  let evaluation: unknown = null;
  try {
    const raw = await callOpenAI({
      system: "You are TJAI. Return strict JSON only. No markdown.",
      user: evaluationPrompt,
      maxTokens: 600,
      jsonMode: true,
    });
    evaluation = JSON.parse(raw);
  } catch (err) {
    console.error("TJAI evaluate-progress AI error:", err);
    return NextResponse.json({ hasEnoughData: true, evaluation: null, error: "AI evaluation temporarily unavailable." });
  }

  return NextResponse.json({
    hasEnoughData: true,
    weeksSincePlan: parseFloat(weeksSincePlan.toFixed(1)),
    actualWeeklyChange: parseFloat(actualWeeklyChange.toFixed(2)),
    projectedWeeklyChange,
    workoutsPerWeek: parseFloat(workoutsPerWeek.toFixed(1)),
    evaluation,
  });
}
```

---

## TASK 6 — Surface adaptive evaluation in the TJAI progress tab

**File:** `src/components/tjai/tjai-progress-tab.tsx`

### What to add

After the existing progress data loads, make a second fetch to `/api/tjai/evaluate-progress`. Show the result as a new card at the bottom of the progress tab.

Conditions for showing:
- `data.hasEnoughData === true`
- `evaluation.shouldAdapt === true`

Card design:
```tsx
{evalData?.hasEnoughData && evalData?.evaluation?.shouldAdapt && (
  <article className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-lg">⚡</span>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-[0.12em]">
          TJAI Plan Check
        </h3>
        <p className="mt-1 text-sm font-medium text-white">
          {evalData.evaluation.headline}
        </p>
        <ul className="mt-3 space-y-1.5">
          {evalData.evaluation.recommendations.map((rec: any, i: number) => (
            <li key={i} className="text-xs text-zinc-300">
              <span className="text-orange-400 font-semibold">{rec.type.toUpperCase()}: </span>
              {rec.action}
            </li>
          ))}
        </ul>
        {evalData.evaluation.triggerRegen && (
          <button
            onClick={() => router.push(`/${locale}/tjai?regen=1`)}
            className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full bg-orange-500/15 border border-orange-500/40 px-5 py-2 text-sm font-semibold text-orange-400"
          >
            Update My Plan →
          </button>
        )}
      </div>
    </div>
  </article>
)}
```

Add `useRouter` from `next/navigation` and add `locale` as a prop to `TJAIProgressTab`.

---

## TASK 7 — Progressive overload detection in chat

**File:** `src/app/api/tjai/chat/route.ts`

After fetching `recentData.workouts`, add a progressive overload analysis:

```typescript
// Inside the function, after building workoutSummary:
function detectProgressiveOverload(logs: typeof workouts): string {
  if (logs.length < 4) return "";
  
  // Group by exercise
  const byExercise = new Map<string, Array<{ date: string; weight: number | null; reps: number | null }>>();
  for (const log of logs) {
    const key = (log.exercise ?? "").toLowerCase().trim();
    if (!key) continue;
    if (!byExercise.has(key)) byExercise.set(key, []);
    byExercise.get(key)!.push({
      date: log.workout_date ?? "",
      weight: log.weight_kg ? Number(log.weight_kg) : null,
      reps: log.reps ? Number(log.reps) : null,
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

const overloadContext = detectProgressiveOverload(workouts);
// Append to realDataContext:
const realDataContext = `... (existing) ...\n${overloadContext}`;
```

---

## TASK 8 — Plan version history

**File:** `src/app/api/tjai/generate/route.ts`

### Remove the single-plan constraint

Currently: `.upsert({ ... }, { onConflict: "user_id" })` — overwrites the previous plan.

Change to `.insert({ ... })` so each generation creates a new row. Add a `version_number` computed from the count of existing plans + 1:

```typescript
// Before the upsert, count existing plans:
const { count: existingCount } = await adminClient
  .from("saved_tjai_plans")
  .select("id", { count: "exact", head: true })
  .eq("user_id", authResult.user.id);

const versionNumber = (existingCount ?? 0) + 1;

// Change upsert to insert:
const { data: savedPlan, error: saveError } = await adminClient
  .from("saved_tjai_plans")
  .insert({
    user_id: authResult.user.id,
    version_number: versionNumber,
    // ... rest of fields unchanged ...
  })
  .select("id")
  .maybeSingle();
```

Also add `version_number integer default 1` to the `saved_tjai_plans` select in the chat route so chat can say "You're on plan version 2" if relevant.

**Migration needed** — create `supabase/migrations/20260417000000_tjai_plan_versioning.sql`:

```sql
-- Add version_number to saved_tjai_plans (non-breaking, default 1 for existing rows)
ALTER TABLE saved_tjai_plans ADD COLUMN IF NOT EXISTS version_number integer NOT NULL DEFAULT 1;

-- Remove the unique constraint on user_id if it exists (allows multiple plans per user)
-- First check if the constraint exists before dropping
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'saved_tjai_plans_user_id_key'
    AND conrelid = 'saved_tjai_plans'::regclass
  ) THEN
    ALTER TABLE saved_tjai_plans DROP CONSTRAINT saved_tjai_plans_user_id_key;
  END IF;
END $$;

-- Index for fetching latest plan per user
CREATE INDEX IF NOT EXISTS idx_saved_tjai_plans_user_updated
  ON saved_tjai_plans(user_id, updated_at DESC);
```

---

## TASK 9 — Upgrade `getSimilarUserInsight` to actually work

**File:** `src/lib/tjai-analytics.ts`

The current `getSimilarUserInsight` only returns data if there are 3+ rows with `outcome_weight_change NOT NULL`. Since Task 4 now populates this column, the function will start working automatically. However, also add a fallback path:

```typescript
// After the existing query that checks for outcome_weight_change:
if (!data || data.length < 3) {
  // Fallback: use rows even without outcome data — show calorie/protein averages
  const { data: fallbackData } = await supabase
    .from("tjai_plan_analytics")
    .select("generated_calories, generated_protein")
    .eq("goal", goal)
    .eq("sex", sex)
    .limit(20);

  if (!fallbackData || fallbackData.length < 3) return null;

  const avgCalories = Math.round(
    fallbackData.reduce((s, r) => s + Number(r.generated_calories ?? 0), 0) / fallbackData.length
  );
  const avgProtein = Math.round(
    fallbackData.reduce((s, r) => s + Number(r.generated_protein ?? 0), 0) / fallbackData.length
  );

  return `COMMUNITY BENCHMARK: Among ${fallbackData.length} similar users (${sex}, ${getAgeRange(age)}, goal: ${goal}), average targets are ${avgCalories} kcal/day and ${avgProtein}g protein. Use as a calibration reference.`;
}
```

---

## General rules — DO NOT violate

- **TypeScript strict** — no implicit `any`, no unused imports. All new variables typed.
- **Never use `select("*")`** — always list columns explicitly.
- **All Supabase errors must be checked** — no silent failures on writes.
- **Background/fire-and-forget tasks** — wrap in `void (async () => { ... })()` and catch all errors with `console.error`.
- **maxDuration** — chat route already has `export const maxDuration = 60`. The new evaluate-progress route gets `maxDuration = 30`.
- **Run `npx tsc --noEmit` after all changes** — must compile with zero errors.
- **Streaming response format** — the `Content-Type: text/event-stream` header must be set on the streaming response. Each chunk must be `data: {...}\n\n` format.
- **Do not touch** `tjai-prompts.ts`, `tjai-science.ts`, or `tjai-types.ts` — these are working correctly.
- **Order of execution**: Task 1 → Task 2A/B/C → Task 2D/E → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9.
- After every task, check TypeScript compiles before moving to the next.
