-- Per-user TJAI preferences: coaching persona + memory toggle.
CREATE TABLE IF NOT EXISTS tjai_user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  persona text NOT NULL DEFAULT 'mentor' CHECK (persona IN ('drill', 'clinical', 'mentor')),
  memory_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own tjai_user_settings" ON tjai_user_settings;
CREATE POLICY "Users own tjai_user_settings" ON tjai_user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Free-form long-term facts learned during conversation (goals, injuries,
-- preferences, lifts, milestones). Distinct from structured tjai_user_memory.
CREATE TABLE IF NOT EXISTS tjai_long_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (
    category IN ('goal', 'injury', 'preference', 'lift', 'milestone', 'constraint', 'general')
  ),
  source text NOT NULL DEFAULT 'chat',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_long_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own tjai_long_memory" ON tjai_long_memory;
CREATE POLICY "Users own tjai_long_memory" ON tjai_long_memory
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tjai_long_memory_user_created
  ON tjai_long_memory(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tjai_long_memory_user_category
  ON tjai_long_memory(user_id, category);
