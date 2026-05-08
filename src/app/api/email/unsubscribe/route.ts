import { NextRequest, NextResponse } from "next/server";

import { verifyUnsubscribeToken } from "@/lib/email-preferences";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const action = searchParams.get("action") ?? "unsubscribe";
  const verified = verifyUnsubscribeToken(token);
  if (!verified) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  if (verified.sequenceId) {
    await adminClient
      .from("email_sequence_enrollments")
      .update(
        action === "resubscribe"
          ? { status: "active", next_send_at: new Date().toISOString(), completed_at: null }
          : { status: "cancelled" }
      )
      .eq("user_id", verified.userId)
      .eq("sequence_id", verified.sequenceId);

    const resubscribeUrl = `/api/email/unsubscribe?token=${encodeURIComponent(token)}&action=resubscribe`;
    const title = action === "resubscribe" ? "You are re-subscribed" : "You have been unsubscribed";
    const body =
      action === "resubscribe"
        ? "You will receive the next email in this TJFit sequence."
        : "You will not receive more emails from this TJFit sequence.";

    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#09090B;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif"><main style="max-width:560px;margin:10vh auto;padding:32px"><p style="color:#22D3EE;font-weight:700">TJFit</p><h1>${title}</h1><p style="color:#A1A1AA;line-height:1.6">${body}</p>${action === "resubscribe" ? "" : `<a href="${resubscribeUrl}" style="display:inline-block;margin-top:16px;color:#09090B;background:#22D3EE;border-radius:999px;padding:12px 18px;text-decoration:none;font-weight:700">Re-subscribe</a>`}</main></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  await adminClient.from("user_email_preferences").upsert(
    action === "resubscribe"
      ? {
          user_id: verified.userId,
          weekly_program: true,
          achievements: true,
          blog_updates: true,
          streak_milestones: true,
          referrals: true,
          platform_news: true,
          unsubscribed_at: null,
          updated_at: new Date().toISOString()
        }
      : {
          user_id: verified.userId,
          weekly_program: false,
          achievements: false,
          blog_updates: false,
          streak_milestones: false,
          referrals: false,
          platform_news: false,
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
    { onConflict: "user_id" }
  );

  return NextResponse.json({
    ok: true,
    message: action === "resubscribe" ? "You have been re-subscribed." : "You have been unsubscribed."
  });
}

