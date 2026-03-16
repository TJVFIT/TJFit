import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
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
