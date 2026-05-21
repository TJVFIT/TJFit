import { NextRequest, NextResponse } from "next/server";
import { readRequestJson } from "@/lib/read-request-json";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const parsed = await readRequestJson(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.value as { email?: unknown; password?: unknown };
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
        console.error("[admin/authorize-coach] promote failed", updateError.message, updateError.code);
        return NextResponse.json(
          { error: "Failed to promote existing user to coach." },
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
      console.error("[admin/authorize-coach] createUser failed", createError.message);
      return NextResponse.json({ error: "Failed to create coach account." }, { status: 400 });
    }

    if (!userData?.user?.id) {
      return NextResponse.json(
        { error: "User created but could not retrieve ID." },
        { status: 500 }
      );
    }

    // The `handle_new_auth_user_profile` trigger on auth.users already
    // inserts a profiles row with role='user' (migration 20260330000500).
    // Previously this route did INSERT here, which hit a duplicate-key error
    // and left the new coach stuck as a plain user. UPDATE the role instead.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "coach", email: normalizedEmail })
      .eq("id", userData.user.id);

    if (profileError) {
      console.error(
        "[admin/authorize-coach] profile role update failed",
        profileError.message,
        profileError.code
      );
      return NextResponse.json(
        { error: "Coach created but profile role update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coach authorized. They can now log in with this email and password."
    });
  } catch (e) {
    console.error("[admin/authorize-coach] crash", e);
    return NextResponse.json({ error: "Unable to authorize coach." }, { status: 500 });
  }
}
