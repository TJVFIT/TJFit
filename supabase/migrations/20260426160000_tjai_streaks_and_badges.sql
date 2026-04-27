-- Daily activity streaks (bumped by workout log or check-in).
CREATE TABLE IF NOT EXISTS tjai_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own tjai_streaks" ON tjai_streaks;
CREATE POLICY "Users own tjai_streaks" ON tjai_streaks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Awarded milestones / badges. One row per (user, code).
CREATE TABLE IF NOT EXISTS tjai_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

ALTER TABLE tjai_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own tjai_badges" ON tjai_badges;
CREATE POLICY "Users own tjai_badges" ON tjai_badges
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tjai_badges_user_awarded
  ON tjai_badges(user_id, awarded_at DESC);
