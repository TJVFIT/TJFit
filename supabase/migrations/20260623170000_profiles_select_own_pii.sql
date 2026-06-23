-- Privacy/PII fix (high severity): public.profiles had two SELECT USING (true)
-- policies for the public role, exposing EVERY column of EVERY row via the REST
-- API (e.g. GET /rest/v1/profiles?select=email). Leaked columns include:
--   email           -> mass email harvest (spam / GDPR)
--   role            -> admin enumeration
--   subscription_tier, tjai_credit_balance -> financial privacy
--   privacy_settings, is_private, message_privacy -> "private" profiles readable
-- The Supabase advisor intentionally ignores SELECT(true), so it never flagged this.
--
-- Verified no legitimate read path relies on the public policy:
--   * every direct profiles read in the app uses the service role (bypasses RLS)
--   * public profile display goes through SECURITY DEFINER RPCs get_profile_card /
--     search_profiles (curated columns, bypass RLS)
--   * the public /api/coaches listing also uses the service role
-- Only direct anon/authenticated REST queries (the attack) used the policy.
--
-- Replace public read with self-read; admin/RPC paths are unaffected.

drop policy if exists "Public reads coach profiles" on public.profiles;
drop policy if exists "Public reads profiles v3" on public.profiles;

create policy "Profiles read own"
  on public.profiles
  for select
  to public
  using (auth.uid() = id);
