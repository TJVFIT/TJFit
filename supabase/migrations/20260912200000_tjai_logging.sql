-- Reuse canonical workout/bodyweight history; additive per-set details.
alter table public.workout_logs add column if not exists sets_data jsonb;
alter table public.workout_logs add constraint workout_sets_data_array check(sets_data is null or (jsonb_typeof(sets_data)='array' and jsonb_array_length(sets_data) between 1 and 30));
create table public.nutrition_logs(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 entry_date date not null default current_date,name text not null check(length(name) between 1 and 200),
 calories numeric not null check(calories between 0 and 10000),
 protein_g numeric not null check(protein_g between 0 and 1000),carbs_g numeric not null check(carbs_g between 0 and 2000),fat_g numeric not null check(fat_g between 0 and 1000),
 source text not null default 'manual' check(source in ('manual','plan_estimate')),plan_id uuid references public.saved_tjai_plans(id) on delete set null,
 created_at timestamptz not null default now()
);
alter table public.nutrition_logs enable row level security;
create policy nutrition_self on public.nutrition_logs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index nutrition_user_date on public.nutrition_logs(user_id,entry_date desc);
