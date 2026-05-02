# Email deliverability runbook

> Status: **DNS not yet verified.** Apply the records below at the
> domain registrar (Cloudflare / GoDaddy / Namecheap — whichever holds
> tjfit.org). Resend will then mark the domain "verified" within 5
> minutes.

Per Resend Authentication Guide + Vanta deliverability research:
without these records, even valid transactional email goes to spam
(or never arrives). This runbook is the source of truth for the
records and the rollout plan.

---

## 1. Required DNS records (TXT + CNAME)

### SPF — at the root (`@`)

Type: `TXT`
Name: `@`
Value:

```
v=spf1 include:_spf.resend.com -all
```

> Use `-all` (hard fail) — not `~all` (soft fail). Resend's Authentication
> Guide explicitly warns that soft-fail SPF damages reputation.

If you already have an SPF record (e.g. for Google Workspace),
**combine into one record** — multiple SPF records on the same name
break the spec.

Example merged value:

```
v=spf1 include:_spf.google.com include:_spf.resend.com -all
```

### DKIM — three CNAMEs from Resend

Resend's dashboard shows three CNAME records on domain verification.
They look like this:

| Name                       | Value                                    |
|----------------------------|------------------------------------------|
| `resend._domainkey`        | `resend._domainkey.resend.com`           |
| `*._domainkey` *(if shown)*| value from dashboard                     |

Add all of them as `CNAME` records.

### DMARC — at `_dmarc.tjfit.org`

Type: `TXT`
Name: `_dmarc`
Value (rollout phases — start at Phase 1):

| Phase | When                              | Value                                                                |
|-------|-----------------------------------|----------------------------------------------------------------------|
| 1     | Day 0                             | `v=DMARC1; p=none; rua=mailto:dmarc@tjfit.org; pct=100`             |
| 2     | After 30 days clean monitoring    | `v=DMARC1; p=quarantine; rua=mailto:dmarc@tjfit.org; pct=100`       |
| 3     | After 90 days clean monitoring    | `v=DMARC1; p=reject; rua=mailto:dmarc@tjfit.org; pct=100`           |

Phase 1 is monitor-only. Resend / DMARC reports land at the `rua`
address — set up `dmarc@tjfit.org` to forward to your inbox.

Per Resend docs: **an email must pass either SPF or DKIM (not necessarily
both) for DMARC compliance.** Keep both healthy in case one breaks.

---

## 2. Sender domain strategy

Use distinct senders so transactional reputation isn't damaged by
marketing list churn.

| Address                | Purpose                                   | Verified in Resend |
|------------------------|-------------------------------------------|--------------------|
| `noreply@tjfit.org`    | Transactional (signup, receipts, alerts) | ✅ canonical sender |
| `hello@tjfit.org`      | Marketing / newsletter                   | separate sender    |
| `support@tjfit.org`    | Customer support inbox (Crisp routing)   | separate sender    |
| `coach@tjfit.org`      | System-sent on behalf of coaches         | separate sender    |
| `dmarc@tjfit.org`      | DMARC aggregate reports                  | inbox only         |
| `privacy@tjfit.org`    | GDPR / privacy enquiries (per privacy policy) | inbox only    |

---

## 3. Verification checklist

Run these AFTER DNS propagation (allow 30 min):

- [ ] `dig TXT tjfit.org +short` shows the SPF record exactly once
- [ ] `dig CNAME resend._domainkey.tjfit.org +short` resolves to Resend
- [ ] `dig TXT _dmarc.tjfit.org +short` shows the DMARC record
- [ ] In Resend dashboard, domain shows **Verified** with green ticks on SPF / DKIM / DMARC
- [ ] Send a test transactional email from the app → arrives in Gmail / Outlook **inbox** (not spam)
- [ ] Run [mxtoolbox.com/SuperTool.aspx](https://mxtoolbox.com/SuperTool.aspx) for `tjfit.org` — no warnings on SPF / DKIM / DMARC

---

## 4. What to do when emails go to spam after DNS is green

In order of likely cause:

1. **Sender reputation cold-start.** A new domain with no history will
   land in Promotions tab on Gmail until you build reputation. Send
   2-3 transactional emails per day for the first week; ramp slowly.
2. **Subject line / body trips spam filters.** Avoid all-caps,
   excessive `!!!`, large amounts of HTML, no plaintext alternative.
3. **List bounces / complaints.** Resend exposes these per send.
   Aggressively remove bounced addresses; complaint rate >0.1% damages
   reputation fast.
4. **Sender mismatch.** `From:` header MUST be a verified domain
   (`@tjfit.org`). Don't send as `@gmail.com` "via tjfit.org" — that's
   an instant spam flag.

---

## 5. Outage / failure procedure

If transactional emails stop delivering:

1. Check Resend dashboard — are there bounce / suspension flags?
2. Check `payment_webhooks` and Sentry for related errors (failed
   payments often correlate — Gumroad webhook retries can spike).
3. Verify DNS still resolves (registrar may have moved nameservers).
4. Re-test by sending a magic-link from the auth page to your own
   inbox.
5. If Resend is down, fallback: send via Supabase's built-in SMTP for
   auth-related emails (signup, password reset) — non-auth emails just
   queue until Resend recovers.
6. Communicate via in-app banner ("Confirmation emails are delayed —
   we'll retry").

---

## 6. Monthly hygiene

- Pull DMARC aggregate reports from `dmarc@tjfit.org` once a month
- Look for spoofing attempts (other senders trying to use `tjfit.org`)
- Confirm legitimate senders (Resend, Supabase) all have `pass`
  results in the report
- Promote DMARC policy: `none → quarantine → reject` once 90 days
  clean
