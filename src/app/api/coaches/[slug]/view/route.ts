import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const slug = decodeURIComponent(params.slug ?? "").trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Anonymous endpoint that inserts DB rows. Without a rate limit a bot could
  // pump millions of rows into coach_profile_views to inflate analytics or
  // bloat the table. Limit per (IP, slug) to allow ~10 legitimate refreshes
  // per minute while killing spam loops. The view is silently suppressed when
  // over budget — we still return ok so we don't reveal limiter state.
  const limiter = await rateLimit({
    key: `coach-view:${ip}:${slug}`,
    limit: 10,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  const { data: coach } = await admin.from("profiles").select("id").eq("role", "coach").eq("username_normalized", slug).maybeSingle();
  if (!coach?.id) return NextResponse.json({ ok: false }, { status: 404 });

  await admin.from("coach_profile_views").insert({
    coach_id: coach.id,
    viewer_ip: ip === "unknown" ? null : ip
  });
  return NextResponse.json({ ok: true });
}
