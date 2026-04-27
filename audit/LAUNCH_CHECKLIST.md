# TJFit launch checklist

**For Joseph.** Do these in order. Each item has a checkbox and a "stuck?" note.

---

## Step 1 — Vercel environment variables

Go to: https://vercel.com → `tjfitmain` project → Settings → Environment Variables

For each variable below, click **Add New**, paste the name in **Key**, paste the value in **Value**, check **Production + Preview + Development**, click Save.

### Required (site won't work without these)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard → Project Settings → API → Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from same page → Project API keys → `anon` `public`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — from same page → Project API keys → `service_role` (⚠️ secret)
- [ ] `ANTHROPIC_API_KEY` — from https://console.anthropic.com → Settings → API Keys → Create Key
- [ ] `RESEND_API_KEY` — from https://resend.com/api-keys → Create API Key
- [ ] `NEXT_PUBLIC_SITE_URL` — value: `https://tjfit.org`

### Required for checkout (Paddle)

- [ ] `PADDLE_API_KEY` — from Paddle dashboard → Developer Tools → Authentication
- [ ] `PADDLE_WEBHOOK_SECRET` — from Paddle dashboard → Developer Tools → Notifications → your destination → Secret key
- [ ] `PADDLE_ENVIRONMENT` — value: `production` (or `sandbox` while testing)
- [ ] `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` — from Paddle → Developer Tools → Authentication → Client-side tokens
- [ ] `NEXT_PUBLIC_PADDLE_ENVIRONMENT` — same as `PADDLE_ENVIRONMENT`
- [ ] `NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID` — from Paddle → Catalog → your monthly Pro price → Price ID
- [ ] `NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID` — Pro annual price ID
- [ ] `NEXT_PUBLIC_PADDLE_APEX_MONTHLY_PRICE_ID` — Apex monthly price ID
- [ ] `NEXT_PUBLIC_PADDLE_APEX_ANNUAL_PRICE_ID` — Apex annual price ID
- [ ] `PADDLE_PRICE_MAP` — JSON mapping of program slug → Paddle price ID. Format: `{"home-fat-burn-accelerator-12w":"pri_xxx","bodyweight-shred-system-12w":"pri_yyy"}`
- [ ] `PADDLE_WALLET_DISCOUNT_ID` — from Paddle → Catalog → Discounts → your TJCoin wallet discount → ID

### Auth + security secrets (you generate these)

For each of these, generate a random 32+ char string. On Mac/Linux: `openssl rand -hex 32`. On Windows PowerShell: `[Convert]::ToBase64String((1..32 | %{[byte](Get-Random -Max 256)}))`.

- [ ] `EMAIL_UNSUBSCRIBE_SECRET`
- [ ] `NEWSLETTER_CONFIRM_SECRET`
- [ ] `NEXTAUTH_SECRET`
- [ ] `CRON_SECRET`
- [ ] `ADMIN_EMAILS` — comma-separated list of admin emails: `you@example.com,partner@example.com`

### Optional — features degrade gracefully without these

- [ ] `ELEVENLABS_API_KEY` — voice replies in TJAI
- [ ] `OPENAI_API_KEY` — TJAI chat falls back to OpenAI for streaming (used in `/api/tjai/chat`)
- [ ] `ANTHROPIC_MODEL_OPUS`, `_SONNET`, `_HAIKU` — only set if you want to override defaults with newer model IDs you have access to
- [ ] `NEXT_PUBLIC_GA` — Google Analytics 4 measurement ID
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` — Meta pixel
- [ ] `NEXT_PUBLIC_TIKTOK_PIXEL_ID` — TikTok pixel
- [ ] `GOOGLE_SITE_VERIFICATION` — for Google Search Console
- [ ] `TRANSLATE_API_KEY` + `TRANSLATE_API_URL` — for custom-program auto-translate (optional)
- [ ] `CHECKOUT_PROMO_CODE` / `CHECKOUT_PROMO_PERCENT` — single launch promo
- [ ] `COACH_TERMS_VERSION` — bump this string when you update coach terms; forces re-acceptance

After saving all of these:
- [ ] Vercel → Deployments → most recent → ⋯ → **Redeploy**

**Stuck?** Tell me which env var you can't find a value for. Don't paste the value here — just say "I can't find PADDLE_API_KEY".

---

## Step 2 — Apply Supabase migrations

These 5 migrations were added in this branch and aren't yet on production:

1. `supabase/migrations/20260426120000_tjai_ai_call_logs.sql`
2. `supabase/migrations/20260426130000_tjai_settings_and_memory.sql`
3. `supabase/migrations/20260426140000_tjai_tts.sql`
4. `supabase/migrations/20260426150000_tjai_adaptive_suggestions.sql`
5. `supabase/migrations/20260426160000_tjai_streaks_and_badges.sql`

### Option A — Supabase CLI (recommended)

If you have the Supabase CLI installed and your project linked:
```
supabase db push
```
That applies any migration files newer than what's on production.

### Option B — Supabase Studio (manual, safe)

If you don't have the CLI:
1. Go to your production Supabase project → SQL Editor
2. For each of the 5 files above (in order), open the file in your editor, copy the SQL, paste into a new query, click **Run**.
3. Verify each table exists: `SELECT * FROM tjai_ai_call_logs LIMIT 1;` etc.

- [ ] All 5 migrations applied
- [ ] Verified by listing one row from each new table (or empty result, both fine — the point is "table exists")

**Stuck?** Tell me which migration errored and paste the error message. Don't paste row data.

---

## Step 3 — Paddle webhook

1. Paddle dashboard → Developer Tools → Notifications → Add destination
2. URL: `https://tjfit.org/api/webhooks/paddle`
3. Events to subscribe: `transaction.completed`, `transaction.payment_failed`, `subscription.activated`, `subscription.canceled`, `adjustment.created`
4. Save → copy the **Secret key** that Paddle generates → that's your `PADDLE_WEBHOOK_SECRET` env var (Step 1)
5. Send a test event from Paddle dashboard → confirm 200 response in Vercel logs

