import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.name || !body?.email || !body?.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: "TJFit Support <noreply@tjfit.org>",
          to: "tjfit.org@gmail.com",
          subject: `TJFit Support: ${String(body.subject ?? "Inquiry")} — ${String(body.name)}`,
          text: `Name: ${body.name}\nEmail: ${body.email}\nSubject: ${body.subject ?? "Inquiry"}\n\n${body.message}\n\nSent at: ${new Date().toISOString()}`
        })
      }).catch((e) => console.error("Support email send error:", e));
    } else {
      console.log("SUPPORT MESSAGE (no RESEND_API_KEY):", { name: body.name, email: body.email, subject: body.subject, message: body.message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Support contact crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
