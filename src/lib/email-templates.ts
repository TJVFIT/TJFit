type BaseTemplate = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerUrl?: string;
};

export type SequenceTemplateKey =
  | "welcome"
  | "first_program_nudge"
  | "tip_progressive_overload"
  | "week_one_check_in"
  | "tjai_intro"
  | "one_month_progress"
  | "trial_started"
  | "trial_value_reminder"
  | "trial_expires_soon"
  | "trial_expired"
  | "we_miss_you"
  | "streak_at_risk"
  | "last_chance_offer";

function renderTemplate({ title, body, ctaLabel, ctaUrl, footerUrl }: BaseTemplate) {
  const cta =
    ctaLabel && ctaUrl
      ? `<a href="${ctaUrl}" style="display:inline-block;padding:12px 20px;border-radius:9999px;background:#22D3EE;color:#09090B;text-decoration:none;font-weight:700">${ctaLabel}</a>`
      : "";
  const unsubscribe = footerUrl
    ? `<p style="margin-top:24px;font-size:12px;color:#52525B"><a href="${footerUrl}" style="color:#A1A1AA">Unsubscribe</a></p>`
    : "";
  return `
  <div style="background:#09090B;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#fff;">
    <div style="max-width:620px;margin:0 auto;border:1px solid #1E2028;border-radius:16px;background:#111215;padding:24px;">
      <h1 style="font-size:24px;margin:0 0 12px;color:#22D3EE">TJFit</h1>
      <h2 style="font-size:22px;margin:0 0 12px;color:#fff">${title}</h2>
      <p style="font-size:15px;line-height:1.6;color:#A1A1AA;margin:0 0 20px">${body}</p>
      ${cta}
      ${unsubscribe}
    </div>
  </div>`;
}

export const EmailTemplates = {
  newsletterConfirm: (url: string) =>
    renderTemplate({
      title: "Confirm your TJFit newsletter subscription",
      body: "Tap the button below to confirm your email and unlock your free 3-day workout plan.",
      ctaLabel: "Confirm subscription",
      ctaUrl: url
    }),
  newsletterPlanWelcome: (url: string) =>
    renderTemplate({
      title: "Your Free 3-Day Workout Plan from TJFit 💪",
      body: [
        "Day 1 — Upper Body: Push-ups 4x10, DB Row 4x12, DB Shoulder Press 3x10, Tricep Dips 3x12, Plank 3x40s.",
        "Day 2 — Lower Body: Squats 4x12, Romanian Deadlift 4x10, Reverse Lunges 3x12/side, Glute Bridge 3x15, Calf Raises 4x20.",
        "Day 3 — Full Body Cardio Circuit: 5 rounds — 40s work / 20s rest (Jumping Jacks, Mountain Climbers, Bodyweight Squats, Push-ups, High Knees).",
        "Rest 60-90s between rounds and finish with 5 minutes of easy cooldown.",
        "",
        "Ready for a full 12 weeks? Start free on TJFit."
      ].join("\n"),
      ctaLabel: "Start free on TJFit",
      ctaUrl: url
    }),
  welcome: (name: string, url: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: `Welcome to TJFit, ${name} 💪`,
      body: "Start your first free program, set your goals, and unlock your first TJCOIN streak this week.",
      ctaLabel: "Start Your Free Program",
      ctaUrl: url,
      footerUrl: unsubscribeUrl
    }),
  weeklyPro: (month: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: `Your ${month} TJFit Pro Program is ready 🏋️`,
      body: "Your new 4-week structure is attached. Stay consistent and keep your streak alive this month.",
      footerUrl: unsubscribeUrl
    }),
  proMonthlyProgram: (month: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: `Your ${month} TJFit Pro Program is here 💪`,
      body: "Your fresh 4-week training program is attached as a PDF. Stay consistent and keep stacking progress.",
      footerUrl: unsubscribeUrl
    }),
  tjaiPlan: (name: string, url: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: `Your TJAI plan is ready, ${name}`,
      body: "Your personalized plan has been generated with calories, macros, and training structure.",
      ctaLabel: "View Your Full Plan",
      ctaUrl: url,
      footerUrl: unsubscribeUrl
    }),
  achievement: (name: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: `🏆 You just earned: ${name}`,
      body: "New badge unlocked and TJCOIN awarded. Keep building momentum.",
      footerUrl: unsubscribeUrl
    }),
  blogPublished: (title: string, url: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: "Your blog post is live on TJFit! 📝",
      body: `Your post "${title}" is now published and visible to the community.`,
      ctaLabel: "View Blog Post",
      ctaUrl: url,
      footerUrl: unsubscribeUrl
    }),
  blogRejected: (title: string, reason: string, unsubscribeUrl: string) =>
    renderTemplate({
      title: `Review needed: ${title}`,
      body: `Your post needs edits before publishing. Feedback: ${reason}`,
      footerUrl: unsubscribeUrl
    }),
  streakMilestone: (days: number, unsubscribeUrl: string) =>
    renderTemplate({
      title: `🔥 ${days}-day streak! You are unstoppable.`,
      body: "You hit a major consistency milestone. Keep going and claim your TJCOIN rewards.",
      footerUrl: unsubscribeUrl
    }),
  referralReward: (username: string, amount: number, unsubscribeUrl: string) =>
    renderTemplate({
      title: "⚡ You earned TJCOIN from a referral!",
      body: `${username} joined through your link. You earned +${amount} TJCOIN.`,
      footerUrl: unsubscribeUrl
    }),
  apexRenewal: (unsubscribeUrl: string) =>
    renderTemplate({
      title: "Your Apex subscription renewed successfully",
      body: "Your Apex access remains active. You can continue generating and refining full TJAI plans anytime.",
      footerUrl: unsubscribeUrl
    })
};

