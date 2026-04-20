-- Structured weekly self check-in (separate from AI-generated tjai_weekly_insights text cache)

CREATE TABLE IF NOT EXISTS tjai_weekly_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  week_start date NOT NULL,
  energy smallint NOT NULL CHECK (energy BETWEEN 1 AND 5),
  adherence smallint NOT NULL CHECK (adherence BETWEEN 1 AND 5),
  win text,
  blockers text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_tjai_weekly_check_ins_user_week
  ON tjai_weekly_check_ins (user_id, week_start DESC);

ALTER TABLE tjai_weekly_check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own weekly check-ins" ON tjai_weekly_check_ins;
CREATE POLICY "Users manage own weekly check-ins" ON tjai_weekly_check_ins
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
