import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const planId = body?.planId;
  const isPro = Boolean(body?.isPro);
  if (!isPro) return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 402 });

  const { error } = await auth.supabase.from("coach_review_requests").insert({
    user_id: auth.user.id,
    plan_id: planId ?? null,
    status: "pending"
  });

  if (error) return NextResponse.json({ error: "Failed to request review" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

