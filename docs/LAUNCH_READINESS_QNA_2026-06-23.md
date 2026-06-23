# TJFit — Launch Readiness Q&A (2026-06-23)

Can TJFit go public and make money? **Short answer: yes for the $10 bundles the moment 3 owner
toggles are done; credits + subscriptions need a bit more.** Honest Q&A below.
Legend: ✅ ready · ⚠️ owner action · 🔴 blocker for that revenue line.

## 💰 Can it make money today?

**Q: Can a customer buy a program bundle right now?**
✅ **Yes.** All 10 paid bundles ($10) are mapped to live Gumroad products, checkout
(`/api/checkout/*`) and the fulfillment webhook (`/api/webhooks/gumroad`) are complete and
verified. As long as the site is deployed + DB is awake, money can come in.

**Q: Can a customer buy TJAI plan credits?**
🔴 **Not yet.** The 3 packs ($8/$35/$65) render but show "Available soon" — `product_gumroad_sync`
has 0 live Gumroad links. *Fix: create the products in Gumroad, paste me the IDs → I write the SQL.*

**Q: Can a customer subscribe (Pro / Apex)?**
🔴 **Not yet.** Needs the 4 `NEXT_PUBLIC_GUMROAD_{PRO,APEX}_{MONTHLY,ANNUAL}_URL` env vars in Vercel.

**Q: After payment, does the customer actually get their product?**
⚠️ Code is complete (PDF dossier + TJCOIN credit via `fulfillProgramOrderPaid` on the webhook).
Needs `RESEND_API_KEY` for the delivery email, and one real end-to-end test purchase to confirm.

## 🤖 Does the core product work?

**Q: Does TJAI generate real plans?**
⚠️ Code complete; needs `OPENAI_API_KEY` (and the Anthropic key) set in Vercel. The dev server
logs `FATAL: OPENAI_API_KEY is not set` locally — confirm it's set in prod and run one live
generation. The UI, intake, plan store, and PDF export are all built.

**Q: Does the TJAI chatbot respond?**
⚠️ Same dependency (LLM keys) + auth + a credit/subscription. Route + UI are built and auth-gated.

## 🛠️ Is it stable enough to launch?

**Q: Will the database stay up?**
⚠️ It's **restored and healthy now**, but the Supabase free tier auto-pauses after ~7 idle days
(that's what bit you). **Three ways to fix, cheapest first:**
1. 🟢 **New:** point a free uptime monitor (UptimeRobot / cron-job.org, ~10-min) at
   **`/api/health`** — I just added it; it pings the DB so it never idles. **$0.**
2. Set `CRON_SECRET` in Vercel so the existing daily `/api/cron` actually runs (it's currently
   gated and likely returning 401 → no DB activity).
3. Upgrade Supabase off the free tier (most robust).

**Q: Email working?** ⚠️ Needs `RESEND_API_KEY`.
**Q: Error monitoring?** ⚠️ None (no Sentry). Not a launch blocker, but add it soon for ops sanity.
**Q: Does it build cleanly?** ✅ `tsc --noEmit` exit 0, i18n parity passes, zero console errors.

## ⚖️ Legal / compliance / trust

**Q: Legal pages?** ✅ Terms, Privacy, Refund, Cookies, Health-disclaimer, Coach-agreement.
**Q: Cookie consent?** ✅ Present (analytics/marketing off until accepted).
**Q: Age/COPPA?** ⚠️ Verify the age-gate/COPPA copy meets your markets (was a tracked phase).

## 🔎 Discoverability

**Q: SEO ready?** ✅ `robots.ts`, `sitemap.ts`, `manifest.ts`, JSON-LD, OG images.
**Q: Analytics?** ⚠️ Event scaffolding exists (`analytics-events.ts`); confirm a GA4/Plausible ID
is wired so you can measure the funnel from day one.

## 🚦 Verdict

| Revenue line | Can it earn at launch? |
|---|---|
| **$10 bundles** | ✅ **Yes** — after the 3 toggles below |
| TJAI credits | 🔴 After Gumroad products linked |
| Subscriptions | 🔴 After sub env URLs set |

## ✅ Minimum to flip the "open" sign (in order)
1. **Deploy the branch** (merge `feat/tjfit-2m-overhaul`).
2. **Keep the DB awake** — uptime monitor → `/api/health` (free) **or** set `CRON_SECRET`.
3. **Confirm prod env keys:** `OPENAI_API_KEY`, Anthropic key, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. **One end-to-end test:** buy a bundle → confirm PDF email + access.
5. *(unlocks the other rails)* Link credit Gumroad products + set sub env URLs.

Do 1–4 and **you can legally and technically take bundle money on day one.**
