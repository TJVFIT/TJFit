import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isValidUsername } from "@/lib/username";
import { isMissingSchemaMigrationError, jsonSchemaNotReady } from "@/lib/supabase-rpc-errors";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  }

  const raw = decodeURIComponent(params.username ?? "").trim();
  if (!raw || !isValidUsername(raw)) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("get_profile_card", { p_username: raw });

  if (error) {
    if (isMissingSchemaMigrationError(error.message)) {
      return jsonSchemaNotReady("api/profiles/by-username:GET", error.message);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ profile: data });
}
