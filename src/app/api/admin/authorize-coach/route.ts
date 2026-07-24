import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { rateLimit } from "@/lib/rate-limit";
import { isTrustedMutationRequest } from "@/lib/request-security";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const limiter = await rateLimit({
    key: `authorize-coach:${admin.userId}`,
    limit: 10,
    windowMs: 10 * 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limiter.resetAt - Date.now()) / 1000)) }
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const { email, password } = body ?? {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const supabase = admin.supabase;
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    // If the user already exists as a normal customer, promote to coach.
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfileError) {
      return NextResponse.json(
        { error: "Unable to check the existing account." },
        { status: 503 }
      );
    }

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

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ role: "coach", email: normalizedEmail })
        .eq("id", existingProfile.id)
        .neq("role", "admin")
        .select("id")
        .maybeSingle();

      if (updateError || !updatedProfile) {
        return NextResponse.json(
          { error: "Failed to promote the existing user to coach." },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Existing account promoted to coach."
      });
    }

    if (typeof password !== "string" || password.length < 12 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 12 and 128 characters for a new coach account." },
        { status: 400 }
      );
    }

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      app_metadata: {
        role: "coach",
        created_by_admin: true
      }
    });

    if (createError) {
      return NextResponse.json(
        { error: "Failed to create the coach account." },
        { status: 400 }
      );
    }

    if (!userData?.user?.id) {
      return NextResponse.json(
        { error: "User created but could not retrieve ID." },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userData.user.id,
          email: normalizedEmail,
          role: "coach"
        },
        { onConflict: "id" }
      );

    if (profileError) {
      await supabase.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json(
        { error: "The coach profile could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coach authorized. They can now log in with this email and password."
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to authorize coach." },
      { status: 500 }
    );
  }
}
