import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { isJsonObject, readRequestJson } from "@/lib/read-request-json";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const unavailable = () => NextResponse.json({ error: "Could not save your request. Try again later." }, { status: 503 });
  try {
    const ip = (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip") || "unknown").slice(0, 128);
    const limiter = await rateLimit({ key: `store-waitlist:${ip}`, limit: 5, windowMs: 60_000, failClosed: true });
    if (limiter.unavailable) return unavailable();
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": "60" } });
    }
    const parsed = await readRequestJson(req, 2048);
    if (!parsed.ok) return parsed.response;
    if (!isJsonObject(parsed.value) || typeof parsed.value.email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const email = parsed.value.email.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const admin = getSupabaseServerClient();
    if (!admin) return unavailable();
    const { error } = await admin.from("store_waitlist").upsert({ email }, { onConflict: "email" });
    if (error) return unavailable();
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}
