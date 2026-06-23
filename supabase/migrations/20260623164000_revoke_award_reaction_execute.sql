-- Security fix (critical): tjfit_award_reaction mints TJCOINs and is SECURITY
-- DEFINER. It was EXECUTE-able by authenticated users directly via
-- /rest/v1/rpc, where the CALLER controls every parameter — including
-- p_daily_cap (default 10) and p_reactor_id (the function has no auth.uid()
-- check). A user could call it directly with p_author_id = self, a fresh fake
-- p_reactor_id each time (defeating the per-(post,reactor) idempotency), and
-- p_daily_cap = 999999 → mint unlimited coins → unlimited discount codes.
--
-- The only legitimate caller is /api/community/reactions, which runs as the
-- service role and sets p_reactor_id = the authenticated session user,
-- p_author_id = the real post author, and a server-constant cap. So restrict
-- EXECUTE to the service role; the route keeps working, direct user calls are
-- rejected.

revoke execute on function public.tjfit_award_reaction(uuid, uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.tjfit_award_reaction(uuid, uuid, uuid, integer) to service_role;
