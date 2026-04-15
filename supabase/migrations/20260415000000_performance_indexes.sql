-- CLAUDEUPGRADE2: Performance indexes for high-traffic query patterns.
-- These cover the most common filter/sort combinations observed in API routes.

-- tjai_chat_messages: user + conversation history lookups (most frequent TJAI query)
create index if not exists idx_tjai_chat_messages_user_conv_created
  on tjai_chat_messages(user_id, conversation_id, created_at desc);

-- tjai_trial_usage: per-user trial counter (checked on every Core user chat)
create index if not exists idx_tjai_trial_usage_user_id
  on tjai_trial_usage(user_id);

-- progress_entries: user progress timeline
create index if not exists idx_progress_entries_user_date
  on progress_entries(user_id, entry_date desc);

-- workout_logs: user workout history (progress page)
create index if not exists idx_workout_logs_user_date
  on workout_logs(user_id, workout_date desc);

-- progress_milestones: user milestone list
create index if not exists idx_progress_milestones_user_created
  on progress_milestones(user_id, created_at desc);

-- program_orders: access gate checks (very frequent — every program page load)
create index if not exists idx_program_orders_user_status
  on program_orders(user_id, status);

-- program_orders: coach sales stats
create index if not exists idx_program_orders_coach_status
  on program_orders(coach_id, status);

-- user_subscriptions: tier lookups (checked on every TJAI + gated page)
create index if not exists idx_user_subscriptions_user_id
  on user_subscriptions(user_id);

-- community_blog_posts: author + status (profile page, coach listing)
create index if not exists idx_community_blog_posts_author_status
  on community_blog_posts(author_id, status, created_at desc);

-- challenge_participants: batch lookups by challenge_id (challenge listing)
create index if not exists idx_challenge_participants_challenge_id
  on challenge_participants(challenge_id);

-- challenge_participants: viewer join check
create index if not exists idx_challenge_participants_user_challenge
  on challenge_participants(user_id, challenge_id);

-- challenge_logs: batch score aggregation by challenge
create index if not exists idx_challenge_logs_challenge_user
  on challenge_logs(challenge_id, user_id);

-- challenge_logs: viewer today's log (date-filtered per challenge)
create index if not exists idx_challenge_logs_user_challenge_logged
  on challenge_logs(user_id, challenge_id, logged_at desc);

-- tjfit_coin_wallets: wallet balance reads (every coin-related page)
create index if not exists idx_tjfit_coin_wallets_user_id
  on tjfit_coin_wallets(user_id);

-- tjfit_coin_ledger: user transaction history
create index if not exists idx_tjfit_coin_ledger_user_created
  on tjfit_coin_ledger(user_id, created_at desc);

-- saved_tjai_plans: most recent plan per user (TJAI chat context)
create index if not exists idx_saved_tjai_plans_user_updated
  on saved_tjai_plans(user_id, updated_at desc);

-- program_progress: active program per user
create index if not exists idx_program_progress_user_week
  on program_progress(user_id, week_number desc);

-- user_badges: badge list per user
create index if not exists idx_user_badges_user_earned
  on user_badges(user_id, earned_at desc);
