import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { locales } from "@/lib/i18n";
import {
  exceedsDeclaredBodySize,
  getClientAddress,
  isTrustedMutationRequest
} from "@/lib/request-security";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sourceRegex = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (exceedsDeclaredBodySize(request, 8 * 1024)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const limiter = await rateLimit({
    key: `newsletter-ip:${getClientAddress(request)}`,
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

  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const locale =
    typeof body?.locale === "string" ? body.locale.trim().toLowerCase() : "en";
  const source =
    typeof body?.source === "string"
      ? body.source.trim().toLowerCase()
      : "guest-onboarding";

  if (!emailRegex.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (!locales.includes(locale as (typeof locales)[number]) || !sourceRegex.test(source)) {
    return NextResponse.json({ error: "Invalid locale or source." }, { status: 400 });
  }

  const emailLimiter = await rateLimit({
    key: `newsletter-email:${email}`,
    limit: 3,
    windowMs: 60 * 60_000
  });
  if (!emailLimiter.success) {
    // Keep this response indistinguishable from a successful subscription to
    // avoid exposing whether an address is already subscribed.
    return NextResponse.json({ success: true });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
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
    return NextResponse.json({ error: "Unable to save the subscription." }, { status: 503 });
  }

  return NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
