import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import {
  decideSuggestion,
  gatherSignals,
  generateSuggestion,
  loadPendingSuggestions,
  persistSuggestion,
  shouldSuggest
} from "@/lib/tjai/suggestions";
import { checkRateLimit } from "@/lib/tjai/rate-limit";
import { getLatestTjaiPlan } from "@/lib/tjai-plan-store";
import { getTJAIAccess } from "@/lib/tjai-access";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Suggestion generation calls Opus — cap aggressively. 6 generations / hour /
// user is more than enough for a real coaching workflow.
const SUGGEST_RATE_WINDOW_SEC = 3600;
const SUGGEST_RATE_MAX = 6;

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const suggestions = await loadPendingSuggestions(auth.supabase, auth.user.id);
  return NextResponse.json({ suggestions });
}

export async function POST() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: profile }, { data: purchase }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    isAdminByEmail
      ? Promise.resolve({ data: { role: "admin" as const } })
      : admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle(),
    admin
      .from("tjai_plan_purchases")
      .select("id")
      .eq("user_id", auth.user.id)
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const isAdmin = isAdminByEmail || profile?.role === "admin";
  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  const access = getTJAIAccess(tier, {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    isAdmin
  });

  // Adaptive plan suggestions require a paid plan or Pro/Apex tier.
  if (!access.canUseProgress) {
    return NextResponse.json(
      { error: "Upgrade required for adaptive suggestions.", code: "UPGRADE_REQUIRED" },
      { status: 402 }
    );
  }

  if (!isAdmin) {
    const rl = await checkRateLimit({
      supabase: admin,
      userId: auth.user.id,
      route: "tjai/suggestions-generate",
      windowSeconds: SUGGEST_RATE_WINDOW_SEC,
      max: SUGGEST_RATE_MAX
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Suggestion limit reached for this hour.", code: "RATE_LIMITED" },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetIn),
            "X-RateLimit-Limit": String(SUGGEST_RATE_MAX),
            "X-RateLimit-Remaining": "0"
          }
        }
      );
    }
  }

  const signals = await gatherSignals(auth.supabase, auth.user.id);
  if (!shouldSuggest(signals)) {
    return NextResponse.json({ suggestion: null, reason: "no signal" });
  }

  const generated = await generateSuggestion(signals, auth.user.id);
  if (!generated) {
    return NextResponse.json({ suggestion: null, reason: "generation failed" });
  }

  const plan = await getLatestTjaiPlan(auth.supabase, auth.user.id);
  const id = await persistSuggestion(
    auth.supabase,
    auth.user.id,
    generated,
    signals,
    (plan as { id?: string } | null)?.id ?? null
  );

  return NextResponse.json({ suggestion: { id, ...generated, signals } });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; decision?: unknown }
    | null;

  const id = typeof body?.id === "string" ? body.id : "";
  const decision = body?.decision === "accepted" || body?.decision === "rejected" ? body.decision : null;
  if (!id || !decision) return NextResponse.json({ error: "id and decision required" }, { status: 400 });

  const ok = await decideSuggestion(auth.supabase, auth.user.id, id, decision);
  if (!ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
