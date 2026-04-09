import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const admin = getSupabaseServerClient();
    if (!admin) return NextResponse.json({ suggestions: [] });
    const filter = req.nextUrl.searchParams.get("filter") ?? "all";
    let query = admin
      .from("suggestions")
      .select("id,title,description,category,status,vote_count,created_at");
    if (filter === "top") query = query.order("vote_count", { ascending: false });
    else if (filter === "new") query = query.order("created_at", { ascending: false });
    else if (filter === "planned") { query = query.eq("status", "planned").order("vote_count", { ascending: false }); }
    else if (filter === "done") { query = query.eq("status", "done").order("created_at", { ascending: false }); }
    else query = query.order("vote_count", { ascending: false });
    const { data, error } = await query.limit(50);
    if (error) { console.error("Suggestions fetch error:", error); return NextResponse.json({ suggestions: [] }); }
    return NextResponse.json({ suggestions: data ?? [] });
  } catch (err) {
    console.error("Suggestions GET crash:", err);
    return NextResponse.json({ suggestions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body?.title || !body?.description) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const { error } = await auth.supabase.from("suggestions").insert({
      user_id: auth.user.id,
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      category: String(body.category ?? "feature").toLowerCase()
    });
    if (error) { console.error("Suggestion insert error:", error); return NextResponse.json({ error: error.message }, { status: 500 }); }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Suggestions POST crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
