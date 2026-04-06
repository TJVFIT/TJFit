type BaseTemplate = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerUrl?: string;
};

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

