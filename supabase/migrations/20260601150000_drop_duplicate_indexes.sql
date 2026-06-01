-- Drop redundant duplicate indexes flagged by the performance advisor
-- (lint duplicate_index). For tjai_plan_purchases the surviving index
-- (..._paddle_transaction_id_key) backs a UNIQUE constraint, so only the
-- standalone copy is dropped. For profiles and tjai_chat_messages neither
-- index backs a constraint; the survivor preserves the same uniqueness/coverage.
drop index if exists public.idx_tjai_plan_purchases_transaction;
drop index if exists public.idx_profiles_referral_code_unique;
drop index if exists public.idx_tjai_chat_messages_user_conv_created;
