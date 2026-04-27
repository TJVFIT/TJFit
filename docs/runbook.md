# TJFit on-call runbook

Short answers to "the site is on fire, what do I do?"

---

## Symptom: TJAI chat returns 500 / "TJAI temporarily offline"

**Likely cause:** missing `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in Vercel.

**Check:**
1. Vercel → Logs → filter to `/api/tjai/chat`
2. Look for "OPENAI_API_KEY is not set" or "ANTHROPIC_API_KEY is missing"
3. Add the missing key in Settings → Environment Variables → Redeploy

**Check 2:** Anthropic / OpenAI status page. If their API is down, our fallback path returns a graceful "I had a brief connection issue" message — site stays up.

---

## Symptom: TJAI memory page or admin dashboard returns 500

**Likely cause:** one of the 5 TJAI migrations didn't run on production.

**Check:** Supabase SQL Editor:
```sql
SELECT to_regclass('public.tjai_ai_call_logs') IS NOT NULL AS has_logs,
       to_regclass('public.tjai_user_settings') IS NOT NULL AS has_settings,
       to_regclass('public.tjai_long_memory')   IS NOT NULL AS has_memory,
       to_regclass('public.tjai_tts_cache')     IS NOT NULL AS has_tts,
       to_regclass('public.tjai_plan_suggestions') IS NOT NULL AS has_suggestions,
       to_regclass('public.tjai_streaks')       IS NOT NULL AS has_streaks,
       to_regclass('public.tjai_badges')        IS NOT NULL AS has_badges;
```
Any `false` = run that migration manually from `supabase/migrations/`.

---

## Symptom: Paddle checkout opens but webhook never fulfills

**Likely cause:** `PADDLE_WEBHOOK_SECRET` mismatch, or webhook URL not configured.

**Check:**
1. Vercel logs → filter to `/api/webhooks/paddle`
2. If no entries at all → webhook URL not set in Paddle dashboard. Set to `https://tjfit.org/api/webhooks/paddle`.
3. If entries with "signature mismatch" → `PADDLE_WEBHOOK_SECRET` in Vercel doesn't match what Paddle generated. Copy the secret from Paddle dashboard → paste into Vercel → Redeploy.
4. If 200 returned but no `program_orders` row → check the order's metadata: is the program `slug` in the Paddle custom data?

**Manual fulfill** (if a customer paid and the webhook failed):
1. Find the Paddle transaction ID
2. Supabase → SQL Editor → insert into `program_orders` manually with the slug, user_id, transaction_id
3. Verify access shows on the program page

---

## Symptom: Emails going to spam

**Cause:** Resend domain not verified, or DKIM/SPF DNS records missing.

**Fix:**
1. Resend dashboard → Domains → `tjfit.org` → check status
2. If "Pending" → add the DNS records they provide
3. If "Verified" but still going to spam → check the sender address (must be `@tjfit.org`, not `@resend.dev`)

---

## Symptom: Site shows wrong content per locale (Arabic looks like English)

**Cause:** middleware/locale routing broken, or browser cached an old build.

**Fix:**
1. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
2. If still broken, check Vercel deployment is current
3. Check `src/middleware.ts` — `runtime: 'nodejs'` and locale-prefix matching should be intact
4. Worst case: redeploy

---

## Symptom: A user can see another user's data (RLS leak)

**THIS IS P0. Stop everything else.**

1. Identify the table and the leak path
2. Supabase → Authentication → Policies → check policy on that table
3. Likely cause: policy `USING (true)` instead of `USING (auth.uid() = user_id)`
4. Patch the policy in production immediately
5. Audit other tables for the same pattern
6. Notify affected users per your privacy policy

---

## Symptom: Anthropic 4xx with "model_not_found"

**Cause:** `ANTHROPIC_MODEL_*` env var points to a model your account doesn't have access to.

**Fix:**
1. https://console.anthropic.com → Models → see which IDs are available
2. Either remove the `ANTHROPIC_MODEL_*` override (defaults work), or update to a valid ID

---

## Rollback procedure

If a deploy breaks production:

1. Vercel → Deployments → find the previous-known-good deployment
2. Click ⋯ → **Promote to Production**
3. Site reverts in ~30 seconds
4. Investigate the broken deploy locally before redeploying

For DB migrations:
- We don't auto-roll-back migrations. If a migration broke prod data, restore from Supabase daily backup (Supabase → Database → Backups → Restore).

---

## Who to ping

(Fill in with your actual contacts)

- **Vercel issues:** vercel.com/help
- **Supabase issues:** supabase.com/dashboard/support
- **Paddle issues:** Paddle dashboard → Support
- **Resend issues:** resend.com/support
- **Anthropic issues:** support.anthropic.com
