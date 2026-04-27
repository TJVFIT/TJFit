-- Cohort-shared recipe cache. Recipes are keyed by a hash of
-- (meal_name + locale + religion_diet + allergies + cook_time) so users
-- with the same dietary profile see the same generated recipe text —
-- saves Haiku cost without sacrificing personalization (locale + diet
-- + allergies are all in the hash).
--
-- This is service-role-only; no user PII goes in here. The grocery
-- list and meal plan reference cached recipes via recipe_slug.

CREATE TABLE IF NOT EXISTS tjai_recipes_cache (
  hash         text PRIMARY KEY,
  meal_name    text NOT NULL,
  locale       text NOT NULL,
  recipe_json  jsonb NOT NULL,
  est_cost     text,
  hit_count    integer NOT NULL DEFAULT 0,
  last_hit_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_recipes_cache ENABLE ROW LEVEL SECURITY;

-- Service role only. Recipes are not user-scoped data.
DROP POLICY IF EXISTS "Service role manages tjai_recipes_cache" ON tjai_recipes_cache;
CREATE POLICY "Service role manages tjai_recipes_cache"
  ON tjai_recipes_cache
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_tjai_recipes_cache_locale_meal
  ON tjai_recipes_cache (locale, meal_name);
CREATE INDEX IF NOT EXISTS idx_tjai_recipes_cache_last_hit
  ON tjai_recipes_cache (last_hit_at DESC);
