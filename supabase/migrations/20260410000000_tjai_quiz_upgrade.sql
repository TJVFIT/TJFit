-- CHUNK 6: TJAI Quiz Upgrade + Site-Wide Fixes

-- ── Analytics for AI learning system (anonymous, no user_id) ────────────────
CREATE TABLE IF NOT EXISTS tjai_plan_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal text,
  sex text,
  age_range text,
  weight_range text,
  fitness_level text,
  training_location text,
  training_days integer,
  dietary_restrictions text[],
  generated_calories integer,
  generated_protein integer,
  outcome_weight_change numeric,
  created_at timestamptz DEFAULT now()
);
-- No RLS: no personal data, admin-only via service role

-- ── Public read access for catalog tables ────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.programs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public reads programs" ON programs;
    CREATE POLICY "Public reads programs" ON programs FOR SELECT USING (true);
  END IF;

  IF to_regclass('public.diets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public reads diets" ON diets;
    CREATE POLICY "Public reads diets" ON diets FOR SELECT USING (true);
  END IF;
END $$;

-- Allow public to read profiles for coach directory
DROP POLICY IF EXISTS "Public reads coach profiles" ON profiles;
CREATE POLICY "Public reads coach profiles" ON profiles FOR SELECT USING (true);

-- ── Ensure saved_tjai_plans exists with full schema ───────────────────────────
CREATE TABLE IF NOT EXISTS saved_tjai_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  answers_json jsonb,
  plan_json jsonb,
  metrics_json jsonb,
  goal text,
  daily_calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  water_ml integer,
  training_days_per_week integer,
  training_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE saved_tjai_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own plans" ON saved_tjai_plans;
CREATE POLICY "Users own plans" ON saved_tjai_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── tjai_chat_messages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tjai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tjai_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own messages" ON tjai_chat_messages;
CREATE POLICY "Users own messages" ON tjai_chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── user_chat_preferences ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_chat_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key text NOT NULL,
  preference_value text NOT NULL,
  source text DEFAULT 'chat',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, preference_key)
);
ALTER TABLE user_chat_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own preferences" ON user_chat_preferences;
CREATE POLICY "Users own preferences" ON user_chat_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
