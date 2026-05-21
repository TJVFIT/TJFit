-- Chat retention tooling for tjai_chat_messages.
--
-- The table grew unbounded — chat history persisted forever even though the
-- chat route only ever reads the most recent 20 messages per conversation
-- for context, and long-term memory lives in tjai_long_memory. This adds:
--   1. An index suited to retention sweeps (created_at).
--   2. A purge function the operator can run as needed (or schedule via
--      pg_cron). Defaults to a 365-day window which is generous; tighten
--      via the parameter when running.
--
-- Deliberately NOT scheduled here — retention windows are a product
-- decision that should be set with the founder, not silently chosen.

create index if not exists idx_tjai_chat_messages_created_at
  on tjai_chat_messages (created_at);

create or replace function tjfit_purge_old_chat_messages(p_days_old int default 365)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  if p_days_old < 30 then
    -- Refuse aggressive purges — 30 days is the lower safety bound. Loses
    -- recent context that the chat route relies on for in-conversation
    -- history (last 20 messages). Use a dedicated admin tool for tighter
    -- windows.
    raise exception 'p_days_old must be >= 30';
  end if;

  delete from tjai_chat_messages
    where created_at < now() - make_interval(days => p_days_old);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function tjfit_purge_old_chat_messages(int) from public;
grant execute on function tjfit_purge_old_chat_messages(int) to service_role;

-- Usage (run from Supabase SQL editor or scheduled job):
--   select tjfit_purge_old_chat_messages(365);  -- delete > 1 year old
-- Recommended cadence: weekly cron via pg_cron if installed:
--   select cron.schedule('purge-old-tjai-chat', '0 3 * * 0',
--     $$ select tjfit_purge_old_chat_messages(365); $$);
