import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { EmailTemplates } from "@/lib/email-templates";
import { signNewsletterConfirmToken, verifyNewsletterConfirmToken } from "@/lib/newsletter-confirmation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const token = String(request.nextUrl.searchParams.get("token") ?? "");
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const payload = verifyNewsletterConfirmToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isHomepageFlow = payload.source === "homepage-newsletter";

  if (isHomepageFlow) {
    // Newsletter subscribers: dedicated confirmed list, triggers welcome
    // email + downloadable free plan. Replay protection ensures the welcome
    // only fires once per email.
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("email,subscribed_at,unsubscribed_at")
      .eq("email", payload.email)
      .maybeSingle();

    const alreadyConfirmed = Boolean(existing?.subscribed_at && !existing?.unsubscribed_at);

    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email: payload.email,
        source: payload.source || "homepage",
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[newsletter/confirm] newsletter upsert failed", error.message, error.code);
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!alreadyConfirmed) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org";
      const unsubToken = signNewsletterConfirmToken({
        email: payload.email,
        source: "unsubscribe",
        locale: payload.locale || "en",
        ttlMinutes: 60 * 24 * 90 // 90 days — opt-out must keep working long after send
      });
      const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubToken)}`;
      await sendEmail({
        to: payload.email,
        subject: "Your Free 3-Day Workout Plan from TJFit",
        html: EmailTemplates.newsletterPlanWelcome(baseUrl, unsubscribeUrl),
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
        }
      });
    }
  } else {
    // All other sources (guest-onboarding, popups, etc.) flow into the
    // broader marketing list — same consent flow, just a different table.
    // Previously these wrote directly without confirmation, which let an
    // attacker spam-subscribe arbitrary emails.
    const { error } = await supabase.from("marketing_subscribers").upsert(
      {
        email: payload.email,
        locale: payload.locale || "en",
        source: payload.source || "unknown",
        opted_in: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[newsletter/confirm] marketing upsert failed", error.message, error.code);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const locale = payload.locale || "en";
  return NextResponse.redirect(new URL(`/${locale}?newsletter=confirmed`, request.url));
}
