import { NextRequest, NextResponse } from "next/server";

import { verifyNewsletterConfirmToken } from "@/lib/newsletter-confirmation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// One-click email unsubscribe (CAN-SPAM / GDPR). The token is the same
// HMAC-signed email token used for confirmation, but minted with
// source="unsubscribe" and a long TTL — and we only honor that source here
// so a confirmation token can't double as an unsubscribe.

const COPY: Record<string, { ok: string; sub: string; bad: string; home: string }> = {
  en: { ok: "You've been unsubscribed", sub: "You won't receive further marketing emails from TJFit.", bad: "This unsubscribe link is invalid or has expired.", home: "Back to TJFit" },
  tr: { ok: "Aboneliğin iptal edildi", sub: "TJFit'ten artık pazarlama e-postası almayacaksın.", bad: "Bu abonelikten çıkma bağlantısı geçersiz veya süresi dolmuş.", home: "TJFit'e dön" },
  ar: { ok: "تم إلغاء اشتراكك", sub: "لن تتلقى المزيد من رسائل TJFit التسويقية.", bad: "رابط إلغاء الاشتراك غير صالح أو منتهي الصلاحية.", home: "العودة إلى TJFit" },
  es: { ok: "Te has dado de baja", sub: "No recibirás más correos de marketing de TJFit.", bad: "Este enlace para darse de baja no es válido o ha caducado.", home: "Volver a TJFit" },
  fr: { ok: "Désabonnement confirmé", sub: "Tu ne recevras plus d'e-mails marketing de TJFit.", bad: "Ce lien de désabonnement est invalide ou expiré.", home: "Retour à TJFit" }
};

function page(locale: string, kind: "ok" | "bad"): string {
  const c = COPY[locale] ?? COPY.en;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const title = kind === "ok" ? c.ok : c.bad;
  const sub = kind === "ok" ? `<p style="font-size:14px;color:#A1A1AA;margin:0 0 20px">${c.sub}</p>` : "";
  return `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TJFit</title></head>
  <body style="margin:0;background:#09090B;font-family:Inter,Segoe UI,Arial,sans-serif;color:#fff">
    <div style="max-width:480px;margin:14vh auto;padding:32px;text-align:center;border:1px solid #1E2028;border-radius:16px;background:#111215">
      <h1 style="font-size:22px;margin:0 0 8px;color:#A855F7">TJFit</h1>
      <h2 style="font-size:20px;margin:0 0 10px">${title}</h2>
      ${sub}
      <a href="${base}/${locale}" style="display:inline-block;margin-top:8px;color:#A855F7;text-decoration:none;font-weight:600">${c.home}</a>
    </div>
  </body></html>`;
}

function htmlResponse(html: string, status: number): NextResponse {
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(request: NextRequest) {
  const token = String(request.nextUrl.searchParams.get("token") ?? "");
  const payload = token ? verifyNewsletterConfirmToken(token) : null;
  const locale = payload?.locale || "en";

  if (!payload || payload.source !== "unsubscribe") {
    return htmlResponse(page(locale, "bad"), 400);
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const nowIso = new Date().toISOString();
    // Update whichever list the email is on. Both are no-ops if absent, so
    // repeated clicks are harmless (idempotent).
    await supabase.from("newsletter_subscribers").update({ unsubscribed_at: nowIso }).eq("email", payload.email);
    await supabase.from("marketing_subscribers").update({ opted_in: false, updated_at: nowIso }).eq("email", payload.email);
  }

  return htmlResponse(page(locale, "ok"), 200);
}
