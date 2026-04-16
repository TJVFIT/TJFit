-- Add version_number to saved_tjai_plans (non-breaking, default 1 for existing rows)
ALTER TABLE saved_tjai_plans ADD COLUMN IF NOT EXISTS version_number integer NOT NULL DEFAULT 1;

-- Remove the unique constraint on user_id if it exists (allows multiple plans per user)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'saved_tjai_plans_user_id_key'
    AND conrelid = 'saved_tjai_plans'::regclass
  ) THEN
    ALTER TABLE saved_tjai_plans DROP CONSTRAINT saved_tjai_plans_user_id_key;
  END IF;
END $$;

-- Index for fetching latest plan per user efficiently
CREATE INDEX IF NOT EXISTS idx_saved_tjai_plans_user_updated
  ON saved_tjai_plans(user_id, updated_at DESC);
