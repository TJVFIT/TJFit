import { jsPDF } from "jspdf";

import { sendEmail } from "@/lib/email";
import { signUnsubscribeToken } from "@/lib/email-preferences";
import { EmailTemplates } from "@/lib/email-templates";
import { callClaude } from "@/lib/tjai-anthropic";

type RenewalInput = {
  userId: string;
  email: string;
  answers?: Record<string, unknown> | null;
};

function buildProgramPrompt(answers: Record<string, unknown>) {
  return `
Generate a structured 4-week training program only.
No diet plan.
Tone: expert coach.

User profile:
- Goal: ${String(answers.s2_goal ?? "Lose fat")}
- Training location: ${String(answers.s5_type ?? "Home")}
- Experience: ${String(answers.s10_dieted ?? "Beginner")}
- Weekly availability: ${String(answers.s5_days ?? "4")}
- Constraints: ${String(answers.s17_injuries ?? "None")}

Output format (strict JSON):
{
  "title": "4-week program title",
  "overview": "short overview",
  "weeks": [
    {
      "week": 1,
      "focus": "focus",
      "days": [
        {
          "day": "Monday",
          "session": "Upper body",
          "duration": "45 min",
          "exercises": ["Exercise 1 - sets x reps", "Exercise 2 - sets x reps"]
        }
      ]
    }
  ]
}`;
}

function defaultAnswers() {
  return {
    s2_goal: "Lose fat",
    s5_type: "Home",
    s10_dieted: "Beginner",
    s5_days: 4,
    s17_injuries: "None"
  };
}

function toPdfBase64(payload: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const lines = doc.splitTextToSize(payload, 500);
  doc.setFontSize(14);
  doc.text("TJFit Pro Monthly Program", 50, 60);
  doc.setFontSize(10);
  doc.text(lines, 50, 90);
  return doc.output("datauristring").split(",")[1] ?? "";
}

export async function sendProMonthlyProgramEmail(input: RenewalInput) {
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const answers = input.answers && Object.keys(input.answers).length > 0 ? input.answers : defaultAnswers();
  const system = "You are TJAI coach. Build practical progressive training plans.";
  const text = await callClaude({
    system,
    user: buildProgramPrompt(answers),
    maxTokens: 3500
  });
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org"}/api/email/unsubscribe?token=${signUnsubscribeToken(input.userId)}`;
  const pdfBase64 = toPdfBase64(text);
  return sendEmail({
    to: input.email,
    subject: `Your ${month} TJFit Pro Program is here 💪`,
    html: EmailTemplates.proMonthlyProgram(month, unsubscribeUrl),
    attachments: [{ filename: `tjfit-pro-program-${month.replace(/\s+/g, "-").toLowerCase()}.pdf`, content: pdfBase64 }]
  });
}

export async function sendApexRenewalEmail(userId: string, email: string) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org"}/api/email/unsubscribe?token=${signUnsubscribeToken(userId)}`;
  return sendEmail({
    to: email,
    subject: "Apex renewed successfully",
    html: EmailTemplates.apexRenewal(unsubscribeUrl)
  });
}

