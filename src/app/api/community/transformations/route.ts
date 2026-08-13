import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAdmin } from "@/lib/require-admin";
import { requireAuth } from "@/lib/require-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

const LIST_LIMIT = 50;
const STORY_MAX = 4000;
const LABEL_MAX = 120;
const URL_MAX = 2048;

export async function GET(request: NextRequest) {
  const statusFilter = new URL(request.url).searchParams.get("status");

  // ?status=pending is the admin moderation queue — gated separately since it
  // exposes rows outside RLS's approved-or-own read policy. Anything else
  // (including no filter) is the public approved wall.
  if (statusFilter === "pending") {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { data, error } = await gate.supabase
      .from("user_transformations")
      .select(
        "id,before_image_url,after_image_url,program_slug,duration_label,weight_change,story,show_username,created_at,user_id"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(LIST_LIMIT);

    if (error) {
      if (isMissingSchemaMigrationError(error.message)) {
        return jsonSchemaNotReady("api/community/transformations:GET:pending", error.message);
      }
      console.error("[community/transformations] pending list failed", error.message);
      return NextResponse.json({ error: "Failed to load pending transformations." }, { status: 500 });
    }

    return NextResponse.json({ transformations: data ?? [] });
  }

  // Public per RLS (transformations_read_approved: status = 'approved' or
  // own row) — an anonymous session client only ever sees approved rows here
  // since there is no authenticated user for the "own" branch to apply to.
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("user_transformations")
    .select(
      "id,before_image_url,after_image_url,program_slug,duration_label,weight_change,story,show_username,likes_count,created_at,user_id"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/community/transformations:GET", error.message);
    }
    console.error("[community/transformations] list failed", error.message);
    return NextResponse.json({ error: "Failed to load transformations." }, { status: 500 });
  }

  const items = (data ?? []).map((row) => ({
    id: row.id,
    before_image_url: row.before_image_url,
    after_image_url: row.after_image_url,
    program_slug: row.program_slug,
    duration_label: row.duration_label,
    weight_change: row.weight_change,
    story: row.story,
    likes_count: row.likes_count,
    created_at: row.created_at,
    // show_username gates whether the author's identity is exposed on the
    // public wall; the API never leaks user_id itself.
    show_username: row.show_username
  }));

  return NextResponse.json({ transformations: items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = await rateLimit({
    key: `transformation-submit:${auth.user.id}`,
    limit: 5,
    windowMs: 60 * 60 * 1000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;

  const beforeImageUrl = typeof body.before_image_url === "string" ? body.before_image_url.trim() : "";
  const afterImageUrl = typeof body.after_image_url === "string" ? body.after_image_url.trim() : "";
  const programSlug = typeof body.program_slug === "string" ? body.program_slug.trim().slice(0, LABEL_MAX) || null : null;
  const durationLabel = typeof body.duration_label === "string" ? body.duration_label.trim().slice(0, LABEL_MAX) || null : null;
  const weightChange = typeof body.weight_change === "string" ? body.weight_change.trim().slice(0, LABEL_MAX) || null : null;
  const story = typeof body.story === "string" ? body.story.trim().slice(0, STORY_MAX) || null : null;
  const showUsername = typeof body.show_username === "boolean" ? body.show_username : true;

  if (!beforeImageUrl || !afterImageUrl) {
    return NextResponse.json({ error: "Both before and after photos are required." }, { status: 400 });
  }
  if (beforeImageUrl.length > URL_MAX || afterImageUrl.length > URL_MAX) {
    return NextResponse.json({ error: "Image URL too long." }, { status: 400 });
  }

  // Defense-in-depth (review follow-up): only accept photos from the
  // caller's OWN transformation-photos folder. next/image's remotePatterns
  // already blocks foreign hosts at render time; this closes the residual
  // gap of storing any allowlisted-host URL (someone else's object, an
  // unrelated bucket) as one's transformation.
  const ownFolderPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/transformation-photos/${auth.user.id}/`;
  if (!beforeImageUrl.startsWith(ownFolderPrefix) || !afterImageUrl.startsWith(ownFolderPrefix)) {
    return NextResponse.json(
      { error: "Photos must be uploaded through the transformation upload flow." },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("user_transformations")
    .insert({
      user_id: auth.user.id,
      before_image_url: beforeImageUrl,
      after_image_url: afterImageUrl,
      program_slug: programSlug,
      duration_label: durationLabel,
      weight_change: weightChange,
      story,
      show_username: showUsername
    })
    .select("id,status")
    .single();

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/community/transformations:POST", error.message);
    }
    console.error("[community/transformations] insert failed", error.message);
    return NextResponse.json({ error: "Failed to submit transformation." }, { status: 500 });
  }

  return NextResponse.json({ transformation: data }, { status: 201 });
}
