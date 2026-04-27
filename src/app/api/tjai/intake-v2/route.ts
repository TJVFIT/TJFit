import { NextResponse } from "next/server";

import { loadIntakeV2, saveIntakeV2, type IntakeV2Stage } from "@/lib/tjai/intake-v2-store";
import { isTjaiPersona } from "@/lib/tjai/persona";
import { requireAuth } from "@/lib/require-auth";
import type { QuizAnswers } from "@/lib/tjai-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const row = await loadIntakeV2(auth.supabase, auth.user.id);
  return NextResponse.json(row);
}

const VALID_STAGES: IntakeV2Stage[] = ["persona", "personal", "local", "health", "complete"];

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { stage?: unknown; answers?: unknown; persona?: unknown; baselineWeightKg?: unknown }
    | null;

  const patch: Parameters<typeof saveIntakeV2>[2] = {};

  if (typeof body?.stage === "string" && VALID_STAGES.includes(body.stage as IntakeV2Stage)) {
    patch.stage = body.stage as IntakeV2Stage;
  }
  if (body?.answers && typeof body.answers === "object") {
    patch.answers = body.answers as QuizAnswers;
  }
  if (body?.persona !== undefined) {
    patch.persona = isTjaiPersona(body.persona) ? body.persona : null;
  }
  if (typeof body?.baselineWeightKg === "number" || body?.baselineWeightKg === null) {
    patch.baselineWeightKg = body.baselineWeightKg as number | null;
  }

  const row = await saveIntakeV2(auth.supabase, auth.user.id, patch);
  return NextResponse.json(row);
}
