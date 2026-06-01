-- Launch-readiness security hardening (advisor lints 0028 / 0029 / 0011).
-- Lock down SECURITY DEFINER functions that PostgREST exposes via /rest/v1/rpc.
-- Each grant was verified against the actual .rpc() callers in the codebase.

-- 1) Server-only credit functions: only ever invoked with the service-role
--    client. anon being able to call grant_tjai_credit was a privilege-
--    escalation hole (self-granting TJAI credits without signing in).
REVOKE EXECUTE ON FUNCTION public.grant_tjai_credit(uuid, integer, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.grant_tjai_credit(uuid, integer, text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.consume_tjai_credit(uuid, integer, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.consume_tjai_credit(uuid, integer, text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.consume_trial_message(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.consume_trial_message(uuid, integer) TO service_role;

-- 2) User-scoped RPCs: called with the authenticated user's client. Keep
--    authenticated + service_role, drop anon/PUBLIC.
REVOKE EXECUTE ON FUNCTION public.list_my_conversations_with_peers() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.list_my_conversations_with_peers() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.assert_can_message_peer(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.assert_can_message_peer(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.create_direct_conversation(uuid, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.create_direct_conversation(uuid, text, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_conversation_peer(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_conversation_peer(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.search_profiles(text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.search_profiles(text, integer) TO authenticated, service_role;

-- 3) Trigger / internal helper functions: invoked by the DB engine or by other
--    functions, never via RPC. Triggers fire as the table owner regardless of
--    EXECUTE grants, so revoking direct RPC access is safe.
REVOKE EXECUTE ON FUNCTION public.touch_profiles_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.profiles_username_enforce() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_workout_log_exercise_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.messages_before_insert_enforce() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.messaging_allowed(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.raise_if_messaging_blocked(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- 4) Pin search_path on the three flagged mutable-search_path functions
--    (lint 0011). public,pg_temp preserves unqualified object resolution while
--    removing the role-mutable attack surface.
ALTER FUNCTION public.touch_profiles_updated_at()         SET search_path = public, pg_temp;
ALTER FUNCTION public.profiles_username_enforce()         SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_workout_log_exercise_columns() SET search_path = public, pg_temp;

-- NOTE: get_profile_card(text) is intentionally left anon-executable (public
-- profile-card lookup). The remaining authenticated-executable lints for the
-- chat/search RPCs above are expected — those functions exist to be called by
-- signed-in users; SECURITY DEFINER + their own internal auth checks are the
-- intended design.
