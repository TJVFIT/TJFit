-- ============================================================
-- TJFIT MASTER MIGRATION — paste entire block into SQL Editor
-- ============================================================

-- saved_tjai_plans
CREATE TABLE IF NOT EXISTS saved_tjai_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  answers_json jsonb, metrics_json jsonb, plan_json jsonb,
  goal text, daily_calories integer, protein_g integer, carbs_g integer,
  fat_g integer, water_ml integer, training_days_per_week integer,
  training_location text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE saved_tjai_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own plans" ON saved_tjai_plans;
CREATE POLICY "Users own plans" ON saved_tjai_plans FOR ALL USING (auth.uid() = user_id);

-- tjai_plan_purchases
CREATE TABLE IF NOT EXISTS tjai_plan_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_transaction_id text UNIQUE NOT NULL,
  pdf_downloaded boolean DEFAULT false,
  purchased_at timestamptz DEFAULT now()
);
ALTER TABLE tjai_plan_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own purchases" ON tjai_plan_purchases;
CREATE POLICY "Users own purchases" ON tjai_plan_purchases FOR ALL USING (auth.uid() = user_id);

-- user_subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'core' CHECK (tier IN ('core','pro','apex')),
  paddle_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','paused')),
  current_period_start timestamptz, current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_subscriptions_read_own ON user_subscriptions;
CREATE POLICY user_subscriptions_read_own ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- tjai_trial_usage
CREATE TABLE IF NOT EXISTS tjai_trial_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_used integer NOT NULL DEFAULT 0,
  trial_started_at timestamptz, trial_ends_at timestamptz,
  last_reset_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tjai_trial_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tjai_trial_usage_read_own ON tjai_trial_usage;
CREATE POLICY tjai_trial_usage_read_own ON tjai_trial_usage FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS tjai_trial_usage_insert_own ON tjai_trial_usage;
CREATE POLICY tjai_trial_usage_insert_own ON tjai_trial_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS tjai_trial_usage_update_own ON tjai_trial_usage;
CREATE POLICY tjai_trial_usage_update_own ON tjai_trial_usage FOR UPDATE USING (auth.uid() = user_id);

-- pending_notifications
CREATE TABLE IF NOT EXISTS pending_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, message text NOT NULL,
  seen boolean DEFAULT false, created_at timestamptz DEFAULT now()
);
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own notifications" ON pending_notifications;
CREATE POLICY "Users own notifications" ON pending_notifications FOR ALL USING (auth.uid() = user_id);

-- community_threads
CREATE TABLE IF NOT EXISTS community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, body text NOT NULL,
  category text DEFAULT 'general', view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads threads" ON community_threads;
CREATE POLICY "Public reads threads" ON community_threads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth inserts threads" ON community_threads;
CREATE POLICY "Auth inserts threads" ON community_threads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- thread_replies
CREATE TABLE IF NOT EXISTS thread_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES community_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL, created_at timestamptz DEFAULT now()
);
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads replies" ON thread_replies;
CREATE POLICY "Public reads replies" ON thread_replies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth replies" ON thread_replies;
CREATE POLICY "Auth replies" ON thread_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text NOT NULL,
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true, created_by uuid REFERENCES auth.users(id)
);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads challenges" ON challenges;
CREATE POLICY "Public reads challenges" ON challenges FOR SELECT USING (true);

-- challenge_participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage participation" ON challenge_participants;
CREATE POLICY "Users manage participation" ON challenge_participants FOR ALL USING (auth.uid() = user_id);

-- groups
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, description text, created_at timestamptz DEFAULT now()
);
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads groups" ON groups;
CREATE POLICY "Public reads groups" ON groups FOR SELECT USING (true);

-- group_members
CREATE TABLE IF NOT EXISTS group_members (
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage membership" ON group_members;
CREATE POLICY "Users manage membership" ON group_members FOR ALL USING (auth.uid() = user_id);

-- transformation_posts
CREATE TABLE IF NOT EXISTS transformation_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_url text NOT NULL, after_url text NOT NULL,
  weeks_duration integer, program_id uuid, note text,
  is_approved boolean DEFAULT false, created_at timestamptz DEFAULT now()
);
ALTER TABLE transformation_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads approved" ON transformation_posts;
CREATE POLICY "Public reads approved" ON transformation_posts FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Users submit" ON transformation_posts;
CREATE POLICY "Users submit" ON transformation_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read policies
DROP POLICY IF EXISTS "Public reads programs v3" ON programs;
CREATE POLICY "Public reads programs v3" ON programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public reads profiles v3" ON profiles;
CREATE POLICY "Public reads profiles v3" ON profiles FOR SELECT USING (true);

-- Seed groups
INSERT INTO groups (name, description) VALUES
  ('Muscle Building', 'For those chasing size and strength'),
  ('Fat Loss', 'Cutting, shredding, and getting lean'),
  ('Home Training', 'No gym? No problem'),
  ('Nutrition & Diet', 'Meal prep, macros, eating well'),
  ('Turkish Community', 'Türkçe konuşanlar için'),
  ('Arabic Community', 'للمجتمع العربي')
ON CONFLICT DO NOTHING;
