import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const slug = decodeURIComponent(params.slug ?? "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const { data: coach } = await admin.from("profiles").select("id").eq("role", "coach").eq("username_normalized", slug).maybeSingle();
  if (!coach?.id) return NextResponse.json({ ok: false }, { status: 404 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  await admin.from("coach_profile_views").insert({ coach_id: coach.id, viewer_ip: ip });
  return NextResponse.json({ ok: true });
}
