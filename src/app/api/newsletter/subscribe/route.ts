import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { EmailTemplates } from "@/lib/email-templates";
import { signNewsletterConfirmToken } from "@/lib/newsletter-confirmation";
import { readRequestJson } from "@/lib/read-request-json";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const limiter = rateLimit({
    key: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.ip ?? "unknown",
    limit: 20,
    windowMs: 60_000
  });

  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const email = String(body.email ?? "").trim().toLowerCase();
  const locale = String(body.locale ?? "en").trim().toLowerCase();
  const source = String(body.source ?? "guest-onboarding").trim().toLowerCase();

  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  if (source === "homepage-newsletter") {
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id,email,unsubscribed_at")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (existing && !existing.unsubscribed_at) {
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    const token = signNewsletterConfirmToken({ email, source, locale, ttlMinutes: 60 * 24 });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org";
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const sendResult = await sendEmail({
      to: email,
      subject: "Confirm your TJFit newsletter subscription",
      html: EmailTemplates.newsletterConfirm(confirmUrl)
    });

    if (!sendResult.ok) {
      return NextResponse.json({ error: "Could not send confirmation email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, pendingConfirmation: true });
  }

  const { error } = await supabase
    .from("marketing_subscribers")
    .upsert(
      {
        email,
        locale,
        source,
        opted_in: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
