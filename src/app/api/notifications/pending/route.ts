import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("pending_notifications")
    .select("id,type,message,created_at")
    .eq("user_id", auth.user.id)
    .eq("seen", false)
    .order("created_at", { ascending: true })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (data ?? []).map((item) => item.id);
  if (ids.length > 0) {
    await auth.supabase.from("pending_notifications").update({ seen: true }).in("id", ids);
  }

  return NextResponse.json({ notifications: data ?? [] });
}
