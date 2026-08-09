import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { readRequestJson } from "@/lib/read-request-json";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordTjaiEvent } from "@/lib/tjai/events";
import { parseQuizStepEvent } from "@/lib/tjai/quiz-step-events";

export async function POST(request: NextRequest) {
  // Public funnel beacons: a full quiz run is ~46 beacons (43 base steps +
  // adaptive follow-ups + review), so 120/min leaves headroom for a fast run
  // without letting a loop flood the event stream.
  const limiter = await rateLimit({
    key: `quiz-events:${
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"
    }`,
    limit: 120,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const event = parseQuizStepEvent(parsed.value);
  if (!event) {
    return NextResponse.json({ error: "Invalid quiz step event." }, { status: 400 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    // Analytics must never surface an error into the quiz.
    return new NextResponse(null, { status: 204 });
  }

  // The quiz runs pre-signup; attach the user only when a session exists.
  let userId: string | null = null;
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  recordTjaiEvent(admin, {
    event: "quiz_step_reached",
    userId,
    locale: event.locale,
    metadata: {
      step_id: event.stepId,
      step_index: event.stepIndex,
      total_steps: event.totalSteps,
      quiz_session_id: event.quizSessionId
    }
  });

  return new NextResponse(null, { status: 204 });
}
