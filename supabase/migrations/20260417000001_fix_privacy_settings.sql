-- Fix: add privacy_settings column to profiles table if it doesn't exist
-- This column was defined in earlier migrations but may not have been applied to production

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS privacy_settings jsonb NOT NULL DEFAULT '{"show_streak":true,"show_coins":true,"show_programs":true,"show_posts":true}'::jsonb;

-- Also ensure the index exists for any queries that filter by privacy
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_settings ON profiles USING gin (privacy_settings);
