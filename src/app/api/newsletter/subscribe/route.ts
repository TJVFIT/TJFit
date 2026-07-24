import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { EmailTemplates } from "@/lib/email-templates";
import { signNewsletterConfirmToken } from "@/lib/newsletter-confirmation";
import { rateLimit } from "@/lib/rate-limit";
import { readRequestJson } from "@/lib/read-request-json";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const limiter = await rateLimit({
    key:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown",
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

  // Reveal-on-confirmed path only — previously the homepage-newsletter source
  // went through double-opt-in but everything else wrote directly into
  // marketing_subscribers with opted_in=true. That let an attacker spam any
  // email into the marketing list without consent. Now all anonymous opt-ins
  // require email confirmation; the token carries the source so the confirm
  // route knows where to write.
  const isHomepageFlow = source === "homepage-newsletter";

  if (isHomepageFlow) {
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id,email,unsubscribed_at")
      .eq("email", email)
      .limit(1)
      .maybeSingle();
    if (existing && !existing.unsubscribed_at) {
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }
  }

  const token = signNewsletterConfirmToken({ email, source, locale, ttlMinutes: 60 * 24 });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org";
  const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const sendResult = await sendEmail({
    to: email,
    subject: "Confirm your TJFit subscription",
    html: EmailTemplates.newsletterConfirm(confirmUrl)
  });

  if (!sendResult.ok) {
    return NextResponse.json({ error: "Could not send confirmation email." }, { status: 500 });
  }

  return NextResponse.json({ success: true, pendingConfirmation: true });
}
