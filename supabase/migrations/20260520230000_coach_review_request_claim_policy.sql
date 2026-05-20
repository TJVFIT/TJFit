-- Allow coaches to claim unassigned review requests.
--
-- The existing `coaches_update_assigned` policy required auth.uid()=coach_id
-- on the OLD row, so a coach could never UPDATE an unclaimed request
-- (coach_id IS NULL) — effectively blocking the entire claim workflow.
-- Iteration 33 flagged this; the route attempts the claim but RLS
-- silently rejects.
--
-- Extended policy: a coach may UPDATE rows they already own, OR claim a
-- pending unassigned request by setting coach_id = themselves. WITH CHECK
-- enforces that the post-update coach_id is the caller (prevents
-- reassigning someone else's claim).

drop policy if exists coaches_update_assigned on coach_review_requests;
drop policy if exists coaches_update_assigned_or_claim on coach_review_requests;

create policy coaches_update_assigned_or_claim on coach_review_requests
  for update
  using (
    -- Already mine: can always update.
    auth.uid() = coach_id
    -- Or it's an unassigned pending request available for claiming.
    or (coach_id is null and status = 'pending')
  )
  with check (
    -- After update, the row must belong to the caller. Blocks a coach from
    -- claiming a request into someone else's coach_id.
    auth.uid() = coach_id
  );
