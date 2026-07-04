-- Perf: wrap bare auth.uid()/auth.role() in RLS policies as scalar subqueries so
-- Postgres evaluates them once per query (InitPlan) instead of once per row.
-- Semantically identical; clears the 135 auth_rls_initplan advisor lints.
-- Idempotent: skips policies already using the wrapped form.
-- Applied to live project kohuiyqyixvrcqeepalz on 2026-07-04; verified via
-- pg_policies (0 bare refs remain, 132 wrapped) + simulated-JWT isolation check.
do $$
declare
  p record;
  new_qual text;
  new_check text;
  cmd text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual,'') || coalesce(with_check,'')) ~ 'auth\.(uid|role)\(\)'
      and (coalesce(qual,'') || coalesce(with_check,'')) not like '%SELECT auth.uid()%'
      and (coalesce(qual,'') || coalesce(with_check,'')) not like '%SELECT auth.role()%'
  loop
    new_qual := replace(replace(p.qual, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');
    new_check := replace(replace(p.with_check, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');
    cmd := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if new_qual is not null then
      cmd := cmd || format(' using (%s)', new_qual);
    end if;
    if new_check is not null then
      cmd := cmd || format(' with check (%s)', new_check);
    end if;
    execute cmd;
  end loop;
end $$;
