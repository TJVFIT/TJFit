-- Backfill suggestions.vote_count from the actual vote table.
--
-- Iteration 16 fixed the vote-toggle to maintain vote_count atomically, but
-- the counter was broken across the app's prior lifetime (zeroed on every
-- new vote, decrement RPC didn't exist). So historical values are stale —
-- mostly 0 or 1 regardless of real popularity. One-time recompute restores
-- the "most-voted" sort to a useful state.

update suggestions s
set vote_count = coalesce(v.cnt, 0)
from (
  select suggestion_id, count(*)::int as cnt
  from suggestion_votes
  group by suggestion_id
) v
where s.id = v.suggestion_id;

-- Also zero out any suggestions that had no real votes but a stale non-zero
-- counter (from the buggy old upsert path).
update suggestions
set vote_count = 0
where id not in (select suggestion_id from suggestion_votes)
  and coalesce(vote_count, 0) <> 0;
