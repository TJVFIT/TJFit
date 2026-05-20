import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isValidUsername, normalizeUsername } from "@/lib/username";

export async function GET(request: NextRequest) {
  // Anonymous endpoint — a bot can iterate strings to enumerate available
  // usernames for squatting or impersonation recon. Tight per-IP cap so
  // legitimate signup typeahead still works but brute-force is impractical.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const limiter = await rateLimit({
    key: `check-username:${ip}`,
    limit: 20,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { available: false, valid: false, error: "Too many requests." },
      { status: 429 }
    );
  }

  const usernameRaw = String(request.nextUrl.searchParams.get("username") ?? "")
    .slice(0, 64)
    .trim()
    .replace(/^@/, "");
  if (!isValidUsername(usernameRaw)) {
    return NextResponse.json({ available: false, valid: false });
  }
  const admin = getSupabaseServerClient();
  if (!admin) {
    return NextResponse.json(
      { available: false, valid: true, error: "Server not configured" },
      { status: 500 }
    );
  }
  const normalized = normalizeUsername(usernameRaw);
  const { count, error } = await admin
    .from("profiles")
    .select("id", { head: true, count: "exact" })
    .eq("username_normalized", normalized);
  if (error) {
    console.error("[users/check-username] count failed", error.message, error.code);
    return NextResponse.json({ available: false, valid: true, error: "Lookup failed" }, { status: 500 });
  }
  return NextResponse.json({ available: (count ?? 0) === 0, valid: true });
}
