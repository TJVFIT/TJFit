import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 120;
const EMAIL_MAX = 200;
const SUBJECT_MAX = 200;
const MESSAGE_MAX = 5000;
const SUPPORT_INBOX = process.env.SUPPORT_INBOX ?? "tjfit.org@gmail.com";

function clamp(value: unknown, max: number): string {
  return String(value ?? "").slice(0, max).trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const limiter = await rateLimit({
      key:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown",
      limit: 5,
      windowMs: 60_000
    });
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const name = clamp(body.name, NAME_MAX);
    const email = clamp(body.email, EMAIL_MAX);
    const subject = clamp(body.subject, SUBJECT_MAX) || "Inquiry";
    const message = clamp(body.message, MESSAGE_MAX);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Route through the shared helper so the from/sender stays consistent
    // across the app. Escape user input in the HTML body — Resend handles
    // header encoding, but the text body must not let `<script>` etc through.
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    const html = `
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <hr>
      <p>${safeMessage}</p>
      <hr>
      <p style="color:#6b7280;font-size:12px">Sent at ${new Date().toISOString()}</p>
    `;

    const sent = await sendEmail({
      to: SUPPORT_INBOX,
      subject: `TJFit Support: ${subject} — ${name}`,
      html
    });

    if (!sent.ok) {
      console.error("[support/contact] sendEmail failed", sent.error);
      // Tell the user we couldn't deliver — previous version returned 200 even
      // on send failure, so users assumed messages got through when they didn't.
      return NextResponse.json({ error: "Could not deliver message. Try again later." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[support/contact] crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
