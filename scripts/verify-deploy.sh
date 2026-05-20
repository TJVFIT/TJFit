#!/usr/bin/env bash
# verify-deploy.sh — post-merge live-site sanity checks.
#
# Run AFTER each PR merges and Vercel finishes deploying. Catches the
# irreversible stuff this Claude session couldn't verify (no live site
# access from the harness; no test JWT).
#
# Usage:
#   ./scripts/verify-deploy.sh                  # checks tjfit.org
#   SITE=https://tjfit-staging.vercel.app ./scripts/verify-deploy.sh
#
# Optional env:
#   TJAI_TEST_TOKEN  — Supabase access token for a test account; if
#                      set, attempts a TJAI generate smoke test that
#                      consumes ONE credit. Otherwise skipped.

set -euo pipefail

SITE="${SITE:-https://tjfit.org}"
RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RESET=$'\033[0m'

pass() { echo "${GREEN}PASS${RESET}  $1"; }
fail() { echo "${RED}FAIL${RESET}  $1"; FAILED=1; }
warn() { echo "${YELLOW}WARN${RESET}  $1"; }

FAILED=0

echo "→ Verifying $SITE"
echo

# ── 1. Domain — Organization JSON-LD must show $SITE host, not tjfit.com ──
echo "─── 1. Organization JSON-LD url field ───"
HTML="$(curl -fsSL "$SITE" || true)"
if [ -z "$HTML" ]; then
  fail "could not fetch $SITE — Vercel deploy may be down"
else
  JSON_LD_URL="$(echo "$HTML" | grep -oE '"@type":"Organization"[^}]*"url":"[^"]+"' | grep -oE '"url":"[^"]+"' | head -1 | sed 's/"url":"//;s/"$//')"
  if [ -z "$JSON_LD_URL" ]; then
    warn "no Organization JSON-LD found in homepage HTML — may be lazy-loaded"
  elif echo "$JSON_LD_URL" | grep -q "tjfit.com"; then
    fail "JSON-LD url is $JSON_LD_URL (still .com — NEXT_PUBLIC_SITE_URL on Vercel is wrong)"
  elif echo "$JSON_LD_URL" | grep -q "tjfit.org"; then
    pass "JSON-LD url = $JSON_LD_URL"
  else
    warn "JSON-LD url = $JSON_LD_URL (unexpected host)"
  fi
fi
echo

# ── 2. Coming-soon Turkish diacritics ──
echo "─── 2. Coming-soon Turkish (TR locale) ───"
TR_HTML="$(curl -fsSL "$SITE/tr/coming-soon" || curl -fsSL "$SITE/tr" || true)"
if [ -z "$TR_HTML" ]; then
  warn "could not fetch $SITE/tr — route may not exist or Vercel returned non-2xx"
else
  ALL_OK=1
  for needle in "Canlı" "çok yakında" "günlük" "üyelik" "dön"; do
    if echo "$TR_HTML" | grep -q "$needle"; then
      pass "diacritic present: $needle"
    else
      fail "diacritic MISSING: $needle (should be present after fix f61cb46)"
      ALL_OK=0
    fi
  done
  if [ "$ALL_OK" = "1" ]; then
    pass "all 5 Turkish diacritic markers present"
  fi
fi
echo

# ── 3. TJAI generate smoke test (only if TJAI_TEST_TOKEN is set) ──
echo "─── 3. TJAI generate refund safety ───"
if [ -z "${TJAI_TEST_TOKEN:-}" ]; then
  warn "TJAI_TEST_TOKEN not set — skipping live smoke test."
  warn "  To run: export TJAI_TEST_TOKEN=<test-account-supabase-access-token>"
  warn "  This will consume ONE TJAI credit on the test account."
