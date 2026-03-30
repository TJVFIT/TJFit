create unique index if not exists uniq_active_coach_per_student
  on coach_student_links (student_id)
  where status = 'active';
