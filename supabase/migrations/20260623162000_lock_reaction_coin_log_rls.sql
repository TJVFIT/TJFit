-- Security fix: reaction_coin_log tracks each user's daily reaction-coin
-- earnings (coins_earned_today), read by the SECURITY DEFINER
-- tjfit_award_reaction RPC to enforce a 10/day earning cap.
--
-- The "reaction_coin_log_service_all" policy was mistakenly granted to the
-- public role with USING(true)/WITH CHECK(true) — letting any user reset or
-- delete their own cap row (to farm reaction-coins past the daily limit) and
-- tamper with OTHER users' rows.
--
-- The RPC is SECURITY DEFINER (bypasses RLS) and no application code touches
-- this table via the user client, so dropping the policy — leaving RLS
-- enabled with no user-facing policy (deny-all for anon/authenticated) —
-- closes the exploit and breaks nothing.

drop policy if exists "reaction_coin_log_service_all" on public.reaction_coin_log;
