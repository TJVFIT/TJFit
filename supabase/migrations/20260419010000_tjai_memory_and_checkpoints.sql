-- Structured TJAI memory for adaptive generation
CREATE TABLE IF NOT EXISTS tjai_user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'generation',
  goal text,
  training_location text,
  training_days integer,
  diet_style text,
  obstacles text[],
  profile_json jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, source)
);

ALTER TABLE tjai_user_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own TJAI memory" ON tjai_user_memory;
CREATE POLICY "Users own TJAI memory" ON tjai_user_memory
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tjai_user_memory_user_updated
  ON tjai_user_memory(user_id, updated_at DESC);

-- Latest adaptive checkpoint for regeneration and evaluation state
CREATE TABLE IF NOT EXISTS tjai_adaptive_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  should_adapt boolean NOT NULL DEFAULT false,
  urgency text NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high')),
  trigger_regen boolean NOT NULL DEFAULT false,
  regen_reason text,
  snapshot_json jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_adaptive_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own TJAI adaptive checkpoints" ON tjai_adaptive_checkpoints;
CREATE POLICY "Users own TJAI adaptive checkpoints" ON tjai_adaptive_checkpoints
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tjai_adaptive_checkpoints_user_updated
  ON tjai_adaptive_checkpoints(user_id, updated_at DESC);
