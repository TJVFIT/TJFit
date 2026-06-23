-- Security/integrity fix: user_badges rows are shown on PUBLIC profiles
-- (profile/[username] + feed read them). The "user_badges_insert_service"
-- policy is named for the service role but was granted to the public role
-- with WITH CHECK (true) — letting any authenticated user INSERT a badge row
-- for ANY user_id (fake badges on their own profile, or deface someone
-- else's).
--
-- Legitimate awards are written by the service role (community-challenge-settle
-- via the admin client), which bypasses RLS, and the "user_badges_select_own"
-- SELECT policy stays for user-client reads. So dropping this INSERT policy
-- closes the defacement vector and breaks nothing.

drop policy if exists "user_badges_insert_service" on public.user_badges;
