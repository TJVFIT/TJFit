import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

  const result = await resend.emails.send({
    from: "TJFit <hello@tjfit.org>",
    to,
    subject,
    html,
    attachments
  });

  return { ok: true as const, result };
}

