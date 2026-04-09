import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  try {
    const auth = await requireAuth();
    // Not logged in → return empty, never 500
    if (!auth.ok) {
      return NextResponse.json({ notifications: [] });
    }

    const { data, error } = await auth.supabase
      .from("pending_notifications")
      .select("id,type,message,created_at")
      .eq("user_id", auth.user.id)
      .eq("seen", false)
      .order("created_at", { ascending: true })
      .limit(5);

    if (error) {
      // Table might not exist yet or permission error — never crash the page
      console.error("Notifications fetch error:", error.message);
      return NextResponse.json({ notifications: [] });
    }

    const ids = (data ?? []).map((item) => item.id);
    if (ids.length > 0) {
      await auth.supabase.from("pending_notifications").update({ seen: true }).in("id", ids);
    }

    return NextResponse.json({ notifications: data ?? [] });
  } catch (err) {
    // Total fallback — never return 500 for notifications
    console.error("Notifications route crash:", err);
    return NextResponse.json({ notifications: [] });
  }
}
