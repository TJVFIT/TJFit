import { NextRequest, NextResponse } from "next/server";

import { renderSequenceTemplate } from "@/lib/email-templates";
import { signUnsubscribeToken } from "@/lib/email-preferences";
import { sendEmail } from "@/lib/email";
import { advanceEnrollment } from "@/lib/email/sequences";
import { EMAIL_SUBJECTS, isSupportedLocale, type Locale } from "@/lib/i18n";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ClaimedEnrollment = {
  id: string;
  user_id: string;
  sequence_id: string;
  current_step: number;
  sequence_name: string;
};

type SequenceStep = {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  template_key: string;
  subject_key: string;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

function getLocale(value: unknown): Locale {
  return typeof value === "string" && isSupportedLocale(value) ? value : "en";
}

function getResendMessageId(result: unknown) {
  const payload = result as { result?: { data?: { id?: string }; error?: { message?: string } } };
  return payload.result?.data?.id ?? null;
}

function getResendError(result: unknown) {
  const payload = result as { ok?: boolean; error?: string; result?: { error?: { message?: string } } };
  return payload.error ?? payload.result?.error?.message ?? null;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || getBearerToken(request) !== cronSecret) {
    return unauthorized();
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const stats = { processed: 0, sent: 0, failed: 0, completed: 0 };
  const { data: claimedRows, error: claimError } = await admin.rpc("claim_due_email_sequence_enrollments", {
    p_limit: 100
  });

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  const enrollments = ((claimedRows ?? []) as ClaimedEnrollment[]).slice(0, 100);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org").replace(/\/$/, "");

  for (const enrollment of enrollments) {
    stats.processed += 1;

    const { data: step, error: stepError } = await admin
      .from("email_sequence_steps")
      .select("id,sequence_id,step_order,delay_hours,template_key,subject_key")
      .eq("sequence_id", enrollment.sequence_id)
      .eq("step_order", Number(enrollment.current_step ?? 0) + 1)
      .eq("is_active", true)
      .maybeSingle<SequenceStep>();

    if (stepError) {
      stats.failed += 1;
      await admin.from("email_sequence_log").insert({
        enrollment_id: enrollment.id,
        status: "failed",
        error_message: stepError.message
      });
      continue;
    }

    if (!step) {
      await admin
        .from("email_sequence_enrollments")
        .update({ status: "completed", completed_at: new Date().toISOString(), next_send_at: null })
        .eq("id", enrollment.id);
      stats.completed += 1;
      continue;
    }

    const [{ data: profile }, userResult] = await Promise.all([
      admin
        .from("profiles")
        .select("display_name,username,email,locale,last_seen_at")
        .eq("id", enrollment.user_id)
        .maybeSingle<{ display_name: string | null; username: string | null; email: string | null; locale?: string | null }>(),
      admin.auth.admin.getUserById(enrollment.user_id)
    ]);

    const email = userResult.data.user?.email ?? profile?.email ?? null;
    if (!email) {
      await admin.from("email_sequence_log").insert({
        enrollment_id: enrollment.id,
        step_id: step.id,
        status: "failed",
        error_message: "User email not found"
      });
      stats.failed += 1;
      continue;
    }

    const locale = getLocale(profile?.locale);
    const name = profile?.display_name || profile?.username || email.split("@")[0] || "there";
    const appUrl = `${siteUrl}/${locale}`;
    const token = signUnsubscribeToken(enrollment.user_id, enrollment.sequence_id);
    const unsubscribeUrl = `${siteUrl}/api/email/unsubscribe?token=${token}`;
    const html = renderSequenceTemplate(step.template_key, { name, appUrl, unsubscribeUrl });

    if (!html) {
      await admin.from("email_sequence_log").insert({
        enrollment_id: enrollment.id,
        step_id: step.id,
        status: "failed",
        error_message: `Missing email template: ${step.template_key}`
      });
      stats.failed += 1;
      continue;
    }

    const sendResult = await sendEmail({
      to: email,
      subject: EMAIL_SUBJECTS[locale][step.subject_key] ?? EMAIL_SUBJECTS.en[step.subject_key] ?? "TJFit update",
      html
    });
    const resendError = getResendError(sendResult);

    if (resendError) {
      await admin.from("email_sequence_log").insert({
        enrollment_id: enrollment.id,
        step_id: step.id,
        status: "failed",
        error_message: resendError
      });

      const { data: recentFailures } = await admin
        .from("email_sequence_log")
        .select("status")
        .eq("enrollment_id", enrollment.id)
        .eq("step_id", step.id)
        .order("sent_at", { ascending: false })
        .limit(3);

      if ((recentFailures ?? []).length >= 3 && (recentFailures ?? []).every((row) => row.status === "failed")) {
        await admin
          .from("email_sequence_enrollments")
          .update({ status: "failed" })
          .eq("id", enrollment.id);
      }

      stats.failed += 1;
      continue;
    }

    await admin.from("email_sequence_log").insert({
      enrollment_id: enrollment.id,
      step_id: step.id,
      resend_message_id: getResendMessageId(sendResult),
      status: "sent"
    });

    const advanced = await advanceEnrollment(enrollment.id, admin);
    if (advanced.ok && advanced.completed) stats.completed += 1;
    stats.sent += 1;
  }

  return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
