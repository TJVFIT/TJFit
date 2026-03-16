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
      return NextResponse.json(
        { error: error.message ?? "Failed to fetch coaches." },
        { status: 500 }
      );
    }

    return NextResponse.json({ coaches: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Unable to fetch coaches."
      },
      { status: 500 }
    );
  }
}
