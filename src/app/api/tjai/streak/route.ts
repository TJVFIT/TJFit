import { NextResponse } from "next/server";

import { getStreak } from "@/lib/tjai/streaks";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const streak = await getStreak(auth.supabase, auth.user.id);
  return NextResponse.json(streak);
}
