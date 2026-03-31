drop policy if exists "Admins and coach can insert links" on coach_student_links;

create policy "Coaches and admins can insert links"
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
