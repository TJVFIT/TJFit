import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { EmailTemplates } from "@/lib/email-templates";
import { verifyNewsletterConfirmToken } from "@/lib/newsletter-confirmation";
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
    return NextResponse.redirect(new URL("/", request.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org";
  await sendEmail({
    to: payload.email,
    subject: "Your Free 3-Day Workout Plan from TJFit 💪",
    html: EmailTemplates.newsletterPlanWelcome(baseUrl)
  });

  const locale = payload.locale || "en";
  return NextResponse.redirect(new URL(`/${locale}?newsletter=confirmed`, request.url));
}
