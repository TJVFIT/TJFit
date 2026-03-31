import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json();
    const { email, password } = body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = admin.supabase;
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    // If the user already exists as a normal customer, promote to coach.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile?.id) {
      if (existingProfile.role === "admin") {
        return NextResponse.json(
          { error: "Admin accounts cannot be converted into coach accounts." },
          { status: 400 }
        );
      }

      if (existingProfile.role === "coach") {
        return NextResponse.json({
          success: true,
          message: "This account is already a coach."
        });
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "coach", email: normalizedEmail })
        .eq("id", existingProfile.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message ?? "Failed to promote existing user to coach." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Existing account promoted to coach."
      });
    }

    if (typeof password !== "string" || !password.trim() || password.length < 8) {
      return NextResponse.json(
        { error: "Password is required (min 8) when creating a new coach account." },
        { status: 400 }
      );
    }

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        requested_role: "coach",
        created_by_admin: true
      }
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
      email: normalizedEmail,
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
