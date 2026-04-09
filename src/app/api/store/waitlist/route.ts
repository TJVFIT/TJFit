import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const admin = getSupabaseServerClient();
    if (admin) {
      await admin.from("store_waitlist").upsert({ email }, { onConflict: "email" });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Store waitlist crash:", err);
    return NextResponse.json({ ok: true }); // Fail silently for UX
  }
}
