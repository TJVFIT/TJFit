-- TJAI v2 intake answers. One row per user, replaces nothing — old quiz
-- still writes to `saved_tjai_plans.answers_json`. v2 writes here so
-- both flows can co-exist during the beta period.

CREATE TABLE IF NOT EXISTS tjai_intake_v2_answers (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stage       text NOT NULL DEFAULT 'personal'
              CHECK (stage IN ('persona', 'personal', 'local', 'health', 'complete')),
  answers     jsonb NOT NULL DEFAULT '{}'::jsonb,
  persona     text CHECK (persona IN ('drill', 'clinical', 'mentor')),
  -- For the "weight delta > 3 kg triggers tune-up" rule:
  baseline_weight_kg numeric(6,2),
  baseline_set_at    timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_intake_v2_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own tjai_intake_v2_answers" ON tjai_intake_v2_answers;
CREATE POLICY "Users own tjai_intake_v2_answers"
  ON tjai_intake_v2_answers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tjai_intake_v2_updated
  ON tjai_intake_v2_answers (updated_at DESC);
