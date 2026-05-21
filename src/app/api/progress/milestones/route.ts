import { NextRequest, NextResponse } from "next/server";

import { readRequestJson } from "@/lib/read-request-json";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";

const TITLE_MAX = 200;
const TARGET_MAX = 200;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_VALUES = new Set(["active", "completed", "abandoned"]);

function boundedString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t.slice(0, max);
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("progress_milestones")
    .select("id,user_id,title,target_value,status,due_date,completed_at,created_at,updated_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[progress/milestones] read failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to load milestones" }, { status: 500 });
  }

  return NextResponse.json({ milestones: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = await rateLimit({
    key: `progress-milestone:${auth.user.id}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const title = boundedString(body.title, TITLE_MAX);
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const targetValue = boundedString(body.target_value, TARGET_MAX);
  const dueDate =
    typeof body.due_date === "string" && DATE_RE.test(body.due_date) ? body.due_date : null;

  const { data, error } = await auth.supabase
    .from("progress_milestones")
    .insert({
      user_id: auth.user.id,
      title,
      target_value: targetValue,
      due_date: dueDate
    })
    .select("id,user_id,title,target_value,status,due_date,completed_at,created_at,updated_at")
    .single();

  if (error) {
    console.error("[progress/milestones] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to save milestone" }, { status: 400 });
  }

  return NextResponse.json({ milestone: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // PATCH previously had no rate limit at all.
  const limiter = await rateLimit({
    key: `progress-milestone:${auth.user.id}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  if (typeof body.id !== "string" || !body.id) {
    return NextResponse.json({ error: "Milestone ID is required." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  // Bounded + validated updates. Previously status was accepted as any
  // string — a client could set arbitrary garbage values, breaking the UI
  // and any downstream queries that filter on it.
  const newTitle = boundedString(body.title, TITLE_MAX);
  if (newTitle) patch.title = newTitle;
  const newTarget = boundedString(body.target_value, TARGET_MAX);
  if (newTarget !== null) patch.target_value = newTarget;
  if (typeof body.status === "string" && STATUS_VALUES.has(body.status)) {
    patch.status = body.status;
    if (body.status === "completed") {
      patch.completed_at = new Date().toISOString();
    }
  }
  if (typeof body.due_date === "string" && DATE_RE.test(body.due_date)) {
    patch.due_date = body.due_date;
  } else if (body.due_date === null) {
    patch.due_date = null;
  }

  const { data, error } = await auth.supabase
    .from("progress_milestones")
    .update(patch)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("id,user_id,title,target_value,status,due_date,completed_at,created_at,updated_at")
    .single();

  if (error) {
    console.error("[progress/milestones] update failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 400 });
  }

  return NextResponse.json({ milestone: data });
}
