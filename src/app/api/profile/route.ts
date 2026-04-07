import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

const ALLOWED_COLORS = new Set(["#111215", "#0F172A", "#1A0B2E", "#0B1A2E", "#0B2E0B", "#2E0B0B", "#1A1A0B", "#1C1412"]);

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    banner_color?: string;
    display_badge_key?: string | null;
    bio?: string;
    privacy_settings?: {
      show_streak?: boolean;
      show_coins?: boolean;
      show_programs?: boolean;
      show_posts?: boolean;
    };
  } | null;

  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.banner_color === "string" && ALLOWED_COLORS.has(body.banner_color)) {
    patch.banner_color = body.banner_color;
  }
  if (typeof body.display_badge_key === "string" || body.display_badge_key === null) {
    patch.display_badge_key = body.display_badge_key;
  }
  if (typeof body.bio === "string") {
    patch.bio = body.bio.trim().slice(0, 160);
  }
  if (body.privacy_settings && typeof body.privacy_settings === "object") {
    patch.privacy_settings = {
      show_streak: body.privacy_settings.show_streak !== false,
      show_coins: body.privacy_settings.show_coins !== false,
      show_programs: body.privacy_settings.show_programs !== false,
      show_posts: body.privacy_settings.show_posts !== false
    };
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .update(patch)
    .eq("id", auth.user.id)
    .select("id,username,display_name,bio,banner_color,privacy_settings,display_badge_key")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}
