import { NextRequest, NextResponse } from "next/server";
import { buildProfilePatch, mapProfileUpdateError } from "@/lib/profile-validation";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAuth } from "@/lib/require-auth";
import { normalizeUsername } from "@/lib/username";

const PROFILE_SELECT =
  "id, email, role, username, username_normalized, display_name, avatar_url, bio, is_private, is_searchable, message_privacy, privacy_settings, banner_color, display_badge_key, created_at, updated_at";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", auth.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile: data });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const built = buildProfilePatch(parsed.value);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: built.status });
  }

  const patch = { ...built.patch };

  if (typeof patch.username === "string") {
    const norm = normalizeUsername(patch.username);
    const { data: taken } = await auth.supabase
      .from("profiles")
      .select("id")
      .eq("username_normalized", norm)
      .neq("id", auth.user.id)
      .maybeSingle();
    if (taken) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .update(patch)
    .eq("id", auth.user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    const mapped = mapProfileUpdateError(error.message);
    if (mapped) {
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
}
