import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/require-auth";
import { getTJAIAccess } from "@/lib/tjai-access";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const planId = body?.planId;

  // Server-side subscription check — never trust the client. The
  // previous version accepted `body.isPro` from the request, which
  // is trivially forged.
  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const { data: sub } = await auth.supabase
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  const access = getTJAIAccess(tier, { isAdmin: isAdminByEmail });
  if (!access.canRequestCoachReview) {
    return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 402 });
  }

  const { error } = await auth.supabase.from("coach_review_requests").insert({
    user_id: auth.user.id,
    plan_id: planId ?? null,
    status: "pending"
  });

  if (error) return NextResponse.json({ error: "Failed to request review" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

