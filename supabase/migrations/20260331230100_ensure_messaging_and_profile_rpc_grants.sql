-- Ensure execute grants for RPCs used by Next.js API routes (idempotent).
-- Covers list/get helpers whose definitions were last replaced in earlier migrations
-- but may lack grants on some forked or repaired databases.

grant execute on function public.list_my_conversations_with_peers() to authenticated;
grant execute on function public.get_conversation_peer(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.get_profile_card(text) to authenticated;
grant execute on function public.get_profile_card(text) to anon;
grant execute on function public.search_profiles(text, int) to authenticated;
grant execute on function public.create_direct_conversation(uuid, text, text) to authenticated;
grant execute on function public.assert_can_message_peer(uuid) to authenticated;
