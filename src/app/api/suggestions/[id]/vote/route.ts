import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing suggestion id" }, { status: 400 });
    }

    // Atomic toggle via Postgres function. Prior implementation zeroed
    // vote_count on every new vote and called a non-existent decrement RPC,
    // so the counter was unmaintained.
    const { data: rpcRows, error: rpcError } = await auth.supabase.rpc(
      "tjfit_toggle_suggestion_vote",
      { p_user_id: auth.user.id, p_suggestion_id: id }
    );

    if (rpcError) {
      console.error("[suggestions/vote] rpc failed", rpcError);
      return NextResponse.json({ error: "Could not record vote." }, { status: 500 });
    }

    const result = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
      | { voted?: boolean; vote_count?: number }
      | null;

    return NextResponse.json({
      ok: true,
      voted: Boolean(result?.voted),
      voteCount: Number(result?.vote_count ?? 0)
    });
  } catch (err) {
    console.error("[suggestions/vote] crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
