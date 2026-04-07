import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { searchNormalize } from "@/lib/turkish-chars";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const qRaw = request.nextUrl.searchParams.get("q") ?? "";
  const q = searchNormalize(qRaw);
  if (q.length < 2) return NextResponse.json({ users: [] });

  const like = `%${q}%`;
  const { data, error } = await auth.supabase
    .from("profiles")
    .select("id,username,display_name,avatar_url,current_streak")
    .neq("id", auth.user.id)
    .or(`username_normalized.ilike.${like},display_name.ilike.${like}`)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}
