-- Plan2 phase 18 (approved): fix the only auth.users foreign key that
-- lacks an ON DELETE clause.
--
-- coach_review_requests.coach_id referenced auth.users(id) with no
-- ON DELETE behavior (defaults to NO ACTION / RESTRICT). That would
-- block deletion of any coach user with a foreign-key violation —
-- a blocker for the future account-deletion endpoint (see
-- docs/audits/account-deletion-2026-05.md).
--
-- Chosen behavior: ON DELETE SET NULL. A review request should survive
-- the coach's account deletion (the requesting user still owns the row
-- via user_id ON DELETE CASCADE); the coach attribution simply becomes
-- null/anonymized rather than deleting the user's request history.

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT con.conname INTO fk_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
  WHERE rel.relname = 'coach_review_requests'
    AND att.attname = 'coach_id'
    AND con.contype = 'f';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE coach_review_requests DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE coach_review_requests
    ADD CONSTRAINT coach_review_requests_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;
