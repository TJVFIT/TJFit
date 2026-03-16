import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminEmailForUsername, isAdminEmail } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";

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
    const { username, password } = body;

    if (typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username or email is required." },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    let email: string;
    const fromMapping = getAdminEmailForUsername(username.trim());
    if (fromMapping) {
      email = fromMapping;
    } else if (username.includes("@") && isAdminEmail(username.trim())) {
      email = username.trim();
    } else {
      return NextResponse.json(
        { error: "Invalid admin username. Try your email instead." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password.trim()
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Login failed." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Login failed."
      },
      { status: 500 }
    );
  }
}