const sequenceTemplates: Record<
  SequenceTemplateKey,
  (input: { name: string; appUrl: string; unsubscribeUrl: string }) => string
> = {
  welcome: ({ name, appUrl, unsubscribeUrl }) => EmailTemplates.welcome(name, appUrl, unsubscribeUrl),
  first_program_nudge: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Choose your first program",
      body: "Pick a plan that matches your goal and lock in the first week of training.",
      ctaLabel: "Browse Programs",
      ctaUrl: `${appUrl}/programs`,
      footerUrl: unsubscribeUrl
    }),
  tip_progressive_overload: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Small progress beats random intensity",
      body: "Add a rep, a little weight, or cleaner form this week. That is how training compounds.",
      ctaLabel: "Track Progress",
      ctaUrl: `${appUrl}/progress`,
      footerUrl: unsubscribeUrl
    }),
  week_one_check_in: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Week one check-in",
      body: "You are a week in. Review your workouts, adjust your goal, and keep the next session simple.",
      ctaLabel: "Open Dashboard",
      ctaUrl: `${appUrl}/dashboard`,
      footerUrl: unsubscribeUrl
    }),
  tjai_intro: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Meet TJAI",
      body: "Use TJAI to turn your goals, equipment, and schedule into a plan you can actually follow.",
      ctaLabel: "Try TJAI",
      ctaUrl: `${appUrl}/ai`,
      footerUrl: unsubscribeUrl
    }),
  one_month_progress: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "One month of progress",
      body: "Take a minute to log what changed: strength, body metrics, consistency, or confidence.",
      ctaLabel: "Log Progress",
      ctaUrl: `${appUrl}/progress`,
      footerUrl: unsubscribeUrl
    }),
  trial_started: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Your TJAI trial has started",
      body: "Ask TJAI for a plan, meal ideas, or adjustments while your Core trial is active.",
      ctaLabel: "Open TJAI",
      ctaUrl: `${appUrl}/ai`,
      footerUrl: unsubscribeUrl
    }),
  trial_value_reminder: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Get more from your TJAI trial",
      body: "The best prompt is specific: goal, schedule, equipment, food preferences, and injury limits.",
      ctaLabel: "Continue Trial",
      ctaUrl: `${appUrl}/ai`,
      footerUrl: unsubscribeUrl
    }),
  trial_expires_soon: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Your TJAI trial expires soon",
      body: "Save your plan and make any final adjustments before the trial window closes.",
      ctaLabel: "Review TJAI",
      ctaUrl: `${appUrl}/ai`,
      footerUrl: unsubscribeUrl
    }),
  trial_expired: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Your TJAI trial has ended",
      body: "Upgrade when you are ready to keep generating and refining plans with TJAI.",
      ctaLabel: "View Membership",
      ctaUrl: `${appUrl}/membership`,
      footerUrl: unsubscribeUrl
    }),
  we_miss_you: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Your next session is waiting",
      body: "No reset needed. Open TJFit, choose one workout, and restart with the smallest useful step.",
      ctaLabel: "Open TJFit",
      ctaUrl: `${appUrl}/dashboard`,
      footerUrl: unsubscribeUrl
    }),
  streak_at_risk: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "Protect your streak",
      body: "A short session still counts. Log what you can today and keep the habit alive.",
      ctaLabel: "Log Workout",
      ctaUrl: `${appUrl}/progress`,
      footerUrl: unsubscribeUrl
    }),
  last_chance_offer: ({ appUrl, unsubscribeUrl }) =>
    renderTemplate({
      title: "One more nudge back",
      body: "Come back with a simple plan: one workout, one meal improvement, one logged win.",
      ctaLabel: "Return to TJFit",
      ctaUrl: `${appUrl}/dashboard`,
      footerUrl: unsubscribeUrl
    })
};

export function renderSequenceTemplate(
  templateKey: string,
  input: { name: string; appUrl: string; unsubscribeUrl: string }
) {
  const renderer = sequenceTemplates[templateKey as SequenceTemplateKey];
  if (!renderer) return null;
  return renderer(input);
}
