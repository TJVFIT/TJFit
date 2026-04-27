-- MASTER SITE FIX MIGRATION — April 2026

-- ── Notifications (fixes the 500 on every page load) ─────────────────────────
CREATE TABLE IF NOT EXISTS pending_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  seen boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own notifications" ON pending_notifications;
CREATE POLICY "Users own notifications" ON pending_notifications
  FOR ALL USING (auth.uid() = user_id);

-- ── Community tables ──────────────────────────────────────────────────────────
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
DROP POLICY IF EXISTS "Auth users post threads" ON community_threads;
CREATE POLICY "Auth users post threads" ON community_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS thread_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES community_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL, created_at timestamptz DEFAULT now()
);
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads replies" ON thread_replies;
CREATE POLICY "Public reads replies" ON thread_replies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users reply" ON thread_replies;
CREATE POLICY "Auth users reply" ON thread_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS transformation_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_photo_url text NOT NULL, after_photo_url text NOT NULL,
  weeks_duration integer, program_id uuid, note text,
  is_approved boolean DEFAULT false, submitted_at timestamptz DEFAULT now()
);
ALTER TABLE transformation_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads approved transformations" ON transformation_posts;
CREATE POLICY "Public reads approved transformations" ON transformation_posts
  FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Users own transformations" ON transformation_posts;
CREATE POLICY "Users own transformations" ON transformation_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Coach applications ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL,
  certification text, years_experience text,
  specialties text[], languages text[], why_tjfit text,
  status text DEFAULT 'pending', applied_at timestamptz DEFAULT now()
);

-- ── Store waitlist ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL, created_at timestamptz DEFAULT now()
);

-- ── Suggestions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, description text NOT NULL,
  category text DEFAULT 'feature', status text DEFAULT 'under_review',
  vote_count integer DEFAULT 0, admin_response text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads suggestions" ON suggestions;
CREATE POLICY "Public reads suggestions" ON suggestions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users submit suggestions" ON suggestions;
CREATE POLICY "Auth users submit suggestions" ON suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS suggestion_votes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_id uuid REFERENCES suggestions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, suggestion_id)
);
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own suggestion votes" ON suggestion_votes;
CREATE POLICY "Users own suggestion votes" ON suggestion_votes
  FOR ALL USING (auth.uid() = user_id);

-- ── Public read policies for catalog tables ───────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.programs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public reads programs v2" ON programs;
    CREATE POLICY "Public reads programs v2" ON programs FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.diets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public reads diets v2" ON diets;
  END IF;
END $$;

DROP POLICY IF EXISTS "Public reads coach profiles" ON profiles;
CREATE POLICY "Public reads coach profiles" ON profiles FOR SELECT USING (true);
