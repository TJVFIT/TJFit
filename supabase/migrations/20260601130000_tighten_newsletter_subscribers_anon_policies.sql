-- newsletter_subscribers is written exclusively via the service-role client
-- (api/newsletter/subscribe + confirm, both getSupabaseServerClient). The two
-- public/anon policies are unused by the app and overly permissive:
--   * UPDATE USING(true) let any anon edit/unsubscribe ANY subscriber row.
--   * INSERT WITH CHECK(true) let anon POST rows directly, bypassing the
--     double-opt-in confirmation-token flow (spam vector).
-- Dropping both leaves RLS enabled with no anon access; the service role
-- bypasses RLS, so the newsletter flow is unaffected.
DROP POLICY IF EXISTS "Users manage own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscribers;
