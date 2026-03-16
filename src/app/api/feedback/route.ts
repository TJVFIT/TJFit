import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const VALID_TYPES = ["complaint", "suggestion", "feedback", "help_request", "refund_request"] as const;

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit({
      key:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.ip ??
        "unknown",
      limit: 10,
      windowMs: 60_000
    });

    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await request.json();
    const { type, subject, message, order_reference, email, locale } = body;

    if (
      !VALID_TYPES.includes(type) ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields (type, message)." },
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

    const { error } = await supabase.from("feedback_submissions").insert({
      type,
      subject: typeof subject === "string" ? subject.trim() || null : null,
      message: message.trim(),
      order_reference: typeof order_reference === "string" ? order_reference.trim() || null : null,
      email: typeof email === "string" ? email.trim() || null : null,
      locale: typeof locale === "string" ? locale : null
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Failed to save feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Unable to submit feedback."
      },
      { status: 500 }
    );
  }
}
