import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("progress_milestones")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ milestones: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = rateLimit({
    key: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.ip ?? auth.user.id,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json();
  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("progress_milestones")
    .insert({
      user_id: auth.user.id,
      title: body.title.trim(),
      target_value: typeof body.target_value === "string" ? body.target_value.trim() : null,
      due_date: typeof body.due_date === "string" ? body.due_date : null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ milestone: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  if (typeof body.id !== "string" || !body.id) {
    return NextResponse.json({ error: "Milestone ID is required." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.target_value === "string") patch.target_value = body.target_value.trim();
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.due_date === "string" || body.due_date === null) patch.due_date = body.due_date;
  if (body.status === "completed") patch.completed_at = new Date().toISOString();

  const { data, error } = await auth.supabase
    .from("progress_milestones")
    .update(patch)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ milestone: data });
}

