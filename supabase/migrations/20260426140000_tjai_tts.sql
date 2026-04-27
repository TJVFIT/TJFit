-- Add TTS autoplay preference.
ALTER TABLE tjai_user_settings
  ADD COLUMN IF NOT EXISTS tts_autoplay boolean NOT NULL DEFAULT false;

-- Audio cache so we don't re-bill ElevenLabs for identical (text, voice) pairs.
CREATE TABLE IF NOT EXISTS tjai_tts_cache (
  hash text PRIMARY KEY,
  voice_id text NOT NULL,
  audio_b64 text NOT NULL,
  bytes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 0,
  last_hit_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_tts_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages tjai_tts_cache" ON tjai_tts_cache;
CREATE POLICY "Service role manages tjai_tts_cache" ON tjai_tts_cache
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_tjai_tts_cache_last_hit ON tjai_tts_cache(last_hit_at DESC);
