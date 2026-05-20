import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Allow staging/dev branches to send from a different domain without touching
// the call sites. Falls back to the production sender.
const SENDER = process.env.RESEND_FROM_EMAIL ?? "TJFit <hello@tjfit.org>";

export async function sendEmail({
  to,
  subject,
  html,
  attachments
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: string | Buffer }>;
}) {
  if (!resend) {
    return { ok: false as const, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: SENDER,
      to,
      subject,
      html,
      attachments
    });
    // Resend SDK returns { data, error } — surface the error path explicitly
    // rather than swallowing it as a success.
    if (result.error) {
      return { ok: false as const, error: result.error.message ?? "Resend reported an error" };
    }
    return { ok: true as const, result };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Email send failed"
    };
  }
}

