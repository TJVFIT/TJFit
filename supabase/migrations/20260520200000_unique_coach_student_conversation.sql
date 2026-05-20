-- Prevent duplicate coach-student conversations.
--
-- /api/chat/conversations POST (audited iteration 20) had a TOCTOU race in
-- the coach-student branch: SELECT-existing -> INSERT could produce two
-- conversations for the same coach_student_link under concurrent requests.
-- This partial unique index closes the race at the DB layer; the route
-- already handles 23505 by re-selecting (added implicitly by Supabase
-- error mapper -> 409). Note: only conversation_type='coach_student' is
-- constrained — 'direct' conversations don't tie to a coach_student_link
-- and the existing check constraint already enforces coach_student_link_id
-- IS NULL for direct conversations.

create unique index if not exists uniq_conversations_coach_student_link
  on conversations (coach_student_link_id)
  where conversation_type = 'coach_student' and coach_student_link_id is not null;
