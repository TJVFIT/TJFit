# Disaster recovery runbook

> Status: **Tested once a quarter.** Last test: never. Schedule first
> drill within 30 days of this runbook landing.

Single source of truth for "the lights went out — what now?" scenarios.
Read once a month. Update after every real incident.

---

## 0. Comms protocol (do this first, every time)

For any user-visible incident:

1. Post initial acknowledgement to status page (status.tjfit.org) within
   15 minutes — even if you don't know root cause yet. "We're aware of
   X. Investigating." beats silence.
2. Tweet from `@tjfit_official` if outage > 30 min.
3. Email `support@tjfit.org` autoresponder explains current status.
4. Update status page every 30 min until resolved.
5. Post-mortem within 7 days for any incident over 1 hour or affecting
   payments / data.

---

## 1. Supabase is down

**Detection:** `/api/health` returns 503, Sentry spike on
"Failed to fetch from Supabase", users report login broken.

**Mitigation:**
1. Check status.supabase.com — confirmed Supabase outage?
2. If yes: wait. There's nothing to do. Comms via status page.
3. If no (it's only us): check Supabase dashboard — paused project?
   exceeded compute? RLS rule looping?
4. Roll back any RLS changes from the last 24h (`git log` on
   `supabase/migrations/`).
5. Contact Supabase support if persistent and not on their status.

**What still works during outage:** static pages (everything that
doesn't require a DB call). Sign-up / login / TJAI / programs detail
fail. Catalog index pages work (data is built into the app at build).

---

## 2. Vercel deploy failed mid-rollout

**Detection:** Vercel deploy log shows red, site shows 500s on new pages.

**Mitigation:**
1. Open the Vercel dashboard for the failed deployment.
2. Click **Promote previous deployment** — instant rollback.
3. Investigate the failed build locally: `pnpm build`. Fix the issue.
4. Re-deploy.

Vercel keeps every previous deployment immutable; rollback is one click.

---

## 3. Sister has emergency access (founder unavailable)

Founder's sister Sara has read access to:
- 1Password vault `TJFit Emergency` (contains: Vercel admin password,
  Supabase admin, Gumroad admin, Resend admin, Cloudflare DNS, domain
  registrar)
- Phone numbers for: Vercel support, Supabase support
- Link to this runbook

**She can:**
- Roll back a Vercel deploy (1-click in dashboard)
- Pause subscriptions in Gumroad if there's a billing issue
- Reach out to support@tjfit.org to acknowledge incidents

**She cannot (escalate to founder):**
- Schema migrations
- Code changes
- Coach approvals / refunds (unless founder unreachable for 48h+)

Update this list every 90 days; verify her access by having her
log in to each system.

---

## 4. DDoS / abuse spike

**Detection:** Sentry / Vercel surfaces an unusual traffic spike,
Cloudflare dashboard shows attack traffic, application response times
degrade.

**Mitigation:**
1. Cloudflare → set "Under Attack Mode" (challenges every visitor).
   Reduces volume immediately.
2. Vercel → enable Vercel Firewall rate limit rules:
   - 100 req/min/IP for `/api/*`
   - 500 req/min/IP for `/`
3. Identify abusive IPs from logs → block at Cloudflare WAF.
4. If targeting auth: add CAPTCHA challenge to `/signup` and `/login`
   (Cloudflare Turnstile, free).
5. Status page update: "Investigating elevated traffic."

After the spike: review what got through, confirm no data
exfiltration, write incident note.

---

## 5. Major data corruption / rogue migration

**Detection:** Users report missing data; staff sees rows with
unexpected values; a recent migration touched production.

**Mitigation:**
1. **Stop writes.** Set Vercel project to maintenance mode (env var
   `MAINTENANCE_MODE=1` → middleware returns 503 with friendly page).
2. Identify the bad migration by `git log supabase/migrations/`
   correlated to incident time.
3. Restore from latest Supabase backup (Supabase Pro tier required
   for >7-day retention — confirm tier).
4. Replay any verified-clean migrations applied AFTER the backup.
5. Re-enable writes.
6. Comms: status page + email to all affected users about the
   downtime + any data loss window.

**Backup tiers:**
- Supabase Pro: daily automatic backups, 30 days retention
- Weekly export to Backblaze B2 / Wasabi / S3 (manual cron, see
  `scripts/backup-export.ts` — to be added)
- Test restore: once a quarter, restore latest backup to a staging
  project, verify queries return expected data, then trash the staging.

---

## 6. Payment webhook delivery failure

**Detection:** Users complete checkout in Gumroad, but `program_access`
row not granted; `payment_webhooks` table shows missing rows for
recent transactions.

**Mitigation:**
1. Check `payment_webhooks` table — events received? signature_valid?
   handler_error?
2. If receiving but failing: read handler_error, fix, re-trigger via
   Gumroad dashboard "resend webhook" feature.
3. If not receiving at all: check Gumroad webhook URL in dashboard —
   correct and reachable? Run `curl -I https://tjfit.org/api/webhooks/gumroad`.
4. Manually grant access to affected users from `/admin/users` while
   investigating.
5. Once root cause fixed, replay missed events from Gumroad dashboard.

---

## 7. OpenAI / Anthropic outage (TJAI down)

**Detection:** TJAI plan generation fails for all users, Sentry shows
errors from `/api/tjai/generate` or `/api/tjai/chat`.

**Mitigation:**
1. Check status.openai.com / status.anthropic.com.
2. If outage confirmed: post status page notice; TJAI generation is
   disabled until upstream recovers.
3. The `/chat` route already returns 503 with code `TJAI_UNAVAILABLE`
   when `OPENAI_API_KEY` is missing — check that path returns
   gracefully.
4. Existing saved plans / programs / diets still accessible — only
   new generations fail.

---

## 8. Domain / DNS hijack

**Detection:** Mail not arriving, site loads with wrong content,
users report seeing fake login pages.

**Mitigation:**
1. **Lock domain at registrar immediately** — if you can still log in.
2. Contact registrar support. Provide ID verification.
3. Restore correct DNS records (see `email-deliverability.md` for the
   email records; the A records point to Vercel IPs in their
   dashboard).
4. Force-rotate all secrets: Supabase service role, Resend API keys,
   Gumroad API key, OpenAI API key, Anthropic API key.
5. Audit every user account for unauthorized access. Force password
   reset for anyone with admin/coach role.
6. Public communication only after technical recovery.

---

## 9. Founder/team member account compromise

**Detection:** Suspicious activity in admin audit log, payouts to
unknown accounts, unauthorized refunds.

**Mitigation:**
1. Lock the compromised account: set `auth.users.banned_until` far in
   the future via Supabase dashboard.
2. Force log out all sessions globally (Supabase Auth → Sign Out All).
3. Rotate every secret as in #8.
4. Audit `admin_audit_log` for actions taken in the last 24h; reverse
   any unauthorized changes.
5. Notify any users whose accounts were modified.
6. Restore 2FA on all admin accounts (mandatory, not optional).

---

## 10. End-of-life / shutdown plan (extreme tail risk)

If TJFit must shut down:

1. 60 days notice to all users via in-app banner + email.
2. Pause new subscriptions immediately (Gumroad: disable products).
3. Refund all active monthly subs prorated to last day of access.
4. Refund all active annual subs prorated.
5. Programs / diets purchased one-time: deliver as PDF download
   regardless of shutdown date (one-time purchase = perpetual access
   right).
6. Export each user's data — auto-trigger the GDPR data-export flow.
7. After 60 days: archive database, take site offline, redirect
   tjfit.org to a static memorial page with download links for user
   data.
8. Pay final coach payouts within 30 days.
9. Comply with every refund request even after shutdown notice.
