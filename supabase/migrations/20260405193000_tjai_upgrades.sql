CREATE TABLE IF NOT EXISTS coach_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES saved_tjai_plans(id),
  status text NOT NULL DEFAULT 'pending',
  coach_id uuid REFERENCES auth.users(id),
  coach_notes jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE coach_review_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_read_own_requests ON coach_review_requests;
CREATE POLICY users_read_own_requests ON coach_review_requests
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS users_insert_own_requests ON coach_review_requests;
CREATE POLICY users_insert_own_requests ON coach_review_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS coaches_read_assigned ON coach_review_requests;
CREATE POLICY coaches_read_assigned ON coach_review_requests
  FOR SELECT
  USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS coaches_update_assigned ON coach_review_requests;
CREATE POLICY coaches_update_assigned ON coach_review_requests
  FOR UPDATE
  USING (auth.uid() = coach_id);

