-- Challenge log daily uniqueness.
--
-- The /api/community/challenges/log route did a SELECT-then-INSERT to enforce
-- "one log per challenge per user per day". Two concurrent requests could
-- both pass the SELECT empty and both insert, double-awarding TJCOIN and
-- double-incrementing total_logged. A daily unique index makes the insert
-- itself the atomic gate (caller catches 23505 on duplicate).

create unique index if not exists uniq_challenge_log_per_day
  on challenge_logs (user_id, challenge_id, (logged_at::date));
