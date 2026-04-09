import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = params.id;
    // Check if already voted
    const { data: existing } = await auth.supabase
      .from("suggestion_votes")
      .select("user_id")
      .eq("user_id", auth.user.id)
      .eq("suggestion_id", id)
      .maybeSingle();
    if (existing) {
      // Unvote
      await auth.supabase.from("suggestion_votes").delete().eq("user_id", auth.user.id).eq("suggestion_id", id);
      await auth.supabase.rpc("decrement_suggestion_votes" as never, { suggestion_id: id } as never).maybeSingle();
    } else {
      // Vote
      await auth.supabase.from("suggestion_votes").insert({ user_id: auth.user.id, suggestion_id: id });
      await auth.supabase
        .from("suggestions")
        .update({ vote_count: auth.supabase.from("suggestions").select("vote_count") } as never)
        .eq("id", id);
      // Simpler: just increment
      await auth.supabase.from("suggestions").update({ vote_count: 0 } as never).eq("id", id).single();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Suggestion vote crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