else
  echo "  Hitting POST $SITE/api/tjai/generate with a deliberately-invalid"
  echo "  payload (empty body). Expected: 400 + credit refund (post-fix)."
  echo "  Pre-fix behavior: 400 + credit consumed without refund."

  RESPONSE="$(curl -fsSL -X POST "$SITE/api/tjai/generate" \
    -H "Authorization: Bearer $TJAI_TEST_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{}' \
    -w "\n%{http_code}" || echo -e "\nERR")"

  STATUS="$(echo "$RESPONSE" | tail -1)"
  if [ "$STATUS" = "400" ]; then
    pass "invalid-payload returns 400 (refund verification requires checking the credit ledger manually)"
    echo "       → check tjai_credit_ledger for a 'refund' event with reason='invalid_payload'"
    echo "       → for the test user, NEAR ${EPOCHREALTIME:-$(date +%s)}"
  else
    fail "expected 400, got $STATUS"
  fi
fi
echo

# ── 4. Robots / sitemap basics (cheap sanity) ──
echo "─── 4. Robots & sitemap reachable ───"
if curl -fsSL -o /dev/null "$SITE/robots.txt"; then pass "robots.txt 2xx"; else fail "robots.txt non-2xx"; fi
if curl -fsSL -o /dev/null "$SITE/sitemap.xml"; then pass "sitemap.xml 2xx"; else fail "sitemap.xml non-2xx"; fi
echo

# ── 4b. Bundles surface (the entire product catalog after restructure) ──
echo "─── 4b. Bundles routing ───"
if curl -fsSL -o /dev/null "$SITE/en/bundles"; then pass "/en/bundles index 2xx"; else fail "/en/bundles non-2xx"; fi
if curl -fsSL -o /dev/null "$SITE/en/bundles/fat-loss"; then
  pass "/en/bundles/fat-loss detail 2xx"
else
  fail "/en/bundles/fat-loss detail non-2xx (check generateStaticParams + getBundle)"
fi
# Download must require auth — anonymous request should be 401, NOT 200 or 500.
DOWNLOAD_STATUS="$(curl -s -o /dev/null -w "%{http_code}" "$SITE/api/bundles/download/fat-loss" || echo ERR)"
if [ "$DOWNLOAD_STATUS" = "401" ]; then
  pass "/api/bundles/download/fat-loss → 401 (auth-gated as expected)"
else
  fail "/api/bundles/download/fat-loss → $DOWNLOAD_STATUS (expected 401; check requireAuth in route)"
fi
# Old surface must stay gone — confirm /programs returns 404 (not 200) so we
# notice if someone accidentally restores the catalog later.
PROGRAMS_STATUS="$(curl -s -o /dev/null -w "%{http_code}" "$SITE/en/programs" || echo ERR)"
if [ "$PROGRAMS_STATUS" = "404" ]; then
  pass "/en/programs → 404 (catalog stays demolished)"
else
  warn "/en/programs → $PROGRAMS_STATUS (expected 404 after bundle restructure — investigate)"
fi
echo

# ── 5. Domain redirect (.com → .org) — informational ──
echo "─── 5. tjfit.com redirect ───"
COM_RESPONSE="$(curl -sI -o /dev/null -w "%{http_code} → %{redirect_url}" "https://tjfit.com" 2>&1 || echo "ERR")"
echo "       https://tjfit.com → $COM_RESPONSE"
echo "       (should 301 to https://tjfit.org if Vercel redirect is configured)"
echo

# ── Summary ──
if [ "$FAILED" = "1" ]; then
  echo "${RED}== One or more checks failed ==${RESET}"
  exit 1
else
  echo "${GREEN}== All automated checks passed ==${RESET}"
  echo "Manual checks still needed:"
  echo "  • Open the paid PDF flow end-to-end and confirm footer reads tjfit.org"
  echo "  • View-source on /tr/coming-soon and confirm visible diacritics"
  echo "  • Tail Vercel logs during a TJAI generate to confirm the finally"
  echo "    block fires when the pipeline returns ok=false"
  exit 0
fi
