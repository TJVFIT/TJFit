-- Two tables that were referenced in code but missing from migrations.
-- Middleware reads coach_terms_acceptance to gate /coach-dashboard, so
-- without this migration the coach gate 500s on every request.

-- ─── coach_terms_acceptance ─────────────────────────────────────────
-- Stores the coach-terms version each coach has accepted, so we can
-- force re-acceptance when COACH_TERMS_VERSION env bumps.

CREATE TABLE IF NOT EXISTS coach_terms_acceptance (
  coach_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version text        NOT NULL,
  ip_address    text,
  accepted_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coach_terms_acceptance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches read own terms acceptance"  ON coach_terms_acceptance;
CREATE POLICY "Coaches read own terms acceptance"
  ON coach_terms_acceptance
  FOR SELECT
  USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches insert own terms acceptance" ON coach_terms_acceptance;
CREATE POLICY "Coaches insert own terms acceptance"
  ON coach_terms_acceptance
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches update own terms acceptance" ON coach_terms_acceptance;
CREATE POLICY "Coaches update own terms acceptance"
  ON coach_terms_acceptance
  FOR UPDATE
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- Service role can read for middleware-style checks.
DROP POLICY IF EXISTS "Service role manages coach_terms_acceptance" ON coach_terms_acceptance;
CREATE POLICY "Service role manages coach_terms_acceptance"
  ON coach_terms_acceptance
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ─── newsletter_subscribers ────────────────────────────────────────
-- Double-opt-in newsletter list. Subscribe creates a pending row;
-- a confirm link (signed by NEWSLETTER_CONFIRM_SECRET) flips
-- subscribed_at and clears unsubscribed_at.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  source          text,
  locale          text,
  subscribed_at   timestamptz,
  unsubscribed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed
  ON newsletter_subscribers (subscribed_at)
  WHERE subscribed_at IS NOT NULL AND unsubscribed_at IS NULL;

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Email is keyed off the request body, not auth.uid(), so service-role
-- writes are how this table is mutated. Anonymous reads/writes are
-- explicitly blocked at the table level — endpoints use the service-
-- role client.
DROP POLICY IF EXISTS "Service role manages newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Service role manages newsletter_subscribers"
  ON newsletter_subscribers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
