import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isValidUsername, normalizeUsername } from "@/lib/username";

export async function GET(request: NextRequest) {
  const usernameRaw = String(request.nextUrl.searchParams.get("username") ?? "").trim().replace(/^@/, "");
  if (!isValidUsername(usernameRaw)) {
    return NextResponse.json({ available: false, valid: false });
  }
  const admin = getSupabaseServerClient();
  if (!admin) {
    return NextResponse.json({ available: false, valid: true, error: "Server not configured" }, { status: 500 });
  }
  const normalized = normalizeUsername(usernameRaw);
  const { count, error } = await admin
    .from("profiles")
    .select("id", { head: true, count: "exact" })
    .eq("username_normalized", normalized);
  if (error) {
    return NextResponse.json({ available: false, valid: true, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ available: (count ?? 0) === 0, valid: true });
}
