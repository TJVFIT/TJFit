-- Security fix: close public read access on tables exposed via PostgREST.
--
-- The Supabase security advisor (lint 0013 rls_disabled_in_public) flagged these
-- five public tables as having RLS DISABLED. With RLS off, anyone holding the
-- public anon key (which ships in the browser bundle) can read every row directly
-- via https://<project>.supabase.co/rest/v1/<table> — bypassing the app's API
-- entirely. reengagement_emails (email PII), tjai_plan_analytics (per-user plan
-- data) and program_preview_views (session_id) are the sensitive ones.
--
-- Every one of these tables is written/read ONLY by the service-role client in
-- server code (verified in src/): the service role bypasses RLS, so enabling RLS
-- with no permissive policy denies anon/public access while leaving all server
-- code working unchanged. No app behaviour changes.

ALTER TABLE public.reengagement_emails   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tjai_plan_analytics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_preview_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profile_views   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_catalog_flags ENABLE ROW LEVEL SECURITY;
