import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_API_SECRET;
  if (secret) {
    const provided = request.headers.get("x-admin-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from("feedback_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Failed to fetch feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Unable to fetch feedback."
      },
      { status: 500 }
    );
  }
}
