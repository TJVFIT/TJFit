import { NextRequest, NextResponse } from "next/server";

import { maskPrivateStreak } from "@/lib/profile-privacy";
import { requireAuth } from "@/lib/require-auth";
import { searchNormalize } from "@/lib/turkish-chars";

// Escape PostgREST ilike wildcards so a query containing `%` or `_` can't
// expand into a full-table scan via wildcards baked into the pattern.
function escapeIlike(value: string): string {
  return value.replace(/([%_])/g, "\\$1");
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const qRaw = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 100);
  const q = searchNormalize(qRaw);
  if (q.length < 2) return NextResponse.json({ users: [] });

  const like = `%${escapeIlike(q)}%`;
  const { data, error } = await auth.supabase
    .from("profiles")
    .select("id,username,display_name,avatar_url,current_streak,is_private")
    .neq("id", auth.user.id)
    .or(`username_normalized.ilike.${like},display_name.ilike.${like}`)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[users/search] query failed", error.message, error.code);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
  // Privacy mask (review must-fix): private accounts' streaks stay hidden
  // in search results, matching the profile route's masking.
  return NextResponse.json({ users: (data ?? []).map(maskPrivateStreak) });
}
