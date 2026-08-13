import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  }

  // No explicit .eq("status", "approved") here: RLS (transformations_read_approved)
  // already restricts a session client to approved-or-own rows, so an
  // anonymous or non-owning caller gets a 404 for anything pending/rejected
  // without the route needing to duplicate that logic.
  const { data, error } = await supabase
    .from("user_transformations")
    .select(
      "id,before_image_url,after_image_url,program_slug,duration_label,weight_change,story,show_username,likes_count,status,created_at"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/community/transformations/[id]:GET", error.message);
    }
    console.error("[community/transformations/:id] fetch failed", error.message);
    return NextResponse.json({ error: "Failed to load transformation." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ transformation: data });
}
