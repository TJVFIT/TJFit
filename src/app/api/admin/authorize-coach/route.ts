import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json();
    const { email, password } = body;

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (typeof password !== "string" || !password.trim() || password.length < 6) {
      return NextResponse.json(
        { error: "Password is required and must be at least 6 characters." },
        { status: 400 }
      );
    }

    const supabase = admin.supabase;
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      email_confirm: true
    });

    if (createError) {
      return NextResponse.json(
        { error: createError.message ?? "Failed to create coach account." },
        { status: 400 }
      );
    }

    if (!userData?.user?.id) {
      return NextResponse.json(
        { error: "User created but could not retrieve ID." },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userData.user.id,
      email: email.trim().toLowerCase(),
      role: "coach"
    });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message ?? "Coach created but profile failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coach authorized. They can now log in with this email and password."
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Unable to authorize coach."
      },
      { status: 500 }
    );
  }
}
