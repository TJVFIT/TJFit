CREATE TABLE IF NOT EXISTS saved_tjai_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_json jsonb NOT NULL,
  answers_json jsonb NOT NULL,
  metrics_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_tjai_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_read_own_plans ON saved_tjai_plans;
CREATE POLICY users_read_own_plans ON saved_tjai_plans
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS users_insert_own_plans ON saved_tjai_plans;
CREATE POLICY users_insert_own_plans ON saved_tjai_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS users_delete_own_plans ON saved_tjai_plans;
CREATE POLICY users_delete_own_plans ON saved_tjai_plans
  FOR DELETE
  USING (auth.uid() = user_id);

