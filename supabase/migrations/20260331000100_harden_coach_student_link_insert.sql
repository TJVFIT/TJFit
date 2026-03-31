-- Tighten coach_student_links insertion: only authenticated coaches/admins can create links,
-- and only when they are the coach_id.
drop policy if exists "Admins and coach can insert links" on coach_student_links;

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
