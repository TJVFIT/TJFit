import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit({
      key:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.ip ??
        "unknown",
      limit: 5,
      windowMs: 60_000
    });

    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json();
    const {
      age,
      full_name,
      specialty,
      languages,
      country,
      certifications_and_style,
      locale
    } = body;

    if (
      typeof age !== "number" ||
      age < 20 ||
      typeof full_name !== "string" ||
      !full_name.trim() ||
      typeof specialty !== "string" ||
      !specialty.trim() ||
      typeof languages !== "string" ||
      !languages.trim() ||
      typeof country !== "string" ||
      !country.trim() ||
      typeof certifications_and_style !== "string" ||
      !certifications_and_style.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("coach_applications").insert({
      age,
      full_name: full_name.trim(),
      specialty: specialty.trim(),
      languages: languages.trim(),
      country: country.trim(),
      certifications_and_style: certifications_and_style.trim(),
      locale: typeof locale === "string" ? locale : null
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Failed to save application." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Unable to submit application."
      },
      { status: 500 }
    );
  }
}
