-- Capture post-workout effort signals for adaptive coaching.
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS rpe numeric(3,1);
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS soreness smallint;
ALTER TABLE workout_logs
  ADD CONSTRAINT workout_logs_rpe_range CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10)) NOT VALID;
ALTER TABLE workout_logs
  ADD CONSTRAINT workout_logs_soreness_range CHECK (soreness IS NULL OR (soreness >= 0 AND soreness <= 5)) NOT VALID;

-- AI-proposed plan changes the user accepts or rejects.
CREATE TABLE IF NOT EXISTS tjai_plan_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES saved_tjai_plans(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (
    kind IN ('deload', 'progression', 'swap', 'volume_change', 'frequency_change', 'recovery_week', 'general')
  ),
  title text NOT NULL,
  summary text NOT NULL,
  rationale text NOT NULL,
  patch_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  signals_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'rejected', 'expired')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE tjai_plan_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own tjai_plan_suggestions" ON tjai_plan_suggestions;
CREATE POLICY "Users own tjai_plan_suggestions" ON tjai_plan_suggestions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tjai_plan_suggestions_user_status
  ON tjai_plan_suggestions(user_id, status, created_at DESC);