- [ ] Webhook URL configured
- [ ] Secret key in Vercel env
- [ ] Test event returned 200

---

## Step 4 — Resend domain verification

1. Resend → Domains → Add Domain → enter `tjfit.org`
2. Resend gives you 3-4 DNS records (DKIM, SPF, return-path)
3. Add those records to your DNS provider (GoDaddy / Cloudflare / wherever `tjfit.org` is hosted)
4. Wait for "Verified" status in Resend (usually 10 min – 2 hours, sometimes longer)

- [ ] Domain shows "Verified" in Resend
- [ ] Send yourself a test email via Resend dashboard → confirm it arrives in inbox (not spam)

---

## Step 5 — Smoke test on production

Once Steps 1-4 are done, redeploy and walk through these as a real user:

### Anonymous user
- [ ] Open `https://tjfit.org` — homepage loads, no console errors
- [ ] Open `/tr` — Turkish loads
- [ ] Open `/ar` — Arabic loads, layout flips RTL
- [ ] Open a free program: `/en/programs/home-fat-burn-accelerator-12w` — full body shows
- [ ] Open a paid program logged out: `/en/programs/<paid-slug>` — preview shows, "Sign up" / "Log in" CTAs visible, no full content leaked
- [ ] Click TJAI Chat in nav — lands on `/en/ai`

### Sign up + auth
- [ ] Click Sign up → create account with a fresh email
- [ ] Email verification arrives in inbox (Resend)
- [ ] Verify → land on dashboard

### TJAI
- [ ] Open TJAI chat
- [ ] Send "what should I eat before training?" — get a real reply
- [ ] Open `/en/ai/memory` — memory page loads (might be empty, that's fine)

### Paid program flow (Paddle sandbox first, then production)
- [ ] Open a paid program
- [ ] Click "Get full access"
- [ ] Paddle modal opens
- [ ] Complete sandbox checkout with test card
- [ ] Webhook fires → check Vercel logs for `paddle webhook` entry
- [ ] Refresh program page → "You have full access" shows
- [ ] Refund the test transaction in Paddle dashboard → access revoked

### Coach flow
- [ ] Sign up as a different user → become a coach → upload a custom program PDF
- [ ] Verify the PDF is auto-translated and stored

### Mobile (real device, not browser DevTools)
- [ ] Homepage at 360px wide on iPhone Safari — no horizontal scroll
- [ ] Program card tap target is comfortable (not tiny)
- [ ] Sticky purchase bar visible at bottom of paid program detail page
- [ ] TJAI chat input doesn't get covered by the keyboard

### Each locale (homepage + programs catalog only — fast pass)
- [ ] `/en/programs` ✓
- [ ] `/tr/programs` ✓
- [ ] `/ar/programs` ✓ (RTL works)
- [ ] `/es/programs` ✓
- [ ] `/fr/programs` ✓

---

## Step 6 — Soft launch

- [ ] Invite 10 friends/family to use the site
- [ ] Watch Vercel logs for errors over 24 hours
- [ ] Triage anything that breaks

If 24 hours pass with no P0 issues from real users → you're launched.

---

## When you're stuck

Tell me which step number you're on and what you're seeing. Don't paste:
- API keys / secrets
- User data / row data from Supabase
- Customer emails

Do paste:
- Error messages
- Vercel log lines
- Screenshots (with sensitive data redacted)
