-- Final INSERT policy name + dedupe: runs after 20260331000100 (unique timestamp — no collision).
-- Removes intermediate policy "Coaches and admins can insert links" so exactly one permissive INSERT policy remains.
drop policy if exists "Admins and coach can insert links" on coach_student_links;
drop policy if exists "Coaches and admins can insert links" on coach_student_links;
drop policy if exists "Only coaches or admins can insert links" on coach_student_links;

create policy "Only coaches or admins can insert links"
  on coach_student_links for insert
  with check (
    auth.uid() = coach_id
    and exists (
      select 1
      from profiles p
      where p.id = auth.uid()
        and p.role in ('coach', 'admin')
    )
  );
