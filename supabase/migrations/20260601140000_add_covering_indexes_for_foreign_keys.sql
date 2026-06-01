-- Add covering indexes for all foreign keys flagged by the Supabase performance
-- advisor (lint 0001 unindexed_foreign_keys, 47 FKs). Improves join and
-- cascade-delete performance and prevents full table scans on FK lookups at
-- launch scale. All additive and idempotent; index names are table-qualified
-- to avoid schema-global name collisions (many tables share a user_id FK).
create index if not exists idx_affiliate_conversions_fk_order_id on public.affiliate_conversions (order_id);
create index if not exists idx_affiliate_conversions_fk_affiliate_id on public.affiliate_conversions (affiliate_id);
create index if not exists idx_affiliates_fk_user_id on public.affiliates (user_id);
create index if not exists idx_call_events_fk_call_session_id on public.call_events (call_session_id);
create index if not exists idx_call_events_fk_sender_id on public.call_events (sender_id);
create index if not exists idx_call_sessions_fk_conversation_id on public.call_sessions (conversation_id);
create index if not exists idx_call_sessions_fk_started_by on public.call_sessions (started_by);
create index if not exists idx_challenges_fk_created_by on public.challenges (created_by);
create index if not exists idx_coach_profile_views_fk_coach_id on public.coach_profile_views (coach_id);
create index if not exists idx_coach_review_requests_fk_user_id on public.coach_review_requests (user_id);
create index if not exists idx_coach_review_requests_fk_plan_id on public.coach_review_requests (plan_id);
create index if not exists idx_coach_review_requests_fk_coach_id on public.coach_review_requests (coach_id);
create index if not exists idx_commission_settings_fk_created_by on public.commission_settings (created_by);
create index if not exists idx_community_challenges_fk_created_by on public.community_challenges (created_by);
create index if not exists idx_community_spotlights_fk_user_id on public.community_spotlights (user_id);
create index if not exists idx_community_spotlights_fk_featured_by on public.community_spotlights (featured_by);
create index if not exists idx_community_threads_fk_user_id on public.community_threads (user_id);
create index if not exists idx_conversation_participants_fk_user_id on public.conversation_participants (user_id);
create index if not exists idx_conversations_fk_coach_student_link_id on public.conversations (coach_student_link_id);
create index if not exists idx_conversations_fk_created_by on public.conversations (created_by);
create index if not exists idx_coupons_fk_created_by on public.coupons (created_by);
create index if not exists idx_flash_sales_fk_created_by on public.flash_sales (created_by);
create index if not exists idx_group_members_fk_user_id on public.group_members (user_id);
create index if not exists idx_manual_purchase_requests_fk_fulfilled_by on public.manual_purchase_requests (fulfilled_by);
create index if not exists idx_message_attachments_fk_message_id on public.message_attachments (message_id);
create index if not exists idx_messages_fk_sender_id on public.messages (sender_id);
create index if not exists idx_program_certificates_fk_user_id on public.program_certificates (user_id);
create index if not exists idx_program_preview_views_fk_user_id on public.program_preview_views (user_id);
create index if not exists idx_program_reviews_fk_user_id on public.program_reviews (user_id);
create index if not exists idx_reengagement_emails_fk_user_id on public.reengagement_emails (user_id);
create index if not exists idx_referrals_fk_referred_id on public.referrals (referred_id);
create index if not exists idx_sale_commissions_fk_buyer_id on public.sale_commissions (buyer_id);
create index if not exists idx_sale_commissions_fk_applied_rule_id on public.sale_commissions (applied_rule_id);
create index if not exists idx_suggestion_votes_fk_suggestion_id on public.suggestion_votes (suggestion_id);
create index if not exists idx_suggestions_fk_user_id on public.suggestions (user_id);
create index if not exists idx_sync_log_fk_triggered_by on public.sync_log (triggered_by);
create index if not exists idx_thread_replies_fk_user_id on public.thread_replies (user_id);
create index if not exists idx_thread_replies_fk_thread_id on public.thread_replies (thread_id);
create index if not exists idx_tjai_plan_purchases_fk_user_id on public.tjai_plan_purchases (user_id);
create index if not exists idx_tjai_plan_suggestions_fk_plan_id on public.tjai_plan_suggestions (plan_id);
create index if not exists idx_tjfit_coin_ledger_fk_order_id on public.tjfit_coin_ledger (order_id);
create index if not exists idx_tjfit_discount_codes_fk_order_id on public.tjfit_discount_codes (order_id);
create index if not exists idx_tjfit_discount_codes_fk_user_id on public.tjfit_discount_codes (user_id);
create index if not exists idx_tjfit_discount_codes_fk_offer_key on public.tjfit_discount_codes (offer_key);
create index if not exists idx_transformation_posts_fk_user_id on public.transformation_posts (user_id);
create index if not exists idx_user_discount_codes_fk_user_id on public.user_discount_codes (user_id);
create index if not exists idx_user_transformations_fk_user_id on public.user_transformations (user_id);
