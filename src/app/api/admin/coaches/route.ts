import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const supabase = admin.supabase;
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("role", "coach")
      .order("email");

    if (error) {
      console.error("[admin/coaches] list failed", error.message, error.code);
      return NextResponse.json({ error: "Failed to fetch coaches." }, { status: 500 });
    }

    return NextResponse.json({ coaches: data ?? [] });
  } catch (e) {
    console.error("[admin/coaches] crash", e);
    return NextResponse.json({ error: "Unable to fetch coaches." }, { status: 500 });
  }
}
