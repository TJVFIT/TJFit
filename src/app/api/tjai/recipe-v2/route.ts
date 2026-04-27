import { NextResponse } from "next/server";

import { getOrGenerateRecipe } from "@/lib/tjai/generators/recipes-v2";
import { intakeContext } from "@/lib/tjai/generators/macros-v2";
import { loadIntakeV2 } from "@/lib/tjai/intake-v2-store";
import { checkRateLimit } from "@/lib/tjai/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const RECIPE_RATE_WINDOW_SEC = 600; // 10 minutes
const RECIPE_RATE_MAX = 30;

/**
 * On-demand recipe lookup. Caller passes a meal name; we resolve it
 * against the intake context and return either a cached recipe or a
 * freshly-generated one.
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as
    | { mealName?: unknown; targetKcal?: unknown; locale?: unknown }
    | null;

  const mealName = typeof body?.mealName === "string" ? body.mealName.trim() : "";
  if (!mealName) return NextResponse.json({ error: "mealName required" }, { status: 400 });
  if (mealName.length > 200) return NextResponse.json({ error: "mealName too long" }, { status: 400 });

  // Rate limit
  const rl = await checkRateLimit({
    supabase: admin,
    userId: auth.user.id,
    route: "tjai/v2-recipe-generate",
    windowSeconds: RECIPE_RATE_WINDOW_SEC,
    max: RECIPE_RATE_MAX
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Recipe limit reached.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } }
    );
  }

  const intake = await loadIntakeV2(auth.supabase, auth.user.id);
  if (!intake.answers || Object.keys(intake.answers).length < 5) {
    return NextResponse.json({ error: "Complete intake first." }, { status: 400 });
  }

  const ctx = intakeContext(intake.answers);
  const localeStr = typeof body?.locale === "string" ? body.locale : "en";
  const targetKcal = typeof body?.targetKcal === "number" ? body.targetKcal : undefined;

  const recipe = await getOrGenerateRecipe({
    mealName,
    intake: ctx,
    locale: localeStr,
    targetKcal,
    userId: auth.user.id
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe generation failed." }, { status: 502 });
  }

  return NextResponse.json({ recipe });
}
